package com.edutech.supply_of_goods_management.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.edutech.supply_of_goods_management.entity.Inventory;
import com.edutech.supply_of_goods_management.entity.Order;
import com.edutech.supply_of_goods_management.entity.Product;
import com.edutech.supply_of_goods_management.entity.User;
import com.edutech.supply_of_goods_management.repository.InventoryRepository;
import com.edutech.supply_of_goods_management.repository.OrderRepository;
import com.edutech.supply_of_goods_management.repository.ProductRepository;
import com.edutech.supply_of_goods_management.repository.UserRepository;

import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    /**
     * WHOLESALER places order:
     * 1. Validate product exists and has enough stock
     * 2. Deduct quantity from Product.stockQuantity (manufacturer stock goes down)
     * 3. Add quantity to Inventory.stockQuantity for this wholesaler+product (wholesaler stock goes up)
     * 4. Save the order
     * All steps in one @Transactional — if any step fails everything rolls back
     */
    @Transactional
    public Order placeOrder(Order order, Long productId, Long userId) {

        // Resolve product
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product not found with id: " + productId));

        // Resolve user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found with id: " + userId));

        // Check manufacturer stock is sufficient
        if (product.getStockQuantity() < order.getQuantity()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Insufficient stock. Available: " + product.getStockQuantity()
                    + ", Requested: " + order.getQuantity());
        }

        // Step 1 — Deduct from Product stock (manufacturer side goes down)
        product.setStockQuantity(product.getStockQuantity() - order.getQuantity());
        productRepository.save(product);

        // Step 2 — Add to Wholesaler Inventory (wholesaler side goes up)
        // Find existing inventory record for this wholesaler+product, or create a new one
        Optional<Inventory> existingInventory =
                inventoryRepository.findByWholesalerIdAndProductId(userId, productId);

        if (existingInventory.isPresent()) {
            // Wholesaler already has this product in inventory — increase quantity
            Inventory inventory = existingInventory.get();
            inventory.setStockQuantity(inventory.getStockQuantity() + order.getQuantity());
            inventoryRepository.save(inventory);
        } else {
            // First time wholesaler orders this product — create inventory record
            Inventory newInventory = new Inventory();
            newInventory.setWholesalerId(userId);
            newInventory.setProduct(product);
            newInventory.setStockQuantity(order.getQuantity());
            inventoryRepository.save(newInventory);
        }

        // Step 3 — Save the order itself
        order.setProduct(product);
        order.setUser(user);
        return orderRepository.save(order);
    }

    /**
     * CONSUMER places order:
     * 1. Validate product exists and has enough stock
     * 2. Deduct from Product.stockQuantity (product stock goes down when consumer buys)
     * 3. Save the order — no inventory record for consumer
     */
    @Transactional
    public Order placeConsumerOrder(Order order, Long productId, Long userId) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product not found with id: " + productId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found with id: " + userId));

        // Check stock available
        if (product.getStockQuantity() < order.getQuantity()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Insufficient stock. Available: " + product.getStockQuantity()
                    + ", Requested: " + order.getQuantity());
        }

        // Deduct from product stock
        product.setStockQuantity(product.getStockQuantity() - order.getQuantity());
        productRepository.save(product);

        order.setProduct(product);
        order.setUser(user);
        return orderRepository.save(order);
    }

    public Order updateOrderStatus(Long id, String status) {
        Optional<Order> optional = orderRepository.findById(id);
        if (optional.isPresent()) {
            Order order = optional.get();
            order.setStatus(status);
            return orderRepository.save(order);
        }
        return null;
    }

    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }
}