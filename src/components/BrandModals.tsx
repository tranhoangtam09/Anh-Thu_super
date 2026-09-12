import React, { useState } from 'react';
import contentData from '../data/contentData.json';
import {
  X,
  Smartphone,
  Sparkles,
  MapPin,
  Gift,
  PhoneCall,
  ExternalLink,
  CheckCircle2,
  Download,
  Building,
  Clock,
  RotateCcw,
  Trophy,
} from 'lucide-react';

interface BrandModalsProps {
  activeModal: 'ipay' | 'products' | 'pgd' | 'minigame' | null;
  onClose: () => void;
}

export const BrandModals: React.FC<BrandModalsProps> = ({ activeModal, onClose }) => {
  const { modals, brand } = contentData;
  const [spinning, setSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<string | null>(null);

  if (!activeModal) return null;

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setWonPrize(null);
    setTimeout(() => {
      const prizes = modals.minigame.prizes;
      const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
      setWonPrize(randomPrize.name);
      setSpinning(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#003B70] via-[#005596] to-[#005596] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              {activeModal === 'ipay' && <Smartphone className="w-4 h-4" />}
              {activeModal === 'products' && <Sparkles className="w-4 h-4" />}
              {activeModal === 'pgd' && <MapPin className="w-4 h-4" />}
              {activeModal === 'minigame' && <Gift className="w-4 h-4" />}
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                {activeModal === 'ipay' && modals.ipay.title}
                {activeModal === 'products' && modals.products.title}
                {activeModal === 'pgd' && modals.pgd.title}
                {activeModal === 'minigame' && modals.minigame.title}
              </h3>
              <p className="text-xs text-sky-200">
                {activeModal === 'ipay' && modals.ipay.subtitle}
                {activeModal === 'products' && modals.products.subtitle}
                {activeModal === 'pgd' && modals.pgd.subtitle}
                {activeModal === 'minigame' && modals.minigame.subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto text-sm text-slate-700 space-y-4">
          {/* 1. Hướng dẫn iPay */}
          {activeModal === 'ipay' && (
            <div className="space-y-4">
              <div className="p-4 bg-sky-50 rounded-xl border border-sky-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#005596] text-white flex items-center justify-center shrink-0">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Ứng dụng VietinBank iPay Mobile</h4>
                  <p className="text-xs text-slate-600">Trải nghiệm hơn 150+ tiện ích ngân hàng số vượt trội</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-xs uppercase tracking-wider text-[#005596] block">
                  Tính năng nổi bật:
                </span>
                <ul className="space-y-2 text-xs">
                  {modals.ipay.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-500">
                  Hotline hỗ trợ VietinBank: <strong>{modals.ipay.hotline}</strong>
                </span>
                <a
                  href="https://www.vietinbank.vn/vn/ca-nhan/ngan-hang-so/vietinbank-ipay"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-[#005596] hover:bg-[#003B70] text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Tìm hiểu thêm tại Website</span>
                </a>
              </div>
            </div>
          )}

          {/* 2. Sản phẩm nổi bật */}
          {activeModal === 'products' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {modals.products.list.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-sky-50/30 transition-colors space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-sky-100 text-[#005596]">
                        {item.tag}
                      </span>
                      <span className="text-xs font-bold text-rose-600 font-mono">
                        {item.rate}
                      </span>
                    </div>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                      {item.title}
                    </h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Quick Consultant contact */}
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">
                    Tư vấn miễn phí tại Bạc Liêu: {brand.consultant.name}
                  </span>
                  <span className="text-slate-500">Hotline: {brand.consultant.formattedPhone}</span>
                </div>
                <a
                  href={brand.consultant.callUrl}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Gọi ngay</span>
                </a>
              </div>
            </div>
          )}

          {/* 3. Mạng lưới PGD Bạc Liêu */}
          {activeModal === 'pgd' && (
            <div className="space-y-4">
              {/* Headquarters */}
              <div className="p-4 bg-sky-50/80 rounded-xl border border-sky-100 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-[#005596]" />
                    <span>{modals.pgd.headquarters.name}</span>
                  </h4>
                  <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-medium">
                    Hội sở chính
                  </span>
                </div>
                <p className="text-xs text-slate-700 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{modals.pgd.headquarters.address}</span>
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                  <span>Điện thoại: <strong>{modals.pgd.headquarters.phone}</strong></span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{modals.pgd.headquarters.hours}</span>
                  </span>
                </div>
              </div>

              {/* Sub Branches */}
              <div className="space-y-2">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-500 block">
                  Các Phòng Giao Dịch trực thuộc:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {modals.pgd.subBranches.map((pgd, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                      <h5 className="font-bold text-slate-800">{pgd.name}</h5>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{pgd.address}</p>
                      <p className="text-[11px] text-[#005596] font-mono font-semibold">{pgd.phone}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consultant Card */}
              <div className="p-3.5 bg-slate-900 text-white rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-sky-300 uppercase tracking-wider block">
                    Cán bộ tín dụng & tiền gửi phụ trách
                  </span>
                  <h4 className="font-bold text-sm text-white">
                    {brand.consultant.name} ({brand.consultant.formattedPhone})
                  </h4>
                  <p className="text-xs text-slate-300">VietinBank Chi Nhánh Bạc Liêu</p>
                </div>
                <a
                  href={brand.consultant.zaloUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 bg-[#005596] hover:bg-sky-600 text-white font-bold rounded-lg text-xs transition-colors"
                >
                  Chat Zalo
                </a>
              </div>
            </div>
          )}

          {/* 4. Mini Game Nhận Quà */}
          {activeModal === 'minigame' && (
            <div className="space-y-4 text-center py-2">
              <div className="max-w-md mx-auto space-y-2">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-lg shadow-rose-500/20">
                  <Gift className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">
                  Quay Số Trúng Quà VietinBank Bạc Liêu
                </h4>
                <p className="text-xs text-slate-600">
                  Dành cho quý khách hàng trải nghiệm công cụ tính lãi suất và đăng ký dịch vụ tại Chi nhánh Bạc Liêu.
                </p>
              </div>

              {/* Spinning action area */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/90 max-w-sm mx-auto space-y-4">
                {wonPrize ? (
                  <div className="space-y-2 animate-scaleUp">
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
                      Chúc mừng bạn đã trúng:
                    </span>
                    <div className="text-base font-extrabold text-slate-900 p-2 bg-white rounded-lg border border-emerald-200">
                      {wonPrize}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Vui lòng liên hệ chuyên viên <strong>{brand.consultant.name}</strong> ({brand.consultant.formattedPhone}) để nhận quà tại PGD gần nhất!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-500 block">
                      Giải thưởng: Áo mưa, Mũ bảo hiểm, Bình giữ nhiệt Lock&Lock, Voucher lãi suất...
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSpin}
                  disabled={spinning}
                  className={`w-full py-3 px-6 rounded-xl font-bold text-sm text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                    spinning
                      ? 'bg-slate-400 cursor-wait'
                      : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-rose-600/25'
                  }`}
                >
                  <RotateCcw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
                  <span>{spinning ? 'Đang quay số...' : wonPrize ? 'Quay lại lần nữa' : 'Bắt đầu quay quà'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
