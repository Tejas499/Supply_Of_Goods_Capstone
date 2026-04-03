package com.edutech.supply_of_goods_management.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import java.util.List;

@Entity
@Table(name = "orders") // do not change the table name ( do not change this line)
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int quantity;

    private String status;

    // WHO placed this order and TO WHOM
    // "W2M" = Wholesaler placed order to Manufacturer
    // "C2W" = Consumer placed order to Wholesaler
    private String orderType;

    @JsonIgnore
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<Feedback> feedbacks;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"password","orders","feedbacks","hibernateLazyInitializer"})
    private User user;

    @ManyToOne
    @JoinColumn(name = "product_id")
    @JsonIgnoreProperties({"orders","inventories","hibernateLazyInitializer"})
    private Product product;

    private String paymentStatus;
    private String razorpayOrderId;
    private String razorpayPaymentId;

    public Order() {}

    public String getPaymentStatus() {
    return paymentStatus;
}
public void setPaymentStatus(String paymentStatus) {
    this.paymentStatus = paymentStatus;
}
public String getRazorpayOrderId() {
    return razorpayOrderId;
}
public void setRazorpayOrderId(String razorpayOrderId) {
    this.razorpayOrderId = razorpayOrderId;
}
public String getRazorpayPaymentId() {
    return razorpayPaymentId;
}
public void setRazorpayPaymentId(String razorpayPaymentId) {
    this.razorpayPaymentId = razorpayPaymentId;
}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getOrderType() { return orderType; }
    public void setOrderType(String orderType) { this.orderType = orderType; }

    public List<Feedback> getFeedbacks() { return feedbacks; }
    public void setFeedbacks(List<Feedback> feedbacks) { this.feedbacks = feedbacks; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
}