import React from 'react';
import { BackIcon, PlusIcon } from '../components/shared/Icons';
import { Module, ResourceType, AcademicFile, Profile } from '../lib/types';
import { SEO } from '../components/shared/SEO';

interface ModuleDetailProps {
  selectedModule: Module;
  onBack: () => void;
  profile: Profile | null;
  openAddModal: () => void;
  filterType: ResourceType | 'All';
  setFilterType: (type: ResourceType | 'All') => void;
  filteredResources: AcademicFile[];
  ResourceItem: React.FC<{ file: AcademicFile; moduleCode?: string; delay: number }>;
}

export const ModuleDetail: React.FC<ModuleDetailProps> = ({
  selectedModule,
  onBack,
  profile,
  openAddModal,
  filterType,
  setFilterType,
  filteredResources,
  ResourceItem
}) => {
  return (
    <div className="animate-fade-in max-w-4xl mx-auto pb-20">
      <SEO 
        title={`${selectedModule.code} - ${selectedModule.name}`} 
        description={selectedModule.description} 
      />
      <div className="flex items-center justify-between mb-6 sm:mb-8 gap-3 px-1">
        <button onClick={onBack} className="flex items-center text-slate-600 dark:text-white/40 font-black text-[10px] sm:text-[12px] uppercase tracking-widest hover:text-emerald-600 transition-colors">
          <BackIcon className="mr-2 sm:mr-3 w-5 h-5" /> Back to Modules
        </button>
        {profile?.role === 'admin' && <button onClick={openAddModal} className="flex items-center space-x-1.5 bg-emerald-600 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg font-black text-[9px] sm:text-[11px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"><PlusIcon className="w-4 h-4" /><span>Add File</span></button>}
      </div>
      
      <div className="bg-emerald-600 dark:bg-emerald-700 p-6 sm:p-12 rounded-2xl sm:rounded-[2.5rem] text-white mb-8 relative overflow-hidden shadow-2xl">
         <span className="bg-white/10 px-3 py-1 rounded-full text-[8px] sm:text-[10px] font-black tracking-widest uppercase mb-4 inline-block">{selectedModule.code}</span>
         <h2 className="text-2xl sm:text-4xl font-black mb-3 tracking-tighter leading-tight">{selectedModule.name}</h2>
         <p className="text-emerald-50/70 max-w-2xl font-semibold text-xs sm:text-lg">{selectedModule.description}</p>
      </div>

      <div className="flex items-center space-x-1 mb-8 bg-slate-100/50 dark:bg-white/5 p-1 rounded-2xl w-fit mx-1">
        {(['All', 'Notes', 'Past Paper'] as (ResourceType | 'All')[]).map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-5 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${filterType === type ? 'bg-white dark:bg-emerald-500 text-emerald-600 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white/60'}`}
          >
            {type === 'Past Paper' ? 'Gaka' : type}
          </button>
        ))}
      </div>

      <div className="space-y-3 px-1">
        {filteredResources.map((f, i) => <ResourceItem key={f.id} file={f} delay={i * 40} />)}
        {filteredResources.length === 0 && (
          <div className="text-center py-16 bg-slate-50/50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-100 dark:border-white/5">
             <p className="text-slate-400 dark:text-white/20 font-black uppercase tracking-widest text-[10px]">No files found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};
