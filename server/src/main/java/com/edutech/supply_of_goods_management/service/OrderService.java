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
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired private OrderRepository     orderRepository;
    @Autowired private ProductRepository   productRepository;
    @Autowired private UserRepository      userRepository;
    @Autowired private InventoryRepository inventoryRepository;

    // ════════════════════════════════════════════════════════════
    // WHOLESALER → MANUFACTURER  (orderType = W2M)
    // Wholesaler places order for product from manufacturer
    // Status flow: ORDER PLACED → IN PROGRESS → OUT FOR DELIVERY → DELIVERED
    // Manufacturer updates: IN PROGRESS, OUT FOR DELIVERY
    // Wholesaler clicks "Mark as Received" when OUT FOR DELIVERY → DELIVERED
    //   → adds quantity to wholesaler's inventory
    // ════════════════════════════════════════════════════════════
    @Transactional
    public Order placeOrder(Order order, Long productId, Long userId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found: " + productId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + userId));

        if (product.getStockQuantity() < order.getQuantity())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Insufficient manufacturer stock. Available: " + product.getStockQuantity()
                    + ", Requested: " + order.getQuantity());

        // Deduct from manufacturer stock immediately
        product.setStockQuantity(product.getStockQuantity() - order.getQuantity());
        productRepository.save(product);

        // Inventory is NOT updated yet — will be updated when wholesaler marks DELIVERED
        order.setProduct(product);
        order.setUser(user);
        order.setStatus("ORDER PLACED");
        order.setOrderType("W2M"); // Wholesaler to Manufacturer
        return orderRepository.save(order);
    }

    // ════════════════════════════════════════════════════════════
    // CONSUMER → WHOLESALER  (orderType = C2W)
    // Consumer orders from wholesaler inventory
    // Deducts from wholesaler inventory immediately
    // ════════════════════════════════════════════════════════════
    @Transactional
    public Order placeConsumerOrder(Order order, Long productId, Long userId, Long wholesalerId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found: " + productId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + userId));

        // Find the specific wholesaler's inventory for this product
        Inventory inv = inventoryRepository.findByWholesalerIdAndProductId(wholesalerId, productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "This wholesaler does not stock the selected product."));

        if (inv.getStockQuantity() < order.getQuantity())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Insufficient stock at this wholesaler. Available: " + inv.getStockQuantity()
                    + ", Requested: " + order.getQuantity());

        // Deduct from this specific wholesaler's inventory
        inv.setStockQuantity(inv.getStockQuantity() - order.getQuantity());
        inventoryRepository.save(inv);

        order.setProduct(product);
        order.setUser(user);
        order.setStatus("ORDER PLACED");
        order.setOrderType("C2W"); // Consumer to Wholesaler
        return orderRepository.save(order);
    }

    // ════════════════════════════════════════════════════════════
    // MANUFACTURER updates W2M order status
    // Allowed: ORDER PLACED → IN PROGRESS → OUT FOR DELIVERY
    // Manufacturer CANNOT mark as DELIVERED (only wholesaler can via markReceived)
    // ════════════════════════════════════════════════════════════
    @Transactional
    public Order updateOrderStatusByManufacturer(Long id, String newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found: " + id));

        if (!"W2M".equals(order.getOrderType()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This is not a wholesaler order.");

        String prev = order.getStatus();
        if ("DELIVERED".equalsIgnoreCase(prev) || "CANCELLED".equalsIgnoreCase(prev))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot update a " + prev + " order.");

        // Manufacturer can only set IN PROGRESS or OUT FOR DELIVERY
        if (!"IN PROGRESS".equalsIgnoreCase(newStatus) && !"OUT FOR DELIVERY".equalsIgnoreCase(newStatus))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Manufacturer can only set: IN PROGRESS or OUT FOR DELIVERY");

        order.setStatus(newStatus.toUpperCase());
        return orderRepository.save(order);
    }

    // ════════════════════════════════════════════════════════════
    // WHOLESALER marks W2M order as RECEIVED (DELIVERED)
    // Only allowed when status = OUT FOR DELIVERY
    // → Sets status to DELIVERED
    // → Adds quantity to wholesaler's inventory
    // ════════════════════════════════════════════════════════════
    @Transactional
    public Order markOrderReceived(Long id, Long wholesalerId) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found: " + id));

        if (!"W2M".equals(order.getOrderType()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only wholesaler orders can be marked as received.");

        if (!"OUT FOR DELIVERY".equalsIgnoreCase(order.getStatus()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Order must be OUT FOR DELIVERY to mark as received. Current status: " + order.getStatus());

        // Set to DELIVERED
        order.setStatus("DELIVERED");
        orderRepository.save(order);

        // Add to wholesaler inventory NOW (goods physically received)
        Product product = order.getProduct();
        Optional<Inventory> existing = inventoryRepository.findByWholesalerIdAndProductId(wholesalerId, product.getId());
        if (existing.isPresent()) {
            Inventory inv = existing.get();
            inv.setStockQuantity(inv.getStockQuantity() + order.getQuantity());
            inventoryRepository.save(inv);
        } else {
            Inventory newInv = new Inventory();
            newInv.setWholesalerId(wholesalerId);
            newInv.setProduct(product);
            newInv.setStockQuantity(order.getQuantity());
            inventoryRepository.save(newInv);
        }

        return order;
    }

    // ════════════════════════════════════════════════════════════
    // CANCEL — only allowed before IN PROGRESS
    // Restores stock appropriately
    // ════════════════════════════════════════════════════════════
    @Transactional
    public Order cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found: " + id));

        if (!"ORDER PLACED".equalsIgnoreCase(order.getStatus()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Order can only be cancelled before IN PROGRESS. Current: " + order.getStatus());

        Product product = order.getProduct();

        if ("W2M".equals(order.getOrderType())) {
            // Restore manufacturer stock
            product.setStockQuantity(product.getStockQuantity() + order.getQuantity());
            productRepository.save(product);
        } else {
            // Restore wholesaler inventory
            List<Inventory> invList = inventoryRepository.findByProductId(product.getId());
            if (!invList.isEmpty()) {
                Inventory inv = invList.get(0);
                inv.setStockQuantity(inv.getStockQuantity() + order.getQuantity());
                inventoryRepository.save(inv);
            }
        }

        order.setStatus("CANCELLED");
        return orderRepository.save(order);
    }

    // ════════════════════════════════════════════════════════════
    // GENERIC STATUS UPDATE (for wholesaler updating C2W orders)
    // ═══════════════════════════════════════════════════════════
    // ════════════════════════════════════════════════════════════
    @Transactional
    public Order updateOrderStatus(Long id, String newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found: " + id));
    
        String prev = order.getStatus();
    
        if ("DELIVERED".equalsIgnoreCase(prev) || "CANCELLED".equalsIgnoreCase(prev))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot update a " + prev + " order.");
    
        if ("C2W".equals(order.getOrderType())) {
    
            if ("ORDER PLACED".equals(prev) && "IN PROGRESS".equalsIgnoreCase(newStatus)) {
                order.setStatus("IN PROGRESS");
    
            } else if ("IN PROGRESS".equals(prev) && "OUT FOR DELIVERY".equalsIgnoreCase(newStatus)) {
                order.setStatus("OUT FOR DELIVERY");
    
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status transition");
            }
    
        } else {
            order.setStatus(newStatus.toUpperCase());
        }
    
        return orderRepository.save(order);
    }
    // GET METHODS
    // ════════════════════════════════════════════════════════════

    // Wholesaler's own PLACED orders (W2M — placed to manufacturer)
    public List<Order> getWholesalerPlacedOrders(Long userId) {
        return orderRepository.findByUserIdAndOrderType(userId, "W2M");
    }

    // Orders RECEIVED by wholesaler from consumers (C2W — consumer placed to this wholesaler's products)
    public List<Order> getWholesalerReceivedOrders(Long wholesalerId) {
        // Get all products in this wholesaler's inventory
        List<Inventory> inventories = inventoryRepository.findByWholesalerId(wholesalerId);
        List<Long> productIds = inventories.stream()
                .map(inv -> inv.getProduct().getId())
                .distinct()
                .collect(Collectors.toList());
        if (productIds.isEmpty()) return java.util.Collections.emptyList();
        return orderRepository.findByProductIdInAndOrderType(productIds, "C2W");
    }
    @Transactional
public Order markConsumerOrderReceived(Long id, Long consumerId) {
    Order order = orderRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found: " + id));

    if (!"C2W".equals(order.getOrderType()))
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only consumer orders allowed.");

    if (!order.getUser().getId().equals(consumerId))
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not your order.");

    if (!"OUT FOR DELIVERY".equalsIgnoreCase(order.getStatus()))
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order must be OUT FOR DELIVERY.");

    order.setStatus("DELIVERED");

    return orderRepository.save(order);
}


    // Consumer's own orders
    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    // All W2M orders for manufacturer to manage
    public List<Order> getAllW2MOrders() {
        return orderRepository.findAll().stream()
                .filter(o -> "W2M".equals(o.getOrderType()))
                .collect(Collectors.toList());
    }

    // W2M orders for a specific manufacturer's products
    public List<Order> getW2MOrdersForManufacturer(Long manufacturerId) {
        return orderRepository.findAll().stream()
                .filter(o -> "W2M".equals(o.getOrderType())
                        && o.getProduct() != null
                        && manufacturerId.equals(o.getProduct().getManufacturerId()))
                .collect(Collectors.toList());
    }

    // Payment
    public void updatePaymentStatus(Long orderId, String status) {
    Order order = orderRepository.findById(orderId).orElseThrow();
    order.setPaymentStatus(status);
    orderRepository.save(order);
 }
}