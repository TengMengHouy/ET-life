import React, { useState } from "react";
import { FormElement } from "../types/form-builder";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { AudioPlayer } from "./FormFieldRenderer";
import { Separator } from "./ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { X, Star, Heart, Check } from "lucide-react";
import { toast } from "sonner";

interface ScoreSummary {
  totalScore: number;
  maxScore: number;
  answeredCount: number;
  totalQuestions: number;
}

interface FormPreviewProps {
  elements: FormElement[];
  isOpen: boolean;
  onClose: () => void;
}

export function FormPreview({ elements, isOpen, onClose }: FormPreviewProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [scoreSummary, setScoreSummary] = useState<ScoreSummary | null>(null);

  const getValidationError = (
    element: FormElement,
    value: any,
  ): string | null => {
    const enabled = element.enabled !== false;
    if (!enabled) {
      return null;
    }

    const required = element.required;
    const isEmpty =
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim().length === 0) ||
      (Array.isArray(value) && value.length === 0) ||
      (value instanceof FileList && value.length === 0) ||
      (typeof value === "boolean" && value === false);

    if (required && isEmpty) {
      return element.errorMessage?.trim() || "This field is required.";
    }

    if (isEmpty) {
      return null;
    }

    const stringValue =
      typeof value === "string"
        ? value
        : Array.isArray(value)
          ? value.join(",")
          : value instanceof FileList
            ? Array.from(value)
                .map((file) => file.name)
                .join(",")
            : String(value);

    if (element.pattern) {
      try {
        const regex = new RegExp(element.pattern);
        if (!regex.test(stringValue)) {
          return (
            element.errorMessage?.trim() ||
            "Value does not match the required format."
          );
        }
      } catch {
        // ignore invalid regex patterns
      }
    }

    switch (element.type) {
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)) {
          return element.errorMessage?.trim() || "Enter a valid email address.";
        }
        break;
      case "url":
        try {
          new URL(stringValue);
        } catch {
          return element.errorMessage?.trim() || "Enter a valid URL.";
        }
        break;
      case "number": {
        const numberValue = Number(stringValue);
        if (Number.isNaN(numberValue)) {
          return element.errorMessage?.trim() || "Enter a valid number.";
        }
        if (
          element.min !== undefined &&
          element.min !== null &&
          numberValue < Number(element.min)
        ) {
          return (
            element.errorMessage?.trim() ||
            `Number must be at least ${element.min}.`
          );
        }
        if (
          element.max !== undefined &&
          element.max !== null &&
          numberValue > Number(element.max)
        ) {
          return (
            element.errorMessage?.trim() ||
            `Number must be at most ${element.max}.`
          );
        }
        break;
      }
      case "radio":
      case "radioMp3":
        if (required && (value === undefined || value === "")) {
          return element.errorMessage?.trim() || "Please select an option.";
        }
        break;
      case "rating":
        if (required && (value === undefined || value === "")) {
          return element.errorMessage?.trim() || "Please select a rating.";
        }
        break;
      case "checkboxGroup":
        if (required && (!Array.isArray(value) || value.length === 0)) {
          return (
            element.errorMessage?.trim() || "Please select at least one option."
          );
        }
        break;
      case "file":
        if (required && (!(value instanceof FileList) || value.length === 0)) {
          return element.errorMessage?.trim() || "Please upload a file.";
        }
        break;
      default:
        break;
    }

    return null;
  };

  const getValidationMessage = (
    element: FormElement,
    value: any,
  ): string | undefined => {
    const error = getValidationError(element, value);
    return error || undefined;
  };

  const isAnswered = (element: FormElement, value: any) => {
    if (element.enabled === false) return false;
    if (value === undefined || value === null) return false;
    if (typeof value === "string") return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (value instanceof FileList) return value.length > 0;
    if (typeof value === "boolean") return value === true;
    return true;
  };

  const calculateScoreSummary = () => {
    let totalScore = 0;
    let maxScore = 0;
    let answeredCount = 0;
    const totalQuestions = elements.filter(
      (element) =>
        element.type !== "heading" &&
        element.type !== "paragraph" &&
        element.type !== "divider",
    ).length;

    elements.forEach((element) => {
      const enabled = element.enabled !== false;
      if (!enabled) {
        return;
      }

      const score = element.score ?? 0;
      const value = formData[element.id];
      const error = getValidationError(element, value);
      const answered = isAnswered(element, value) && !error;

      if (score > 0) {
        maxScore += score;
      }
      if (answered) {
        answeredCount += 1;
        totalScore += score;
      }
    });

    return { totalScore, maxScore, answeredCount, totalQuestions };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    elements.forEach((element) => {
      const value = formData[element.id];
      const error = getValidationError(element, value);
      if (error) {
        errors[element.id] = error;
      }
    });

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the highlighted fields before submitting.");
      return;
    }

    const summary = calculateScoreSummary();
    setScoreSummary(summary);

    toast.success("Form submitted successfully!");
    console.log("Form submitted:", formData);
    console.log("Score summary:", summary);
  };

  const handleReset = () => {
    setFormData({});
    setFieldErrors({});
    setScoreSummary(null);
    toast.info("Form reset");
  };

  const updateFormData = (id: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const renderFormElement = (element: FormElement) => {
    const value = formData[element.id] ?? "";
    const styles = element.styles || {};
    const enabled = element.enabled !== false;
    const disabled = !enabled;
    const required = element.required && enabled;
    const error = fieldErrors[element.id];
    const errorClass = error ? "border-red-500 focus-visible:ring-red-300" : "";

    // Apply custom styles
    const customStyles: React.CSSProperties = {
      ...(styles.color && { color: styles.color }),
      ...(styles.backgroundColor && {
        backgroundColor: styles.backgroundColor,
      }),
      ...(styles.borderColor && { borderColor: styles.borderColor }),
      ...(styles.borderWidth && { borderWidth: `${styles.borderWidth}px` }),
      ...(styles.borderRadius && { borderRadius: `${styles.borderRadius}px` }),
      ...(styles.padding && { padding: `${styles.padding}px` }),
      ...(styles.margin && { margin: `${styles.margin}px` }),
    };

    switch (element.type) {
      case "text":
      case "email":
      case "password":
      case "tel":
      case "url":
      case "number":
        return (
          <div key={element.id} className="space-y-2">
            <Label htmlFor={element.id}>
              {element.label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={element.id}
              type={element.type}
              placeholder={element.placeholder}
              required={required}
              disabled={disabled}
              value={value}
              onChange={(e) => updateFormData(element.id, e.target.value)}
              style={customStyles}
              className={error ? `${errorClass}` : undefined}
            />
            {element.description && (
              <p className="text-sm text-gray-500">
                {disabled ? "Answers disabled by admin" : element.description}
              </p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case "textarea":
        return (
          <div key={element.id} className="space-y-2">
            <Label htmlFor={element.id}>
              {element.label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={element.id}
              placeholder={element.placeholder}
              required={required}
              disabled={disabled}
              value={value}
              onChange={(e) => updateFormData(element.id, e.target.value)}
              style={customStyles}
              className={error ? `${errorClass}` : undefined}
            />
            {element.description && (
              <p className="text-sm text-gray-500">
                {disabled ? "Answers disabled by admin" : element.description}
              </p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case "select":
        return (
          <div key={element.id} className="space-y-2">
            <Label htmlFor={element.id}>
              {element.label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(val) => updateFormData(element.id, val)}
              required={required}
              disabled={disabled}>
              <SelectTrigger
                id={element.id}
                style={customStyles}
                disabled={disabled}
                className={error ? `${errorClass}` : undefined}>
                <SelectValue
                  placeholder={element.placeholder || "Select an option"}
                />
              </SelectTrigger>
              <SelectContent>
                {element.options?.map((option, idx) => (
                  <SelectItem key={idx} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {element.description && (
              <p className="text-sm text-gray-500">
                {disabled ? "Answers disabled by admin" : element.description}
              </p>
            )}
          </div>
        );

      case "radio":
        return (
          <div key={element.id} className="space-y-2">
            <Label>
              {element.label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup
              value={value}
              onValueChange={(val) => updateFormData(element.id, val)}
              required={required}
              disabled={disabled}>
              {element.options?.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option.value}
                    id={`${element.id}-${idx}`}
                    disabled={disabled}
                  />
                  <Label
                    htmlFor={`${element.id}-${idx}`}
                    className="font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {element.description && (
              <p className="text-sm text-gray-500">
                {disabled ? "Answers disabled by admin" : element.description}
              </p>
            )}
          </div>
        );

      case "radioMp3": {
        const getAudioSource = (optionIndex: number) => {
          const option = element.options?.[optionIndex];
          return option?.audioUrl || element.audioUrl;
        };

        return (
          <div key={element.id} className="space-y-4">
            <Label>
              {element.label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup
              value={value}
              onValueChange={(val) => updateFormData(element.id, val)}
              required={required}
              disabled={disabled}>
              {element.options?.map((option, idx) => {
                const audioUrl = getAudioSource(idx);
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
                    {option.label && (
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={option.value}
                          id={`${element.id}-${idx}`}
                          disabled={disabled}
                        />
                        <Label
                          htmlFor={`${element.id}-${idx}`}
                          className="font-normal">
                          {option.label}
                        </Label>
                      </div>
                    )}
                    {!option.label && (
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={option.value}
                          id={`${element.id}-${idx}`}
                          disabled={disabled}
                        />
                      </div>
                    )}
                    {audioUrl ? (
                      <AudioPlayer
                        audioUrl={audioUrl}
                        showLabel={false}
                        description={
                          option.audioFileName
                            ? `Attached: ${option.audioFileName}`
                            : undefined
                        }
                      />
                    ) : (
                      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-3 text-sm text-gray-500">
                        No audio attached yet.
                      </div>
                    )}
                  </div>
                );
              })}
            </RadioGroup>
            {element.description && (
              <p className="text-sm text-gray-500">
                {disabled ? "Answers disabled by admin" : element.description}
              </p>
            )}
          </div>
        );
      }

      case "likert": {
        const currentRatings =
          (formData[element.id] as Record<string, string>) || {};
        const scaleOptions = [1, 2, 3, 4, 5];
        const likertRows =
          element.options && element.options.length > 0
            ? element.options
            : [{ label: "Option 1", value: "option-1" }];

        return (
          <div key={element.id} className="space-y-3">
            <Label>
              {element.label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="grid grid-cols-[minmax(0,1fr)_repeat(5,minmax(2.5rem,1fr))] gap-2 bg-gray-50 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <span className="text-left">Statement</span>
                {scaleOptions.map((scale) => (
                  <span key={scale} className="text-center">
                    {scale}
                  </span>
                ))}
              </div>
              {likertRows.map((option, idx) => (
                <div
                  key={`${option.value}-${idx}`}
                  className="grid grid-cols-[minmax(0,1fr)_repeat(5,minmax(2.5rem,1fr))] gap-2 items-center border-t border-gray-200 px-3 py-3 text-sm text-gray-700">
                  <span className="pr-2">{option.label}</span>
                  {scaleOptions.map((scale) => (
                    <label
                      key={scale}
                      htmlFor={`${element.id}-${option.value}-${scale}`}
                      className="flex items-center justify-center">
                      <input
                        id={`${element.id}-${option.value}-${scale}`}
                        name={`${element.id}-${option.value}`}
                        type="radio"
                        value={String(scale)}
                        checked={currentRatings[option.value] === String(scale)}
                        disabled={disabled}
                        onChange={() =>
                          updateFormData(element.id, {
                            ...currentRatings,
                            [option.value]: String(scale),
                          })
                        }
                        aria-label={`Rate ${option.label} as ${scale}`}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                    </label>
                  ))}
                </div>
              ))}
            </div>
            {element.description && (
              <p className="text-sm text-gray-500">
                {disabled ? "Answers disabled by admin" : element.description}
              </p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
      }

      case "checkboxGroup":
        return (
          <div key={element.id} className="space-y-2">
            <Label>
              {element.label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {element.options?.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${element.id}-${idx}`}
                    checked={value?.includes?.(option.value) || false}
                    disabled={disabled}
                    onCheckedChange={(checked) => {
                      const currentValues = value || [];
                      if (checked) {
                        updateFormData(element.id, [
                          ...currentValues,
                          option.value,
                        ]);
                      } else {
                        updateFormData(
                          element.id,
                          currentValues.filter(
                            (v: string) => v !== option.value,
                          ),
                        );
                      }
                    }}
                  />
                  <Label
                    htmlFor={`${element.id}-${idx}`}
                    className="font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            {element.description && (
              <p className="text-sm text-gray-500">
                {disabled ? "Answers disabled by admin" : element.description}
              </p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case "rating": {
        const ratingValue = formData[element.id] ?? "";
        const symbol = element.symbol || "star";
        const levels = Math.max(2, Math.min(10, element.levels || 5));

        return (
          <div key={element.id} className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Label>
                  {element.label}
                  {required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {element.description && (
                  <p className="text-sm text-gray-500">
                    {disabled
                      ? "Answers disabled by admin"
                      : element.description}
                  </p>
                )}
              </div>
              {element.score !== undefined && (
                <span className="text-sm text-gray-500">
                  {element.score} pts
                </span>
              )}
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(3.5rem,1fr))] gap-3">
              {Array.from({ length: levels }, (_, index) => {
                const valueLabel = String(index + 1);
                const selected = ratingValue === valueLabel;
                return (
                  <label
                    key={valueLabel}
                    htmlFor={`${element.id}-${valueLabel}`}
                    className={`flex flex-col items-center justify-center rounded-2xl border-2 px-3 py-4 text-center transition cursor-pointer ${
                      selected
                        ? "border-primary bg-blue-50"
                        : "border-gray-300 bg-white hover:border-primary"
                    }`}>
                    <input
                      id={`${element.id}-${valueLabel}`}
                      name={element.id}
                      type="radio"
                      value={valueLabel}
                      checked={selected}
                      disabled={disabled}
                      onChange={() => updateFormData(element.id, valueLabel)}
                      className="sr-only"
                    />
                    <span className="flex items-center justify-center h-8 w-8 text-gray-700">
                      {symbol === "number" ? (
                        <span className="text-lg font-bold">{valueLabel}</span>
                      ) : symbol === "star" ? (
                        <Star className="h-6 w-6" />
                      ) : symbol === "heart" ? (
                        <Heart className="h-6 w-6" />
                      ) : symbol === "tick" ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <Star className="h-6 w-6" />
                      )}
                    </span>
                    <span className="mt-2 text-sm font-semibold text-gray-600">
                      {valueLabel}
                    </span>
                  </label>
                );
              })}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
      }

      case "switch":
        return (
          <div key={element.id} className="flex items-center justify-between">
            <Label htmlFor={element.id}>
              {element.label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Switch
              id={element.id}
              checked={value || false}
              disabled={disabled}
              onCheckedChange={(checked) => updateFormData(element.id, checked)}
            />
          </div>
        );

      case "date":
      case "time":
      case "datetime":
      case "color":
        return (
          <div key={element.id} className="space-y-2">
            <Label htmlFor={element.id}>
              {element.label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={element.id}
              type={
                element.type === "datetime" ? "datetime-local" : element.type
              }
              required={required}
              disabled={disabled}
              value={value}
              onChange={(e) => updateFormData(element.id, e.target.value)}
              style={customStyles}
            />
            {element.description && (
              <p className="text-sm text-gray-500">
                {disabled ? "Answers disabled by admin" : element.description}
              </p>
            )}
          </div>
        );

      case "file":
        return (
          <div key={element.id} className="space-y-2">
            <Label htmlFor={element.id}>
              {element.label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={element.id}
              type="file"
              required={required}
              disabled={disabled}
              onChange={(e) => updateFormData(element.id, e.target.files)}
              style={customStyles}
            />
            <p className="text-sm text-gray-500">
              {disabled ? "Answers disabled by admin" : element.description}
            </p>
          </div>
        );

      case "heading":
        return <h2 key={element.id}>{element.content || "Heading"}</h2>;

      case "divider":
        return <Separator key={element.id} style={customStyles} />;

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Form Preview</DialogTitle>
              <DialogDescription>
                This is how your form will look to users
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4 max-h-[calc(90vh-180px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {elements.map((element) => renderFormElement(element))}
          </form>
          {scoreSummary && (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
              <p className="font-semibold">Score summary</p>
              <p>
                Total score: {scoreSummary.totalScore} / {scoreSummary.maxScore}
              </p>
              <p>
                Answered questions: {scoreSummary.answeredCount} /{" "}
                {scoreSummary.totalQuestions}
              </p>
            </div>
          )}
        </ScrollArea>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Submit Form
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
