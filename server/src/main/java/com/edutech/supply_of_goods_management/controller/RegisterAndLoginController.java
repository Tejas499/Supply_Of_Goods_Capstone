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
import com.edutech.supply_of_goods_management.entity.User;
import com.edutech.supply_of_goods_management.jwt.JwtUtil;
import com.edutech.supply_of_goods_management.service.UserService;

@RestController
@RequestMapping("/api/user")
public class RegisterAndLoginController {

        @Autowired
        private UserService userService;

        // Implement registration logic here
        @PostMapping("/register")
        public ResponseEntity<?> register(@RequestBody User user) {
                return ResponseEntity.ok(userService.register(user));
        }

        // Implement login logic here
        // return jwt token in LoginResponse object
        // if login fails, return 401 Unauthorized http status
       
}


