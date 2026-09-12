import React, { useState, useMemo } from 'react';
import contentData from '../data/contentData.json';
import { ReferenceRateItem } from '../types';
import { Search, ArrowRight, TableProperties, Sparkles } from 'lucide-react';
import { formatRate } from '../utils/formatters';

interface ReferenceRateTableProps {
  selectedTermId: string;
  onSelectTerm: (item: ReferenceRateItem) => void;
}

export const ReferenceRateTable: React.FC<ReferenceRateTableProps> = ({
  selectedTermId,
  onSelectTerm,
}) => {
  const { referenceRates } = contentData;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('Tất cả');

  // Unique groups
  const groups = useMemo(() => {
    const list = Array.from(new Set(referenceRates.data.map((d) => d.group)));
    return ['Tất cả', ...list];
  }, [referenceRates.data]);

  // Filtered rows
  const filteredData = useMemo(() => {
    return referenceRates.data.filter((item) => {
      const matchSearch =
        item.termLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.rate.toString().includes(searchTerm);
      const matchGroup = selectedGroup === 'Tất cả' || item.group === selectedGroup;
      return matchSearch && matchGroup;
    });
  }, [referenceRates.data, searchTerm, selectedGroup]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <TableProperties className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {referenceRates.title}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">{referenceRates.subtitle}</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={referenceRates.searchPlaceholder}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
          />
        </div>
      </div>

      {/* Group pills */}
      <div className="px-5 sm:px-6 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs">
        <span className="text-slate-400 font-medium whitespace-nowrap mr-1">Nhóm:</span>
        {groups.map((group) => (
          <button
            key={group}
            type="button"
            onClick={() => setSelectedGroup(group)}
            className={`px-2.5 py-1 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer ${
              selectedGroup === group
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {group}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead className="bg-slate-100/90 text-slate-700 sticky top-0 z-10 text-xs font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-5 border-b border-slate-200">{referenceRates.columnHeaders.term}</th>
              <th className="py-3 px-5 border-b border-slate-200 text-right">{referenceRates.columnHeaders.rate}</th>
              <th className="py-3 px-5 border-b border-slate-200 text-center w-28">{referenceRates.columnHeaders.action}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal">
            {filteredData.map((item) => {
              const isSelected = selectedTermId === item.id;
              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectTerm(item)}
                  className={`transition-colors cursor-pointer group ${
                    isSelected
                      ? 'bg-sky-50/80 hover:bg-sky-100/70 font-semibold'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-2">
                      <span className={`${isSelected ? 'text-sky-900 font-bold' : 'text-slate-800'}`}>
                        {item.termLabel}
                      </span>
                      {isSelected && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-600 text-white">
                          <Sparkles className="w-2.5 h-2.5" />
                          Đang chọn
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-5 text-right font-mono font-semibold text-slate-900">
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-100 group-hover:bg-sky-100/50 text-sky-700 font-bold transition-colors">
                      {formatRate(item.rate)}%
                    </span>
                  </td>
                  <td className="py-3 px-5 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTerm(item);
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-sky-600 text-white'
                          : 'bg-white group-hover:bg-sky-600 group-hover:text-white text-slate-700 border border-slate-200 group-hover:border-sky-600'
                      }`}
                    >
                      <span>Chọn</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={3} className="py-8 text-center text-slate-400">
                  Không tìm thấy kỳ hạn phù hợp với từ khóa &ldquo;{searchTerm}&rdquo;
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
