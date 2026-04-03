package com.edutech.supply_of_goods_management.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.edutech.supply_of_goods_management.entity.Inventory;
import com.edutech.supply_of_goods_management.entity.Product;
import com.edutech.supply_of_goods_management.repository.InventoryRepository;
import com.edutech.supply_of_goods_management.repository.ProductRepository;

import java.util.List;
import java.util.Optional;

@Service
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private ProductRepository productRepository;

    /**
     * WHOLESALER manually adds inventory for a product.
     * Also deducts from Product.stockQuantity because the wholesaler
     * is claiming stock from the manufacturer's available pool.
     */
    @Transactional
    public Inventory addInventory(Inventory inventory, Long productId) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product not found with id: " + productId));

        // Check manufacturer has enough stock to allocate
        if (product.getStockQuantity() < inventory.getStockQuantity()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Insufficient product stock to allocate. Available: "
                    + product.getStockQuantity()
                    + ", Requested: " + inventory.getStockQuantity());
        }

        // Deduct from manufacturer product stock
        product.setStockQuantity(product.getStockQuantity() - inventory.getStockQuantity());
        productRepository.save(product);

        // Save wholesaler inventory record
        inventory.setProduct(product);
        return inventoryRepository.save(inventory);
    }

    

    /**
     * WHOLESALER updates their inventory stock quantity manually.
     * Adjusts Product.stockQuantity by the difference:
     * - If wholesaler increases their inventory → deduct more from product stock
     * - If wholesaler decreases their inventory → return stock back to product
     */
    @Transactional
    public Inventory updateInventory(Long id, int newStockQuantity) {

        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Inventory not found with id: " + id));

        int oldStockQuantity = inventory.getStockQuantity();
        int difference = newStockQuantity - oldStockQuantity;

        Product product = inventory.getProduct();

        if (difference > 0) {
            // Wholesaler wants MORE stock — check product has enough remaining
            if (product.getStockQuantity() < difference) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Insufficient product stock. Available: "
                        + product.getStockQuantity()
                        + ", Additional needed: " + difference);
            }
            // Deduct the extra from product stock
            product.setStockQuantity(product.getStockQuantity() - difference);

        } else if (difference < 0) {
            // Wholesaler is returning stock — add back to product
            product.setStockQuantity(product.getStockQuantity() + Math.abs(difference));
        }

        productRepository.save(product);

        inventory.setStockQuantity(newStockQuantity);
        return inventoryRepository.save(inventory);
    }

    public List<Inventory> getInventoriesByWholesalerId(Long wholesalerId) {
        return inventoryRepository.findByWholesalerId(wholesalerId);
    }


    // Called by consumers to see which wholesalers stock a particular product
    public List<Inventory> getWholesalersByProductId(Long productId) {
        return inventoryRepository.findByProductId(productId);
    }
}