import React from 'react';
import { AcademicFile } from '../lib/types';
import { SEO } from '../components/shared/SEO';

interface SavedProps {
  savedResources: (AcademicFile & { moduleCode: string })[];
  onBrowseClick: () => void;
  ResourceItem: React.FC<{ file: AcademicFile; moduleCode?: string; delay: number }>;
}

export const Saved: React.FC<SavedProps> = ({ 
  savedResources, 
  onBrowseClick, 
  ResourceItem 
}) => {
  return (
    <div className="animate-fade-in max-w-4xl mx-auto pb-24">
      <SEO title="My Library" description="Your personally saved academic resources and study materials." />
      <div className="mb-8 sm:mb-12 px-1">
        <h2 className="text-3xl sm:text-6xl font-black tracking-tighter mb-2">My Library</h2>
        <p className="text-slate-400 dark:text-white/30 font-semibold text-sm sm:text-lg">Personally saved resources for offline access.</p>
      </div>
      <div className="space-y-4 px-1">
        {savedResources.map((f, i) => <ResourceItem key={f.id} file={f} moduleCode={f.moduleCode} delay={i * 40} />)}
        {savedResources.length === 0 && (
          <div className="text-center py-20 sm:py-32 bg-slate-50/50 dark:bg-white/5 rounded-2xl sm:rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/5 px-4">
            <p className="text-slate-400 dark:text-white/20 font-black uppercase tracking-widest mb-6 text-xs">No bookmarks saved yet.</p>
            <button onClick={onBrowseClick} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase shadow-md active:scale-95">Browse Now</button>
          </div>
        )}
      </div>
    </div>
  );
};
