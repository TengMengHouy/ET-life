export type FormElementType =
  | "text"
  | "email"
  | "number"
  | "tel"
  | "url"
  | "password"
  | "textarea"
  | "select"
  | "radio"
  | "radioMp3"
  | "checkboxGroup"
  | "rating"
  | "likert"
  | "file"
  | "date"
  | "time"
  | "datetime"
  | "switch"
  | "color"
  | "heading"
  | "divider";

export interface FormElementOption {
  label: string;
  value: string;
  audioUrl?: string;
  audioFileName?: string;
}

export interface FormElementStyles {
  width?: string;
  backgroundColor?: string;
  color?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  padding?: string;
  margin?: string;
}

export interface FormElement {
  id: string;
  type: FormElementType;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  enabled?: boolean;
  score?: number;
  errorMessage?: string;
  options?: FormElementOption[]; // for select, radio, checkboxGroup
  min?: number | string;
  max?: number | string;
  step?: number;
  pattern?: string;
  accept?: string; // for file input
  rows?: number; // for textarea
  content?: string; // for heading, paragraph
  styles?: FormElementStyles;
  audioUrl?: string; // for audio-enabled form elements
  audioFileName?: string;
  symbol?: "star" | "heart" | "number" | "tick";
  levels?: number;
}

export interface FormBuilderState {
  elements: FormElement[];
  selectedElementId: string | null;
}

export interface SidebarElement {
  type: FormElementType;
  icon: string;
  label: string;
  category: "input" | "choice" | "content";
}
