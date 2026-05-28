import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Product, Category, Order, OrderItem, PaymentMethod, OrderType } from "./types";

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);

  // fetch products from backend
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

  // fetch categories from backend
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

  // fetch orders from backend
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

  // add item to cart
  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const exist = prev.find((i) => i.productId === product.id);
      if (exist) {
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [
        ...prev,
        { productId: product.id, quantity: 1, unitPricePhp: product.price },
      ];
    });
  };

  // place order and post to backend
  const handlePlaceOrder = async () => {
    if (!cartItems.length) return;
    try {
      const orderPayload = {
        items: cartItems,
        paymentMethod: "E-Wallet",
        orderType: "Delivery",
      };
      const res = await axios.post("/api/orders", orderPayload);
      setOrders((prev) => [res.data.order, ...prev]);
      setCartItems([]);
    } catch (err) {
      console.error("Failed to place order", err);
    }
  };

  // sort featured products first
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => (a.isFeatured ? -1 : 1));
  }, [products]);

  return (
    <div className="min-h-screen bg-rose-50 p-4">
      {/* Admin Dashboard Top Bar */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="rounded-full bg-rose-500 w-6 h-6 flex items-center justify-center text-white">🌸</span>
            BlooMery Flower Shop
          </h1>
          <p className="text-sm text-slate-600">Fresh, hand-tied bouquets for every story you want to tell.</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">Signed in as <strong>BlooMery Admin</strong></span>
          <button className="text-rose-600 border border-rose-600 px-3 py-1 rounded">Log out</button>
        </div>
      </header>

      {/* Featured Bouquets */}
      <h2 className="text-2xl font-bold mb-4">Featured Bouquets</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {sortedProducts.map((product) => (
          <div key={product.id} className="rounded-2xl bg-white shadow p-3 flex flex-col">
            <img
              src={product.image_url}
              alt={product.name}
              className="h-40 w-full object-cover rounded"
            />
            <h3 className="text-xs font-semibold mt-2">{product.name}</h3>
            <p className="text-[10px] text-slate-500 line-clamp-2">{product.description}</p>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-rose-700 font-semibold">₱{product.price}</span>
              <button
                className="bg-rose-600 text-white px-2 py-1 text-[11px] rounded"
                onClick={() => addToCart(product)}
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart / Order Summary */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white shadow rounded p-4 w-80">
          <h2 className="text-xs font-semibold mb-2">Order Summary</h2>
          <ul className="space-y-1 text-[10px]">
            {cartItems.map((item) => {
              const p = products.find((p) => p.id === item.productId);
              return (
                <li key={item.productId}>
                  {item.quantity}× {p?.name} - ₱{item.quantity * item.unitPricePhp}
                </li>
              );
            })}
          </ul>
          <button
            className="mt-2 w-full bg-rose-600 text-white rounded py-1 text-[11px]"
            onClick={handlePlaceOrder}
          >
            Place Order
          </button>
        </div>
      )}
    </div>
  );
}
