import React from 'react';
import { FileIcon, StoryPlusIcon } from '../shared/Icons';
import { AcademicFile } from '../../lib/types';

interface StoriesBarProps {
  resources: (AcademicFile & { moduleCode: string; moduleId: string })[];
  onStoryClick: (resourceId: string, moduleId: string) => void;
  onAddClick?: () => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({ resources, onStoryClick, onAddClick }) => {
  const isNew = (res: any) => {
    if (!res.created_at) return false;
    const diff = Date.now() - new Date(res.created_at).getTime();
    return diff < 24 * 60 * 60 * 1000;
  };

  return (
    <div className="w-full overflow-x-auto scrollbar-hide py-3">
      <div className="flex items-center gap-5 px-1 min-w-max">
        {/* Add Story Circle */}
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-95 transition-transform"
          >
            <div className="relative">
              <div className="w-16 h-16 sm:w-[68px] sm:h-[68px] rounded-full p-[2.5px] border-2 border-dashed border-slate-300 dark:border-white/20">
                <div className="w-full h-full rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                  <StoryPlusIcon className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400 dark:text-white/30" />
                </div>
              </div>
            </div>
            <span className="text-[9px] sm:text-[10px] font-black text-slate-600 dark:text-white/70 max-w-[68px] truncate">
              Add
            </span>
            <span className="text-[7px] sm:text-[8px] font-black uppercase -mt-0.5 text-slate-400">
              Story
            </span>
          </button>
        )}

        {resources.map((res) => {
          const isNotes = res.type === 'Notes';
          const ringClass = isNotes ? 'story-ring-notes' : 'story-ring-pastpaper';
          const isNewStory = isNew(res);

          return (
            <button
              key={res.id}
              onClick={() => onStoryClick(res.id, res.moduleId)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-95 transition-transform"
            >
              <div className="relative">
                <div className={`w-16 h-16 sm:w-[68px] sm:h-[68px] rounded-full p-[2.5px] ${ringClass}`}>
                  <div className="w-full h-full rounded-full bg-white dark:bg-black flex items-center justify-center">
                    <div className={`w-12 h-12 sm:w-[54px] sm:h-[54px] rounded-full flex items-center justify-center ${
                      isNotes ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                    }`}>
                      <FileIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                  </div>
                </div>
                {isNewStory && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full border-2 border-white dark:border-black leading-none">
                    NEW
                  </span>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] font-black text-slate-600 dark:text-white/70 max-w-[68px] truncate">
                {res.moduleCode}
              </span>
              <span className={`text-[7px] sm:text-[8px] font-black uppercase -mt-0.5 ${
                isNotes ? 'text-emerald-500' : 'text-amber-500'
              }`}>
                {isNotes ? 'Note' : 'Gaka'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
