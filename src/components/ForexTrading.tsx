import React, { useState, useMemo } from 'react';
import contentData from '../data/contentData.json';
import { ForexTransactionType, ForexCurrencyItem } from '../types';
import {
  ArrowLeftRight,
  Download,
  Calendar,
  Clock,
  Search,
  AlertCircle,
  TrendingUp,
  ExternalLink,
  X,
} from 'lucide-react';

export const ForexTrading: React.FC = () => {
  const { forexTrading } = contentData;
  const { converter, exchangeRates } = forexTrading;

  // 1. Converter State (Default value '0' matching PDF Page 1)
  const [activeTab, setActiveTab] = useState<ForexTransactionType>('cashBuy');
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>('USD');
  const [rawAmountInput, setRawAmountInput] = useState<string>('0');
  const [isReverse, setIsReverse] = useState<boolean>(false); // false: FX -> VND, true: VND -> FX
  const [usdEurNoteType, setUsdEurNoteType] = useState<'star' | 'amp'>('star'); // for USD, EUR: big notes (*) vs small notes (&)

  // 2. Exchange Rates Filter (Mặc nhiên tự động cập nhật từ nguồn https://www.vietinbank.vn/ca-nhan/ty-gia-khcn)
  const [filterDate, setFilterDate] = useState<string>('2026-09-13');
  const [filterTime, setFilterTime] = useState<string>('16:30:00');
  const [filterCurrency, setFilterCurrency] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Formatted date string for update notices (DD/MM/YYYY)
  const formattedDisplayDate = useMemo(() => {
    if (!filterDate) return '13/09/2026';
    const parts = filterDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return filterDate;
  }, [filterDate]);

  // Notice text matching PDF Page 1
  const updateNoticeText = useMemo(() => {
    return `Bảng tỷ giá được cập nhật lúc ${filterTime} ngày ${formattedDisplayDate}/ Exchange rates are updated at ${filterTime} ${formattedDisplayDate}`;
  }, [filterTime, formattedDisplayDate]);

  // Find currently selected currency object
  const currentCurrency = useMemo(() => {
    return (
      (exchangeRates.currencies as ForexCurrencyItem[]).find(
        (c) => c.code === selectedCurrencyCode
      ) || (exchangeRates.currencies[0] as ForexCurrencyItem)
    );
  }, [selectedCurrencyCode, exchangeRates.currencies]);

  // Determine effective exchange rate based on active tab and currency note type
  const effectiveRate = useMemo(() => {
    if (!currentCurrency) return 1;

    if (activeTab === 'cashBuy') {
      if (currentCurrency.code === 'USD' || currentCurrency.code === 'EUR') {
        return usdEurNoteType === 'star'
          ? currentCurrency.cashCheckStar || 0
          : currentCurrency.cashCheckAmp || 0;
      }
      return currentCurrency.cashCheck || currentCurrency.transfer || 0;
    }

    if (activeTab === 'transferBuy') {
      return currentCurrency.transfer || 0;
    }

    if (activeTab === 'sell') {
      return currentCurrency.sell || 0;
    }

    return currentCurrency.transfer || 0;
  }, [activeTab, currentCurrency, usdEurNoteType]);

  // Validation according to rules in PDF Page 1:
  // - Bắt buộc nhập
  // - Phải là số lớn hơn 0
  // - Không cho phép nhập ký tự chữ
  // - Nếu nhỏ hơn mức tối thiểu, hiển thị cảnh báo
  // Thông báo lỗi gợi ý: “Vui lòng nhập số quy đổi hợp lệ.”
  const numericAmount = useMemo(() => {
    const cleanStr = rawAmountInput.replace(/[^\d.]/g, '');
    const val = parseFloat(cleanStr);
    return isNaN(val) ? 0 : val;
  }, [rawAmountInput]);

  const inputError = useMemo(() => {
    if (rawAmountInput.trim() === '') {
      return 'Vui lòng nhập số quy đổi hợp lệ.';
    }
    if (numericAmount <= 0) {
      return 'Vui lòng nhập số quy đổi hợp lệ.';
    }
    return '';
  }, [rawAmountInput, numericAmount]);

  // Calculate converted result
  const calculatedResult = useMemo(() => {
    if (numericAmount <= 0 || !effectiveRate || effectiveRate <= 0) return 0;
    if (!isReverse) {
      // Ngoại tệ -> VND
      return numericAmount * effectiveRate;
    } else {
      // VND -> Ngoại tệ
      return numericAmount / effectiveRate;
    }
  }, [numericAmount, effectiveRate, isReverse]);

  // Handle amount input change: Only numeric characters & decimal dot allowed
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow empty or strictly numeric with optional single decimal point
    if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
      setRawAmountInput(val);
    }
  };

  // Filter currencies for the table
  const filteredCurrencies = useMemo(() => {
    return (exchangeRates.currencies as ForexCurrencyItem[]).filter((c) => {
      if (filterCurrency !== 'all' && c.code !== filterCurrency) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCode = c.code.toLowerCase().includes(q);
        const matchName = c.name.toLowerCase().includes(q);
        if (!matchCode && !matchName) return false;
      }
      return true;
    });
  }, [filterCurrency, searchQuery, exchangeRates.currencies]);

  // Handle Export / Download table to CSV
  const handleDownloadRates = () => {
    const meta = [
      ['NGAN HANG TMCP CONG THUONG VIET NAM - VIETINBANK'],
      ['BANG TY GIA NGOAI TE / EXCHANGE RATES'],
      ['Nguon du lieu chinh thuc: https://www.vietinbank.vn/ca-nhan/ty-gia-khcn'],
      [`Thoi diem cap nhat: ${filterTime} ngay ${formattedDisplayDate}`],
      ['Luu y: Bang ty gia chi mang tinh chat tham khao'],
      [],
      ['Ngoai te', 'Ten tien te', 'Mua TM & Sec (*)', 'Mua TM & Sec (&)', 'Mua Chuyen khoan', 'Ty gia Ban'],
    ];
    const rows = (exchangeRates.currencies as ForexCurrencyItem[]).map((c) => [
      c.code,
      c.name,
      c.code === 'USD' || c.code === 'EUR' ? c.cashCheckStar || '' : c.cashCheck || '',
      c.code === 'USD' || c.code === 'EUR' ? c.cashCheckAmp || '' : '',
      c.transfer || '',
      c.sell || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [...meta.map((m) => m.join(',')), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bang_ty_gia_VietinBank_${filterDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format numbers to match Vietnamese banking standards
  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(num);
  };

  const formatFX = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(num);
  };

  const formatRateCell = (val?: number | null) => {
    if (val === undefined || val === null) return '-';
    const hasDecimals = val % 1 !== 0;
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800">
      {/* ========================================================================= */}
      {/* 1. SECTION: QUY ĐỔI TỶ GIÁ NGOẠI TỆ/VND (Trang 1 PDF)                     */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 sm:p-8 space-y-6">
        {/* Main Title */}
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#003B70] tracking-tight">
            {converter.title}
          </h2>
        </div>

        {/* Transaction Mode Tabs matching Page 1 */}
        <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl">
          {converter.tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as ForexTransactionType)}
                className={`py-2 px-4 sm:px-5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#D71920] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#005596] hover:bg-white/80'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* If USD or EUR in Cash Buy mode: Mệnh giá 50, 100 (*) vs < 50 (&) */}
        {activeTab === 'cashBuy' && (selectedCurrencyCode === 'USD' || selectedCurrencyCode === 'EUR') && (
          <div className="flex flex-wrap items-center gap-2 p-3 bg-sky-50/70 border border-sky-100 rounded-xl text-xs text-slate-700">
            <span className="font-semibold text-[#005596]">Mệnh giá tiền mặt:</span>
            <div className="inline-flex rounded-lg border border-sky-200 bg-white p-0.5">
              <button
                type="button"
                onClick={() => setUsdEurNoteType('star')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  usdEurNoteType === 'star'
                    ? 'bg-[#005596] text-white'
                    : 'text-slate-600 hover:text-[#005596]'
                }`}
              >
                * Mệnh giá 50, 100 ({formatRateCell(currentCurrency.cashCheckStar)})
              </button>
              <button
                type="button"
                onClick={() => setUsdEurNoteType('amp')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  usdEurNoteType === 'amp'
                    ? 'bg-[#005596] text-white'
                    : 'text-slate-600 hover:text-[#005596]'
                }`}
              >
                & Mệnh giá &lt; 50 ({formatRateCell(currentCurrency.cashCheckAmp)})
              </button>
            </div>
          </div>
        )}

        {/* 2-Column Converter Boxes matching PDF Page 1 */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* Box 1: Số tiền quý khách cần quy đổi */}
          <div
            className={`md:col-span-5 bg-slate-50/90 p-4 rounded-xl border transition-all ${
              inputError
                ? 'border-amber-400 ring-2 ring-amber-100'
                : 'border-slate-200 focus-within:border-[#005596] focus-within:ring-2 focus-within:ring-sky-100'
            }`}
          >
            <label className="block text-xs font-medium text-slate-500 mb-2">
              {!isReverse ? converter.labels.inputAmount : 'Số tiền VND cần quy đổi'}
            </label>

            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                inputMode="decimal"
                value={rawAmountInput}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full bg-transparent text-2xl sm:text-3xl font-bold text-slate-800 focus:outline-none font-mono"
              />

              {!isReverse ? (
                <div className="relative shrink-0">
                  <select
                    value={selectedCurrencyCode}
                    onChange={(e) => setSelectedCurrencyCode(e.target.value)}
                    aria-label="Chọn loại ngoại tệ quy đổi"
                    className="appearance-none bg-white font-bold text-sm text-slate-800 py-2 pl-3 pr-8 rounded-lg border border-slate-200 shadow-2xs hover:border-[#005596] focus:outline-none cursor-pointer"
                  >
                    {(exchangeRates.currencies as ForexCurrencyItem[]).map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500 text-xs">
                    ▼
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-lg border border-slate-200 font-bold text-sm text-slate-800 shadow-2xs shrink-0">
                  <span>🇻🇳</span>
                  <span>VND</span>
                </div>
              )}
            </div>
          </div>

          {/* Direction Swap Button */}
          <div className="md:col-span-1 flex justify-center">
            <button
              type="button"
              onClick={() => setIsReverse((prev) => !prev)}
              title="Đổi chiều quy đổi (Ngoại tệ ⇄ VND)"
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-[#005596] text-slate-600 hover:text-white flex items-center justify-center transition-all shadow-xs border border-slate-200 cursor-pointer active:scale-95"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Box 2: Số tiền quy đổi */}
          <div className="md:col-span-5 bg-sky-50/60 p-4 rounded-xl border border-sky-200/80">
            <label className="block text-xs font-medium text-sky-900 mb-2">
              {converter.labels.outputAmount}
            </label>

            <div className="flex items-center justify-between gap-3">
              <div className="w-full text-2xl sm:text-3xl font-bold text-[#005596] font-mono tracking-tight truncate">
                {!isReverse ? formatVND(calculatedResult) : formatFX(calculatedResult)}
              </div>

              {!isReverse ? (
                <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-lg border border-sky-200 font-bold text-sm text-slate-800 shadow-2xs shrink-0">
                  <span>🇻🇳</span>
                  <span>VND</span>
                </div>
              ) : (
                <div className="relative shrink-0">
                  <select
                    value={selectedCurrencyCode}
                    onChange={(e) => setSelectedCurrencyCode(e.target.value)}
                    aria-label="Chọn loại ngoại tệ nhận sau quy đổi"
                    className="appearance-none bg-white font-bold text-sm text-slate-800 py-2 pl-3 pr-8 rounded-lg border border-sky-200 shadow-2xs hover:border-[#005596] focus:outline-none cursor-pointer"
                  >
                    {(exchangeRates.currencies as ForexCurrencyItem[]).map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500 text-xs">
                    ▼
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick helper buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span className="text-[11px] text-slate-400">Chọn nhanh:</span>
            {!isReverse
              ? [0, 100, 500, 1000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setRawAmountInput(amt.toString())}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 hover:bg-[#005596] hover:text-white transition-colors cursor-pointer font-mono text-slate-700"
                  >
                    {amt.toLocaleString('vi-VN')}
                  </button>
                ))
              : [10000000, 25000000, 50000000, 100000000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setRawAmountInput(amt.toString())}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 hover:bg-[#005596] hover:text-white transition-colors cursor-pointer font-mono text-slate-700"
                  >
                    {(amt / 1000000).toFixed(0)}Tr
                  </button>
                ))}
          </div>

          <div className="text-xs text-slate-500">
            Tỷ giá áp dụng:{' '}
            <strong className="text-[#005596]">
              1 {currentCurrency.code} = {formatRateCell(effectiveRate)} VND
            </strong>
          </div>
        </div>

        {/* Validation Alert Box if invalid */}
        {inputError && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{inputError}</span>
          </div>
        )}

        {/* ===================================================================== */}
        {/* NGUYÊN TẮC: QUY ĐỔI SỐ TIỀN (Chính xác theo mô tả Trang 1 PDF)       */}
        {/* ===================================================================== */}
        <div className="p-4 sm:p-5 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-2">
          <p className="font-bold text-[#003B70] text-sm sm:text-base">Nguyên tắc:</p>
          <p className="font-semibold text-slate-800">Số tiền quy đổi</p>
          <ul className="list-disc list-inside space-y-1 text-slate-600 ml-1">
            <li>Bắt buộc nhập</li>
            <li>Phải là số lớn hơn 0</li>
            <li>Không cho phép nhập ký tự chữ</li>
            <li>Nếu nhỏ hơn mức tối thiểu, hiển thị cảnh báo</li>
          </ul>
          <div className="pt-2 border-t border-slate-200/80">
            <p className="font-medium text-slate-600">
              Thông báo lỗi gợi ý:{' '}
              <span className="font-semibold text-rose-600">
                “Vui lòng nhập số quy đổi hợp lệ.”
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SECTION: TỶ GIÁ (Trang 1 & Trang 2 PDF)                                 */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 sm:p-8 space-y-6">
        {/* Section Header: "Thời gian cập nhật", Title "Tỷ giá", Download Button */}
        <div>
          <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Thời gian cập nhật
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-2xl font-extrabold text-[#003B70] tracking-tight">
              {exchangeRates.title}
            </h3>

            {/* Tải xuống bảng tỷ giá */}
            <button
              type="button"
              onClick={handleDownloadRates}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#005596] hover:text-[#003B70] hover:bg-sky-50 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Download className="w-4 h-4 text-[#005596]" />
              <span>{exchangeRates.downloadButton}</span>
            </button>
          </div>
        </div>

        {/* Filters: Ngày cập nhật, Thời điểm cập nhật, Ngoại tệ matching PDF Page 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Ngày cập nhật */}
          <div>
            <label className="block font-medium text-slate-600 mb-1.5">
              {exchangeRates.filterDate}
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={formattedDisplayDate}
                readOnly
                className="w-full bg-slate-50/80 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setFilterDate('2026-09-13')}
                title="Khôi phục ngày chuẩn"
                className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Thời điểm cập nhật */}
          <div>
            <label className="block font-medium text-slate-600 mb-1.5">
              {exchangeRates.filterTime}
            </label>
            <div className="relative">
              <select
                value={filterTime}
                onChange={(e) => setFilterTime(e.target.value)}
                className="appearance-none w-full bg-slate-50/80 px-3.5 py-2.5 pr-8 rounded-xl border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-[#005596] cursor-pointer"
              >
                <option value="16:30:00">16:30:00</option>
                <option value="11:00:00">11:00:00</option>
                <option value="08:30:00">08:30:00</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Ngoại tệ */}
          <div>
            <label className="block font-medium text-slate-600 mb-1.5">
              {exchangeRates.filterCurrency}
            </label>
            <div className="relative">
              <select
                value={filterCurrency}
                onChange={(e) => setFilterCurrency(e.target.value)}
                className="appearance-none w-full bg-slate-50/80 px-3.5 py-2.5 pr-8 rounded-xl border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-[#005596] cursor-pointer"
              >
                <option value="all">{exchangeRates.allCurrencies}</option>
                {(exchangeRates.currencies as ForexCurrencyItem[]).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500 text-xs">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* Highlighted Notice box matching Page 1 */}
        <div className="p-4 bg-sky-50/80 border border-sky-200/80 rounded-xl text-xs text-sky-950 space-y-1 shadow-2xs">
          <p className="font-semibold text-[#005596]">{updateNoticeText}</p>
          <p className="text-slate-600">{exchangeRates.starNote}</p>
          <p className="text-slate-600">{exchangeRates.ampersandNote}</p>
        </div>

        {/* Text lines matching Page 1 */}
        <div className="space-y-1 text-xs text-slate-600">
          <p>
            Ngày Cập nhật, thời điểm cập nhật: là ngày tỷ giá mặc nhiên tự động tại trang wed:{' '}
            <a
              href="https://www.vietinbank.vn/ca-nhan/ty-gia-khcn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#005596] hover:text-[#D71920] underline underline-offset-2 font-medium inline-flex items-center gap-1"
            >
              https://www.vietinbank.vn/ca-nhan/ty-gia-khcn
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
          <p className="italic">{exchangeRates.disclaimer}</p>
          <p className="pt-2 text-slate-700 font-medium">{exchangeRates.displayNotice}</p>
        </div>

        {/* Quick Search filter bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã hoặc tên ngoại tệ..."
              className="w-full bg-slate-50/80 pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-[#005596]"
            />
          </div>
        </div>

        {/* 18-Currencies Table (Trang 2 PDF) */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
          <table className="w-full text-left border-collapse">
            <thead>
              {/* Row 1: Main Headers */}
              <tr className="bg-[#003B70] text-white text-xs font-bold uppercase tracking-wider">
                <th rowSpan={2} className="py-3.5 px-4 sm:px-6 border-r border-[#004e92]/40">
                  {exchangeRates.columns.currency}
                </th>
                <th
                  colSpan={2}
                  className="py-2.5 px-4 text-center border-r border-[#004e92]/40 border-b border-[#004e92]/40 bg-[#004785]"
                >
                  {exchangeRates.columns.buyingRate}
                </th>
                <th rowSpan={2} className="py-3.5 px-4 sm:px-6 text-right">
                  {exchangeRates.columns.sellingRate}
                </th>
              </tr>
              {/* Row 2: Sub Headers */}
              <tr className="bg-[#004785] text-sky-100 text-[11px] uppercase font-semibold">
                <th className="py-2 px-4 text-center border-r border-[#005596]/40">
                  {exchangeRates.columns.cashAndCheck}
                </th>
                <th className="py-2 px-4 text-center border-r border-[#005596]/40">
                  {exchangeRates.columns.transfer}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredCurrencies.map((c, idx) => {
                const isSelected = selectedCurrencyCode === c.code;
                return (
                  <tr
                    key={c.code}
                    onClick={() => setSelectedCurrencyCode(c.code)}
                    className={`transition-colors cursor-pointer hover:bg-sky-50/60 ${
                      isSelected
                        ? 'bg-sky-50/80 font-medium'
                        : idx % 2 === 0
                        ? 'bg-white'
                        : 'bg-slate-50/40'
                    }`}
                  >
                    {/* Currency */}
                    <td className="py-3 px-4 sm:px-6 border-r border-slate-100 font-bold text-slate-800">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{c.flag}</span>
                        <div>
                          <span className="text-[#005596] font-bold">{c.code}</span>
                          <span className="hidden sm:inline text-xs text-slate-500 ml-1.5 font-normal">
                            ({c.name})
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Cash & Check */}
                    <td className="py-3 px-4 text-center border-r border-slate-100 font-mono">
                      {c.code === 'USD' || c.code === 'EUR' ? (
                        <div className="space-y-0.5">
                          <div className="text-slate-800 font-bold">
                            * {formatRateCell(c.cashCheckStar)}
                          </div>
                          <div className="text-slate-500 text-xs">
                            & {formatRateCell(c.cashCheckAmp)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-800">{formatRateCell(c.cashCheck)}</span>
                      )}
                    </td>

                    {/* Transfer */}
                    <td className="py-3 px-4 text-center border-r border-slate-100 font-mono font-semibold text-slate-800">
                      {formatRateCell(c.transfer)}
                    </td>

                    {/* Sell */}
                    <td className="py-3 px-4 sm:px-6 text-right font-mono font-bold text-rose-700">
                      {formatRateCell(c.sell)}
                    </td>
                  </tr>
                );
              })}

              {filteredCurrencies.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    Không tìm thấy ngoại tệ phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
