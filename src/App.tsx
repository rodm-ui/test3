import React, { useEffect, useState } from "react";
import axios from "axios";

// Define TypeScript types
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category_id?: number;
  is_featured?: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface OrderItem {
  productId: number;
  quantity: number;
  unitPricePhp: number;
}

export interface Order {
  id: number;
  customer_id?: number;
  customer_name?: string;
  total_amount_php?: number;
  payment_method?: string;
  order_type?: string;
  status?: string;
  items?: OrderItem[];
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/products");
        setProducts(res.data.products || []);
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };
    fetchProducts();
  }, []);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/api/categories");
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("/api/orders");
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      }
    };
    fetchOrders();
  }, []);

  // Add product to cart
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

  // Place order
  const handlePlaceOrder = async () => {
    if (!cartItems.length) return;
    try {
      const payload = {
        items: cartItems,
        paymentMethod: "E-Wallet",
        orderType: "Delivery",
      };
      const res = await axios.post("/api/orders", payload);
      if (res.data?.order) {
        setOrders((prev) => [res.data.order, ...prev]);
        setCartItems([]);
      }
    } catch (err) {
      console.error("Failed to place order", err);
    }
  };

  return (
    <div className="min-h-screen bg-rose-50 p-4">
      <h1 className="text-2xl font-bold mb-4">Featured Bouquets</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="rounded-2xl bg-white shadow p-3 flex flex-col"
          >
            <img
              src={product.image_url || ""}
              alt={product.name}
              className="h-40 w-full object-cover rounded"
            />
            <h3 className="text-xs font-semibold mt-2">{product.name}</h3>
            <p className="text-[10px] text-slate-500 line-clamp-2">
              {product.description}
            </p>
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
