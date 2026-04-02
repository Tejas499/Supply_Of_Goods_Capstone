package com.edutech.supply_of_goods_management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.edutech.supply_of_goods_management.entity.Feedback;
import com.edutech.supply_of_goods_management.entity.Order;
import com.edutech.supply_of_goods_management.entity.Product;
import com.edutech.supply_of_goods_management.repository.FeedbackRepository;
import com.edutech.supply_of_goods_management.service.OrderService;
import com.edutech.supply_of_goods_management.service.ProductService;
import java.util.List;

@RestController
@RequestMapping("/api/manufacturers")
public class ManufacturerController {

    @Autowired private ProductService    productService;
    @Autowired private OrderService      orderService;
    @Autowired private FeedbackRepository feedbackRepository;

    @PostMapping("/product")
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        return ResponseEntity.ok(productService.createProduct(product));
    }

    @PutMapping("/product/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return ResponseEntity.ok(productService.updateProduct(id, product));
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getProductsByManufacturer(@RequestParam Long manufacturerId) {
        return ResponseEntity.ok(productService.getProductsByManufacturerId(manufacturerId));
    }

    // DELETE product — removes from all inventory tables too
    @DeleteMapping("/product/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }

    // Manufacturer sees all W2M orders for their products
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getOrdersForManufacturer(@RequestParam Long manufacturerId) {
        return ResponseEntity.ok(orderService.getW2MOrdersForManufacturer(manufacturerId));
    }

    // Manufacturer updates W2M order status: IN PROGRESS or OUT FOR DELIVERY
    @PutMapping("/order/{id}")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateOrderStatusByManufacturer(id, status));
    }

    // Manufacturer sees feedbacks on their products
    @GetMapping("/feedbacks")
    public ResponseEntity<List<Feedback>> getFeedbacksForManufacturer(@RequestParam Long manufacturerId) {
        List<Product> products = productService.getProductsByManufacturerId(manufacturerId);
        List<Long> productIds = products.stream().map(Product::getId).collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(feedbackRepository.findByOrderProductIdIn(productIds));
    }
}