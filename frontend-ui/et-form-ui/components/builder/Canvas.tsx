'use client';

import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FormElement } from '@/lib/types';
import { GripVertical, Trash2, Image as ImageIcon, FileText, Link as LinkIcon, Plus, Settings } from 'lucide-react';

interface SortableFormItemProps {
  element: FormElement;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<FormElement>) => void;
}

function SortableFormItem({ element, onDelete, onUpdate }: SortableFormItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

  const [isEditing, setIsEditing] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleAddOption = () => {
    const currentOptions = element.options || [];
    onUpdate(element.id, { options: [...currentOptions, `Option ${currentOptions.length + 1}`] });
  };

  const handleUpdateOption = (index: number, val: string) => {
    if (!element.options) return;
    const newOptions = [...element.options];
    newOptions[index] = val;
    onUpdate(element.id, { options: newOptions });
  };

  const handleRemoveOption = (index: number) => {
    if (!element.options) return;
    const newOptions = element.options.filter((_, i) => i !== index);
    onUpdate(element.id, { options: newOptions });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass rounded-xl p-4 mb-4 flex gap-4 items-start group bg-[var(--bg-primary)] border-[var(--border-glass)] shadow-sm hover:shadow-md transition-shadow ${isEditing ? 'border-[var(--accent-purple)]' : ''}`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="cursor-grab text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors opacity-30 group-hover:opacity-100 mt-2"
      >
        <GripVertical size={20} />
      </div>
      
      <div className="flex-1 min-w-0">
        <input
          type="text"
          value={element.label}
          onChange={(e) => onUpdate(element.id, { label: e.target.value })}
          className="block text-sm font-bold mb-3 bg-transparent border-none outline-none text-[var(--text-primary)] focus:text-[var(--accent-purple)] w-full transition-colors truncate"
          placeholder="Enter field label..."
        />
        
        {/* Render Preview */}
        {!isEditing && (
          <div className="opacity-80 pointer-events-none">
            {element.type === 'Text' && <input type="text" disabled className="w-full rounded-lg bg-[var(--bg-card)] border border-[var(--border-glass)] p-2.5 text-sm" placeholder="Text input preview..." />}
            {element.type === 'Dropdown' && <select disabled className="w-full rounded-lg bg-[var(--bg-card)] border border-[var(--border-glass)] p-2.5 text-sm"><option>{element.options?.[0] || 'Select option...'}</option></select>}
            {element.type === 'Checkbox' && <div className="flex flex-col gap-2">{element.options?.map((opt, i) => <div key={i} className="flex items-center gap-2"><input type="checkbox" disabled className="rounded" /> <span className="text-sm">{opt}</span></div>) || <div className="flex items-center gap-2"><input type="checkbox" disabled className="rounded" /> <span className="text-sm">Option</span></div>}</div>}
            {element.type === 'Radio' && <div className="flex flex-col gap-2">{element.options?.map((opt, i) => <div key={i} className="flex items-center gap-2"><input type="radio" disabled /> <span className="text-sm">{opt}</span></div>) || <div className="flex items-center gap-2"><input type="radio" disabled /> <span className="text-sm">Option</span></div>}</div>}
            {element.type === 'Date' && <input type="date" disabled className="w-full rounded-lg bg-[var(--bg-card)] border border-[var(--border-glass)] p-2.5 text-sm" />}
            {element.type === 'FileUpload' && <div className="w-full border-2 border-dashed border-[var(--border-glass)] rounded-lg p-6 text-center text-sm text-[var(--text-muted)] bg-[var(--bg-card)]">Upload File Area</div>}
            {element.type === 'Image' && (
              <div className="w-full h-32 border border-[var(--border-glass)] rounded-lg bg-[var(--bg-card)] flex flex-col items-center justify-center text-[var(--text-muted)]">
                <ImageIcon size={24} className="mb-2" />
                <span className="text-xs">Image Placeholder</span>
              </div>
            )}
            {element.type === 'Document' && (
              <div className="w-full border border-[var(--border-glass)] rounded-lg bg-[var(--bg-card)] p-4 flex items-center gap-3 text-[var(--text-muted)]">
                <FileText size={20} />
                <span className="text-sm">PDF/Document Embed Placeholder</span>
              </div>
            )}
            {element.type === 'Link' && (
              <div className="w-full border border-[var(--border-glass)] rounded-lg bg-[var(--bg-card)] p-3 flex items-center gap-3 text-[var(--accent-purple)]">
                <LinkIcon size={16} />
                <span className="text-sm underline">External Link Placeholder</span>
              </div>
            )}
          </div>
        )}

        {/* Edit mode for options */}
        {isEditing && ['Dropdown', 'Radio', 'Checkbox'].includes(element.type) && (
          <div className="mt-4 bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-glass)]">
            <h4 className="text-xs font-bold text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Options</h4>
            <div className="flex flex-col gap-2 mb-3">
              {element.options?.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {element.type === 'Radio' ? <div className="w-3 h-3 rounded-full border border-[var(--border-glass)]" /> : element.type === 'Checkbox' ? <div className="w-3 h-3 rounded-sm border border-[var(--border-glass)]" /> : <div className="text-xs text-[var(--text-muted)]">{idx + 1}.</div>}
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleUpdateOption(idx, e.target.value)}
                    className="flex-1 bg-transparent border-b border-[var(--border-glass)] text-sm text-[var(--text-primary)] focus:border-[var(--accent-purple)] outline-none py-1"
                  />
                  <button onClick={() => handleRemoveOption(idx)} className="text-[var(--text-muted)] hover:text-red-400 p-1"><Trash2 size={14}/></button>
                </div>
              ))}
            </div>
            <button onClick={handleAddOption} className="text-xs font-medium text-[var(--accent-purple)] flex items-center gap-1 hover:underline">
              <Plus size={14} /> Add Option
            </button>
          </div>
        )}

        {/* Edit mode for General Settings */}
        {isEditing && (
          <div className="mt-4 bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-glass)] flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">Required Field</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={element.required || false} onChange={(e) => onUpdate(element.id, { required: e.target.checked })} />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--accent-purple)]"></div>
            </label>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 mt-1">
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`text-[var(--text-muted)] hover:text-[var(--accent-purple)] transition-colors bg-transparent border-none cursor-pointer p-2 rounded-lg ${isEditing ? 'bg-[var(--accent-purple)]/10 text-[var(--accent-purple)]' : 'opacity-0 group-hover:opacity-100'}`}
          title="Settings"
        >
          <Settings size={18} />
        </button>
        <button 
          onClick={() => onDelete(element.id)}
          className="text-[var(--text-muted)] hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer opacity-0 group-hover:opacity-100 p-2 rounded-lg"
          title="Delete"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

interface CanvasProps {
  elements: FormElement[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<FormElement>) => void;
}

export function Canvas({ elements, onDelete, onUpdate }: CanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-area',
  });

  return (
    <div 
      ref={setNodeRef}
      className={`w-full max-w-2xl min-h-[600px] rounded-2xl transition-all duration-300 p-8 shadow-xl ${
        isOver ? 'bg-[var(--bg-glass)] border-2 border-[var(--accent-purple)] border-dashed' : 'glass-strong'
      }`}
    >
      {elements.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] text-center">
          <div className="w-16 h-16 rounded-full glass flex items-center justify-center mb-4">
            <span className="text-2xl font-light">+</span>
          </div>
          <p className="font-medium text-[var(--text-primary)]">Drag & drop elements here</p>
          <p className="text-sm opacity-60 mt-1">Build your premium form instantly.</p>
        </div>
      ) : (
        <SortableContext items={elements.map(e => e.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col">
            {elements.map((el) => (
              <SortableFormItem key={el.id} element={el} onDelete={onDelete} onUpdate={onUpdate} />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  );
}
