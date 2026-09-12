import { Customer, Vendor, Product, Quotation } from '../types';

export interface CloudSyncStatus {
  isConfigured: boolean; // 是否已設定 Neon 連線 (DATABASE_URL)
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  errorMessage: string | null;
}

// 檢查 Neon 後端狀態
export async function checkNeonHealth(): Promise<{ connected: boolean; error?: string; database?: string }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return { connected: false, error: errJson.error || `HTTP ${res.status}` };
    }
    const data = await res.json();
    return { connected: !!data.connected, database: data.database };
  } catch (e: any) {
    return { connected: false, error: e.message || 'API 無法連線' };
  }
}

// 從 Neon 載入全量資料
export async function fetchAllFromNeon(): Promise<{
  customers: Customer[];
  vendors: Vendor[];
  products: Product[];
  quotations: Quotation[];
} | null> {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
  } catch (err) {
    console.warn('無法從 Neon 取得遠端資料：', err);
  }
  return null;
}

// 將全量資料推送到 Neon (用於初次初始化或手動同步)
export async function syncAllToNeon(data: {
  customers: Customer[];
  vendors: Vendor[];
  products: Product[];
  quotations: Quotation[];
}): Promise<boolean> {
  try {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'full_sync',
        data,
      }),
    });
    const json = await res.json();
    return !!json.success;
  } catch (err) {
    console.error('全量同步至 Neon 失敗：', err);
    return false;
  }
}

// 單一實體即時儲存至 Neon (背景非同步執行，不阻斷使用者操作)
export async function syncEntityToNeon(
  type: 'save_customer' | 'save_vendor' | 'save_product' | 'save_quotation',
  entity: Customer | Vendor | Product | Quotation
): Promise<boolean> {
  try {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, entity }),
    });
    return res.ok;
  } catch (err) {
    console.warn('非同步同步至 Neon 失敗：', err);
    return false;
  }
}

// 單一實體刪除即時同步至 Neon
export async function syncDeleteToNeon(target: 'customer' | 'vendor' | 'product' | 'quotation', id: string): Promise<boolean> {
  try {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'delete_item', target, id }),
    });
    return res.ok;
  } catch (err) {
    console.warn('刪除項目同步至 Neon 失敗：', err);
    return false;
  }
}
