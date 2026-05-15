import React from 'react';
import { FileIcon } from '../shared/Icons';
import { AcademicFile } from '../../lib/types';

interface PostGridProps {
  resources: AcademicFile[];
  moduleCode: string;
  onResourceClick: (resource: AcademicFile) => void;
}

export const PostGrid: React.FC<PostGridProps> = ({ resources, moduleCode, onResourceClick }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2">
      {resources.map((res) => {
        const isNotes = res.type === 'Notes';
        return (
          <button
            key={res.id}
            onClick={() => onResourceClick(res)}
            className="group relative aspect-square overflow-hidden bg-slate-50 dark:bg-white/5 rounded-lg sm:rounded-xl active:scale-[0.97] transition-all"
          >
            <div className={`absolute inset-0 flex flex-col items-center justify-center gap-1.5 transition-all group-hover:scale-105 ${
              isNotes 
                ? 'bg-emerald-50/80 dark:bg-emerald-500/10' 
                : 'bg-amber-50/80 dark:bg-amber-500/10'
            }`}>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
                isNotes 
                  ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
              }`}>
                <FileIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className={`text-[7px] sm:text-[8px] font-black uppercase tracking-widest ${
                isNotes ? 'text-emerald-500' : 'text-amber-500'
              }`}>
                {res.type}
              </span>
            </div>
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 sm:p-3">
              <span className="text-[9px] sm:text-[11px] font-bold text-white leading-tight line-clamp-2 text-left">
                {res.title}
              </span>
            </div>
          </button>
        );
      })}
      {resources.length === 0 && (
        <div className="col-span-full py-16 text-center">
          <p className="text-slate-400 dark:text-white/20 font-black uppercase tracking-widest text-[10px]">No resources yet</p>
        </div>
      )}
    </div>
  );
};
