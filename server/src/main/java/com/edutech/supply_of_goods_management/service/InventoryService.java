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
    private InventoryRepository repo;

    @Autowired
    private ProductRepository productRepo;

    public Inventory addInventory(Long productId, Inventory inv) {
        Product product = productRepo.findById(productId).orElseThrow();
        inv.setProduct(product);
        return repo.save(inv);
    }

    public Inventory updateInventory(Long id, int stockQuantity) {
        Inventory inv = repo.findById(id).orElseThrow();
        inv.setStockQuantity(stockQuantity);
        return repo.save(inv);
    }

    public List<Inventory> getAllInventories(Long wholesalerId) {
        return repo.findByWholesalerId(wholesalerId);
    }
}
