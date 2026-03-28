package com.edutech.supply_of_goods_management.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edutech.supply_of_goods_management.entity.Order;
import com.edutech.supply_of_goods_management.entity.Product;
import com.edutech.supply_of_goods_management.entity.User;
import com.edutech.supply_of_goods_management.repository.OrderRepository;
import com.edutech.supply_of_goods_management.repository.ProductRepository;
import com.edutech.supply_of_goods_management.repository.UserRepository;

import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository repo;

    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private UserRepository userRepo;

    public Order placeOrder(Long productId, Long userId, Order order) {

        Product product = productRepo.findById(productId).orElseThrow();
        User user = userRepo.findById(userId).orElseThrow();

        order.setProduct(product);
        order.setUser(user);

        return repo.save(order);
    }

    public Order updateOrder(Long id, String status) {
        Order order = repo.findById(id).orElseThrow();
        order.setStatus(status);
        return repo.save(order);
    }

    public List<Order> getAllOrders(Long userId) {
        return repo.findByUserId(userId);
    }

}
