import React, { useState, useEffect, useMemo } from 'react';
import { api } from './lib/api';
import { setToken, setStoredUser, clearAuth, getToken, getStoredUser } from './lib/auth';
import { BottomTabBar } from './components/layout/BottomTabBar';
import { BlogHome } from './components/blog/BlogHome';
import { BlogPostView } from './components/blog/BlogPostView';
import { BlogEditor } from './components/blog/BlogEditor';
import { BlogPost } from './lib/types';
import { AuthPage } from './components/auth/AuthPage';
import { Chatbot } from './components/features/Chatbot';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { ChevronRightIcon, CloseIcon } from './components/shared/Icons';
import { Module, ResourceType, AcademicFile, Profile } from './lib/types';
import { Analytics } from '@vercel/analytics/react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useNavigate,
  useParams
} from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';

import { Home } from './pages/Home';
import { SEO, slugify } from './components/shared/SEO';
import { Modules } from './pages/Modules';
import { ModuleDetail } from './pages/ModuleDetail';
import { Saved } from './pages/Saved';
import { About } from './pages/About';

interface AppContentProps {
  isDark: boolean;
  setIsDark: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContent: React.FC<AppContentProps> = ({ isDark, setIsDark }) => {
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>([]);
  const [recentFiles, setRecentFiles] = useState<(AcademicFile & { moduleCode: string; moduleId: string })[]>([]);
  const [recentBlogPosts, setRecentBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isBlogEditorOpen, setIsBlogEditorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ResourceType | 'All'>('All');
  const [isProcessing, setIsProcessing] = useState(false);

  const [savedResourceIds, setSavedResourceIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gaka-saved-resources');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse saved resources", e);
      return [];
    }
  });

  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [editingResource, setEditingResource] = useState<AcademicFile | null>(null);
  const [resourceFormData, setResourceFormData] = useState({
    title: '',
    type: 'Notes' as ResourceType,
    viewUrl: '',
    downloadUrl: ''
  });

  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [moduleFormData, setModuleFormData] = useState({
    code: '',
    name: '',
    description: '',
    year: 3,
    semester: 1
  });

  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    localStorage.setItem('gaka-theme', isDark ? 'dark' : 'light');
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('gaka-saved-resources', JSON.stringify(savedResourceIds));
  }, [savedResourceIds]);

  useEffect(() => {
    if (selectedModule) {
      localStorage.setItem('gaka-selected-module-id', selectedModule.id);
    }
  }, [selectedModule]);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const storedUser = getStoredUser();
      if (storedUser) setProfile(storedUser);
      else fetchProfile();
    }
    fetchData();

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem('gaka-install-dismissed');
      if (!dismissed) setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const fetchProfile = async () => {
    try {
      const { user } = await api.auth.me();
      setProfile(user);
      setStoredUser(user);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      clearAuth();
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem('gaka-install-dismissed', 'true');
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const [modulesResponse, resourcesResponse, blogResponse] = await Promise.all([
        api.modules.getAll(),
        api.resources.getAll(),
        api.blog.getPosts().catch(() => ({ posts: [] }))
      ]);

      const finalModules: Module[] = modulesResponse.modules.map(m => ({
        id: m.id,
        code: m.code,
        name: m.name,
        description: m.description || 'Verified academic resource module.',
        year: m.year || 3,
        semester: m.semester || 1,
        resources: (resourcesResponse.resources || [])
          .filter((r: any) => r.module_id === m.id)
          .map((r: any) => ({
            id: r.id,
            title: r.title,
            type: r.type as ResourceType,
            downloadUrl: r.download_url || '#',
            viewUrl: r.view_url || '#',
            moduleCode: m.code,
            moduleName: m.name,
            moduleId: m.id,
            created_at: r.created_at,
          }))
      }));

      setModules(finalModules);

      const savedModuleId = localStorage.getItem('gaka-selected-module-id');
      if (savedModuleId) {
        const mod = finalModules.find(m => m.id === savedModuleId);
        if (mod) setSelectedModule(mod);
      }

      const topRecent = (resourcesResponse.resources || []).map((r: any) => {
        const mod = finalModules.find(m => m.id === r.module_id);
        return {
          id: r.id,
          title: r.title,
          type: r.type as ResourceType,
          downloadUrl: r.download_url,
          viewUrl: r.view_url,
          moduleCode: mod?.code || 'CS',
          moduleId: r.module_id,
          moduleName: mod?.name || '',
          created_at: r.created_at,
        };
      });
      setRecentFiles(topRecent);

      setRecentBlogPosts(blogResponse.posts);
    } catch (err: any) {
      console.error("Sync failure.", err);
      if (err.message?.includes('Failed to fetch')) {
        console.warn("Connection issue detected. Please check if your backend server is running on port 3000.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (u: string, p: string) => {
    try {
      const { user, token } = await api.auth.login({ username: u, password: p });
      setToken(token);
      setStoredUser(user);
      setProfile(user);
      navigate('/modules');
    } catch (err: any) {
      throw new Error(err.message || "Invalid credentials.");
    }
  };

  const handleSignup = async (u: string, p: string, n: string, e: string, avatarUrl?: string) => {
    try {
      const { user, token } = await api.auth.register({
        username: u,
        password: p,
        fullName: n,
        email: e,
        avatarUrl,
      });
      setToken(token);
      setStoredUser(user);
      setProfile(user);
      navigate('/modules');
    } catch (err: any) {
      throw new Error(err.message || "Registration failed.");
    }
  };

  const handleLogout = () => {
    clearAuth();
    setProfile(null);
    navigate('/');
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule) return;
    setIsProcessing(true);
    try {
      const payload = {
        title: resourceFormData.title,
        type: resourceFormData.type,
        view_url: resourceFormData.viewUrl,
        download_url: resourceFormData.downloadUrl,
        module_id: selectedModule.id
      };
      if (editingResource) {
        await api.resources.update(editingResource.id, payload);
      } else {
        await api.resources.create(payload);
      }
      setIsResourceModalOpen(false);
      await fetchData();
      const updatedModule = modules.find(m => m.id === selectedModule.id);
      if (updatedModule) setSelectedModule(updatedModule);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const payload = {
        code: moduleFormData.code,
        name: moduleFormData.name,
        description: moduleFormData.description,
        year: moduleFormData.year,
        semester: moduleFormData.semester,
      };
      if (editingModule) {
        await api.modules.update(editingModule.id, payload);
      } else {
        await api.modules.create(payload);
      }
      setIsModuleModalOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (!confirm("Delete this module and all its resources permanently?")) return;
    try {
      await api.modules.delete(id);
      setSelectedModule(null);
      await fetchData();
    } catch (err) {
      alert("Failed to delete module.");
    }
  };

  const openAddModuleModal = () => {
    setEditingModule(null);
    setModuleFormData({ code: '', name: '', description: '', year: 3, semester: 1 });
    setIsModuleModalOpen(true);
  };

  const openEditModuleModal = (m: Module) => {
    setEditingModule(m);
    setModuleFormData({ code: m.code, name: m.name, description: m.description, year: m.year, semester: m.semester });
    setIsModuleModalOpen(true);
  };

  const openAddModal = () => {
    setEditingResource(null);
    setResourceFormData({ title: '', type: 'Notes', viewUrl: '', downloadUrl: '' });
    setIsResourceModalOpen(true);
  };

  const toggleSave = (id: string) => {
    setSavedResourceIds(prev => prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]);
  };

  const navigateTo = (view: string, module?: Module) => {
    if (module) {
      setSelectedModule(module);
      setFilterType('All');
      navigate(`/modules/${slugify(module.name)}`);
    } else {
      navigate(view === 'home' ? '/' : `/${view}`);
    }
    
    setIsBlogEditorOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStoryClick = (resourceId: string, moduleId: string) => {
    const mod = modules.find(m => m.id === moduleId);
    if (mod) {
      setSelectedModule(mod);
      navigate(`/modules/${slugify(mod.name)}`);
    }
  };

  const handleFeedModuleClick = (moduleId: string) => {
    const mod = modules.find(m => m.id === moduleId);
    if (mod) {
      setSelectedModule(mod);
      navigate(`/modules/${slugify(mod.name)}`);
    }
  };

  const handleResourceClick = (resource: AcademicFile) => {
    if (resource.viewUrl && resource.viewUrl !== '#') {
      window.open(resource.viewUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const filteredModules = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return modules.filter(m => m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q));
  }, [modules, searchQuery]);

  const savedResources = useMemo(() => {
    const all = modules.flatMap(m => m.resources.map(r => ({ ...r, moduleCode: m.code })));
    return all.filter(r => savedResourceIds.includes(r.id));
  }, [modules, savedResourceIds]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <div className="book-loader">
        <div className="book-back"></div>
        {[1, 2, 3].map(i => <div key={i} className="book-page"></div>)}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${isDark ? 'dark bg-black text-white/90' : 'bg-[#fcfdfe] text-slate-900'}`}>
      
      <main className="flex-grow container mx-auto max-w-7xl px-4 pt-4 pb-24 sm:pt-6 sm:px-6 lg:pl-24 lg:pb-6">
        <Routes>
          <Route path="/" element={
            <Home 
              recentFiles={recentFiles}
              onExploreClick={() => navigate('/modules')}
              onStoryClick={handleStoryClick}
              onModuleClick={handleFeedModuleClick}
              savedResourceIds={savedResourceIds}
              onToggleSave={toggleSave}
            />
          } />
          
          <Route path="/modules" element={
            <Modules 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredModules={filteredModules}
              profile={profile}
              onAddModule={openAddModuleModal}
              onModuleClick={(m: Module) => {
                setSelectedModule(m);
                navigate(`/modules/${slugify(m.name)}`);
              }}
            />
          } />
          
          <Route path="/explore/:year/:semester" element={
            <Modules 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredModules={filteredModules}
              profile={profile}
              onAddModule={openAddModuleModal}
              onModuleClick={(m: Module) => {
                setSelectedModule(m);
                navigate(`/modules/${slugify(m.name)}`);
              }}
            />
          } />
          
          <Route path="/modules/:slug" element={
            <ModuleDetailWrapper 
              modules={modules}
              profile={profile}
              openAddModal={openAddModal}
              openEditModuleModal={openEditModuleModal}
              handleDeleteModule={handleDeleteModule}
              filterType={filterType}
              setFilterType={setFilterType}
              handleResourceClick={handleResourceClick}
            />
          } />
          
          <Route path="/blog" element={
            <BlogHome 
              profile={profile} 
              onPostClick={(p) => {
                setSelectedPost(p);
                navigate(`/blog/${p.id}`);
              }}
              onCreatePost={() => setIsBlogEditorOpen(true)}
            />
          } />
          
          <Route path="/blog/:id" element={
            <BlogPostWrapper 
              profile={profile}
              recentBlogPosts={recentBlogPosts}
            />
          } />
          
          <Route path="/saved" element={
            profile ? (
              <Saved 
                savedResources={savedResources}
                onBrowseClick={() => navigate('/modules')}
              />
            ) : <Navigate to="/auth" />
          } />
          
          <Route path="/about" element={<About />} />
          
          <Route path="/auth" element={
            <AuthPage 
              onLogin={handleLogin} 
              onSignup={handleSignup} 
              onBack={() => navigate('/')} 
              isDark={isDark} 
            />
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {/* Admin Operations Modal - Optimized for Mobile */}
      {isResourceModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-xl animate-fade-in">
          <div className="bg-white dark:bg-[#0A0A0A] w-full max-w-lg rounded-2xl sm:rounded-[2.5rem] shadow-3xl border border-slate-100 dark:border-white/10 animate-slide-in relative max-h-[95vh] flex flex-col overflow-hidden">
            <div className="px-6 py-6 sm:px-10 sm:py-8 border-b dark:border-white/5 flex justify-between items-center bg-white dark:bg-[#0A0A0A] shrink-0">
              <div className="flex flex-col">
                <h3 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
                  {editingResource ? 'Edit Resource' : 'New Publication'}
                </h3>
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.3em] mt-2">MUST Registry Admin</p>
              </div>
              <button onClick={() => setIsResourceModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 transition-all hover:text-slate-900 dark:hover:text-white active:scale-90">
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="overflow-y-auto px-6 py-8 sm:px-10 pb-10">
              <form onSubmit={handleSaveResource} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Resource Title</label>
                  <input type="text" placeholder="e.g. Lecture 01 - Algorithms Foundations" required value={resourceFormData.title} onChange={e => setResourceFormData({...resourceFormData, title: e.target.value})} className="w-full px-5 py-4 bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white font-bold text-sm transition-all focus:ring-4 focus:ring-emerald-500/10" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Type</label>
                    <div className="relative">
                      <select value={resourceFormData.type} onChange={e => setResourceFormData({...resourceFormData, type: e.target.value as ResourceType})} className="w-full px-5 py-4 bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white font-black text-xs appearance-none">
                        <option value="Notes">Lecture Note</option>
                        <option value="Past Paper">Gaka Exam</option>
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400"><ChevronRightIcon className="w-4 h-4 rotate-90" /></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Preview (View) URL</label>
                    <input type="url" placeholder="Google Drive preview link" required value={resourceFormData.viewUrl} onChange={e => setResourceFormData({...resourceFormData, viewUrl: e.target.value})} className="w-full px-5 py-4 bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white font-bold text-xs" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Direct Download Link</label>
                  <input type="url" placeholder="Direct link to file" required value={resourceFormData.downloadUrl} onChange={e => setResourceFormData({...resourceFormData, downloadUrl: e.target.value})} className="w-full px-5 py-4 bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white font-bold text-xs" />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <button type="button" onClick={() => setIsResourceModalOpen(false)} className="order-2 sm:order-1 flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 font-black text-[10px] uppercase rounded-xl transition-all active:scale-95">Discard</button>
                  <button type="submit" disabled={isProcessing} className="order-1 sm:order-2 flex-[2] py-4 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl disabled:opacity-50 transition-all active:scale-95">
                    {isProcessing ? "Syncing..." : editingResource ? 'Update Publication' : 'Publish Resource'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Admin Module Management Modal */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-xl animate-fade-in">
          <div className="bg-white dark:bg-[#0A0A0A] w-full max-w-lg rounded-2xl sm:rounded-[2.5rem] shadow-3xl border border-slate-100 dark:border-white/10 animate-slide-in relative max-h-[95vh] flex flex-col overflow-hidden">
            <div className="px-6 py-6 sm:px-10 sm:py-8 border-b dark:border-white/5 flex justify-between items-center bg-white dark:bg-[#0A0A0A] shrink-0">
              <div className="flex flex-col">
                <h3 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
                  {editingModule ? 'Edit Module' : 'New Module'}
                </h3>
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.3em] mt-2">MUST Registry Admin</p>
              </div>
              <button onClick={() => setIsModuleModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 transition-all hover:text-slate-900 dark:hover:text-white active:scale-90">
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="overflow-y-auto px-6 py-8 sm:px-10 pb-10">
              <form onSubmit={handleSaveModule} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Module Code</label>
                    <input type="text" placeholder="e.g. CS 201" required value={moduleFormData.code} onChange={e => setModuleFormData({...moduleFormData, code: e.target.value})} className="w-full px-5 py-4 bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white font-bold text-sm transition-all focus:ring-4 focus:ring-emerald-500/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Module Name</label>
                    <input type="text" placeholder="e.g. Data Structures" required value={moduleFormData.name} onChange={e => setModuleFormData({...moduleFormData, name: e.target.value})} className="w-full px-5 py-4 bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white font-bold text-sm transition-all focus:ring-4 focus:ring-emerald-500/10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Description</label>
                  <textarea placeholder="Module description..." rows={3} value={moduleFormData.description} onChange={e => setModuleFormData({...moduleFormData, description: e.target.value})} className="w-full px-5 py-4 bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white font-bold text-sm transition-all focus:ring-4 focus:ring-emerald-500/10 resize-none" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Academic Year</label>
                    <div className="relative">
                      <select value={moduleFormData.year} onChange={e => setModuleFormData({...moduleFormData, year: parseInt(e.target.value)})} className="w-full px-5 py-4 bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white font-black text-xs appearance-none">
                        {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400"><ChevronRightIcon className="w-4 h-4 rotate-90" /></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Semester</label>
                    <div className="relative">
                      <select value={moduleFormData.semester} onChange={e => setModuleFormData({...moduleFormData, semester: parseInt(e.target.value)})} className="w-full px-5 py-4 bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl focus:border-emerald-500 outline-none text-slate-900 dark:text-white font-black text-xs appearance-none">
                        <option value={1}>Semester 1</option>
                        <option value={2}>Semester 2</option>
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400"><ChevronRightIcon className="w-4 h-4 rotate-90" /></div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <button type="button" onClick={() => setIsModuleModalOpen(false)} className="order-2 sm:order-1 flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 font-black text-[10px] uppercase rounded-xl transition-all active:scale-95">Cancel</button>
                  <button type="submit" disabled={isProcessing} className="order-1 sm:order-2 flex-[2] py-4 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl disabled:opacity-50 transition-all active:scale-95">
                    {isProcessing ? "Saving..." : editingModule ? 'Update Module' : 'Create Module'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Chatbot modules={modules} onNavigate={navigateTo} />
      
      {isBlogEditorOpen && profile && (
        <BlogEditor 
          profile={profile} 
          onClose={() => setIsBlogEditorOpen(false)}
          onPublish={() => {
            setIsBlogEditorOpen(false);
            setSelectedPost(null);
            navigateTo('blog');
          }}
        />
      )}

      {/* Bottom Tab Bar - Instagram Style */}
      <BottomTabBar profile={profile} isDark={isDark} onToggleDark={() => setIsDark(!isDark)} onLogoutClick={handleLogout} />

      <Analytics />

      {/* PWA Install Banner */}
      <AnimatePresence>
        {showInstallBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl shadow-2xl p-4 z-[999] flex items-center space-x-4"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Install GAKA App</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Access resources faster from your home screen.</p>
            </div>
            <div className="flex flex-col space-y-2">
              <button
                onClick={handleInstallClick}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Install
              </button>
              <button
                onClick={dismissInstallBanner}
                className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-200"
              >
                Later
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ModuleDetailWrapper: React.FC<any> = ({ modules, profile, openAddModal, openEditModuleModal, handleDeleteModule, filterType, setFilterType, handleResourceClick }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const module = modules.find((m: any) => slugify(m.name) === slug);

  if (!module) return <Navigate to="/modules" />;

  const filteredResources = module.resources.filter((r: any) => filterType === 'All' || r.type === filterType);

  return (
    <ModuleDetail 
      selectedModule={module}
      onBack={() => navigate('/modules')}
      profile={profile}
      openAddModal={openAddModal}
      openEditModuleModal={() => openEditModuleModal(module)}
      handleDeleteModule={() => handleDeleteModule(module.id)}
      filterType={filterType}
      setFilterType={setFilterType}
      filteredResources={filteredResources}
      onResourceClick={handleResourceClick}
    />
  );
};

const BlogPostWrapper: React.FC<any> = ({ profile, recentBlogPosts }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(() => recentBlogPosts.find((p: any) => p.id === id) || null);
  const [loading, setLoading] = useState(!post);

  useEffect(() => {
    if (!post && id) {
      const fetchPost = async () => {
        try {
          const response = await api.blog.getPost(id);
          const data = response.post;
          setPost({
            ...data,
            author: data.author,
          });
        } catch (err) {
          console.error("Error fetching post:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    }
  }, [id, post]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!post) return <Navigate to="/blog" />;

  return (
    <BlogPostView 
      post={post} 
      profile={profile}
      onBack={() => navigate('/blog')}
    />
  );
};

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('gaka-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  return (
    <HelmetProvider>
      <Router>
        <AppContent isDark={isDark} setIsDark={setIsDark} />
      </Router>
    </HelmetProvider>
  );
};

export default App;
