import { useState } from 'react';
import contentData from './data/contentData.json';
import { Header } from './components/Header';
import { DepositCalculator } from './components/DepositCalculator';
import { ReferenceRateTable } from './components/ReferenceRateTable';
import { BusinessRulesCard } from './components/BusinessRulesCard';
import { TermComparison } from './components/TermComparison';
import { Footer } from './components/Footer';
import { ReferenceRateItem } from './types';
import {
  Calculator,
  TableProperties,
  BookOpen,
  BarChart3,
  HelpCircle,
} from 'lucide-react';

export default function App() {
  const [selectedTermId, setSelectedTermId] = useState<string>('12m');
  const [activeView, setActiveView] = useState<'all' | 'table' | 'rules' | 'compare'>('all');
  const [calculatorKey, setCalculatorKey] = useState<number>(1);
  const [currentDepositAmount, setCurrentDepositAmount] = useState<number>(100000000);

  const handleReset = () => {
    setSelectedTermId('12m');
    setCurrentDepositAmount(100000000);
    setCalculatorKey((k) => k + 1);
  };

  const handleSelectTermFromTable = (item: ReferenceRateItem) => {
    setSelectedTermId(item.id);
    // Scroll smoothly to calculator
    const calcElement = document.getElementById('calculator-section');
    if (calcElement) {
      calcElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      {/* Top Header */}
      <Header onReset={handleReset} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Intro banner */}
        <div className="bg-gradient-to-r from-sky-900 via-blue-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-sky-400/10 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-200 border border-sky-400/30 mb-3">
              <Calculator className="w-3.5 h-3.5" />
              <span>Tiền gửi tiết kiệm trả sau</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
              {contentData.header.title}
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-sky-100/90 leading-relaxed max-w-2xl">
              {contentData.header.subtitle}
            </p>

            {/* Quick stats / Highlights */}
            <div className="mt-6 pt-5 border-t border-sky-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-sky-300 block">Lãi suất cao nhất:</span>
                <span className="text-base sm:text-lg font-bold text-white font-mono">6,0%/năm</span>
              </div>
              <div>
                <span className="text-sky-300 block">Kỳ hạn phổ biến (12T):</span>
                <span className="text-base sm:text-lg font-bold text-amber-300 font-mono">5,9%/năm</span>
              </div>
              <div>
                <span className="text-sky-300 block">Hình thức trả lãi:</span>
                <span className="text-base sm:text-lg font-bold text-white">Cuối kỳ (Trả sau)</span>
              </div>
              <div>
                <span className="text-sky-300 block">Tiền gửi tối thiểu:</span>
                <span className="text-base sm:text-lg font-bold text-white font-mono">1.000.000 VND</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section anchor for smooth scrolling */}
        <div id="calculator-section" className="scroll-mt-20">
          <DepositCalculator
            key={calculatorKey}
            selectedTermId={selectedTermId}
            onSelectTermId={(termId) => setSelectedTermId(termId)}
          />
        </div>

        {/* View Switcher / Quick Navigation Navigation */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => setActiveView('all')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeView === 'all'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Tất cả thông tin
            </button>
            <button
              type="button"
              onClick={() => setActiveView('table')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeView === 'table'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>Biểu lãi suất (Trang 2)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('rules')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeView === 'rules'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Nguyên tắc nghiệp vụ (Trang 1)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('compare')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeView === 'compare'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>So sánh các kỳ hạn</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Nhấp vào kỳ hạn để áp dụng tự động</span>
          </div>
        </div>

        {/* View modules */}
        {(activeView === 'all' || activeView === 'table') && (
          <div id="reference-rate-table-section">
            <ReferenceRateTable
              selectedTermId={selectedTermId}
              onSelectTerm={handleSelectTermFromTable}
            />
          </div>
        )}

        {(activeView === 'all' || activeView === 'compare') && (
          <TermComparison
            amount={currentDepositAmount}
            selectedTermId={selectedTermId}
            onSelectTerm={handleSelectTermFromTable}
          />
        )}

        {(activeView === 'all' || activeView === 'rules') && (
          <div id="business-rules-section">
            <BusinessRulesCard />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
