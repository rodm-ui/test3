import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Product,
  Category,
  Order,
  OrderItem,
  PaymentMethod,
  OrderType,
  User,
  AppearanceSettings,
  ContactInfo,
  OrderStatus,
} from "./types";

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<AppearanceSettings | null>(null);
  const [contact, setContact] = useState<ContactInfo | null>(null);

  // fetch all data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes, orderRes] = await Promise.all([
          axios.get("/api/products"),
          axios.get("/api/categories"),
          axios.get("/api/orders"),
        ]);

        setProducts(prodRes.data.products);
        setCategories(catRes.data.categories);
        setOrders(orderRes.data.orders);
      } catch (err) {
        console.error("Failed to fetch data from backend", err);
      }
    };

    fetchData();
  }, []);

  // keep rest of your state and methods (cart, checkout, admin dashboard, etc.) unchanged
  // you can use your existing `addToCart`, `handlePlaceOrder`, `handleUpsertProduct`, etc.

  const featuredProducts = useMemo(
    () => products.filter((p) => p.isFeatured),
    [products]
  );

  const productsById = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of products) map.set(p.id, p);
    return map;
  }, [products]);

  return (
    <div className="min-h-screen bg-rose-50 p-4">
      <h1 className="text-2xl font-bold mb-4">Featured Bouquets</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {featuredProducts.map((product) => (
          <div
            key={product.id}
            className="rounded-2xl bg-white shadow p-3 flex flex-col"
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-40 w-full object-cover rounded"
            />
            <h3 className="text-xs font-semibold mt-2">{product.name}</h3>
            <p className="text-[10px] text-slate-500 line-clamp-2">
              {product.description}
            </p>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-rose-700 font-semibold">
                ₱{product.pricePhp}
              </span>
              <button
                className="bg-rose-600 text-white px-2 py-1 text-[11px] rounded"
                onClick={() => {}}
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* your cart, checkout, admin, and dashboard components remain unchanged */}
    </div>
  );
}
