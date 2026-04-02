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

    @Autowired private OrderRepository     orderRepository;
    @Autowired private ProductRepository   productRepository;
    @Autowired private UserRepository      userRepository;
    @Autowired private InventoryRepository inventoryRepository;

    // ─────────────────────────────────────────────────────────
    // WHOLESALER places order
    // Step 1 — validate stock
    // Step 2 — deduct from Product.stockQuantity  (manufacturer pool ↓)
    // Step 3 — add to Inventory.stockQuantity     (wholesaler stock ↑)
    // Step 4 — save order with status = PENDING
    // All atomic via @Transactional
    // ─────────────────────────────────────────────────────────
    @Transactional
    public Order placeOrder(Order order, Long productId, Long userId) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product not found: " + productId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found: " + userId));

        if (product.getStockQuantity() < order.getQuantity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Insufficient stock. Available: " + product.getStockQuantity()
                    + ", Requested: " + order.getQuantity());
        }

        // Deduct from manufacturer pool
        product.setStockQuantity(product.getStockQuantity() - order.getQuantity());
        productRepository.save(product);

        // Add to wholesaler inventory (create record if first time)
        Optional<Inventory> existing =
                inventoryRepository.findByWholesalerIdAndProductId(userId, productId);

        if (existing.isPresent()) {
            Inventory inv = existing.get();
            inv.setStockQuantity(inv.getStockQuantity() + order.getQuantity());
            inventoryRepository.save(inv);
        } else {
            Inventory newInv = new Inventory();
            newInv.setWholesalerId(userId);
            newInv.setProduct(product);
            newInv.setStockQuantity(order.getQuantity());
            inventoryRepository.save(newInv);
        }

        order.setProduct(product);
        order.setUser(user);
        order.setStatus("ORDER PLACED");          // always starts as PENDING
        return orderRepository.save(order);
    }

    // ─────────────────────────────────────────────────────────
    // WHOLESALER / MANUFACTURER updates order status
    //
    // Status lifecycle:
    //   PENDING → CONFIRMED → SHIPPED → COMPLETED
    //                       ↘ CANCELLED
    //
    // When status = COMPLETED:
    //   No extra stock change — stock was already moved when
    //   the order was placed. COMPLETED just confirms delivery.
    //
    // When status = CANCELLED:
    //   Stock must be RESTORED:
    //   → Product.stockQuantity goes back UP   (manufacturer gets stock back)
    //   → Inventory.stockQuantity goes back DOWN (wholesaler loses the reserved stock)
    // ─────────────────────────────────────────────────────────
    @Transactional
    public Order updateOrderStatus(Long id, String newStatus) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Order not found: " + id));

        String previousStatus = order.getStatus();

        // Prevent updating an already completed or cancelled order
        if ("DELIVERED".equalsIgnoreCase(previousStatus) ||
            "CANCELLED".equalsIgnoreCase(previousStatus)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot update a " + previousStatus + " order.");
        }

        // ── CANCELLATION: reverse the stock changes ──────────
        if ("CANCELLED".equalsIgnoreCase(newStatus)) {

            Product product = order.getProduct();
            Long    userId  = order.getUser().getId();

            // Give stock back to manufacturer pool
            product.setStockQuantity(product.getStockQuantity() + order.getQuantity());
            productRepository.save(product);

            // Remove from wholesaler inventory
            Optional<Inventory> invOpt =
                    inventoryRepository.findByWholesalerIdAndProductId(
                            userId, product.getId());

            if (invOpt.isPresent()) {
                Inventory inv = invOpt.get();
                int restored = inv.getStockQuantity() - order.getQuantity();
                // If inventory would go to 0 or below, set to 0
                inv.setStockQuantity(Math.max(0, restored));
                inventoryRepository.save(inv);
            }
        }

        // ── COMPLETED: just mark it — stock already moved at order placement ──
        // No stock change needed. The quantity was already deducted from
        // Product and added to Inventory when placeOrder() was called.

        order.setStatus(newStatus.toUpperCase());
        return orderRepository.save(order);
    }

    // ─────────────────────────────────────────────────────────
    // CONSUMER places order
    // Deducts from Product.stockQuantity only — no inventory record
    // ─────────────────────────────────────────────────────────
    @Transactional
    public Order placeConsumerOrder(Order order, Long productId, Long userId) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product not found: " + productId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found: " + userId));

        if (product.getStockQuantity() < order.getQuantity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Insufficient stock. Available: " + product.getStockQuantity()
                    + ", Requested: " + order.getQuantity());
        }

        product.setStockQuantity(product.getStockQuantity() - order.getQuantity());
        productRepository.save(product);

        order.setProduct(product);
        order.setUser(user);
        order.setStatus("ORDER PLACED");
        return orderRepository.save(order);
    }

    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }
}