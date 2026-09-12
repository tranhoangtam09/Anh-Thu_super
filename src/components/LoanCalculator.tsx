import React, { useState, useMemo, useRef } from 'react';
import contentData from '../data/contentData.json';
import { RepaymentCycle, RoundingRule, LoanCalculationResult } from '../types';
import { formatVND, parseFormattedNumber, formatRate } from '../utils/formatters';
import { calculateLoanReducingBalance } from '../utils/loanCalculator';
import { LoanScheduleModal } from './LoanScheduleModal';
import { AnimatedNumber } from './AnimatedNumber';
import {
  Calculator,
  Calendar,
  DollarSign,
  TrendingDown,
  Building2,
  Clock,
  Percent,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Coins,
  AlertCircle,
  Info,
} from 'lucide-react';

export const LoanCalculator: React.FC = () => {
  const { loanCalculator } = contentData;
  const { labels, cycles, roundingOptions, quickLoanAmounts, quickTerms, principles } = loanCalculator;

  // Active calculation tab
  const [activeTab, setActiveTab] = useState<'reducing' | 'equal'>('reducing');

  // Input states - Note: As requested, loan amount is purely an input field, NO slider!
  const [propertyValueRaw, setPropertyValueRaw] = useState<string>('10000000000'); // 10 tỷ
  const [loanAmountRaw, setLoanAmountRaw] = useState<string>('6666666667'); // 6.666.666.667 VND from PDF
  const [loanTermMonths, setLoanTermMonths] = useState<number>(240); // 240 tháng (20 năm)
  const [annualRateStr, setAnnualRateStr] = useState<string>('8.0'); // 8.0%/năm
  const [disbursementDate, setDisbursementDate] = useState<string>(() => {
    // Default to 2026-06-16 matching the PDF or current year
    return '2026-06-16';
  });
  const [repaymentCycle, setRepaymentCycle] = useState<RepaymentCycle>('monthly');
  const [repaymentDay, setRepaymentDay] = useState<number>(16);
  const [roundingRule, setRoundingRule] = useState<RoundingRule>('dong');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Caret preservation ref for loan amount input
  const loanInputRef = useRef<HTMLInputElement>(null);
  const propertyInputRef = useRef<HTMLInputElement>(null);

  // Numeric values
  const numericLoanAmount = useMemo(() => {
    return parseFormattedNumber(loanAmountRaw);
  }, [loanAmountRaw]);

  const numericPropertyValue = useMemo(() => {
    return parseFormattedNumber(propertyValueRaw);
  }, [propertyValueRaw]);

  const numericRate = useMemo(() => {
    if (!annualRateStr.trim()) return 0;
    const parsed = parseFloat(annualRateStr.replace(',', '.'));
    return isNaN(parsed) ? 0 : parsed;
  }, [annualRateStr]);

  // Loan To Value (LTV) %
  const ltvPercent = useMemo(() => {
    if (numericPropertyValue <= 0 || numericLoanAmount <= 0) return null;
    return Math.round((numericLoanAmount / numericPropertyValue) * 100);
  }, [numericLoanAmount, numericPropertyValue]);

  // Calculate schedule and summary
  const calculationResult: LoanCalculationResult | null = useMemo(() => {
    if (numericLoanAmount <= 0 || loanTermMonths <= 0 || numericRate < 0) {
      return null;
    }
    return calculateLoanReducingBalance(
      numericLoanAmount,
      loanTermMonths,
      numericRate,
      disbursementDate,
      repaymentCycle,
      repaymentDay,
      roundingRule,
      numericPropertyValue > 0 ? numericPropertyValue : undefined
    );
  }, [
    numericLoanAmount,
    loanTermMonths,
    numericRate,
    disbursementDate,
    repaymentCycle,
    repaymentDay,
    roundingRule,
    numericPropertyValue,
  ]);

  // Input change handler for Loan Amount (Pure input, no slider, caret preserving)
  const handleLoanAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEl = e.target;
    const cursorPosition = inputEl.selectionStart || 0;
    const rawVal = inputEl.value;
    const digitsOnly = rawVal.replace(/[^\d]/g, '');
    const num = digitsOnly ? parseInt(digitsOnly, 10) : 0;
    const newFormatted = digitsOnly ? formatVND(num) : '';

    setLoanAmountRaw(digitsOnly);

    requestAnimationFrame(() => {
      if (loanInputRef.current) {
        const digitsBeforeCursor = rawVal.slice(0, cursorPosition).replace(/[^\d]/g, '').length;
        let newPos = 0;
        let count = 0;
        for (let i = 0; i < newFormatted.length; i++) {
          if (/[\d]/.test(newFormatted[i])) count++;
          if (count === digitsBeforeCursor) {
            newPos = i + 1;
            break;
          }
        }
        if (digitsBeforeCursor === 0) newPos = 0;
        loanInputRef.current.setSelectionRange(newPos, newPos);
      }
    });
  };

  // Input change handler for Property Value
  const handlePropertyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEl = e.target;
    const cursorPosition = inputEl.selectionStart || 0;
    const rawVal = inputEl.value;
    const digitsOnly = rawVal.replace(/[^\d]/g, '');
    const num = digitsOnly ? parseInt(digitsOnly, 10) : 0;
    const newFormatted = digitsOnly ? formatVND(num) : '';

    setPropertyValueRaw(digitsOnly);

    requestAnimationFrame(() => {
      if (propertyInputRef.current) {
        const digitsBeforeCursor = rawVal.slice(0, cursorPosition).replace(/[^\d]/g, '').length;
        let newPos = 0;
        let count = 0;
        for (let i = 0; i < newFormatted.length; i++) {
          if (/[\d]/.test(newFormatted[i])) count++;
          if (count === digitsBeforeCursor) {
            newPos = i + 1;
            break;
          }
        }
        if (digitsBeforeCursor === 0) newPos = 0;
        propertyInputRef.current.setSelectionRange(newPos, newPos);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card for Loan Calculator */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Sub-tab selection: Dư nợ giảm dần vs Số tiền cố định */}
        <div className="bg-slate-100/80 px-4 sm:px-6 pt-3 pb-0 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
          {loanCalculator.tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as 'reducing' | 'equal')}
                className={`px-4 py-2.5 text-xs sm:text-sm font-bold transition-all rounded-t-xl cursor-pointer border-t border-x ${
                  isActive
                    ? 'bg-white text-[#005596] border-slate-200 shadow-2xs -mb-px relative z-10'
                    : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Notification if equal payments tab is clicked */}
        {activeTab === 'equal' && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-xs text-amber-800 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Phương thức trả góp đều: Số tiền trả hằng tháng không đổi. Phương thức phổ biến nhất hiện nay tại VietinBank là <strong>Trả gốc đều, dư nợ giảm dần</strong> (giúp tổng lãi phải trả thấp hơn).
            </span>
          </div>
        )}

        {/* Main Grid: Form on Left, Result Card on Right matching PDF 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
          {/* LEFT FORM (7 cols): Bước 1 - Người dùng nhập thông tin */}
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#005596]/10 text-[#005596] flex items-center justify-center">
                  <Calculator className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {loanCalculator.title}
                </h3>
              </div>
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200/70 px-2.5 py-0.5 rounded-full">
                VietinBank Bạc Liêu
              </span>
            </div>

            {/* 1. Giá trị bất động sản / tài sản */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="property-val" className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{labels.propertyValue}</span>
                </label>
                {numericPropertyValue > 0 && (
                  <span className="text-slate-500 font-mono">
                    {formatVND(numericPropertyValue)} VND
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  ref={propertyInputRef}
                  id="property-val"
                  type="text"
                  inputMode="numeric"
                  value={propertyValueRaw ? formatVND(parseFormattedNumber(propertyValueRaw)) : ''}
                  onChange={handlePropertyChange}
                  placeholder="Ví dụ: 10.000.000.000"
                  className="w-full text-sm sm:text-base font-semibold pl-4 pr-16 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#005596] focus:ring-2 focus:ring-[#005596]/15 text-slate-900 transition-all"
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className="text-xs font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">
                    {labels.currencyUnit}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. SỐ TIỀN VAY - Thiết kế lại DẠNG NHẬP, KHÔNG ĐỂ DẠNG KÉO THẢ (Đáp ứng chuẩn yêu cầu Bước 1 PDF) */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="loan-amount" className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-[#005596]" />
                  <span className="text-sm">{labels.loanAmount}</span>
                  <span className="text-rose-600 font-bold">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {ltvPercent !== null && (
                    <span className="text-xs font-semibold text-[#005596] bg-sky-50 px-2 py-0.5 rounded">
                      Tỷ lệ vay: {ltvPercent}%
                    </span>
                  )}
                  {numericLoanAmount > 0 && (
                    <span className="text-xs text-rose-600 font-bold font-mono">
                      {formatVND(numericLoanAmount)} VND
                    </span>
                  )}
                </div>
              </div>

              {/* Pure input box with VND formatting and caret preservation */}
              <div className="relative">
                <input
                  ref={loanInputRef}
                  id="loan-amount"
                  type="text"
                  inputMode="numeric"
                  value={loanAmountRaw ? formatVND(parseFormattedNumber(loanAmountRaw)) : ''}
                  onChange={handleLoanAmountChange}
                  placeholder="Nhập số tiền vay (ví dụ: 6.666.666.667)"
                  className="w-full text-base sm:text-lg font-bold pl-4 pr-16 py-3 bg-white border-2 border-slate-300 focus:border-[#005596] focus:ring-2 focus:ring-[#005596]/20 rounded-xl focus:outline-hidden text-slate-900 transition-all font-mono"
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className="text-xs font-bold text-slate-600 bg-slate-200/80 px-2 py-1 rounded">
                    {labels.currencyUnit}
                  </span>
                </div>
              </div>

              {/* Quick suggestion amounts matching PDF screenshot */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400 font-medium mr-1">Gợi ý số tiền:</span>
                {quickLoanAmounts.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setLoanAmountRaw(q.value.toString())}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-sky-50 hover:text-[#005596] text-slate-700 rounded-lg transition-colors cursor-pointer border border-slate-200/60"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Grid for Thời gian vay & Lãi suất */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Thời gian vay */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="loan-term" className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{labels.loanTerm}</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <span className="text-slate-500">
                    {loanTermMonths} tháng ({Math.round((loanTermMonths / 12) * 10) / 10} năm)
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="loan-term"
                    type="number"
                    min="1"
                    max="420"
                    value={loanTermMonths || ''}
                    onChange={(e) => setLoanTermMonths(Math.max(1, parseInt(e.target.value, 10) || 0))}
                    className="w-full text-sm sm:text-base font-semibold pl-4 pr-16 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#005596] focus:ring-2 focus:ring-[#005596]/15 text-slate-900"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <span className="text-xs font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">
                      {labels.loanTermUnit}
                    </span>
                  </div>
                </div>

                {/* Quick term selector */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {quickTerms.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setLoanTermMonths(t.months)}
                      className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                        loanTermMonths === t.months
                          ? 'bg-[#005596] text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {t.months}T
                    </button>
                  ))}
                </div>
              </div>

              {/* Lãi suất (%/Năm) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="loan-rate" className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-slate-400" />
                    <span>{labels.interestRate}</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <span className="text-emerald-700 font-medium text-[11px]">
                    Ưu đãi VietinBank
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="loan-rate"
                    type="text"
                    value={annualRateStr}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^[\d]*[.,]?[\d]*$/.test(v) || v === '') {
                        setAnnualRateStr(v);
                      }
                    }}
                    placeholder="8.0"
                    className="w-full text-sm sm:text-base font-semibold pl-4 pr-16 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#005596] focus:ring-2 focus:ring-[#005596]/15 text-slate-900"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <span className="text-xs font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">
                      {labels.rateUnit}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span>Gợi ý: 6.0% (Ưu đãi) | 7.5% | 8.0% | 9.5%</span>
                </div>
              </div>
            </div>

            {/* 4. Secondary Options: Ngày giải ngân, Chu kỳ trả nợ, Ngày trả định kỳ, Làm tròn */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Ngày giải ngân */}
              <div>
                <label htmlFor="disb-date" className="font-semibold text-slate-600 block mb-1">
                  {labels.disbursementDate}
                </label>
                <input
                  id="disb-date"
                  type="date"
                  value={disbursementDate}
                  onChange={(e) => setDisbursementDate(e.target.value)}
                  className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-[#005596]"
                />
              </div>

              {/* Chu kỳ trả nợ */}
              <div>
                <label htmlFor="rep-cycle" className="font-semibold text-slate-600 block mb-1">
                  {labels.repaymentCycle}
                </label>
                <select
                  id="rep-cycle"
                  value={repaymentCycle}
                  onChange={(e) => setRepaymentCycle(e.target.value as RepaymentCycle)}
                  className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-[#005596] cursor-pointer"
                >
                  {cycles.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ngày trả nợ định kỳ */}
              <div>
                <label htmlFor="rep-day" className="font-semibold text-slate-600 block mb-1">
                  {labels.repaymentDay}
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">Ngày</span>
                  <input
                    id="rep-day"
                    type="number"
                    min="1"
                    max="31"
                    value={repaymentDay}
                    onChange={(e) => setRepaymentDay(Math.max(1, Math.min(31, parseInt(e.target.value, 10) || 1)))}
                    className="w-16 py-2 px-2 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-slate-800 focus:outline-hidden focus:border-[#005596]"
                  />
                  <span className="text-slate-400">hàng tháng</span>
                </div>
              </div>

              {/* Quy tắc làm tròn */}
              <div>
                <label htmlFor="round-rule" className="font-semibold text-slate-600 block mb-1">
                  {labels.roundingRule}
                </label>
                <select
                  id="round-rule"
                  value={roundingRule}
                  onChange={(e) => setRoundingRule(e.target.value as RoundingRule)}
                  className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-[#005596] cursor-pointer"
                >
                  {roundingOptions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* RIGHT CARD (5 cols): Thẻ hiển thị số tiền trả & nút "Xem chi tiết" (Matching PDF 1 Screenshot) */}
          <div className="lg:col-span-5 bg-[#546E7A] text-white p-6 sm:p-8 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-600/40 relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

            <div>
              {/* Top gold coin icon matching PDF */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-amber-400/90 text-amber-950 flex items-center justify-center shadow-lg ring-4 ring-amber-300/30">
                  <DollarSign className="w-7 h-7 font-black" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-300 font-semibold block">
                    Ước tính thanh toán
                  </span>
                  <h4 className="text-base font-bold text-white">
                    Phương thức dư nợ giảm dần
                  </h4>
                </div>
              </div>

              {/* 1. Số tiền trả hàng tháng: từ ... đến ... (Theo đúng thiết kế screenshot PDF 1) */}
              <div className="space-y-2 mb-6 bg-black/15 p-4 rounded-xl border border-white/10 backdrop-blur-xs">
                <span className="text-xs text-slate-300 font-medium block">
                  {labels.monthlyPayment}
                </span>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[11px] text-slate-300 block mb-0.5">{labels.from}</span>
                    <div className="text-base sm:text-lg font-extrabold text-white font-mono leading-tight">
                      {calculationResult ? (
                        <span>{formatVND(calculationResult.firstPeriodPayment)} VND</span>
                      ) : (
                        <span>0 VND</span>
                      )}
                    </div>
                    <span className="text-[10px] text-amber-300 block mt-0.5 font-sans">
                      (Kỳ đầu cao nhất)
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-300 block mb-0.5">{labels.to}</span>
                    <div className="text-base sm:text-lg font-extrabold text-white font-mono leading-tight">
                      {calculationResult ? (
                        <span>{formatVND(calculationResult.lastPeriodPayment)} VND</span>
                      ) : (
                        <span>0 VND</span>
                      )}
                    </div>
                    <span className="text-[10px] text-emerald-300 block mt-0.5 font-sans">
                      (Kỳ cuối thấp nhất)
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Tổng lãi phải trả */}
              <div className="space-y-1 mb-5">
                <span className="text-xs text-slate-300 font-medium block">
                  {labels.totalInterest}
                </span>
                <div className="text-xl sm:text-2xl font-extrabold text-amber-300 font-mono tracking-tight">
                  {calculationResult ? (
                    <AnimatedNumber value={calculationResult.totalInterest} suffix="VND" />
                  ) : (
                    <span>0 VND</span>
                  )}
                </div>
              </div>

              {/* 3. Tổng gốc + lãi */}
              <div className="space-y-1 mb-6 pt-3 border-t border-white/15">
                <span className="text-xs text-slate-300 font-medium block">
                  {labels.totalRepayment}
                </span>
                <div className="text-lg sm:text-xl font-extrabold text-emerald-300 font-mono">
                  {calculationResult ? (
                    <AnimatedNumber value={calculationResult.totalRepayment} suffix="VND" />
                  ) : (
                    <span>0 VND</span>
                  )}
                </div>
                {calculationResult && (
                  <p className="text-[11px] text-slate-300 italic">
                    &ldquo;{calculationResult.inWords}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* ACTION BUTTON: "Xem chi tiết" (Theo đúng yêu cầu Bước 1 & Bước 2 PDF 1) */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                disabled={!calculationResult}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base text-slate-900 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>{labels.viewDetails}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-[11px] text-center text-slate-300 mt-2">
                Click để mở toàn bộ bảng tính lịch trả nợ từng kỳ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Business Principles Card (Trang 1, 2, 3 trong PDF) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#005596] flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {principles.title}
            </h3>
            <p className="text-xs text-slate-500">{principles.subtitle}</p>
          </div>
        </div>

        {/* Calculation steps & Characteristics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 space-y-2.5">
            <span className="text-xs font-bold text-[#005596] uppercase tracking-wider block">
              Cách tính nghiệp vụ:
            </span>
            <ul className="space-y-2 text-xs text-slate-700">
              {principles.calculationSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 space-y-2.5">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
              Đặc điểm phương thức:
            </span>
            <ul className="space-y-2 text-xs text-slate-700">
              {principles.characteristics.map((char, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <TrendingDown className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{char}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 2. Quy tắc tính toán nghiệp vụ (2.1 Quy đổi lãi suất, 2.2 Tính dư nợ, 2.3 Làm tròn số, 2.4 Ngày trả nợ) */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            2. Quy tắc tính toán nghiệp vụ chi tiết:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {principles.businessRules.map((rule, idx) => (
              <div key={idx} className="p-3 bg-white border border-slate-200/80 rounded-xl space-y-1">
                <span className="font-bold text-slate-900 block">{rule.title}</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">{rule.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Bảng tính lịch trả nợ với dư nợ giảm dần (Bước 2 trong PDF) */}
      <LoanScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        result={calculationResult}
      />
    </div>
  );
};
