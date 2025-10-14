from fastapi import FastAPI
import logging
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import numpy as np
import uvicorn
import pickle
import os


class RecommendRequest(BaseModel):
    userEmail: Optional[str]
    user: Optional[Dict[str, Any]] = None
    services: List[Dict[str, Any]]
    topN: int = 6


app = FastAPI()

# Configure logging so all model logs appear in the running Uvicorn process console
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(name)s - %(message)s')
logger = logging.getLogger(__name__)


MODEL_PATH = os.environ.get("MODEL_PATH", os.path.join(os.path.dirname(__file__), "..", "random_forest_model.pkl"))

model = None
try:
    logger.info(f"Attempting to load model from: {MODEL_PATH}")
    exists = os.path.exists(MODEL_PATH)
    logger.info(f"Model file exists: {exists}")
    if exists:
        # First try joblib (common for scikit-learn models)
        try:
            import joblib
            model = joblib.load(MODEL_PATH)
            logger.info(f"Model loaded successfully with joblib: {type(model)}")
        except Exception:
            # Fall back to pickle with a couple of strategies
            try:
                with open(MODEL_PATH, "rb") as f:
                    model = pickle.load(f)
                logger.info(f"Model loaded successfully with pickle: {type(model)}")
            except Exception:
                try:
                    # Sometimes pickles need latin1 encoding for compatibility
                    with open(MODEL_PATH, "rb") as f:
                        model = pickle.load(f, encoding='latin1')
                    logger.info(f"Model loaded successfully with pickle (latin1): {type(model)}")
                except Exception:
                    import traceback
                    logger.exception("Failed to load model with joblib/pickle. Full traceback:")
                    model = None
    else:
        logger.info("Model file not found; skipping model load.")
except Exception:
    import traceback
    logger.exception("Unexpected error while attempting to load model:")
    model = None


