import React, { useMemo } from 'react';
import { AcademicFile } from '../lib/types';
import { SEO } from '../components/shared/SEO';
import { FileIcon } from '../components/shared/Icons';

interface SavedProps {
  savedResources: (AcademicFile & { moduleCode: string })[];
  onBrowseClick: () => void;
}

export const Saved: React.FC<SavedProps> = ({ savedResources, onBrowseClick }) => {
  const grouped = useMemo(() => {
    const groups: Record<string, typeof savedResources> = {};
    savedResources.forEach(r => {
      const key = r.moduleCode || 'Other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });
    return groups;
  }, [savedResources]);

  return (
    <div className="animate-fade-in pb-8">
      <SEO title="Saved Resources" />
      <div className="max-w-ig-container mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Saved</h2>
          <p className="text-[10px] font-medium text-slate-400 dark:text-white/30 mt-0.5">
            {savedResources.length} {savedResources.length === 1 ? 'resource' : 'resources'} saved
          </p>
        </div>

        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-20 sm:py-28 bg-slate-50/50 dark:bg-white/5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/5 px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
              <FileIcon className="w-7 h-7 text-slate-300 dark:text-white/20" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">Nothing saved yet</h3>
            <p className="text-xs text-slate-400 dark:text-white/30 mb-6 max-w-xs mx-auto font-medium">
              Save resources you want to access later by tapping the bookmark icon on any resource post.
            </p>
            <button 
              onClick={onBrowseClick}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-md active:scale-95 transition-all"
            >
              Browse Resources
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([moduleCode, resources]) => (
              <div key={moduleCode}>
                <div className="flex items-center gap-3 mb-3 px-1">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-[10px]">
                    {moduleCode.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{moduleCode}</h3>
                    <p className="text-[9px] font-medium text-slate-400 dark:text-white/30">{resources.length} saved</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                  {resources.map((res) => {
                    const isNotes = res.type === 'Notes';
                    return (
                      <div 
                        key={res.id}
                        className="group aspect-square rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center gap-1.5 p-3"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isNotes 
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        }`}>
                          <FileIcon className="w-4 h-4" />
                        </div>
                        <span className={`text-[7px] font-black uppercase tracking-widest ${
                          isNotes ? 'text-emerald-500' : 'text-amber-500'
                        }`}>
                          {res.type}
                        </span>
                        <span className="text-[8px] font-medium text-slate-600 dark:text-white/70 text-center leading-tight line-clamp-2">
                          {res.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
