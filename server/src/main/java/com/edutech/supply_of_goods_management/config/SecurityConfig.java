package com.edutech.supply_of_goods_management.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.edutech.supply_of_goods_management.jwt.JwtRequestFilter;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired private UserDetailsService userDetailsService;
    @Autowired private JwtRequestFilter   jwtRequestFilter;
    @Autowired private PasswordEncoder    passwordEncoder;

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder);
    }

    @Bean @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.csrf().disable()
            .authorizeRequests()
                .antMatchers("/api/user/register", "/api/user/login").permitAll()

                // Manufacturer
                .antMatchers(HttpMethod.POST,   "/api/manufacturers/product").hasAuthority("MANUFACTURER")
                .antMatchers(HttpMethod.PUT,    "/api/manufacturers/product/**").hasAuthority("MANUFACTURER")
                .antMatchers(HttpMethod.DELETE, "/api/manufacturers/product/**").hasAuthority("MANUFACTURER")
                .antMatchers(HttpMethod.GET,    "/api/manufacturers/products").hasAuthority("MANUFACTURER")
                .antMatchers(HttpMethod.GET,    "/api/manufacturers/orders").hasAuthority("MANUFACTURER")
                .antMatchers(HttpMethod.PUT,    "/api/manufacturers/order/**").hasAuthority("MANUFACTURER")
                .antMatchers(HttpMethod.GET,    "/api/manufacturers/feedbacks").hasAuthority("MANUFACTURER")

                // Payment
                .antMatchers("/payment/**").permitAll()

                // Wholesaler
                .antMatchers(HttpMethod.GET,  "/api/wholesalers/products").hasAuthority("WHOLESALER")
                .antMatchers(HttpMethod.POST, "/api/wholesalers/order").hasAuthority("WHOLESALER")
                .antMatchers(HttpMethod.PUT,  "/api/wholesalers/order/**").hasAuthority("WHOLESALER")
                .antMatchers(HttpMethod.GET,  "/api/wholesalers/orders/placed").hasAuthority("WHOLESALER")
                .antMatchers(HttpMethod.GET,  "/api/wholesalers/orders/received").hasAuthority("WHOLESALER")
                .antMatchers(HttpMethod.POST, "/api/wholesalers/inventories").hasAuthority("WHOLESALER")
                .antMatchers(HttpMethod.PUT,  "/api/wholesalers/inventories/**").hasAuthority("WHOLESALER")
                .antMatchers(HttpMethod.GET,  "/api/wholesalers/inventories").hasAuthority("WHOLESALER")
                .antMatchers(HttpMethod.GET,  "/api/wholesalers/feedbacks").hasAuthority("WHOLESALER")

                // Consumer
                .antMatchers(HttpMethod.GET,  "/api/consumers/products").hasAuthority("CONSUMER")
                .antMatchers(HttpMethod.GET,  "/api/consumers/products/*/wholesalers").hasAuthority("CONSUMER")
                .antMatchers(HttpMethod.POST, "/api/consumers/order").hasAuthority("CONSUMER")
                .antMatchers(HttpMethod.GET,  "/api/consumers/orders").hasAuthority("CONSUMER")
                .antMatchers(HttpMethod.PUT,  "/api/consumers/order/*/cancel").hasAuthority("CONSUMER")
                .antMatchers("/api/consumers/order/**/feedback").hasAuthority("CONSUMER")

                .anyRequest().authenticated()
            .and()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);

        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
    }
}