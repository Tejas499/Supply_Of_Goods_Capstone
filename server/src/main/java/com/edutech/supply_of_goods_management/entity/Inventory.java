package com.edutech.supply_of_goods_management.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;

@Entity
@Table(name = "inventories") // do not change the table name ( do not change this line)
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long wholesalerId;

    private int stockQuantity;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    // Consumer sees this on their orders — only expose id, username, email
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wholesalerId", insertable = false, updatable = false)
    @JsonIgnoreProperties({"password", "orders", "feedbacks", "hibernateLazyInitializer"})
    private User wholesaler;

    public Inventory() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getWholesalerId() { return wholesalerId; }
    public void setWholesalerId(Long wholesalerId) { this.wholesalerId = wholesalerId; }

    public int getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(int stockQuantity) { this.stockQuantity = stockQuantity; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public User getWholesaler() { return wholesaler; }
    public void setWholesaler(User wholesaler) { this.wholesaler = wholesaler; }
}