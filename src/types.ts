export interface Customer {
  id: string; // CUST-0001
  name: string; // 公司名稱 *
  contact: string; // 聯絡窗口 *
  title?: string; // 職稱
  phone: string; // 聯絡電話 *
  email: string; // Email *
  taxId: string; // 統一編號 * (8碼)
  address: string; // 地址 *
  paymentTerms: string; // 付款條件 *
  notes?: string; // 備註
  createdAt: string;
}

export interface Vendor {
  id: string; // VEND-0001
  name: string; // 公司名稱 *
  contact: string; // 聯絡窗口 *
  title?: string; // 職稱
  phone: string; // 聯絡電話 *
  email: string; // Email *
  taxId: string; // 統一編號 * (8碼)
  address: string; // 地址 *
  paymentTerms: string; // 付款條件 *
  notes?: string; // 備註
  createdAt: string;
}

export interface Product {
  id: string; // PROD-0001
  name: string; // 產品名稱 *
  vendorId?: string; // 供應商代碼
  vendorName: string; // 供應商名稱 (連動廠商管理)
  cost: number; // 成本 * (>=0)
  price: number; // 售價 * (>=0)
  stock: number; // 庫存數量 (整數，預設0)
  brand?: string; // 廠牌
  spec?: string; // 規格 (尺寸/型號)
  description?: string; // 說明
  image?: string; // 圖片 URL 或上傳預覽
  createdAt: string;
}

export interface QuotationItem {
  id: string;
  productId: string;
  productName: string;
  spec: string;
  unitPrice: number;
  quantity: number;
  subtotal: number; // 複價 (單價 * 數量)
}

export type QuotationStatus = '待確認' | '已確認' | '已成交' | '已失效';

export interface Quotation {
  id: string; // QUO-YYYYMMDD-001
  date: string; // 報價日期 YYYY-MM-DD
  customerId: string;
  customerName: string; // 客戶名稱 *
  customerTaxId: string;
  customerContact?: string;
  quoter: string; // 報價人員 *
  phone: string; // 連絡電話 *
  address: string; // 住址 / 公司地址 *
  terms?: string; // 備註 / 交付條件
  status: QuotationStatus;
  items: QuotationItem[];
  subtotal: number; // 未稅金額
  tax: number; // 營業稅 5%
  total: number; // 報價總計 (含稅)
  createdAt: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

export type TabType = 'customers' | 'vendors' | 'products' | 'quotations';
