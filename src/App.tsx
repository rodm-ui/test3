import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Product, Category, Order, OrderItem, PaymentMethod, OrderType } from './types';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      const res = await axios.get('/api/products');
      setProducts(res.data.products);
    };
    fetchProducts();
  }, []);

  // fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await axios.get('/api/categories');
      setCategories(res.data.categories);
    };
    fetchCategories();
  }, []);

  // fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      const res = await axios.get('/api/orders');
      setOrders(res.data.orders);
    };
    fetchOrders();
  }, []);

  const handlePlaceOrder = async (orderInput: {
    items: OrderItem[],
    paymentMethod: PaymentMethod,
    orderType: OrderType,
    note?: string,
    deliveryAddress?: string
  }) => {
    const res = await axios.post('/api/orders', orderInput);
    setOrders(prev => [res.data.order, ...prev]);
  };

  return (
    <div>
      <h1>Product List</h1>
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <ul>
          {products.map(p => <li key={p.id}>{p.name}</li>)}
        </ul>
      )}
    </div>
  );
};

export default App;
