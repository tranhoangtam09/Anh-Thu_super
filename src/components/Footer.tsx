import React from 'react';
import contentData from '../data/contentData.json';
import { ShieldCheck, Info } from 'lucide-react';

export const Footer: React.FC = () => {
  const { footer } = contentData;

  return (
    <footer className="mt-12 border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{footer.disclaimer}</p>
        </div>
        <div className="flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-slate-600 font-medium">{footer.regulatoryNote}</p>
        </div>
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between text-slate-400 text-[11px] gap-2">
          <span>Hệ thống tính toán tiền gửi tiết kiệm trả sau &bull; Ngân hàng &bull; Tài chính số</span>
          <span>Cập nhật theo biểu lãi suất hiện hành</span>
        </div>
      </div>
    </footer>
  );
};
