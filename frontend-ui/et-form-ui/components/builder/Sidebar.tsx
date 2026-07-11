'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Type, CheckSquare, ChevronDown, Circle, Calendar, UploadCloud, Image as ImageIcon, FileText, Link as LinkIcon } from 'lucide-react';
import { ElementType } from '@/lib/types';

const SIDEBAR_ELEMENTS: { type: ElementType; label: string; icon: React.ElementType }[] = [
  { type: 'Text', label: 'Text Input', icon: Type },
  { type: 'Checkbox', label: 'Checkbox', icon: CheckSquare },
  { type: 'Dropdown', label: 'Dropdown', icon: ChevronDown },
  { type: 'Radio', label: 'Radio Button', icon: Circle },
  { type: 'Date', label: 'Date Picker', icon: Calendar },
  { type: 'FileUpload', label: 'File Upload', icon: UploadCloud },
  { type: 'Image', label: 'Image', icon: ImageIcon },
  { type: 'Document', label: 'Document (PDF)', icon: FileText },
  { type: 'Link', label: 'Link', icon: LinkIcon },
];

function DraggableSidebarItem({ type, label, icon: Icon }: typeof SIDEBAR_ELEMENTS[0]) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `sidebar-${type}`,
    data: { type },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-grab transition-colors duration-200 border border-transparent ${
        isDragging ? 'opacity-50 glass' : 'hover:bg-[rgba(255,255,255,0.05)]'
      }`}
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-card)' }}>
        <Icon size={16} style={{ color: 'var(--accent-purple)' }} />
      </div>
      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
    </div>
  );
}

export function Sidebar() {
  return (
    <>
      {SIDEBAR_ELEMENTS.map((el) => (
        <DraggableSidebarItem key={el.type} {...el} />
      ))}
    </>
  );
}
