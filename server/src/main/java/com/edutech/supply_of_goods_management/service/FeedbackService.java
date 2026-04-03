package com.edutech.supply_of_goods_management.service;

import java.util.Date;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.edutech.supply_of_goods_management.entity.Feedback;
import com.edutech.supply_of_goods_management.entity.Order;
import com.edutech.supply_of_goods_management.entity.User;
import com.edutech.supply_of_goods_management.repository.FeedbackRepository;
import com.edutech.supply_of_goods_management.repository.OrderRepository;
import com.edutech.supply_of_goods_management.repository.UserRepository;

@Service
public class FeedbackService {

    @Autowired private FeedbackRepository feedbackRepository;
    @Autowired private OrderRepository    orderRepository;
    @Autowired private UserRepository     userRepository;

    public Feedback addFeedback(Long orderId, Long userId, Feedback feedback) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Order not found: " + orderId));

        // Feedback only allowed after order is DELIVERED (wholesaler marked it delivered to consumer)
        if (!"DELIVERED".equalsIgnoreCase(order.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Feedback can only be submitted after the order is DELIVERED. Current status: "
                    + order.getStatus());
        }

        // Must be a C2W order (consumer placed it)
        if (!"C2W".equals(order.getOrderType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Feedback can only be submitted on consumer orders.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found: " + userId));

        feedback.setOrder(order);
        feedback.setUser(user);

        // Auto-set timestamp if frontend didn't send one
        if (feedback.getTimestamp() == null) {
            feedback.setTimestamp(new Date());
        }

        return feedbackRepository.save(feedback);
    }
}