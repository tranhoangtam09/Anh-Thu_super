import React, { useState, useMemo, useRef } from 'react';
import contentData from '../data/contentData.json';
import { RepaymentCycle, RoundingRule, PledgeScheduleRow, PledgeCalculationResult } from '../types';
import { calculatePledgeLoan } from '../utils/pledgeLoanCalculator';
import { formatVND, parseFormattedNumber, formatRate, numberToVietnameseWords } from '../utils/formatters';
import {
  ShieldCheck,
  Calculator,
  RotateCcw,
  Printer,
  Download,
  AlertCircle,
  CheckCircle2,
  Calendar,
  DollarSign,
  TrendingDown,
  Clock,
  Sparkles,
  Percent,
  Layers,
  BookOpen,
  Info,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Building2,
  Sliders,
  Scale,
} from 'lucide-react';

export const PledgeLoanCalculator: React.FC = () => {
  const { brand } = contentData;

  // 1. Thông tin sổ tiết kiệm (Section 2)
  const [depositAmountRaw, setDepositAmountRaw] = useState<string>('600000000'); // 600 triệu VNĐ
  const [depositOpenDate, setDepositOpenDate] = useState<string>('2026-01-01');
  const [depositMaturityDate, setDepositMaturityDate] = useState<string>('2027-01-15');
  const [depositRateStr, setDepositRateStr] = useState<string>('5.5');
  const [currency, setCurrency] = useState<string>('VND');

  // 2. Thông tin khoản vay cầm cố (Section 3 - Nhập trực tiếp, KHÔNG thanh kéo/thả)
  const [loanAmountRaw, setLoanAmountRaw] = useState<string>('500000000'); // 500 triệu theo ví dụ Section 14
  const [annualRateStr, setAnnualRateStr] = useState<string>('12.0'); // 12%/năm theo ví dụ Section 14
  const [disbursementDate, setDisbursementDate] = useState<string>('2026-01-10'); // 10/01/2026
  const [loanTermMonths, setLoanTermMonths] = useState<number>(12); // 12 tháng
  const [repaymentCycle, setRepaymentCycle] = useState<RepaymentCycle>('monthly'); // Hằng tháng
  const [repaymentDay, setRepaymentDay] = useState<number>(25); // Ngày 25 hàng tháng theo Section 14
  const [roundingRule, setRoundingRule] = useState<RoundingRule>('dong'); // Làm tròn đến đơn vị đồng hoặc 1.000đ

  // 3. Cấu hình tỷ lệ cho vay tối đa (Section 4 - Tham số cấu hình, không hard-code)
  const [maxLtvRatio, setMaxLtvRatio] = useState<number>(95); // 95% mặc định

  // 4. UI States
  const [isFullScheduleVisible, setIsFullScheduleVisible] = useState<boolean>(true); // Hiển thị chi tiết
  const [showConfigLtv, setShowConfigLtv] = useState<boolean>(false);
  const scheduleTableRef = useRef<HTMLDivElement>(null);

  // Numeric parsing
  const numericDepositAmount = useMemo(() => {
    return parseFormattedNumber(depositAmountRaw);
  }, [depositAmountRaw]);

  const numericLoanAmount = useMemo(() => {
    return parseFormattedNumber(loanAmountRaw);
  }, [loanAmountRaw]);

  const numericAnnualRate = useMemo(() => {
    const parsed = parseFloat(annualRateStr.replace(',', '.'));
    return isNaN(parsed) ? 0 : parsed;
  }, [annualRateStr]);

  const numericDepositRate = useMemo(() => {
    const parsed = parseFloat(depositRateStr.replace(',', '.'));
    return isNaN(parsed) ? 0 : parsed;
  }, [depositRateStr]);

  // Max loan limit calculation
  const calculatedMaxLimit = useMemo(() => {
    return Math.round(numericDepositAmount * (maxLtvRatio / 100));
  }, [numericDepositAmount, maxLtvRatio]);

  // Perform core calculation
  const result: PledgeCalculationResult = useMemo(() => {
    return calculatePledgeLoan({
      depositAmount: numericDepositAmount,
      depositOpenDate,
      depositMaturityDate,
      depositRate: numericDepositRate,
      currency,
      loanAmount: numericLoanAmount,
      annualRate: numericAnnualRate,
      disbursementDate,
      loanTermMonths,
      repaymentCycle,
      repaymentDay,
      maxLtvRatio,
      roundingRule,
    });
  }, [
    numericDepositAmount,
    depositOpenDate,
    depositMaturityDate,
    numericDepositRate,
    currency,
    numericLoanAmount,
    numericAnnualRate,
    disbursementDate,
    loanTermMonths,
    repaymentCycle,
    repaymentDay,
    maxLtvRatio,
    roundingRule,
  ]);

  // Limit usage ratio percentage
  const limitUsagePercent = useMemo(() => {
    if (calculatedMaxLimit <= 0) return 0;
    const ratio = (numericLoanAmount / calculatedMaxLimit) * 100;
    return Math.min(150, Math.round(ratio));
  }, [numericLoanAmount, calculatedMaxLimit]);

  // Handlers for inputs
  const handleDepositChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^\d]/g, '');
    setDepositAmountRaw(cleaned);
  };

  const handleLoanAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^\d]/g, '');
    setLoanAmountRaw(cleaned);
  };

  // Reset to default sample values (Section 13 & 14)
  const handleReset = () => {
    setDepositAmountRaw('600000000');
    setDepositOpenDate('2026-01-01');
    setDepositMaturityDate('2027-01-15');
    setDepositRateStr('5.5');
    setCurrency('VND');
    setLoanAmountRaw('500000000');
    setAnnualRateStr('12.0');
    setDisbursementDate('2026-01-10');
    setLoanTermMonths(12);
    setRepaymentCycle('monthly');
    setRepaymentDay(25);
    setRoundingRule('dong');
    setMaxLtvRatio(95);
    setIsFullScheduleVisible(true);
  };

  // Set loan amount to maximum allowed limit
  const handleSetMaxLoan = () => {
    if (calculatedMaxLimit > 0) {
      setLoanAmountRaw(calculatedMaxLimit.toString());
    }
  };

  // Scroll to schedule table (Nút "Xem chi tiết")
  const handleScrollToDetails = () => {
    setIsFullScheduleVisible(true);
    if (scheduleTableRef.current) {
      scheduleTableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Export to CSV / Excel (Section 13)
  const handleExportCSV = () => {
    if (!result.schedule || result.schedule.length === 0) return;

    const headers = [
      'Kỳ',
      'Ngày trả nợ',
      'Dư nợ đầu kỳ (VND)',
      'Gốc kỳ này (VND)',
      'Lãi kỳ này (VND)',
      'Tổng trả kỳ này (VND)',
      'Dư nợ cuối kỳ (VND)',
    ];

    const rows = result.schedule.map((row) => [
      row.period,
      row.paymentDate,
      row.beginningBalance,
      row.principalPaid,
      row.interestPaid,
      row.totalPaid,
      row.endingBalance,
    ]);

    // Add summary row
    rows.push([
      'Tổng cộng' as any,
      '-' as any,
      '-' as any,
      result.totalPrincipal,
      result.totalInterest,
      result.totalRepayment,
      0,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [
        `BẢNG LỊCH TRẢ NỢ VAY CẦM CỐ SỔ TIẾT KIỆM - VIETINBANK`,
        `Giá trị sổ tiết kiệm: ${formatVND(result.depositAmount)} VND - Hạn mức tối đa (${result.maxLtvRatio}%): ${formatVND(result.maxLoanLimit)} VND`,
        `Số tiền vay: ${formatVND(result.loanAmount)} VND - Thời hạn: ${result.loanTermMonths} tháng - Lãi suất: ${result.annualRate}%/năm`,
        `Ngày giải ngân: ${result.disbursementDate} - Ngày trả nợ định kỳ: ngày ${result.repaymentDay}`,
        '',
        headers.join(','),
        ...rows.map((r) => r.join(',')),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Lich_tra_no_cam_co_so_tiet_kiem_${result.disbursementDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print schedule (Section 13)
  const handlePrint = () => {
    window.print();
  };

  // Format cycle name
  const getCycleLabel = (c: RepaymentCycle) => {
    switch (c) {
      case 'monthly':
        return 'Hằng tháng (1 tháng)';
      case 'quarterly':
        return 'Hằng quý (3 tháng)';
      case 'semiAnnual':
        return '6 tháng';
      case 'annual':
        return 'Hằng năm (12 tháng)';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800">
      {/* ========================================================================= */}
      {/* 1. HEADER MODULE: CẤU PHẦN CẦM CỐ SỔ TIẾT KIỆM (Mục 1 & 16)               */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-[#003B70] via-[#005596] to-[#004277] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-sky-200 border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Cấu phần mô phỏng khoản vay cầm cố sổ tiết kiệm</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Cầm Cố Sổ Tiết Kiệm
            </h2>
            <p className="text-xs sm:text-sm text-sky-100/90 max-w-2xl leading-relaxed">
              Mô phỏng khoản vay cầm cố sổ tiết kiệm tại VietinBank, tự động tính hạn mức, khoản trả nợ và lịch trả nợ theo phương thức gốc trả đều, lãi tính trên dư nợ giảm dần.
            </p>
          </div>

          {/* Quick Config Button & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowConfigLtv(!showConfigLtv)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Cấu hình tham số tỷ lệ cho vay tối đa"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-300" />
              <span>Tham số LTV ({maxLtvRatio}%)</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Khôi phục dữ liệu tính toán mẫu"
            >
              <RotateCcw className="w-3.5 h-3.5 text-sky-200" />
              <span>Làm lại</span>
            </button>
          </div>
        </div>

        {/* Dynamic Config Drawer for Max LTV Ratio (Section 4: Tham số cấu hình, không hard-code) */}
        {showConfigLtv && (
          <div className="mt-6 pt-5 border-t border-white/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs animate-fadeIn">
            <div>
              <label className="block text-sky-200 font-semibold mb-1.5">
                Tỷ lệ cho vay tối đa (% giá trị sổ):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={maxLtvRatio}
                  onChange={(e) => setMaxLtvRatio(Number(e.target.value) || 95)}
                  className="w-24 bg-white/20 text-white font-mono font-bold px-3 py-1.5 rounded-lg border border-white/30 focus:outline-none focus:bg-white/30"
                />
                <span className="text-white font-bold">%</span>
              </div>
            </div>

            <div className="col-span-1 sm:col-span-3 flex flex-wrap items-center gap-2 pt-4 sm:pt-0">
              <span className="text-sky-200 block w-full text-[11px]">
                Chọn nhanh tỷ lệ chính sách VietinBank:
              </span>
              {[80, 85, 90, 95, 100].map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setMaxLtvRatio(ratio)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                    maxLtvRatio === ratio
                      ? 'bg-amber-400 text-slate-900 shadow-xs'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {ratio}% {ratio === 95 && '(Mặc định)'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2 & 3. THÔNG TIN SỔ TIẾT KIỆM & THÔNG TIN KHOẢN VAY (GRID 2 CỘT)           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ======================================================================= */}
        {/* CARD 1: THÔNG TIN SỔ TIẾT KIỆM (Section 2)                              */}
        {/* ======================================================================= */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <BookOpen className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#003B70]">
                  Thông Tin Sổ Tiết Kiệm
                </h3>
                <p className="text-xs text-slate-500">Tài sản bảo đảm cho khoản vay cầm cố</p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Sổ hợp lệ
            </span>
          </div>

          {/* 1. Số tiền trên sổ tiết kiệm: nhập trực tiếp, định dạng hàng nghìn, đơn vị VNĐ */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <span>Số tiền trên sổ tiết kiệm</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {numberToVietnameseWords(numericDepositAmount)}
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={formatVND(numericDepositAmount)}
                onChange={handleDepositChange}
                placeholder="Nhập số tiền trên sổ"
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#005596] focus:bg-white focus:ring-2 focus:ring-sky-100 rounded-xl px-3.5 py-2.5 text-base sm:text-lg font-extrabold text-slate-800 font-mono transition-all"
              />
              <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-500">
                {currency}
              </span>
            </div>

            {/* Quick deposit chips */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Chọn nhanh:</span>
              {[200000000, 500000000, 600000000, 1000000000, 2000000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setDepositAmountRaw(amt.toString())}
                  className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 hover:bg-[#005596] hover:text-white text-slate-600 transition-colors cursor-pointer font-mono"
                >
                  {amt >= 1000000000 ? `${amt / 1000000000} Tỷ` : `${amt / 1000000} Tr`}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Ngày mở sổ & Ngày đáo hạn */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ngày mở sổ
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={depositOpenDate}
                  onChange={(e) => setDepositOpenDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#005596] focus:bg-white focus:ring-2 focus:ring-sky-100 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ngày đáo hạn sổ <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={depositMaturityDate}
                  onChange={(e) => setDepositMaturityDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#005596] focus:bg-white focus:ring-2 focus:ring-sky-100 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* 3. Lãi suất tiền gửi (%/năm) & Loại tiền */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Lãi suất tiền gửi (%/năm)
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={depositRateStr}
                  onChange={(e) => setDepositRateStr(e.target.value)}
                  placeholder="5.5"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#005596] focus:bg-white focus:ring-2 focus:ring-sky-100 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 font-mono"
                />
                <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                  %/năm
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Loại tiền tệ
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#005596] focus:bg-white focus:ring-2 focus:ring-sky-100 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 cursor-pointer"
              >
                <option value="VND">🇻🇳 VND - Đồng Việt Nam</option>
                <option value="USD">🇺🇸 USD - Đô la Mỹ</option>
                <option value="EUR">🇪🇺 EUR - Đồng Euro</option>
              </select>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* CARD 2: THÔNG TIN KHOẢN VAY CẦM CỐ (Section 3)                          */}
        {/* ======================================================================= */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-sky-50 text-[#005596] border border-sky-100">
                <Calculator className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#003B70]">
                  Thông Tin Khoản Vay Cầm Cố
                </h3>
                <p className="text-xs text-slate-500">
                  Nhập trực tiếp số tiền vay (không dùng thanh kéo/thả)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSetMaxLoan}
              className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-100 text-[#005596] hover:bg-sky-200 transition-colors cursor-pointer"
            >
              Vay tối đa
            </button>
          </div>

          {/* 1. Số tiền vay: Nhập trực tiếp, KHÔNG dùng slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <span>Số tiền đề nghị vay</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {numberToVietnameseWords(numericLoanAmount)}
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={formatVND(numericLoanAmount)}
                onChange={handleLoanAmountChange}
                placeholder="Nhập số tiền vay mong muốn"
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#005596] focus:bg-white focus:ring-2 focus:ring-sky-100 rounded-xl px-3.5 py-2.5 text-base sm:text-lg font-extrabold text-slate-800 font-mono transition-all"
              />
              <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-500">
                VND
              </span>
            </div>

            {/* Quick loan chips */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Chọn nhanh:</span>
              {[100000000, 300000000, 500000000, 800000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setLoanAmountRaw(amt.toString())}
                  className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 hover:bg-[#005596] hover:text-white text-slate-600 transition-colors cursor-pointer font-mono"
                >
                  {amt / 1000000} Tr
                </button>
              ))}
              <button
                type="button"
                onClick={handleSetMaxLoan}
                className="px-2 py-0.5 rounded-md text-xs font-semibold bg-sky-50 text-[#005596] hover:bg-[#005596] hover:text-white transition-colors cursor-pointer"
              >
                Hạn mức tối đa ({formatVND(calculatedMaxLimit)})
              </button>
            </div>
          </div>

          {/* 2. Lãi suất cho vay (%/năm) & Thời hạn vay (tháng) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Lãi suất cho vay (%/năm) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={annualRateStr}
                  onChange={(e) => setAnnualRateStr(e.target.value)}
                  placeholder="12.0"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#005596] focus:bg-white focus:ring-2 focus:ring-sky-100 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 font-mono"
                />
                <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                  %/năm
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Thời hạn vay (tháng) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={loanTermMonths}
                  onChange={(e) => setLoanTermMonths(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#005596] focus:bg-white focus:ring-2 focus:ring-sky-100 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 font-mono"
                />
                <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                  tháng
                </span>
              </div>
            </div>
          </div>

          {/* 3. Ngày giải ngân & Ngày trả nợ định kỳ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ngày giải ngân <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={disbursementDate}
                onChange={(e) => setDisbursementDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#005596] focus:bg-white focus:ring-2 focus:ring-sky-100 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ngày trả nợ định kỳ <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={repaymentDay}
                  onChange={(e) => setRepaymentDay(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#005596] focus:bg-white focus:ring-2 focus:ring-sky-100 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 cursor-pointer"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      Ngày {day} {day === 25 ? '(Khuyên dùng)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 4. Chu kỳ trả nợ & Phương thức trả nợ mặc định */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Chu kỳ trả nợ (gốc & lãi)
              </label>
              <select
                value={repaymentCycle}
                onChange={(e) => setRepaymentCycle(e.target.value as RepaymentCycle)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#005596] focus:bg-white focus:ring-2 focus:ring-sky-100 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 cursor-pointer"
              >
                <option value="monthly">Hằng tháng (1 tháng/kỳ)</option>
                <option value="quarterly">Hằng quý (3 tháng/kỳ)</option>
                <option value="semiAnnual">6 tháng (6 tháng/kỳ)</option>
                <option value="annual">Hằng năm (12 tháng/kỳ)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Quy tắc làm tròn
              </label>
              <select
                value={roundingRule}
                onChange={(e) => setRoundingRule(e.target.value as RoundingRule)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#005596] focus:bg-white focus:ring-2 focus:ring-sky-100 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 cursor-pointer"
              >
                <option value="dong">Làm tròn đến đơn vị đồng</option>
                <option value="thousand">Làm tròn đến 1.000 đồng</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl text-xs text-sky-950 flex items-center gap-2">
            <Info className="w-4 h-4 text-[#005596] shrink-0" />
            <span>
              <strong>Phương thức trả nợ mặc định:</strong> Trả gốc đều, lãi tính trên dư nợ giảm dần.
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CARD 3: KẾT QUẢ KIỂM TRA HẠN MỨC CẦM CỐ (Section 4)                    */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Scale className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#003B70]">
                Kiểm Tra Hạn Mức Cầm Cố
              </h3>
              <p className="text-xs text-slate-500">
                So sánh số tiền khách hàng yêu cầu với hạn mức cho phép ({maxLtvRatio}% giá trị sổ)
              </p>
            </div>
          </div>

          {/* Status Badge */}
          {!result.isExceeded ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Đủ điều kiện cấp tín dụng</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 self-start sm:self-auto">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Vượt hạn mức tối đa</span>
            </span>
          )}
        </div>

        {/* 4 Key Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 block">Giá trị sổ tiết kiệm:</span>
            <span className="text-base sm:text-lg font-extrabold text-slate-800 font-mono mt-0.5 block">
              {formatVND(numericDepositAmount)}
            </span>
            <span className="text-[11px] text-slate-400">100% tài sản bảo đảm</span>
          </div>

          <div className="p-3.5 bg-sky-50/60 rounded-xl border border-sky-100">
            <span className="text-sky-800 block">Tỷ lệ LTV cấu hình:</span>
            <span className="text-base sm:text-lg font-extrabold text-[#005596] font-mono mt-0.5 block">
              {maxLtvRatio}%
            </span>
            <span className="text-[11px] text-sky-600">Theo quy định VietinBank</span>
          </div>

          <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <span className="text-emerald-800 block">Hạn mức vay tối đa:</span>
            <span className="text-base sm:text-lg font-extrabold text-emerald-700 font-mono mt-0.5 block">
              {formatVND(calculatedMaxLimit)}
            </span>
            <span className="text-[11px] text-emerald-600">Khả dụng tối đa</span>
          </div>

          <div
            className={`p-3.5 rounded-xl border ${
              result.isExceeded
                ? 'bg-rose-50/80 border-rose-200'
                : 'bg-slate-50 border-slate-200/80'
            }`}
          >
            <span className={result.isExceeded ? 'text-rose-700 block' : 'text-slate-500 block'}>
              Số tiền yêu cầu vay:
            </span>
            <span
              className={`text-base sm:text-lg font-extrabold font-mono mt-0.5 block ${
                result.isExceeded ? 'text-rose-600' : 'text-slate-800'
              }`}
            >
              {formatVND(numericLoanAmount)}
            </span>
            <span
              className={`text-[11px] ${
                result.isExceeded ? 'text-rose-500 font-semibold' : 'text-slate-400'
              }`}
            >
              {result.isExceeded
                ? `Vượt ${formatVND(result.exceededAmount)} VND`
                : `${Math.round((numericLoanAmount / (calculatedMaxLimit || 1)) * 100)}% hạn mức`}
            </span>
          </div>
        </div>

        {/* Progress Bar for Limit Usage */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Tỷ lệ sử dụng hạn mức</span>
            <span className="font-bold text-slate-700">{limitUsagePercent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                result.isExceeded
                  ? 'bg-rose-500'
                  : limitUsagePercent > 90
                  ? 'bg-amber-500'
                  : 'bg-[#005596]'
              }`}
              style={{ width: `${Math.min(100, limitUsagePercent)}%` }}
            />
          </div>
        </div>

        {/* Validation Errors & Warnings Section (Section 11) */}
        {result.validationErrors.length > 0 && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2 animate-fadeIn">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Cảnh báo vi phạm điều kiện tính toán (Không thể tạo lịch trả nợ):</span>
            </div>
            <ul className="list-disc list-inside text-xs text-rose-700 space-y-1 pl-1">
              {result.validationErrors.map((err, idx) => (
                <li key={idx} className="leading-relaxed">
                  {err}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. NÚT CHỨC NĂNG (Section 13 & 16)                                        */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl shadow-xs border border-slate-200/80">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Nút 1: TÍNH TOÁN */}
          <button
            type="button"
            onClick={handleScrollToDetails}
            className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#005596] to-[#003B70] hover:opacity-95 shadow-md shadow-[#005596]/20 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <Calculator className="w-4 h-4 text-amber-300" />
            <span>TÍNH TOÁN</span>
          </button>

          {/* Nút 2: XEM CHI TIẾT */}
          <button
            type="button"
            onClick={() => setIsFullScheduleVisible(!isFullScheduleVisible)}
            disabled={result.schedule.length === 0}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all flex items-center gap-1.5 cursor-pointer ${
              result.schedule.length === 0
                ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
                : 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-[#005596]'
            }`}
          >
            {isFullScheduleVisible ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span>Ẩn lịch trả nợ</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>XEM CHI TIẾT LỊCH TRẢ NỢ</span>
              </>
            )}
          </button>

          {/* Nút 3: LÀM LẠI */}
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>LÀM LẠI</span>
          </button>
        </div>

        {/* Nút 4 & 5: IN LỊCH TRẢ NỢ & XUẤT EXCEL */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={result.schedule.length === 0}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all flex items-center gap-1.5 cursor-pointer ${
              result.schedule.length === 0
                ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
                : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
            }`}
            title="Tải bảng lịch trả nợ dạng CSV/Excel"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>XUẤT EXCEL</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={result.schedule.length === 0}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all flex items-center gap-1.5 cursor-pointer ${
              result.schedule.length === 0
                ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
            title="In ấn biểu mẫu lịch trả nợ"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>IN LỊCH TRẢ NỢ</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. TỔNG QUAN KHOẢN VAY (Section 10 & 16)                                  */}
      {/* ========================================================================= */}
      {result.schedule.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 space-y-6 animate-fadeIn">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <span className="p-2 rounded-xl bg-sky-50 text-[#005596]">
              <TrendingDown className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-[#003B70]">
                Tổng Quan Khoản Vay Cầm Cố
              </h3>
              <p className="text-xs text-slate-500">
                Phương thức: Gốc trả đều, lãi tính trên dư nợ giảm dần
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* 1. Số tiền vay */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
              <span className="text-xs text-slate-500 block">Số tiền vay:</span>
              <span className="text-xl sm:text-2xl font-extrabold text-[#005596] font-mono mt-1 block">
                {formatVND(result.loanAmount)}
              </span>
              <span className="text-[11px] text-slate-400">VND</span>
            </div>

            {/* 2. Thời hạn vay */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
              <span className="text-xs text-slate-500 block">Thời hạn vay:</span>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-800 font-mono mt-1 block">
                {result.loanTermMonths}
              </span>
              <span className="text-[11px] text-slate-400">
                tháng ({result.totalPeriods} kỳ trả nợ)
              </span>
            </div>

            {/* 3. Lãi suất */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
              <span className="text-xs text-slate-500 block">Lãi suất vay:</span>
              <span className="text-xl sm:text-2xl font-extrabold text-amber-600 font-mono mt-1 block">
                {formatRate(result.annualRate)}%
              </span>
              <span className="text-[11px] text-slate-400">
                /năm ({formatRate(result.periodRatePercent)}%/kỳ)
              </span>
            </div>

            {/* 4. Tổng tiền gốc */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
              <span className="text-xs text-slate-500 block">Tổng tiền gốc:</span>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-800 font-mono mt-1 block">
                {formatVND(result.totalPrincipal)}
              </span>
              <span className="text-[11px] text-emerald-600 font-medium">Đúng bằng số vay</span>
            </div>

            {/* 5. Tổng tiền lãi */}
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100">
              <span className="text-xs text-amber-800 block">Tổng tiền lãi phải trả:</span>
              <span className="text-xl sm:text-2xl font-extrabold text-amber-600 font-mono mt-1 block">
                {formatVND(result.totalInterest)}
              </span>
              <span className="text-[11px] text-amber-700 font-mono">
                {Math.round((result.totalInterest / result.loanAmount) * 100)}% gốc vay
              </span>
            </div>

            {/* 6. Tổng số tiền phải trả */}
            <div className="p-4 bg-sky-50/80 rounded-2xl border border-sky-200">
              <span className="text-xs text-[#005596] font-semibold block">Tổng gốc + lãi:</span>
              <span className="text-xl sm:text-2xl font-extrabold text-[#003B70] font-mono mt-1 block">
                {formatVND(result.totalRepayment)}
              </span>
              <span className="text-[11px] text-sky-700">VND</span>
            </div>

            {/* 7. Trả kỳ đầu tiên */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
              <span className="text-xs text-slate-500 block">Kỳ đầu tiên trả:</span>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-800 font-mono mt-1 block">
                {formatVND(result.firstPeriodPayment)}
              </span>
              <span className="text-[11px] text-slate-400">Kỳ cao nhất (Gốc + Lãi)</span>
            </div>

            {/* 8. Dư nợ cuối kỳ */}
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
              <span className="text-xs text-emerald-800 block">Dư nợ cuối kỳ:</span>
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-700 font-mono mt-1 block">
                0
              </span>
              <span className="text-[11px] text-emerald-600 font-medium">Tất toán hoàn toàn</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>
              <strong>Tổng số tiền phải trả bằng chữ:</strong>{' '}
              <em className="text-[#005596] font-medium font-serif">
                {numberToVietnameseWords(result.totalRepayment)}
              </em>
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Chu kỳ: {getCycleLabel(result.repaymentCycle)}
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. BẢNG LỊCH TRẢ NỢ CHI TIẾT (Section 9 & 16)                             */}
      {/* ========================================================================= */}
      {result.schedule.length > 0 && isFullScheduleVisible && (
        <div
          ref={scheduleTableRef}
          id="pledge-schedule-table"
          className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden animate-fadeIn"
        >
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-slate-50 to-white">
            <div>
              <h3 className="text-lg font-bold text-[#003B70]">
                Bảng Lịch Trả Nợ Chi Tiết Khoản Vay
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Căn cứ ngày giải ngân {result.disbursementDate}, chu kỳ{' '}
                {getCycleLabel(result.repaymentCycle)}, ngày trả nợ định kỳ {result.repaymentDay}
              </p>
            </div>

            <span className="text-xs font-semibold px-3 py-1 bg-white border border-slate-200 rounded-xl text-slate-600">
              Tổng {result.schedule.length} kỳ thanh toán
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#003B70] text-white font-bold text-xs uppercase tracking-wider">
                  <th className="py-3 px-3 sm:px-4 text-center border-r border-[#004e92]/40 w-12">
                    Kỳ
                  </th>
                  <th className="py-3 px-3 sm:px-4 border-r border-[#004e92]/40">Ngày trả nợ</th>
                  <th className="py-3 px-3 sm:px-4 text-right border-r border-[#004e92]/40">
                    Dư nợ đầu kỳ
                  </th>
                  <th className="py-3 px-3 sm:px-4 text-right border-r border-[#004e92]/40">
                    Gốc kỳ này
                  </th>
                  <th className="py-3 px-3 sm:px-4 text-right border-r border-[#004e92]/40">
                    Lãi kỳ này
                  </th>
                  <th className="py-3 px-3 sm:px-4 text-right border-r border-[#004e92]/40 bg-[#004e92]">
                    Tổng trả kỳ này
                  </th>
                  <th className="py-3 px-3 sm:px-4 text-right">Dư nợ cuối kỳ</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {result.schedule.map((row, idx) => (
                  <tr
                    key={row.period}
                    className={`hover:bg-sky-50/50 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                    }`}
                  >
                    <td className="py-3 px-3 sm:px-4 text-center font-bold text-slate-700 border-r border-slate-100">
                      {row.period}
                    </td>
                    <td className="py-3 px-3 sm:px-4 font-medium text-slate-700 border-r border-slate-100 font-mono">
                      {row.paymentDate}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-right font-mono text-slate-800 border-r border-slate-100">
                      {formatVND(row.beginningBalance)}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-right font-mono font-semibold text-slate-800 border-r border-slate-100">
                      {formatVND(row.principalPaid)}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-right font-mono text-amber-700 border-r border-slate-100">
                      {formatVND(row.interestPaid)}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-right font-mono font-bold text-[#005596] border-r border-slate-100 bg-sky-50/30">
                      {formatVND(row.totalPaid)}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-right font-mono font-semibold text-slate-700">
                      {formatVND(row.endingBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Summary Footer Row */}
              <tfoot>
                <tr className="bg-slate-100/90 font-bold text-slate-800 border-t-2 border-slate-300">
                  <td colSpan={3} className="py-3.5 px-4 text-center text-xs uppercase">
                    Tổng cộng:
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-900 border-r border-slate-200">
                    {formatVND(result.totalPrincipal)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-amber-700 border-r border-slate-200">
                    {formatVND(result.totalInterest)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#005596] bg-sky-100/70 border-r border-slate-200 text-sm">
                    {formatVND(result.totalRepayment)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-700">
                    0
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. BIỂU ĐỒ DƯ NỢ & CƠ CẤU GỐC / LÃI (Section 12 & 16)                     */}
      {/* ========================================================================= */}
      {result.schedule.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-[#003B70]">
                Biểu Đồ Lộ Trình Dư Nợ & Cơ Cấu Thanh Toán
              </h3>
              <p className="text-xs text-slate-500">
                Mô phỏng dư nợ giảm dần qua từng kỳ và tỷ trọng gốc vs lãi
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Chart: Dư nợ giảm dần qua các kỳ (SVG Chart) */}
            <div className="lg:col-span-8 space-y-3">
              <span className="text-xs font-semibold text-slate-600 block">
                Đường lộ trình dư nợ gốc giảm dần theo từng kỳ trả nợ:
              </span>

              <div className="h-48 sm:h-56 bg-slate-50/80 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>Khởi điểm: {formatVND(result.loanAmount)} VND</span>
                  <span>Kết thúc: 0 VND</span>
                </div>

                {/* SVG Visual Bar / Curve chart */}
                <div className="flex items-end gap-1.5 sm:gap-2 h-36 w-full pt-4">
                  {result.schedule.map((row) => {
                    const heightPercent = Math.max(
                      4,
                      Math.round((row.endingBalance / result.loanAmount) * 100)
                    );
                    return (
                      <div
                        key={row.period}
                        className="flex-1 flex flex-col items-center h-full justify-end group relative"
                      >
                        {/* Tooltip on hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-20 shadow-lg">
                          Kỳ {row.period} ({row.paymentDate}): {formatVND(row.endingBalance)} VND
                        </div>

                        {/* Bar */}
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full bg-gradient-to-t from-[#005596] to-sky-400 rounded-t-sm group-hover:opacity-80 transition-all cursor-pointer"
                        />
                        <span className="text-[9px] sm:text-[10px] text-slate-400 mt-1">
                          {row.period}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center text-[11px] text-slate-400">
                  Trục ngang: Các kỳ thanh toán (1 .. {result.totalPeriods})
                </div>
              </div>
            </div>

            {/* Right Chart: Cơ cấu gốc vs lãi */}
            <div className="lg:col-span-4 bg-slate-50/80 border border-slate-200 rounded-xl p-5 space-y-4">
              <span className="text-xs font-bold text-slate-700 block">
                Cơ cấu tổng số tiền phải trả:
              </span>

              {/* Visual Split Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#005596]">Gốc: {formatVND(result.totalPrincipal)}</span>
                  <span className="text-amber-600">Lãi: {formatVND(result.totalInterest)}</span>
                </div>
                <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-200 p-0.5 border border-slate-300">
                  <div
                    style={{
                      width: `${Math.round(
                        (result.totalPrincipal / (result.totalRepayment || 1)) * 100
                      )}%`,
                    }}
                    className="bg-[#005596] h-full rounded-l-full"
                    title="Tiền gốc"
                  />
                  <div
                    style={{
                      width: `${Math.round(
                        (result.totalInterest / (result.totalRepayment || 1)) * 100
                      )}%`,
                    }}
                    className="bg-amber-500 h-full rounded-r-full"
                    title="Tiền lãi"
                  />
                </div>
              </div>

              <div className="space-y-2 text-xs pt-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#005596]" />
                    <span className="text-slate-600">Tỷ trọng tiền gốc:</span>
                  </div>
                  <span className="font-bold font-mono text-[#005596]">
                    {Math.round((result.totalPrincipal / (result.totalRepayment || 1)) * 100)}%
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-slate-600">Tỷ trọng tiền lãi:</span>
                  </div>
                  <span className="font-bold font-mono text-amber-600">
                    {Math.round((result.totalInterest / (result.totalRepayment || 1)) * 100)}%
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                * Toàn bộ lịch trả nợ được xây dựng căn cứ trên các quy chuẩn giải ngân và thu nợ giảm dần chính thức của VietinBank.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
