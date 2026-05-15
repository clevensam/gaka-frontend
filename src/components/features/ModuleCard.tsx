import React from 'react';
import { Module } from '../../lib/types';
import { FileIcon, ChevronRightIcon } from '../shared/Icons';

interface Props {
  module: Module;
  onClick: () => void;
}

export const ModuleCard: React.FC<Props> = ({ module, onClick }) => {
  const resourceCount = module.resources.length;

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center text-center bg-white dark:bg-[#0A0A0A] p-5 sm:p-6 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 group active:scale-[0.97] h-full"
    >
      {/* Avatar circle */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 dark:from-emerald-500 dark:to-emerald-700 flex items-center justify-center text-white font-black text-xl sm:text-2xl mb-3 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
        {module.code.slice(0, 2)}
      </div>

      {/* Display name */}
      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight mb-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
        {module.name}
      </h3>

      {/* @handle */}
      <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 dark:text-white/40 mb-2">
        {module.code}
      </p>

      {/* Description */}
      <p className="text-[10px] sm:text-xs text-slate-500 dark:text-white/30 leading-relaxed mb-4 line-clamp-2 flex-1">
        {module.description}
      </p>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30">
        <span>{resourceCount} {resourceCount === 1 ? 'File' : 'Files'}</span>
        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/20"></span>
        <span className="text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
          View <ChevronRightIcon className="w-2.5 h-2.5" />
        </span>
      </div>
    </button>
  );
};
