import React, { useRef } from "react";
import { useDrop, useDrag } from "react-dnd";
import { FormElement, SidebarElement } from "../types/form-builder";
import { FormFieldRenderer } from "./FormFieldRenderer";
import { GripVertical, Trash2, Copy, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface FormCanvasProps {
  elements: FormElement[];
  selectedElementId: string | null;
  formTitle: string;
  onFormTitleChange: (value: string) => void;
  onSelectElement: (id: string) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onDropElement: (element: SidebarElement, index?: number) => void;
  onMoveElement: (dragIndex: number, hoverIndex: number) => void;
}

interface SortableFormElementProps {
  element: FormElement;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveElement: (dragIndex: number, hoverIndex: number) => void;
  onDropElement: (element: SidebarElement, index: number) => void;
}

function SortableFormElement({
  element,
  index,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onMoveElement,
  onDropElement,
}: SortableFormElementProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "CANVAS_ELEMENT",
      item: { id: element.id, index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [element.id, index],
  );

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ["CANVAS_ELEMENT", "FORM_ELEMENT"],
      hover: (
        item: { id?: string; index?: number; type?: string } & SidebarElement,
        monitor,
      ) => {
        if (!ref.current) {
          return;
        }

        const dragType = monitor.getItemType();

        // If dragging from canvas (reordering)
        if (dragType === "CANVAS_ELEMENT" && item.index !== undefined) {
          const dragIndex = item.index;
          const hoverIndex = index;

          if (dragIndex === hoverIndex) {
            return;
          }

          const hoverBoundingRect = ref.current.getBoundingClientRect();
          const hoverMiddleY =
            (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
          const clientOffset = monitor.getClientOffset();
          const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

          if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
            return;
          }

          if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
            return;
          }

          onMoveElement(dragIndex, hoverIndex);
          item.index = hoverIndex;
        }
      },
      drop: (item: SidebarElement, monitor) => {
        const didDrop = monitor.didDrop();
        if (didDrop) {
          return;
        }

        const dragType = monitor.getItemType();

        // If dropping from sidebar
        if (dragType === "FORM_ELEMENT") {
          const hoverBoundingRect = ref.current!.getBoundingClientRect();
          const clientOffset = monitor.getClientOffset();
          const hoverClientY = clientOffset!.y - hoverBoundingRect.top;
          const hoverMiddleY =
            (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

          // Insert before or after based on drop position
          const insertIndex = hoverClientY < hoverMiddleY ? index : index + 1;
          onDropElement(item, insertIndex);
        }
      },
      collect: (monitor) => ({
        isOver:
          monitor.isOver({ shallow: true }) &&
          monitor.getItemType() === "FORM_ELEMENT",
      }),
    }),
    [index, onMoveElement, onDropElement],
  );

  drag(drop(ref));

  return (
    <div className="relative">
      {isOver && (
        <div className="absolute inset-x-0 -top-2 h-1 bg-blue-500 rounded-full z-10 shadow-lg animate-pulse">
          <div className="absolute inset-0 bg-blue-400 blur-sm rounded-full" />
        </div>
      )}
      <div
        ref={ref}
        className={`relative group transition-all duration-200 ${isDragging ? "opacity-50 scale-95" : ""}`}>
        <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded">
            <GripVertical className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div className="absolute -right-24 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={onDuplicate}
            className="h-8 w-8">
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8 text-red-500 hover:text-red-600">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <FormFieldRenderer
          element={element}
          isSelected={isSelected}
          onClick={onSelect}
        />
      </div>
    </div>
  );
}

export function FormCanvas({
  elements,
  selectedElementId,
  formTitle,
  onFormTitleChange,
  onSelectElement,
  onDeleteElement,
  onDuplicateElement,
  onDropElement,
  onMoveElement,
}: FormCanvasProps) {
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "FORM_ELEMENT",
      drop: (item: SidebarElement, monitor) => {
        const didDrop = monitor.didDrop();
        if (didDrop) {
          return;
        }
        // If dropped on empty canvas, add to end
        onDropElement(item);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
      }),
    }),
    [onDropElement],
  );

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-8">
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                value={formTitle}
                onChange={(e) => onFormTitleChange(e.target.value)}
                placeholder="Form Design"
                className="h-10 text-lg font-semibold"
              />
              <p className="mt-1 text-sm text-gray-500">
                Drag and drop elements from the left sidebar to build your form
              </p>
            </div>
          </div>
        </div>

        <div
          ref={drop}
          className={`min-h-[600px] border-2 border-dashed rounded-xl p-6 space-y-4 transition-all duration-300 ${
            isOver
              ? "border-blue-500 bg-blue-50 shadow-lg scale-[1.01]"
              : "border-gray-300 bg-white shadow-sm"
          }`}>
          {elements.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[500px] text-gray-400">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <GripVertical className="w-8 h-8 text-gray-300" />
                </div>
                <div>
                  <p className="text-lg">
                    Drop form elements here to start building
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Drag elements from the sidebar to create your form
                  </p>
                </div>
              </div>
            </div>
          ) : (
            elements.map((element, index) => (
              <SortableFormElement
                key={element.id}
                element={element}
                index={index}
                isSelected={selectedElementId === element.id}
                onSelect={() => onSelectElement(element.id)}
                onDelete={() => onDeleteElement(element.id)}
                onDuplicate={() => onDuplicateElement(element.id)}
                onMoveElement={onMoveElement}
                onDropElement={onDropElement}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
