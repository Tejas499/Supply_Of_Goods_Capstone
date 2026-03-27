package com.edutech.supply_of_goods_management.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.edutech.supply_of_goods_management.entity.Feedback;
import com.edutech.supply_of_goods_management.entity.Order;
import com.edutech.supply_of_goods_management.entity.User;
import com.edutech.supply_of_goods_management.repository.FeedbackRepository;
import com.edutech.supply_of_goods_management.repository.OrderRepository;
import com.edutech.supply_of_goods_management.repository.UserRepository;

@Service
public class FeedbackService {
    // implement the service here

    @Autowired
    private FeedbackRepository repo;

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private UserRepository userRepo;

    public Feedback addFeedback(Long orderId, Long userId, Feedback fb) {

        Order order = orderRepo.findById(orderId).orElseThrow();
        User user = userRepo.findById(userId).orElseThrow();

        fb.setOrder(order);
        fb.setUser(user);

        return repo.save(fb);
    }

}