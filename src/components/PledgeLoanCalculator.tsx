import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  RepaymentCycle,
  RoundingRule,
  PledgeRepaymentMethod,
  PledgeCalculationResult,
} from '../types';
import {
  calculatePledgeLoan,
  calculateMaxAllowedDays,
} from '../utils/pledgeLoanCalculator';
import {
  formatVND,
  parseFormattedNumber,
  formatRate,
  numberToVietnameseWords,
} from '../utils/formatters';
import {
  Calculator,
  RotateCcw,
  Printer,
  Download,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sliders,
  ChevronDown,
  BookOpen,
  DollarSign,
  TrendingDown,
  Clock,
} from 'lucide-react';

export const PledgeLoanCalculator: React.FC = () => {
  // =========================================================================
  // 1. THÔNG TIN SỔ TIẾT KIỆM (Section 2)
  // =========================================================================
  const [depositAmountRaw, setDepositAmountRaw] = useState<string>('600000000'); // 600.000.000 VNĐ
  const [depositOpenDate, setDepositOpenDate] = useState<string>('2026-01-01');
  const [depositMaturityDate, setDepositMaturityDate] = useState<string>('2027-01-15');
  const [depositRateStr, setDepositRateStr] = useState<string>('5.5');
  const [currency, setCurrency] = useState<string>('VND');

  // =========================================================================
  // 2. THÔNG TIN KHOẢN VAY CẦM CỐ (Section 3)
  // - Số tiền vay: nhập trực tiếp, không sử dụng thanh kéo/thả.
  // - Thời hạn vay (ngày): tối đa bằng ngày đến hạn sổ tiết kiệm.
  // - Chu kỳ trả nợ: bằng ngày đến hạn sổ tiết kiệm.
  // - Phương thức trả nợ mặc định: trả một lần vào ngày đến hạn khoản vay
  // =========================================================================
  const [loanAmountRaw, setLoanAmountRaw] = useState<string>('500000000'); // 500.000.000 VNĐ
  const [annualRateStr, setAnnualRateStr] = useState<string>('12.0'); // 12%/năm
  const [disbursementDate, setDisbursementDate] = useState<string>('2026-01-10');

  // Thời hạn vay (ngày) - mặc định 370 ngày (khoảng cách từ 10/01/2026 đến 15/01/2027)
  const [loanTermDays, setLoanTermDays] = useState<number>(370);
  const [repaymentMethod, setRepaymentMethod] = useState<PledgeRepaymentMethod>('bullet'); // Mặc định: trả một lần vào ngày đến hạn (Section 3 & 5)
  const [repaymentCycle, setRepaymentCycle] = useState<RepaymentCycle>('monthly');
  const [repaymentDay, setRepaymentDay] = useState<number>(25);
  const [roundingRule, setRoundingRule] = useState<RoundingRule>('dong');

  // =========================================================================
  // 3. CẤU HÌNH TỶ LỆ CHO VAY TỐI ĐA (Section 4 - không hard-code)
  // =========================================================================
  const [maxLtvRatio, setMaxLtvRatio] = useState<number>(95); // 95% mặc định
  const [showConfigLtv, setShowConfigLtv] = useState<boolean>(false);

  // Hiển thị bảng lịch trả nợ
  const [showSchedule, setShowSchedule] = useState<boolean>(true);
  const overviewRef = useRef<HTMLDivElement>(null);
  const scheduleRef = useRef<HTMLDivElement>(null);

  // Parse values
  const numericDepositAmount = useMemo(() => parseFormattedNumber(depositAmountRaw), [depositAmountRaw]);
  const numericLoanAmount = useMemo(() => parseFormattedNumber(loanAmountRaw), [loanAmountRaw]);
  const numericAnnualRate = useMemo(() => {
    const p = parseFloat(annualRateStr.replace(',', '.'));
    return isNaN(p) ? 0 : p;
  }, [annualRateStr]);
  const numericDepositRate = useMemo(() => {
    const p = parseFloat(depositRateStr.replace(',', '.'));
    return isNaN(p) ? 0 : p;
  }, [depositRateStr]);

  // Hạn mức vay tối đa theo tỷ lệ LTV cấu hình (Section 4)
  const calculatedMaxLimit = useMemo(() => {
    return Math.round(numericDepositAmount * (maxLtvRatio / 100));
  }, [numericDepositAmount, maxLtvRatio]);

  // Số NGÀY tối đa cho phép từ ngày giải ngân đến ngày đến hạn sổ (Section 3: Thời hạn vay (ngày): tối đa bằng ngày đến hạn sổ tiết kiệm)
  const maxAllowedDays = useMemo(() => {
    return calculateMaxAllowedDays(disbursementDate, depositMaturityDate);
  }, [disbursementDate, depositMaturityDate]);

  // Khi người dùng thay đổi ngày giải ngân hoặc ngày đáo hạn sổ, nếu loanTermDays chưa chỉnh hoặc vượt quá, có thể tự động đồng bộ
  useEffect(() => {
    if (maxAllowedDays > 0 && loanTermDays > maxAllowedDays) {
      setLoanTermDays(maxAllowedDays);
    }
  }, [maxAllowedDays]);

  // Tính toán khoản vay
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
      loanTermDays,
      repaymentMethod,
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
    loanTermDays,
    repaymentMethod,
    repaymentCycle,
    repaymentDay,
    maxLtvRatio,
    roundingRule,
  ]);

  // Handlers
  const handleDepositChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^\d]/g, '');
    setDepositAmountRaw(cleaned);
  };

  const handleLoanAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^\d]/g, '');
    setLoanAmountRaw(cleaned);
  };

  // Làm lại (Reset form)
  const handleReset = () => {
    setDepositAmountRaw('600000000');
    setDepositOpenDate('2026-01-01');
    setDepositMaturityDate('2027-01-15');
    setDepositRateStr('5.5');
    setCurrency('VND');
    setLoanAmountRaw('500000000');
    setAnnualRateStr('12.0');
    setDisbursementDate('2026-01-10');
    setLoanTermDays(370);
    setRepaymentMethod('bullet');
    setRepaymentCycle('monthly');
    setRepaymentDay(25);
    setRoundingRule('dong');
    setMaxLtvRatio(95);
    setShowSchedule(true);
  };

  // Nút [TÍNH TOÁN]
  const handleCalculate = () => {
    setShowSchedule(true);
    if (overviewRef.current) {
      overviewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Nút [XEM CHI TIẾT]
  const handleViewDetails = () => {
    setShowSchedule(true);
    if (scheduleRef.current) {
      scheduleRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Xuất file CSV/Excel
  const handleExportCSV = () => {
    if (!result.schedule || result.schedule.length === 0) return;

    const headers = [
      'Kỳ',
      'Ngày trả nợ',
      'Dư nợ đầu kỳ (VNĐ)',
      'Gốc kỳ này (VNĐ)',
      'Lãi kỳ này (VNĐ)',
      'Tổng trả kỳ này (VNĐ)',
      'Dư nợ cuối kỳ (VNĐ)',
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
        `BẢNG LỊCH TRẢ NỢ VAY CẦM CỐ SỔ TIẾT KIỆM`,
        `Giá trị sổ tiết kiệm: ${formatVND(result.depositAmount)} VNĐ | Tỷ lệ LTV: ${result.maxLtvRatio}% | Hạn mức tối đa: ${formatVND(result.maxLoanLimit)} VNĐ`,
        `Số tiền vay: ${formatVND(result.loanAmount)} VNĐ | Thời hạn vay: ${result.loanTermDays} ngày | Ngày đến hạn: ${result.loanMaturityDate} | Lãi suất: ${result.annualRate}%/năm`,
        `Phương thức: ${result.repaymentMethod === 'bullet' ? 'Trả một lần vào ngày đến hạn khoản vay' : 'Gốc trả đều, lãi dư nợ giảm dần'}`,
        '',
        headers.join(','),
        ...rows.map((r) => r.join(',')),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Lich_tra_no_cam_co_so_tiet_kiem.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-800 font-sans">
      {/* ========================================================================= */}
      {/* 1. HEADER → CẦM CỐ SỔ TIẾT KIỆM                                           */}
      {/* ========================================================================= */}
      <div className="bg-[#003B70] text-white rounded-xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            CẦM CỐ SỔ TIẾT KIỆM
          </h2>
          <p className="text-xs sm:text-sm text-sky-100 mt-1">
            Mô phỏng khoản vay cầm cố sổ tiết kiệm, tự động tính hạn mức, khoản trả nợ đến hạn.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowConfigLtv(!showConfigLtv)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-sky-100 border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Tỷ lệ LTV ({maxLtvRatio}%)</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Làm lại</span>
          </button>
        </div>
      </div>

      {/* Panel cấu hình tham số LTV (Section 4: tỷ lệ cho vay tối đa là tham số cấu hình) */}
      {showConfigLtv && (
        <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-xs space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-bold text-sky-900">
              Cấu hình tỷ lệ cho vay tối đa trên giá trị sổ tiết kiệm:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="50"
                max="100"
                value={maxLtvRatio}
                onChange={(e) => setMaxLtvRatio(Number(e.target.value) || 95)}
                className="w-20 px-2 py-1 bg-white border border-sky-300 rounded font-mono font-bold text-center"
              />
              <span className="font-bold text-sky-900">%</span>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-slate-500">Mức quy định phổ biến:</span>
            {[80, 85, 90, 95, 100].map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => setMaxLtvRatio(ratio)}
                className={`px-2.5 py-0.5 rounded text-xs font-semibold cursor-pointer ${
                  maxLtvRatio === ratio
                    ? 'bg-[#003B70] text-white'
                    : 'bg-white border border-sky-200 text-sky-800 hover:bg-sky-100'
                }`}
              >
                {ratio}%
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2 & 3. THÔNG TIN SỔ TIẾT KIỆM & THÔNG TIN KHOẢN VAY                       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* CARD: THÔNG TIN SỔ TIẾT KIỆM (Section 2) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <BookOpen className="w-4 h-4 text-[#003B70]" />
            <h3 className="font-bold text-[#003B70] text-sm sm:text-base">
              THÔNG TIN SỔ TIẾT KIỆM
            </h3>
          </div>

          {/* Số tiền trên sổ tiết kiệm */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Số tiền trên sổ tiết kiệm (VNĐ) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={formatVND(numericDepositAmount)}
              onChange={handleDepositChange}
              placeholder="Nhập số tiền trên sổ"
              className="w-full bg-slate-50 border border-slate-300 focus:border-[#003B70] focus:bg-white rounded-lg px-3 py-2 text-base font-bold text-slate-800 font-mono transition-colors"
            />
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              Bằng chữ: {numberToVietnameseWords(numericDepositAmount)}
            </p>
          </div>

          {/* Ngày mở sổ & Ngày đáo hạn */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày mở sổ
              </label>
              <input
                type="date"
                value={depositOpenDate}
                onChange={(e) => setDepositOpenDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày đến hạn sổ <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={depositMaturityDate}
                onChange={(e) => setDepositMaturityDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-medium"
              />
            </div>
          </div>

          {/* Lãi suất tiền gửi (%/năm) & Loại tiền */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lãi suất tiền gửi (%/năm)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={depositRateStr}
                onChange={(e) => setDepositRateStr(e.target.value)}
                placeholder="5.5"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-bold font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Loại tiền tệ
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-semibold"
              >
                <option value="VND">VNĐ</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
        </div>

        {/* CARD: THÔNG TIN KHOẢN VAY CẦM CỐ (Section 3) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <DollarSign className="w-4 h-4 text-[#003B70]" />
            <h3 className="font-bold text-[#003B70] text-sm sm:text-base">
              THÔNG TIN KHOẢN VAY
            </h3>
          </div>

          {/* Số tiền vay: Nhập trực tiếp, không sử dụng thanh kéo/thả (Section 3) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Số tiền đề nghị vay (VNĐ) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setLoanAmountRaw(calculatedMaxLimit.toString())}
                className="text-[11px] font-bold text-[#003B70] hover:underline cursor-pointer"
              >
                Chọn vay tối đa
              </button>
            </div>
            <input
              type="text"
              inputMode="numeric"
              value={formatVND(numericLoanAmount)}
              onChange={handleLoanAmountChange}
              placeholder="Nhập số tiền vay"
              className="w-full bg-slate-50 border border-slate-300 focus:border-[#003B70] focus:bg-white rounded-lg px-3 py-2 text-base font-bold text-slate-800 font-mono transition-colors"
            />
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              Bằng chữ: {numberToVietnameseWords(numericLoanAmount)}
            </p>
          </div>

          {/* Lãi suất vay & Ngày giải ngân */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lãi suất cho vay (%/năm) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={annualRateStr}
                onChange={(e) => setAnnualRateStr(e.target.value)}
                placeholder="12.0"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-bold font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày giải ngân <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={disbursementDate}
                onChange={(e) => setDisbursementDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-medium"
              />
            </div>
          </div>

          {/* THỜI HẠN VAY (NGÀY): TỐI ĐA BẰNG NGÀY ĐẾN HẠN SỔ TIẾT KIỆM (Section 3) */}
          <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#003B70]" />
                <span>Thời hạn vay (ngày)</span> <span className="text-rose-500">*</span>
              </label>
              {maxAllowedDays > 0 && (
                <button
                  type="button"
                  onClick={() => setLoanTermDays(maxAllowedDays)}
                  className="text-[11px] font-bold text-[#003B70] hover:underline cursor-pointer"
                >
                  Bằng hạn sổ ({maxAllowedDays} ngày)
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type="number"
                min="1"
                max={maxAllowedDays || 9999}
                value={loanTermDays || ''}
                onChange={(e) => setLoanTermDays(Math.max(0, Number(e.target.value) || 0))}
                placeholder="Nhập số ngày vay"
                className="w-full bg-white border border-slate-300 focus:border-[#003B70] rounded-lg px-3 py-2 text-sm font-bold font-mono text-slate-800"
              />
              <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400">
                ngày
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
              <span className="text-slate-500">
                Tối đa: <strong className="text-slate-800 font-mono">{maxAllowedDays} ngày</strong> (tính đến ngày đến hạn sổ)
              </span>
              {result.loanMaturityDate && result.loanMaturityDate !== '-' && (
                <span className="text-[#003B70] font-semibold">
                  Ngày đáo hạn: <strong className="font-mono">{result.loanMaturityDate}</strong>
                </span>
              )}
            </div>

            {/* Các nút chọn nhanh số ngày phổ biến */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[30, 60, 90, 180, 365]
                .filter((d) => d <= (maxAllowedDays || 9999))
                .map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setLoanTermDays(d)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                      loanTermDays === d
                        ? 'bg-[#003B70] text-white'
                        : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {d} ngày
                  </button>
                ))}
              {maxAllowedDays > 0 && ![30, 60, 90, 180, 365].includes(maxAllowedDays) && (
                <button
                  type="button"
                  onClick={() => setLoanTermDays(maxAllowedDays)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                    loanTermDays === maxAllowedDays
                      ? 'bg-[#003B70] text-white'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                  }`}
                >
                  Tối đa theo sổ ({maxAllowedDays} ngày)
                </button>
              )}
            </div>
          </div>

          {/* Phương thức trả nợ & Chu kỳ trả nợ (Section 3: Mặc định trả một lần khi đến hạn, chu kỳ = bằng ngày đến hạn sổ) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phương thức trả nợ
              </label>
              <select
                value={repaymentMethod}
                onChange={(e) => setRepaymentMethod(e.target.value as PledgeRepaymentMethod)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-semibold"
              >
                <option value="bullet">Trả một lần khi đến hạn (Mặc định)</option>
                <option value="declining">Gốc đều, lãi giảm dần</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chu kỳ trả nợ
              </label>
              {repaymentMethod === 'bullet' ? (
                <div className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium">
                  Đến hạn khoản vay ({result.loanMaturityDate || '-'})
                </div>
              ) : (
                <select
                  value={repaymentCycle}
                  onChange={(e) => setRepaymentCycle(e.target.value as RepaymentCycle)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-medium"
                >
                  <option value="monthly">Hằng tháng</option>
                  <option value="quarterly">Hằng quý (3 tháng)</option>
                  <option value="semiAnnual">6 tháng</option>
                  <option value="annual">Hằng năm</option>
                </select>
              )}
            </div>
          </div>

          {/* Ngày trả nợ định kỳ (nếu là gốc đều, lãi giảm dần) */}
          {repaymentMethod === 'declining' && (
            <div className="pt-1 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày trả nợ định kỳ hằng tháng
              </label>
              <select
                value={repaymentDay}
                onChange={(e) => setRepaymentDay(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-medium"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    Ngày {d}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. KẾT QUẢ HẠN MỨC VAY (Section 4 & Section 8)                             */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-bold text-[#003B70] text-sm sm:text-base">
            KẾT QUẢ HẠN MỨC VAY
          </h3>
          {!result.isExceeded ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Đủ điều kiện hạn mức</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Vượt hạn mức tối đa</span>
            </span>
          )}
        </div>

        {/* 4 Chỉ số so sánh trực tiếp */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block">Giá trị sổ tiết kiệm:</span>
            <span className="text-sm sm:text-base font-bold text-slate-800 font-mono mt-0.5 block">
              {formatVND(numericDepositAmount)} VNĐ
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block">Tỷ lệ cho vay (LTV):</span>
            <span className="text-sm sm:text-base font-bold text-[#003B70] font-mono mt-0.5 block">
              {maxLtvRatio}%
            </span>
          </div>
          <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-200">
            <span className="text-emerald-800 block font-medium">Hạn mức vay tối đa:</span>
            <span className="text-sm sm:text-base font-bold text-emerald-700 font-mono mt-0.5 block">
              {formatVND(calculatedMaxLimit)} VNĐ
            </span>
          </div>
          <div
            className={`p-3 rounded-lg border ${
              result.isExceeded
                ? 'bg-rose-50 border-rose-200'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span
              className={`block font-medium ${
                result.isExceeded ? 'text-rose-700' : 'text-slate-500'
              }`}
            >
              Số tiền yêu cầu vay:
            </span>
            <span
              className={`text-sm sm:text-base font-bold font-mono mt-0.5 block ${
                result.isExceeded ? 'text-rose-600' : 'text-slate-800'
              }`}
            >
              {formatVND(numericLoanAmount)} VNĐ
            </span>
          </div>
        </div>

        {/* Cảnh báo vi phạm theo Section 8 (Kiểm tra dữ liệu và cảnh báo) */}
        {result.validationErrors.length > 0 && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Cảnh báo: Không thể tạo lịch trả nợ do dữ liệu chưa phù hợp</span>
            </div>
            <ul className="list-disc list-inside text-xs text-rose-700 pl-1 space-y-0.5">
              {result.validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. NÚT CHỨC NĂNG [TÍNH TOÁN] [XEM CHI TIẾT]                               */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCalculate}
            className="px-5 py-2 rounded-lg font-bold text-xs sm:text-sm text-white bg-[#003B70] hover:bg-[#002b52] transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Calculator className="w-4 h-4" />
            <span>TÍNH TOÁN</span>
          </button>
          <button
            type="button"
            onClick={handleViewDetails}
            disabled={result.schedule.length === 0}
            className={`px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm border transition-colors flex items-center gap-1.5 cursor-pointer ${
              result.schedule.length === 0
                ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
                : 'bg-white border-[#003B70] text-[#003B70] hover:bg-slate-50'
            }`}
          >
            <ChevronDown className="w-4 h-4" />
            <span>XEM CHI TIẾT</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 rounded-lg font-medium text-xs sm:text-sm text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Làm lại
          </button>
        </div>

        <div className="text-xs text-slate-500">
          {result.schedule.length > 0 ? (
            <span className="text-emerald-700 font-semibold">
              ✓ Đã tính toán ({result.schedule.length} kỳ)
            </span>
          ) : (
            <span className="text-rose-600 font-medium">Chưa có lịch trả nợ</span>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. TỔNG QUAN KHOẢN VAY (Section 7 của tài liệu)                           */}
      {/* ========================================================================= */}
      {result.schedule.length > 0 && (
        <div
          ref={overviewRef}
          className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs animate-fadeIn"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <TrendingDown className="w-4 h-4 text-[#003B70]" />
            <h3 className="font-bold text-[#003B70] text-sm sm:text-base">
              TỔNG QUAN KHOẢN VAY
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
            {/* 1. Số tiền vay */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Số tiền vay:</span>
              <span className="text-base font-bold text-[#003B70] font-mono mt-0.5 block">
                {formatVND(result.loanAmount)} VNĐ
              </span>
            </div>

            {/* 2. Thời hạn vay (ngày) & Ngày đến hạn */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Thời hạn vay:</span>
              <span className="text-base font-bold text-slate-800 font-mono mt-0.5 block">
                {result.loanTermDays} ngày
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Đáo hạn: {result.loanMaturityDate}
              </span>
            </div>

            {/* 3. Lãi suất */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Lãi suất cho vay:</span>
              <span className="text-base font-bold text-amber-600 font-mono mt-0.5 block">
                {formatRate(result.annualRate)}%/năm
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Cơ sở tính: 365 ngày
              </span>
            </div>

            {/* 4. Tổng tiền gốc */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Tổng tiền gốc:</span>
              <span className="text-base font-bold text-slate-800 font-mono mt-0.5 block">
                {formatVND(result.totalPrincipal)} VNĐ
              </span>
            </div>

            {/* 5. Tổng tiền lãi */}
            <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200">
              <span className="text-amber-900 block font-medium">Tổng tiền lãi:</span>
              <span className="text-base font-bold text-amber-700 font-mono mt-0.5 block">
                {formatVND(result.totalInterest)} VNĐ
              </span>
            </div>

            {/* 6. Tổng số tiền phải trả */}
            <div className="p-3 bg-sky-50 rounded-lg border border-sky-200">
              <span className="text-sky-900 block font-medium">Tổng tiền phải trả:</span>
              <span className="text-base font-bold text-[#003B70] font-mono mt-0.5 block">
                {formatVND(result.totalRepayment)} VNĐ
              </span>
            </div>

            {/* 7. Dư nợ cuối kỳ (Section 6 & 7: Dư nợ cuối cùng phải bằng 0) */}
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 col-span-2 sm:col-span-1">
              <span className="text-emerald-900 block font-medium">Dư nợ cuối kỳ:</span>
              <span className="text-base font-bold text-emerald-700 font-mono mt-0.5 block">
                0 VNĐ
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. BẢNG LỊCH TRẢ NỢ (Hiển thị khi bấm "Xem chi tiết" / "Tính toán")         */}
      {/* ========================================================================= */}
      {result.schedule.length > 0 && showSchedule && (
        <div
          ref={scheduleRef}
          className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs animate-fadeIn"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-[#003B70] text-sm sm:text-base">
                BẢNG LỊCH TRẢ NỢ CHI TIẾT
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Phương thức:{' '}
                {result.repaymentMethod === 'bullet'
                  ? 'Trả một lần vào ngày đến hạn khoản vay'
                  : 'Trả gốc đều, lãi tính trên dư nợ giảm dần'}
                {' • '}Thời hạn vay: {result.loanTermDays} ngày
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải Excel</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In lịch</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="py-2.5 px-3 font-bold text-center w-12">Kỳ</th>
                  <th className="py-2.5 px-3 font-bold">Ngày trả nợ</th>
                  <th className="py-2.5 px-3 font-bold text-right">Dư nợ đầu kỳ</th>
                  <th className="py-2.5 px-3 font-bold text-right">Gốc trả</th>
                  <th className="py-2.5 px-3 font-bold text-right">Lãi trả</th>
                  <th className="py-2.5 px-3 font-bold text-right text-[#003B70]">
                    Tổng trả kỳ
                  </th>
                  <th className="py-2.5 px-3 font-bold text-right">Dư nợ cuối kỳ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {result.schedule.map((row) => (
                  <tr key={row.period} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-3 text-center font-bold text-slate-600 font-sans">
                      {row.period}
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-800">
                      {row.paymentDate}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-600">
                      {formatVND(row.beginningBalance)}
                    </td>
                    <td className="py-2 px-3 text-right font-semibold text-slate-800">
                      {formatVND(row.principalPaid)}
                    </td>
                    <td className="py-2 px-3 text-right text-amber-700">
                      {formatVND(row.interestPaid)}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-[#003B70]">
                      {formatVND(row.totalPaid)}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-600">
                      {formatVND(row.endingBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold text-slate-800 border-t-2 border-slate-300 font-mono">
                  <td colSpan={2} className="py-2.5 px-3 text-center font-sans">
                    Tổng cộng
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400 font-sans">-</td>
                  <td className="py-2.5 px-3 text-right">{formatVND(result.totalPrincipal)}</td>
                  <td className="py-2.5 px-3 text-right text-amber-700">
                    {formatVND(result.totalInterest)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-[#003B70]">
                    {formatVND(result.totalRepayment)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-700">0</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
