import React, { useMemo } from 'react';
import contentData from '../data/contentData.json';
import { ReferenceRateItem } from '../types';
import { formatVND, formatRate } from '../utils/formatters';
import { BarChart3, ArrowUpRight } from 'lucide-react';

interface TermComparisonProps {
  amount: number;
  selectedTermId: string;
  onSelectTerm: (item: ReferenceRateItem) => void;
}

export const TermComparison: React.FC<TermComparisonProps> = ({
  amount,
  selectedTermId,
  onSelectTerm,
}) => {
  const { referenceRates } = contentData;

  // Selected key benchmark terms
  const benchmarkTerms = useMemo(() => {
    const keyIds = ['1m_to_2m', '3m_to_4m', '6m_to_7m', '9m_to_10m', '12m', '24m_to_36m', '36m'];
    return referenceRates.data.filter((d) => keyIds.includes(d.id));
  }, [referenceRates.data]);

  // Calculations for benchmark terms
  const comparisons = useMemo(() => {
    const validAmount = amount > 0 ? amount : 100000000;
    return benchmarkTerms.map((term) => {
      const interest = Math.round((validAmount * (term.rate / 100) * term.months) / 12);
      return {
        term,
        interest,
        total: validAmount + interest,
      };
    });
  }, [benchmarkTerms, amount]);

  const maxInterest = useMemo(() => {
    return Math.max(...comparisons.map((c) => c.interest), 1);
  }, [comparisons]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              So sánh sinh lời theo các kỳ hạn chuẩn
            </h2>
            <p className="text-xs text-slate-500">
              Ước tính với số tiền gửi {formatVND(amount > 0 ? amount : 100000000)} VND
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {comparisons.map(({ term, interest, total }) => {
          const isSelected = selectedTermId === term.id;
          const ratioPercent = Math.round((interest / maxInterest) * 100);

          return (
            <button
              key={term.id}
              type="button"
              onClick={() => onSelectTerm(term)}
              className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'border-sky-500 bg-sky-50/50 shadow-xs ring-1 ring-sky-500/20'
                  : 'border-slate-200/80 bg-white hover:border-sky-300 hover:bg-slate-50/70'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Kỳ hạn</span>
                  <span className="text-sm font-bold text-slate-900">{term.termLabel}</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                  {formatRate(term.rate)}%/năm
                </span>
              </div>

              <div className="mt-3">
                <span className="text-[11px] text-slate-400 block">Lãi dự tính nhận</span>
                <span className="text-base font-extrabold text-emerald-600 font-mono">
                  +{formatVND(interest)} <span className="text-xs font-semibold">VND</span>
                </span>
              </div>

              {/* Progress visual */}
              <div className="mt-2.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isSelected ? 'bg-sky-600' : 'bg-emerald-500 group-hover:bg-sky-500'
                  }`}
                  style={{ width: `${ratioPercent}%` }}
                />
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                <span>Tổng nhận:</span>
                <span className="font-bold text-slate-800 font-mono">{formatVND(total)} VND</span>
              </div>

              <div className="mt-1.5 flex items-center justify-end text-[11px] font-medium text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Chọn kỳ hạn này</span>
                <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
