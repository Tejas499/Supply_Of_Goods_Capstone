package com.edutech.supply_of_goods_management.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.edutech.supply_of_goods_management.dto.LoginRequest;
import com.edutech.supply_of_goods_management.dto.LoginResponse;
import com.edutech.supply_of_goods_management.dto.OtpVerifyRequest;
import com.edutech.supply_of_goods_management.entity.User;
import com.edutech.supply_of_goods_management.jwt.JwtUtil;
import com.edutech.supply_of_goods_management.service.OtpService;
import com.edutech.supply_of_goods_management.service.UserService;

import java.util.Map;


@RestController
@RequestMapping("/api/user")
public class RegisterAndLoginController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private OtpService otpService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userService.existsByUsernameOrEmail(user.getUsername(), user.getEmail())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Username or Email already exists"
            );
        }
        User saved = userService.registerUser(user);
        return ResponseEntity.ok(saved);
    }

    /**
     * Step 1: Validate credentials → generate & send OTP to registered email.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(), loginRequest.getPassword())
            );
        } catch (AuthenticationException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }

        User user = userService.findByUsername(loginRequest.getUsername());
        otpService.generateAndSendOtp(user.getUsername(), user.getEmail());

        return ResponseEntity.ok(Map.of(
            "otpRequired", true,
            "message", "OTP sent to your registered email address"
        ));
    }

    /**
     * Step 2: Verify OTP → return JWT token.
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<LoginResponse> verifyOtp(@RequestBody OtpVerifyRequest request) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getUsername(), request.getPassword())
            );
        } catch (AuthenticationException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        boolean valid = otpService.verifyOtp(request.getUsername(), request.getOtp());
        if (!valid) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired OTP");
        }

        UserDetails userDetails = userService.loadUserByUsername(request.getUsername());
        String token = jwtUtil.generateToken(request.getUsername());
        User user = userService.findByUsername(request.getUsername());

        LoginResponse response = new LoginResponse(
            user.getId(), token, user.getUsername(), user.getEmail(), user.getRole()
        );
        return ResponseEntity.ok(response);
    }
}
