package com.edutech.supply_of_goods_management.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.edutech.supply_of_goods_management.entity.Feedback;
import com.edutech.supply_of_goods_management.entity.Order;
import com.edutech.supply_of_goods_management.entity.Product;
import com.edutech.supply_of_goods_management.service.FeedbackService;
import com.edutech.supply_of_goods_management.service.OrderService;
import com.edutech.supply_of_goods_management.service.ProductService;

import java.util.List;


@RestController
@RequestMapping("/api/consumers")
public class ConsumerController {

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private FeedbackService feedbackService;

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @PostMapping("/order")
    public ResponseEntity<Order> placeOrder(@RequestBody Order order,
                                             @RequestParam Long productId,
                                             @RequestParam Long userId) {
        return ResponseEntity.ok(orderService.placeOrder(order, productId, userId));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getOrdersByUser(@RequestParam Long userId) {
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }

    @PostMapping("/order/{orderId}/feedback")
    public ResponseEntity<Feedback> addFeedback(@PathVariable Long orderId,
                                                 @RequestParam Long userId,
                                                 @RequestBody Feedback feedback) {
                                                    //  System.out.println(orderId+"from controller." );
        return ResponseEntity.ok(feedbackService.addFeedback(orderId, userId, feedback));
    }
}