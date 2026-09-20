import { useState } from 'react';
import contentData from './data/contentData.json';
import { Header } from './components/Header';
import { DepositCalculator } from './components/DepositCalculator';
import { LoanCalculator } from './components/LoanCalculator';
import { ForexTrading } from './components/ForexTrading';
import { PledgeLoanCalculator } from './components/PledgeLoanCalculator';
import { BusinessRulesCard } from './components/BusinessRulesCard';
import { TermComparison } from './components/TermComparison';
import { BrandModals } from './components/BrandModals';
import { Footer } from './components/Footer';
import { ReferenceRateItem } from './types';
import {
  Calculator,
  BookOpen,
  BarChart3,
  HelpCircle,
  Coins,
  ShieldCheck,
  TrendingDown,
  Building2,
  Sparkles,
  PhoneCall,
  ArrowLeftRight,
} from 'lucide-react';

export default function App() {
  // Current primary module: 'loan' vs 'savings' vs 'forex' vs 'pledge'
  const [currentModule, setCurrentModule] = useState<'loan' | 'savings' | 'forex' | 'pledge'>('pledge');

  // Modal state for brand navigation items
  const [activeModal, setActiveModal] = useState<'ipay' | 'products' | 'pgd' | 'minigame' | null>(null);

  // Savings specific state
  const [selectedTermId, setSelectedTermId] = useState<string>('12m');
  const [activeSavingsView, setActiveSavingsView] = useState<'all' | 'compare' | 'rules'>('all');
  const [calculatorKey, setCalculatorKey] = useState<number>(1);
  const [currentDepositAmount, setCurrentDepositAmount] = useState<number>(100000000);

  const handleResetSavings = () => {
    setSelectedTermId('12m');
    setCurrentDepositAmount(100000000);
    setCalculatorKey((k) => k + 1);
  };

  const handleSelectBenchmarkTerm = (item: ReferenceRateItem) => {
    setSelectedTermId(item.id);
    const calcElement = document.getElementById('calculator-section');
    if (calcElement) {
      calcElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      {/* Top Header with VietinBank branding, consultant contact & navigation */}
      <Header
        currentModule={currentModule}
        onSelectModule={(mod) => setCurrentModule(mod)}
        onOpenModal={(modal) => setActiveModal(modal)}
        onReset={handleResetSavings}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Module Switcher & Hero Banner */}
        <div className="bg-gradient-to-r from-[#002D54] via-[#005596] to-[#003B70] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-sky-400/10 to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-xs">
                VIETINBANK CHI NHÁNH BẠC LIÊU
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-sky-100 border border-white/20">
                {currentModule === 'loan' ? (
                  <>
                    <Calculator className="w-3.5 h-3.5 text-amber-300" />
                    <span>Tiện ích tính lãi vay dư nợ giảm dần</span>
                  </>
                ) : currentModule === 'savings' ? (
                  <>
                    <Coins className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Tiện ích tính lãi tiết kiệm trả sau</span>
                  </>
                ) : currentModule === 'forex' ? (
                  <>
                    <ArrowLeftRight className="w-3.5 h-3.5 text-amber-300" />
                    <span>Tiện ích quy đổi & tra cứu tỷ giá ngoại tệ</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                    <span>Mô phỏng khoản vay cầm cố sổ tiết kiệm</span>
                  </>
                )}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
              {currentModule === 'loan'
                ? 'Bảng Tính Lãi Suất Vay Trả Góp Dư Nợ Giảm Dần'
                : currentModule === 'savings'
                ? contentData.header.title
                : currentModule === 'forex'
                ? 'Tra Cứu Tỷ Giá & Quy Đổi Ngoại Tệ Trực Tuyến'
                : 'Mô Phỏng Khoản Vay Cầm Cố Sổ Tiết Kiệm'}
            </h2>

            <p className="mt-2.5 text-sm sm:text-base text-sky-100/90 leading-relaxed max-w-2xl">
              {currentModule === 'loan'
                ? contentData.loanCalculator.subtitle
                : currentModule === 'savings'
                ? contentData.header.subtitle
                : currentModule === 'forex'
                ? 'Tiện ích quy đổi tỷ giá hối đoái ngoại tệ, tra cứu biểu giá mua bán tiền mặt và chuyển khoản 18 đồng ngoại tệ niêm yết chính thức tại VietinBank.'
                : 'Tự động tính toán hạn mức vay tối đa theo tỷ lệ giá trị sổ, số tiền trả nợ định kỳ và lập lịch thu nợ chi tiết theo phương thức gốc đều, lãi giảm dần.'}
            </p>

            {/* Quick module stats */}
            {currentModule === 'loan' ? (
              <div className="mt-6 pt-5 border-t border-sky-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-sky-300 block">Lãi suất ưu đãi từ:</span>
                  <span className="text-base sm:text-lg font-bold text-amber-300 font-mono">
                    5,8%/năm
                  </span>
                </div>
                <div>
                  <span className="text-sky-300 block">Thời gian vay tối đa:</span>
                  <span className="text-base sm:text-lg font-bold text-white font-mono">
                    35 năm (420T)
                  </span>
                </div>
                <div>
                  <span className="text-sky-300 block">Phương thức tính lãi:</span>
                  <span className="text-base sm:text-lg font-bold text-white">
                    Dư nợ giảm dần
                  </span>
                </div>
                <div>
                  <span className="text-sky-300 block">Tỷ lệ vay tối đa:</span>
                  <span className="text-base sm:text-lg font-bold text-emerald-300 font-mono">
                    Đến 85% tài sản
                  </span>
                </div>
              </div>
            ) : currentModule === 'savings' ? (
              <div className="mt-6 pt-5 border-t border-sky-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-sky-300 block">Lãi suất cao nhất:</span>
                  <span className="text-base sm:text-lg font-bold text-white font-mono">
                    6,0%/năm
                  </span>
                </div>
                <div>
                  <span className="text-sky-300 block">Kỳ hạn phổ biến (12T):</span>
                  <span className="text-base sm:text-lg font-bold text-amber-300 font-mono">
                    5,9%/năm
                  </span>
                </div>
                <div>
                  <span className="text-sky-300 block">Hình thức trả lãi:</span>
                  <span className="text-base sm:text-lg font-bold text-white">
                    Cuối kỳ (Trả sau)
                  </span>
                </div>
                <div>
                  <span className="text-sky-300 block">Tiền gửi tối thiểu:</span>
                  <span className="text-base sm:text-lg font-bold text-white font-mono">
                    1.000.000 VND
                  </span>
                </div>
              </div>
            ) : currentModule === 'forex' ? (
              <div className="mt-6 pt-5 border-t border-sky-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-sky-300 block">USD Mua tiền mặt:</span>
                  <span className="text-base sm:text-lg font-bold text-amber-300 font-mono">
                    25.560
                  </span>
                </div>
                <div>
                  <span className="text-sky-300 block">USD Bán ra:</span>
                  <span className="text-base sm:text-lg font-bold text-white font-mono">
                    26.100
                  </span>
                </div>
                <div>
                  <span className="text-sky-300 block">EUR Mua chuyển khoản:</span>
                  <span className="text-base sm:text-lg font-bold text-emerald-300 font-mono">
                    29.347
                  </span>
                </div>
                <div>
                  <span className="text-sky-300 block">Cập nhật lúc:</span>
                  <span className="text-base sm:text-lg font-bold text-white font-mono">
                    16:30 (13/09)
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-6 pt-5 border-t border-sky-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-sky-300 block">Tỷ lệ cho vay tối đa:</span>
                  <span className="text-base sm:text-lg font-bold text-amber-300 font-mono">
                    Đến 95% sổ
                  </span>
                </div>
                <div>
                  <span className="text-sky-300 block">Thời hạn vay linh hoạt:</span>
                  <span className="text-base sm:text-lg font-bold text-white font-mono">
                    1 - 120 tháng
                  </span>
                </div>
                <div>
                  <span className="text-sky-300 block">Phương thức tính lãi:</span>
                  <span className="text-base sm:text-lg font-bold text-white">
                    Dư nợ giảm dần
                  </span>
                </div>
                <div>
                  <span className="text-sky-300 block">Tất toán kỳ cuối:</span>
                  <span className="text-base sm:text-lg font-bold text-emerald-300 font-mono">
                    Dư nợ về 0
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CONDITIONAL RENDER BY MODULE */}
        {currentModule === 'loan' ? (
          /* MODULE 1: BẢNG TÍNH LÃI SUẤT VAY (THEO CHUẨN PDF) */
          <div id="loan-calculator-section" className="space-y-6 animate-fadeIn">
            <LoanCalculator />
          </div>
        ) : currentModule === 'savings' ? (
          /* MODULE 2: CÔNG CỤ TÍNH LÃI SUẤT TIỀN GỬI TIẾT KIỆM */
          <div id="savings-calculator-section" className="space-y-8 animate-fadeIn">
            {/* Calculator section */}
            <div id="calculator-section" className="scroll-mt-20">
              <DepositCalculator
                key={calculatorKey}
                selectedTermId={selectedTermId}
                onSelectTermId={(termId) => setSelectedTermId(termId)}
                depositAmount={currentDepositAmount}
                onDepositAmountChange={(amount) => setCurrentDepositAmount(amount)}
              />
            </div>

            {/* View Switcher / Quick Navigation for Savings */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs sm:text-sm">
                <button
                  type="button"
                  onClick={() => setActiveSavingsView('all')}
                  className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeSavingsView === 'all'
                      ? 'bg-[#005596] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Tất cả tiện ích
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSavingsView('compare')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeSavingsView === 'compare'
                      ? 'bg-[#005596] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>So sánh các kỳ hạn</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSavingsView('rules')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeSavingsView === 'rules'
                      ? 'bg-[#005596] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Nguyên tắc nghiệp vụ tiền gửi</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Lãi suất tự động áp dụng chuẩn theo kỳ hạn</span>
              </div>
            </div>

            {/* Savings sub-views (Bảng biểu lãi suất được tích hợp tự động vào công cụ tính toán) */}
            {(activeSavingsView === 'all' || activeSavingsView === 'compare') && (
              <TermComparison
                amount={currentDepositAmount}
                selectedTermId={selectedTermId}
                onSelectTerm={handleSelectBenchmarkTerm}
              />
            )}

            {(activeSavingsView === 'all' || activeSavingsView === 'rules') && (
              <div id="business-rules-section">
                <BusinessRulesCard />
              </div>
            )}
          </div>
        ) : currentModule === 'forex' ? (
          /* MODULE 3: MUA BÁN NGOẠI TỆ (QUY ĐỔI TỶ GIÁ & BẢNG TỶ GIÁ THEO PDF) */
          <div id="forex-section" className="space-y-6 animate-fadeIn">
            <ForexTrading />
          </div>
        ) : (
          /* MODULE 4: CẦM CỐ SỔ TIẾT KIỆM (THEO CHUẨN PDF NGHIỆP VỤ VIETINBANK) */
          <div id="pledge-loan-section" className="space-y-6 animate-fadeIn">
            <PledgeLoanCalculator />
          </div>
        )}
      </main>

      {/* Brand Modals (iPay, Products, PGD, MiniGame) */}
      <BrandModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
      />

      {/* Footer with VietinBank Chi Nhánh Bạc Liêu info */}
      <Footer />
    </div>
  );
}
