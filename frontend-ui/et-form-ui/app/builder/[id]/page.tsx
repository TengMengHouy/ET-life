'use client';

import React, { useState, useEffect, use } from 'react';
import { Sidebar } from '@/components/builder/Sidebar';
import { Canvas } from '@/components/builder/Canvas';
import { DndContext, closestCenter, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getFormById, updateFormInStorage, FormField, FormElement, ElementType } from '@/lib/types';

// Map dashboard field types to builder ElementTypes
function dashboardTypeToElementType(type: string): ElementType {
  const map: Record<string, ElementType> = {
    'text': 'Text',
    'email': 'Text',
    'number': 'Text',
    'url': 'Link',
    'paragraph': 'Text',
    'select': 'Dropdown',
    'radio': 'Radio',
    'radio_play': 'Radio',
    'checkbox': 'Checkbox',
    'date': 'Date',
    'time': 'Date',
    'file': 'FileUpload',
    'rating': 'Text',
    'likert': 'Radio',
    'section': 'Text',
  };
  return map[type] || 'Text';
}

// Map builder ElementTypes back to dashboard field types
function elementTypeToDashboardType(type: ElementType): string {
  const map: Record<ElementType, string> = {
    'Text': 'text',
    'Checkbox': 'checkbox',
    'Dropdown': 'select',
    'Radio': 'radio',
    'Date': 'date',
    'FileUpload': 'file',
    'Image': 'file',
    'Document': 'file',
    'Link': 'url',
  };
  return map[type] || 'text';
}

export default function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [formName, setFormName] = useState('Untitled Form');
  const [elements, setElements] = useState<FormElement[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(true);

  // Load form from localStorage on mount
  useEffect(() => {
    const form = getFormById(id);
    if (form) {
      setFormName(form.name);
      // Convert dashboard fields to builder elements
      const converted: FormElement[] = form.fields.map(field => ({
        id: field.id,
        type: dashboardTypeToElementType(field.type),
        label: field.label,
        options: field.options,
        required: field.required,
      }));
      setElements(converted);
    }
  }, [id]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over) return;

    const isOverCanvasArea = over.id === 'canvas-area';
    const isOverElement = elements.some((el) => el.id === over.id);

    // Handle reordering within canvas
    if (active.id !== over.id && !active.id.toString().startsWith('sidebar-') && isOverElement) {
      setElements((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setIsSaved(false);
      return;
    }

    // Handle dropping from sidebar to canvas
    if (active.id.toString().startsWith('sidebar-') && (isOverCanvasArea || isOverElement)) {
      const type = active.id.toString().replace('sidebar-', '') as ElementType;
      const newElement: FormElement = {
        id: `el-${Date.now()}`,
        type,
        label: `New ${type}`,
        options: ['Dropdown', 'Radio', 'Checkbox'].includes(type) ? ['Option 1'] : undefined,
      };

      setElements((items) => {
        if (isOverElement) {
          const insertIndex = items.findIndex((i) => i.id === over.id);
          const newItems = [...items];
          newItems.splice(insertIndex, 0, newElement);
          return newItems;
        }
        return [...items, newElement];
      });
      setIsSaved(false);
    }
  };

  const deleteElement = (id: string) => {
    setElements(items => items.filter(el => el.id !== id));
    setIsSaved(false);
  };

  const updateElement = (elId: string, updates: Partial<FormElement>) => {
    setElements(items => items.map(el => el.id === elId ? { ...el, ...updates } : el));
    setIsSaved(false);
  };

  // Save form back to localStorage
  const handlePublish = () => {
    const fields: FormField[] = elements.map(el => ({
      id: el.id,
      type: elementTypeToDashboardType(el.type),
      label: el.label,
      placeholder: `Enter ${el.label.toLowerCase()}...`,
      required: el.required || false,
      options: el.options,
    }));

    updateFormInStorage(id, {
      name: formName,
      fields,
      lastEdited: 'Edited just now',
    });

    setIsSaved(true);
    router.push('/dashboard');
  };

  return (
    <DndContext 
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-secondary)' }}>
        {/* Top Navbar */}
        <nav className="h-16 glass flex items-center justify-between px-6 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-3 no-underline">
              <Image src="/logo.png" alt="ET-form" width={28} height={28} className="rounded-md" />
            </Link>
            <input
              type="text"
              value={formName}
              onChange={(e) => { setFormName(e.target.value); setIsSaved(false); }}
              className="font-bold text-gradient bg-transparent border-none outline-none text-sm w-64 focus:text-[var(--accent-purple)] transition-colors"
              placeholder="Untitled Form"
            />
            {!isSaved && <span className="text-xs text-[var(--text-muted)] opacity-60">Unsaved</span>}
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href={`/form/${id}`}
              className="text-sm font-medium px-4 py-1.5 rounded-full no-underline transition-all duration-300 border border-[var(--border-glass)] cursor-pointer"
              style={{ color: 'var(--text-primary)' }}
            >
              Preview
            </Link>
            <button 
              onClick={handlePublish}
              className="text-sm font-semibold px-4 py-1.5 rounded-full no-underline transition-all duration-300 border-none cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-purple-dark))',
                color: '#fff',
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)',
              }}>
              Save & Publish
            </button>
          </div>
        </nav>

        {/* Builder Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 glass-strong p-4 flex flex-col gap-2 overflow-y-auto z-10">
            <h3 className="text-sm font-semibold mb-4 text-gradient uppercase tracking-wider">Elements</h3>
            <Sidebar />
          </div>

          {/* Canvas Area */}
          <div className="flex-1 p-8 overflow-y-auto flex justify-center relative">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--border-glass) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <Canvas elements={elements} onDelete={deleteElement} onUpdate={updateElement} />
          </div>
        </div>
      </div>
    </DndContext>
  );
}
