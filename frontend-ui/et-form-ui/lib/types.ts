// Shared types used across Dashboard, Builder, and Form Viewer

export type ElementType = 'Text' | 'Checkbox' | 'Dropdown' | 'Radio' | 'Date' | 'FileUpload' | 'Image' | 'Document' | 'Link';

export interface FormElement {
  id: string;
  type: ElementType;
  label: string;
  options?: string[];
  required?: boolean;
}

export interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  subtitle?: string;
  maxRating?: number;
}

export interface FormItem {
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

// Helper to read forms from localStorage
export function getFormsFromStorage(): FormItem[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('form_items');
  if (stored) return JSON.parse(stored);
  return [];
}

// Helper to save forms to localStorage
export function saveFormsToStorage(forms: FormItem[]): void {
  localStorage.setItem('form_items', JSON.stringify(forms));
}

// Helper to find a single form by ID
export function getFormById(id: string): FormItem | undefined {
  const forms = getFormsFromStorage();
  return forms.find(f => f.id === id);
}

// Helper to update a single form in storage
export function updateFormInStorage(id: string, updates: Partial<FormItem>): void {
  const forms = getFormsFromStorage();
  const updated = forms.map(f => f.id === id ? { ...f, ...updates } : f);
  saveFormsToStorage(updated);
}
