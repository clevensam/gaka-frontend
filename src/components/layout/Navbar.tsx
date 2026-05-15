import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon } from '../shared/Icons';
import { Profile } from '../../lib/types';

interface NavbarProps {
  onLogoutClick?: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  profile: Profile | null;
}

const HangingLamp: React.FC<{ isDark: boolean; onToggle: () => void }> = ({ isDark, onToggle }) => {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const threshold = 50;
  const maxPull = 90;

  const handleStart = (clientY: number) => {
    setIsDragging(true);
    startY.current = clientY;
  };

  const handleMove = useCallback((clientY: number) => {
    if (!isDragging) return;
    const deltaY = clientY - startY.current;
    if (deltaY > 0) {
      const resistance = 0.5;
      const pull = deltaY * resistance;
      const dampenedPull = Math.min(pull, maxPull);
      setDragY(dampenedPull);
    } else {
      setDragY(0);
    }
  }, [isDragging]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    if (dragY >= threshold) {
      onToggle();
      if ('vibrate' in navigator) navigator.vibrate(12);
    }
    setIsDragging(false);
    setDragY(0);
  }, [dragY, isDragging, onToggle]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientY);
    const onMouseUp = () => handleEnd();
    const onTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        if (e.cancelable) e.preventDefault();
        handleMove(e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => handleEnd();

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  return (
    <div className="relative flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-center">
        <svg width="24" height="18" viewBox="0 0 50 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
          <path d="M5 35 L45 35 L38 5 L12 5 Z" fill={isDark ? "#222" : "#475569"} className="transition-colors duration-500" />
          <path d="M5 35 L45 35 L43 32 L7 32 Z" fill={isDark ? "#000" : "#FBBF24"} fillOpacity={isDark ? "0.2" : "0.4"} className="transition-colors duration-500" />
          <circle cx="25" cy="36" r="6" fill={isDark ? "#444" : "#FCD34D"} className={`transition-all duration-500 ${!isDark ? 'lamp-glow' : ''}`} />
        </svg>
        <div
          onMouseDown={(e) => handleStart(e.clientY)}
          onTouchStart={(e) => handleStart(e.touches[0].clientY)}
          className={`select-none flex flex-col items-center pointer-events-auto touch-none ${isDragging ? '' : 'transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]'}`}
          style={{
            marginTop: '-6px',
            height: `${16 + dragY}px`,
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none'
          }}
        >
          <div className="w-[1px] bg-slate-400 dark:bg-slate-600 transition-colors flex-grow"></div>
          <div className={`w-2.5 h-4.5 bg-slate-800 dark:bg-emerald-600 rounded-full shadow-lg border border-white/10 dark:border-emerald-400/20 flex flex-col items-center justify-center space-y-0.5 py-1 transform transition-transform ${isDragging ? 'scale-110' : 'hover:scale-110 active:scale-95'}`}>
             <div className={`w-1.5 h-px transition-colors ${dragY >= threshold ? 'bg-white' : 'bg-white/30'}`}></div>
             <div className={`w-1.5 h-px transition-colors ${dragY >= threshold ? 'bg-white' : 'bg-white/30'}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Navbar: React.FC<NavbarProps> = ({
  onLogoutClick,
  isDark,
  onToggleDark,
  profile
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-slate-100 dark:border-white/5 transition-colors duration-500">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 lg:px-10">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-all active:scale-95 group">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-emerald-600 dark:bg-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-black text-base sm:text-xl shadow-lg transform group-hover:rotate-2 transition-transform">
            G
          </div>
          <span className="hidden sm:block text-lg sm:text-xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">GAKA</span>
        </Link>

        {/* Center: Search */}
        <div className="flex-1 max-w-md mx-auto sm:mx-0 sm:px-8">
          {searchOpen ? (
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search resources..."
                className="w-full pl-9 pr-8 py-2 bg-slate-100 dark:bg-white/10 border border-transparent focus:border-emerald-500 rounded-xl outline-none text-xs font-bold text-slate-900 dark:text-white transition-all"
                onBlur={() => setSearchOpen(false)}
                onKeyDown={(e) => e.key === 'Escape' && setSearchOpen(false)}
              />
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 w-full max-w-xs px-4 py-2 bg-slate-100 dark:bg-white/10 rounded-xl text-xs text-slate-400 dark:text-white/30 font-medium hover:bg-slate-200 dark:hover:bg-white/15 transition-colors"
            >
              <SearchIcon className="w-4 h-4" />
              <span>Search resources...</span>
            </button>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="sm:hidden p-2 text-slate-500 dark:text-white/60 active:scale-90 transition-all"
          >
            <SearchIcon className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {profile ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-900 dark:text-white leading-none">{profile.username}</span>
                  <span className="text-[8px] font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-400">{profile.role}</span>
                </div>
                <button
                  onClick={onLogoutClick}
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all active:scale-95 text-[9px] font-black uppercase"
                >
                  X
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth" state={{ tab: 'login' }} className="hidden sm:block px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-white/50 hover:text-emerald-600 transition-colors">
                  Sign In
                </Link>
                <Link to="/auth" state={{ tab: 'signup' }} className="text-[9px] font-black bg-emerald-600 dark:bg-emerald-500 text-white px-4 py-1.5 sm:px-5 sm:py-2 rounded-full uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                  Join
                </Link>
              </div>
            )}
            <div className="ml-1 sm:ml-2 flex items-center">
              <HangingLamp isDark={isDark} onToggle={onToggleDark} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
