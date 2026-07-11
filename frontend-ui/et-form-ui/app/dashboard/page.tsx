'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Search,
  Plus,
  Bell,
  Folder,
  Grid,
  List as ListIcon,
  Trash2,
  Settings,
  HelpCircle,
  MoreVertical,
  Star,
  Pencil,
  Trash,
  X,
  RefreshCw,
  FileText,
  Check,
  Share2,
  Copy,
  ChevronRight,
  Eye,
  Settings2,
  PlusCircle,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Download,
  AlertCircle,
  Home,
  Hash,
  Globe,
  Calendar,
  CheckSquare,
  UploadCloud,
  Play,
  LogIn,
  Lock,
  UserPlus,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  CornerUpLeft,
  CornerUpRight,
  SlidersHorizontal,
  Monitor,
  Heart,
  Smile,
  CircleDot,
  UserCheck
} from 'lucide-react';

// Form Item Structure
interface FormItem {
  id: string;
  name: string;
  projectName: string;
  isFavorite: boolean;
  isTrash: boolean;
  sharedType: 'none' | 'my-forms' | 'with-me';
  lastEdited: string;
  viewedAt: number;
  fields: FormField[];
  responses: Record<string, any>[];
}

// Form Field Structure
interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  options?: string[]; // for select, radio choice, likert
  required?: boolean;
  subtitle?: string; // for sections or additional descriptions
  maxRating?: number; // for rating input
}

// Pre-seeded initial forms
const INITIAL_FORMS: FormItem[] = [
  {
    id: 'form-1',
    name: 'Picture form',
    projectName: 'Default Project',
    isFavorite: false,
    isTrash: false,
    sharedType: 'none',
    lastEdited: 'Edited 2 hours ago',
    viewedAt: Date.now() - 2 * 60 * 60 * 1000,
    fields: [
      { id: 'f1', type: 'text', label: 'Full Name', placeholder: 'Enter your full name', required: true },
      { id: 'f2', type: 'email', label: 'Email Address', placeholder: 'name@example.com', required: true },
      { id: 'f3', type: 'paragraph', label: 'Brief bio or introduction', placeholder: 'Tell us about yourself...' }
    ],
    responses: [
      { f1: 'Alex Johnson', f2: 'alex@example.com', f3: 'Passionate designer from Seattle.' }
    ]
  },
  {
    id: 'form-2',
    name: 'Customer Survey 2026',
    projectName: 'Marketing Campaign',
    isFavorite: true,
    isTrash: false,
    sharedType: 'my-forms',
    lastEdited: 'Edited 1 day ago',
    viewedAt: Date.now() - 24 * 60 * 60 * 1000,
    fields: [
      { id: 'c1', type: 'text', label: 'Product Purchased', placeholder: 'e.g. Model X Keyboard' },
      { id: 'c2', type: 'select', label: 'Overall Satisfaction', options: ['Highly Satisfied', 'Satisfied', 'Neutral', 'Unsatisfied'] },
      { id: 'c3', type: 'paragraph', label: 'Any comments or improvement suggestions?', placeholder: 'Write suggestions here...' }
    ],
    responses: []
  },
  {
    id: 'form-3',
    name: 'Job Application Form',
    projectName: 'Feedback Forms',
    isFavorite: false,
    isTrash: false,
    sharedType: 'with-me',
    lastEdited: 'Edited 3 days ago',
    viewedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    fields: [
      { id: 'j1', type: 'text', label: 'Position Applied For', placeholder: 'Frontend Developer' },
      { id: 'j2', type: 'text', label: 'Portfolio Link', placeholder: 'https://...' },
      { id: 'j3', type: 'checkbox', label: 'Willing to work remotely', required: true }
    ],
    responses: []
  },
  {
    id: 'form-4',
    name: 'Contact Info Registration',
    projectName: 'Default Project',
    isFavorite: true,
    isTrash: false,
    sharedType: 'none',
    lastEdited: 'Edited 5 mins ago',
    viewedAt: Date.now() - 5 * 60 * 1000,
    fields: [
      { id: 'r1', type: 'text', label: 'Phone Number', placeholder: '+1 (555) 019-2834' },
      { id: 'r2', type: 'text', label: 'Location', placeholder: 'New York, USA' }
    ],
    responses: []
  }
];

// Helper to generate unique field IDs outside of component render
function createUniqueId() {
  const rand = Math.floor(Math.random() * 10000);
  return `f-${Date.now()}-${rand}`;
}

