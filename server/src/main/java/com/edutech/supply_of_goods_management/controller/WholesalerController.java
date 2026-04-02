package com.edutech.supply_of_goods_management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.edutech.supply_of_goods_management.entity.*;
import com.edutech.supply_of_goods_management.repository.FeedbackRepository;
import com.edutech.supply_of_goods_management.service.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/wholesalers")
public class WholesalerController {

    @Autowired private ProductService     productService;
    @Autowired private OrderService       orderService;
    @Autowired private InventoryService   inventoryService;
    @Autowired private FeedbackRepository feedbackRepository;

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    // ── PLACED ORDERS (W2M) — wholesaler placed these to manufacturer ──
    @PostMapping("/order")
    public ResponseEntity<Order> placeOrder(@RequestBody Order order,
                                             @RequestParam Long productId, @RequestParam Long userId) {
        return ResponseEntity.ok(orderService.placeOrder(order, productId, userId));
    }

    // Get only W2M orders placed BY this wholesaler
    @GetMapping("/orders/placed")
    public ResponseEntity<List<Order>> getPlacedOrders(@RequestParam Long userId) {
        return ResponseEntity.ok(orderService.getWholesalerPlacedOrders(userId));
    }

    // Wholesaler marks W2M order as RECEIVED (only when OUT FOR DELIVERY)
    // → sets DELIVERED + adds to inventory
    @PutMapping("/order/{id}/received")
    public ResponseEntity<Order> markReceived(@PathVariable Long id, @RequestParam Long wholesalerId) {
        return ResponseEntity.ok(orderService.markOrderReceived(id, wholesalerId));
    }

    // Cancel W2M order (only when ORDER PLACED)
    @PutMapping("/order/{id}/cancel")
    public ResponseEntity<Order> cancelOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.cancelOrder(id));
    }

    // ── RECEIVED ORDERS (C2W) — consumer orders sent to this wholesaler ──
    @GetMapping("/orders/received")
    public ResponseEntity<List<Order>> getReceivedOrders(@RequestParam Long userId) {
        return ResponseEntity.ok(orderService.getWholesalerReceivedOrders(userId));
    }

    // Wholesaler updates status of C2W received order (e.g. IN PROGRESS → DELIVERED)
    @PutMapping("/order/{id}")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    // ── INVENTORY ──
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

    // ── FEEDBACKS ──
    @GetMapping("/feedbacks")
    public ResponseEntity<List<Feedback>> getFeedbacksForWholesaler(@RequestParam Long userId) {
        List<Order> orders = orderService.getWholesalerReceivedOrders(userId);
        List<Long>  orderIds = orders.stream().map(Order::getId).collect(Collectors.toList());
        if (orderIds.isEmpty()) return ResponseEntity.ok(java.util.Collections.emptyList());
        return ResponseEntity.ok(feedbackRepository.findByOrderIdIn(orderIds));
    }
}