<<<<<<< HEAD
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

  // Selected Form for full interactive view / editor
  const [selectedForm, setSelectedForm] = useState<FormItem | null>(null);
  const [selectedFormFields, setSelectedFormFields] = useState<FormField[]>([]);
  const [selectedFormResponses, setSelectedFormResponses] = useState<Record<string, any>[]>([]);
  const [activeEditorTab, setActiveEditorTab] = useState<'editor' | 'preview' | 'responses'>('editor');

  // Custom states for the new Clean Minimalism Form Builder
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<FormField[][]>([]);
  const [redoStack, setRedoStack] = useState<FormField[][]>([]);
  const [searchFieldQuery, setSearchFieldQuery] = useState<string>('');
  const [sidebarCategory, setSidebarCategory] = useState<'all' | 'input' | 'choice'>('all');

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

  // Open Form Detail/Editor Modal
  const handleOpenFormDetails = (form: FormItem) => {
    setSelectedForm(form);
    setSelectedFormFields([...form.fields]);
    setSelectedFormResponses([...form.responses]);
    setActiveEditorTab('editor');

    // Update Viewed timestamp
    const updated = forms.map(f => {
      if (f.id === form.id) {
        return { ...f, viewedAt: Date.now() };
      }
      return f;
    });
    saveForms(updated);
  };

  // Save Field Changes inside Editor Modal
  const handleSaveFields = () => {
    if (!selectedForm) return;
    const updated = forms.map(f => {
      if (f.id === selectedForm.id) {
        return { ...f, fields: selectedFormFields, responses: selectedFormResponses, lastEdited: 'Edited just now' };
      }
      return f;
    });
    saveForms(updated);
    triggerToast('Changes saved successfully');
  };

  // Field Editor Helpers with Undo/Redo & Multi-Type Support
  const updateFieldsWithHistory = (newFields: FormField[]) => {
    setUndoStack(prev => [...prev, selectedFormFields]);
    setRedoStack([]); // Clear redo stack on action
    setSelectedFormFields(newFields);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, prev.length - 1));
    setRedoStack(prev => [...prev, selectedFormFields]);
    setSelectedFormFields(previous);
    triggerToast('Action undone');
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, prev.length - 1));
    setUndoStack(prev => [...prev, selectedFormFields]);
    setSelectedFormFields(next);
    triggerToast('Action redone');
  };

  const addFieldToForm = (type: string) => {
    let label = 'New Question';
    let placeholder = 'Enter response...';
    let subtitle = '';
    let maxRating = 5;
    let options: string[] | undefined = undefined;

    switch (type) {
      case 'text':
        label = 'Text Input';
        placeholder = 'Enter response...';
        break;
      case 'section':
        label = 'Section Title';
        subtitle = 'Describe the context or instructions for this section.';
        placeholder = '';
        break;
      case 'number':
        label = 'Number Input';
        placeholder = 'e.g. 42';
        break;
      case 'rating':
        label = 'Rating Input';
        maxRating = 5;
        break;
      case 'url':
        label = 'URL Input';
        placeholder = 'https://example.com';
        break;
      case 'likert':
        label = 'Likert Scale';
        options = ['Very Unsatisfied', 'Unsatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'];
        break;
      case 'date':
        label = 'Date Picker';
        placeholder = 'Select date';
        break;
      case 'checkbox':
        label = 'Checkbox Toggle';
        placeholder = '';
        break;
      case 'time':
        label = 'Time Picker';
        placeholder = 'Select time';
        break;
      case 'file':
        label = 'File Upload';
        placeholder = 'Drag & drop files here to upload';
        break;
      case 'select':
        label = 'Select Dropdown';
        options = ['Option A', 'Option B', 'Option C'];
        break;
      case 'radio':
        label = 'Radio Choice';
        options = ['Choice 1', 'Choice 2', 'Choice 3'];
        break;
      case 'radio_play':
        label = 'Radio Play';
        options = ['Radio Channel A', 'Radio Channel B', 'Radio Channel C'];
        break;
      default:
        label = 'Custom Field';
        break;
    }

    const newField: FormField = {
      id: createUniqueId(),
      type,
      label,
      placeholder,
      subtitle,
      maxRating,
      required: false,
      options
    };

    updateFieldsWithHistory([...selectedFormFields, newField]);
    setActiveFieldId(newField.id); // automatically select newly added element!
    triggerToast(`Added ${label}`);
  };

  const removeFieldFromForm = (fieldId: string) => {
    updateFieldsWithHistory(selectedFormFields.filter(f => f.id !== fieldId));
    if (activeFieldId === fieldId) {
      setActiveFieldId(null);
    }
    triggerToast('Field removed');
  };

  const updateFieldLabel = (fieldId: string, value: string) => {
    setSelectedFormFields(selectedFormFields.map(f => f.id === fieldId ? { ...f, label: value } : f));
  };

  const updateFieldPlaceholder = (fieldId: string, value: string) => {
    setSelectedFormFields(selectedFormFields.map(f => f.id === fieldId ? { ...f, placeholder: value } : f));
  };

  const updateFieldSubtitle = (fieldId: string, value: string) => {
    setSelectedFormFields(selectedFormFields.map(f => f.id === fieldId ? { ...f, subtitle: value } : f));
  };

  const updateFieldMaxRating = (fieldId: string, value: number) => {
    setSelectedFormFields(selectedFormFields.map(f => f.id === fieldId ? { ...f, maxRating: value } : f));
  };

  const updateFieldRequired = (fieldId: string, val: boolean) => {
    setSelectedFormFields(selectedFormFields.map(f => f.id === fieldId ? { ...f, required: val } : f));
  };

  const addSelectOption = (fieldId: string) => {
    updateFieldsWithHistory(selectedFormFields.map(f => {
      if (f.id === fieldId) {
        const currentOptions = f.options || [];
        return { ...f, options: [...currentOptions, `Option ${currentOptions.length + 1}`] };
      }
      return f;
    }));
  };

  const updateSelectOptionText = (fieldId: string, index: number, value: string) => {
    setSelectedFormFields(selectedFormFields.map(f => {
      if (f.id === fieldId && f.options) {
        const nextOpts = [...f.options];
        nextOpts[index] = value;
        return { ...f, options: nextOpts };
      }
      return f;
    }));
  };

  const removeSelectOption = (fieldId: string, index: number) => {
    updateFieldsWithHistory(selectedFormFields.map(f => {
      if (f.id === fieldId && f.options) {
        return { ...f, options: f.options.filter((_, i) => i !== index) };
      }
      return f;
    }));
  };

  const reorderField = (fieldId: string, direction: 'up' | 'down') => {
    const index = selectedFormFields.findIndex(f => f.id === fieldId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === selectedFormFields.length - 1) return;

    const newFields = [...selectedFormFields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    // swap
    const temp = newFields[index];
    newFields[index] = newFields[targetIndex];
    newFields[targetIndex] = temp;

    updateFieldsWithHistory(newFields);
  };

  const duplicateField = (fieldId: string) => {
    const field = selectedFormFields.find(f => f.id === fieldId);
    if (!field) return;

    const duplicated: FormField = {
      ...field,
      id: createUniqueId(),
      label: `${field.label} (Copy)`
    };

    const index = selectedFormFields.findIndex(f => f.id === fieldId);
    const newFields = [...selectedFormFields];
    newFields.splice(index + 1, 0, duplicated);

    updateFieldsWithHistory(newFields);
    setActiveFieldId(duplicated.id);
    triggerToast('Field duplicated');
  };

  const clearAllFields = () => {
    if (selectedFormFields.length === 0) return;
    updateFieldsWithHistory([]);
    setActiveFieldId(null);
    triggerToast('Cleared all builder elements');
  };

  // Mock Form Submit Response in Preview Tab
  const [previewResponseData, setPreviewResponseData] = useState<Record<string, any>>({});
  const handlePreviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForm) return;

    // Validate required fields
    for (const f of selectedFormFields) {
      if (f.required && !previewResponseData[f.id]) {
        triggerToast(`Please fill the required field: ${f.label}`);
        return;
      }
    }

    const nextResponse = { ...previewResponseData, _timestamp: Date.now() };
    const nextResponses = [nextResponse, ...selectedFormResponses];
    setSelectedFormResponses(nextResponses);

    // Save directly back to memory & localstorage
    const updated = forms.map(f => {
      if (f.id === selectedForm.id) {
        return { ...f, responses: nextResponses, lastEdited: 'Edited just now' };
      }
      return f;
    });
    saveForms(updated);

    // Reset response fields
    setPreviewResponseData({});
    triggerToast('Response submitted successfully! View in responses tab.');
    setActiveEditorTab('responses');
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

      {/* DETAILED FORM PREVIEW & FIELD BUILDER MODAL */}
      <AnimatePresence>
        {selectedForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm"
              onClick={() => {
                handleSaveFields();
                setSelectedForm(null);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 12 }}
              className="bg-[#FAFAFA] rounded-xl w-full max-w-7xl h-[90vh] shadow-2xl relative z-10 flex flex-col overflow-hidden border border-neutral-200"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between shrink-0 bg-white select-none">
                {/* Left side */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      handleSaveFields();
                      setSelectedForm(null);
                    }}
                    className="p-1.5 hover:bg-neutral-100 text-neutral-800 rounded-lg transition-all"
                    title="Back to Dashboard"
                  >
                    <Home className="w-4 h-4" />
                  </button>

                  <div className="w-px h-5 bg-neutral-200" />

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={selectedForm.name}
                      onChange={(e) => {
                        const nextName = e.target.value;
                        setSelectedForm({ ...selectedForm, name: nextName });
                        const updated = forms.map(f => f.id === selectedForm.id ? { ...f, name: nextName } : f);
                        saveForms(updated);
                      }}
                      className="font-bold text-neutral-950 text-xs tracking-tight bg-transparent focus:bg-neutral-50 border border-transparent hover:border-neutral-200 focus:border-neutral-950 rounded px-2.5 py-1 focus:outline-none transition-all w-44 font-sans"
                      placeholder="Name forms"
                    />
                    <span className="text-[9px] bg-neutral-100 text-neutral-700 font-mono px-2 py-0.5 rounded tracking-wider uppercase font-bold border border-neutral-200/50">
                      {selectedForm.projectName}
                    </span>
                  </div>
                </div>

                {/* Center Tabs to toggle between Builder, Preview and Responses */}
                <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-0.5 border border-neutral-200/60">
                  <button
                    onClick={() => setActiveEditorTab('editor')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeEditorTab === 'editor' ? 'bg-white text-neutral-950 shadow-sm border border-neutral-200/50' : 'text-neutral-500 hover:text-neutral-950'
                      }`}
                  >
                    Builder
                  </button>
                  <button
                    onClick={() => setActiveEditorTab('preview')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeEditorTab === 'preview' ? 'bg-white text-neutral-950 shadow-sm border border-neutral-200/50' : 'text-neutral-500 hover:text-neutral-950'
                      }`}
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => setActiveEditorTab('responses')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeEditorTab === 'responses' ? 'bg-white text-neutral-950 shadow-sm border border-neutral-200/50' : 'text-neutral-500 hover:text-neutral-950'
                      }`}
                  >
                    Responses ({selectedFormResponses.length})
                  </button>
                </div>

                {/* Right side controls matching Desktop-14 */}
                <div className="flex items-center gap-2">
                  {/* Undo / Redo */}
                  <button
                    onClick={handleUndo}
                    disabled={undoStack.length === 0}
                    className="p-1.5 text-neutral-600 hover:bg-neutral-100 rounded-lg disabled:opacity-30 transition-all"
                    title="Undo"
                  >
                    <CornerUpLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={redoStack.length === 0}
                    className="p-1.5 text-neutral-600 hover:bg-neutral-100 rounded-lg disabled:opacity-30 transition-all"
                    title="Redo"
                  >
                    <CornerUpRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-px h-5 bg-neutral-200" />

                  {/* Setting */}
                  <button
                    onClick={() => {
                      setShowSettingsModal(true);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 border border-neutral-200 hover:border-neutral-950 hover:bg-neutral-50 rounded-lg text-[11px] font-bold text-neutral-800 transition-all"
                  >
                    <Settings className="w-3 h-3 text-neutral-500" />
                    <span>Setting</span>
                  </button>

                  {/* Preview */}
                  <button
                    onClick={() => setActiveEditorTab(activeEditorTab === 'preview' ? 'editor' : 'preview')}
                    className={`flex items-center gap-1 px-2.5 py-1.5 border rounded-lg text-[11px] font-bold transition-all ${activeEditorTab === 'preview' ? 'bg-neutral-950 text-white border-neutral-950' : 'border-neutral-200 hover:border-neutral-950 hover:bg-neutral-50 text-neutral-800'
                      }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Preview</span>
                  </button>

                  {/* Present */}
                  <button
                    onClick={() => {
                      triggerToast('Entering presentation preview');
                      setActiveEditorTab('preview');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 border border-neutral-200 hover:border-neutral-950 hover:bg-neutral-50 rounded-lg text-[11px] font-bold text-neutral-800 transition-all"
                  >
                    <Monitor className="w-3 h-3 text-neutral-500" />
                    <span>Present</span>
                  </button>

                  {/* Clear All with red label and red outline */}
                  <button
                    onClick={clearAllFields}
                    className="flex items-center gap-1 px-2.5 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-[11px] font-bold transition-all"
                  >
                    <Trash className="w-3 h-3" />
                    <span>Clear All</span>
                  </button>
                </div>
              </div>

              {/* Modal Core Area */}
              <div className="flex-1 overflow-hidden flex bg-[#FAFAFA]">

                {activeEditorTab === 'editor' && (
                  <div className="flex-1 flex divide-x divide-neutral-200 overflow-hidden h-full">

                    {/* COLUMN 1: LEFT SIDEBAR - Form Elements */}
                    <div className="w-72 bg-white flex flex-col h-full select-none shrink-0 overflow-y-auto border-r border-neutral-200">
                      <div className="p-4 space-y-4">
                        <div>
                          <h4 className="text-xs font-bold text-neutral-950 uppercase tracking-wider">Form Elements</h4>
                          <p className="text-[10px] text-neutral-400 mt-0.5">Click an element to add to canvas</p>
                        </div>

                        {/* Search input bar */}
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                          <input
                            type="text"
                            value={searchFieldQuery}
                            onChange={(e) => setSearchFieldQuery(e.target.value)}
                            placeholder="Search elements..."
                            className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-neutral-950 text-xs rounded-lg focus:outline-none transition-all font-medium text-neutral-800"
                          />
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex bg-neutral-100 rounded-lg p-0.5 border border-neutral-200/50">
                          {(['all', 'input', 'choice'] as const).map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setSidebarCategory(cat)}
                              className={`flex-1 text-center py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${sidebarCategory === cat ? 'bg-white text-neutral-950 shadow-sm border border-neutral-200/50' : 'text-neutral-500 hover:text-neutral-950'
                                }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Elements List */}
                      <div className="px-4 pb-6 flex-1 overflow-y-auto space-y-2">
                        {(() => {
                          const elementsList = [
                            { type: 'text', label: 'Text Input', category: 'input', icon: FileText },
                            { type: 'section', label: 'Section', category: 'input', icon: Grid },
                            { type: 'number', label: 'Number Input', category: 'input', icon: Hash },
                            { type: 'rating', label: 'Rating Input', category: 'choice', icon: Star },
                            { type: 'url', label: 'URL Input', category: 'input', icon: Globe },
                            { type: 'likert', label: 'Likert', category: 'choice', icon: SlidersHorizontal },
                            { type: 'date', label: 'Date Picker', category: 'input', icon: Calendar },
                            { type: 'checkbox', label: 'Checkbox', category: 'choice', icon: CheckSquare },
                            { type: 'time', label: 'Time Picker', category: 'input', icon: Clock },
                            { type: 'file', label: 'File Upload', category: 'input', icon: UploadCloud },
                            { type: 'select', label: 'Select Dropdown', category: 'choice', icon: ChevronDown },
                            { type: 'radio', label: 'Radio Choice', category: 'choice', icon: CircleDot },
                            { type: 'radio_play', label: 'Radio Play', category: 'choice', icon: Play },
                          ];

                          const filtered = elementsList.filter(el => {
                            const matchesSearch = el.label.toLowerCase().includes(searchFieldQuery.toLowerCase());
                            const matchesCat = sidebarCategory === 'all' || el.category === sidebarCategory;
                            return matchesSearch && matchesCat;
                          });

                          if (filtered.length === 0) {
                            return <p className="text-[11px] text-neutral-400 text-center py-6">No matching elements found</p>;
                          }

                          return filtered.map((el) => {
                            const IconComp = el.icon;
                            return (
                              <button
                                key={el.type}
                                onClick={() => addFieldToForm(el.type)}
                                className="w-full flex items-center justify-between px-3.5 py-3 bg-white border border-neutral-200 hover:border-neutral-950 text-neutral-800 hover:text-black font-semibold text-xs rounded-lg transition-all text-left shadow-sm hover:shadow-md group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <IconComp className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-900 transition-all shrink-0" />
                                  <span className="truncate">{el.label}</span>
                                </div>
                                <Plus className="w-3 h-3 text-neutral-300 group-hover:text-neutral-900 transition-all shrink-0" />
                              </button>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    {/* COLUMN 2: CENTER - Form Canvas Workspace */}
                    <div className="flex-1 bg-[#FAFAFA] flex flex-col h-full overflow-hidden">
                      <div className="px-6 py-4 bg-white border-b border-neutral-150 flex items-center justify-between shrink-0">
                        <div>
                          <h3 className="text-sm font-bold text-neutral-950 tracking-tight">Form Builder</h3>
                          <p className="text-[10px] text-neutral-500 mt-0.5">Drag and drop elements from the left sidebar to build your form</p>
                        </div>
                        <span className="text-[9px] bg-neutral-950 text-white font-mono px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                          {selectedFormFields.length} active {selectedFormFields.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>

                      {/* Canvas Wrapper */}
                      <div className="flex-1 p-6 overflow-y-auto">
                        {selectedFormFields.length === 0 ? (
                          /* EMPTY STATE DASHED CONTAINER MICKING THE IMAGE */
                          <div className="border-2 border-dashed border-neutral-200 rounded-lg flex flex-col items-center justify-center p-12 text-center h-[350px] bg-white max-w-xl mx-auto shadow-sm">
                            <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-400 mb-4 border border-neutral-200">
                              <Grid className="w-5 h-5 text-neutral-500" />
                            </div>
                            <p className="text-xs font-bold text-neutral-950">Drop form elements here to start building</p>
                            <p className="text-[10px] text-neutral-400 mt-1 max-w-xs leading-normal font-medium">
                              Drag elements from the sidebar to create your form or click on any sidebar card to insert instantly.
                            </p>
                          </div>
                        ) : (
                          /* CANVAS ELEMENTS LIST */
                          <div className="max-w-xl mx-auto space-y-4 pb-12">
                            {selectedFormFields.map((field, index) => {
                              const isActive = activeFieldId === field.id;
                              return (
                                <div
                                  key={field.id}
                                  onClick={() => setActiveFieldId(field.id)}
                                  className={`relative p-5 bg-white border rounded-lg transition-all cursor-pointer group ${isActive
                                      ? 'border-neutral-950 ring-1 ring-neutral-950 shadow-md'
                                      : 'border-neutral-200 hover:border-neutral-400 shadow-sm'
                                    }`}
                                >
                                  {/* FLOATING ACTION OVERLAY CONTROLS */}
                                  <div className="absolute -top-3.5 right-3.5 opacity-0 group-hover:opacity-100 bg-white border border-neutral-200 rounded-md shadow-md flex items-center divide-x divide-neutral-200 z-10">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); reorderField(field.id, 'up'); }}
                                      className="p-1.5 hover:bg-neutral-50 text-neutral-500 hover:text-black transition-all"
                                      title="Move Up"
                                    >
                                      <ArrowUp className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); reorderField(field.id, 'down'); }}
                                      className="p-1.5 hover:bg-neutral-50 text-neutral-500 hover:text-black transition-all"
                                      title="Move Down"
                                    >
                                      <ArrowDown className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); duplicateField(field.id); }}
                                      className="p-1.5 hover:bg-neutral-50 text-neutral-500 hover:text-black transition-all"
                                      title="Duplicate"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); removeFieldFromForm(field.id); }}
                                      className="p-1.5 hover:bg-red-50 text-neutral-500 hover:text-red-600 transition-all"
                                      title="Delete"
                                    >
                                      <Trash className="w-3 h-3" />
                                    </button>
                                  </div>

                                  {/* Index Indicator */}
                                  <span className="text-[9px] font-mono font-bold text-neutral-400 block mb-2 uppercase tracking-wide">
                                    Field #{index + 1} &bull; {field.type.replace('_', ' ')}
                                  </span>

                                  {/* Field Mockup Content */}
                                  <div className="space-y-2 pointer-events-none select-none">
                                    {/* SECTION TYPE */}
                                    {field.type === 'section' && (
                                      <div className="border-b border-neutral-150 pb-2.5">
                                        <h3 className="text-sm font-bold text-neutral-950 tracking-tight">{field.label || 'Section Title'}</h3>
                                        {field.subtitle && <p className="text-[10px] text-neutral-500 mt-1 leading-normal">{field.subtitle}</p>}
                                      </div>
                                    )}

                                    {/* TEXT TYPE */}
                                    {field.type === 'text' && (
                                      <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                                          <span>{field.label}</span>
                                          {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        <input
                                          type="text"
                                          disabled
                                          placeholder={field.placeholder || 'Enter response...'}
                                          className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                                        />
                                      </div>
                                    )}

                                    {/* NUMBER TYPE */}
                                    {field.type === 'number' && (
                                      <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                                          <span>{field.label}</span>
                                          {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        <input
                                          type="number"
                                          disabled
                                          placeholder={field.placeholder || 'e.g. 42'}
                                          className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                                        />
                                      </div>
                                    )}

                                    {/* URL TYPE */}
                                    {field.type === 'url' && (
                                      <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                                          <span>{field.label}</span>
                                          {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        <div className="relative">
                                          <Globe className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                                          <input
                                            type="text"
                                            disabled
                                            placeholder={field.placeholder || 'https://example.com'}
                                            className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {/* DATE TYPE */}
                                    {field.type === 'date' && (
                                      <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                                          <span>{field.label}</span>
                                          {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        <div className="relative">
                                          <Calendar className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                                          <input
                                            type="text"
                                            disabled
                                            placeholder={field.placeholder || 'Select date'}
                                            className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {/* TIME TYPE */}
                                    {field.type === 'time' && (
                                      <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                                          <span>{field.label}</span>
                                          {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        <div className="relative">
                                          <Clock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                                          <input
                                            type="text"
                                            disabled
                                            placeholder={field.placeholder || 'Select time'}
                                            className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {/* FILE UPLOAD TYPE */}
                                    {field.type === 'file' && (
                                      <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                                          <span>{field.label}</span>
                                          {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        <div className="border border-dashed border-neutral-300 bg-neutral-50 rounded-lg p-5 flex flex-col items-center justify-center text-center">
                                          <UploadCloud className="w-5 h-5 text-neutral-400 mb-1.5" />
                                          <span className="text-xs text-neutral-800 font-bold">{field.placeholder || 'Click or drag files to upload'}</span>
                                          <span className="text-[9px] text-neutral-400 mt-0.5 font-mono">Maximum size: 10MB</span>
                                        </div>
                                      </div>
                                    )}

                                    {/* CHECKBOX TYPE */}
                                    {field.type === 'checkbox' && (
                                      <div className="flex items-start gap-2.5 pt-1">
                                        <div className="w-4 h-4 rounded border border-neutral-300 bg-neutral-50 shrink-0 mt-0.5" />
                                        <div className="space-y-0.5">
                                          <span className="text-xs font-semibold text-neutral-800 block">{field.label}</span>
                                          {field.placeholder && <p className="text-[10px] text-neutral-500 leading-tight">{field.placeholder}</p>}
                                        </div>
                                      </div>
                                    )}

                                    {/* RATING INPUT TYPE */}
                                    {field.type === 'rating' && (
                                      <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                                          <span>{field.label}</span>
                                          {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        <div className="flex items-center gap-1">
                                          {Array.from({ length: field.maxRating || 5 }).map((_, idx) => (
                                            <Star key={idx} className="w-4 h-4 text-neutral-300" />
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* LIKERT TYPE */}
                                    {field.type === 'likert' && (
                                      <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                                          <span>{field.label}</span>
                                          {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        <div className="grid grid-cols-5 gap-1.5 pt-1.5">
                                          {(field.options || []).map((opt, oIdx) => (
                                            <div key={oIdx} className="flex flex-col items-center gap-1 bg-[#FAFAFA] p-2 rounded-lg border border-neutral-200">
                                              <div className="w-3.5 h-3.5 rounded-full border border-neutral-300 bg-white" />
                                              <span className="text-[8px] text-neutral-500 text-center font-bold uppercase truncate w-full">{opt}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* SELECT DROPDOWN TYPE */}
                                    {field.type === 'select' && (
                                      <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                                          <span>{field.label}</span>
                                          {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        <div className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-500 flex items-center justify-between">
                                          <span>{field.placeholder || 'Select option...'}</span>
                                          <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                                        </div>
                                      </div>
                                    )}

                                    {/* RADIO CHOICE TYPE */}
                                    {field.type === 'radio' && (
                                      <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                                          <span>{field.label}</span>
                                          {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        <div className="space-y-1 pt-1">
                                          {(field.options || []).map((opt, oIdx) => (
                                            <div key={oIdx} className="flex items-center gap-2">
                                              <div className="w-3.5 h-3.5 rounded-full border border-neutral-300 bg-neutral-50" />
                                              <span className="text-xs text-neutral-600 font-medium">{opt}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* RADIO PLAY TYPE */}
                                    {field.type === 'radio_play' && (
                                      <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                                          <span>{field.label}</span>
                                          {field.required && <span className="text-red-500">*</span>}
                                        </label>
                                        <div className="space-y-1.5 pt-1">
                                          {(field.options || []).map((opt, oIdx) => (
                                            <div key={oIdx} className="flex items-center justify-between bg-neutral-50 px-3 py-2 border border-neutral-200 rounded-lg">
                                              <div className="flex items-center gap-2">
                                                <div className="w-3.5 h-3.5 rounded-full border border-neutral-300 bg-white" />
                                                <span className="text-xs text-neutral-800 font-bold">{opt}</span>
                                              </div>
                                              <Play className="w-3 h-3 text-neutral-500" />
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}


                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* COLUMN 3: RIGHT PANEL - Config Properties Panel */}
                    <div className="w-72 bg-white flex flex-col h-full shrink-0 overflow-y-auto select-none">
                      {(() => {
                        const activeField = selectedFormFields.find(f => f.id === activeFieldId);
                        if (!activeField) {
                          return (
                            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
                              <Settings2 className="w-6 h-6 text-neutral-300 mb-3" />
                              <p className="text-[11px] font-bold text-neutral-400 tracking-tight leading-normal">
                                Select an element to edit its properties
                              </p>
                            </div>
                          );
                        }

                        const hasOptions = ['select', 'radio', 'radio_play', 'likert'].includes(activeField.type);
                        const hasPlaceholder = ['text', 'number', 'url', 'date', 'time', 'file', 'select', 'checkbox'].includes(activeField.type);
                        const hasSubtitle = activeField.type === 'section';

                        return (
                          <div className="p-5 space-y-5">
                            <div>
                              <h4 className="text-xs font-bold text-neutral-950 uppercase tracking-wider">Element Properties</h4>
                              <p className="text-[10px] text-neutral-400 mt-0.5 font-mono uppercase">ID: {activeField.id}</p>
                            </div>

                            {/* Label */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Field Label / Title</label>
                              <input
                                type="text"
                                value={activeField.label}
                                onChange={(e) => updateFieldLabel(activeField.id, e.target.value)}
                                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-neutral-950 text-xs rounded-lg focus:outline-none transition-all font-medium text-neutral-950"
                              />
                            </div>

                            {/* Subtitle (for Section) */}
                            {hasSubtitle && (
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Section Description</label>
                                <textarea
                                  value={activeField.subtitle || ''}
                                  onChange={(e) => updateFieldSubtitle(activeField.id, e.target.value)}
                                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-neutral-950 text-xs rounded-lg focus:outline-none h-20 transition-all font-medium text-neutral-950"
                                />
                              </div>
                            )}

                            {/* Placeholder / Description Helper */}
                            {hasPlaceholder && (
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                                  Input Placeholder
                                </label>
                                <input
                                  type="text"
                                  value={activeField.placeholder || ''}
                                  onChange={(e) => updateFieldPlaceholder(activeField.id, e.target.value)}
                                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-neutral-950 text-xs rounded-lg focus:outline-none transition-all font-medium text-neutral-950"
                                />
                              </div>
                            )}

                            {/* Max Rating selection */}
                            {activeField.type === 'rating' && (
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Maximum Star Rating</label>
                                <select
                                  value={activeField.maxRating || 5}
                                  onChange={(e) => updateFieldMaxRating(activeField.id, parseInt(e.target.value))}
                                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-neutral-950 text-xs rounded-lg focus:outline-none transition-all font-medium text-neutral-950"
                                >
                                  <option value={5}>5 Stars</option>
                                  <option value={10}>10 Stars</option>
                                </select>
                              </div>
                            )}

                            {/* Toggle Required (Not for section) */}
                            {activeField.type !== 'section' && (
                              <div className="flex items-center gap-2 pt-1 border-t border-neutral-100">
                                <input
                                  type="checkbox"
                                  checked={!!activeField.required}
                                  onChange={(e) => updateFieldRequired(activeField.id, e.target.checked)}
                                  className="rounded border-neutral-300 focus:ring-neutral-950 text-neutral-950 w-3.5 h-3.5"
                                  id="req-prop"
                                />
                                <label htmlFor="req-prop" className="text-[11px] font-bold text-neutral-600 cursor-pointer select-none">
                                  Mark this field as required
                                </label>
                              </div>
                            )}

                            {/* Options configuration for select / radio / likert */}
                            {hasOptions && (
                              <div className="space-y-2.5 pt-4 border-t border-neutral-150">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">List Options</label>
                                <div className="space-y-1.5">
                                  {(activeField.options || []).map((opt, oIdx) => (
                                    <div key={oIdx} className="flex items-center gap-1.5">
                                      <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => updateSelectOptionText(activeField.id, oIdx, e.target.value)}
                                        className="text-xs text-neutral-950 font-semibold bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1 w-full max-w-[180px] focus:bg-white focus:outline-none focus:border-neutral-950"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeSelectOption(activeField.id, oIdx)}
                                        className="text-neutral-400 hover:text-red-600 p-1 text-[10px] font-bold transition-all uppercase tracking-wider"
                                        title="Delete option"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => addSelectOption(activeField.id)}
                                    className="text-[10px] text-neutral-950 hover:text-black font-bold block pt-1 hover:underline"
                                  >
                                    + Add custom option
                                  </button>
                                </div>
                              </div>
                            )}


                          </div>
                        );
                      })()}
                    </div>

                  </div>
                )}

                {/* LIVE PREVIEW INTERACTION MODE */}
                {activeEditorTab === 'preview' && (
                  <div className="flex-1 max-w-2xl mx-auto p-6 md:p-8 w-full overflow-y-auto">
                    <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden mb-12">
                      <div className="h-1.5 bg-neutral-950 w-full" />

                      <div className="p-6 md:p-8 space-y-6">
                        <div>
                          <h3 className="text-xl font-bold text-neutral-950 tracking-tight">{selectedForm.name}</h3>
                          <p className="text-[11px] text-neutral-400 mt-1 font-mono uppercase tracking-wider">Interactive Live Preview</p>
                        </div>

                        <form onSubmit={handlePreviewSubmit} className="space-y-6">
                          {selectedFormFields.length === 0 ? (
                            <p className="text-xs text-neutral-400 text-center py-6">
                              This form has no active fields. Switch to Builder tab to add some elements.
                            </p>
                          ) : (
                            selectedFormFields.map(f => (
                              <div key={f.id} className="space-y-2">
                                {/* Only show label if not section */}
                                {f.type !== 'section' && (
                                  <label className="text-xs font-bold text-neutral-950 block">
                                    {f.label}
                                    {f.required && <span className="text-red-500 ml-1">*</span>}
                                  </label>
                                )}

                                {/* text */}
                                {f.type === 'text' && (
                                  <input
                                    type="text"
                                    placeholder={f.placeholder || 'Enter response...'}
                                    value={previewResponseData[f.id] || ''}
                                    onChange={(e) => setPreviewResponseData({ ...previewResponseData, [f.id]: e.target.value })}
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-950 focus:bg-white focus:outline-none focus:border-neutral-950 transition-all font-semibold"
                                    required={f.required}
                                  />
                                )}

                                {/* email */}
                                {f.type === 'email' && (
                                  <input
                                    type="email"
                                    placeholder={f.placeholder || 'name@example.com'}
                                    value={previewResponseData[f.id] || ''}
                                    onChange={(e) => setPreviewResponseData({ ...previewResponseData, [f.id]: e.target.value })}
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-950 focus:bg-white focus:outline-none focus:border-neutral-950 transition-all font-semibold"
                                    required={f.required}
                                  />
                                )}

                                {/* paragraph */}
                                {f.type === 'paragraph' && (
                                  <textarea
                                    placeholder={f.placeholder || 'Enter response here...'}
                                    value={previewResponseData[f.id] || ''}
                                    onChange={(e) => setPreviewResponseData({ ...previewResponseData, [f.id]: e.target.value })}
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-950 h-24 focus:bg-white focus:outline-none focus:border-neutral-950 transition-all font-semibold"
                                    required={f.required}
                                  />
                                )}

                                {/* select */}
                                {f.type === 'select' && f.options && (
                                  <select
                                    value={previewResponseData[f.id] || ''}
                                    onChange={(e) => setPreviewResponseData({ ...previewResponseData, [f.id]: e.target.value })}
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-950 focus:bg-white focus:outline-none focus:border-neutral-950 transition-all font-semibold"
                                    required={f.required}
                                  >
                                    <option value="">Select option</option>
                                    {f.options.map((opt, oIdx) => (
                                      <option key={oIdx} value={opt}>{opt}</option>
                                    ))}
                                  </select>
                                )}

                                {/* checkbox */}
                                {f.type === 'checkbox' && (
                                  <div className="flex items-center gap-2 py-1">
                                    <input
                                      type="checkbox"
                                      id={`preview-${f.id}`}
                                      checked={!!previewResponseData[f.id]}
                                      onChange={(e) => setPreviewResponseData({ ...previewResponseData, [f.id]: e.target.checked })}
                                      className="rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950 w-3.5 h-3.5"
                                      required={f.required}
                                    />
                                    <label htmlFor={`preview-${f.id}`} className="text-xs text-neutral-600 select-none cursor-pointer font-medium">
                                      Confirm answer selection
                                    </label>
                                  </div>
                                )}

                                {/* section */}
                                {f.type === 'section' && (
                                  <div className="border-b border-neutral-200 pb-3 pt-2">
                                    <h3 className="text-sm font-bold text-neutral-950 tracking-tight">{f.label || 'Section Title'}</h3>
                                    {f.subtitle && <p className="text-[10px] text-neutral-500 mt-1 leading-normal font-medium">{f.subtitle}</p>}
                                  </div>
                                )}

                                {/* number */}
                                {f.type === 'number' && (
                                  <input
                                    type="number"
                                    placeholder={f.placeholder || 'e.g. 42'}
                                    value={previewResponseData[f.id] || ''}
                                    onChange={(e) => setPreviewResponseData({ ...previewResponseData, [f.id]: e.target.value })}
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-950 focus:bg-white focus:outline-none focus:border-neutral-950 transition-all font-semibold"
                                    required={f.required}
                                  />
                                )}

                                {/* rating */}
                                {f.type === 'rating' && (
                                  <div className="flex items-center gap-2 py-1">
                                    {Array.from({ length: f.maxRating || 5 }).map((_, idx) => {
                                      const starVal = idx + 1;
                                      const isSelected = starVal <= (previewResponseData[f.id] || 0);
                                      return (
                                        <button
                                          type="button"
                                          key={idx}
                                          onClick={() => setPreviewResponseData({ ...previewResponseData, [f.id]: starVal })}
                                          className="p-1 hover:scale-105 transition-all"
                                        >
                                          <Star className={`w-5 h-5 ${isSelected ? 'fill-neutral-950 text-neutral-950' : 'text-neutral-300 hover:text-neutral-500'}`} />
                                        </button>
                                      );
                                    })}
                                    {previewResponseData[f.id] && (
                                      <span className="text-[10px] text-neutral-500 font-mono">({previewResponseData[f.id]} / {f.maxRating || 5})</span>
                                    )}
                                  </div>
                                )}

                                {/* url */}
                                {f.type === 'url' && (
                                  <div className="relative">
                                    <Globe className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                                    <input
                                      type="url"
                                      placeholder={f.placeholder || 'https://example.com'}
                                      value={previewResponseData[f.id] || ''}
                                      onChange={(e) => setPreviewResponseData({ ...previewResponseData, [f.id]: e.target.value })}
                                      className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-950 focus:bg-white focus:outline-none focus:border-neutral-950 transition-all font-semibold"
                                      required={f.required}
                                    />
                                  </div>
                                )}

                                {/* likert */}
                                {f.type === 'likert' && (
                                  <div className="grid grid-cols-5 gap-2 pt-1">
                                    {(f.options || []).map((opt, oIdx) => {
                                      const isSelected = previewResponseData[f.id] === opt;
                                      return (
                                        <button
                                          type="button"
                                          key={oIdx}
                                          onClick={() => setPreviewResponseData({ ...previewResponseData, [f.id]: opt })}
                                          className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${isSelected
                                              ? 'bg-neutral-950 text-white border-neutral-950 shadow-sm'
                                              : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200/60'
                                            }`}
                                        >
                                          <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${isSelected ? 'border-white bg-white' : 'border-neutral-300'}`} />
                                          <span className="text-[8px] text-center font-bold uppercase truncate w-full">{opt}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* date */}
                                {f.type === 'date' && (
                                  <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                                    <input
                                      type="date"
                                      value={previewResponseData[f.id] || ''}
                                      onChange={(e) => setPreviewResponseData({ ...previewResponseData, [f.id]: e.target.value })}
                                      className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-950 focus:bg-white focus:outline-none focus:border-neutral-950 transition-all font-semibold"
                                      required={f.required}
                                    />
                                  </div>
                                )}

                                {/* time */}
                                {f.type === 'time' && (
                                  <div className="relative">
                                    <Clock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                                    <input
                                      type="time"
                                      value={previewResponseData[f.id] || ''}
                                      onChange={(e) => setPreviewResponseData({ ...previewResponseData, [f.id]: e.target.value })}
                                      className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-950 focus:bg-white focus:outline-none focus:border-neutral-950 transition-all font-semibold"
                                      required={f.required}
                                    />
                                  </div>
                                )}

                                {/* file */}
                                {f.type === 'file' && (
                                  <div className="border border-dashed border-neutral-300 bg-neutral-50 rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-neutral-100/50 transition-all relative">
                                    <input
                                      type="file"
                                      className="absolute inset-0 opacity-0 cursor-pointer"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          setPreviewResponseData({ ...previewResponseData, [f.id]: file.name });
                                          triggerToast(`Selected: ${file.name}`);
                                        }
                                      }}
                                    />
                                    <UploadCloud className="w-5 h-5 text-neutral-400 mb-1.5" />
                                    <span className="text-xs text-neutral-800 font-bold">
                                      {previewResponseData[f.id] ? `Selected: ${previewResponseData[f.id]}` : (f.placeholder || 'Click or drag files to upload')}
                                    </span>
                                    <span className="text-[9px] text-neutral-400 mt-0.5 font-mono">Simulated desktop folder picker</span>
                                  </div>
                                )}

                                {/* radio */}
                                {f.type === 'radio' && f.options && (
                                  <div className="space-y-1.5">
                                    {f.options.map((opt, oIdx) => {
                                      const isSelected = previewResponseData[f.id] === opt;
                                      return (
                                        <button
                                          type="button"
                                          key={oIdx}
                                          onClick={() => setPreviewResponseData({ ...previewResponseData, [f.id]: opt })}
                                          className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border text-left text-xs transition-all ${isSelected ? 'bg-neutral-950 border-neutral-950 text-white font-bold' : 'bg-neutral-50 border-neutral-200 text-neutral-800 hover:bg-neutral-100'
                                            }`}
                                        >
                                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-white' : 'border-neutral-300'}`}>
                                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                          </div>
                                          <span>{opt}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* radio_play */}
                                {f.type === 'radio_play' && f.options && (
                                  <div className="space-y-1.5">
                                    {f.options.map((opt, oIdx) => {
                                      const isSelected = previewResponseData[f.id] === opt;
                                      return (
                                        <button
                                          type="button"
                                          key={oIdx}
                                          onClick={() => setPreviewResponseData({ ...previewResponseData, [f.id]: opt })}
                                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-left transition-all ${isSelected ? 'bg-neutral-950 border-neutral-950 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800 hover:bg-neutral-100'
                                            }`}
                                        >
                                          <div className="flex items-center gap-2.5">
                                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-white' : 'border-neutral-300'}`}>
                                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                            </div>
                                            <span className="text-xs font-bold">{opt}</span>
                                          </div>
                                          <Play className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-neutral-500'}`} />
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}


                              </div>
                            ))
                          )}

                          <div className="pt-4 flex items-center justify-between border-t border-neutral-100 mt-6 select-none">
                            <span className="text-[9px] text-neutral-400 font-mono uppercase tracking-wider">Preview Environment</span>
                            <button
                              type="submit"
                              disabled={selectedFormFields.length === 0}
                              className="px-5 py-2 bg-neutral-950 text-white hover:bg-neutral-800 disabled:bg-neutral-200 text-xs font-bold rounded-lg transition-all"
                            >
                              Submit Form Answers
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

                {/* RESPONSES LOG VIEW */}
                {activeEditorTab === 'responses' && (
                  <div className="flex-1 p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full overflow-y-auto">
                    <div className="flex items-center justify-between select-none">
                      <div>
                        <h4 className="text-sm font-bold text-neutral-950">Form Submission History</h4>
                        <p className="text-[10px] text-neutral-400 mt-0.5 font-mono uppercase">Recorded user answers stored in local database</p>
                      </div>

                      {selectedFormResponses.length > 0 && (
                        <button
                          onClick={() => {
                            const jsonStr = JSON.stringify(selectedFormResponses, null, 2);
                            const blob = new Blob([jsonStr], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `${selectedForm.name}-responses.json`;
                            link.click();
                            triggerToast('Downloaded responses JSON');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 hover:border-neutral-950 rounded-lg text-xs font-bold text-neutral-800 transition-all bg-white"
                        >
                          <Download className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Export JSON</span>
                        </button>
                      )}
                    </div>

                    {selectedFormResponses.length === 0 ? (
                      <div className="p-12 border border-neutral-200 rounded-lg bg-white text-center select-none shadow-sm">
                        <p className="text-xs text-neutral-400">No responses captured yet. Fill and submit the form in the &quot;Preview&quot; tab.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedFormResponses.map((res, rIdx) => (
                          <div key={rIdx} className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-sm">
                            <div className="px-4 py-2.5 bg-[#FAFAFA] border-b border-neutral-150 flex items-center justify-between select-none">
                              <span className="text-[10px] font-mono text-neutral-500 font-bold">Response #{selectedFormResponses.length - rIdx}</span>
                              <span className="text-[9px] font-mono text-neutral-400">
                                {res._timestamp ? new Date(res._timestamp).toLocaleTimeString() : 'Unknown time'}
                              </span>
                            </div>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                              {selectedFormFields.map(f => (
                                <div key={f.id} className="space-y-0.5">
                                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block truncate">{f.label}</span>
                                  <span className="text-xs text-neutral-800 font-semibold">
                                    {res[f.id] === undefined ? '-' : typeof res[f.id] === 'boolean' ? (res[f.id] ? 'Confirmed' : 'Not Confirmed') : String(res[f.id])}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

=======
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
>>>>>>> bf0df39924059c84725d696402017623790a4ae0
    </div>
  );
}
