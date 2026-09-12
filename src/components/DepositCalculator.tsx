import React, { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import contentData from '../data/contentData.json';
import { ReferenceRateItem, CalculationResult } from '../types';
import { AnimatedNumber } from './AnimatedNumber';
import {
  formatVND,
  parseFormattedNumber,
  formatRate,
} from '../utils/formatters';
import {
  calculateDepositInterest,
  validateCalculationInputs,
  calculateMaturityDate,
} from '../utils/calculator';
import {
  AlertCircle,
  CheckCircle,
  Copy,
  Info,
  Calendar,
  Wallet,
  TrendingUp,
  Percent,
  Coins,
  ChevronDown,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

interface DepositCalculatorProps {
  selectedTermId: string;
  onSelectTermId: (termId: string) => void;
  depositAmount?: number;
  onDepositAmountChange?: (amount: number) => void;
}

export const DepositCalculator: React.FC<DepositCalculatorProps> = ({
  selectedTermId,
  onSelectTermId,
  depositAmount = 100000000,
  onDepositAmountChange,
}) => {
  const { calculator, referenceRates } = contentData;
  const containerRef = useRef<HTMLDivElement>(null);
  const resultCardRef = useRef<HTMLDivElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [depositAmountRaw, setDepositAmountRaw] = useState<string>(() => depositAmount.toString());
  const [customRateStr, setCustomRateStr] = useState<string>('5.9');
  const [startDate, setStartDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [calcMethod, setCalcMethod] = useState<'standard' | 'actualDays'>('standard');
  const [copied, setCopied] = useState<boolean>(false);
  const [touched, setTouched] = useState<{ amount: boolean; term: boolean; rate: boolean }>({
    amount: true,
    term: true,
    rate: true,
  });

  // Sync if depositAmount prop changes externally
  useEffect(() => {
    if (depositAmount !== undefined && depositAmount !== parseFormattedNumber(depositAmountRaw)) {
      setDepositAmountRaw(depositAmount > 0 ? depositAmount.toString() : '');
    }
  }, [depositAmount]);

  // Find currently selected term object
  const currentTermItem = useMemo(() => {
    return referenceRates.data.find((item) => item.id === selectedTermId);
  }, [referenceRates.data, selectedTermId]);

  // When selected term changes, update default rate if not custom edited
  useEffect(() => {
    if (currentTermItem) {
      setCustomRateStr(currentTermItem.rate.toString());
    }
  }, [currentTermItem]);

  // Numeric values
  const numericAmount = useMemo(() => {
    return parseFormattedNumber(depositAmountRaw);
  }, [depositAmountRaw]);

  const numericRate = useMemo(() => {
    if (customRateStr.trim() === '') return null;
    const sanitized = customRateStr.replace(',', '.');
    const parsed = parseFloat(sanitized);
    return isNaN(parsed) ? null : parsed;
  }, [customRateStr]);

  // Validation
  const { errors, warnings, isValid } = useMemo(() => {
    return validateCalculationInputs(numericAmount, currentTermItem, numericRate);
  }, [numericAmount, currentTermItem, numericRate]);

  // Calculation result
  const result: CalculationResult | null = useMemo(() => {
    if (!isValid || !currentTermItem || numericAmount === null || numericRate === null) {
      return null;
    }
    return calculateDepositInterest(
      numericAmount,
      currentTermItem as ReferenceRateItem,
      numericRate,
      startDate,
      calcMethod
    );
  }, [isValid, currentTermItem, numericAmount, numericRate, startDate, calcMethod]);

  // GSAP card entrance animation
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, []);

  // Flash / highlight effect on result card when result recalculates
  useEffect(() => {
    if (resultCardRef.current && result) {
      gsap.fromTo(
        resultCardRef.current,
        { scale: 0.995 },
        { scale: 1, duration: 0.35, ease: 'back.out(2)' }
      );
    }
  }, [result?.interestEarned, result?.totalPayout]);

  // Input change handlers
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEl = e.target;
    const cursorPosition = inputEl.selectionStart || 0;
    const rawVal = inputEl.value;
    // Strictly prevent non-numeric characters (allow only digits)
    const digitsOnly = rawVal.replace(/[^\d]/g, '');
    const num = digitsOnly ? parseInt(digitsOnly, 10) : 0;
    const newFormatted = digitsOnly ? formatVND(num) : '';

    setDepositAmountRaw(digitsOnly);
    setTouched((prev) => ({ ...prev, amount: true }));
    onDepositAmountChange?.(num);

    // Keep natural cursor position after dot formatting
    requestAnimationFrame(() => {
      if (amountInputRef.current) {
        const digitsBeforeCursor = rawVal.slice(0, cursorPosition).replace(/[^\d]/g, '').length;
        let newPos = 0;
        let count = 0;
        for (let i = 0; i < newFormatted.length; i++) {
          if (/[\d]/.test(newFormatted[i])) {
            count++;
          }
          if (count === digitsBeforeCursor) {
            newPos = i + 1;
            break;
          }
        }
        if (digitsBeforeCursor === 0) newPos = 0;
        amountInputRef.current.setSelectionRange(newPos, newPos);
      }
    });
  };

  const handleQuickAddAmount = (amountToAdd: number) => {
    const current = parseFormattedNumber(depositAmountRaw);
    const newVal = current + amountToAdd;
    setDepositAmountRaw(newVal.toString());
    setTouched((prev) => ({ ...prev, amount: true }));
    onDepositAmountChange?.(newVal);
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow digits and single dot or comma
    if (/^[\d]*[.,]?[\d]*$/.test(val) || val === '') {
      setCustomRateStr(val);
      setTouched((prev) => ({ ...prev, rate: true }));
    }
  };

  const handleTermSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const termId = e.target.value;
    onSelectTermId(termId);
    setTouched((prev) => ({ ...prev, term: true }));
  };

  const handleCopySummary = () => {
    if (!result) return;
    const summaryText = `BẢNG TÍNH LÃI SUẤT TIỀN GỬI THÔNG THƯỜNG TRẢ LÃI SAU
------------------------------------------------
- Tiền gửi ban đầu: ${formatVND(result.depositAmount)} VND
- Kỳ hạn gửi: ${result.termLabel}
- Lãi suất áp dụng: ${formatRate(result.interestRate)}%/năm
- Ngày gửi: ${result.startDate}
- Ngày đáo hạn dự tính: ${result.maturityDate} (${result.actualDays} ngày)
- Số tiền lãi dự tính: ${formatVND(result.interestEarned)} VND
- Tổng số tiền nhận được: ${formatVND(result.totalPayout)} VND
- Bằng chữ: ${result.inWords}
------------------------------------------------
(Nguồn: ${contentData.header.title})`;

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Preview date computation
  const previewMaturity = useMemo(() => {
    if (!currentTermItem) return null;
    return calculateMaturityDate(startDate, currentTermItem.months, currentTermItem.defaultDays);
  }, [startDate, currentTermItem]);

  return (
    <div ref={containerRef} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Quick preset banners */}
      <div className="bg-slate-50/80 px-5 sm:px-8 py-2.5 border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-400 font-medium whitespace-nowrap">Gợi ý nhanh:</span>
        {calculator.quickPresets.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setDepositAmountRaw(preset.amount.toString());
              onSelectTermId(preset.termId);
              onDepositAmountChange?.(preset.amount);
            }}
            className="px-3 py-1 rounded-full bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200/90 hover:border-sky-300 font-medium transition-all whitespace-nowrap cursor-pointer shadow-2xs"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Main 2-column Grid matching PDF layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px]">
        {/* LEFT COLUMN: Tiền gửi dự tính */}
        <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {calculator.depositSectionTitle}
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              Lĩnh lãi cuối kỳ
            </span>
          </div>

          {/* 1. Field: Tổng tiền gửi */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="deposit-amount" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <span>{calculator.labels.depositAmount}</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              {numericAmount > 0 && (
                <span className="text-xs text-sky-700 font-medium">
                  {formatVND(numericAmount)} VND
                </span>
              )}
            </div>

            <div className="relative">
              <input
                ref={amountInputRef}
                id="deposit-amount"
                type="text"
                inputMode="numeric"
                value={depositAmountRaw ? formatVND(parseFormattedNumber(depositAmountRaw)) : ''}
                onChange={handleAmountChange}
                placeholder="0"
                className={`w-full text-base sm:text-lg font-semibold pl-4 pr-16 py-3 bg-slate-50/70 border rounded-xl focus:outline-hidden transition-all text-slate-900 ${
                  touched.amount && errors.depositAmount
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-400/20'
                    : 'border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 bg-white'
                }`}
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <span className="text-xs font-bold text-slate-500 bg-slate-200/60 px-2 py-1 rounded">
                  {calculator.labels.currencyUnit}
                </span>
              </div>
            </div>

            {/* Quick amount add buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Thêm nhanh:</span>
              {calculator.quickAmounts.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickAddAmount(q.value)}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-800 rounded-lg transition-colors cursor-pointer"
                >
                  {q.label}
                </button>
              ))}
            </div>

            {/* Error or Warning message for Amount */}
            {touched.amount && errors.depositAmount && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-rose-600 bg-rose-50 p-2 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.depositAmount}</span>
              </div>
            )}
            {warnings.depositAmount && !errors.depositAmount && (
              <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 p-2 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{warnings.depositAmount}</span>
              </div>
            )}
          </div>

          {/* 2. Field: Kỳ hạn (Tháng) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="term-select" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <span>{calculator.labels.term}</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              {currentTermItem && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Lãi tự động: {formatRate(currentTermItem.rate)}%/năm</span>
                </span>
              )}
            </div>

            <div className="relative">
              <select
                id="term-select"
                value={selectedTermId}
                onChange={handleTermSelect}
                className={`w-full text-sm sm:text-base font-medium pl-4 pr-10 py-3 bg-white border rounded-xl appearance-none focus:outline-hidden transition-all text-slate-900 cursor-pointer ${
                  touched.term && errors.term
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-400/20'
                    : 'border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20'
                }`}
              >
                <option value="" disabled>
                  {calculator.labels.termPlaceholder}
                </option>
                {referenceRates.data.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.termLabel} — {formatRate(item.rate)}%/năm (Tự động)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Quick popular term buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Chọn nhanh:</span>
              {[
                { label: '1 tháng (2,1%)', id: '1m_to_2m' },
                { label: '3 tháng (2,4%)', id: '3m_to_4m' },
                { label: '6 tháng (3,5%)', id: '6m_to_7m' },
                { label: '9 tháng (3,5%)', id: '9m_to_10m' },
                { label: '12 tháng (5,9%)', id: '12m' },
                { label: '24 tháng (6,0%)', id: '24m_to_36m' },
                { label: '36 tháng (6,0%)', id: '36m' },
              ].map((q) => {
                const isSelected = selectedTermId === q.id;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      onSelectTermId(q.id);
                      setTouched((prev) => ({ ...prev, term: true }));
                    }}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#005596] text-white shadow-2xs font-semibold'
                        : 'bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-800'
                    }`}
                  >
                    {q.label}
                  </button>
                );
              })}
            </div>

            {touched.term && errors.term && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-rose-600 bg-rose-50 p-2 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.term}</span>
              </div>
            )}
          </div>

          {/* 3. Field: Lãi suất (%/năm) - Tự động áp dụng từ biểu lãi suất */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="interest-rate" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <span>{calculator.labels.interestRate}</span>
                <span className="text-rose-500 font-bold">*</span>
                <span className="text-[11px] text-emerald-600 font-normal bg-emerald-50 px-1.5 py-0.5 rounded">
                  Tự động theo kỳ hạn
                </span>
              </label>
              {currentTermItem && customRateStr !== currentTermItem.rate.toString() && (
                <button
                  type="button"
                  onClick={() => setCustomRateStr(currentTermItem.rate.toString())}
                  className="inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-800 font-medium underline underline-offset-2 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Khôi phục lãi chuẩn ({formatRate(currentTermItem.rate)}%)</span>
                </button>
              )}
            </div>

            <div className="relative">
              <input
                id="interest-rate"
                type="text"
                value={customRateStr}
                onChange={handleRateChange}
                placeholder="0"
                className={`w-full text-base sm:text-lg font-semibold pl-4 pr-16 py-3 border rounded-xl focus:outline-hidden transition-all text-slate-900 ${
                  touched.rate && errors.interestRate
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-400/20'
                    : 'border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 bg-white'
                }`}
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <span className="text-xs font-bold text-slate-500 bg-slate-200/60 px-2 py-1 rounded">
                  {calculator.labels.rateUnit}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Hệ thống tự động tra cứu lãi suất chuẩn từ ngân hàng theo kỳ hạn đã chọn.</span>
              {currentTermItem && (
                <span className="font-semibold text-emerald-700">
                  {currentTermItem.termLabel}: {formatRate(currentTermItem.rate)}%/năm
                </span>
              )}
            </div>

            {touched.rate && errors.interestRate && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-rose-600 bg-rose-50 p-2 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.interestRate}</span>
              </div>
            )}
            {warnings.interestRate && !errors.interestRate && (
              <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 p-2 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{warnings.interestRate}</span>
              </div>
            )}
          </div>

          {/* Secondary Options: Ngày gửi & Phương thức tính */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-date" className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{calculator.labels.startDate}</span>
              </label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs sm:text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 text-slate-800"
              />
            </div>

            <div>
              <label htmlFor="calc-method" className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                <span>{calculator.labels.calculationMethod}</span>
              </label>
              <select
                id="calc-method"
                value={calcMethod}
                onChange={(e) => setCalcMethod(e.target.value as 'standard' | 'actualDays')}
                className="w-full text-xs sm:text-sm py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 text-slate-800 cursor-pointer"
              >
                <option value="standard">{calculator.labels.methodStandard}</option>
                <option value="actualDays">{calculator.labels.methodActualDays}</option>
              </select>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Tiền lãi dự tính (Light blue background card from PDF) */}
        <div
          ref={resultCardRef}
          className="lg:col-span-5 bg-gradient-to-br from-sky-50 via-sky-50/70 to-blue-50/90 p-6 sm:p-8 border-t lg:border-t-0 lg:border-l border-sky-100 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-sky-200/60 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow-xs">
                  <Coins className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-sky-950 tracking-tight">
                  {calculator.resultSectionTitle}
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded-full">
                <CheckCircle className="w-3 h-3 text-sky-600" />
                Tự động tính
              </span>
            </div>

            {/* Display 1: Số tiền lãi */}
            <div className="bg-white/90 backdrop-blur-xs rounded-xl p-4 sm:p-5 border border-sky-200/80 shadow-xs mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs sm:text-sm font-semibold text-slate-600">
                  {calculator.labels.interestEarned}
                </span>
                <span className="text-[11px] font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
                  {result ? `+${formatRate((result.interestEarned / (result.depositAmount || 1)) * 100)}%` : '0%'}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight font-mono">
                  {result ? (
                    <AnimatedNumber value={result.interestEarned} suffix="VND" />
                  ) : (
                    <span>0 VND</span>
                  )}
                </div>
              </div>
            </div>

            {/* Display 2: Tổng tiền */}
            <div className="bg-white/90 backdrop-blur-xs rounded-xl p-4 sm:p-5 border border-sky-200/80 shadow-xs mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs sm:text-sm font-semibold text-slate-600">
                  {calculator.labels.totalPayout}
                </span>
                <span className="text-[11px] font-medium text-slate-400">Gốc + Lãi</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-sky-900 tracking-tight font-mono">
                {result ? (
                  <AnimatedNumber value={result.totalPayout} suffix="VND" />
                ) : (
                  <span>0 VND</span>
                )}
              </div>
            </div>

            {/* In words summary & breakdown */}
            {result && (
              <div className="space-y-3 bg-white/60 rounded-xl p-3.5 border border-sky-100 text-xs">
                {/* Đọc số thành chữ */}
                <div className="pb-2 border-b border-sky-100">
                  <span className="font-semibold text-slate-500 block mb-0.5">
                    {calculator.summaryDetails.inWordsLabel}:
                  </span>
                  <p className="text-slate-800 font-medium italic leading-relaxed">
                    &ldquo;{result.inWords}&rdquo;
                  </p>
                </div>

                {/* Key metrics */}
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-500 block">Kỳ hạn gửi:</span>
                    <span className="font-semibold text-slate-900">{result.termLabel}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{calculator.labels.maturityDate}:</span>
                    <span className="font-semibold text-slate-900">
                      {result.maturityDate} ({result.actualDays} ngày)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{calculator.summaryDetails.monthlyEquivalentTitle}:</span>
                    <span className="font-semibold text-emerald-700">
                      ~{formatVND(result.monthlyInterest)} VND
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{calculator.summaryDetails.dailyEquivalentTitle}:</span>
                    <span className="font-semibold text-emerald-700">
                      ~{formatVND(result.dailyInterest)} VND
                    </span>
                  </div>
                </div>

                {/* Ratio bar */}
                <div className="pt-2">
                  <div className="flex justify-between text-[11px] mb-1 font-medium">
                    <span className="text-slate-600">Gốc: {formatVND(result.depositAmount)} VND</span>
                    <span className="text-emerald-700 font-bold">Lãi: {formatVND(result.interestEarned)} VND</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                    <div
                      className="bg-sky-600 h-full transition-all duration-500"
                      style={{
                        width: `${Math.max(
                          2,
                          (result.depositAmount / result.totalPayout) * 100
                        )}%`,
                      }}
                      title="Tiền gốc"
                    />
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{
                        width: `${Math.max(
                          2,
                          (result.interestEarned / result.totalPayout) * 100
                        )}%`,
                      }}
                      title="Tiền lãi"
                    />
                  </div>
                </div>
              </div>
            )}

            {!result && (
              <div className="p-4 rounded-xl bg-sky-100/60 text-sky-800 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-sky-600" />
                <span>Vui lòng hoàn thành các thông tin bên trái để tính toán tiền lãi dự tính.</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-6 pt-4 border-t border-sky-200/60 flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={!result}
              onClick={handleCopySummary}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : result
                  ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs hover:shadow-md'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? calculator.actions.copied : calculator.actions.copyResult}</span>
            </button>

            {previewMaturity && (
              <span className="text-[11px] text-sky-800 font-medium text-right">
                Đáo hạn: <strong className="text-slate-900">{previewMaturity.maturityDate}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Formula note below calculator card */}
      <div className="bg-slate-50/90 px-6 py-3 border-t border-slate-100 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <Percent className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <span className="font-semibold text-slate-700">{calculator.formulaExplanation.title}:</span>
          <code className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800 font-bold">
            {calculator.formulaExplanation.formula}
          </code>
        </div>
        <span className="text-slate-400 text-[11px]">{calculator.formulaExplanation.note}</span>
      </div>
    </div>
  );
};
