import React from 'react';
import { useDrag } from 'react-dnd';
import * as Icons from 'lucide-react';
import { SidebarElement } from '../types/form-builder';

interface FormElementItemProps {
  element: SidebarElement;
  index: number;
}

export function FormElementItem({ element, index }: FormElementItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'FORM_ELEMENT',
    item: element,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [element]);

  const Icon = Icons[element.icon as keyof typeof Icons] as React.ElementType;

  return (
    <div
      ref={drag}
      className={`flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-white cursor-grab hover:border-blue-400 hover:shadow-md hover:scale-105 transition-all duration-200 ${
        isDragging ? 'opacity-50 rotate-2' : ''
      }`}
    >
      {Icon && <Icon className="w-4 h-4 text-gray-600" />}
      <span className="text-sm text-gray-700">{element.label}</span>
    </div>
  );
}
