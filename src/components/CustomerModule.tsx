import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Building2,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Eye,
  Pencil,
  Trash2,
  X,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Customer } from '../types';
import { isValidEmail, isValidTaxId, isValidPhone, generateNextCustomerId } from '../utils/helpers';

interface CustomerModuleProps {
  customers: Customer[];
  onSaveCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string, name: string) => void;
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
  '預付款',
  '交貨後現金',
  '訂金30%尾款70%',
  '驗收合格後30天匯款',
];

export const CustomerModule: React.FC<CustomerModuleProps> = ({
  customers,
  onSaveCustomer,
  onDeleteCustomer,
  showToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Customer>>({
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

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customers;
    const term = searchTerm.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.id.toLowerCase().includes(term) ||
        c.contact.toLowerCase().includes(term) ||
        c.taxId.includes(term) ||
        c.phone.includes(term) ||
        c.email.toLowerCase().includes(term)
    );
  }, [customers, searchTerm]);

  // Open Create Modal
  const handleOpenCreate = () => {
    const nextId = generateNextCustomerId(customers);
    setCurrentCustomer(null);
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
  const handleOpenEdit = (customer: Customer) => {
    setCurrentCustomer(customer);
    const isCustom = Boolean(customer.paymentTerms && !COMMON_PAYMENT_TERMS.includes(customer.paymentTerms));
    setIsCustomPayment(isCustom);
    setFormData({ ...customer });
    setErrors({});
    setModalMode('edit');
  };

  // Open Detail Modal
  const handleOpenDetail = (customer: Customer) => {
    setCurrentCustomer(customer);
    setModalMode('detail');
  };

  // Close Modal
  const handleCloseModal = () => {
    setModalMode(null);
    setCurrentCustomer(null);
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
      newErrors.address = '請輸入公司地址 (必填)';
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

    const isEditing = modalMode === 'edit' && currentCustomer;
    const customerToSave: Customer = {
      id: isEditing ? currentCustomer.id : generateNextCustomerId(customers),
      name: formData.name!.trim(),
      contact: formData.contact!.trim(),
      title: formData.title?.trim() || '',
      phone: formData.phone!.trim(),
      email: formData.email!.trim(),
      taxId: formData.taxId!.trim(),
      address: formData.address!.trim(),
      paymentTerms: formData.paymentTerms!.trim(),
      notes: formData.notes?.trim() || '',
      createdAt: isEditing ? currentCustomer.createdAt : new Date().toISOString(),
    };

    onSaveCustomer(customerToSave);
    showToast(
      'success',
      isEditing ? `客戶「${customerToSave.name}」已成功更新` : `客戶「${customerToSave.name}」已成功新增 (${customerToSave.id})`,
      isEditing ? '更新成功' : '新增成功'
    );
    handleCloseModal();
  };

  return (
    <div id="customer-module-container" className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              客戶管理
            </h2>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
              共 {customers.length} 筆
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            維護客戶資料檔，統編與地址將於開立報價單時自動連動帶入。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="customer-search-input"
              type="text"
              placeholder="搜尋名稱、編號、統編、窗口..."
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
            id="add-customer-btn"
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm shadow-indigo-600/20 transition-colors min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>新增客戶</span>
          </button>
        </div>
      </div>

      {/* Customer List: Table for Tablet/Desktop */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table id="customer-table" className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <th className="py-3.5 px-4 font-mono">客戶代碼</th>
                <th className="py-3.5 px-4">公司名稱</th>
                <th className="py-3.5 px-4">統一編號</th>
                <th className="py-3.5 px-4">聯絡窗口</th>
                <th className="py-3.5 px-4">聯絡電話 / Email</th>
                <th className="py-3.5 px-4">付款條件</th>
                <th className="py-3.5 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm">查無相符的客戶資料</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    id={`customer-row-${cust.id}`}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                      {cust.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      <div>{cust.name}</div>
                      <div className="text-xs text-slate-400 font-normal truncate max-w-xs" title={cust.address}>
                        {cust.address}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {cust.taxId}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      <span className="font-medium">{cust.contact}</span>
                      {cust.title && (
                        <span className="text-xs text-slate-400 ml-1.5 font-normal">({cust.title})</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 text-xs">
                      <div>{cust.phone}</div>
                      <div className="text-slate-400 truncate max-w-[180px]">{cust.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        {cust.paymentTerms}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          id={`btn-view-customer-${cust.id}`}
                          onClick={() => handleOpenDetail(cust)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                          title="查看詳情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          id={`btn-edit-customer-${cust.id}`}
                          onClick={() => handleOpenEdit(cust)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                          title="編輯資料"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          id={`btn-delete-customer-${cust.id}`}
                          onClick={() => onDeleteCustomer(cust.id, cust.name)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                          title="刪除客戶"
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
        {filteredCustomers.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">查無客戶資料</p>
          </div>
        ) : (
          filteredCustomers.map((cust) => (
            <div
              key={cust.id}
              id={`mobile-customer-card-${cust.id}`}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                    {cust.id}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {cust.name}
                  </h3>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  {cust.paymentTerms}
                </span>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">統編：</span>
                  <span className="font-mono">{cust.taxId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">窗口：</span>
                  <span>{cust.contact} {cust.title && `(${cust.title})`}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`tel:${cust.phone}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    {cust.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{cust.email}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <span className="line-clamp-1">{cust.address}</span>
                </div>
              </div>

              {/* Mobile Actions (min touch size 44px) */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenDetail(cust)}
                  className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                >
                  <Eye className="w-4 h-4" />
                  <span>查看</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(cust)}
                  className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100"
                >
                  <Pencil className="w-4 h-4" />
                  <span>編輯</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteCustomer(cust.id, cust.name)}
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
          id="customer-form-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
          onClick={handleCloseModal}
        >
          <div
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 my-8 overflow-hidden animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {modalMode === 'create' ? '新增客戶資料' : '編輯客戶資料'}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    客戶編號：{formData.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl min-w-[40px] min-h-[40px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Row 1: Company Name & Tax ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    公司名稱 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="customer-input-name"
                    type="text"
                    placeholder="例如：聯發半導體科技股份有限公司"
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
                    id="customer-input-taxId"
                    type="text"
                    maxLength={8}
                    placeholder="例如：24891104"
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
                    id="customer-input-contact"
                    type="text"
                    placeholder="例如：陳智遠"
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
                    id="customer-input-title"
                    type="text"
                    placeholder="例如：採購經理 / 研發總監"
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
                    id="customer-input-phone"
                    type="text"
                    placeholder="例如：02-2788-5566 或 0912-345678"
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
                    id="customer-input-email"
                    type="email"
                    placeholder="例如：contact@mediatek-tech.example.tw"
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
                  公司地址 <span className="text-rose-500">*</span>
                </label>
                <input
                  id="customer-input-address"
                  type="text"
                  placeholder="例如：台北市內湖區瑞光路518號7樓"
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
                    id="customer-select-paymentTerms"
                    value={isCustomPayment ? 'custom' : (formData.paymentTerms || '月結30天')}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'custom') {
                        setIsCustomPayment(true);
                        // If current value is from common preset, clear so user can enter custom text
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
                        id="customer-input-paymentTerms-custom"
                        type="text"
                        autoFocus
                        placeholder="請輸入自訂付款條件 (例如：貨到次月15日電匯、簽約預付50%等)"
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
                  id="customer-input-notes"
                  rows={2}
                  placeholder="客戶特性、特殊交貨規範或合作約定..."
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
                  id="customer-submit-btn"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm shadow-indigo-600/20 min-h-[44px]"
                >
                  {modalMode === 'create' ? '確認新增' : '儲存變更'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {modalMode === 'detail' && currentCustomer && (
        <div
          id="customer-detail-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={handleCloseModal}
        >
          <div
            className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {currentCustomer.name}
                  </h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-semibold">
                    客戶編號：{currentCustomer.id}
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
                    {currentCustomer.taxId}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">付款條件</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {currentCustomer.paymentTerms}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">聯絡窗口</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {currentCustomer.contact} {currentCustomer.title && `(${currentCustomer.title})`}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">聯絡電話</span>
                  <a href={`tel:${currentCustomer.phone}`} className="font-mono text-indigo-600 dark:text-indigo-400 hover:underline">
                    {currentCustomer.phone}
                  </a>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-0.5">電子郵件 (Email)</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {currentCustomer.email}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-0.5">公司地址</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {currentCustomer.address}
                </span>
              </div>

              {currentCustomer.notes && (
                <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60">
                  <span className="text-xs text-amber-800 dark:text-amber-300 font-semibold block mb-1">
                    備註說明
                  </span>
                  <p className="text-xs text-amber-900 dark:text-amber-200 whitespace-pre-wrap leading-relaxed">
                    {currentCustomer.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  handleCloseModal();
                  handleOpenEdit(currentCustomer);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 min-h-[44px]"
              >
                編輯此客戶
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