@app.post("/recommend")
def recommend(req: RecommendRequest):
    services = req.services
    top_n = req.topN or 6
    # Attempt to use the ML model to score services. If anything fails, fall back to
    # the safe heuristic (sort by rating desc then price asc).

    def heuristic_rank(services_list: List[Dict[str, Any]], n: int):
        sorted_services_local = sorted(
            services_list,
            key=lambda s: (float(s.get("rating", 0.0)), -float(s.get("price", 0.0))),
            reverse=True,
        )
        logger.info("Using heuristic ranking (topN=%s, candidates=%s)", n, len(services_list))
        return [int(s.get("id")) for s in sorted_services_local[:n] if s.get("id") is not None]

    # Feature extraction: numeric features + simple hashed encodings for categorical fields
    def extract_features(s: Dict[str, Any], user_profile: Optional[Dict[str, Any]] = None):
        # Basic numeric fields
        price = float(s.get("price", 0.0) or 0.0)
        rating = float(s.get("rating", 0.0) or 0.0)
        title_len = float(len(str(s.get("title", ""))))

        # Simple deterministic hash for category/brand/location -> normalized float
        def h(x: Optional[str]):
            if not x:
                return 0.0
            return float(abs(hash(str(x))) % 1000) / 1000.0

        category_h = h(s.get("category"))
        brand_h = h(s.get("brand"))
        location_h = h(s.get("location"))

        # User features (if available)
        age = float(user_profile.get("age", 0) or 0) if user_profile else 0.0
        gender = 0.0
        if user_profile and user_profile.get("gender"):
            gender = h(str(user_profile.get("gender")))

        return [price, rating, title_len, category_h, brand_h, location_h, age, gender]

    if model is None:
        # No model: deterministic heuristic
        logger.info("No ML model loaded; falling back to heuristic (topN=%s, candidates=%s)", top_n, len(services))
        return {"service_ids": heuristic_rank(services, top_n), "used_model": False}

    # Try to build feature matrix and score using the model
    try:
        user_profile = req.user or {}
        X = np.array([extract_features(s, user_profile) for s in services], dtype=float)

        # If model supports predict_proba (classifier), get positive-class probability if possible
        scores = None
        if hasattr(model, "predict_proba"):
            try:
                probs = model.predict_proba(X)
                # If binary classification, take column 1; otherwise take max class probability
                if probs.ndim == 2 and probs.shape[1] >= 2:
                    scores = probs[:, 1]
                else:
                    scores = probs.max(axis=1)
            except Exception:
                logger.exception("predict_proba failed; falling back to predict")

        if scores is None:
            # Use predict for regressors or classifiers without predict_proba
            try:
                preds = model.predict(X)
            except ValueError as ve:
                # Try to recover when model expects different feature names/length
                logger.warning("model.predict raised ValueError: %s", ve)
                if hasattr(model, "feature_names_in_"):
                    try:
                        feature_names = list(getattr(model, "feature_names_in_") )
                        logger.info("Model expects features: %s", feature_names)

                        def map_feature_precise(feature_names, s, user_profile):
                            # Build a row in the exact order of feature_names
                            row = []
                            # normalize helper for category matching
                            def normalize(text: Optional[str]):
                                if not text:
                                    return ""
                                import re
                                t = str(text).lower()
                                # keep letters and digits and spaces
                                t = re.sub(r"[^a-z0-9 ]+", " ", t)
                                t = " ".join(t.split())
                                return t

                            svc_cat_norm = normalize(s.get("category"))
                            for fname in feature_names:
                                if fname == "user_num_purchases":
                                    row.append(float(user_profile.get("num_purchases", 0) or 0))
                                elif fname == "user_mean_rating":
                                    row.append(float(user_profile.get("mean_rating", user_profile.get("avg_rating", 0)) or 0))
                                elif fname == "prod_popularity":
                                    row.append(float(s.get("popularity", 0) or 0))
                                elif fname == "prod_mean_rating":
                                    row.append(float(s.get("mean_rating", s.get("rating", 0)) or 0))
                                elif fname == "age":
                                    row.append(float(user_profile.get("age", 0) or 0))
                                elif fname.startswith("sex_"):
                                    # sex_F, sex_M, sex_Other
                                    gender = str(user_profile.get("gender", "")).strip().lower()
                                    expected = fname.split("sex_")[-1].lower()
                                    row.append(1.0 if gender == expected.lower() else 0.0)
                                elif fname.startswith("product_category_"):
                                    # exact/approx match between service category and feature suffix
                                    suffix = fname[len("product_category_"):]
                                    suffix_norm = normalize(suffix)
                                    matched = 1.0 if (suffix_norm and suffix_norm == svc_cat_norm) else 0.0
                                    # as a fallback, also check containment
                                    if matched == 0.0 and svc_cat_norm and suffix_norm in svc_cat_norm:
                                        matched = 1.0
                                    row.append(float(matched))
                                else:
                                    # fallback numeric: try known keys
                                    if "price" in fname:
                                        row.append(float(s.get("price", 0) or 0))
                                    elif "rating" in fname:
                                        row.append(float(s.get("rating", 0) or 0))
                                    else:
                                        row.append(0.0)
                            return row

                        # build new feature matrix matching model.feature_names_in_
                        X2_rows = []
                        feature_names_norm = feature_names
                        for s in services:
                            row = map_feature_precise(feature_names_norm, s, user_profile)
                            X2_rows.append(row)
                        X2 = np.array(X2_rows, dtype=float)
                        logger.info("Attempting predict with remapped feature matrix shape=%s", X2.shape)
                        preds = model.predict(X2)
                        scores = np.asarray(preds).reshape(-1,)
                    except Exception:
                        logger.exception("Retry with remapped features failed")
                        raise
                else:
                    # re-raise to outer try/except which will trigger fallback
                    raise
            else:
                # preds may be shape (n,) or (n,1)
                scores = np.asarray(preds).reshape(-1,)

        # Map scores to service ids and sort descending
        scored = list(zip([s.get("id") for s in services], scores.tolist()))
        scored_sorted = sorted(scored, key=lambda t: t[1], reverse=True)
        top_ids = [int(t[0]) for t in scored_sorted if t[0] is not None][:top_n]

        logger.info("ML model used for ranking (model=%s). Returning top %s of %s candidates.", type(model), top_n, len(services))
        return {"service_ids": top_ids, "used_model": True}
    except Exception:
        logger.exception("Error during model scoring; falling back to heuristic")
        return {"service_ids": heuristic_rank(services, top_n), "used_model": False}


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8001"))
    uvicorn.run(app, host="0.0.0.0", port=port)


