package com.edutech.supply_of_goods_management.controller;
// :white_check_mark: SPRING IMPORTS
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
// :white_check_mark: JAVA IMPORTS
import java.util.Map;
import java.net.URL;
import java.net.HttpURLConnection;
import java.util.Base64;
import java.io.OutputStream;
import java.io.BufferedReader;
import java.io.InputStreamReader;

@RestController
@RequestMapping("/payment")
public class PaymentController {
    private static final String KEY_ID = "rzp_test_SYteb3DnWa7SY9";
    private static final String KEY_SECRET = "NPJnKMGD6uQK6rHZwDPf2NoQ";
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> body) {
        try {
            int amount = ((Number) body.get("amount")).intValue() * 100;
            URL url = new URL("https://api.razorpay.com/v1/orders");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setDoOutput(true);
            String auth = KEY_ID + ":" + KEY_SECRET;
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
            conn.setRequestProperty("Authorization", "Basic " + encodedAuth);
            conn.setRequestProperty("Content-Type", "application/json");
            String jsonInput = "{"
                    + "\"amount\":" + amount + ","
                    + "\"currency\":\"INR\","
                    + "\"receipt\":\"txn_" + System.currentTimeMillis() + "\""
                    + "}";
            try (OutputStream os = conn.getOutputStream()) {
                os.write(jsonInput.getBytes());
            }
            int status = conn.getResponseCode();
            BufferedReader br;
            if (status >= 200 && status < 300) {
                br = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            } else {
                br = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
            }
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) {
                response.append(line);
            }
            return ResponseEntity.status(status).body(response.toString());
        } catch (Exception e) {
            e.printStackTrace(); // :fire: debug
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}