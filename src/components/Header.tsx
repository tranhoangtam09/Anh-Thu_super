import React from 'react';
import contentData from '../data/contentData.json';
import {
  Landmark,
  ShieldCheck,
  Sparkles,
  PhoneCall,
  MessageCircle,
  Calculator,
  Coins,
  Smartphone,
  MapPin,
  Gift,
  Building2,
  RefreshCw,
  ArrowLeftRight,
} from 'lucide-react';

interface HeaderProps {
  currentModule: 'savings' | 'loan' | 'forex';
  onSelectModule: (module: 'savings' | 'loan' | 'forex') => void;
  onOpenModal: (modal: 'ipay' | 'products' | 'pgd' | 'minigame') => void;
  onReset?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentModule,
  onSelectModule,
  onOpenModal,
  onReset,
}) => {
  const { brand } = contentData;
  const { consultant } = brand;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs backdrop-blur-md bg-white/98">
      {/* 1. Top Consultant Bar matching PDF 2 requirements */}
      <div className="bg-[#003B70] text-white text-xs px-4 sm:px-6 lg:px-8 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-200">
            {consultant.title}: <strong className="text-white font-bold">{consultant.name}</strong>
          </span>
          <span className="text-sky-300 font-mono font-bold">
            - {consultant.formattedPhone}
          </span>
          <span className="hidden md:inline-block text-slate-300 text-[11px]">
            ({brand.branchName})
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={consultant.callUrl}
            className="inline-flex items-center gap-1 text-sky-200 hover:text-white transition-colors"
          >
            <PhoneCall className="w-3 h-3 text-emerald-400" />
            <span>Gọi tư vấn</span>
          </a>
          <span className="text-white/30">|</span>
          <a
            href={consultant.zaloUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sky-200 hover:text-white transition-colors"
          >
            <MessageCircle className="w-3 h-3 text-sky-300" />
            <span>Chat Zalo</span>
          </a>
        </div>
      </div>

      {/* 2. Main Brand & Navigation Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Bank Logo & Title */}
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-auto flex items-center shrink-0">
              <img
                src={contentData.media.logo}
                alt="VietinBank Logo"
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = contentData.media.fallbackLogo;
                }}
              />
            </div>

            <div className="border-l border-slate-200 pl-3.5">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold text-[#005596] tracking-tight">
                  {brand.branchName}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
                  {brand.slogan}
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">
                {contentData.header.title}
              </p>
            </div>
          </div>

          {/* Action on mobile: Reset if needed */}
          {onReset && currentModule === 'savings' && (
            <div className="lg:hidden flex justify-end">
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{contentData.calculator.actions.reset}</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. Navigation Bar matching PDF 2 layout */}
        <nav className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {/* Tab 1: Tính lãi vay (Active by default or toggle) */}
          <button
            type="button"
            onClick={() => onSelectModule('loan')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              currentModule === 'loan'
                ? 'bg-[#005596] text-white shadow-xs shadow-[#005596]/30'
                : 'text-slate-600 hover:text-[#005596] hover:bg-sky-50/60'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Tính lãi vay</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
              currentModule === 'loan' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-700'
            }`}>
              Mới
            </span>
          </button>

          {/* Tab 2: Tính lãi tiết kiệm */}
          <button
            type="button"
            onClick={() => onSelectModule('savings')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              currentModule === 'savings'
                ? 'bg-[#005596] text-white shadow-xs shadow-[#005596]/30'
                : 'text-slate-600 hover:text-[#005596] hover:bg-sky-50/60'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Tính lãi tiết kiệm</span>
          </button>

          {/* Tab 3: Mua bán ngoại tệ */}
          <button
            type="button"
            onClick={() => onSelectModule('forex')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              currentModule === 'forex'
                ? 'bg-[#005596] text-white shadow-xs shadow-[#005596]/30'
                : 'text-slate-600 hover:text-[#005596] hover:bg-sky-50/60'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Mua bán ngoại tệ</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
              currentModule === 'forex' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-700'
            }`}>
              Tỷ giá
            </span>
          </button>

          <span className="text-slate-200 px-1">|</span>

          {/* Nav 3: Hướng dẫn iPay */}
          <button
            type="button"
            onClick={() => onOpenModal('ipay')}
            className="px-3 py-2 rounded-xl font-medium text-slate-600 hover:text-[#005596] hover:bg-sky-50/60 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#005596]" />
            <span>Hướng dẫn iPay</span>
          </button>

          {/* Nav 4: Sản phẩm nổi bật (Hot badge) */}
          <button
            type="button"
            onClick={() => onOpenModal('products')}
            className="px-3 py-2 rounded-xl font-medium text-slate-600 hover:text-[#005596] hover:bg-sky-50/60 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Sản phẩm nổi bật</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-rose-500 text-white">
              Hot
            </span>
          </button>

          {/* Nav 5: Mạng lưới PGD */}
          <button
            type="button"
            onClick={() => onOpenModal('pgd')}
            className="px-3 py-2 rounded-xl font-medium text-slate-600 hover:text-[#005596] hover:bg-sky-50/60 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mạng lưới PGD</span>
          </button>

          {/* Nav 6: Mini Game Nhận Quà (Quà tặng badge) */}
          <button
            type="button"
            onClick={() => onOpenModal('minigame')}
            className="px-3 py-2 rounded-xl font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50/60 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
          >
            <Gift className="w-3.5 h-3.5 text-rose-500" />
            <span>Mini Game Nhận Quà</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-500 text-white">
              Quà tặng
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
};