export default function Page() {
  const router = useRouter();
  const [forms, setForms] = useState<FormItem[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('form_items');
      if (stored) return JSON.parse(stored);
    }
    return INITIAL_FORMS;
  });
  const [projects, setProjects] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('form_projects');
      if (stored) return JSON.parse(stored);
    }
    return ['Default Project', 'Marketing Campaign', 'Feedback Forms'];
  });
  const [activeNav, setActiveNav] = useState<string>('recents'); // recents, all, trash, project-[name]
  const [activeTab, setActiveTab] = useState<string>('recently-viewed'); // recently-viewed, shared-my-forms, shared-with-me, favourites
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [activeDropdownFormId, setActiveDropdownFormId] = useState<string | null>(null);

  // Create form state
  const [newFormName, setNewFormName] = useState('');
  const [newFormProject, setNewFormProject] = useState('Default Project');
  const [newFormShared, setNewFormShared] = useState<'none' | 'my-forms' | 'with-me'>('none');


  // Custom new project creation in sidebar
  const [showAddProject, setShowAddProject] = useState<boolean>(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Sidebar expand/collapse for projects
  const [projectsExpanded, setProjectsExpanded] = useState<boolean>(true);

  // Notifications state
  const [notifications, setNotifications] = useState<string[]>([
    'Welcome back! Review your active feedback surveys.',
    'New response submitted for Picture form.'
  ]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  // Settings state
  const [compactMode, setCompactMode] = useState<boolean>(false);
  const [highContrast, setHighContrast] = useState<boolean>(false);

  // Notification Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Seed local storage on mount if empty
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('form_items')) {
        localStorage.setItem('form_items', JSON.stringify(INITIAL_FORMS));
      }
      if (!localStorage.getItem('form_projects')) {
        localStorage.setItem('form_projects', JSON.stringify(['Default Project', 'Marketing Campaign', 'Feedback Forms']));
      }
    }
  }, []);

  // Save forms to local storage
  const saveForms = (updatedForms: FormItem[]) => {
    setForms(updatedForms);
    localStorage.setItem('form_items', JSON.stringify(updatedForms));
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Create Form
  const handleCreateForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormName.trim()) return;

    const newForm: FormItem = {
      id: `form-${Date.now()}`,
      name: newFormName.trim(),
      projectName: newFormProject,
      isFavorite: false,
      isTrash: false,
      sharedType: newFormShared,
      lastEdited: 'Edited just now',
      viewedAt: Date.now(),
      fields: [
        { id: 'f1', type: 'text', label: 'Name Question', placeholder: 'Enter answer...', required: false }
      ],
      responses: []
    };

    const updated = [newForm, ...forms];
    saveForms(updated);
    setShowCreateModal(false);
    setNewFormName('');
    triggerToast(`Created "${newForm.name}" successfully`);
    router.push(`/builder/${newForm.id}`);
  };

  // Add Project
  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    if (projects.includes(newProjectName.trim())) {
      triggerToast('Project already exists');
      return;
    }
    const updated = [...projects, newProjectName.trim()];
    setProjects(updated);
    localStorage.setItem('form_projects', JSON.stringify(updated));
    setNewProjectName('');
    setShowAddProject(false);
    triggerToast(`Project "${newProjectName.trim()}" created`);
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string) => {
    const updated = forms.map(f => {
      if (f.id === id) {
        return { ...f, isFavorite: !f.isFavorite };
      }
      return f;
    });
    saveForms(updated);
    const form = forms.find(f => f.id === id);
    if (form) {
      triggerToast(form.isFavorite ? 'Removed from favorites' : 'Added to favorites');
    }
  };

  // Move to Trash
  const handleMoveToTrash = (id: string) => {
    const updated = forms.map(f => {
      if (f.id === id) {
        return { ...f, isTrash: true };
      }
      return f;
    });
    saveForms(updated);
    triggerToast('Moved form to Trash');
    setActiveDropdownFormId(null);
  };

  // Restore from Trash
  const handleRestoreForm = (id: string) => {
    const updated = forms.map(f => {
      if (f.id === id) {
        return { ...f, isTrash: false };
      }
      return f;
    });
    saveForms(updated);
    triggerToast('Form restored from Trash');
    setActiveDropdownFormId(null);
  };

  // Delete Permanently
  const handleDeletePermanently = (id: string) => {
    const updated = forms.filter(f => f.id !== id);
    saveForms(updated);
    triggerToast('Form deleted permanently');
    setActiveDropdownFormId(null);
  };

  // Duplicate Form
  const handleDuplicateForm = (form: FormItem) => {
    const duplicated: FormItem = {
      ...form,
      id: `form-${Date.now()}`,
      name: `${form.name} (Copy)`,
      lastEdited: 'Edited just now',
      viewedAt: Date.now(),
      isFavorite: false,
      responses: []
    };
    const updated = [duplicated, ...forms];
    saveForms(updated);
    triggerToast(`Duplicated into "${duplicated.name}"`);
    setActiveDropdownFormId(null);
  };

  // Rename Form
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [tempRenameName, setTempRenameName] = useState('');

  const handleRenameSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!tempRenameName.trim()) return;
    const updated = forms.map(f => {
      if (f.id === id) {
        return { ...f, name: tempRenameName.trim(), lastEdited: 'Edited just now' };
      }
      return f;
    });
    saveForms(updated);
    setEditingFormId(null);
    triggerToast('Form renamed');
  };

  // Open Form in new Builder page
  const handleOpenFormDetails = (form: FormItem) => {
    // Update Viewed timestamp
    const updated = forms.map(f => {
      if (f.id === form.id) {
        return { ...f, viewedAt: Date.now() };
      }
      return f;
    });
    saveForms(updated);
    router.push(`/builder/${form.id}`);
  };



  // Clear All Data
  const handleResetAllData = () => {
    saveForms(INITIAL_FORMS);
    setProjects(['Default Project', 'Marketing Campaign', 'Feedback Forms']);
    localStorage.setItem('form_projects', JSON.stringify(['Default Project', 'Marketing Campaign', 'Feedback Forms']));
    setShowSettingsModal(false);
    triggerToast('Database reset to defaults');
  };

  // Filtering Logic
  const getFilteredForms = () => {
    return forms.filter(f => {
      // Trash filter
      if (activeNav === 'trash') {
        if (!f.isTrash) return false;
      } else {
        if (f.isTrash) return false;
      }

      // Project filter
      if (activeNav.startsWith('project-')) {
        const projName = activeNav.replace('project-', '');
        if (f.projectName !== projName) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = f.name.toLowerCase().includes(q);
        const matchesProject = f.projectName.toLowerCase().includes(q);
        if (!matchesName && !matchesProject) return false;
      }

      // Tabs filter (only active if not in trash)
      if (activeNav !== 'trash') {
        if (activeTab === 'favourites' && !f.isFavorite) return false;
        if (activeTab === 'shared-my-forms' && f.sharedType !== 'my-forms') return false;
        if (activeTab === 'shared-with-me' && f.sharedType !== 'with-me') return false;
      }

      return true;
    }).sort((a, b) => {
      if (activeTab === 'recently-viewed' && activeNav !== 'trash') {
        return b.viewedAt - a.viewedAt;
      }
      return 0; // Default ordering
    });
  };

  const filteredForms = getFilteredForms();

  return (
    <div className={`min-h-screen flex ${highContrast ? 'bg-neutral-100' : 'bg-[#FAFAFA]'} font-sans antialiased text-neutral-900 overflow-x-hidden`}>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 bg-neutral-900 text-white px-5 py-3 rounded-xl shadow-lg z-50 flex items-center gap-3 border border-neutral-800 text-sm font-medium"
          >
            <Check className="w-4 h-4 text-sky-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <aside className="w-64 border-r border-neutral-200 bg-white flex flex-col justify-between shrink-0 h-screen sticky top-0">

        {/* Top Logo and Name section */}
        <div className="flex flex-col">
          <div className="p-6 border-b border-neutral-100 flex items-center gap-3">
            <img src="/logo.png" alt="Et-form Logo" className="w-8 h-8 object-contain" />
            <div>
              <h1 className="font-bold text-neutral-950 tracking-tight text-base">Et-form</h1>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">

            {/* Recents */}
            <button
              onClick={() => {
                setActiveNav('recents');
                setActiveTab('recently-viewed');
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${activeNav === 'recents'
                  ? 'bg-neutral-100 text-neutral-950 font-semibold'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950'
                }`}
            >
              <Clock className={`w-3.5 h-3.5 ${activeNav === 'recents' ? 'text-neutral-950' : 'text-neutral-400'}`} />
              <span>Recents</span>
            </button>

            {/* Name Projects Toggle */}
            <div>
              <button
                onClick={() => setProjectsExpanded(!projectsExpanded)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Folder className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Name projects</span>
                </div>
                <motion.div
                  animate={{ rotate: projectsExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-3 h-3" />
                </motion.div>
              </button>

              {/* Sub project list */}
              <AnimatePresence initial={false}>
                {projectsExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden pl-7 pr-2 mt-1 space-y-0.5"
                  >
                    {projects.map(proj => (
                      <button
                        key={proj}
                        onClick={() => setActiveNav(`project-${proj}`)}
                        className={`w-full text-left px-3 py-1.5 rounded-md text-[11px] font-medium transition-all flex items-center justify-between group ${activeNav === `project-${proj}`
                            ? 'bg-neutral-100 text-neutral-950 font-semibold'
                            : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-950'
                          }`}
                      >
                        <span className="truncate">{proj}</span>
                        <span className="text-[9px] bg-neutral-200/60 px-1.5 py-0.2 rounded text-neutral-600 font-mono">
                          {forms.filter(f => f.projectName === proj && !f.isTrash).length}
                        </span>
                      </button>
                    ))}

                    {/* Add Project Button inside sidebar list */}
                    {showAddProject ? (
                      <form onSubmit={handleAddProject} className="pt-2 px-1">
                        <input
                          autoFocus
                          type="text"
                          value={newProjectName}
                          onChange={(e) => setNewProjectName(e.target.value)}
                          placeholder="Project name..."
                          className="w-full px-2 py-1 border border-neutral-200 rounded text-[11px] focus:outline-none focus:border-neutral-950 text-neutral-950 bg-white"
                        />
                        <div className="flex justify-end gap-1 mt-1">
                          <button
                            type="button"
                            onClick={() => setShowAddProject(false)}
                            className="text-[9px] text-neutral-400 hover:text-neutral-600 px-1"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="text-[9px] text-neutral-950 hover:text-black font-bold px-1"
                          >
                            Add
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setShowAddProject(true)}
                        className="w-full text-left px-3 py-1.5 rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 text-[10px] font-medium flex items-center gap-1.5"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Create new project</span>
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* All Forms */}
            <button
              onClick={() => setActiveNav('all')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${activeNav === 'all'
                  ? 'bg-neutral-100 text-neutral-950 font-semibold'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950'
                }`}
            >
              <Grid className={`w-3.5 h-3.5 ${activeNav === 'all' ? 'text-neutral-950' : 'text-neutral-400'}`} />
              <span>All</span>
            </button>

            {/* Trash */}
            <button
              onClick={() => setActiveNav('trash')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${activeNav === 'trash'
                  ? 'bg-neutral-100 text-neutral-950 font-semibold'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950'
                }`}
            >
              <Trash2 className={`w-3.5 h-3.5 ${activeNav === 'trash' ? 'text-neutral-950' : 'text-neutral-400'}`} />
              <span>Trash</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer options */}
        <div className="p-4 border-t border-neutral-100 space-y-4">
          <div className="space-y-1">
            {/* Setting */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950 transition-all"
            >
              <Settings className="w-3.5 h-3.5 text-neutral-400" />
              <span>Setting</span>
            </button>

            {/* Help and support */}
            <button
              onClick={() => setShowHelpModal(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950 transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
              <span>Help and support</span>
            </button>
          </div>

          {/* User Profile Info section */}
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shrink-0 select-none">
                U
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-neutral-800 truncate leading-none">User name</p>
                <p className="text-[10px] text-neutral-400 truncate mt-0.5 font-mono">gamil user</p>
              </div>
            </div>

            {/* Sync / Switch Account Icon with spinning click effect */}
            <button
              onClick={() => triggerToast('Synchronized with Gamil Cloud successfully')}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/50 rounded-lg transition-all"
              title="Sync account"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN MAIN CONTENT WRAPPER */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">

        {/* TOP HEADER */}
        <header className="px-8 py-5 border-b border-neutral-200 bg-white flex items-center justify-between sticky top-0 z-10 shrink-0">

          {/* Header Title depending on current navigation */}
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-neutral-950 tracking-tight capitalize">
              {activeNav.startsWith('project-') ? activeNav.replace('project-', '') : activeNav}
            </h2>
            <span className="text-[10px] font-mono bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded text-neutral-600 font-semibold">
              {filteredForms.length} forms
            </span>
          </div>

          {/* Center Pill Search Bar */}
          <div className="w-full max-w-md relative mx-4">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search records..."
              className="w-full bg-[#F5F5F5] hover:bg-neutral-100/95 focus:bg-white text-xs text-neutral-950 pl-10 pr-4 py-2.5 rounded-lg border border-transparent focus:border-neutral-300 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-950"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Start a New Form & Bell */}
          <div className="flex items-center gap-3">

            {/* Create new form button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-neutral-950 text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-black transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Start a new form</span>
            </button>

            {/* Notification bell */}
            <div className="flex items-center gap-1 sm:gap-4">
              <ThemeToggle />
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 text-neutral-600 hover:bg-[#F5F5F5] hover:text-neutral-950 rounded-lg transition-all relative"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-neutral-950 rounded-full border border-white"></span>
                </button>

                {/* Notification Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white border border-neutral-200 rounded-lg shadow-xl z-20 overflow-hidden py-1"
                  >
                    <div className="p-3 border-b border-neutral-200 flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-950">Notifications</span>
                      <button
                        onClick={() => setNotifications([])}
                        className="text-[10px] text-neutral-400 hover:text-neutral-950"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-neutral-400 text-center py-6">No new notifications</p>
                      ) : (
                        notifications.map((notif, idx) => (
                          <div key={idx} className="p-3 text-[11px] text-neutral-600 hover:bg-neutral-50 border-b border-neutral-100 last:border-0">
                            {notif}
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              </div>
            </div>

            {/* Form Folder overview Icon */}
            <div className="p-2.5 bg-neutral-100 text-neutral-600 rounded-lg select-none" title="Form Cabinet">
              <Folder className="w-4 h-4 text-neutral-700" />
            </div>
          </div>
        </header>

        {/* INNER WRAPPER FOR FILTER TABS */}
        <div className="px-8 py-4 flex items-center justify-between border-b border-neutral-200 bg-white/70 backdrop-blur sticky top-[77px] z-10 shrink-0">

          {/* Sub Navigation Tabs */}
          {activeNav !== 'trash' ? (
            <div className="flex items-center gap-1.5">
              {[
                { id: 'recently-viewed', label: 'Recently viewed' },
                { id: 'shared-my-forms', label: 'Shared my forms' },
                { id: 'shared-with-me', label: 'Shared with me' },
                { id: 'favourites', label: 'Favourites' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeTab === tab.id
                      ? 'bg-neutral-100 border border-neutral-300 text-neutral-950 font-semibold'
                      : 'text-neutral-500 hover:text-neutral-950 hover:bg-[#F5F5F5]/50 border border-transparent'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-xs font-medium text-neutral-500 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-neutral-400" />
              <span>Forms in Trash will be kept for up to 30 days before permanent deletion.</span>
            </div>
          )}

          {/* Grid vs List Toggles */}
          <div className="flex items-center border border-neutral-200 rounded-lg p-0.5 bg-white">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'grid'
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-400 hover:text-neutral-600'
                }`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'list'
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-400 hover:text-neutral-600'
                }`}
              title="List View"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* MAIN BODY OF CARDS / LIST */}
        <div className="p-8 flex-1">
          {filteredForms.length === 0 ? (

            /* EMPTY STATE */
            <div className="max-w-md mx-auto text-center py-24 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4 border border-neutral-200/50">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-neutral-800 text-base">No forms found</h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                {searchQuery
                  ? "We couldn't find any forms matching your search query. Try typing something else."
                  : "You do not have any forms in this filter. Click the button above to start your first form!"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-5 text-xs bg-neutral-950 text-white font-medium px-4 py-2 rounded-lg hover:bg-neutral-800 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create form</span>
                </button>
              )}
            </div>
          ) : (

            /* RENDER GRID OR LIST MODE */
            viewMode === 'grid' ? (
              <div className={`grid ${compactMode ? 'grid-cols-4 gap-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'}`}>
                {filteredForms.map((form) => (
                  <motion.div
                    key={form.id}
                    layoutId={form.id}
                    className="group bg-white rounded-lg border border-neutral-200 hover:border-neutral-950 transition-all duration-200 relative flex flex-col justify-between h-[218px] overflow-hidden"
                  >
                    {/* Top Gray Card Body */}
                    <div
                      onClick={() => handleOpenFormDetails(form)}
                      className="bg-[#FAFAFA] flex-1 flex flex-col items-center justify-center relative cursor-pointer select-none overflow-hidden group-hover:bg-[#F5F5F5] transition-all duration-200"
                    >
                      {/* Favorite/Star Star Toggle on top right */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(form.id);
                        }}
                        className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all bg-white hover:bg-neutral-100 border border-neutral-200 ${form.isFavorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${form.isFavorite ? 'fill-neutral-950 text-neutral-950' : 'text-neutral-400'}`} />
                      </button>

                      {/* Display name of form */}
                      {editingFormId === form.id ? (
                        <form
                          onSubmit={(e) => handleRenameSubmit(e, form.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="px-4 w-full"
                        >
                          <input
                            type="text"
                            value={tempRenameName}
                            onChange={(e) => setTempRenameName(e.target.value)}
                            className="w-full text-center text-xs font-semibold px-2 py-1 bg-white border border-neutral-300 rounded focus:outline-none"
                            autoFocus
                            onBlur={(e) => handleRenameSubmit(e, form.id)}
                          />
                        </form>
                      ) : (
                        <span className="text-base font-bold text-neutral-950 tracking-tight px-4 text-center truncate w-full">
                          {form.name}
                        </span>
                      )}

                      {/* Response Indicator Badge */}
                      <span className="absolute bottom-3 left-3 text-[9px] bg-neutral-950 text-white px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                        {form.responses.length} {form.responses.length === 1 ? 'response' : 'responses'}
                      </span>
                    </div>

                    {/* Bottom White Footer */}
                    <div className="bg-white border-t border-neutral-200 px-4 py-3.5 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="p-1.5 bg-neutral-50 rounded border border-neutral-200/50 text-neutral-800">
                          <Pencil className="w-3 h-3" />
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-bold text-neutral-950 truncate leading-none">
                            {form.name}
                          </h4>
                          <p className="text-[9px] text-neutral-500 font-mono truncate mt-1">
                            {form.lastEdited}
                          </p>
                        </div>
                      </div>

                      {/* Options menu with dropdown */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownFormId(activeDropdownFormId === form.id ? null : form.id);
                          }}
                          className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 rounded-lg transition-all"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        <AnimatePresence>
                          {activeDropdownFormId === form.id && (
                            <>
                              {/* Overlay to close menu on click outside */}
                              <div
                                className="fixed inset-0 z-20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDropdownFormId(null);
                                }}
                              />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl z-30 py-1 overflow-hidden"
                              >
                                {form.isTrash ? (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRestoreForm(form.id);
                                      }}
                                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                    >
                                      <Check className="w-3.5 h-3.5 text-green-500" />
                                      <span>Restore</span>
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeletePermanently(form.id);
                                      }}
                                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                      <Trash className="w-3.5 h-3.5" />
                                      <span>Delete Forever</span>
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingFormId(form.id);
                                        setTempRenameName(form.name);
                                        setActiveDropdownFormId(null);
                                      }}
                                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                    >
                                      <Pencil className="w-3.5 h-3.5 text-neutral-400" />
                                      <span>Rename Form</span>
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleFavorite(form.id);
                                        setActiveDropdownFormId(null);
                                      }}
                                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                    >
                                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10" />
                                      <span>{form.isFavorite ? 'Unstar' : 'Star/Favorite'}</span>
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/results/${form.id}`);
                                      }}
                                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-neutral-400" />
                                      <span>View Results</span>
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const url = `${window.location.origin}/form/${form.id}`;
                                        navigator.clipboard.writeText(url);
                                        triggerToast('Link copied to clipboard!');
                                        setActiveDropdownFormId(null);
                                      }}
                                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                    >
                                      <Share2 className="w-3.5 h-3.5 text-neutral-400" />
                                      <span>Share Link</span>
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDuplicateForm(form);
                                      }}
                                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                    >
                                      <Copy className="w-3.5 h-3.5 text-neutral-400" />
                                      <span>Duplicate</span>
                                    </button>
                                    <hr className="border-neutral-100 my-1" />
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMoveToTrash(form.id);
                                      }}
                                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                      <Trash className="w-3.5 h-3.5" />
                                      <span>Move to Trash</span>
                                    </button>
                                  </>
                                )}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (

              /* RENDER LIST MODE */
              <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50 font-bold text-neutral-950 select-none uppercase tracking-wider text-[10px]">
                      <th className="px-6 py-4 w-8">Starred</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Project</th>
                      <th className="px-6 py-4">Sharing Type</th>
                      <th className="px-6 py-4">Responses</th>
                      <th className="px-6 py-4">Last Activity</th>
                      <th className="px-6 py-4 text-right w-12">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredForms.map(form => (
                      <tr
                        key={form.id}
                        onClick={() => handleOpenFormDetails(form)}
                        className="border-b border-neutral-200 last:border-0 hover:bg-neutral-50/55 cursor-pointer transition-all group"
                      >
                        <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                          <button onClick={() => handleToggleFavorite(form.id)}>
                            <Star className={`w-3.5 h-3.5 ${form.isFavorite ? 'fill-neutral-950 text-neutral-950' : 'text-neutral-300 hover:text-neutral-600'}`} />
                          </button>
                        </td>
                        <td className="px-6 py-4 font-bold text-neutral-950">
                          {editingFormId === form.id ? (
                            <form
                              onSubmit={(e) => handleRenameSubmit(e, form.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full max-w-xs"
                            >
                              <input
                                type="text"
                                value={tempRenameName}
                                onChange={(e) => setTempRenameName(e.target.value)}
                                className="w-full text-xs font-semibold px-2 py-0.5 bg-white border border-neutral-300 rounded focus:outline-none"
                                autoFocus
                                onBlur={(e) => handleRenameSubmit(e, form.id)}
                              />
                            </form>
                          ) : (
                            <span>{form.name}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-neutral-500 font-medium">
                          {form.projectName}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 border rounded text-[9px] font-mono capitalize leading-none font-bold ${form.sharedType === 'none'
                              ? 'bg-neutral-100 text-neutral-700 border-neutral-200'
                              : form.sharedType === 'my-forms'
                                ? 'bg-neutral-200 text-neutral-950 border-neutral-300'
                                : 'bg-neutral-950 text-white border-neutral-950'
                            }`}>
                            {form.sharedType === 'none' ? 'Private' : form.sharedType.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-neutral-500">
                          {form.responses.length} response(s)
                        </td>
                        <td className="px-6 py-4 text-neutral-500 font-mono text-[10px]">
                          {form.lastEdited}
                        </td>
                        <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                          <div className="relative inline-block text-left">
                            <button
                              onClick={() => setActiveDropdownFormId(activeDropdownFormId === form.id ? null : form.id)}
                              className="p-1 text-neutral-400 hover:text-neutral-700 rounded transition-all"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            <AnimatePresence>
                              {activeDropdownFormId === form.id && (
                                <>
                                  <div className="fixed inset-0 z-20" onClick={() => setActiveDropdownFormId(null)} />
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="absolute right-0 mt-1 w-48 bg-white border border-neutral-200 rounded-lg shadow-xl z-30 py-1"
                                  >
                                    {form.isTrash ? (
                                      <>
                                        <button
                                          onClick={() => handleRestoreForm(form.id)}
                                          className="w-full text-left px-3.5 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                        >
                                          <Check className="w-3.5 h-3.5 text-green-500" />
                                          <span>Restore</span>
                                        </button>
                                        <button
                                          onClick={() => handleDeletePermanently(form.id)}
                                          className="w-full text-left px-3.5 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                                        >
                                          <Trash className="w-3.5 h-3.5" />
                                          <span>Delete Forever</span>
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => {
                                            setEditingFormId(form.id);
                                            setTempRenameName(form.name);
                                            setActiveDropdownFormId(null);
                                          }}
                                          className="w-full text-left px-3.5 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                        >
                                          <Pencil className="w-3.5 h-3.5 text-neutral-400" />
                                          <span>Rename Form</span>
                                        </button>
                                        <button
                                          onClick={() => {
                                            handleToggleFavorite(form.id);
                                            setActiveDropdownFormId(null);
                                          }}
                                          className="w-full text-left px-3.5 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                        >
                                          <Star className="w-3.5 h-3.5 text-amber-500" />
                                          <span>{form.isFavorite ? 'Unstar' : 'Star'}</span>
                                        </button>
                                        <button
                                          onClick={() => {
                                            router.push(`/results/${form.id}`);
                                          }}
                                          className="w-full text-left px-3.5 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                        >
                                          <Eye className="w-3.5 h-3.5 text-neutral-400" />
                                          <span>View Results</span>
                                        </button>
                                        <button
                                          onClick={() => {
                                            const url = `${window.location.origin}/form/${form.id}`;
                                            navigator.clipboard.writeText(url);
                                            triggerToast('Link copied to clipboard!');
                                            setActiveDropdownFormId(null);
                                          }}
                                          className="w-full text-left px-3.5 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                        >
                                          <Share2 className="w-3.5 h-3.5 text-neutral-400" />
                                          <span>Share Link</span>
                                        </button>
                                        <button
                                          onClick={() => handleDuplicateForm(form)}
                                          className="w-full text-left px-3.5 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                        >
                                          <Copy className="w-3.5 h-3.5 text-neutral-400" />
                                          <span>Duplicate</span>
                                        </button>
                                        <hr className="border-neutral-100 my-1" />
                                        <button
                                          onClick={() => handleMoveToTrash(form.id)}
                                          className="w-full text-left px-3.5 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                                        >
                                          <Trash className="w-3.5 h-3.5" />
                                          <span>Move to Trash</span>
                                        </button>
                                      </>
                                    )}
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </main>

      {/* CREATE FORM MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
                <h3 className="font-bold text-neutral-900 text-base">Start a new form</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-full transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleCreateForm} className="p-6 space-y-4">
                {/* Form Name Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-500">Name form</label>
                  <input
                    type="text"
                    value={newFormName}
                    onChange={(e) => setNewFormName(e.target.value)}
                    placeholder="Enter form title..."
                    className="w-full px-3 py-2.5 bg-[#F3F4F6] border border-transparent focus:border-neutral-200 focus:bg-white text-xs text-neutral-800 rounded-lg focus:outline-none transition-all"
                    autoFocus
                    required
                  />
                </div>

                {/* Project selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-500">Assign to project</label>
                  <select
                    value={newFormProject}
                    onChange={(e) => setNewFormProject(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F3F4F6] border border-transparent focus:border-neutral-200 focus:bg-white text-xs text-neutral-800 rounded-lg focus:outline-none transition-all"
                  >
                    {projects.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Sharing selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-500">Sharing setting</label>
                  <select
                    value={newFormShared}
                    onChange={(e) => setNewFormShared(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-[#F3F4F6] border border-transparent focus:border-neutral-200 focus:bg-white text-xs text-neutral-800 rounded-lg focus:outline-none transition-all"
                  >
                    <option value="none">Private (only me)</option>
                    <option value="my-forms">Shared my forms</option>
                    <option value="with-me">Shared with me</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold rounded-lg text-neutral-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg transition-all"
                  >
                    Create Form
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Old editor modal removed - now uses /builder/[id] route */}



      {/* SETTINGS MODAL */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm"
              onClick={() => setShowSettingsModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
                <h3 className="font-bold text-neutral-900 text-sm md:text-base tracking-tight">System Settings</h3>
                <button onClick={() => setShowSettingsModal(false)} className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-full transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-6">

                {/* Compact Mode */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-800">Compact Mode Layout</h4>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Densely fit more dashboard forms cards on screen.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={compactMode}
                    onChange={(e) => setCompactMode(e.target.checked)}
                    className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400"
                  />
                </div>

                {/* High contrast theme block */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-800">High Contrast Canvas</h4>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Toggle dark gray backgrounds for higher visual clarity.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={(e) => setHighContrast(e.target.checked)}
                    className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400"
                  />
                </div>

                <hr className="border-neutral-100" />

                {/* Database resets */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-red-600">Danger Zone</h4>
                  <p className="text-[10px] text-neutral-400">Restores all original pictures forms and projects. Action cannot be undone.</p>
                  <button
                    onClick={handleResetAllData}
                    type="button"
                    className="w-full py-2.5 border border-red-200 hover:bg-red-50 text-red-700 text-xs font-semibold rounded-lg transition-all"
                  >
                    Reset System Database
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HELP AND SUPPORT MODAL */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm"
              onClick={() => setShowHelpModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
                <h3 className="font-bold text-neutral-900 text-sm md:text-base tracking-tight font-sans">Help and Support Center</h3>
                <button onClick={() => setShowHelpModal(false)} className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-full transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4 text-xs text-neutral-600 leading-relaxed font-medium">
                <div>
                  <h4 className="font-bold text-neutral-800 text-xs uppercase tracking-wide">Quick Guide</h4>
                  <p className="mt-1">
                    This forms manager allows constructing lightweight customized survey documents, recording mock response data directly in the browser.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-neutral-800 text-xs uppercase tracking-wide">Key Features</h4>
                  <ul className="list-disc pl-4 mt-1 space-y-1">
                    <li>Create forms instantly assigning to custom user projects.</li>
                    <li>Toggle between clean responsive grid and tables layouts.</li>
                    <li>Mark favorites or discard items securely to local Trash.</li>
                    <li>Customize questions and capture live submission logs.</li>
                  </ul>
                </div>

                <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100 mt-4 text-[10px]">
                  <span className="font-bold text-neutral-700 block">Need Developer Support?</span>
                  <span className="text-neutral-400 block mt-0.5">Please consult the internal documentation or contact local admin.</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
