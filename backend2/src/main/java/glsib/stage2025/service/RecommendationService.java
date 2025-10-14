package glsib.stage2025.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class RecommendationService {
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ml.api.base-url:http://localhost:8001}")
    private String mlApiBaseUrl;

    public List<Long> getRecommendedServiceIds(String userEmail, Map<String, Object> userProfile, List<Map<String, Object>> servicesCatalog) {
        String url = mlApiBaseUrl + "/recommend";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, Object> body = Map.of(
            "userEmail", userEmail,
            "user", userProfile,
            "services", servicesCatalog,
            "topN", 6
        );
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            Object idsObj = response.getBody() != null ? response.getBody().get("service_ids") : null;
            if (idsObj instanceof List<?> list) {
                return list.stream()
                    .filter(Long.class::isInstance)
                    .map(Long.class::cast)
                    .toList();
            }
        } catch (Exception ex) {
            // Swallow and let caller fallback
        }
        return Collections.emptyList();
    }
}


