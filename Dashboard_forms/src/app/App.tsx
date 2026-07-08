import React, { useState, useCallback, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ElementsSidebar } from "./components/ElementsSidebar";
import { FormCanvas } from "./components/FormCanvas";
import { PropertiesPanel } from "./components/PropertiesPanel";
import { FormPreview } from "./components/FormPreview";
import { FormElement, SidebarElement } from "./types/form-builder";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Switch } from "./components/ui/switch";
import {
  Save,
  Eye,
  Download,
  Trash2,
  Settings,
  Home,
  CalendarDays,
  Clock3,
  ShieldOff,
  Shuffle,
  EyeOff,
  Mail,
  ImageOff,
  Link,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";

const STORAGE_KEY = "form-builder-draft";

function App() {
  const [elements, setElements] = useState<FormElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null,
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [formTitle, setFormTitle] = useState("Untitled form");
  const [settings, setSettings] = useState({
    acceptResponses: true,
    startDate: "",
    endDate: "",
    timeDuration: "",
    disableScreenshot: false,
    shuffleQuestions: false,
    hideSubmitAnother: false,
    allowSaveResponses: false,
    emailNotifications: false,
  });

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(STORAGE_KEY);
      if (savedDraft) {
        const parsedDraft = JSON.parse(savedDraft);
        setElements(parsedDraft);
        toast.success("Draft loaded from previous session");
      }
    } catch (error) {
      console.error("Failed to load draft:", error);
    }
  }, []);

  // Auto-save to localStorage whenever elements change
  useEffect(() => {
    if (elements.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(elements));
        setLastSaved(new Date());
      } catch (error) {
        console.error("Failed to save draft:", error);
        toast.error("Failed to auto-save draft");
      }
    }
  }, [elements]);

  const generateId = () => {
    return `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const createElementFromSidebar = (
    sidebarElement: SidebarElement,
  ): FormElement => {
    const baseElement: FormElement = {
      id: generateId(),
      type: sidebarElement.type,
      label: sidebarElement.label,
      enabled: true,
      score: 1,
      required: false,
    };

    // Add default options for choice fields
    if (
      ["select", "radio", "checkboxGroup", "likert"].includes(
        sidebarElement.type,
      )
    ) {
      baseElement.options = [
        { label: "Option 1", value: "option-1" },
        { label: "Option 2", value: "option-2" },
        { label: "Option 3", value: "option-3" },
      ];
    }

    // Set default single option for RadioMp3
    if (sidebarElement.type === "radioMp3") {
      baseElement.options = [{ label: "", value: "option-1" }];
    }

    // Set default content for content elements
    if (sidebarElement.type === "heading") {
      baseElement.content = "Heading";
    }

    if (sidebarElement.type === "rating") {
      baseElement.symbol = "star";
      baseElement.levels = 5;
    }

    return baseElement;
  };

  const handleDropElement = useCallback(
    (sidebarElement: SidebarElement, index?: number) => {
      const newElement = createElementFromSidebar(sidebarElement);
      setElements((prev) => {
        if (index !== undefined && index >= 0 && index <= prev.length) {
          // Insert at specific position
          const newElements = [...prev];
          newElements.splice(index, 0, newElement);
          return newElements;
        }
        // Default: add to end
        return [...prev, newElement];
      });
      setSelectedElementId(newElement.id);
      toast.success("Element added to form");
    },
    [],
  );

  const handleMoveElement = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      setElements((prevElements) => {
        const newElements = [...prevElements];
        const [removed] = newElements.splice(dragIndex, 1);
        newElements.splice(hoverIndex, 0, removed);
        return newElements;
      });
    },
    [],
  );

  const handleSelectElement = (id: string) => {
    setSelectedElementId(id);
  };

  const handleUpdateElement = (updates: Partial<FormElement>) => {
    if (!selectedElementId) return;

    setElements(
      elements.map((el) =>
        el.id === selectedElementId ? { ...el, ...updates } : el,
      ),
    );
  };

  const handleDeleteElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
    toast.success("Element deleted");
  };

  const handleDuplicateElement = (id: string) => {
    const elementToDuplicate = elements.find((el) => el.id === id);
    if (!elementToDuplicate) return;

    const duplicatedElement: FormElement = {
      ...elementToDuplicate,
      id: generateId(),
      label: `${elementToDuplicate.label} (Copy)`,
    };

    const index = elements.findIndex((el) => el.id === id);
    const newElements = [...elements];
    newElements.splice(index + 1, 0, duplicatedElement);
    setElements(newElements);
    setSelectedElementId(duplicatedElement.id);
    toast.success("Element duplicated");
  };

  const handleSave = () => {
    const formData = {
      elements,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("formBuilder", JSON.stringify(formData));
    toast.success("Form saved successfully!");
  };

  const handleExport = () => {
    const formData = {
      elements,
      createdAt: new Date().toISOString(),
    };
    const dataStr = JSON.stringify(formData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `form-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Form exported successfully!");
  };

  const handleClearAll = () => {
    if (elements.length === 0) return;

    if (
      confirm(
        "Are you sure you want to clear all elements? This action cannot be undone.",
      )
    ) {
      setElements([]);
      setSelectedElementId(null);
      localStorage.removeItem(STORAGE_KEY);
      toast.success("All elements cleared");
    }
  };

  const handleCopyLink = () => {
    const formLink = window.location.href;
    navigator.clipboard
      .writeText(formLink)
      .then(() => {
        toast.success("Form link copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy link");
      });
  };

  const handleAddMember = () => {
    toast.info("Add a Member Field element to the form to manage participants");
  };

  const handlePreview = () => {
    if (elements.length === 0) {
      toast.error("Add some elements to preview the form");
      return;
    }
    setIsPreviewOpen(true);
  };

  const selectedElement =
    elements.find((el) => el.id === selectedElementId) || null;

  const updateSetting = <K extends keyof typeof settings>(
    key: K,
    value: (typeof settings)[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col bg-gray-100">
        {/* Header */}
        <header className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a
                href="#"
                title="Go to home"
                aria-label="Go to home"
                className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-2 text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-500">
                <Home className="h-5 w-5" />
              </a>
              <div>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Untitled form"
                  className="h-10 w-64 border-transparent bg-transparent px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
                />
                <p className="text-sm text-gray-500">
                  Create custom forms with drag and drop
                </p>
              </div>
              {elements.length > 0 && (
                <Badge variant="secondary" className="px-3 py-1">
                  {elements.length}{" "}
                  {elements.length === 1 ? "element" : "elements"}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              {lastSaved && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Auto-saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSettingsOpen(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                <Link className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button variant="outline" size="sm" onClick={handleAddMember}>
                <Users className="w-4 h-4 mr-2" />
                Add Member
              </Button>
              <Button variant="outline" size="sm" onClick={handlePreview}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                disabled={elements.length === 0}
                className="text-red-500 hover:text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          <ElementsSidebar />
          <FormCanvas
            elements={elements}
            selectedElementId={selectedElementId}
            formTitle={formTitle}
            onFormTitleChange={setFormTitle}
            onSelectElement={handleSelectElement}
            onDeleteElement={handleDeleteElement}
            onDuplicateElement={handleDuplicateElement}
            onDropElement={handleDropElement}
            onMoveElement={handleMoveElement}
          />
          <PropertiesPanel
            element={selectedElement}
            onUpdateElement={handleUpdateElement}
          />
        </div>
      </div>
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm">
          <div className="absolute right-0 top-0 h-full w-[360px] border-l border-gray-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Settings</h2>
                <p className="text-sm text-gray-500">
                  Tune form behavior and response rules
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSettingsOpen(false)}>
                Close
              </Button>
            </div>

            <div className="mt-6 space-y-5">
              <div className="flex items-center justify-between rounded-xl border border-gray-200 p-3">
                <div>
                  <Label className="text-sm font-medium">
                    Accept responses
                  </Label>
                  <p className="text-xs text-gray-500">
                    Open this form for submissions
                  </p>
                </div>
                <Switch
                  checked={settings.acceptResponses}
                  onCheckedChange={(value) =>
                    updateSetting("acceptResponses", value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Start date</Label>
                <Input
                  type="date"
                  value={settings.startDate}
                  onChange={(e) => updateSetting("startDate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>End date</Label>
                <Input
                  type="date"
                  value={settings.endDate}
                  onChange={(e) => updateSetting("endDate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Set time duration</Label>
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
                  <Clock3 className="h-4 w-4 text-gray-400" />
                  <Input
                    value={settings.timeDuration}
                    onChange={(e) =>
                      updateSetting("timeDuration", e.target.value)
                    }
                    placeholder="e.g. 30 mins"
                    className="border-0 px-0 shadow-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-gray-200 p-3">
                <div className="flex items-center gap-2">
                  <ImageOff className="h-4 w-4 text-gray-500" />
                  <Label className="text-sm font-medium">
                    Disable Screenshot
                  </Label>
                </div>
                <Switch
                  checked={settings.disableScreenshot}
                  onCheckedChange={(value) =>
                    updateSetting("disableScreenshot", value)
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-gray-200 p-3">
                <div className="flex items-center gap-2">
                  <Shuffle className="h-4 w-4 text-gray-500" />
                  <Label className="text-sm font-medium">
                    Shuffle questions
                  </Label>
                </div>
                <Switch
                  checked={settings.shuffleQuestions}
                  onCheckedChange={(value) =>
                    updateSetting("shuffleQuestions", value)
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-gray-200 p-3">
                <div className="flex items-center gap-2">
                  <EyeOff className="h-4 w-4 text-gray-500" />
                  <Label className="text-sm font-medium">
                    Hide “Submit another response”
                  </Label>
                </div>
                <Switch
                  checked={settings.hideSubmitAnother}
                  onCheckedChange={(value) =>
                    updateSetting("hideSubmitAnother", value)
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-gray-200 p-3">
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4 text-gray-500" />
                  <Label className="text-sm font-medium">
                    Allow respondents to save their responses
                  </Label>
                </div>
                <Switch
                  checked={settings.allowSaveResponses}
                  onCheckedChange={(value) =>
                    updateSetting("allowSaveResponses", value)
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-gray-200 p-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <Label className="text-sm font-medium">
                    Get email notification of each response
                  </Label>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(value) =>
                    updateSetting("emailNotifications", value)
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <FormPreview
        elements={elements}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
      <Toaster />
    </DndProvider>
  );
}

export default App;
