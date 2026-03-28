package com.edutech.supply_of_goods_management.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edutech.supply_of_goods_management.entity.Product;
import com.edutech.supply_of_goods_management.repository.ProductRepository;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository repo;

    public Product createProduct(Product product) {
        return repo.save(product);
    }

    public Product updateProduct(Long id, Product product) {
        Product existing = repo.findById(id).orElseThrow();

        existing.setName(product.getName());
        existing.setDescription(product.getDescription());
        existing.setPrice(product.getPrice());
        existing.setStockQuantity(product.getStockQuantity());

        return repo.save(existing);
    }

    public List<Product> getByManufacturer(Long manufacturerId) {
        return repo.findByManufacturerId(manufacturerId);
    }

    public List<Product> getAllProducts() {
        return repo.findAll();
    }
}
