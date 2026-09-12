import React, { useState, useMemo } from 'react';
import contentData from '../data/contentData.json';
import { LoanCalculationResult } from '../types';
import { formatVND, formatRate } from '../utils/formatters';
import {
  X,
  Download,
  Printer,
  Search,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ArrowDownRight,
  Info,
} from 'lucide-react';

interface LoanScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: LoanCalculationResult | null;
}

export const LoanScheduleModal: React.FC<LoanScheduleModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  const { loanCalculator } = contentData;
  const { scheduleModal, principles } = loanCalculator;

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  if (!isOpen || !result) return null;

  // Filter schedule rows
  const filteredSchedule = useMemo(() => {
    if (!searchTerm.trim()) return result.schedule;
    const term = searchTerm.toLowerCase();
    return result.schedule.filter(
      (row) =>
        row.period.toString().includes(term) ||
        row.paymentDate.includes(term) ||
        formatVND(row.remainingPrincipal).includes(term)
    );
  }, [result.schedule, searchTerm]);

  // Pagination for very long loans (e.g. 240 months)
  const totalPages = Math.ceil(filteredSchedule.length / rowsPerPage);
  const displayedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredSchedule.slice(start, start + rowsPerPage);
  }, [filteredSchedule, currentPage]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['STT', 'Ky tra no', 'So goc con lai (VND)', 'Goc (VND)', 'Lai (VND)', 'Tong Goc + Lai (VND)'];
    const rows = result.schedule.map((r) => [
      r.period,
      r.paymentDate,
      Math.round(r.remainingPrincipal),
      Math.round(r.principalPaid),
      Math.round(r.interestPaid),
      Math.round(r.totalPaid),
    ]);
    const summaryRow = [
      'TONG CONG',
      '',
      '',
      Math.round(result.totalPrincipal),
      Math.round(result.totalInterest),
      Math.round(result.totalRepayment),
    ];

    const csvContent =
      '\uFEFF' + // UTF-8 BOM for Excel in Vietnam
      [headers.join(','), ...rows.map((e) => e.join(',')), summaryRow.join(',')].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Lich_tra_no_VietinBank_${result.loanTermMonths}thang.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-sky-900 via-[#005596] to-sky-950 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-600 text-white">
                VIETINBANK
              </span>
              <h3 className="text-lg font-bold tracking-tight">
                {scheduleModal.title}
              </h3>
            </div>
            <p className="text-xs text-sky-200 mt-0.5">{scheduleModal.subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer border border-white/20"
              title="Xuất file CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{scheduleModal.exportExcel}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer border border-white/20"
              title="In lịch trả nợ"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{scheduleModal.print}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loan summary strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shrink-0">
          <div>
            <span className="text-slate-500 block">Số tiền vay:</span>
            <span className="font-bold text-slate-900 font-mono text-sm">
              {formatVND(result.loanAmount)} VND
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Thời gian vay:</span>
            <span className="font-bold text-slate-900">
              {result.loanTermMonths} tháng ({result.totalPeriods} kỳ)
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Lãi suất áp dụng:</span>
            <span className="font-bold text-rose-600 font-mono">
              {formatRate(result.annualRate)}%/năm
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Tổng tiền gốc + lãi:</span>
            <span className="font-bold text-emerald-700 font-mono text-sm">
              {formatVND(result.totalRepayment)} VND
            </span>
          </div>
        </div>

        {/* Search & control toolbar */}
        <div className="px-6 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 bg-white">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo kỳ hoặc ngày trả nợ..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>
              Tổng số kỳ: <strong>{result.schedule.length - 1}</strong> kỳ
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1 ml-3">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2 py-0.5 border rounded bg-white disabled:opacity-40 cursor-pointer"
                >
                  &lt;
                </button>
                <span>
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2 py-0.5 border rounded bg-white disabled:opacity-40 cursor-pointer"
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto min-h-[300px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#607274]/90 text-white sticky top-0 z-10 uppercase text-[11px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4 text-center w-16">{scheduleModal.columns.stt}</th>
                <th className="py-3 px-4">{scheduleModal.columns.paymentDate}</th>
                <th className="py-3 px-4 text-right">{scheduleModal.columns.remainingPrincipal}</th>
                <th className="py-3 px-4 text-right">{scheduleModal.columns.principal}</th>
                <th className="py-3 px-4 text-right">{scheduleModal.columns.interest}</th>
                <th className="py-3 px-4 text-right pr-6">{scheduleModal.columns.total}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {displayedRows.map((row) => {
                const isDisbursement = row.period === 0;
                return (
                  <tr
                    key={row.period}
                    className={`transition-colors ${
                      isDisbursement
                        ? 'bg-sky-50/70 font-semibold text-sky-950'
                        : row.period % 2 === 0
                        ? 'bg-slate-50/50 hover:bg-sky-50/40'
                        : 'bg-white hover:bg-sky-50/40'
                    }`}
                  >
                    <td className="py-2.5 px-4 text-center font-bold text-slate-500">
                      {row.period}
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-700">
                      {row.paymentDate}
                      {isDisbursement && (
                        <span className="ml-2 text-[10px] font-sans font-normal text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded">
                          Giải ngân
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-800">
                      {formatVND(row.remainingPrincipal)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-800">
                      {isDisbursement ? '-' : formatVND(row.principalPaid)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-rose-600">
                      {isDisbursement ? '-' : formatVND(row.interestPaid)}
                    </td>
                    <td className="py-2.5 px-4 text-right pr-6 font-bold text-slate-900">
                      {isDisbursement ? '-' : formatVND(row.totalPaid)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Table Footer - Total Row matching screenshot in PDF */}
            <tfoot className="bg-[#607274] text-white font-mono sticky bottom-0 z-10 font-bold border-t-2 border-slate-300">
              <tr>
                <td colSpan={2} className="py-3 px-4 font-sans uppercase tracking-wider text-center sm:text-left">
                  {scheduleModal.summaryLabel}
                </td>
                <td className="py-3 px-4 text-right">
                  {/* Empty for remaining */}
                </td>
                <td className="py-3 px-4 text-right">
                  {formatVND(result.totalPrincipal)}
                </td>
                <td className="py-3 px-4 text-right text-amber-200">
                  {formatVND(result.totalInterest)}
                </td>
                <td className="py-3 px-4 text-right pr-6 text-emerald-300 text-sm">
                  {formatVND(result.totalRepayment)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Business Rule Explanation footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 text-xs text-slate-600 shrink-0">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-slate-800">
                {principles.title}:
              </span>
              <p className="text-[11px] text-slate-500">
                Gốc trả mỗi kỳ = {formatVND(result.loanAmount)} / {result.totalPeriods} kỳ. Sai lệch do làm tròn được tự động điều chỉnh vào kỳ trả nợ cuối cùng (Kỳ {result.totalPeriods}).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
