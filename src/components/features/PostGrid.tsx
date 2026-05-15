import React from 'react';
import { FileIcon } from '../shared/Icons';
import { AcademicFile } from '../../lib/types';

interface PostGridProps {
  resources: AcademicFile[];
}

export const PostGrid: React.FC<PostGridProps> = ({ resources }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2">
      {resources.map((res) => {
        const isNotes = res.type === 'Notes';
        return (
          <div
            key={res.id}
            className="group relative aspect-square overflow-hidden bg-slate-50 dark:bg-white/5 rounded-lg sm:rounded-xl transition-all"
          >
            {/* Background */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center gap-1.5 transition-all group-hover:scale-105 ${
              isNotes 
                ? 'bg-emerald-50 dark:bg-emerald-950' 
                : 'bg-amber-50 dark:bg-amber-950'
            }`}>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
                isNotes 
                  ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
              }`}>
                <FileIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[7px] sm:text-[8px] font-bold text-slate-600 dark:text-white/60 text-center leading-tight line-clamp-2 px-2">
                {res.title}
              </span>
            </div>

          </div>
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
