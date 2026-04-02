package com.edutech.supply_of_goods_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.edutech.supply_of_goods_management.entity.Order;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // All orders by a user (regardless of type)
    List<Order> findByUserId(Long userId);

    // Wholesaler's PLACED orders (W2M) — orders they placed to manufacturer
    List<Order> findByUserIdAndOrderType(Long userId, String orderType);

    // Consumer orders that a SPECIFIC WHOLESALER should receive
    // These are orders where product belongs to wholesaler's inventory
    // We find by product id and orderType C2W
    List<Order> findByProductIdInAndOrderType(List<Long> productIds, String orderType);
}