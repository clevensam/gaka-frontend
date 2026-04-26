import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, BookOpenIcon } from '../components/shared/Icons';
import { Module } from '../lib/types';
import { SEO } from '../components/shared/SEO';

interface SemestersProps {
  modules: Module[];
}

export const Semesters: React.FC<SemestersProps> = ({ modules }) => {
  const navigate = useNavigate();

  const semesters = useMemo(() => {
    const groups: { [key: string]: { year: number, semester: number, count: number } } = {};
    
    // Ensure at least Semester 1 and 2 of Year 3 are present
    const years = new Set([3, ...modules.map(m => m.year)]);
    years.forEach(y => {
      groups[`${y}-1`] = { year: y, semester: 1, count: 0 };
      groups[`${y}-2`] = { year: y, semester: 2, count: 0 };
    });

    modules.forEach(m => {
      const key = `${m.year}-${m.semester}`;
      if (groups[key]) {
        groups[key].count++;
      }
    });
    
    return Object.values(groups).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.semester - b.semester;
    });
  }, [modules]);

  return (
    <div className="animate-fade-in">
      <SEO title="Explore Semesters" description="Choose your academic semester to view relevant course modules and resources." />
      
      <div className="flex flex-col mb-16 px-1">
        <div className="space-y-3">
          <h2 className="text-4xl sm:text-8xl font-black tracking-tighter leading-none">Explore</h2>
          <p className="text-slate-400 dark:text-white/30 font-bold text-sm sm:text-xl max-w-2xl leading-relaxed">
            Select your academic year and semester to access verified MUST CS modules.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
        {semesters.map((sem, i) => (
          <button
            key={`${sem.year}-${sem.semester}`}
            onClick={() => navigate(`/explore/${sem.year}/${sem.semester}`)}
            className="group p-8 bg-white dark:bg-[#111] rounded-[2.5rem] border border-slate-100 dark:border-white/5 hover:border-emerald-500/30 transition-all text-left shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 animate-fade-in"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex justify-between items-start mb-8">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl group-hover:bg-emerald-600 dark:group-hover:bg-emerald-500 transition-all">
                <CalendarIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:text-white" />
              </div>
              <span className="text-[10px] font-black text-slate-400 dark:text-white/40 uppercase tracking-widest border border-slate-100 dark:border-white/5 px-3 py-1 rounded-lg">
                Study Year {sem.year}
              </span>
            </div>
            <h3 className="text-2xl font-black mb-2 tracking-tight group-hover:text-emerald-600 transition-colors">
              Semester {sem.semester}
            </h3>
            <div className="flex items-center text-slate-400 dark:text-white/30 text-xs font-bold mb-6">
              <BookOpenIcon className="w-4 h-4 mr-2" />
              {sem.count} {sem.count === 1 ? 'Module' : 'Modules'} Available
            </div>
            <div className="text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase tracking-widest flex items-center group-hover:translate-x-2 transition-transform">
              View Modules <BookOpenIcon className="ml-2 w-3 h-3" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
