package dev.fortheweebs.mico;

import com.google.gson.Gson;
import okhttp3.*;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

public class AgentService {

    private static final AgentService INSTANCE = new AgentService();
    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");

    // Configure your backend endpoint here
    public static final String BACKEND_URL = "http://localhost:8080/api/slab/execute";

    private final OkHttpClient client;
    private final Gson gson;

    private AgentService() {
        // Initialize HTTP client with reasonable timeouts
        this.client = new OkHttpClient.Builder()
                .connectTimeout(10, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .build();
        this.gson = new Gson();
    }

    public static AgentService getInstance() {
        return INSTANCE;
    }

    /**
     * Executes a slab synchronously (blocking call).
     * For simple use cases or testing.
     */
    public String runSlab(Object context) {
        SlabConsoleLogger.log("Executing slab (sync mode)...");
        SlabConsoleLogger.log("Context: " + context.toString());

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("context", context);
            payload.put("timestamp", System.currentTimeMillis());

            String jsonPayload = gson.toJson(payload);
            SlabConsoleLogger.log("Sending request to: " + BACKEND_URL);

            RequestBody body = RequestBody.create(jsonPayload, JSON);
            Request request = new Request.Builder()
                    .url(BACKEND_URL)
                    .post(body)
                    .build();

            try (Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    String error = "Backend error: " + response.code();
                    SlabConsoleLogger.logError(error);
                    throw new IOException(error);
                }

                String responseBody = response.body() != null ? response.body().string() : "No response";
                SlabConsoleLogger.log("Response received: " + responseBody);

                Map<String, Object> result = gson.fromJson(responseBody, Map.class);
                String message = result.getOrDefault("message", "Slab executed successfully").toString();
                SlabConsoleLogger.logSuccess(message);
                return message;
            }

        } catch (IOException e) {
            String fallback = "Backend unavailable - using stub response";
            SlabConsoleLogger.logError("Connection failed: " + e.getMessage());
            SlabConsoleLogger.log("Fallback: " + fallback);
            return fallback + "\n(Configure BACKEND_URL in AgentService.java)";
        }
    }

    /**
     * Executes a slab with streaming response.
     * Logs each line incrementally as it arrives from the backend.
     * Returns a CompletableFuture that completes when streaming finishes.
     */
    public CompletableFuture<Void> runSlabStreaming(Object context) {
        return CompletableFuture.runAsync(() -> {
            SlabConsoleLogger.log("Executing slab (streaming mode)...");
            SlabConsoleLogger.log("Context: " + context.toString());

            try {
                // Build request payload
                Map<String, Object> payload = new HashMap<>();
                payload.put("context", context);
                payload.put("timestamp", System.currentTimeMillis());
                payload.put("stream", true); // Signal backend to stream response

                String jsonPayload = gson.toJson(payload);
                SlabConsoleLogger.log("Sending streaming request to: " + BACKEND_URL);

                // Create HTTP request
                RequestBody body = RequestBody.create(jsonPayload, JSON);
                Request request = new Request.Builder()
                        .url(BACKEND_URL)
                        .post(body)
                        .build();

                // Execute request with streaming
                try (Response response = client.newCall(request).execute()) {
                    if (!response.isSuccessful()) {
                        String error = "Backend error: " + response.code();
                        SlabConsoleLogger.logError(error);
                        throw new IOException(error);
                    }

                    ResponseBody responseBody = response.body();
                    if (responseBody == null) {
                        SlabConsoleLogger.logError("No response body received");
                        return;
                    }

                    // Stream response line by line
                    SlabConsoleLogger.log("--- Streaming response ---");
                    try (BufferedReader reader = new BufferedReader(
                            new InputStreamReader(responseBody.byteStream()))) {

                        String line;
                        while ((line = reader.readLine()) != null) {
                            // Log each line as it arrives
                            SlabConsoleLogger.log(line);
                        }
                    }

                    SlabConsoleLogger.log("--- Stream complete ---");
                    SlabConsoleLogger.logSuccess("Slab execution finished");

                } catch (IOException e) {
                    SlabConsoleLogger.logError("Streaming failed: " + e.getMessage());
                    throw e;
                }

            } catch (Exception e) {
                // Fallback to stub response if backend is not available
                SlabConsoleLogger.logError("Connection failed: " + e.getMessage());
                SlabConsoleLogger.log("Backend unavailable - ensure backend is running and supports streaming");
            }
        });
    }
}
