import React from 'react';
import { ChevronRightIcon } from '../components/shared/Icons';
import { SEO } from '../components/shared/SEO';

export const About: React.FC = () => {
  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <SEO title="About" description="GAKA bridges the gap between students and course materials through institutional academic digitization." />
      <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl sm:rounded-3xl p-6 sm:p-16 shadow-sm border border-slate-100 dark:border-white/5 relative overflow-hidden">
         <h2 className="text-3xl sm:text-6xl font-black mb-8 sm:mb-12 tracking-tighter leading-none">Engineering <br/><span className="gradient-text">Efficiency.</span></h2>
         <div className="space-y-10 sm:space-y-14">
          <section>
            <h3 className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-4">The Initiative</h3>
            <p className="text-xl sm:text-3xl font-bold text-slate-800 dark:text-white tracking-tight leading-snug">GAKA bridges the gap between students and course materials through institutional academic digitization.</p>
          </section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-black/40 p-6 sm:p-8 rounded-xl sm:rounded-2xl border dark:border-white/5">
              <h4 className="text-[8px] font-black text-slate-400 uppercase mb-2 tracking-widest">Powered By</h4>
              <p className="text-slate-900 dark:text-white font-black text-xl sm:text-2xl">Softlink Africa Team</p>
            </div>
            <div className="bg-emerald-600 p-6 sm:p-8 rounded-xl sm:rounded-2xl text-white shadow-xl">
              <h4 className="text-[8px] font-black text-emerald-100 uppercase mb-2 tracking-widest">Lead</h4>
              <p className="font-black text-xl sm:text-2xl mb-6">Cleven Samwel</p>
              <a href="https://wa.me/255685208576" className="inline-flex items-center px-6 py-3 bg-white/20 rounded-full font-black text-[9px] uppercase tracking-widest hover:bg-white/30 transition-all">Connect <ChevronRightIcon className="ml-2 w-4 h-4" /></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
