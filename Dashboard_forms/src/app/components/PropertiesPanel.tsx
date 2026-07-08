import React from "react";
import { FormElement, FormElementOption } from "../types/form-builder";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Plus, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { ScrollArea } from "./ui/scroll-area";

interface PropertiesPanelProps {
  element: FormElement | null;
  onUpdateElement: (updates: Partial<FormElement>) => void;
}

export function PropertiesPanel({
  element,
  onUpdateElement,
}: PropertiesPanelProps) {
  if (!element) {
    return (
      <div className="w-80 bg-gray-50 border-l border-gray-200 flex items-center justify-center">
        <p className="text-gray-400 text-center px-4">
          Select an element to edit its properties
        </p>
      </div>
    );
  }

  const hasOptions = ["select", "radio", "checkboxGroup"].includes(
    element.type,
  );
  const isContentElement = ["heading"].includes(element.type);
  const isCheckbox = element.type === "checkbox";
  const isAudioElement = element.type === "radioMp3";

  const handleAddOption = () => {
    const newOption: FormElementOption = {
      label: `Option ${(element.options?.length || 0) + 1}`,
      value: `option-${(element.options?.length || 0) + 1}`,
    };
    onUpdateElement({
      options: [...(element.options || []), newOption],
    });
  };

  const handleUpdateOption = (
    index: number,
    field: "label" | "value",
    value: string,
  ) => {
    const updatedOptions = [...(element.options || [])];
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: value,
    };
    onUpdateElement({ options: updatedOptions });
  };

  const handleDeleteOption = (index: number) => {
    const updatedOptions = element.options?.filter((_, i) => i !== index) || [];
    onUpdateElement({ options: updatedOptions });
  };

  const handleOptionAudioUpload = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        const updatedOptions = [...(element.options || [])];
        updatedOptions[index] = {
          ...updatedOptions[index],
          audioUrl: result,
          audioFileName: file.name,
        };
        onUpdateElement({ options: updatedOptions });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        onUpdateElement({
          audioUrl: result,
          audioFileName: file.name,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
        <h2>Properties</h2>
        <p className="text-sm text-gray-500 mt-1">
          {element.type.charAt(0).toUpperCase() + element.type.slice(1)} Field
        </p>
      </div>

      <ScrollArea className="flex-1 h-full">
        <div className="p-4 space-y-6 pb-8">
          <Accordion
            type="multiple"
            defaultValue={["basic", "options", "validation", "styling"]}>
            {/* Basic Properties */}
            <AccordionItem value="basic">
              <AccordionTrigger>Basic Properties</AccordionTrigger>
              <AccordionContent className="space-y-4">
                {!isContentElement && (
                  <div className="space-y-2">
                    <Label htmlFor="label">Label</Label>
                    <Input
                      id="label"
                      value={element.label}
                      onChange={(e) =>
                        onUpdateElement({ label: e.target.value })
                      }
                      placeholder="Enter label"
                    />
                  </div>
                )}

                {isContentElement && (
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={element.content || ""}
                      onChange={(e) =>
                        onUpdateElement({ content: e.target.value })
                      }
                      placeholder="Enter content"
                      rows={3}
                    />
                  </div>
                )}

                {!isContentElement &&
                  element.type !== "checkbox" &&
                  element.type !== "divider" && (
                    <div className="space-y-2">
                      <Label htmlFor="placeholder">Placeholder</Label>
                      <Input
                        id="placeholder"
                        value={element.placeholder || ""}
                        onChange={(e) =>
                          onUpdateElement({ placeholder: e.target.value })
                        }
                        placeholder="Enter placeholder"
                      />
                    </div>
                  )}

                {element.type === "rating" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="symbol">Rating Symbol</Label>
                      <Select
                        value={element.symbol || "star"}
                        onValueChange={(symbol) =>
                          onUpdateElement({ symbol: symbol as any })
                        }>
                        <SelectTrigger id="symbol">
                          <SelectValue placeholder="Select a rating symbol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="star">Star</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="heart">Heart</SelectItem>
                          <SelectItem value="tick">Tick</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="levels">Levels</Label>
                      <Input
                        id="levels"
                        type="number"
                        min={2}
                        max={10}
                        value={element.levels || 5}
                        onChange={(e) =>
                          onUpdateElement({ levels: Number(e.target.value) })
                        }
                        placeholder="5"
                      />
                    </div>
                  </>
                )}

                {!isContentElement && element.type !== "divider" && (
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={element.description || ""}
                      onChange={(e) =>
                        onUpdateElement({ description: e.target.value })
                      }
                      placeholder="Add helpful description"
                      rows={2}
                    />
                  </div>
                )}

                {isCheckbox && (
                  <div className="flex items-center justify-between">
                    <Label htmlFor="checked">Default Checked</Label>
                    <Switch
                      id="checked"
                      checked={element.checked || false}
                      onCheckedChange={(checked) =>
                        onUpdateElement({ checked })
                      }
                    />
                  </div>
                )}

                {isAudioElement && (
                  <div className="space-y-2">
                    <Label htmlFor="audioFile">MP3 Audio</Label>
                    <Input
                      id="audioFile"
                      type="file"
                      accept="audio/mpeg,audio/mp3"
                      onChange={handleAudioUpload}
                    />
                    {element.audioFileName && (
                      <p className="text-sm text-gray-500">
                        Attached file: {element.audioFileName}
                      </p>
                    )}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Options - for select, radio, checkboxGroup */}
            {hasOptions && (
              <AccordionItem value="options">
                <AccordionTrigger>Options</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  {element.options?.map((option, index) => (
                    <div
                      key={index}
                      className="p-3 border border-gray-200 rounded-lg space-y-2 bg-white">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Option {index + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteOption(index)}
                          className="h-6 w-6">
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <Input
                        value={option.label}
                        onChange={(e) =>
                          handleUpdateOption(index, "label", e.target.value)
                        }
                        placeholder="Label"
                      />
                      <Input
                        value={option.value}
                        onChange={(e) =>
                          handleUpdateOption(index, "value", e.target.value)
                        }
                        placeholder="Value"
                      />
                      {element.type === "radioMp3" && (
                        <div className="space-y-2">
                          <Label htmlFor={`option-audio-${index}`}>
                            MP3 Audio
                          </Label>
                          <Input
                            id={`option-audio-${index}`}
                            type="file"
                            accept="audio/mpeg,audio/mp3"
                            onChange={(e) => handleOptionAudioUpload(index, e)}
                          />
                          {option.audioFileName && (
                            <p className="text-xs text-gray-500">
                              Attached: {option.audioFileName}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  <Button
                    onClick={handleAddOption}
                    className="w-full"
                    variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </Button>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Validation */}
            {!isContentElement && element.type !== "divider" && (
              <AccordionItem value="validation">
                <AccordionTrigger>Validation</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="required">Required Field</Label>
                    <Switch
                      id="required"
                      checked={element.required || false}
                      onCheckedChange={(required) =>
                        onUpdateElement({ required })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="errorMessage">Error Message</Label>
                    <Input
                      id="errorMessage"
                      value={element.errorMessage || ""}
                      onChange={(e) =>
                        onUpdateElement({ errorMessage: e.target.value })
                      }
                      placeholder="This field is required"
                    />
                  </div>

                  {element.type === "number" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="min">Minimum Value</Label>
                        <Input
                          id="min"
                          type="number"
                          value={element.min || ""}
                          onChange={(e) =>
                            onUpdateElement({ min: e.target.value })
                          }
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max">Maximum Value</Label>
                        <Input
                          id="max"
                          type="number"
                          value={element.max || ""}
                          onChange={(e) =>
                            onUpdateElement({ max: e.target.value })
                          }
                          placeholder="100"
                        />
                      </div>
                    </>
                  )}

                  {(element.type === "date" || element.type === "datetime") && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="min">Minimum Date</Label>
                        <Input
                          id="min"
                          type="date"
                          value={(element.min as string) || ""}
                          onChange={(e) =>
                            onUpdateElement({ min: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max">Maximum Date</Label>
                        <Input
                          id="max"
                          type="date"
                          value={(element.max as string) || ""}
                          onChange={(e) =>
                            onUpdateElement({ max: e.target.value })
                          }
                        />
                      </div>
                    </>
                  )}

                  {element.type === "text" && (
                    <div className="space-y-2">
                      <Label htmlFor="pattern">Pattern (Regex)</Label>
                      <Input
                        id="pattern"
                        value={element.pattern || ""}
                        onChange={(e) =>
                          onUpdateElement({ pattern: e.target.value })
                        }
                        placeholder="[A-Za-z]+"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Label htmlFor="enabled">Answers enabled</Label>
                    <Switch
                      id="enabled"
                      checked={element.enabled !== false}
                      onCheckedChange={(enabled) =>
                        onUpdateElement({ enabled: Boolean(enabled) })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="score">Points per answer</Label>
                    <Input
                      id="score"
                      type="number"
                      min={0}
                      value={element.score ?? 1}
                      onChange={(e) =>
                        onUpdateElement({ score: Number(e.target.value) })
                      }
                      placeholder="1"
                    />
                  </div>

                  {element.type === "file" && (
                    <div className="space-y-2">
                      <Label htmlFor="accept">Accepted File Types</Label>
                      <Input
                        id="accept"
                        value={element.accept || ""}
                        onChange={(e) =>
                          onUpdateElement({ accept: e.target.value })
                        }
                        placeholder="image/*,.pdf"
                      />
                    </div>
                  )}

                  {element.type === "textarea" && (
                    <div className="space-y-2">
                      <Label htmlFor="rows">Rows</Label>
                      <Input
                        id="rows"
                        type="number"
                        value={element.rows || 4}
                        onChange={(e) =>
                          onUpdateElement({ rows: parseInt(e.target.value) })
                        }
                        placeholder="4"
                      />
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Styling */}
            <AccordionItem value="styling">
              <AccordionTrigger>Styling</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="width">Width</Label>
                  <Input
                    id="width"
                    value={element.styles?.width || ""}
                    onChange={(e) =>
                      onUpdateElement({
                        styles: { ...element.styles, width: e.target.value },
                      })
                    }
                    placeholder="100%, 300px, auto"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backgroundColor">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={element.styles?.backgroundColor || "#ffffff"}
                      onChange={(e) =>
                        onUpdateElement({
                          styles: {
                            ...element.styles,
                            backgroundColor: e.target.value,
                          },
                        })
                      }
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={element.styles?.backgroundColor || ""}
                      onChange={(e) =>
                        onUpdateElement({
                          styles: {
                            ...element.styles,
                            backgroundColor: e.target.value,
                          },
                        })
                      }
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="textColor">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="textColor"
                      type="color"
                      value={element.styles?.textColor || "#000000"}
                      onChange={(e) =>
                        onUpdateElement({
                          styles: {
                            ...element.styles,
                            textColor: e.target.value,
                          },
                        })
                      }
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={element.styles?.textColor || ""}
                      onChange={(e) =>
                        onUpdateElement({
                          styles: {
                            ...element.styles,
                            textColor: e.target.value,
                          },
                        })
                      }
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="borderColor">Border Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="borderColor"
                      type="color"
                      value={element.styles?.borderColor || "#d1d5db"}
                      onChange={(e) =>
                        onUpdateElement({
                          styles: {
                            ...element.styles,
                            borderColor: e.target.value,
                          },
                        })
                      }
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={element.styles?.borderColor || ""}
                      onChange={(e) =>
                        onUpdateElement({
                          styles: {
                            ...element.styles,
                            borderColor: e.target.value,
                          },
                        })
                      }
                      placeholder="#d1d5db"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="borderWidth">Border Width</Label>
                  <Input
                    id="borderWidth"
                    value={element.styles?.borderWidth || ""}
                    onChange={(e) =>
                      onUpdateElement({
                        styles: {
                          ...element.styles,
                          borderWidth: e.target.value,
                        },
                      })
                    }
                    placeholder="1px, 2px"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="borderRadius">Border Radius</Label>
                  <Input
                    id="borderRadius"
                    value={element.styles?.borderRadius || ""}
                    onChange={(e) =>
                      onUpdateElement({
                        styles: {
                          ...element.styles,
                          borderRadius: e.target.value,
                        },
                      })
                    }
                    placeholder="4px, 8px, 50%"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="padding">Padding</Label>
                  <Input
                    id="padding"
                    value={element.styles?.padding || ""}
                    onChange={(e) =>
                      onUpdateElement({
                        styles: { ...element.styles, padding: e.target.value },
                      })
                    }
                    placeholder="8px, 16px 8px"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="margin">Margin</Label>
                  <Input
                    id="margin"
                    value={element.styles?.margin || ""}
                    onChange={(e) =>
                      onUpdateElement({
                        styles: { ...element.styles, margin: e.target.value },
                      })
                    }
                    placeholder="8px, 16px 8px"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
}
