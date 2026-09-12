import React from 'react';
import contentData from '../data/contentData.json';
import { ShieldCheck, Info, Building2, Phone, MapPin, UserCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const { footer, brand } = contentData;

  return (
    <footer className="mt-14 border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        {/* Branch & Consultant info block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-slate-100 text-slate-600">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Building2 className="w-4 h-4 text-[#005596]" />
              <span>{brand.branchName}</span>
            </div>
            <p className="text-[11px] text-slate-500 flex items-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>{brand.address}</span>
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>{brand.consultant.title}: {brand.consultant.name}</span>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Hotline/Zalo: <strong>{brand.consultant.formattedPhone}</strong></span>
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <img
                src={contentData.media.logo}
                alt="VietinBank"
                className="h-6 w-auto object-contain"
              />
              <span className="font-bold text-slate-800">{brand.bankName}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {brand.slogan} &bull; Hotline toàn quốc: 1900 558 868
            </p>
          </div>
        </div>

        {/* Disclaimer & regulations */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{footer.disclaimer}</p>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-slate-600 font-medium">{footer.regulatoryNote}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between text-slate-400 text-[11px] gap-2">
          <span>&copy; {new Date().getFullYear()} {brand.bankName} &bull; {brand.branchName}</span>
          <span>Cổng tiện ích tính lãi tiền gửi &amp; lãi vay chuẩn nghiệp vụ ngân hàng</span>
        </div>
      </div>
    </footer>
  );
};
