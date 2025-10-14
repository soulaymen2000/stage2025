Model microservice (FastAPI)

Quick start

1. Create & activate a virtual environment (from project root or this folder):

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

2. Install dependencies:

```powershell
pip install -r requirements.txt
```

3. (Optional) If your trained model file is in a custom location, set MODEL_PATH:

```powershell
$env:MODEL_PATH = 'C:\path\to\random_forest_model.pkl'
```

4. Run the service (from this folder):

```powershell
# Option A: run using module name (from project root):
python -m uvicorn model.ml_api.main:app --host 0.0.0.0 --port 8001 --reload

# Option B: run from this folder using local module:
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload

# Option C: run the script directly (uses uvicorn.run in __main__):
python main.py
```

Health check

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:8001/health | Select-Object -ExpandProperty Content
```

Notes

- If the saved model cannot be loaded, the service still runs and uses a fallback heuristic. The `/health` endpoint returns `{"status":"ok","model_loaded": false}` in that case.
- If your model was serialized with scikit-learn, make sure scikit-learn and numpy versions are compatible with those used during training.
