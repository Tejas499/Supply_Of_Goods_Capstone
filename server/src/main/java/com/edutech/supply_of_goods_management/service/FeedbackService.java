package com.edutech.supply_of_goods_management.service;

import java.util.Optional;

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

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    public Feedback addFeedback(Long orderId, Long userId, Feedback feedback) {
        Optional<Order> order = orderRepository.findById(orderId);
        Optional<User> user = userRepository.findById(userId);
        // System.out.println(orderId+"from backsevice");
        order.ifPresent(feedback::setOrder);
        user.ifPresent(feedback::setUser);
        return feedbackRepository.save(feedback);
    }
}