package com.edutech.supply_of_goods_management.service;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    public Inventory addInventory(Inventory inventory, Long productId) {
        Optional<Product> product = productRepository.findById(productId);
        product.ifPresent(inventory::setProduct);
        return inventoryRepository.save(inventory);
    }

    public Inventory updateInventory(Long id, int stockQuantity) {
        Optional<Inventory> optional = inventoryRepository.findById(id);
        if (optional.isPresent()) {
            Inventory inventory = optional.get();
            inventory.setStockQuantity(stockQuantity);
            return inventoryRepository.save(inventory);
        }
        return null;
    }

    public List<Inventory> getInventoriesByWholesalerId(Long wholesalerId) {
        return inventoryRepository.findByWholesalerId(wholesalerId);
    }
}