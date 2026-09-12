import React, { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  Eye,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Truck,
} from 'lucide-react';
import { Vendor } from '../types';
import { isValidEmail, isValidTaxId, isValidPhone, generateNextVendorId } from '../utils/helpers';

interface VendorModuleProps {
  vendors: Vendor[];
  onSaveVendor: (vendor: Vendor) => void;
  onDeleteVendor: (id: string, name: string) => void;
  showToast: (type: 'success' | 'error' | 'info', message: string, title?: string) => void;
}

type ModalMode = 'create' | 'edit' | 'detail' | null;

interface FormErrors {
  name?: string;
  contact?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  address?: string;
  paymentTerms?: string;
}

const COMMON_PAYMENT_TERMS = [
  '月結30天',
  '月結60天',
  '月結90天',
  '交貨後現金',
  '預付款100%',
  '出貨前電匯',
  '月結30天開立60天期票',
];

export const VendorModule: React.FC<VendorModuleProps> = ({
  vendors,
  onSaveVendor,
  onDeleteVendor,
  showToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Vendor>>({
    name: '',
    contact: '',
    title: '',
    phone: '',
    email: '',
    taxId: '',
    address: '',
    paymentTerms: '月結30天',
    notes: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isCustomPayment, setIsCustomPayment] = useState(false);

  // Filtered vendors
  const filteredVendors = useMemo(() => {
    if (!searchTerm.trim()) return vendors;
    const term = searchTerm.toLowerCase();
    return vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(term) ||
        v.id.toLowerCase().includes(term) ||
        v.contact.toLowerCase().includes(term) ||
        v.taxId.includes(term) ||
        v.phone.includes(term) ||
        v.email.toLowerCase().includes(term)
    );
  }, [vendors, searchTerm]);

  // Open Create Modal
  const handleOpenCreate = () => {
    const nextId = generateNextVendorId(vendors);
    setCurrentVendor(null);
    setIsCustomPayment(false);
    setFormData({
      id: nextId,
      name: '',
      contact: '',
      title: '',
      phone: '',
      email: '',
      taxId: '',
      address: '',
      paymentTerms: '月結30天',
      notes: '',
    });
    setErrors({});
    setModalMode('create');
  };

  // Open Edit Modal
  const handleOpenEdit = (vendor: Vendor) => {
    setCurrentVendor(vendor);
    const isCustom = Boolean(vendor.paymentTerms && !COMMON_PAYMENT_TERMS.includes(vendor.paymentTerms));
    setIsCustomPayment(isCustom);
    setFormData({ ...vendor });
    setErrors({});
    setModalMode('edit');
  };

  // Open Detail Modal
  const handleOpenDetail = (vendor: Vendor) => {
    setCurrentVendor(vendor);
    setModalMode('detail');
  };

  // Close Modal
  const handleCloseModal = () => {
    setModalMode(null);
    setCurrentVendor(null);
    setIsCustomPayment(false);
    setErrors({});
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = '請輸入公司名稱 (必填)';
    }

    if (!formData.contact?.trim()) {
      newErrors.contact = '請輸入聯絡窗口 (必填)';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = '請輸入聯絡電話 (必填)';
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = '請填寫正確有效的電話或手機格式';
    }

    if (!formData.email?.trim()) {
      newErrors.email = '請輸入 Email (必填)';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Email 格式不正確 (需包含 @ 與有效網域名稱)';
    }

    if (!formData.taxId?.trim()) {
      newErrors.taxId = '請輸入統一編號 (必填)';
    } else if (!isValidTaxId(formData.taxId)) {
      newErrors.taxId = '統一編號必須為 8 碼純數字';
    }

    if (!formData.address?.trim()) {
      newErrors.address = '請輸入廠商地址 (必填)';
    }

    if (!formData.paymentTerms?.trim()) {
      newErrors.paymentTerms = isCustomPayment
        ? '請輸入自訂付款條件 (必填)'
        : '請選擇付款條件 (必填)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('error', '表單中有未填寫或格式不正確的欄位，請檢查紅字標示處。', '儲存失敗');
      return;
    }

    const isEditing = modalMode === 'edit' && currentVendor;
    const vendorToSave: Vendor = {
      id: isEditing ? currentVendor.id : generateNextVendorId(vendors),
      name: formData.name!.trim(),
      contact: formData.contact!.trim(),
      title: formData.title?.trim() || '',
      phone: formData.phone!.trim(),
      email: formData.email!.trim(),
      taxId: formData.taxId!.trim(),
      address: formData.address!.trim(),
      paymentTerms: formData.paymentTerms!.trim(),
      notes: formData.notes?.trim() || '',
      createdAt: isEditing ? currentVendor.createdAt : new Date().toISOString(),
    };

    onSaveVendor(vendorToSave);
    showToast(
      'success',
      isEditing ? `廠商「${vendorToSave.name}」已成功更新` : `廠商「${vendorToSave.name}」已成功新增 (${vendorToSave.id})`,
      isEditing ? '更新成功' : '新增成功'
    );
    handleCloseModal();
  };

  return (
    <div id="vendor-module-container" className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              廠商管理
            </h2>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
              共 {vendors.length} 筆
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            維護進貨供應商基本資料，此處廠商將自動連動為「產品管理」之供應商來源。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="vendor-search-input"
              type="text"
              placeholder="搜尋廠商名稱、代碼、統編..."
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
            id="add-vendor-btn"
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm shadow-indigo-600/20 transition-colors min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>新增廠商</span>
          </button>
        </div>
      </div>

      {/* Vendor Table for Desktop/Tablet */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table id="vendor-table" className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <th className="py-3.5 px-4 font-mono">廠商代碼</th>
                <th className="py-3.5 px-4">供應商公司名稱</th>
                <th className="py-3.5 px-4">統一編號</th>
                <th className="py-3.5 px-4">聯絡窗口</th>
                <th className="py-3.5 px-4">聯絡電話 / Email</th>
                <th className="py-3.5 px-4">付款條件</th>
                <th className="py-3.5 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <Truck className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm">查無相符的廠商資料</p>
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vend) => (
                  <tr
                    key={vend.id}
                    id={`vendor-row-${vend.id}`}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-emerald-600 dark:text-emerald-400">
                      {vend.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      <div>{vend.name}</div>
                      <div className="text-xs text-slate-400 font-normal truncate max-w-xs" title={vend.address}>
                        {vend.address}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {vend.taxId}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      <span className="font-medium">{vend.contact}</span>
                      {vend.title && (
                        <span className="text-xs text-slate-400 ml-1.5 font-normal">({vend.title})</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 text-xs">
                      <div>{vend.phone}</div>
                      <div className="text-slate-400 truncate max-w-[180px]">{vend.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium">
                        {vend.paymentTerms}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          id={`btn-view-vendor-${vend.id}`}
                          onClick={() => handleOpenDetail(vend)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                          title="查看詳情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          id={`btn-edit-vendor-${vend.id}`}
                          onClick={() => handleOpenEdit(vend)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                          title="編輯資料"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          id={`btn-delete-vendor-${vend.id}`}
                          onClick={() => onDeleteVendor(vend.id, vend.name)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                          title="刪除廠商"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View (< md) */}
      <div className="md:hidden grid grid-cols-1 gap-3.5">
        {filteredVendors.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Truck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">查無廠商資料</p>
          </div>
        ) : (
          filteredVendors.map((vend) => (
            <div
              key={vend.id}
              id={`mobile-vendor-card-${vend.id}`}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {vend.id}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {vend.name}
                  </h3>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium">
                  {vend.paymentTerms}
                </span>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">統編：</span>
                  <span className="font-mono">{vend.taxId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">窗口：</span>
                  <span>{vend.contact} {vend.title && `(${vend.title})`}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`tel:${vend.phone}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    {vend.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{vend.email}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <span className="line-clamp-1">{vend.address}</span>
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenDetail(vend)}
                  className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                >
                  <Eye className="w-4 h-4" />
                  <span>查看</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(vend)}
                  className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100"
                >
                  <Pencil className="w-4 h-4" />
                  <span>編輯</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteVendor(vend.id, vend.name)}
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

      {/* Add / Edit Form Modal */}
      {(modalMode === 'create' || modalMode === 'edit') && (
        <div
          id="vendor-form-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
          onClick={handleCloseModal}
        >
          <div
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 my-8 overflow-hidden animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {modalMode === 'create' ? '新增廠商資料' : '編輯廠商資料'}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    廠商代碼：{formData.id}
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

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Row 1: Company Name & Tax ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    廠商公司名稱 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="vendor-input-name"
                    type="text"
                    placeholder="例如：台積晶片製造設備股份有限公司"
                    value={formData.name || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white transition-all focus:outline-none focus:ring-2 ${
                      errors.name
                        ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/20'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    統一編號 <span className="text-rose-500">* (8碼數字)</span>
                  </label>
                  <input
                    id="vendor-input-taxId"
                    type="text"
                    maxLength={8}
                    placeholder="例如：22099131"
                    value={formData.taxId || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 8);
                      setFormData({ ...formData, taxId: val });
                      if (errors.taxId) setErrors({ ...errors, taxId: undefined });
                    }}
                    className={`w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white transition-all focus:outline-none focus:ring-2 ${
                      errors.taxId
                        ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/20'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800'
                    }`}
                  />
                  {errors.taxId && (
                    <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.taxId}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Contact & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    聯絡窗口 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="vendor-input-contact"
                    type="text"
                    placeholder="例如：黃敬德"
                    value={formData.contact || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, contact: e.target.value });
                      if (errors.contact) setErrors({ ...errors, contact: undefined });
                    }}
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white transition-all focus:outline-none focus:ring-2 ${
                      errors.contact
                        ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/20'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800'
                    }`}
                  />
                  {errors.contact && (
                    <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.contact}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    職稱 <span className="text-slate-400 font-normal">(選填)</span>
                  </label>
                  <input
                    id="vendor-input-title"
                    type="text"
                    placeholder="例如：業務副總監 / 廠長"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800"
                  />
                </div>
              </div>

              {/* Row 3: Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    聯絡電話 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="vendor-input-phone"
                    type="text"
                    placeholder="例如：03-578-1688 或 0920-112233"
                    value={formData.phone || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: undefined });
                    }}
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white transition-all focus:outline-none focus:ring-2 ${
                      errors.phone
                        ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/20'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800'
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="vendor-input-email"
                    type="email"
                    placeholder="例如：sales@ts-chip-equip.example.tw"
                    value={formData.email || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white transition-all focus:outline-none focus:ring-2 ${
                      errors.email
                        ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/20'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 4: Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  廠商地址 <span className="text-rose-500">*</span>
                </label>
                <input
                  id="vendor-input-address"
                  type="text"
                  placeholder="例如：新竹科學園區研新一路9號"
                  value={formData.address || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    if (errors.address) setErrors({ ...errors, address: undefined });
                  }}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white transition-all focus:outline-none focus:ring-2 ${
                    errors.address
                      ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/20'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800'
                  }`}
                />
                {errors.address && (
                  <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.address}
                  </p>
                )}
              </div>

              {/* Row 5: Payment Terms */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  付款條件 <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2">
                  <select
                    id="vendor-select-paymentTerms"
                    value={isCustomPayment ? 'custom' : (formData.paymentTerms || '月結30天')}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'custom') {
                        setIsCustomPayment(true);
                        setFormData((prev) => ({
                          ...prev,
                          paymentTerms: COMMON_PAYMENT_TERMS.includes(prev.paymentTerms || '') ? '' : (prev.paymentTerms || ''),
                        }));
                        if (errors.paymentTerms) setErrors((prev) => ({ ...prev, paymentTerms: undefined }));
                      } else {
                        setIsCustomPayment(false);
                        setFormData((prev) => ({ ...prev, paymentTerms: val }));
                        if (errors.paymentTerms) setErrors((prev) => ({ ...prev, paymentTerms: undefined }));
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.paymentTerms && !isCustomPayment
                        ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/20'
                        : 'border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800'
                    }`}
                  >
                    {COMMON_PAYMENT_TERMS.map((term) => (
                      <option key={term} value={term}>
                        {term}
                      </option>
                    ))}
                    <option value="custom">其他自訂條件</option>
                  </select>

                  {isCustomPayment && (
                    <div className="animate-in fade-in slide-in-from-top-1 duration-150">
                      <input
                        id="vendor-input-paymentTerms-custom"
                        type="text"
                        autoFocus
                        placeholder="請輸入自訂付款條件 (例如：貨到次月15日電匯、預付50%等)"
                        value={formData.paymentTerms || ''}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, paymentTerms: e.target.value }));
                          if (errors.paymentTerms) setErrors((prev) => ({ ...prev, paymentTerms: undefined }));
                        }}
                        className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white transition-all focus:outline-none focus:ring-2 ${
                          errors.paymentTerms
                            ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/20'
                            : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800'
                        }`}
                      />
                    </div>
                  )}
                </div>
                {errors.paymentTerms && (
                  <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.paymentTerms}
                  </p>
                )}
              </div>

              {/* Row 6: Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  備註說明 <span className="text-slate-400 font-normal">(選填)</span>
                </label>
                <textarea
                  id="vendor-input-notes"
                  rows={2}
                  placeholder="主要進貨類別、交期約定或業務配合注意事項..."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px]"
                >
                  取消
                </button>
                <button
                  type="submit"
                  id="vendor-submit-btn"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm shadow-indigo-600/20 min-h-[44px]"
                >
                  {modalMode === 'create' ? '確認新增' : '儲存變更'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vendor Detail Modal */}
      {modalMode === 'detail' && currentVendor && (
        <div
          id="vendor-detail-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={handleCloseModal}
        >
          <div
            className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {currentVendor.name}
                  </h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                    廠商代碼：{currentVendor.id}
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

            <div className="mt-5 space-y-3.5 text-sm">
              <div className="grid grid-cols-2 gap-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">統一編號</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-100 text-base">
                    {currentVendor.taxId}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">付款條件</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {currentVendor.paymentTerms}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">聯絡窗口</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {currentVendor.contact} {currentVendor.title && `(${currentVendor.title})`}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">聯絡電話</span>
                  <a href={`tel:${currentVendor.phone}`} className="font-mono text-indigo-600 dark:text-indigo-400 hover:underline">
                    {currentVendor.phone}
                  </a>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-0.5">電子郵件 (Email)</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {currentVendor.email}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-0.5">廠商地址</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {currentVendor.address}
                </span>
              </div>

              {currentVendor.notes && (
                <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60">
                  <span className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold block mb-1">
                    備註說明
                  </span>
                  <p className="text-xs text-emerald-900 dark:text-emerald-200 whitespace-pre-wrap leading-relaxed">
                    {currentVendor.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  handleCloseModal();
                  handleOpenEdit(currentVendor);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 min-h-[44px]"
              >
                編輯此廠商
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
