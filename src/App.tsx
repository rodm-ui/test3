import React, { useEffect, useState } from "react";
import axios from "axios";
import { Product, Category, Order } from "./types";

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // fetch from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/products");
        setProducts(res.data.products);
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/api/categories");
        setCategories(res.data.categories);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("/api/orders");
        setOrders(res.data.orders);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="p-4">
      <h1>Product List</h1>
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <ul>
          {products.map((p) => (
            <li key={p.id}>{p.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
