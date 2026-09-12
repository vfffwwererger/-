import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Building2,
  Tag,
  DollarSign,
  Layers,
  Image as ImageIcon,
  Eye,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Upload,
  TrendingUp,
} from 'lucide-react';
import { Product, Vendor } from '../types';
import { formatCurrency, generateNextProductId } from '../utils/helpers';

interface ProductModuleProps {
  products: Product[];
  vendors: Vendor[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (id: string, name: string) => void;
  showToast: (type: 'success' | 'error' | 'info', message: string, title?: string) => void;
}

type ModalMode = 'create' | 'edit' | 'detail' | null;

interface FormErrors {
  name?: string;
  vendorName?: string;
  cost?: string;
  price?: string;
  stock?: string;
}

export const ProductModule: React.FC<ProductModuleProps> = ({
  products,
  vendors,
  onSaveProduct,
  onDeleteProduct,
  showToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendorFilter, setSelectedVendorFilter] = useState('ALL');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    vendorId: '',
    vendorName: '',
    cost: 0,
    price: 0,
    stock: 0,
    brand: '',
    spec: '',
    description: '',
    image: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesVendor =
        selectedVendorFilter === 'ALL' || p.vendorName === selectedVendorFilter;
      if (!matchesVendor) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(term) ||
        p.id.toLowerCase().includes(term) ||
        (p.brand && p.brand.toLowerCase().includes(term)) ||
        (p.spec && p.spec.toLowerCase().includes(term)) ||
        (p.vendorName && p.vendorName.toLowerCase().includes(term))
      );
    });
  }, [products, searchTerm, selectedVendorFilter]);

  // Open Create Modal
  const handleOpenCreate = () => {
    const nextId = generateNextProductId(products);
    const defaultVendor = vendors.length > 0 ? vendors[0] : null;

    setCurrentProduct(null);
    setFormData({
      id: nextId,
      name: '',
      vendorId: defaultVendor ? defaultVendor.id : '',
      vendorName: defaultVendor ? defaultVendor.name : '',
      cost: 0,
      price: 0,
      stock: 0,
      brand: '',
      spec: '',
      description: '',
      image: '',
    });
    setErrors({});
    setModalMode('create');
  };

  // Open Edit Modal
  const handleOpenEdit = (product: Product) => {
    setCurrentProduct(product);
    setFormData({ ...product });
    setErrors({});
    setModalMode('edit');
  };

  // Open Detail Modal
  const handleOpenDetail = (product: Product) => {
    setCurrentProduct(product);
    setModalMode('detail');
  };

  // Close Modal
  const handleCloseModal = () => {
    setModalMode(null);
    setCurrentProduct(null);
    setErrors({});
  };

  // Image Upload handler (Base64 file reader)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', '請選擇有效的圖片檔案 (JPG, PNG, WebP)', '檔案格式不符');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('error', '圖片大小請小於 2MB', '檔案過大');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = '請輸入產品名稱 (必填)';
    }

    if (formData.cost === undefined || isNaN(formData.cost) || formData.cost < 0) {
      newErrors.cost = '成本必須為大於或等於 0 之數值 (必填)';
    }

    if (formData.price === undefined || isNaN(formData.price) || formData.price < 0) {
      newErrors.price = '售價必須為大於或等於 0 之數值 (必填)';
    }

    if (formData.stock !== undefined && (isNaN(formData.stock) || formData.stock < 0)) {
      newErrors.stock = '庫存數量不可為負數';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('error', '表單中有欄位不符合規範，請檢查紅字標示處。', '儲存失敗');
      return;
    }

    const isEditing = modalMode === 'edit' && currentProduct;
    const productToSave: Product = {
      id: isEditing ? currentProduct.id : generateNextProductId(products),
      name: formData.name!.trim(),
      vendorId: formData.vendorId || '',
      vendorName: formData.vendorName || (vendors.length > 0 ? vendors[0].name : '無指定供應商'),
      cost: Number(formData.cost) || 0,
      price: Number(formData.price) || 0,
      stock: Number(formData.stock) || 0,
      brand: formData.brand?.trim() || '',
      spec: formData.spec?.trim() || '',
      description: formData.description?.trim() || '',
      image: formData.image || '',
      createdAt: isEditing ? currentProduct.createdAt : new Date().toISOString(),
    };

    onSaveProduct(productToSave);
    showToast(
      'success',
      isEditing ? `產品「${productToSave.name}」已更新完成` : `產品「${productToSave.name}」已成功新增 (${productToSave.id})`,
      isEditing ? '更新成功' : '新增成功'
    );
    handleCloseModal();
  };

  return (
    <div id="product-module-container" className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              產品管理
            </h2>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
              共 {products.length} 項
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            建置產品料號、售價與供應商連動，建立之項目將自動在報價單中供動態選購。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Vendor Filter Dropdown */}
          <select
            id="product-vendor-filter"
            value={selectedVendorFilter}
            onChange={(e) => setSelectedVendorFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">全部供應商 ({vendors.length})</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.name}>
                {v.name}
              </option>
            ))}
          </select>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="product-search-input"
              type="text"
              placeholder="搜尋名稱、型號、廠牌..."
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
            id="add-product-btn"
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm shadow-indigo-600/20 transition-colors min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>新增產品</span>
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table id="product-table" className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <th className="py-3.5 px-4 font-mono">產品代碼</th>
                <th className="py-3.5 px-4">產品資訊</th>
                <th className="py-3.5 px-4">供應商</th>
                <th className="py-3.5 px-4 text-right">進貨成本</th>
                <th className="py-3.5 px-4 text-right">銷售單價</th>
                <th className="py-3.5 px-4 text-center">庫存</th>
                <th className="py-3.5 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <Package className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm">查無相符的產品品項</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const margin = prod.price - prod.cost;
                  const marginPercent = prod.price > 0 ? Math.round((margin / prod.price) * 100) : 0;

                  return (
                    <tr
                      key={prod.id}
                      id={`product-row-${prod.id}`}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                        {prod.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {prod.image ? (
                            <img
                              src={prod.image}
                              alt={prod.name}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {prod.name}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                              {prod.brand && (
                                <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded font-medium text-slate-600 dark:text-slate-300">
                                  {prod.brand}
                                </span>
                              )}
                              <span className="truncate max-w-xs">{prod.spec || '標準規格'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        <div className="text-xs font-medium max-w-[160px] truncate" title={prod.vendorName}>
                          {prod.vendorName}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-500 text-xs">
                        {formatCurrency(prod.cost)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900 dark:text-white">
                        <div>{formatCurrency(prod.price)}</div>
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-normal">
                          毛利率 {marginPercent}%
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center font-mono text-xs px-2 py-0.5 rounded-full font-medium ${
                            prod.stock > 10
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : prod.stock > 0
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {prod.stock} 件
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            id={`btn-view-product-${prod.id}`}
                            onClick={() => handleOpenDetail(prod)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                            title="查看詳情"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            id={`btn-edit-product-${prod.id}`}
                            onClick={() => handleOpenEdit(prod)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                            title="編輯產品"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            id={`btn-delete-product-${prod.id}`}
                            onClick={() => onDeleteProduct(prod.id, prod.name)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                            title="刪除產品"
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

      {/* Mobile Cards */}
      <div className="md:hidden grid grid-cols-1 gap-3.5">
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">查無產品品項</p>
          </div>
        ) : (
          filteredProducts.map((prod) => {
            const margin = prod.price - prod.cost;
            const marginPercent = prod.price > 0 ? Math.round((margin / prod.price) * 100) : 0;

            return (
              <div
                key={prod.id}
                id={`mobile-product-card-${prod.id}`}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-start gap-3">
                  {prod.image ? (
                    <img
                      src={prod.image}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        {prod.id}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        庫存 {prod.stock}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                      {prod.name}
                    </h3>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {prod.brand ? `[${prod.brand}] ` : ''}{prod.spec || '標準規格'}
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">供應商</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[140px] block">
                      {prod.vendorName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px]">售價 (毛利 {marginPercent}%)</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                      {formatCurrency(prod.price)}
                    </span>
                  </div>
                </div>

                {/* Mobile Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(prod)}
                    className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                  >
                    <Eye className="w-4 h-4" />
                    <span>查看</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(prod)}
                    className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100"
                  >
                    <Pencil className="w-4 h-4" />
                    <span>編輯</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteProduct(prod.id, prod.name)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100"
                    aria-label="刪除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Form Modal */}
      {(modalMode === 'create' || modalMode === 'edit') && (
        <div
          id="product-form-modal"
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
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {modalMode === 'create' ? '新增產品資料' : '編輯產品資料'}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    產品代碼：{formData.id}
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
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  產品名稱 <span className="text-rose-500">*</span>
                </label>
                <input
                  id="product-input-name"
                  type="text"
                  placeholder="例如：工業級邊緣運算 AI 推論主機"
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

              {/* Vendor Selector (linked to Vendor Management) & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    供應商 <span className="text-indigo-600 dark:text-indigo-400 font-normal">(連動廠商管理)</span>
                  </label>
                  <select
                    id="product-select-vendor"
                    value={formData.vendorName || ''}
                    onChange={(e) => {
                      const selected = vendors.find((v) => v.name === e.target.value);
                      setFormData({
                        ...formData,
                        vendorName: e.target.value,
                        vendorId: selected ? selected.id : '',
                      });
                    }}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {vendors.length === 0 ? (
                      <option value="">請先至「廠商管理」建立廠商資料</option>
                    ) : (
                      vendors.map((v) => (
                        <option key={v.id} value={v.name}>
                          {v.name} ({v.id})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    廠牌 <span className="text-slate-400 font-normal">(選填)</span>
                  </label>
                  <input
                    id="product-input-brand"
                    type="text"
                    placeholder="例如：Advantech / ASUS / 自製"
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800"
                  />
                </div>
              </div>

              {/* Pricing: Cost, Price, Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    進貨成本 * <span className="text-slate-400 font-normal">(NT$)</span>
                  </label>
                  <input
                    id="product-input-cost"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={formData.cost ?? ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setFormData({ ...formData, cost: isNaN(val) ? 0 : val });
                      if (errors.cost) setErrors({ ...errors, cost: undefined });
                    }}
                    className={`w-full px-3 py-2 text-sm font-mono rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                      errors.cost ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500'
                    }`}
                  />
                  {errors.cost && <p className="text-[11px] text-rose-500 mt-1">{errors.cost}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    銷售單價 * <span className="text-slate-400 font-normal">(NT$)</span>
                  </label>
                  <input
                    id="product-input-price"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={formData.price ?? ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setFormData({ ...formData, price: isNaN(val) ? 0 : val });
                      if (errors.price) setErrors({ ...errors, price: undefined });
                    }}
                    className={`w-full px-3 py-2 text-sm font-mono rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                      errors.price ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500'
                    }`}
                  />
                  {errors.price && <p className="text-[11px] text-rose-500 mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    庫存數量 <span className="text-slate-400 font-normal">(選填，預設0)</span>
                  </label>
                  <input
                    id="product-input-stock"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={formData.stock ?? ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setFormData({ ...formData, stock: isNaN(val) ? 0 : val });
                      if (errors.stock) setErrors({ ...errors, stock: undefined });
                    }}
                    className={`w-full px-3 py-2 text-sm font-mono rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                      errors.stock ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500'
                    }`}
                  />
                </div>
              </div>

              {/* Spec & Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  規格 (尺寸 / 型號) <span className="text-slate-400 font-normal">(選填)</span>
                </label>
                <input
                  id="product-input-spec"
                  type="text"
                  placeholder="例如：EPC-S201 / Intel i7 / 32GB RAM / 1TB NVMe"
                  value={formData.spec || ''}
                  onChange={(e) => setFormData({ ...formData, spec: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  商品詳細說明 <span className="text-slate-400 font-normal">(選填，報價單將自動帶入此預設說明)</span>
                </label>
                <textarea
                  id="product-input-description"
                  rows={2}
                  placeholder="產品功能特性、耐溫規格、認證標準等詳細介紹..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Image URL & Upload Preview */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  產品圖片 <span className="text-slate-400 font-normal">(選填，支援圖片網址或本機上傳)</span>
                </label>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <input
                    id="product-input-image-url"
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image || ''}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 min-h-[40px]">
                      <Upload className="w-3.5 h-3.5" />
                      <span>上傳圖檔</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>

                    {formData.image && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: '' })}
                        className="text-xs text-rose-500 hover:underline p-1"
                      >
                        清除圖片
                      </button>
                    )}
                  </div>
                </div>

                {formData.image && (
                  <div className="mt-2 flex items-center gap-3 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 w-fit">
                    <img
                      src={formData.image}
                      alt="預覽"
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                    />
                    <span className="text-xs text-slate-500">圖片預覽正常</span>
                  </div>
                )}
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
                  id="product-submit-btn"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm shadow-indigo-600/20 min-h-[44px]"
                >
                  {modalMode === 'create' ? '確認新增' : '儲存變更'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {modalMode === 'detail' && currentProduct && (
        <div
          id="product-detail-modal"
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
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {currentProduct.name}
                  </h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-semibold">
                    產品代碼：{currentProduct.id}
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

            <div className="mt-5 space-y-4 text-sm">
              {currentProduct.image && (
                <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <img
                    src={currentProduct.image}
                    alt={currentProduct.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">銷售定價</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-base">
                    {formatCurrency(currentProduct.price)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">進貨成本</span>
                  <span className="font-mono text-slate-600 dark:text-slate-300">
                    {formatCurrency(currentProduct.cost)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">在庫存量</span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {currentProduct.stock} 件
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">供應廠商</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {currentProduct.vendorName}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">廠牌品牌</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {currentProduct.brand || '無特別標記'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-0.5">規格型號</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {currentProduct.spec || '標準規格'}
                </span>
              </div>

              {currentProduct.description && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-xs text-slate-500 font-semibold block mb-1">
                    產品詳細說明
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {currentProduct.description}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  handleCloseModal();
                  handleOpenEdit(currentProduct);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 min-h-[44px]"
              >
                編輯此產品
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
