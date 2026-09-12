-- ==========================================================
-- 企業報價與進銷協同管理系統 - Neon PostgreSQL 初始化建表腳本
-- 請在 Neon 控制台的 SQL Editor 中直接執行此腳本建立資料表
-- ==========================================================

-- 1. 客戶資料表 (Customers)
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact VARCHAR(100) NOT NULL,
  title VARCHAR(100),
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(150) NOT NULL,
  tax_id VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  payment_terms VARCHAR(100) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 廠商資料表 (Vendors)
CREATE TABLE IF NOT EXISTS vendors (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact VARCHAR(100) NOT NULL,
  title VARCHAR(100),
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(150) NOT NULL,
  tax_id VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  payment_terms VARCHAR(100) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 產品資料表 (Products)
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  vendor_id VARCHAR(50),
  vendor_name VARCHAR(255) NOT NULL,
  cost NUMERIC(15, 2) NOT NULL DEFAULT 0,
  price NUMERIC(15, 2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  brand VARCHAR(100),
  spec VARCHAR(200),
  description TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 報價單主表 (Quotations)
CREATE TABLE IF NOT EXISTS quotations (
  id VARCHAR(50) PRIMARY KEY,
  date VARCHAR(20) NOT NULL,
  customer_id VARCHAR(50) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_tax_id VARCHAR(20) NOT NULL,
  customer_contact VARCHAR(100),
  quoter VARCHAR(100) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  terms TEXT,
  status VARCHAR(30) NOT NULL DEFAULT '待確認',
  subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0,
  tax NUMERIC(15, 2) NOT NULL DEFAULT 0,
  total NUMERIC(15, 2) NOT NULL DEFAULT 0,
  items_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引優化常用查詢
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_vendors_name ON vendors(name);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_quotations_date ON quotations(date DESC);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
