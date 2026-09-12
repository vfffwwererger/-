import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CustomerModule } from './components/CustomerModule';
import { VendorModule } from './components/VendorModule';
import { ProductModule } from './components/ProductModule';
import { QuotationModule } from './components/QuotationModule';
import { ToastContainer } from './components/Toast';
import { ConfirmModal } from './components/ConfirmModal';
import { StatsOverview } from './components/StatsOverview';
import { Customer, Vendor, Product, Quotation, TabType, ToastMessage } from './types';
import {
  loadCustomers,
  saveCustomers,
  loadVendors,
  saveVendors,
  loadProducts,
  saveProducts,
  loadQuotations,
  saveQuotations,
  resetAllDataToDefault,
} from './utils/helpers';
import { CheckCircle2, ShieldCheck, Database, LayoutGrid } from 'lucide-react';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<TabType>('quotations');

  // Core Data States
  const [customers, setCustomers] = useState<Customer[]>(() => loadCustomers());
  const [vendors, setVendors] = useState<Vendor[]>(() => loadVendors());
  const [products, setProducts] = useState<Product[]>(() => loadProducts());
  const [quotations, setQuotations] = useState<Quotation[]>(() => loadQuotations());

  // Toast Notification State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Deletion / Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    itemName?: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Sync to LocalStorage
  useEffect(() => {
    saveCustomers(customers);
  }, [customers]);

  useEffect(() => {
    saveVendors(vendors);
  }, [vendors]);

  useEffect(() => {
    saveProducts(products);
  }, [products]);

  useEffect(() => {
    saveQuotations(quotations);
  }, [quotations]);

  // Toast helper
  const showToast = (type: 'success' | 'error' | 'info', message: string, title?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    const newToast: ToastMessage = { id, type, message, title };
    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 3.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Customer Actions
  const handleSaveCustomer = (customer: Customer) => {
    setCustomers((prev) => {
      const idx = prev.findIndex((c) => c.id === customer.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = customer;
        return next;
      }
      return [customer, ...prev];
    });
  };

  const handleDeleteCustomer = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: '確認刪除客戶資料',
      message: `您即將刪除客戶「${name}」(${id})。此操作無法復原，請確認是否繼續？`,
      itemName: `${id} - ${name}`,
      confirmLabel: '確認刪除',
      isDestructive: true,
      onConfirm: () => {
        setCustomers((prev) => prev.filter((c) => c.id !== id));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast('info', `已刪除客戶：${name}`, '刪除成功');
      },
    });
  };

  // Vendor Actions
  const handleSaveVendor = (vendor: Vendor) => {
    setVendors((prev) => {
      const idx = prev.findIndex((v) => v.id === vendor.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = vendor;
        return next;
      }
      return [vendor, ...prev];
    });
  };

  const handleDeleteVendor = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: '確認刪除供應商資料',
      message: `您即將刪除廠商「${name}」(${id})。若該廠商已有綁定產品，產品之供應商名稱仍會保留。是否確認刪除？`,
      itemName: `${id} - ${name}`,
      confirmLabel: '確認刪除',
      isDestructive: true,
      onConfirm: () => {
        setVendors((prev) => prev.filter((v) => v.id !== id));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast('info', `已刪除廠商：${name}`, '刪除成功');
      },
    });
  };

  // Product Actions
  const handleSaveProduct = (product: Product) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = product;
        return next;
      }
      return [product, ...prev];
    });
  };

  const handleDeleteProduct = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: '確認刪除產品品項',
      message: `您即將刪除產品「${name}」(${id})。已開立之現有報價單內容將不受影響。是否確定刪除？`,
      itemName: `${id} - ${name}`,
      confirmLabel: '確認刪除',
      isDestructive: true,
      onConfirm: () => {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast('info', `已刪除產品：${name}`, '刪除成功');
      },
    });
  };

  // Quotation Actions
  const handleSaveQuotation = (quotation: Quotation) => {
    setQuotations((prev) => {
      const idx = prev.findIndex((q) => q.id === quotation.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = quotation;
        return next;
      }
      return [quotation, ...prev];
    });
  };

  const handleDeleteQuotation = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: '確認刪除報價單',
      message: `您即將刪除報價單「${name}」。刪除後將無法查看或列印此份報價單，請確認是否刪除？`,
      itemName: name,
      confirmLabel: '確認刪除',
      isDestructive: true,
      onConfirm: () => {
        setQuotations((prev) => prev.filter((q) => q.id !== id));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast('info', `已刪除報價單：${name}`, '刪除成功');
      },
    });
  };

  // Reset Sample Data
  const handleResetData = () => {
    setConfirmModal({
      isOpen: true,
      title: '重設所有範例資料',
      message: '這將會清除您目前在瀏覽器 LocalStorage 中的所有自訂修改，並恢復為初始標準範例資料。確定要重設嗎？',
      confirmLabel: '確認重設',
      isDestructive: false,
      onConfirm: () => {
        const resetData = resetAllDataToDefault();
        setCustomers(resetData.customers);
        setVendors(resetData.vendors);
        setProducts(resetData.products);
        setQuotations(resetData.quotations);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        showToast('success', '已成功重設為初始台灣企業展示範例資料！', '重設完成');
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Header with Navigation */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onResetData={handleResetData}
      />

      {/* Main Workspace View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* System Statistics Overview Cards */}
        <StatsOverview
          customers={customers}
          products={products}
          quotations={quotations}
          activeTab={currentTab}
          onSelectTab={setCurrentTab}
        />

        {currentTab === 'customers' && (
          <CustomerModule
            customers={customers}
            onSaveCustomer={handleSaveCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            showToast={showToast}
          />
        )}

        {currentTab === 'vendors' && (
          <VendorModule
            vendors={vendors}
            onSaveVendor={handleSaveVendor}
            onDeleteVendor={handleDeleteVendor}
            showToast={showToast}
          />
        )}

        {currentTab === 'products' && (
          <ProductModule
            products={products}
            vendors={vendors}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            showToast={showToast}
          />
        )}

        {currentTab === 'quotations' && (
          <QuotationModule
            quotations={quotations}
            customers={customers}
            products={products}
            onSaveQuotation={handleSaveQuotation}
            onDeleteQuotation={handleDeleteQuotation}
            showToast={showToast}
          />
        )}
      </main>

      {/* Clean Footer (hidden when printing) */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>純前端架構 (HTML5 / CSS3 / React / Tailwind) ｜ LocalStorage 即時資料同步</span>
          </div>
          <div className="flex items-center gap-4 font-mono">
            <span>RWD 桌面/平板/手機適配</span>
            <span>•</span>
            <span>A4 列印版面最佳化</span>
          </div>
        </div>
      </footer>

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Reusable Double Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        itemName={confirmModal.itemName}
        confirmLabel={confirmModal.confirmLabel}
        isDestructive={confirmModal.isDestructive}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
