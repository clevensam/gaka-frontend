import React from 'react';
import { FileIcon, DownloadIcon, ViewIcon, ShareIcon } from '../shared/Icons';
import { AcademicFile } from '../../lib/types';

interface PostGridProps {
  resources: AcademicFile[];
  moduleCode: string;
  onResourceClick: (resource: AcademicFile) => void;
  onShare?: (resource: AcademicFile) => void;
}

export const PostGrid: React.FC<PostGridProps> = ({ resources, moduleCode, onResourceClick, onShare }) => {
  const handleShare = (e: React.MouseEvent, res: AcademicFile) => {
    e.stopPropagation();
    if (onShare) {
      onShare(res);
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`Check this resource: *${res.title}*\n${window.location.origin}`)}`, '_blank');
    }
  };

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
              <span className="text-[7px] sm:text-[8px] font-bold text-slate-600 dark:text-white/60 text-center leading-tight line-clamp-2 px-2">
                {res.title}
              </span>
            </div>

            {/* Bottom Blur Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-6 pb-2 px-2 sm:pb-3 sm:px-3">
              <span className="text-[9px] sm:text-[11px] font-bold text-white leading-tight line-clamp-2 text-left block mb-1.5">
                {res.title}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={res.viewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-all active:scale-90"
                  title="View"
                >
                  <ViewIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </a>
                <a
                  href={res.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-all active:scale-90"
                  title="Download"
                >
                  <DownloadIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </a>
                <button
                  onClick={(e) => handleShare(e, res)}
                  className="p-1.5 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-all active:scale-90"
                  title="Share"
                >
                  <ShareIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
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
