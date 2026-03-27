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
      // Get all products


        @Autowired
        private ProductService productService;

         @Autowired
         private OrderService orderService;

                 @Autowired
        private FeedbackService feedbackService;


        // @Autowired
        // private FeedbackService feedbackService;


        // Get all products
        @GetMapping("/products")
        public ResponseEntity<List<Product>> getProducts() {
                return ResponseEntity.ok(productService.getAllProducts());
        }
        
         // Place order for the product
        @PostMapping("/order")
        public ResponseEntity<Order> placeOrder(
                        @RequestParam Long productId,
                        @RequestParam Long userId,
                        @RequestBody Order order) {

                return ResponseEntity.ok(orderService.placeOrder(productId, userId, order));
        }

        // get all orders for the user (consumer)
        @GetMapping("/orders")
        public ResponseEntity<List<Order>> getOrders(@RequestParam Long userId) {
                return ResponseEntity.ok(orderService.getOrdersByUser(userId));
        }


        
        // Provide feedback for the order
        @PostMapping("/order/{orderId}/feedback")
        public ResponseEntity<Feedback> addFeedback(
                        @PathVariable Long orderId,
                        @RequestParam Long userId,
                        @RequestBody Feedback feedback) {

                return ResponseEntity.ok(feedbackService.addFeedback(orderId, userId, feedback));
        }


   
        // Place order for the product
    
       // get all orders for the user (consumer)
   
      
    
}
