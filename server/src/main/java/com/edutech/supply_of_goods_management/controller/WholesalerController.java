package com.edutech.supply_of_goods_management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.edutech.supply_of_goods_management.entity.Inventory;
import com.edutech.supply_of_goods_management.entity.Order;
import com.edutech.supply_of_goods_management.entity.Product;
import com.edutech.supply_of_goods_management.service.InventoryService;
import com.edutech.supply_of_goods_management.service.OrderService;
import com.edutech.supply_of_goods_management.service.ProductService;

import java.util.List;

@RestController
@RequestMapping("/api/wholesalers")
public class WholesalerController {

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private InventoryService inventoryService;

    // get all products
    @GetMapping("/products")
    public ResponseEntity<List<Product>> browseProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    // place order for a product
    @PostMapping("/order")
    public ResponseEntity<Order> placeOrder(
            @RequestParam Long productId,
            @RequestParam Long userId,
            @RequestBody Order order) {

        return ResponseEntity.ok(orderService.placeOrder(productId, userId, order));
    }

    // update order status
    @PutMapping("/order/{id}")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return ResponseEntity.ok(orderService.updateOrder(id, status));
    }

    // get all orders for a user (wholesaler)
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders(@RequestParam Long userId) {
        return ResponseEntity.ok(orderService.getAllOrders(userId));
    }

    // add inventory for a product
    @PostMapping("/inventories")
    public ResponseEntity<Inventory> addInventory(
            @RequestParam Long productId,
            @RequestBody Inventory inventory) {

        return ResponseEntity.ok(inventoryService.addInventory(productId, inventory));
    }

    // update inventory stock quantity
    @PutMapping("/inventories/{id}")
    public ResponseEntity<Inventory> updateInventory(
            @PathVariable Long id,
            @RequestParam int stockQuantity) {

        return ResponseEntity.ok(inventoryService.updateInventory(id, stockQuantity));
    }

    // get all inventories for a wholesaler
    @GetMapping("/inventories")
    public ResponseEntity<List<Inventory>> getAllInventories(@RequestParam Long wholesalerId) {
        return ResponseEntity.ok(inventoryService.getAllInventories(wholesalerId));
    }
}
