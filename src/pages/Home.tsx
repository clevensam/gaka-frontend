import React from 'react';
import { AcademicFile } from '../lib/types';
import { SEO } from '../components/shared/SEO';
import { StoriesBar } from '../components/features/StoriesBar';
import { FeedPost } from '../components/features/FeedPost';

interface HomeProps {
  recentFiles: (AcademicFile & { moduleCode: string; moduleId: string })[];
  onExploreClick: () => void;
  onStoryClick: (resourceId: string, moduleId: string) => void;
  onModuleClick: (moduleId: string) => void;
  savedResourceIds: string[];
  onToggleSave: (id: string) => void;
}

export const Home: React.FC<HomeProps> = ({ 
  recentFiles, onExploreClick, onStoryClick, onModuleClick, savedResourceIds, onToggleSave
}) => {
  return (
    <div className="animate-fade-in pb-8">
      <SEO title="Home" />

      {/* Stories Bar */}
      {recentFiles.length > 0 && (
        <div className="mb-6 border-b border-slate-50 dark:border-white/5 pb-4">
          <StoriesBar resources={recentFiles} onStoryClick={onStoryClick} onAddClick={onExploreClick} />
        </div>
      )}

      {/* Feed Posts */}
      <div className="space-y-4 sm:space-y-6 max-w-ig-feed w-full">
        {recentFiles.map((f, i) => (
          <FeedPost 
            key={f.id}
            file={f}
            isSaved={savedResourceIds.includes(f.id)}
            onToggleSave={onToggleSave}
            onModuleClick={onModuleClick}
            delay={i * 80}
          />
        ))}
        {recentFiles.length === 0 && (
          <div className="text-center py-16 bg-slate-50/50 dark:bg-white/5 rounded-2xl border-2 border-dashed border-slate-100 dark:border-white/5 max-w-ig-feed w-full">
            <p className="text-slate-400 dark:text-white/20 font-black uppercase tracking-widest text-[10px]">No recent uploads</p>
            <button onClick={onExploreClick} className="mt-4 px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-md active:scale-95 transition-all">
              Explore Modules
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
