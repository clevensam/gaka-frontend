
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { UserIcon, LogoutIcon, MenuIcon, CloseIcon } from '../shared/Icons';
import { Profile } from '../../lib/types';
import { NavLink, Link } from 'react-router-dom';

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
    <div className="absolute top-[80%] right-0 z-[100] flex flex-col items-center pointer-events-none translate-x-1 sm:translate-x-0">
      <div className="w-2.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-b-sm mb-[-1px] transition-colors"></div>
      <div className="w-[1.5px] h-3 bg-slate-300/60 dark:bg-slate-700 transition-colors duration-500"></div>
      <div className="relative pointer-events-auto">
        <svg width="28" height="22" viewBox="0 0 50 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
          <path d="M5 35 L45 35 L38 5 L12 5 Z" fill={isDark ? "#222" : "#475569"} className="transition-colors duration-500" />
          <path d="M5 35 L45 35 L43 32 L7 32 Z" fill={isDark ? "#000" : "#FBBF24"} fillOpacity={isDark ? "0.2" : "0.4"} className="transition-colors duration-500" />
          <circle cx="25" cy="36" r="6" fill={isDark ? "#444" : "#FCD34D"} className={`transition-all duration-500 ${!isDark ? 'lamp-glow' : ''}`} />
        </svg>
        <div 
          onMouseDown={(e) => handleStart(e.clientY)}
          onTouchStart={(e) => handleStart(e.touches[0].clientY)}
          className={`absolute left-1/2 -translate-x-1/2 select-none flex flex-col items-center pointer-events-auto touch-none w-10 ${isDragging ? '' : 'transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]'}`}
          style={{ 
            top: '18px',
            height: `${35 + dragY}px`, 
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none'
          }}
        >
          <div className="w-[1px] bg-slate-400 dark:bg-slate-600 transition-colors flex-grow"></div>
          <div className={`w-3 h-5.5 bg-slate-800 dark:bg-emerald-600 rounded-full shadow-lg border border-white/10 dark:border-emerald-400/20 flex flex-col items-center justify-center space-y-0.5 py-1 -mt-0.5 transform transition-transform ${isDragging ? 'scale-110' : 'hover:scale-110 active:scale-95'}`}>
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  const NavItem = ({ label, to }: { label: string; to: string }) => (
    <NavLink 
      to={to}
      onClick={closeMenu}
      className={({ isActive }) => `px-4 py-3 sm:px-5 sm:py-2.5 text-sm sm:text-[11px] font-black uppercase tracking-widest transition-all rounded-xl text-left w-full md:w-auto ${isActive ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' : 'text-slate-500 hover:text-emerald-600 dark:text-white/40 dark:hover:text-emerald-400'}`}
    >
      {label}
    </NavLink>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-xl px-3 py-2 sm:py-4 sm:px-10 transition-colors duration-500 border-b border-slate-100 dark:border-white/5">
      <div className="max-w-7xl mx-auto flex justify-between items-center relative">
        <div className="flex items-center space-x-1 sm:space-x-10">
          <button 
            onClick={toggleMenu}
            className="md:hidden p-2 text-slate-500 dark:text-white/60 active:scale-90 transition-all"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>

          <Link 
            to="/"
            onClick={closeMenu}
            className="flex items-center space-x-2 sm:space-x-4 hover:opacity-80 transition-all active:scale-95 text-left group"
          >
            <div className="w-8 h-8 sm:w-11 sm:h-11 bg-emerald-600 dark:bg-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-black text-base sm:text-2xl shadow-lg transform group-hover:rotate-2 transition-transform">
              G
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">GAKA</h1>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            <NavItem label="Home" to="/" />
            <NavItem label="Explore" to="/modules" />
            <NavItem label="Blog" to="/blog" />
            {profile && <NavItem label="Saved" to="/saved" />}
            <NavItem label="About" to="/about" />
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-10">
          <div className="flex items-center space-x-1.5 sm:space-x-4 relative">
            {profile ? (
              <div className="flex items-center space-x-2 sm:space-x-5">
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-[11px] font-black text-slate-900 dark:text-white leading-none">
                    {profile.username}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-400 opacity-80 mt-1">
                    {profile.role}
                  </span>
                </div>
                <button 
                  onClick={onLogoutClick}
                  className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all active:scale-95"
                >
                  <LogoutIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            ) : (
              <>
                <Link 
                  to="/auth"
                  state={{ tab: 'login' }}
                  onClick={closeMenu}
                  className="hidden sm:block px-4 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-emerald-600 dark:text-white/50 dark:hover:text-emerald-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/auth"
                  state={{ tab: 'signup' }}
                  onClick={closeMenu}
                  className="text-[9px] sm:text-[11px] font-black bg-emerald-600 dark:bg-emerald-500 text-white px-4 sm:px-8 py-2.5 sm:py-3.5 rounded-full uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                >
                  Join
                </Link>
              </>
            )}
            
            {/* Hanging Lamp repositioned below the button area */}
            <div className="relative h-10 w-4 flex items-center justify-center -mr-2 sm:-mr-4">
              <HangingLamp isDark={isDark} onToggle={onToggleDark} />
            </div>
          </div>
        </div>
      </div>

      <div className={`md:hidden fixed inset-x-0 top-[56px] bg-white/95 dark:bg-black/95 backdrop-blur-2xl border-t dark:border-white/5 shadow-2xl transition-all duration-300 transform ${isMobileMenuOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-4 opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col p-5 space-y-1">
          <NavItem label="Home" to="/" />
          <NavItem label="Explore" to="/modules" />
          <NavItem label="Blog" to="/blog" />
          {profile && <NavItem label="Saved" to="/saved" />}
          <NavItem label="About" to="/about" />
          
          {!profile && (
             <div className="pt-4 border-t dark:border-white/10 mt-2">
               <Link 
                 to="/auth"
                 state={{ tab: 'login' }}
                 onClick={closeMenu}
                 className="w-full text-left block px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-white/50 active:bg-slate-50 dark:active:bg-white/5 rounded-xl transition-colors"
               >
                 Already a member? Sign In
               </Link>
             </div>
          )}
          
          {profile && (
             <div className="pt-4 border-t dark:border-white/10 mt-2 flex items-center justify-between px-4">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{profile.full_name}</span>
                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{profile.role} account</span>
               </div>
               <button onClick={() => { onLogoutClick?.(); closeMenu(); }} className="text-[10px] font-black text-red-500 uppercase tracking-widest px-3 py-1.5 bg-red-50 dark:bg-red-500/10 rounded-lg">Sign Out</button>
             </div>
          )}
        </div>
      </div>
    </nav>
  );
};
