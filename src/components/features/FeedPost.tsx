import React, { useState } from 'react';
import { 
  DownloadIcon, ShareIcon, BookmarkIcon, BookmarkFilledIcon, 
  FileIcon, CommentIcon, HeartIcon, MoreIcon, ViewIcon 
} from '../shared/Icons';
import { AcademicFile } from '../../lib/types';

interface FeedPostProps {
  file: AcademicFile & { moduleCode: string; moduleId: string };
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onModuleClick: (moduleId: string) => void;
  delay?: number;
}

export const FeedPost: React.FC<FeedPostProps> = ({ 
  file, isSaved, onToggleSave, onModuleClick, delay = 0 
}) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(file.likes_count || Math.floor(Math.random() * 50) + 5);
  const [animating, setAnimating] = useState(false);
  const isNotes = file.type === 'Notes';

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);
  };

  const handleShare = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Check this resource: *${file.title}*\n${file.moduleName || file.moduleCode} — ${window.location.origin}/modules/${file.moduleCode}`)}`, '_blank');
  };

  return (
    <div 
      className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-100 dark:border-white/5 overflow-hidden animate-fade-in max-w-ig-feed mx-auto w-full"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button 
          onClick={() => onModuleClick(file.moduleId)}
          className="flex items-center gap-3"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-black ${
            isNotes ? 'bg-emerald-500' : 'bg-amber-500'
          }`}>
            {(file.moduleName || file.moduleCode)?.slice(0, 2)}
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xs font-bold text-slate-900 dark:text-white leading-none">
              {file.moduleName || file.moduleCode}
            </span>
            <span className={`text-[8px] font-medium leading-none ${
              isNotes ? 'text-emerald-500' : 'text-amber-500'
            }`}>
              {isNotes ? 'Lecture' : 'Past Paper'}
            </span>
          </div>
        </button>
        <button className="text-slate-400 dark:text-white/40">
          <MoreIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Media Area */}
      <button
        onClick={() => onModuleClick(file.moduleId)}
        className={`aspect-[4/3] w-full flex items-center justify-center relative group cursor-pointer overflow-hidden ${
          isNotes ? 'bg-emerald-50/50 dark:bg-emerald-500/5' : 'bg-amber-50/50 dark:bg-amber-500/5'
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center ${
            isNotes 
              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
              : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
          }`}>
            <FileIcon className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <span className={`text-[9px] font-black uppercase tracking-widest ${
            isNotes ? 'text-emerald-500' : 'text-amber-500'
          }`}>
            {file.type}
          </span>
        </div>
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <ViewIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
      </button>

      {/* Engagement Bar */}
      <div className="flex items-center gap-1 px-4 py-2">
        <span className="text-xs font-bold text-slate-500 dark:text-white/50">
          {likeCount} likes
        </span>
      </div>

      {/* Caption */}
      <div className="px-4 pb-1">
        <span className="text-xs font-bold text-slate-900 dark:text-white mr-2">{file.moduleName}</span>
        <span className="text-xs text-slate-700 dark:text-white/80 font-medium">{file.title}</span>
      </div>

      {/* Action Bar - Instagram Style */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-50 dark:border-white/5">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLike}
            className={`transition-all active:scale-90 ${animating ? 'heart-animate' : ''} ${liked ? 'text-red-500' : 'text-slate-500 dark:text-white/50'}`}
          >
            <HeartIcon className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
          </button>
          <button 
            onClick={() => onModuleClick(file.moduleId)}
            className="text-slate-500 dark:text-white/50 hover:text-emerald-600 transition-colors active:scale-90"
          >
            <CommentIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={handleShare}
            className="text-slate-500 dark:text-white/50 hover:text-emerald-600 transition-colors active:scale-90"
          >
            <ShareIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onToggleSave(file.id)}
            className={`active:scale-90 transition-all ${isSaved ? 'text-emerald-600' : 'text-slate-500 dark:text-white/50 hover:text-emerald-600'}`}
          >
            {isSaved ? <BookmarkFilledIcon className="w-5 h-5" /> : <BookmarkIcon className="w-5 h-5" />}
          </button>
          <a 
            href={file.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 dark:text-white/50 hover:text-emerald-600 transition-colors active:scale-90"
          >
            <DownloadIcon className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
};
