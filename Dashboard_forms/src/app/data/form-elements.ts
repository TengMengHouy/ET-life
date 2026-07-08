import { SidebarElement } from "../types/form-builder";

export const formElementsData: SidebarElement[] = [
  // Input Fields
  {
    type: "text",
    icon: "Type",
    label: "Text Input",
    category: "input",
  },
  {
    type: "email",
    icon: "Mail",
    label: "Email Input",
    category: "input",
  },
  {
    type: "number",
    icon: "Hash",
    label: "Number Input",
    category: "input",
  },
  {
    type: "tel",
    icon: "Phone",
    label: "Phone Input",
    category: "input",
  },
  {
    type: "url",
    icon: "Link",
    label: "URL Input",
    category: "input",
  },
  {
    type: "password",
    icon: "Lock",
    label: "Password Input",
    category: "input",
  },
  {
    type: "textarea",
    icon: "AlignLeft",
    label: "Textarea",
    category: "input",
  },
  {
    type: "date",
    icon: "Calendar",
    label: "Date Picker",
    category: "input",
  },
  {
    type: "time",
    icon: "Clock",
    label: "Time Picker",
    category: "input",
  },
  {
    type: "datetime",
    icon: "CalendarClock",
    label: "DateTime Picker",
    category: "input",
  },
  {
    type: "file",
    icon: "Upload",
    label: "File Upload",
    category: "input",
  },
  {
    type: "color",
    icon: "Palette",
    label: "Color Picker",
    category: "input",
  },

  // Choice Fields
  {
    type: "select",
    icon: "ChevronDown",
    label: "Select Dropdown",
    category: "choice",
  },
  {
    type: "radio",
    icon: "Circle",
    label: "Radio Choice",
    category: "choice",
  },
  {
    type: "radioMp3",
    icon: "Music4",
    label: "Radio MP3",
    category: "choice",
  },
  {
    type: "checkboxGroup",
    icon: "ListChecks",
    label: "Checkbox Group",
    category: "choice",
  },
  {
    type: "rating",
    icon: "Star",
    label: "Rating Input",
    category: "choice",
  },
  {
    type: "likert",
    icon: "Rows3",
    label: "Likert",
    category: "choice",
  },
  // Content Elements
  {
    type: "heading",
    icon: "Heading",
    label: "Heading",
    category: "content",
  },
  {
    type: "divider",
    icon: "Minus",
    label: "Divider",
    category: "content",
  },
];
