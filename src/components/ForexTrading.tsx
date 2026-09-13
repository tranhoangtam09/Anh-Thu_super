import React, { useState, useMemo } from 'react';
import contentData from '../data/contentData.json';
import { ForexTransactionType, ForexCurrencyItem } from '../types';
import {
  ArrowLeftRight,
  Download,
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Mail,
  Send,
  Building2,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const ForexTrading: React.FC = () => {
  const { forexTrading, media, brand } = contentData;
  const { converter, exchangeRates, goldRates, newsletter } = forexTrading;

  // 1. Converter State
  const [activeTab, setActiveTab] = useState<ForexTransactionType>('cashBuy');
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>('USD');
  const [rawAmountInput, setRawAmountInput] = useState<string>('1000');
  const [isReverse, setIsReverse] = useState<boolean>(false); // false: FX -> VND, true: VND -> FX
  const [usdEurNoteType, setUsdEurNoteType] = useState<'star' | 'amp'>('star'); // for USD, EUR: big notes vs small notes

  // 2. Exchange Rates Filter State
  const [filterDate, setFilterDate] = useState<string>('2026-09-13');
  const [filterTime, setFilterTime] = useState<string>('16:30:00');
  const [filterCurrency, setFilterCurrency] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 3. Gold Rates Filter State
  const [goldFilterDate, setGoldFilterDate] = useState<string>('2026-09-13');

  // 4. Newsletter Form State
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [newsletterType, setNewsletterType] = useState<string>('');
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  // Find currently selected currency object
  const currentCurrency = useMemo(() => {
    return (
      (exchangeRates.currencies as ForexCurrencyItem[]).find(
        (c) => c.code === selectedCurrencyCode
      ) || (exchangeRates.currencies[0] as ForexCurrencyItem)
    );
  }, [selectedCurrencyCode, exchangeRates.currencies]);

  // Determine the effective exchange rate based on active tab and currency notes
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

  // Validation according to rules in PDF:
  // - Bắt buộc nhập
  // - Phải là số lớn hơn 0
  // - Không cho phép nhập ký tự chữ
  // - Nếu nhỏ hơn mức tối thiểu, hiển thị cảnh báo
  const numericAmount = useMemo(() => {
    const cleanStr = rawAmountInput.replace(/[^\d.]/g, '');
    const val = parseFloat(cleanStr);
    return isNaN(val) ? 0 : val;
  }, [rawAmountInput]);

  const inputError = useMemo(() => {
    if (rawAmountInput.trim() === '') {
      return converter.labels.errorRequired;
    }
    if (numericAmount <= 0) {
      return converter.labels.errorGreaterThanZero;
    }
    return '';
  }, [rawAmountInput, numericAmount, converter.labels]);

  // Calculate converted result
  const calculatedResult = useMemo(() => {
    if (numericAmount <= 0 || effectiveRate <= 0) return 0;

    if (!isReverse) {
      // FX -> VND
      return numericAmount * effectiveRate;
    } else {
      // VND -> FX
      return numericAmount / effectiveRate;
    }
  }, [numericAmount, effectiveRate, isReverse]);

  // Sanitize input: allow only digits and decimal point
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow digits and only one dot or comma
    const sanitized = val.replace(/[^0-9.,]/g, '').replace(/,/g, '.');
    // Prevent multiple dots
    const parts = sanitized.split('.');
    if (parts.length > 2) return;
    setRawAmountInput(sanitized);
  };

  // Filtered currency list for table
  const filteredCurrencies = useMemo(() => {
    return (exchangeRates.currencies as ForexCurrencyItem[]).filter((item) => {
      const matchFilter = filterCurrency === 'all' || item.code === filterCurrency;
      const matchSearch =
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [exchangeRates.currencies, filterCurrency, searchQuery]);

  // Handle Export / Download table to CSV
  const handleDownloadRates = () => {
    const headers = [
      'Ngoại tệ',
      'Tên tiền tệ',
      'Mua TM & Séc (*)',
      'Mua TM & Séc (&)',
      'Mua Chuyển khoản',
      'Tỷ giá Bán',
    ];
    const rows = (exchangeRates.currencies as ForexCurrencyItem[]).map((c) => [
      c.code,
      c.name,
      c.cashCheckStar || c.cashCheck || '-',
      c.cashCheckAmp || '-',
      c.transfer || '-',
      c.sell || '-',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bang_ty_gia_VietinBank_${filterDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle newsletter form submit
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !newsletterType) {
      setFormError('Vui lòng điền đầy đủ các trường thông tin bắt buộc (*).');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setFormError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    setFormError('');
    setFormSubmitted(true);
  };

  // Format number helper
  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(num);
  };

  const formatFX = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(num);
  };

  const formatRateCell = (val?: number | null) => {
    if (val === undefined || val === null) return '-';
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: val % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="space-y-10 animate-fadeIn text-slate-800">
      {/* ========================================================================= */}
      {/* 1. SECTION: QUY ĐỔI TỶ GIÁ NGOẠI TỆ / VND (Exact Match to PDF Page 1)       */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Card Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-gradient-to-r from-slate-50 to-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#005596]/10 text-[#005596]">
                <ArrowLeftRight className="w-5 h-5" />
              </span>
              <h3 className="text-xl font-extrabold text-[#003B70] tracking-tight">
                {converter.title}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">{converter.subtitle}</p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Áp dụng từ: 16:30:00 (13/09/2026)</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 3 Transaction Tabs matching Page 1 */}
          <div className="flex items-center p-1.5 bg-slate-100 rounded-xl max-w-lg">
            {converter.tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as ForexTransactionType)}
                  className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer text-center ${
                    isActive
                      ? 'bg-gradient-to-r from-[#D71920] to-[#B31217] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#005596] hover:bg-white/60'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* If USD or EUR in Cash Buy mode: Sub-selector for Big notes (*) vs Small notes (&) */}
          {activeTab === 'cashBuy' && (selectedCurrencyCode === 'USD' || selectedCurrencyCode === 'EUR') && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-sky-50/70 border border-sky-100 rounded-xl text-xs text-slate-700">
              <span className="font-semibold text-[#005596]">Phân loại mệnh giá tiền mặt:</span>
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
                  ★ Mệnh giá 50, 100 ({formatRateCell(currentCurrency.cashCheckStar)})
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

          {/* Interactive Currency Converter Form matching PDF Page 1 */}
          <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
            {/* Box 1: Số tiền quý khách cần quy đổi */}
            <div className="md:col-span-5 bg-slate-50/80 p-4 rounded-2xl border border-slate-200 focus-within:border-[#005596] focus-within:ring-2 focus-within:ring-sky-100 transition-all">
              <label className="block text-xs font-semibold text-slate-500 mb-2">
                {!isReverse ? converter.labels.inputAmount : 'Số tiền VND cần quy đổi'}
              </label>

              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  inputMode="decimal"
                  value={rawAmountInput}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className="w-full bg-transparent text-2xl sm:text-3xl font-extrabold text-slate-800 focus:outline-none font-mono"
                />

                {/* Currency selector */}
                {!isReverse ? (
                  <div className="relative shrink-0">
                    <select
                      value={selectedCurrencyCode}
                      onChange={(e) => setSelectedCurrencyCode(e.target.value)}
                      aria-label="Chọn loại ngoại tệ quy đổi"
                      className="appearance-none bg-white font-bold text-sm text-slate-800 py-2 pl-3 pr-8 rounded-xl border border-slate-200 shadow-2xs hover:border-[#005596] focus:outline-none focus:ring-2 focus:ring-sky-100 cursor-pointer"
                    >
                      {(exchangeRates.currencies as ForexCurrencyItem[]).map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                      ▼
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-slate-200 font-bold text-sm text-slate-800 shadow-2xs">
                    <span>🇻🇳</span>
                    <span>VND</span>
                  </div>
                )}
              </div>

              {/* Quick Amount Chips */}
              <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-medium">Chọn nhanh:</span>
                {!isReverse ? (
                  [100, 500, 1000, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRawAmountInput(amt.toString())}
                      className="px-2 py-0.5 rounded-md text-xs font-semibold bg-white text-slate-600 hover:bg-[#005596] hover:text-white border border-slate-200/80 transition-colors cursor-pointer font-mono"
                    >
                      {amt.toLocaleString('vi-VN')}
                    </button>
                  ))
                ) : (
                  [10000000, 25000000, 50000000, 100000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRawAmountInput(amt.toString())}
                      className="px-2 py-0.5 rounded-md text-xs font-semibold bg-white text-slate-600 hover:bg-[#005596] hover:text-white border border-slate-200/80 transition-colors cursor-pointer font-mono"
                    >
                      {(amt / 1000000).toFixed(0)}Tr
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Switch / Swap Direction Button */}
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

            {/* Box 2: Số tiền quy đổi (Result) */}
            <div className="md:col-span-5 bg-sky-50/60 p-4 rounded-2xl border border-sky-200/80">
              <label className="block text-xs font-semibold text-sky-800 mb-2">
                {converter.labels.outputAmount}
              </label>

              <div className="flex items-center justify-between gap-3">
                <div className="w-full text-2xl sm:text-3xl font-extrabold text-[#005596] font-mono tracking-tight truncate">
                  {!isReverse
                    ? formatVND(calculatedResult)
                    : formatFX(calculatedResult)}
                </div>

                {/* Target currency badge */}
                {!isReverse ? (
                  <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-sky-200 font-bold text-sm text-slate-800 shadow-2xs shrink-0">
                    <span>🇻🇳</span>
                    <span>VND</span>
                  </div>
                ) : (
                  <div className="relative shrink-0">
                    <select
                      value={selectedCurrencyCode}
                      onChange={(e) => setSelectedCurrencyCode(e.target.value)}
                      aria-label="Chọn loại ngoại tệ nhận sau quy đổi"
                      className="appearance-none bg-white font-bold text-sm text-slate-800 py-2 pl-3 pr-8 rounded-xl border border-sky-200 shadow-2xs hover:border-[#005596] focus:outline-none focus:ring-2 focus:ring-sky-100 cursor-pointer"
                    >
                      {(exchangeRates.currencies as ForexCurrencyItem[]).map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                      ▼
                    </div>
                  </div>
                )}
              </div>

              {/* Applied Rate and Direction Info */}
              <div className="mt-3 pt-3 border-t border-sky-200/60 flex items-center justify-between text-xs text-sky-900">
                <span>
                  Tỷ giá:{' '}
                  <strong>
                    1 {currentCurrency.code} = {formatRateCell(effectiveRate)} VND
                  </strong>
                </span>
                <span className="text-[11px] text-slate-500">
                  {activeTab === 'cashBuy'
                    ? 'Mua tiền mặt'
                    : activeTab === 'transferBuy'
                    ? 'Mua chuyển khoản'
                    : 'Bán ngoại tệ'}
                </span>
              </div>
            </div>
          </div>

          {/* Validation Notice Box (Nguyên tắc) */}
          {inputError && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{inputError}</span>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SECTION: BẢNG TỶ GIÁ NGOẠI TỆ (Exact Match to PDF Page 1 & Page 2)      */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Section Header with Download Button */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-[#005596] text-white">
              <TrendingUp className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-xl font-extrabold text-[#003B70] tracking-tight">
                {exchangeRates.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Biểu niêm yết tỷ giá các đồng tiền chủ chốt tại VietinBank
              </p>
            </div>
          </div>

          {/* Download Rates button matching PDF */}
          <button
            type="button"
            onClick={handleDownloadRates}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-[#005596] bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors shadow-2xs cursor-pointer self-start md:self-auto"
          >
            <Download className="w-4 h-4 text-[#005596]" />
            <span>{exchangeRates.downloadButton}</span>
          </button>
        </div>

        {/* Filter bar: Ngày cập nhật, Thời điểm cập nhật, Ngoại tệ matching Page 1 */}
        <div className="p-6 bg-slate-50/60 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Ngày cập nhật */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1.5">
              {exchangeRates.filterDate}
            </label>
            <div className="relative">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005596]/20 font-medium text-slate-700"
              />
            </div>
          </div>

          {/* Thời điểm cập nhật */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1.5">
              {exchangeRates.filterTime}
            </label>
            <select
              value={filterTime}
              onChange={(e) => setFilterTime(e.target.value)}
              className="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005596]/20 font-medium text-slate-700 cursor-pointer"
            >
              <option value="16:30:00">16:30:00 (Cuối ngày)</option>
              <option value="11:00:00">11:00:00 (Buổi trưa)</option>
              <option value="08:30:00">08:30:00 (Đầu ngày)</option>
            </select>
          </div>

          {/* Ngoại tệ dropdown filter */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1.5">
              {exchangeRates.filterCurrency}
            </label>
            <select
              value={filterCurrency}
              onChange={(e) => setFilterCurrency(e.target.value)}
              className="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005596]/20 font-medium text-slate-700 cursor-pointer"
            >
              <option value="all">{exchangeRates.allCurrencies}</option>
              {(exchangeRates.currencies as ForexCurrencyItem[]).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search bar */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1.5">
              Tìm kiếm nhanh
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập mã ngoại tệ hoặc tên..."
                className="w-full bg-white pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005596]/20 font-medium text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Highlighted Notice box matching Page 1 */}
        <div className="mx-6 my-4 p-3.5 bg-sky-50/70 border border-sky-200/80 rounded-xl text-xs text-sky-950 space-y-1">
          <p className="font-semibold text-[#005596]">{exchangeRates.updateNotice}</p>
          <p className="text-slate-600">{exchangeRates.starNote}</p>
          <p className="text-slate-600">{exchangeRates.ampersandNote}</p>
        </div>

        <div className="px-6 py-2 text-xs text-slate-500 italic">
          {exchangeRates.disclaimer} &bull; {exchangeRates.displayNotice}
        </div>

        {/* 18-Currencies Exchange Rate Table matching PDF Page 2 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {/* Row 1: Group headers */}
              <tr className="bg-[#003B70] text-white text-xs uppercase tracking-wider font-bold">
                <th
                  rowSpan={2}
                  className="py-3.5 px-4 sm:px-6 border-r border-[#004e92]/40"
                >
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
              {/* Row 2: Sub-headers */}
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
                    onClick={() => {
                      setSelectedCurrencyCode(c.code);
                      const converterElem = document.getElementById('converter-top');
                      if (converterElem) {
                        converterElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    className={`transition-colors cursor-pointer hover:bg-sky-50/60 ${
                      isSelected
                        ? 'bg-sky-50/80 font-medium'
                        : idx % 2 === 0
                        ? 'bg-white'
                        : 'bg-slate-50/40'
                    }`}
                  >
                    {/* Currency Code & Flag */}
                    <td className="py-3.5 px-4 sm:px-6 border-r border-slate-100 font-bold text-slate-800">
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

                    {/* Cash & Check Buying Rate */}
                    <td className="py-3.5 px-4 text-center border-r border-slate-100 font-mono">
                      {c.code === 'USD' || c.code === 'EUR' ? (
                        <div className="space-y-0.5">
                          <div className="text-slate-800 font-bold">
                            ★ {formatRateCell(c.cashCheckStar)}
                          </div>
                          <div className="text-slate-500 text-xs">
                            & {formatRateCell(c.cashCheckAmp)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-800">
                          {formatRateCell(c.cashCheck)}
                        </span>
                      )}
                    </td>

                    {/* Transfer Buying Rate */}
                    <td className="py-3.5 px-4 text-center border-r border-slate-100 font-mono font-semibold text-slate-800">
                      {formatRateCell(c.transfer)}
                    </td>

                    {/* Selling Rate */}
                    <td className="py-3.5 px-4 sm:px-6 text-right font-mono font-bold text-rose-700">
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

      {/* ========================================================================= */}
      {/* 3. SECTION: GIÁ VÀNG (Exact Match to PDF Page 3)                          */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-xl font-extrabold text-[#003B70] tracking-tight">
                {goldRates.title}
              </h3>
              <p className="text-xs text-slate-500">
                Bảng niêm yết giá vàng miếng và vàng trang sức tại VietinBank
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-600">{goldRates.filterDateLabel}:</span>
            <input
              type="date"
              value={goldFilterDate}
              onChange={(e) => setGoldFilterDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 font-medium focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#004785] text-white font-bold text-xs uppercase">
                <th className="py-3 px-4 sm:px-6">{goldRates.columns.updatedAt}</th>
                <th className="py-3 px-4">{goldRates.columns.organization}</th>
                <th className="py-3 px-4">{goldRates.columns.goldType}</th>
                <th className="py-3 px-4 text-center">{goldRates.columns.weight}</th>
                <th className="py-3 px-4 text-right">{goldRates.columns.buyPrice}</th>
                <th className="py-3 px-4 text-right">{goldRates.columns.sellPrice}</th>
                <th className="py-3 px-4 text-center">{goldRates.columns.unit}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {goldRates.items.map((item, i) => (
                <tr key={i} className="hover:bg-amber-50/40 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6 font-mono text-slate-600">
                    {item.updatedAt}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    {item.organization}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#005596]">
                    {item.goldType}
                  </td>
                  <td className="py-3.5 px-4 text-center font-medium text-slate-700">
                    {item.weight}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                    {item.buyPrice}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-700">
                    {item.sellPrice}
                  </td>
                  <td className="py-3.5 px-4 text-center text-xs text-slate-500">
                    {item.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SECTION: ĐĂNG KÝ NHẬN TỶ GIÁ / BẢN TIN NGOẠI HỐI (PDF Page 3)         */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Form: Đăng ký nhận tỷ giá */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1.5 rounded-lg bg-rose-50 text-[#D71920]">
                  <Mail className="w-5 h-5" />
                </span>
                <h3 className="text-xl font-extrabold text-[#003B70] tracking-tight">
                  {newsletter.title}
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {newsletter.subtitle}
              </p>
            </div>

            {formSubmitted ? (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Đăng ký thành công!</span>
                </div>
                <p className="text-xs leading-relaxed">{newsletter.successMessage}</p>
                <button
                  type="button"
                  onClick={() => {
                    setFormSubmitted(false);
                    setFullName('');
                    setEmail('');
                    setNewsletterType('');
                  }}
                  className="mt-3 text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Đăng ký email khác &rarr;
                </button>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                {/* Họ và tên */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {newsletter.fullNameLabel}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={newsletter.fullNamePlaceholder}
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#005596] focus:ring-2 focus:ring-sky-100 text-xs sm:text-sm text-slate-800"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {newsletter.emailLabel}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={newsletter.emailPlaceholder}
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#005596] focus:ring-2 focus:ring-sky-100 text-xs sm:text-sm text-slate-800"
                  />
                </div>

                {/* Loại bản tin */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {newsletter.newsletterTypeLabel}
                  </label>
                  <select
                    value={newsletterType}
                    onChange={(e) => setNewsletterType(e.target.value)}
                    className="w-full bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#005596] focus:ring-2 focus:ring-sky-100 text-xs sm:text-sm text-slate-800 cursor-pointer"
                  >
                    <option value="">{newsletter.newsletterTypePlaceholder}</option>
                    {newsletter.options.map((opt, idx) => (
                      <option key={idx} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {formError && (
                  <p className="text-xs text-rose-600 font-medium">{formError}</p>
                )}

                {/* Submit Button with Gradient */}
                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#005596] via-[#004277] to-[#D71920] hover:opacity-95 shadow-md shadow-[#005596]/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  <span>{newsletter.submitButton}</span>
                </button>
              </form>
            )}

            <div className="pt-2 text-[11px] text-slate-400">
              * VietinBank cam kết bảo mật thông tin cá nhân của Quý khách theo quy định pháp luật.
            </div>
          </div>

          {/* Right Column: VietinBank Advisory Desk Photo & Hotline */}
          <div className="lg:col-span-6 bg-gradient-to-br from-[#002D54] to-[#004B87] relative overflow-hidden flex flex-col justify-between p-6 sm:p-8 text-white">
            <div className="relative z-10 space-y-4">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 text-sky-200 border border-white/20">
                {brand.branchName}
              </span>

              <h4 className="text-lg sm:text-xl font-bold leading-snug text-white">
                Tư vấn giao dịch ngoại tệ & chuyển tiền quốc tế chuyên nghiệp
              </h4>

              <p className="text-xs text-sky-100/90 leading-relaxed">
                Đội ngũ chuyên viên VietinBank Chi Nhánh Bạc Liêu luôn sẵn sàng hỗ trợ Quý khách hàng cá nhân và doanh nghiệp với mức tỷ giá cạnh tranh nhất và thủ tục tinh gọn.
              </p>
            </div>

            {/* Photo Card matching PDF Page 3 */}
            <div className="relative z-10 my-4 rounded-xl overflow-hidden shadow-lg border border-white/20">
              <img
                src={media.consultingPhoto}
                alt="Tư vấn ngoại hối VietinBank"
                className="w-full h-48 sm:h-56 object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white text-xs">
                <p className="font-bold">Quầy giao dịch & tư vấn ngoại hối VietinBank</p>
                <p className="text-[11px] text-slate-200">
                  Địa chỉ: {brand.address}
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-white/10">
              <div>
                <span className="text-sky-300 block text-[11px]">Hotline tư vấn nhanh:</span>
                <span className="font-mono font-bold text-amber-300 text-sm sm:text-base">
                  {brand.consultant.formattedPhone}
                </span>
              </div>
              <div>
                <span className="text-sky-300 block text-[11px]">Tổng đài VietinBank:</span>
                <span className="font-mono font-bold text-white text-sm sm:text-base">
                  1900 558 868
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
