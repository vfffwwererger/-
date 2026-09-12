import React, { useState } from 'react';
import { CloudSyncStatus } from '../services/neonService';
import { Database, Cloud, RefreshCw, CheckCircle2, AlertCircle, ExternalLink, HelpCircle } from 'lucide-react';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: CloudSyncStatus;
  databaseName?: string;
  onManualSyncToNeon: () => Promise<void>;
  onPullFromNeon: () => Promise<void>;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({
  isOpen,
  onClose,
  status,
  databaseName,
  onManualSyncToNeon,
  onPullFromNeon,
}) => {
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);

  if (!isOpen) return null;

  const handlePush = async () => {
    setIsPushing(true);
    await onManualSyncToNeon();
    setIsPushing(false);
  };

  const handlePull = async () => {
    setIsPulling(true);
    await onPullFromNeon();
    setIsPulling(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="database-status-modal"
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              status.isConnected 
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 border border-amber-200 dark:border-amber-800'
            }`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Neon 雲端資料庫狀態</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">PostgreSQL Serverless 連線監控</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Status Card */}
        <div className="my-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">連線狀態</span>
            {status.isConnected ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                已連線至 Neon
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                <AlertCircle className="w-3.5 h-3.5" />
                {status.errorMessage ? '連線失敗或尚未設定' : '離線模式 (本機儲存)'}
              </span>
            )}
          </div>

          {databaseName && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">資料庫名稱</span>
              <span className="font-mono text-slate-700 dark:text-slate-200 font-semibold">{databaseName}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">上次同步時間</span>
            <span className="text-slate-700 dark:text-slate-200 font-medium">
              {status.lastSyncedAt || '尚未同步'}
            </span>
          </div>

          {status.errorMessage && (
            <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400">
              <p className="font-medium mb-1">連線提示：</p>
              <p className="font-mono text-[11px] break-all">{status.errorMessage}</p>
            </div>
          )}
        </div>

        {/* Instructions if not connected */}
        {!status.isConnected && (
          <div className="mb-5 p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-indigo-900 dark:text-indigo-200">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              如何完成 Vercel 與 Neon 串接？
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 pl-1">
              <li>登入 Neon 複製 <code className="px-1 bg-white dark:bg-slate-900 rounded font-mono text-indigo-600">DATABASE_URL</code></li>
              <li>進入 Vercel 專案 ➔ Settings ➔ Environment Variables</li>
              <li>新增變數名稱 <code className="px-1 bg-white dark:bg-slate-900 rounded font-mono font-bold">DATABASE_URL</code> 並貼上連線字串</li>
              <li>點擊 Redeploy 重新部署即可自動啟用雲端同步！</li>
            </ol>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            type="button"
            onClick={handlePush}
            disabled={isPushing || isPulling}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPushing ? 'animate-spin' : ''}`} />
            <span>{isPushing ? '正在推送中...' : '將本機資料推送到 Neon'}</span>
          </button>

          <button
            type="button"
            onClick={handlePull}
            disabled={isPushing || isPulling}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-50"
          >
            <Cloud className={`w-3.5 h-3.5 ${isPulling ? 'animate-spin' : ''}`} />
            <span>{isPulling ? '正在下載中...' : '從 Neon 下載最新資料'}</span>
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  );
};
