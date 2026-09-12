import React from 'react';
import { ArrowLeft, Printer, Building2, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { Quotation } from '../types';
import { formatCurrency } from '../utils/helpers';

interface QuotationPrintViewProps {
  quotation: Quotation;
  onBack: () => void;
}

// Convert number to Traditional Chinese financial words (大寫中文金額)
function toChineseFinancialNumber(n: number): string {
  if (isNaN(n) || n === 0) return '零元整';
  const digits = ['零', '壹', '貳', '參', '肆', '伍', '陸', '柒', '捌', '玖'];
  const units = ['', '拾', '佰', '仟'];
  const bigUnits = ['', '萬', '億', '兆'];

  let num = Math.floor(Math.abs(n));
  let result = '';
  let bigUnitIdx = 0;

  while (num > 0) {
    const section = num % 10000;
    if (section > 0) {
      let sectionStr = '';
      let temp = section;
      for (let i = 0; i < 4 && temp > 0; i++) {
        const digit = temp % 10;
        if (digit > 0) {
          sectionStr = digits[digit] + units[i] + sectionStr;
        } else if (sectionStr && !sectionStr.startsWith(digits[0])) {
          sectionStr = digits[0] + sectionStr;
        }
        temp = Math.floor(temp / 10);
      }
      result = sectionStr + bigUnits[bigUnitIdx] + result;
    }
    bigUnitIdx++;
    num = Math.floor(num / 10000);
  }

  return '新台幣 ' + result + '元整';
}

export const QuotationPrintView: React.FC<QuotationPrintViewProps> = ({ quotation, onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="quotation-print-container" className="space-y-6">
      {/* Top action toolbar (hidden when printing) */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs print:hidden">
        <button
          type="button"
          id="print-view-back-btn"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回報價列表</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">
            可點擊列印按鈕產生紙本或另存為 PDF 文件
          </span>
          <button
            type="button"
            id="trigger-print-btn"
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm shadow-indigo-600/20 transition-colors min-h-[44px]"
          >
            <Printer className="w-4 h-4" />
            <span>立即列印 / 匯出 PDF</span>
          </button>
        </div>
      </div>

      {/* Formal A4 Document Card */}
      <div
        id="a4-quotation-sheet"
        className="w-full max-w-4xl mx-auto bg-white text-slate-900 p-8 sm:p-12 rounded-2xl sm:border border-slate-300 shadow-lg print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:w-full print:rounded-none"
        style={{ minHeight: '1050px' }}
      >
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-slate-900 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-700 text-white flex items-center justify-center font-bold text-xl print:border print:border-slate-800">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                智創科技股份有限公司
              </h1>
              <p className="text-xs text-slate-600 tracking-wider font-medium">
                INTELLIGENT INNOVATION TECH CO., LTD.
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                統編：83529011 ｜ 電話：02-2345-6789 ｜ 地址：台北市信義區信義路五段7號36樓
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded font-bold text-xs text-slate-800 uppercase tracking-wider mb-1">
              商業正式報價單 (QUOTATION)
            </div>
            <div className="text-xs text-slate-600 font-mono">
              報價單號：<span className="font-bold text-slate-900 text-sm">{quotation.id}</span>
            </div>
            <div className="text-xs text-slate-600 font-mono">
              報價日期：<span className="font-semibold text-slate-900">{quotation.date}</span>
            </div>
          </div>
        </div>

        {/* Customer & Quoter Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 text-xs">
          {/* Customer Box */}
          <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 mb-2.5 flex items-center justify-between">
              <span>買受人（客戶資訊）</span>
              <span className="text-[11px] font-mono text-indigo-700 font-semibold">
                {quotation.customerId}
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-20 text-slate-500 shrink-0">公司名稱：</span>
                <span className="font-bold text-slate-900 text-sm">{quotation.customerName}</span>
              </div>
              <div className="flex">
                <span className="w-20 text-slate-500 shrink-0">統一編號：</span>
                <span className="font-mono font-bold text-slate-800">
                  {quotation.customerTaxId || '未提供'}
                </span>
              </div>
              <div className="flex">
                <span className="w-20 text-slate-500 shrink-0">聯絡窗口：</span>
                <span className="text-slate-800">{quotation.customerContact || '專案負責人'}</span>
              </div>
              <div className="flex">
                <span className="w-20 text-slate-500 shrink-0">交付地址：</span>
                <span className="text-slate-800">{quotation.address}</span>
              </div>
            </div>
          </div>

          {/* Issuer / Sales Rep Box */}
          <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 mb-2.5 flex items-center justify-between">
              <span>出賣人（報價專員）</span>
              <span className="text-[11px] px-2 py-0.2 rounded bg-indigo-100 text-indigo-800 font-medium">
                狀態：{quotation.status}
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-20 text-slate-500 shrink-0">業務窗口：</span>
                <span className="font-bold text-slate-900">{quotation.quoter}</span>
              </div>
              <div className="flex">
                <span className="w-20 text-slate-500 shrink-0">連絡電話：</span>
                <span className="font-mono text-slate-800">{quotation.phone}</span>
              </div>
              <div className="flex">
                <span className="w-20 text-slate-500 shrink-0">電子郵件：</span>
                <span className="font-mono text-slate-800">sales@intelligent-tech.example.tw</span>
              </div>
              <div className="flex">
                <span className="w-20 text-slate-500 shrink-0">有效期限：</span>
                <span className="text-slate-800">開立日起 30 天內有效</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="border border-slate-300 rounded-xl overflow-hidden my-6">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-semibold">
                <th className="py-2.5 px-3 text-center w-10">項次</th>
                <th className="py-2.5 px-3">產品代碼 / 品名</th>
                <th className="py-2.5 px-3">規格與說明</th>
                <th className="py-2.5 px-3 text-center w-14">數量</th>
                <th className="py-2.5 px-3 text-right w-24">單價</th>
                <th className="py-2.5 px-3 text-right w-28 font-bold">複價 (小計)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {quotation.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 text-center font-mono text-slate-500">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{item.productName}</div>
                    <div className="text-[11px] font-mono text-indigo-700">{item.productId}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 whitespace-pre-wrap max-w-xs">
                    {item.spec || '-'}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-semibold text-slate-900">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-700">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Breakdown */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-300 my-6">
          <div className="text-xs text-slate-600 space-y-1 max-w-sm">
            <span className="font-bold text-slate-800 block">中文大寫總額：</span>
            <p className="font-serif font-bold text-slate-900 text-sm">
              {toChineseFinancialNumber(quotation.total)}
            </p>
          </div>

          <div className="w-full sm:w-64 space-y-1.5 text-xs text-slate-700">
            <div className="flex justify-between">
              <span>銷售總額 (未稅)：</span>
              <span className="font-mono font-semibold">{formatCurrency(quotation.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>營業稅 (5%)：</span>
              <span className="font-mono font-semibold">{formatCurrency(quotation.tax)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-300 text-slate-900 font-bold text-sm">
              <span>報價總計 (含稅)：</span>
              <span className="font-mono text-base text-indigo-700">
                {formatCurrency(quotation.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        {quotation.terms && (
          <div className="border border-slate-300 rounded-xl p-4 text-xs text-slate-600 space-y-1 my-6 bg-slate-50/30">
            <span className="font-bold text-slate-800 block">特別交付條件與條款約定：</span>
            <div className="whitespace-pre-wrap leading-relaxed text-slate-700">
              {quotation.terms}
            </div>
          </div>
        )}

        {/* Official Signature & Company Stamp Area */}
        <div className="grid grid-cols-2 gap-8 pt-10 mt-10 border-t border-slate-300 text-xs">
          <div>
            <div className="font-bold text-slate-800 mb-2">客戶確認簽章 (PO 簽回)：</div>
            <div className="h-24 border border-dashed border-slate-300 rounded-xl flex items-end p-2 bg-slate-50/40">
              <span className="text-[11px] text-slate-400">請簽名蓋章並回傳以利安排後續交貨流程</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">日期：____ 年 ____ 月 ____ 日</div>
          </div>

          <div>
            <div className="font-bold text-slate-800 mb-2">出賣人主管覆核蓋章：</div>
            <div className="h-24 border border-dashed border-slate-300 rounded-xl flex items-center justify-center p-2 bg-slate-50/40 relative">
              <div className="w-20 h-20 rounded-full border-2 border-rose-500/40 text-rose-500/50 flex items-center justify-center text-[10px] font-bold rotate-[-12deg]">
                智創科技
                <br />
                報價專用章
              </div>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">日期：{quotation.date}</div>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center text-[10px] text-slate-400 mt-10 pt-4 border-t border-slate-200">
          感謝您的支持與愛護！如有任何規格或報價疑問，歡迎隨時與業務人員聯繫。
        </div>
      </div>
    </div>
  );
};
