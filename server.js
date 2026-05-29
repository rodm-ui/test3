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
  port: Number(process.env.MYSQL_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

// test mysql connection
pool.getConnection()
  .then((connection) => {
    console.log('✅ MySQL Connected Successfully');
    connection.release();
  })
  .catch((err) => {
    console.error('❌ MySQL Connection Failed:', err.message);
  });
