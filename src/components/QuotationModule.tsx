import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Printer,
  Calendar,
  Eye,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Building2,
  Phone,
  User,
  MapPin,
  HelpCircle,
} from 'lucide-react';
import { Quotation, QuotationItem, Customer, Product, QuotationStatus } from '../types';
import { formatCurrency, generateNextQuotationId, getTodayDateString, isValidPhone } from '../utils/helpers';
import { QuotationPrintView } from './QuotationPrintView';

interface QuotationModuleProps {
  quotations: Quotation[];
  customers: Customer[];
  products: Product[];
  onSaveQuotation: (quotation: Quotation) => void;
  onDeleteQuotation: (id: string, name: string) => void;
  showToast: (type: 'success' | 'error' | 'info', message: string, title?: string) => void;
}

type ModalMode = 'create' | 'edit' | null;

interface MainFieldErrors {
  customerName?: string;
  quoter?: string;
  phone?: string;
  address?: string;
  items?: string;
}

interface ItemError {
  productId?: string;
  quantity?: string;
  unitPrice?: string;
}

export const QuotationModule: React.FC<QuotationModuleProps> = ({
  quotations,
  customers,
  products,
  onSaveQuotation,
  onDeleteQuotation,
  showToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [currentQuotation, setCurrentQuotation] = useState<Quotation | null>(null);

  // Active print preview quotation
  const [printQuotation, setPrintQuotation] = useState<Quotation | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Quotation>>({
    id: '',
    date: getTodayDateString(),
    customerId: '',
    customerName: '',
    customerTaxId: '',
    customerContact: '',
    quoter: '業務代表',
    phone: '',
    address: '',
    terms: '1. 本報價單有效期限為開立日起 30 天整。\n2. 保固服務：全機提供原廠硬體一年有限保固。\n3. 交貨時間：下單後 7~14 個工作天送達。',
    status: '待確認',
    items: [],
  });

  const [mainErrors, setMainErrors] = useState<MainFieldErrors>({});
  const [itemErrors, setItemErrors] = useState<Record<string, ItemError>>({});

  // Filtered quotations
  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      const matchStatus = statusFilter === 'ALL' || q.status === statusFilter;
      if (!matchStatus) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        q.id.toLowerCase().includes(term) ||
        q.customerName.toLowerCase().includes(term) ||
        q.quoter.toLowerCase().includes(term) ||
        (q.customerTaxId && q.customerTaxId.includes(term))
      );
    });
  }, [quotations, searchTerm, statusFilter]);

  // Open Create Modal
  const handleOpenCreate = () => {
    const today = getTodayDateString();
    const nextId = generateNextQuotationId(quotations, today);

    // Initial item if products exist
    const initialItem: QuotationItem = {
      id: 'item-' + Date.now(),
      productId: products.length > 0 ? products[0].id : '',
      productName: products.length > 0 ? products[0].name : '',
      spec: products.length > 0 ? (products[0].spec || products[0].description || '') : '',
      unitPrice: products.length > 0 ? products[0].price : 0,
      quantity: 1,
      subtotal: products.length > 0 ? products[0].price : 0,
    };

    setCurrentQuotation(null);
    setFormData({
      id: nextId,
      date: today,
      customerId: customers.length > 0 ? customers[0].id : '',
      customerName: customers.length > 0 ? customers[0].name : '',
      customerTaxId: customers.length > 0 ? customers[0].taxId : '',
      customerContact: customers.length > 0 ? customers[0].contact : '',
      quoter: '陳智翔 (專案業務專員)',
      phone: '02-2345-6789 #302',
      address: customers.length > 0 ? customers[0].address : '',
      terms: '1. 本報價單有效期限為開立日起 30 天整。\n2. 保固服務：全機提供原廠硬體一年有限保固。\n3. 交貨時間：收到正式採購單 (PO) 後 10 個工作天內完工送達。',
      status: '待確認',
      items: [initialItem],
    });
    setMainErrors({});
    setItemErrors({});
    setModalMode('create');
  };

  // Open Edit Modal
  const handleOpenEdit = (quote: Quotation) => {
    setCurrentQuotation(quote);
    setFormData({
      ...quote,
      items: quote.items.map((it) => ({ ...it })),
    });
    setMainErrors({});
    setItemErrors({});
    setModalMode('edit');
  };

  // Close Form Modal
  const handleCloseModal = () => {
    setModalMode(null);
    setCurrentQuotation(null);
    setMainErrors({});
    setItemErrors({});
  };

  // Handle Customer Selection in Form (Cross-module dynamic autofill)
  const handleCustomerSelect = (custName: string) => {
    const matched = customers.find((c) => c.name === custName);
    if (matched) {
      setFormData((prev) => ({
        ...prev,
        customerName: matched.name,
        customerId: matched.id,
        customerTaxId: matched.taxId,
        customerContact: matched.contact,
        address: matched.address,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        customerName: custName,
      }));
    }
    if (mainErrors.customerName) {
      setMainErrors((prev) => ({ ...prev, customerName: undefined }));
    }
  };

  // Handle Quotation Date Change (Regenerates sequence if in create mode)
  const handleDateChange = (newDate: string) => {
    setFormData((prev) => {
      const nextId =
        modalMode === 'create'
          ? generateNextQuotationId(quotations, newDate)
          : prev.id!;
      return {
        ...prev,
        date: newDate,
        id: nextId,
      };
    });
  };

  // Items Management
  const handleAddItem = () => {
    const defaultProduct = products.length > 0 ? products[0] : null;
    const newItem: QuotationItem = {
      id: 'item-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      productId: defaultProduct ? defaultProduct.id : '',
      productName: defaultProduct ? defaultProduct.name : '',
      spec: defaultProduct ? (defaultProduct.spec || defaultProduct.description || '') : '',
      unitPrice: defaultProduct ? defaultProduct.price : 0,
      quantity: 1,
      subtotal: defaultProduct ? defaultProduct.price : 0,
    };

    setFormData((prev) => ({
      ...prev,
      items: [...(prev.items || []), newItem],
    }));

    if (mainErrors.items) {
      setMainErrors((prev) => ({ ...prev, items: undefined }));
    }
  };

  const handleRemoveItem = (index: number) => {
    if ((formData.items?.length || 0) <= 1) {
      showToast('error', '報價單至少必須包含 1 筆明細項目', '無法刪除');
      return;
    }

    setFormData((prev) => {
      const updated = [...(prev.items || [])];
      updated.splice(index, 1);
      return { ...prev, items: updated };
    });
  };

  const handleProductSelect = (index: number, prodId: string) => {
    const selected = products.find((p) => p.id === prodId);
    setFormData((prev) => {
      const items = [...(prev.items || [])];
      if (items[index]) {
        const unitPrice = selected ? selected.price : 0;
        const qty = items[index].quantity || 1;
        items[index] = {
          ...items[index],
          productId: prodId,
          productName: selected ? selected.name : '自選項目',
          spec: selected ? (selected.spec || selected.description || '') : items[index].spec,
          unitPrice: unitPrice,
          subtotal: unitPrice * qty,
        };
      }
      return { ...prev, items };
    });
  };

  const handleItemFieldChange = (
    index: number,
    field: 'spec' | 'unitPrice' | 'quantity',
    value: any
  ) => {
    setFormData((prev) => {
      const items = [...(prev.items || [])];
      if (items[index]) {
        if (field === 'unitPrice') {
          const price = Math.max(0, parseFloat(value) || 0);
          items[index] = {
            ...items[index],
            unitPrice: price,
            subtotal: price * (items[index].quantity || 1),
          };
        } else if (field === 'quantity') {
          const qty = Math.max(1, parseInt(value, 10) || 1);
          items[index] = {
            ...items[index],
            quantity: qty,
            subtotal: (items[index].unitPrice || 0) * qty,
          };
        } else {
          items[index] = {
            ...items[index],
            [field]: value,
          };
        }
      }
      return { ...prev, items };
    });
  };

  // Real-time calculated totals
  const calculatedTotals = useMemo(() => {
    const items = formData.items || [];
    const subtotal = items.reduce((acc, it) => acc + (it.unitPrice * it.quantity), 0);
    const tax = Math.round(subtotal * 0.05); // 5% VAT
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [formData.items]);

  // Validation
  const validateQuotationForm = (): boolean => {
    const newMainErrors: MainFieldErrors = {};
    const newItemErrors: Record<string, ItemError> = {};

    if (!formData.customerName?.trim()) {
      newMainErrors.customerName = '請選擇或輸入客戶名稱 (必填)';
    }

    if (!formData.quoter?.trim()) {
      newMainErrors.quoter = '請輸入報價人員 (必填)';
    }

    if (!formData.phone?.trim()) {
      newMainErrors.phone = '請輸入連絡電話 (必填)';
    } else if (!isValidPhone(formData.phone)) {
      newMainErrors.phone = '請填寫正確有效的電話格式';
    }

    if (!formData.address?.trim()) {
      newMainErrors.address = '請輸入住址 / 公司地址 (必填)';
    }

    if (!formData.items || formData.items.length === 0) {
      newMainErrors.items = '報價單至少必須包含 1 筆有效的產品明細 (必填)';
    } else {
      formData.items.forEach((item, idx) => {
        const itemErr: ItemError = {};
        if (!item.productId && !item.productName) {
          itemErr.productId = '請選擇產品';
        }
        if (item.quantity === undefined || isNaN(item.quantity) || item.quantity < 1) {
          itemErr.quantity = '數量需 ≥ 1';
        }
        if (item.unitPrice === undefined || isNaN(item.unitPrice) || item.unitPrice < 0) {
          itemErr.unitPrice = '單價需 ≥ 0';
        }
        if (Object.keys(itemErr).length > 0) {
          newItemErrors[item.id || String(idx)] = itemErr;
        }
      });
    }

    setMainErrors(newMainErrors);
    setItemErrors(newItemErrors);

    return Object.keys(newMainErrors).length === 0 && Object.keys(newItemErrors).length === 0;
  };

  // Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateQuotationForm()) {
      showToast('error', '報價單主表或明細項目中含有未填寫之必填項目，請檢查紅字標記。', '無法儲存');
      return;
    }

    const isEditing = modalMode === 'edit' && currentQuotation;
    const dateStr = formData.date || getTodayDateString();
    const finalId = isEditing ? currentQuotation.id : generateNextQuotationId(quotations, dateStr);

    const itemsToSave = (formData.items || []).map((item, idx) => ({
      id: item.id || `item-${Date.now()}-${idx}`,
      productId: item.productId,
      productName: item.productName,
      spec: item.spec || '',
      unitPrice: Number(item.unitPrice) || 0,
      quantity: Number(item.quantity) || 1,
      subtotal: (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1),
    }));

    const subtotal = itemsToSave.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + tax;

    const quotationToSave: Quotation = {
      id: finalId,
      date: dateStr,
      customerId: formData.customerId || '',
      customerName: formData.customerName!.trim(),
      customerTaxId: formData.customerTaxId || '',
      customerContact: formData.customerContact || '',
      quoter: formData.quoter!.trim(),
      phone: formData.phone!.trim(),
      address: formData.address!.trim(),
      terms: formData.terms?.trim() || '',
      status: (formData.status as QuotationStatus) || '待確認',
      items: itemsToSave,
      subtotal,
      tax,
      total,
      createdAt: isEditing ? currentQuotation.createdAt : new Date().toISOString(),
    };

    onSaveQuotation(quotationToSave);
    showToast(
      'success',
      isEditing ? `報價單「${quotationToSave.id}」已成功更新` : `報價單「${quotationToSave.id}」已成功建立`,
      isEditing ? '更新成功' : '新增成功'
    );
    handleCloseModal();
  };

  // If currently in print view, render the print view component
  if (printQuotation) {
    return (
      <QuotationPrintView
        quotation={printQuotation}
        onBack={() => setPrintQuotation(null)}
      />
    );
  }

  return (
    <div id="quotation-module-container" className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              報價單管理
            </h2>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
              共 {quotations.length} 筆
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            連動客戶及產品資料，即時試算營業稅與總額，支援 A4 格式友善預覽與列印匯出。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <select
            id="quotation-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">全部狀態</option>
            <option value="待確認">待確認</option>
            <option value="已確認">已確認</option>
            <option value="已成交">已成交</option>
            <option value="已失效">已失效</option>
          </select>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="quotation-search-input"
              type="text"
              placeholder="搜尋單號、客戶、報價人..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Add Button */}
          <button
            id="add-quotation-btn"
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm shadow-indigo-600/20 transition-colors min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>開立報價單</span>
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table id="quotation-table" className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <th className="py-3.5 px-4 font-mono">報價單號</th>
                <th className="py-3.5 px-4">客戶名稱</th>
                <th className="py-3.5 px-4">報價人員 / 電話</th>
                <th className="py-3.5 px-4">報價日期</th>
                <th className="py-3.5 px-4 text-right">報價總計 (含稅)</th>
                <th className="py-3.5 px-4 text-center">狀態</th>
                <th className="py-3.5 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm">查無相符的報價單</p>
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((quo) => {
                  const isAccepted = quo.status === '已成交';
                  const isConfirmed = quo.status === '已確認';
                  const isDraft = quo.status === '待確認';

                  return (
                    <tr
                      key={quo.id}
                      id={`quotation-row-${quo.id}`}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                        {quo.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {quo.customerName}
                        </div>
                        <div className="text-xs text-slate-400 font-normal">
                          {quo.customerTaxId ? `統編：${quo.customerTaxId}` : ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        <div className="font-medium">{quo.quoter}</div>
                        <div className="text-xs text-slate-400">{quo.phone}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {quo.date}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white text-base">
                        {formatCurrency(quo.total)}
                        <div className="text-[11px] font-normal text-slate-400">
                          未稅 {formatCurrency(quo.subtotal)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center text-xs px-2.5 py-1 rounded-md font-medium ${
                            isAccepted
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : isConfirmed
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                              : isDraft
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {quo.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            id={`btn-print-quote-${quo.id}`}
                            onClick={() => setPrintQuotation(quo)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                            title="友善列印 / A4檢視"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            id={`btn-edit-quote-${quo.id}`}
                            onClick={() => handleOpenEdit(quo)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                            title="編輯報價單"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            id={`btn-delete-quote-${quo.id}`}
                            onClick={() => onDeleteQuotation(quo.id, `${quo.id} (${quo.customerName})`)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                            title="刪除報價單"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden grid grid-cols-1 gap-3.5">
        {filteredQuotations.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">查無報價單資料</p>
          </div>
        ) : (
          filteredQuotations.map((quo) => (
            <div
              key={quo.id}
              id={`mobile-quotation-card-${quo.id}`}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                    {quo.id}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {quo.customerName}
                  </h3>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium">
                  {quo.status}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">報價金額 (含稅)</span>
                  <span className="text-base font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(quo.total)}
                  </span>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <div className="flex items-center gap-1 justify-end font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{quo.date}</span>
                  </div>
                  <div className="mt-0.5">{quo.quoter}</div>
                </div>
              </div>

              {/* Mobile Actions (min touch size 44px) */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPrintQuotation(quo)}
                  className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100"
                >
                  <Printer className="w-4 h-4" />
                  <span>列印 / 預覽</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(quo)}
                  className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100"
                >
                  <Pencil className="w-4 h-4" />
                  <span>編輯</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteQuotation(quo.id, `${quo.id} (${quo.customerName})`)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100"
                  aria-label="刪除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Quotation Modal */}
      {(modalMode === 'create' || modalMode === 'edit') && (
        <div
          id="quotation-form-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
          onClick={handleCloseModal}
        >
          <div
            className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 my-6 overflow-hidden animate-in zoom-in-95 max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {modalMode === 'create' ? '開立新報價單' : '編輯報價單'}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    報價單號：{formData.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl min-w-[40px] min-h-[40px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 py-4 space-y-5 pr-1">
              {/* Section 1: Basic Quotation Info */}
              <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  一、基本報價資料
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Quote ID */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      報價單號 <span className="text-slate-400 font-normal">(系統自動編號)</span>
                    </label>
                    <input
                      id="quote-input-id"
                      type="text"
                      disabled
                      value={formData.id || ''}
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed"
                    />
                  </div>

                  {/* Quote Date */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      報價日期 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="quote-input-date"
                      type="date"
                      value={formData.date || ''}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      報價單狀態
                    </label>
                    <select
                      id="quote-select-status"
                      value={formData.status || '待確認'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as QuotationStatus })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="待確認">待確認</option>
                      <option value="已確認">已確認</option>
                      <option value="已成交">已成交</option>
                      <option value="已失效">已失效</option>
                    </select>
                  </div>
                </div>

                {/* Customer Selector with Auto-fill */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      客戶名稱 <span className="text-rose-500">* (動態連動客戶管理)</span>
                    </label>
                    <select
                      id="quote-select-customer"
                      value={formData.customerName || ''}
                      onChange={(e) => handleCustomerSelect(e.target.value)}
                      className={`w-full px-3 py-2 text-xs rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                        mainErrors.customerName
                          ? 'border-rose-500 ring-1 ring-rose-500'
                          : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                      }`}
                    >
                      <option value="">-- 請選擇客戶（將自動帶入統編與地址）--</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} ({c.id})
                        </option>
                      ))}
                    </select>
                    {mainErrors.customerName && (
                      <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {mainErrors.customerName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      統一編號 <span className="text-slate-400 font-normal">(選取客戶自動帶入)</span>
                    </label>
                    <input
                      id="quote-input-taxId"
                      type="text"
                      placeholder="自動帶入或手動輸入"
                      value={formData.customerTaxId || ''}
                      onChange={(e) => setFormData({ ...formData, customerTaxId: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Quoter, Phone, Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      報價人員 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="quote-input-quoter"
                      type="text"
                      placeholder="例如：陳智翔 (業務專員)"
                      value={formData.quoter || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, quoter: e.target.value });
                        if (mainErrors.quoter) setMainErrors({ ...mainErrors, quoter: undefined });
                      }}
                      className={`w-full px-3 py-2 text-xs rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                        mainErrors.quoter
                          ? 'border-rose-500 ring-1 ring-rose-500'
                          : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                      }`}
                    />
                    {mainErrors.quoter && (
                      <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {mainErrors.quoter}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      連絡電話 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="quote-input-phone"
                      type="text"
                      placeholder="例如：02-2345-6789 #302"
                      value={formData.phone || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (mainErrors.phone) setMainErrors({ ...mainErrors, phone: undefined });
                      }}
                      className={`w-full px-3 py-2 text-xs rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                        mainErrors.phone
                          ? 'border-rose-500 ring-1 ring-rose-500'
                          : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                      }`}
                    />
                    {mainErrors.phone && (
                      <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {mainErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    住址 / 公司地址 <span className="text-rose-500">* (選取客戶自動帶入)</span>
                  </label>
                  <input
                    id="quote-input-address"
                    type="text"
                    placeholder="例如：台北市內湖區瑞光路518號7樓"
                    value={formData.address || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, address: e.target.value });
                      if (mainErrors.address) setMainErrors({ ...mainErrors, address: undefined });
                    }}
                    className={`w-full px-3 py-2 text-xs rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                      mainErrors.address
                        ? 'border-rose-500 ring-1 ring-rose-500'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                    }`}
                  />
                  {mainErrors.address && (
                    <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {mainErrors.address}
                    </p>
                  )}
                </div>
              </div>

              {/* Section 2: Product Items Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      二、明細項目清單 <span className="text-rose-500">* (至少 1 筆)</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      從產品庫選取產品後，將自動帶出規格與售價；亦可手動微調單價或補充說明。
                    </p>
                  </div>
                  <button
                    type="button"
                    id="add-quote-item-btn"
                    onClick={handleAddItem}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 min-h-[38px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>新增一筆明細</span>
                  </button>
                </div>

                {mainErrors.items && (
                  <p className="text-xs text-rose-500 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {mainErrors.items}
                  </p>
                )}

                {/* Items container */}
                <div className="space-y-3">
                  {(formData.items || []).map((item, idx) => {
                    const itemErr = itemErrors[item.id] || itemErrors[String(idx)];
                    return (
                      <div
                        key={item.id || idx}
                        id={`quote-item-card-${idx}`}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                            # {idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 p-1 flex items-center gap-1 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg min-h-[36px]"
                            title="移除此筆明細"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>移除此筆</span>
                          </button>
                        </div>

                        {/* Product selection */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                          <div className="sm:col-span-5">
                            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              選擇產品 *
                            </label>
                            <select
                              value={item.productId}
                              onChange={(e) => handleProductSelect(idx, e.target.value)}
                              className={`w-full px-2.5 py-1.5 text-xs rounded-lg border bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                                itemErr?.productId ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                              }`}
                            >
                              <option value="">-- 請選擇產品 --</option>
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.id} - 定價 {formatCurrency(p.price)})
                                </option>
                              ))}
                            </select>
                            {itemErr?.productId && (
                              <p className="text-[11px] text-rose-500 mt-0.5">{itemErr.productId}</p>
                            )}
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              單價 (NT$) *
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={item.unitPrice}
                              onChange={(e) => handleItemFieldChange(idx, 'unitPrice', e.target.value)}
                              className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                                itemErr?.unitPrice ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                              }`}
                            />
                            {itemErr?.unitPrice && (
                              <p className="text-[11px] text-rose-500 mt-0.5">{itemErr.unitPrice}</p>
                            )}
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              數量 * (需≥1)
                            </label>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={item.quantity}
                              onChange={(e) => handleItemFieldChange(idx, 'quantity', e.target.value)}
                              className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                                itemErr?.quantity ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                              }`}
                            />
                            {itemErr?.quantity && (
                              <p className="text-[11px] text-rose-500 mt-0.5">{itemErr.quantity}</p>
                            )}
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              複價 (小計，系統自動計算)
                            </label>
                            <div className="px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-right">
                              {formatCurrency(item.subtotal)}
                            </div>
                          </div>
                        </div>

                        {/* Specification / Description */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            規格與說明 <span className="text-slate-400 font-normal">(選取產品後自動帶入，可微調)</span>
                          </label>
                          <input
                            type="text"
                            placeholder="規格或補充技術說明..."
                            value={item.spec || ''}
                            onChange={(e) => handleItemFieldChange(idx, 'spec', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Subtotal & Tax Calculation Box */}
              <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
                    <span className="font-semibold block">自動試算規則說明：</span>
                    <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300">
                      • 銷售總額 (未稅)：所有產品項目「單價 × 數量」之複價加總。
                      <br />
                      • 營業稅 (5%)：未稅金額 × 0.05 四捨五入計算。
                      <br />
                      • 報價總計 (含稅)：銷售總額 + 營業稅。
                    </p>
                  </div>

                  <div className="w-full sm:w-64 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>未稅金額：</span>
                      <span className="font-mono font-semibold">{formatCurrency(calculatedTotals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>營業稅 (5%)：</span>
                      <span className="font-mono font-semibold">{formatCurrency(calculatedTotals.tax)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100 font-bold text-sm">
                      <span>報價總計 (含稅)：</span>
                      <span className="font-mono text-base text-indigo-700 dark:text-indigo-300">
                        {formatCurrency(calculatedTotals.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Terms & Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  備註 / 交付條件 <span className="text-slate-400 font-normal">(選填，將列印於正式報價單底部)</span>
                </label>
                <textarea
                  id="quote-input-terms"
                  rows={3}
                  placeholder="例如有效天數、保固期間、付款方式、交貨前置期等條款..."
                  value={formData.terms || ''}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px]"
                >
                  取消
                </button>
                <button
                  type="submit"
                  id="quote-submit-btn"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm shadow-indigo-600/20 min-h-[44px]"
                >
                  {modalMode === 'create' ? '確認開立報價單' : '儲存變更'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
