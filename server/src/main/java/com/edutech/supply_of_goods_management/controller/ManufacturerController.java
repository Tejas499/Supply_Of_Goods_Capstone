package com.edutech.supply_of_goods_management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.edutech.supply_of_goods_management.entity.Product;
import com.edutech.supply_of_goods_management.service.ProductService;

import java.util.List;

@RestController
@RequestMapping("/api/manufacturers")
public class ManufacturerController {

        @Autowired
        private ProductService productService;

        // create product
        @PostMapping("/product")
        public ResponseEntity<Product> createProduct(@RequestBody Product product) {
                return ResponseEntity.ok(productService.createProduct(product));
        }

        // update product
        @PutMapping("/product/{id}")
        public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
                return ResponseEntity.ok(productService.updateProduct(id, product));
        }

        // get all products of manufacturer
        @GetMapping("/products")
        public ResponseEntity<List<Product>> getAllProductsOfManufacturer(@RequestParam Long manufacturerId) {
                return ResponseEntity.ok(productService.getByManufacturer(manufacturerId));
        }
}