import React from 'react';
import contentData from '../data/contentData.json';
import { Landmark, ShieldCheck, Sparkles } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-sky-600 flex items-center justify-center shadow-md shadow-sky-600/20 ring-1 ring-sky-500/30 overflow-hidden shrink-0">
              <img
                src={contentData.media.logo}
                alt="Bank Logo"
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  // Fallback to lucide icon if image fails to render
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <Landmark className="w-6 h-6 text-white hidden only:block" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/70">
                  <Sparkles className="w-3 h-3 text-sky-600" />
                  {contentData.header.badge}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  TT 14/2017/TT-NHNN
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                {contentData.header.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
            >
              {contentData.calculator.actions.reset}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
