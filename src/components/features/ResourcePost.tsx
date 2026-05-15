import React, { useState } from 'react';
import { 
  DownloadIcon, ShareIcon, BookmarkIcon, BookmarkFilledIcon,
  FileIcon, HeartIcon, ViewIcon 
} from '../shared/Icons';
import { AcademicFile } from '../../lib/types';

interface ResourcePostProps {
  file: AcademicFile;
  moduleCode: string;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onShare: (title: string) => void;
  index?: number;
}

export const ResourcePost: React.FC<ResourcePostProps> = ({ 
  file, moduleCode, isSaved, onToggleSave, onShare, index = 0 
}) => {
  const [liked, setLiked] = useState(false);
  const [animating, setAnimating] = useState(false);
  const isNotes = file.type === 'Notes';

  const handleLike = () => {
    setLiked(!liked);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);
  };

  return (
    <div 
      className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-100 dark:border-white/5 overflow-hidden animate-fade-in max-w-ig-feed mx-auto w-full"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Media preview */}
      <div className={`aspect-[4/3] flex items-center justify-center relative ${
        isNotes ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-500/10 dark:to-emerald-500/5' 
                : 'bg-gradient-to-br from-amber-50 to-orange-100/50 dark:from-amber-500/10 dark:to-amber-500/5'
      }`}>
        <div className="flex flex-col items-center gap-2">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
            isNotes 
              ? 'bg-emerald-500 text-white' 
              : 'bg-amber-500 text-white'
          }`}>
            <FileIcon className="w-7 h-7" />
          </div>
          <span className={`text-[9px] font-black uppercase tracking-widest ${
            isNotes ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
          }`}>
            {file.type}
          </span>
        </div>

        <a
          href={file.viewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-xl text-slate-600 dark:text-white/70 hover:text-emerald-600 transition-colors shadow-sm"
        >
          <ViewIcon className="w-4 h-4" />
        </a>
      </div>

      {/* Info + Actions */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/40">
              {moduleCode}
            </span>
            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight mt-0.5">
              {file.title}
            </h4>
          </div>
          {file.size && (
            <span className="text-[9px] font-black text-slate-400 dark:text-white/30 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-lg whitespace-nowrap">
              {file.size}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-white/5">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-1 transition-all active:scale-90 ${animating ? 'heart-animate' : ''} ${liked ? 'text-red-500' : 'text-slate-400 dark:text-white/40 hover:text-red-500'}`}
            >
              <HeartIcon className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              <span className="text-[9px] font-black">{liked ? 'Liked' : 'Like'}</span>
            </button>
            <button 
              onClick={() => onShare(file.title)}
              className="flex items-center gap-1 text-slate-400 dark:text-white/40 hover:text-emerald-600 transition-colors active:scale-90"
            >
              <ShareIcon className="w-4 h-4" />
              <span className="text-[9px] font-black">Share</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onToggleSave(file.id)}
              className={`active:scale-90 transition-all ${isSaved ? 'text-emerald-600' : 'text-slate-400 dark:text-white/40 hover:text-emerald-600'}`}
            >
              {isSaved ? <BookmarkFilledIcon className="w-4 h-4" /> : <BookmarkIcon className="w-4 h-4" />}
            </button>
            <a
              href={file.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 active:scale-95 transition-all shadow-sm"
            >
              <DownloadIcon className="w-3 h-3" />
              <span>GET</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
