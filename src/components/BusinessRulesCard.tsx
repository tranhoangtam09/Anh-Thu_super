import React from 'react';
import contentData from '../data/contentData.json';
import { BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';

export const BusinessRulesCard: React.FC = () => {
  const { rules } = contentData;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
      <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <BookOpen className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">{rules.title}</h2>
          <p className="text-xs text-slate-500">{rules.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rules.items.map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <h3 className="font-semibold text-sm text-slate-800">{item.category}</h3>
              </div>

              <ul className="space-y-1.5 text-xs text-slate-600">
                {item.requirements.map((req, rIdx) => (
                  <li key={rIdx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700 bg-amber-50/80 px-2 py-1 rounded-md">
                <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                <span className="truncate">Lỗi: &ldquo;{item.suggestedError}&rdquo;</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
