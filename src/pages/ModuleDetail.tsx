import React, { useState } from 'react';
import { PlusIcon } from '../components/shared/Icons';
import { Module, ResourceType, AcademicFile, Profile } from '../lib/types';
import { PostGrid } from '../components/features/PostGrid';
import { SEO } from '../components/shared/SEO';

interface ModuleDetailProps {
  selectedModule: Module;
  onBack: () => void;
  profile: Profile | null;
  openAddModal: () => void;
  openEditModuleModal: () => void;
  handleDeleteModule: () => void;
  filterType: ResourceType | 'All';
  setFilterType: (type: ResourceType | 'All') => void;
  filteredResources: AcademicFile[];
  onResourceClick: (resource: AcademicFile) => void;
}

export const ModuleDetail: React.FC<ModuleDetailProps> = ({
  selectedModule, onBack, profile, openAddModal,
  openEditModuleModal, handleDeleteModule,
  filterType, setFilterType, filteredResources, onResourceClick
}) => {
  const resourceCount = selectedModule.resources.length;

  return (
    <div className="animate-fade-in pb-8">
      <SEO title={`${selectedModule.code} — ${selectedModule.name}`} />

      {/* Profile Header - Instagram Style */}
      <div className="max-w-ig-container mx-auto">
        {/* Cover */}
        <div className="h-24 sm:h-32 lg:h-40 bg-gradient-to-r from-emerald-500 to-emerald-700 dark:from-emerald-600 dark:to-emerald-900 rounded-2xl sm:rounded-3xl relative mb-14 sm:mb-16 overflow-hidden">
          {profile?.role === 'admin' && (
            <div className="absolute top-3 right-3 flex gap-2">
              <button onClick={openEditModuleModal} className="text-[8px] font-black uppercase tracking-widest px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all active:scale-95">
                Edit
              </button>
              <button onClick={handleDeleteModule} className="text-[8px] font-black uppercase tracking-widest px-3 py-1.5 bg-red-500/60 backdrop-blur-sm text-white rounded-lg hover:bg-red-500/80 transition-all active:scale-95">
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Avatar + Name - Instagram style profile header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 -mt-16 sm:-mt-20 mb-6 px-1 relative z-10">
          <div className="flex-shrink-0 mx-auto sm:mx-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white dark:border-black bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-2xl sm:text-3xl shadow-xl">
              {selectedModule.code.slice(0, 2)}
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">{selectedModule.name}</h2>
            <p className="text-sm font-medium text-slate-400 dark:text-white/40">@{selectedModule.code}</p>
            <p className="text-xs text-slate-500 dark:text-white/30 mt-2 max-w-lg leading-relaxed">{selectedModule.description}</p>
          </div>
          {profile?.role === 'admin' && (
            <button
              onClick={openAddModal}
              className="flex-shrink-0 flex items-center justify-center gap-1.5 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add File</span>
            </button>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-center sm:justify-start gap-6 sm:gap-10 mb-6 pb-6 border-b border-slate-50 dark:border-white/5">
          <div className="text-center">
            <span className="block text-base font-black text-slate-900 dark:text-white">{resourceCount}</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30">Resources</span>
          </div>
          <div className="text-center">
            <span className="block text-base font-black text-slate-900 dark:text-white">
              {selectedModule.resources.filter(r => r.type === 'Notes').length}
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Notes</span>
          </div>
          <div className="text-center">
            <span className="block text-base font-black text-slate-900 dark:text-white">
              {selectedModule.resources.filter(r => r.type === 'Past Paper').length}
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">Gaka</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-slate-50 dark:bg-white/5 p-1 rounded-xl w-fit mx-auto sm:mx-0">
          {(['All', 'Notes', 'Past Paper'] as (ResourceType | 'All')[]).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filterType === type ? 'bg-white dark:bg-emerald-500 text-emerald-600 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white/60'}`}
            >
              {type === 'Past Paper' ? 'Gaka' : type}
            </button>
          ))}
        </div>

        {/* Post Grid */}
        <PostGrid 
          resources={filteredResources} 
        />
      </div>
    </div>
  );
};
