import { Customer, Vendor, Product, Quotation } from '../types';
import { INITIAL_CUSTOMERS, INITIAL_VENDORS, INITIAL_PRODUCTS, INITIAL_QUOTATIONS } from '../mockData';

const STORAGE_KEYS = {
  CUSTOMERS: 'qms_customers_v1',
  VENDORS: 'qms_vendors_v1',
  PRODUCTS: 'qms_products_v1',
  QUOTATIONS: 'qms_quotations_v1',
};

// Storage Loaders with initial fallback
export function loadCustomers(): Customer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load customers from storage', e);
  }
  return INITIAL_CUSTOMERS;
}

export function saveCustomers(data: Customer[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save customers', e);
  }
}

export function loadVendors(): Vendor[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VENDORS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load vendors from storage', e);
  }
  return INITIAL_VENDORS;
}

export function saveVendors(data: Vendor[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save vendors', e);
  }
}

export function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load products from storage', e);
  }
  return INITIAL_PRODUCTS;
}

export function saveProducts(data: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save products', e);
  }
}

export function loadQuotations(): Quotation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUOTATIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load quotations from storage', e);
  }
  return INITIAL_QUOTATIONS;
}

export function saveQuotations(data: Quotation[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save quotations', e);
  }
}

export function resetAllDataToDefault(): {
  customers: Customer[];
  vendors: Vendor[];
  products: Product[];
  quotations: Quotation[];
} {
  saveCustomers(INITIAL_CUSTOMERS);
  saveVendors(INITIAL_VENDORS);
  saveProducts(INITIAL_PRODUCTS);
  saveQuotations(INITIAL_QUOTATIONS);
  return {
    customers: INITIAL_CUSTOMERS,
    vendors: INITIAL_VENDORS,
    products: INITIAL_PRODUCTS,
    quotations: INITIAL_QUOTATIONS,
  };
}

// Auto ID Generators
export function generateNextCustomerId(customers: Customer[]): string {
  let maxNum = 0;
  customers.forEach((c) => {
    const match = c.id.match(/^CUST-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  });
  const nextNum = maxNum + 1;
  return `CUST-${String(nextNum).padStart(4, '0')}`;
}

export function generateNextVendorId(vendors: Vendor[]): string {
  let maxNum = 0;
  vendors.forEach((v) => {
    const match = v.id.match(/^VEND-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  });
  const nextNum = maxNum + 1;
  return `VEND-${String(nextNum).padStart(4, '0')}`;
}

export function generateNextProductId(products: Product[]): string {
  let maxNum = 0;
  products.forEach((p) => {
    const match = p.id.match(/^PROD-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  });
  const nextNum = maxNum + 1;
  return `PROD-${String(nextNum).padStart(4, '0')}`;
}

export function generateNextQuotationId(quotations: Quotation[], targetDateStr?: string): string {
  // targetDateStr can be "2026-09-11" or empty (defaults to today)
  const date = targetDateStr ? new Date(targetDateStr) : new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const dateKey = `${yyyy}${mm}${dd}`;

  const prefix = `QUO-${dateKey}-`;
  let maxNum = 0;
  quotations.forEach((q) => {
    if (q.id.startsWith(prefix)) {
      const seqStr = q.id.slice(prefix.length);
      const num = parseInt(seqStr, 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  });
  const nextNum = maxNum + 1;
  return `${prefix}${String(nextNum).padStart(3, '0')}`;
}

// Validation helpers
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function isValidTaxId(taxId: string): boolean {
  if (!taxId) return false;
  return /^\d{8}$/.test(taxId.trim());
}

export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  // Allows formats like 02-12345678, 0912-345-678, (02)23456789, +886-2-23456789, extensions
  const clean = phone.replace(/[\s\-()+#extEXT]/g, '');
  return clean.length >= 7 && clean.length <= 15 && /^\d+$/.test(clean);
}

// Currency & Date formatting
export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return 'NT$ 0';
  return 'NT$ ' + amount.toLocaleString('zh-TW');
}

export function getTodayDateString(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
