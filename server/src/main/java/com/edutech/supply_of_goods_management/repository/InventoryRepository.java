package com.edutech.supply_of_goods_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.edutech.supply_of_goods_management.entity.Inventory;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    List<Inventory> findByWholesalerId(Long wholesalerId);
    Optional<Inventory> findByWholesalerIdAndProductId(Long wholesalerId, Long productId);
    // Consumers use this to see which wholesalers carry a product
    List<Inventory> findByProductId(Long productId);
}