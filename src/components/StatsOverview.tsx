import React from 'react';
import {
  Users,
  Package,
  CheckCircle2,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Customer, Product, Quotation, TabType } from '../types';
import { formatCurrency } from '../utils/helpers';

interface StatsOverviewProps {
  customers: Customer[];
  products: Product[];
  quotations: Quotation[];
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  customers,
  products,
  quotations,
  activeTab,
  onSelectTab,
}) => {
  // 1. 合作客戶統計
  const customerCount = customers.length;
  const customersWithQuotations = new Set(quotations.map((q) => q.customerId)).size;

  // 2. 庫存統計
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalInventoryCost = products.reduce(
    (sum, p) => sum + (p.stock || 0) * (p.cost || 0),
    0
  );

  // 3. 成交案件統計
  const closedQuotations = quotations.filter((q) => q.status === '已成交');
  const closedCount = closedQuotations.length;
  const closedRevenue = closedQuotations.reduce((sum, q) => sum + q.total, 0);
  const winRate = quotations.length > 0 ? Math.round((closedCount / quotations.length) * 100) : 0;

  // 4. 報價單總數統計
  const totalQuotationsCount = quotations.length;
  const totalQuotedAmount = quotations.reduce((sum, q) => sum + q.total, 0);
  const pendingCount = quotations.filter((q) => q.status === '待確認').length;

  const stats = [
    {
      id: 'stat-card-customers',
      title: '合作客戶',
      value: `${customerCount} 家`,
      subtext: `${customersWithQuotations} 家有已立案報價往來`,
      icon: Users,
      targetTab: 'customers' as TabType,
      colorClass: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60',
      activeRing: activeTab === 'customers' ? 'ring-2 ring-indigo-500/50' : '',
    },
    {
      id: 'stat-card-inventory',
      title: '庫存統計',
      value: `${totalStock.toLocaleString()} 件`,
      subtext: `全站 ${products.length} 品項 ｜ 總貨值 ${formatCurrency(totalInventoryCost)}`,
      icon: Package,
      targetTab: 'products' as TabType,
      colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60',
      activeRing: activeTab === 'products' ? 'ring-2 ring-emerald-500/50' : '',
    },
    {
      id: 'stat-card-closed-deals',
      title: '成交案件',
      value: `${closedCount} 筆`,
      subtext: `累計成交 ${formatCurrency(closedRevenue)} ｜ 成交率 ${winRate}%`,
      icon: CheckCircle2,
      targetTab: 'quotations' as TabType,
      colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60',
      activeRing: activeTab === 'quotations' ? 'ring-2 ring-amber-500/50' : '',
    },
    {
      id: 'stat-card-total-quotations',
      title: '報價單總數',
      value: `${totalQuotationsCount} 筆`,
      subtext: `總報價金額 ${formatCurrency(totalQuotedAmount)} ｜ 待確認 ${pendingCount} 筆`,
      icon: FileSpreadsheet,
      targetTab: 'quotations' as TabType,
      colorClass: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60',
      activeRing: activeTab === 'quotations' ? 'ring-2 ring-sky-500/50' : '',
    },
  ];

  return (
    <section id="system-stats-overview" className="mb-6 print:hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              id={item.id}
              onClick={() => onSelectTab(item.targetTab)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectTab(item.targetTab);
                }
              }}
              className={`group relative bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200 cursor-pointer overflow-hidden ${item.activeRing}`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
                  {item.title}
                </span>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${item.colorClass}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-1 flex items-baseline justify-between">
                <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
                  {item.value}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 truncate" title={item.subtext}>
                {item.subtext}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
