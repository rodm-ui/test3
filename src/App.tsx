import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Product, Category, Order, OrderItem, PaymentMethod, OrderType } from './types';

const App: React.FC = () => {
const [products, setProducts] = useState<Product[]>([]);
const [categories, setCategories] = useState<Category[]>([]);
const [orders, setOrders] = useState<Order[]>([]);

// Fetch products from backend
useEffect(() => {
const fetchProducts = async () => {
try {
const res = await axios.get('/api/products');
setProducts(res.data.products);
} catch (err) {
console.error('Failed to fetch products', err);
}
};
fetchProducts();
}, []);

// Fetch categories from backend
useEffect(() => {
const fetchCategories = async () => {
try {
const res = await axios.get('/api/categories');
setCategories(res.data.categories);
} catch (err) {
console.error('Failed to fetch categories', err);
}
};
fetchCategories();
}, []);

// Fetch orders from backend
useEffect(() => {
const fetchOrders = async () => {
try {
const res = await axios.get('/api/orders');
setOrders(res.data.orders);
} catch (err) {
console.error('Failed to fetch orders', err);
}
};
fetchOrders();
}, []);

// Handle placing an order
const handlePlaceOrder = async (orderInput: { items: OrderItem[], paymentMethod: PaymentMethod, orderType: OrderType, note?: string, deliveryAddress?: string }) => {
try {
const res = await axios.post('/api/orders', orderInput);
setOrders(prev => [res.data.order, ...prev]);
} catch (err) {
console.error('Failed to place order', err);
}
};

// Example function to upsert a product
const handleUpsertProduct = async (product: Product) => {
try {
const res = await axios.post('/api/products', product);
// update frontend products state
setProducts(prev => {
const idx = prev.findIndex(p => p.id === product.id);
if (idx >= 0) {
prev[idx] = res.data.product;
return [...prev];
} else {
return [res.data.product, ...prev];
}
});
} catch (err) {
console.error('Failed to upsert product', err);
}
};

// Example function to upsert a category
const handleUpsertCategory = async (category: Category) => {
try {
const res = await axios.post('/api/categories', category);
setCategories(prev => {
const idx = prev.findIndex(c => c.id === category.id);
if (idx >= 0) {
prev[idx] = res.data.category;
return [...prev];
} else {
return [res.data.category, ...prev];
}
});
} catch (err) {
console.error('Failed to upsert category', err);
}
};

return ( <div> <h1>Product List</h1>
{products.length === 0 ? <p>No products found.</p> : ( <ul>
{products.map(p => <li key={p.id}>{p.name}</li>)} </ul>
)}
{/* Additional UI for categories, orders, and order placement can be added here */} </div>
);
};

export default App;
