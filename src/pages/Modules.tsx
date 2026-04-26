import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SearchIcon, BackIcon } from '../components/shared/Icons';
import { ModuleCard } from '../components/features/ModuleCard';
import { Module } from '../lib/types';
import { SEO } from '../components/shared/SEO';

interface ModulesProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredModules: Module[];
  onModuleClick: (m: Module) => void;
}

export const Modules: React.FC<ModulesProps> = ({ 
  searchQuery, 
  setSearchQuery, 
  filteredModules, 
  onModuleClick 
}) => {
  const { year, semester } = useParams<{ year: string, semester: string }>();
  const navigate = useNavigate();

  const currentYear = parseInt(year || '3');
  const currentSemester = parseInt(semester || '1');

  const semesterModules = useMemo(() => {
    return filteredModules.filter(m => 
      m.year === currentYear && m.semester === currentSemester
    );
  }, [filteredModules, currentYear, currentSemester]);

  return (
    <div className="animate-fade-in">
      <SEO title={`Year ${currentYear} Sem ${currentSemester} Modules`} description={`Modules and resources for Year ${currentYear} Semester ${currentSemester}.`} />
      
      <div className="flex flex-col mb-12 sm:mb-20 gap-10 px-1">
        <div className="space-y-6">
          <button 
            onClick={() => navigate('/modules')}
            className="flex items-center text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase tracking-[0.2em] hover:translate-x-[-4px] transition-transform"
          >
            <BackIcon className="w-4 h-4 mr-2" />
            Directory / Year {currentYear}
          </button>
          <div className="space-y-3">
            <h2 className="text-4xl sm:text-8xl font-black tracking-tighter leading-none">
              Semester {currentSemester}
            </h2>
            <p className="text-slate-400 dark:text-white/30 font-bold text-sm sm:text-xl max-w-2xl leading-relaxed">
              Active directory for Semester {currentSemester} of Study Year {currentYear}.
            </p>
          </div>
        </div>
        
        <div className="relative w-full max-w-[640px]">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <SearchIcon className="w-6 h-6 text-slate-300 dark:text-white/20" />
          </div>
          <input 
            type="text" 
            placeholder="Search within directory..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-8 py-5 sm:py-7 bg-white dark:bg-[#0A0A0A] border border-slate-100 dark:border-white/10 rounded-2xl sm:rounded-[2.5rem] focus:ring-emerald-500/10 outline-none shadow-xl shadow-slate-200/20 dark:shadow-none text-base sm:text-xl font-bold placeholder:text-slate-300 dark:placeholder:text-white/10" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-16">
        {semesterModules.map((m, i) => (
          <div key={m.id} className="animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
            <ModuleCard module={m} onClick={() => onModuleClick(m)} />
          </div>
        ))}
        {semesterModules.length === 0 && (
          <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-100 dark:border-white/5">
             <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">No modules found in this semester.</p>
          </div>
        )}
      </div>
    </div>
  );
};
