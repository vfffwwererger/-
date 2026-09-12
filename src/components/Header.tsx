import React, { useState } from 'react';
import {
  Users,
  Building2,
  Package,
  FileSpreadsheet,
  Menu,
  X,
  RotateCcw,
  BadgeCheck,
  Database,
} from 'lucide-react';
import { TabType } from '../types';
import { CloudSyncStatus } from '../services/neonService';

interface HeaderProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  onResetData: () => void;
  dbStatus?: CloudSyncStatus;
  onOpenDbModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onResetData,
  dbStatus,
  onOpenDbModal,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'customers', label: '客戶管理', icon: Users },
    { id: 'vendors', label: '廠商管理', icon: Building2 },
    { id: 'products', label: '產品管理', icon: Package },
    { id: 'quotations', label: '報價單管理', icon: FileSpreadsheet },
  ];

  const handleSelectTab = (tab: TabType) => {
    onTabChange(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      id="main-header"
      className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors print:hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  企業報價與進銷協同管理系統
                </h1>
                <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800/60">
                  <BadgeCheck className="w-3 h-3" />
                  RWD 純前端
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Quotation & Supply Collaboration Management System
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav id="desktop-nav" className="hidden md:flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  type="button"
                  onClick={() => handleSelectTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions & Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            {onOpenDbModal && (
              <button
                type="button"
                id="neon-db-status-btn"
                onClick={onOpenDbModal}
                title="Neon 雲端資料庫狀態"
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-colors min-h-[44px] ${
                  dbStatus?.isConnected
                    ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                    : 'border-amber-300 dark:border-amber-700 bg-amber-50/80 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 hover:bg-amber-100'
                }`}
              >
                <Database className={`w-4 h-4 ${dbStatus?.isConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} />
                <span>
                  {dbStatus?.isConnected ? 'Neon 已連線' : 'Neon 資料庫'}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    dbStatus?.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
              </button>
            )}

            <button
              type="button"
              id="reset-sample-data-btn"
              onClick={onResetData}
              title="重設範例資料"
              className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-800 bg-white dark:bg-slate-800 transition-colors min-h-[44px]"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">重設範例</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              id="mobile-menu-toggle-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
              aria-label={isMobileMenuOpen ? '關閉選單' : '開啟選單'}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu-dropdown"
          className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-5 shadow-xl transition-all"
        >
          <div className="grid grid-cols-1 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`mobile-tab-btn-${tab.id}`}
                  type="button"
                  onClick={() => handleSelectTab(tab.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-medium min-h-[44px] transition-colors ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            {onOpenDbModal && (
              <button
                type="button"
                onClick={() => {
                  onOpenDbModal();
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between w-full px-4 py-3 mt-2 rounded-xl text-sm font-semibold border min-h-[44px] transition-colors ${
                  dbStatus?.isConnected
                    ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200'
                    : 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Database className="w-5 h-5" />
                  <span>Neon 雲端資料庫狀態</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 border font-mono">
                  {dbStatus?.isConnected ? '已連線' : '未連線'}
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
