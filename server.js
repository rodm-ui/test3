import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static(path.resolve(process.cwd(), 'dist')));

// mysql pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

// middleware to log requests to DB
app.use(async (req, res, next) => {
  const actor = req.body?.email || 'System / Visitor';
  const endpoint = req.originalUrl;
  const method = req.method;

  res.on('finish', async () => {
    const statusCode = res.statusCode;
    if (!endpoint.includes('/api/system-logs')) {
      try {
        await pool.execute(
          'INSERT INTO system_logs (user_email, action, method, endpoint, status_code) VALUES (?, ?, ?, ?, ?)',
          [actor, 'Executed endpoint call', method, endpoint, statusCode]
        );
      } catch (err) {
        console.error('Logging error:', err.message);
      }
    }
  });
  next();
});

// API: products
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products ORDER BY id DESC');
    res.json({ products: rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// API: categories
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM categories ORDER BY id DESC');
    res.json({ categories: rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// API: orders GET
app.get('/api/orders', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM orders ORDER BY id DESC');
    res.json({ orders: rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// API: orders POST
app.post('/api/orders', async (req, res) => {
  const { items, paymentMethod, orderType, note, deliveryAddress } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Order must have at least one item' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO orders (payment_method, order_type, note, delivery_address, createdAt) VALUES (?, ?, ?, ?, NOW())',
      [paymentMethod, orderType, note || '', deliveryAddress || '']
    );
    const orderId = result.insertId;

    for (const item of items) {
      await pool.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.productId, item.quantity, item.price]
      );
    }

    const [orderRows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [orderId]);
    const [itemsRows] = await pool.execute('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

    res.json({ order: { ...orderRows[0], items: itemsRows } });
  } catch (err) {
    console.error('Failed to save order', err);
    res.status(500).json({ message: 'Failed to save order' });
  }
});

// API: system logs
app.get('/api/system-logs', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM system_logs ORDER BY created_at DESC LIMIT 100');
    res.json({ success: true, logs: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch logs' });
  }
});

// SSE stream
app.get('/api/system-logs/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const interval = setInterval(async () => {
    try {
      const [rows] = await pool.execute('SELECT * FROM system_logs ORDER BY created_at DESC LIMIT 1');
      if (rows.length) res.write(`data: ${JSON.stringify(rows[0])}\n\n`);
    } catch (err) {
      console.error(err);
    }
  }, 3000);

  req.on('close', () => clearInterval(interval));
});

// serve frontend
app.get(/.*/, (req, res) => {
  res.sendFile(path.resolve(process.cwd(), 'dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
