
import React, { useState, useEffect, useMemo } from 'react';
import { api } from './lib/api';
import { setToken, setStoredUser, clearAuth, getToken, getStoredUser } from './lib/auth';
import { Navbar } from './components/layout/Navbar';
import { BlogHome } from './components/blog/BlogHome';
import { BlogPostView } from './components/blog/BlogPostView';
import { BlogEditor } from './components/blog/BlogEditor';
import { BlogPost } from './lib/types';
import { AuthPage } from './components/auth/AuthPage';
import { Chatbot } from './components/features/Chatbot';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { 
  SearchIcon, BackIcon, FileIcon, DownloadIcon, 
  ShareIcon, ChevronRightIcon, ViewIcon, PlusIcon, 
  EditIcon, TrashIcon, BookmarkIcon, BookmarkFilledIcon, 
  CloseIcon 
} from './components/shared/Icons';
import { Module, ResourceType, AcademicFile, Profile } from './lib/types';
import { Analytics } from '@vercel/analytics/react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useNavigate, 
  useLocation,
  useParams
} from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';

// Import Pages
import { Home } from './pages/Home';
import { SEO, slugify } from './components/shared/SEO';
import { Modules } from './pages/Modules';
import { Semesters } from './pages/Semesters';
import { ModuleDetail } from './pages/ModuleDetail';
import { Saved } from './pages/Saved';
import { About } from './pages/About';

// --- SUPABASE CONFIGURATION ---

