import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { SearchIcon, PlusIcon } from '../components/shared/Icons';
import { ModuleCard } from '../components/features/ModuleCard';
import { Module, Profile } from '../lib/types';
import { SEO } from '../components/shared/SEO';

interface ModulesProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredModules: Module[];
  profile: Profile | null;
  onAddModule: () => void;
  onModuleClick: (m: Module) => void;
}

export const Modules: React.FC<ModulesProps> = ({ 
  searchQuery, setSearchQuery, filteredModules, profile, onAddModule, onModuleClick 
}) => {
  const { year, semester } = useParams<{ year: string, semester: string }>();

  const displayModules = useMemo(() => {
    if (year && semester) {
      return filteredModules.filter(m => 
        m.year === parseInt(year) && m.semester === parseInt(semester)
      );
    }
    return filteredModules;
  }, [filteredModules, year, semester]);

  return (
    <div className="animate-fade-in pb-8">
      <SEO title={year ? `Year ${year} Sem ${semester} Modules` : 'Explore Modules'} />

      {/* Header */}
      <div className="mb-6 max-w-ig-container mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {year ? `Year ${year} · Sem ${semester}` : 'Explore'}
            </h2>
            <p className="text-[10px] font-medium text-slate-400 dark:text-white/30 mt-0.5">
              {displayModules.length} {displayModules.length === 1 ? 'module' : 'modules'} available
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-transparent focus:border-emerald-500/50 rounded-xl outline-none text-xs font-bold text-slate-900 dark:text-white transition-all"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {displayModules.map((m, i) => (
          <div key={m.id} className="animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
            <ModuleCard module={m} onClick={() => onModuleClick(m)} />
          </div>
        ))}
        {displayModules.length === 0 && (
          <div className="col-span-full py-16 text-center bg-slate-50/50 dark:bg-white/5 rounded-2xl border-2 border-dashed border-slate-100 dark:border-white/5">
            <p className="text-slate-400 dark:text-white/20 font-black uppercase tracking-widest text-[9px]">No modules found</p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-3 text-[9px] font-black text-emerald-600 uppercase tracking-widest"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Admin FAB */}
      {profile?.role === 'admin' && (
        <button
          onClick={onAddModule}
          className="fixed bottom-20 right-6 sm:bottom-24 sm:right-8 z-40 w-12 h-12 bg-emerald-600 text-white rounded-2xl shadow-2xl shadow-emerald-500/30 flex items-center justify-center hover:bg-emerald-700 active:scale-90 transition-all"
        >
          <PlusIcon className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};
