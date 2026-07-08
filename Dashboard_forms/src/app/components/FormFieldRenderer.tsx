import React, { useEffect, useRef, useState } from "react";
import { FormElement } from "../types/form-builder";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Slider } from "./ui/slider";
import { Separator } from "./ui/separator";
import { Star, Heart, Check, Play, Pause, Volume2, X } from "lucide-react";

interface FormFieldRendererProps {
  element: FormElement;
  isSelected: boolean;
  onClick: () => void;
}

function formatTimestamp(value: number) {
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function RatingSymbol({ symbol, value }: { symbol: string; value: number }) {
  switch (symbol) {
    case "star":
      return <Star className="h-6 w-6" />;
    case "heart":
      return <Heart className="h-6 w-6" />;
    case "tick":
      return <Check className="h-6 w-6" />;
    case "number":
      return <span className="text-lg font-bold">{value}</span>;
    default:
      return <Star className="h-6 w-6" />;
  }
}

export function AudioPlayer({
  audioUrl,
  label,
  showLabel = true,
  score,
  required,
  description,
}: {
  audioUrl: string;
  label?: string;
  showLabel?: boolean;
  score?: number;
  required?: boolean;
  description?: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Smooth time tracking with requestAnimationFrame for better accuracy
    let animationFrameId: number;
    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      animationFrameId = requestAnimationFrame(updateTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handleSeeking = () => {
      setIsSeeking(true);
    };
    const handleSeeked = () => {
      setIsSeeking(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("durationchange", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("seeking", handleSeeking);
    audio.addEventListener("seeked", handleSeeked);

    // Start continuous time update
    animationFrameId = requestAnimationFrame(updateTime);

    return () => {
      cancelAnimationFrame(animationFrameId);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("durationchange", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("seeking", handleSeeking);
      audio.removeEventListener("seeked", handleSeeked);
    };
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    // Ensure audio can play before attempting to play
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error("Playback failed:", error);
          setIsPlaying(false);
        });
    }
  };

  const handleStop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (value: number) => {
    if (!audioRef.current) return;
    // Set the playback position directly without state updates
    // This prevents circular dependencies and ensures smooth seeking
    const seekTime = Math.max(0, Math.min(value, duration));
    audioRef.current.currentTime = seekTime;
    // Update UI state after seeking completes
    setCurrentTime(seekTime);
  };

  return (
    <div
      className="space-y-3 p-4 rounded-2xl border border-gray-200 bg-white"
      onClick={(e) => e.stopPropagation()}>
      <div className="flex items-start justify-between gap-4">
        <div>
          {showLabel && label && (
            <p className="text-sm font-medium text-gray-900">{label}</p>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        {score !== undefined && (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
            {score} pts
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </button>
          <button
            type="button"
            onClick={handleStop}
            className="inline-flex h-10 items-center justify-center rounded-full border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Stop
          </button>
          <div className="min-w-0 flex-1">
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-blue-600"
                style={{
                  width: duration ? `${(currentTime / duration) * 100}%` : "0%",
                }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>{formatTimestamp(currentTime)}</span>
              <span>{formatTimestamp(duration)}</span>
            </div>
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.01}
          value={currentTime}
          onChange={(e) => handleSeek(Number(e.target.value))}
          onMouseDown={() => setIsSeeking(true)}
          onMouseUp={() => setIsSeeking(false)}
          onTouchStart={() => setIsSeeking(true)}
          onTouchEnd={() => setIsSeeking(false)}
          onClick={(e) => e.stopPropagation()}
          title="Audio playback position"
          className="w-full cursor-pointer rounded-lg accent-blue-600"
        />

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Volume2 className="h-4 w-4" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            title="Audio volume control"
            className="h-2 w-full cursor-pointer rounded-lg accent-blue-600"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="auto"
        crossOrigin="anonymous"
        controls={false}
        className="hidden"
      />
      {required && (
        <div className="text-xs font-medium text-red-600">Required</div>
      )}
    </div>
  );
}

function RatingField({
  element,
  style,
}: {
  element: FormElement;
  style?: React.CSSProperties;
}) {
  const [selectedRating, setSelectedRating] = useState<string>("");
  const symbol = element.symbol || "star";
  const levels = Math.max(2, Math.min(10, element.levels || 5));

  return (
    <div className="space-y-3" style={style}>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(3.5rem,1fr))] gap-3">
        {Array.from({ length: levels }, (_, index) => {
          const valueLabel = String(index + 1);
          const selected = selectedRating === valueLabel;
          return (
            <label
              key={valueLabel}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 px-3 py-4 text-center transition ${
                selected
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 bg-white hover:border-blue-400"
              }`}>
              <input
                type="radio"
                name={element.id}
                value={valueLabel}
                checked={selected}
                onChange={() => setSelectedRating(valueLabel)}
                className="sr-only"
                aria-label={`Rate ${valueLabel}`}
              />
              <span className="flex items-center justify-center h-8 w-8 text-gray-700">
                <RatingSymbol symbol={symbol} value={parseInt(valueLabel)} />
              </span>
              <span className="mt-2 text-sm font-semibold text-gray-600">
                {valueLabel}
              </span>
            </label>
          );
        })}
      </div>
      {element.required && (
        <p className="text-xs text-red-500">Please select a rating.</p>
      )}
    </div>
  );
}

function RadioMp3Field({
  element,
  style,
}: {
  element: FormElement;
  style?: React.CSSProperties;
}) {
  const getAudioSource = (optionIndex: number) => {
    const option = element.options?.[optionIndex];
    return option?.audioUrl || element.audioUrl;
  };

  return (
    <div className="space-y-3" style={style}>
      {element.options && element.options.length > 0 ? (
        <div className="space-y-3">
          {element.options.map((option, idx) => {
            const audioUrl = getAudioSource(idx);
            return (
              <div
                key={idx}
                className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
                {option.label && (
                  <div className="text-sm font-medium text-gray-900">
                    {option.label}
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
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
          Add options to this Radio MP3 field. Each option can have an audio
          file attached.
        </div>
      )}
    </div>
  );
}

function CheckboxGroupField({
  element,
  style,
}: {
  element: FormElement;
  style?: React.CSSProperties;
}) {
  const [checkedValues, setCheckedValues] = useState<string[]>([]);

  const handleCheckChange = (value: string, checked: boolean) => {
    if (checked) {
      setCheckedValues([...checkedValues, value]);
    } else {
      setCheckedValues(checkedValues.filter((v) => v !== value));
    }
  };

  return (
    <div className="space-y-2" style={style}>
      {element.options?.map((option, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Checkbox
            id={`${element.id}-${index}`}
            checked={checkedValues.includes(option.value)}
            onCheckedChange={(checked) =>
              handleCheckChange(option.value, Boolean(checked))
            }
          />
          <Label
            htmlFor={`${element.id}-${index}`}
            className="font-normal cursor-pointer">
            {option.label}
          </Label>
        </div>
      ))}
    </div>
  );
}

export function FormFieldRenderer({
  element,
  isSelected,
  onClick,
}: FormFieldRendererProps) {
  const getInlineStyles = (): React.CSSProperties => {
    const styles = element.styles || {};
    return {
      width: styles.width,
      backgroundColor: styles.backgroundColor,
      color: styles.textColor,
      borderColor: styles.borderColor,
      borderWidth: styles.borderWidth,
      borderRadius: styles.borderRadius,
      padding: styles.padding,
      margin: styles.margin,
    };
  };

  const renderField = () => {
    switch (element.type) {
      case "text":
      case "email":
      case "number":
      case "tel":
      case "url":
      case "password":
        return (
          <Input
            type={element.type}
            placeholder={element.placeholder}
            required={element.required}
            min={element.min}
            max={element.max}
            pattern={element.pattern}
            style={getInlineStyles()}
          />
        );

      case "textarea":
        return (
          <Textarea
            placeholder={element.placeholder}
            required={element.required}
            rows={element.rows || 4}
            style={getInlineStyles()}
          />
        );

      case "select":
        return (
          <Select>
            <SelectTrigger style={getInlineStyles()}>
              <SelectValue
                placeholder={element.placeholder || "Select an option"}
              />
            </SelectTrigger>
            <SelectContent>
              {element.options?.map((option, index) => (
                <SelectItem key={index} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "radio":
        return (
          <RadioGroup style={getInlineStyles()}>
            {element.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={`${element.id}-${option.value}`}
                />
                <Label htmlFor={`${element.id}-${option.value}`}>
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "file":
        return (
          <Input
            type="file"
            accept={element.accept}
            required={element.required}
            style={getInlineStyles()}
          />
        );

      case "date":
        return (
          <Input
            type="date"
            required={element.required}
            min={element.min as string}
            max={element.max as string}
            style={getInlineStyles()}
          />
        );

      case "time":
        return (
          <Input
            type="time"
            required={element.required}
            style={getInlineStyles()}
          />
        );

      case "datetime":
        return (
          <Input
            type="datetime-local"
            required={element.required}
            style={getInlineStyles()}
          />
        );

      case "color":
        return (
          <Input
            type="color"
            required={element.required}
            style={getInlineStyles()}
            className="h-10 w-20"
          />
        );

      case "rating":
        return <RatingField element={element} style={getInlineStyles()} />;

      case "radioMp3":
        return <RadioMp3Field element={element} style={getInlineStyles()} />;

      case "checkboxGroup":
        return (
          <CheckboxGroupField element={element} style={getInlineStyles()} />
        );

      case "likert":
        return (
          <div className="space-y-2" style={getInlineStyles()}>
            {(element.options?.length
              ? element.options
              : [{ label: "Strongly agree", value: "agree" }]
            ).map((option, index) => (
              <div
                key={`${option.value}-${index}`}
                className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600">
                <span>{option.label}</span>
                <span className="text-xs text-gray-400">1-5</span>
              </div>
            ))}
          </div>
        );

      case "heading":
        return (
          <h2 style={getInlineStyles()}>{element.content || "Heading"}</h2>
        );

      case "divider":
        return <Separator style={getInlineStyles()} />;

      default:
        return null;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 border-2 rounded-lg transition-all duration-200 cursor-pointer animate-in fade-in slide-in-from-top-2 ${
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "border-transparent hover:border-gray-300 bg-white hover:shadow-sm"
      }`}>
      {element.type !== "heading" &&
        element.type !== "paragraph" &&
        element.type !== "divider" && (
          <div className="mb-2">
            <Label>
              {element.label}
              {element.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {element.description && (
              <p className="text-xs text-gray-500 mt-1">
                {element.description}
              </p>
            )}
          </div>
        )}
      {renderField()}
      {element.errorMessage && (
        <p className="text-xs text-red-500 mt-1">{element.errorMessage}</p>
      )}
    </div>
  );
}
