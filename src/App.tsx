import React, { useEffect, useMemo, useState } from "react";
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
} from "./types"; // your existing types

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // fetch products from database
  useEffect(() => {
    axios
      .get("/api/products")
      .then((res) => setProducts(res.data.products))
      .catch((err) => console.error(err));
  }, []);

  // fetch categories from database
  useEffect(() => {
    axios
      .get("/api/categories")
      .then((res) => setCategories(res.data.categories))
      .catch((err) => console.error(err));
  }, []);

  // fetch orders from database (admin sees all, customer filtered)
  useEffect(() => {
    axios
      .get("/api/orders")
      .then((res) => setOrders(res.data.orders))
      .catch((err) => console.error(err));
  }, []);

  const featuredProducts = useMemo(
    () => products.filter((p) => p.isFeatured),
    [products]
  );

  const productsById = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of products) map.set(p.id, p);
    return map;
  }, [products]);

  // Example: add product to cart and place order
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
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
      return [...prev, { productId: product.id, quantity: 1, unitPricePhp: product.pricePhp }];
    });
  };

  const handlePlaceOrder = async () => {
    if (!currentUser || !cartItems.length) return;
    try {
      const res = await axios.post("/api/orders", {
        customerId: currentUser.id,
        customerName: currentUser.name,
        items: cartItems,
        totalAmountPhp: cartItems.reduce(
          (sum, i) => sum + i.quantity * i.unitPricePhp,
          0
        ),
        paymentMethod: "E-Wallet",
        orderType: "Delivery",
      });
      setOrders((prev) => [res.data.order, ...prev]);
      setCartItems([]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-rose-50 p-4">
      <h1 className="text-2xl font-bold mb-4">Featured Bouquets</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {featuredProducts.map((product) => (
          <div key={product.id} className="rounded-2xl bg-white shadow p-3">
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
              const p = productsById.get(item.productId);
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
