package com.edutech.supply_of_goods_management.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.edutech.supply_of_goods_management.entity.Inventory;
import com.edutech.supply_of_goods_management.entity.Product;
import com.edutech.supply_of_goods_management.repository.InventoryRepository;
import com.edutech.supply_of_goods_management.repository.ProductRepository;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired private ProductRepository   productRepository;
    @Autowired private InventoryRepository inventoryRepository;

    @Transactional
    public Product createProduct(Product product) {
        if (product.getStockQuantity() < 0)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock quantity cannot be negative");

        Optional<Product> existing = productRepository
                .findByNameIgnoreCaseAndManufacturerId(product.getName(), product.getManufacturerId());
        if (existing.isPresent())
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Product '" + product.getName() + "' already exists for this manufacturer. Use Edit to update.");

        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, Product updatedProduct) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found: " + id));

        if (!existing.getName().equalsIgnoreCase(updatedProduct.getName())) {
            Optional<Product> dup = productRepository
                    .findByNameIgnoreCaseAndManufacturerId(updatedProduct.getName(), existing.getManufacturerId());
            if (dup.isPresent() && !dup.get().getId().equals(id))
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Another product named '" + updatedProduct.getName() + "' already exists.");
        }

        existing.setName(updatedProduct.getName());
        existing.setDescription(updatedProduct.getDescription());
        existing.setPrice(updatedProduct.getPrice());
        existing.setStockQuantity(updatedProduct.getStockQuantity());
        existing.setManufacturerId(updatedProduct.getManufacturerId());
        return productRepository.save(existing);
    }

    // DELETE — removes product AND all its inventory records everywhere
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found: " + id));

        // Remove all inventory records for this product across all wholesalers
        List<Inventory> inventories = inventoryRepository.findByProductId(id);
        inventoryRepository.deleteAll(inventories);

        // Delete the product itself (cascades to orders/feedbacks via CascadeType.ALL)
        productRepository.delete(product);
    }

    public List<Product> getProductsByManufacturerId(Long manufacturerId) {
        return productRepository.findByManufacturerId(manufacturerId);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
}