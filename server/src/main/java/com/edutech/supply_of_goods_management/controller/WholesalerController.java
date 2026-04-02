package com.edutech.supply_of_goods_management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.edutech.supply_of_goods_management.entity.Feedback;
import com.edutech.supply_of_goods_management.entity.Inventory;
import com.edutech.supply_of_goods_management.entity.Order;
import com.edutech.supply_of_goods_management.entity.Product;
import com.edutech.supply_of_goods_management.repository.FeedbackRepository;
import com.edutech.supply_of_goods_management.service.InventoryService;
import com.edutech.supply_of_goods_management.service.OrderService;
import com.edutech.supply_of_goods_management.service.ProductService;

import java.util.List;

@RestController
@RequestMapping("/api/wholesalers")
public class WholesalerController {

    @Autowired private ProductService   productService;
    @Autowired private OrderService     orderService;
    @Autowired private InventoryService inventoryService;
    @Autowired private FeedbackRepository feedbackRepository;

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @PostMapping("/order")
    public ResponseEntity<Order> placeOrder(@RequestBody Order order,
                                             @RequestParam Long productId, @RequestParam Long userId) {
        return ResponseEntity.ok(orderService.placeOrder(order, productId, userId));
    }

    @PutMapping("/order/{id}")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getOrdersByUser(@RequestParam Long userId) {
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }

    @PostMapping("/inventories")
    public ResponseEntity<Inventory> addInventory(@RequestBody Inventory inventory, @RequestParam Long productId) {
        return ResponseEntity.ok(inventoryService.addInventory(inventory, productId));
    }

    @PutMapping("/inventories/{id}")
    public ResponseEntity<Inventory> updateInventory(@PathVariable Long id, @RequestParam int stockQuantity) {
        return ResponseEntity.ok(inventoryService.updateInventory(id, stockQuantity));
    }

    @GetMapping("/inventories")
    public ResponseEntity<List<Inventory>> getInventoriesByWholesaler(@RequestParam Long wholesalerId) {
        return ResponseEntity.ok(inventoryService.getInventoriesByWholesalerId(wholesalerId));
    }

    // Wholesaler can see feedbacks on orders placed to them
    @GetMapping("/feedbacks")
    public ResponseEntity<List<Feedback>> getFeedbacksForWholesaler(@RequestParam Long userId) {
        List<Order> orders = orderService.getOrdersByUserId(userId);
        List<Long>  orderIds = orders.stream().map(Order::getId).collect(java.util.stream.Collectors.toList());
        List<Feedback> feedbacks = feedbackRepository.findByOrderIdIn(orderIds);
        return ResponseEntity.ok(feedbacks);
    }
}