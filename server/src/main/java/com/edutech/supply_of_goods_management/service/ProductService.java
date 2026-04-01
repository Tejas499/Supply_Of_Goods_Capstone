package com.edutech.supply_of_goods_management.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.edutech.supply_of_goods_management.entity.Product;
import com.edutech.supply_of_goods_management.repository.ProductRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    /**
     * MANUFACTURER creates a new product with initial stockQuantity
     */
    @Transactional
    public Product createProduct(Product product) {
        if (product.getStockQuantity() < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Stock quantity cannot be negative");
        }
        return productRepository.save(product);
    }

    /**
     * MANUFACTURER updates product — if stockQuantity is increased,
     * it means manufacturer produced more units (stock goes up)
     * if decreased, it means stock was adjusted/removed
     */
    @Transactional
    public Product updateProduct(Long id, Product updatedProduct) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product not found with id: " + id));

        int oldStock = existing.getStockQuantity();
        int newStock = updatedProduct.getStockQuantity();
        int stockDifference = newStock - oldStock;

        // Update all fields
        existing.setName(updatedProduct.getName());
        existing.setDescription(updatedProduct.getDescription());
        existing.setPrice(updatedProduct.getPrice());
        existing.setStockQuantity(newStock);
        existing.setManufacturerId(updatedProduct.getManufacturerId());

        Product saved = productRepository.save(existing);

        // Log stock change for clarity
        if (stockDifference > 0) {
            System.out.println("Manufacturer added " + stockDifference
                    + " units to product [" + existing.getName() + "]. "
                    + "New total stock: " + newStock);
        } else if (stockDifference < 0) {
            System.out.println("Manufacturer reduced stock by " + Math.abs(stockDifference)
                    + " units for product [" + existing.getName() + "]. "
                    + "New total stock: " + newStock);
        }

        return saved;
    }

    public List<Product> getProductsByManufacturerId(Long manufacturerId) {
        return productRepository.findByManufacturerId(manufacturerId);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
}