interface AppContentProps {
  isDark: boolean;
  setIsDark: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContent: React.FC<AppContentProps> = ({ isDark, setIsDark }) => {
  const navigate = useNavigate();
  const location = useLocation();
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
          }))
      }));

      setModules(finalModules);

      const savedView = localStorage.getItem('gaka-current-view');
      const savedModuleId = localStorage.getItem('gaka-selected-module-id');
      if (savedView === 'detail' && savedModuleId) {
        const mod = finalModules.find(m => m.id === savedModuleId);
        if (mod) setSelectedModule(mod);
      }

      const topRecent = (resourcesResponse.resources || []).slice(0, 5).map((r: any) => ({
        id: r.id,
        title: r.title,
        type: r.type as ResourceType,
        downloadUrl: r.download_url,
        viewUrl: r.view_url,
        moduleCode: r.modules?.code || 'CS',
        moduleId: r.module_id
      }));
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

  const handleDeleteResource = async (id: string) => {
    if (!confirm("Remove permanently?")) return;
    try {
      await api.resources.delete(id);
      await fetchData();
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  const openAddModal = () => {
    setEditingResource(null);
    setResourceFormData({ title: '', type: 'Notes', viewUrl: '', downloadUrl: '' });
    setIsResourceModalOpen(true);
  };

  const openEditModal = (r: AcademicFile) => {
    setEditingResource(r);
    setResourceFormData({ title: r.title, type: r.type, viewUrl: r.viewUrl, downloadUrl: r.downloadUrl });
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

  const filteredModules = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return modules.filter(m => m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q));
  }, [modules, searchQuery]);

  const filteredResources = useMemo(() => {
    if (!selectedModule) return [];
    return selectedModule.resources.filter(r => filterType === 'All' || r.type === filterType);
  }, [selectedModule, filterType, modules]);

  const savedResources = useMemo(() => {
    const all = modules.flatMap(m => m.resources.map(r => ({ ...r, moduleCode: m.code })));
    return all.filter(r => savedResourceIds.includes(r.id));
  }, [modules, savedResourceIds]);

  const handleShare = (title: string) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Academic Resource: *${title}*\n${window.location.origin}`)}`, '_blank');
  };

  const ResourceItem: React.FC<{ file: AcademicFile; moduleCode?: string; delay: number }> = ({ file, moduleCode, delay }) => {
    const isSaved = savedResourceIds.includes(file.id);
    const [isDownloading, setIsDownloading] = useState(false);

    const onDownload = (e: React.MouseEvent) => {
      if (file.downloadUrl === '#') e.preventDefault();
      else {
        setIsDownloading(true);
        setTimeout(() => setIsDownloading(false), 3000);
      }
    };

    return (
      <div 
        className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-white dark:bg-[#111] border border-slate-100 dark:border-white/5 rounded-2xl sm:rounded-3xl transition-all duration-500 animate-fade-in shadow-sm hover:shadow-md"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="flex items-center space-x-3 sm:space-x-5 mb-4 sm:mb-0 min-w-0 flex-1">
          <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-105 ${
            file.type === 'Notes' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400'
          }`}>
            <FileIcon className="w-5 h-5 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 mb-0.5 sm:mb-1">
              {moduleCode && (
                <span className="text-[8px] sm:text-[9px] font-black bg-slate-100 dark:bg-black text-slate-500 dark:text-white/40 px-1.5 py-0.5 rounded-md uppercase border dark:border-white/5">
                  {moduleCode}
                </span>
              )}
              <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${file.type === 'Notes' ? 'text-emerald-500' : 'text-teal-500'}`}>
                {file.type === 'Notes' ? 'Note' : 'Gaka'}
              </span>
            </div>
            <h4 className="font-black text-slate-800 dark:text-white/95 text-xs sm:text-base leading-tight truncate">
              {file.title}
            </h4>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
          <div className="flex items-center bg-slate-100/50 dark:bg-black/40 rounded-xl p-1 border dark:border-white/10 shadow-sm">
            {profile?.role === 'admin' ? (
              <>
                <a href={file.viewUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-500 dark:text-white/60 hover:text-emerald-600 active:scale-90 transition-all"><ViewIcon className="w-4 h-4 sm:w-5 sm:h-5" /></a>
                <div className="w-px h-3.5 bg-slate-200 dark:bg-white/10 mx-1"></div>
                <button onClick={() => openEditModal(file)} className="p-1.5 text-slate-500 dark:text-white/60 hover:text-emerald-600 active:scale-90 transition-all"><EditIcon className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                <div className="w-px h-3.5 bg-slate-200 dark:bg-white/10 mx-1"></div>
                <button onClick={() => handleDeleteResource(file.id)} className="p-1.5 text-slate-500 dark:text-white/60 hover:text-red-500 active:scale-90 transition-all"><TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" /></button>
              </>
            ) : (
              <>
                {profile && (
                  <button 
                    onClick={() => toggleSave(file.id)} 
                    className={`p-1.5 active:scale-90 transition-all ${isSaved ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-white/30 hover:text-emerald-600'}`}
                  >
                    {isSaved ? <BookmarkFilledIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <BookmarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                )}
                {!profile && <button onClick={() => handleShare(file.title)} className="p-1.5 text-slate-400 dark:text-white/30 hover:text-emerald-600 active:scale-90 transition-all"><ShareIcon className="w-4 h-4 sm:w-5 sm:h-5" /></button>}
                <div className="w-px h-3.5 bg-slate-200 dark:bg-white/10 mx-1"></div>
                <a href={file.viewUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-500 dark:text-white/60 hover:text-emerald-600 active:scale-90 transition-all"><ViewIcon className="w-4 h-4 sm:w-5 sm:h-5" /></a>
              </>
            )}
          </div>
          <a 
            href={file.downloadUrl} 
            onClick={onDownload}
            className={`flex items-center justify-center space-x-1.5 w-28 sm:w-32 h-11 sm:h-12 font-black text-[9px] sm:text-[10px] uppercase tracking-widest rounded-xl shadow-md active:scale-95 transition-all flex-shrink-0 ${
              isDownloading ? 'bg-slate-800 dark:bg-black text-white' : 'bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700'
            }`}
          >
            {isDownloading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <><DownloadIcon className="w-4 h-4" /><span>Download</span></>}
          </a>
        </div>
      </div>
    );
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <div className="book-loader">
        <div className="book-back"></div>
        {[1, 2, 3].map(i => <div key={i} className="book-page"></div>)}
      </div>
    </div>
  );

  const currentPath = location.pathname;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${isDark ? 'dark bg-black text-white/90' : 'bg-[#fcfdfe] text-slate-900'}`}>
      <Navbar 
        isDark={isDark}
        onToggleDark={() => setIsDark(!isDark)}
        profile={profile}
        onLogoutClick={handleLogout}
      />
      
      <main className="flex-grow container mx-auto max-w-7xl px-4 pt-20 pb-6 sm:pt-24 sm:pb-12 sm:px-10">
        <Routes>
          <Route path="/" element={
            <Home 
              recentFiles={recentFiles}
              recentBlogPosts={recentBlogPosts}
              onExploreClick={() => navigate('/modules')}
              onBlogClick={() => navigate('/blog')}
              onPostClick={(p: BlogPost) => {
                setSelectedPost(p);
                navigate(`/blog/${p.id}`);
              }}
              ResourceItem={ResourceItem}
            />
          } />
          
          <Route path="/modules" element={
            <Semesters modules={modules} />
          } />
          
          <Route path="/explore/:year/:semester" element={
            <Modules 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredModules={filteredModules}
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
              filterType={filterType}
              setFilterType={setFilterType}
              filteredResources={filteredResources}
              ResourceItem={ResourceItem}
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
                ResourceItem={ResourceItem}
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
            {/* Modal Header */}
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
            
            {/* Modal Content - Scrollable area */}
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

      <footer className="py-12 px-6 border-t border-slate-50 dark:border-white/5 text-center opacity-30">
         <p className="text-[8px] sm:text-[9px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.4em] leading-relaxed">&copy; {new Date().getFullYear()} SOFTLINK AFRICA • MUST ENGINEERING COMMUNITY</p>
      </footer>
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

const ModuleDetailWrapper: React.FC<any> = ({ modules, profile, openAddModal, filterType, setFilterType, ResourceItem }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const module = modules.find((m: any) => slugify(m.name) === slug);

  if (!module) return <Navigate to="/modules" />;

  const filteredResources = module.resources.filter((r: any) => filterType === 'All' || r.type === filterType);

  return (
    <ModuleDetail 
      selectedModule={module}
      onBack={() => navigate(`/explore/${module.year}/${module.semester}`)}
      profile={profile}
      openAddModal={openAddModal}
      filterType={filterType}
      setFilterType={setFilterType}
      filteredResources={filteredResources}
      ResourceItem={ResourceItem}
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
