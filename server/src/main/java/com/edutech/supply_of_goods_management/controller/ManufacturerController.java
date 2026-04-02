package com.edutech.supply_of_goods_management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.edutech.supply_of_goods_management.entity.Feedback;
import com.edutech.supply_of_goods_management.entity.Product;
import com.edutech.supply_of_goods_management.repository.FeedbackRepository;
import com.edutech.supply_of_goods_management.service.ProductService;

import java.util.List;

@RestController
@RequestMapping("/api/manufacturers")
public class ManufacturerController {

    @Autowired private ProductService productService;
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

    // Manufacturer can see all feedbacks on their products
    @GetMapping("/feedbacks")
    public ResponseEntity<List<Feedback>> getFeedbacksForManufacturer(@RequestParam Long manufacturerId) {
        List<Product> products = productService.getProductsByManufacturerId(manufacturerId);
        List<Long> productIds  = products.stream().map(Product::getId).collect(java.util.stream.Collectors.toList());
        List<Feedback> feedbacks = feedbackRepository.findByOrderProductIdIn(productIds);
        return ResponseEntity.ok(feedbacks);
    }
}