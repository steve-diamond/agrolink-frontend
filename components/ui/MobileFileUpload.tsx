"use client";

import * as React from "react";
import { cn } from "./utils";

// ── Icons ──────────────────────────────────────────────────────────────────

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-8 w-8 text-[var(--color-fg-muted)]">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-5 w-5">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-5 w-5">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-4 w-4">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function RotateIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-4 w-4">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-4 w-4">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface FilePreview {
  id: string;
  file: File;
  dataUrl: string;
  rotation: number; // 0 | 90 | 180 | 270
  uploadProgress: number; // 0-100
  uploaded: boolean;
  error?: string;
}

export interface MobileFileUploadProps {
  /** Called with each File when the user picks one or more files */
  onFilesSelected?: (files: File[]) => void;
  /**
   * Optional async upload function. Receives the File, should report
   * progress via the onProgress callback, and resolve when done.
   */
  onUpload?: (file: File, onProgress: (pct: number) => void) => Promise<void>;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  /** Max file size in bytes (default 10 MB) */
  maxSizeBytes?: number;
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  id?: string;
}

// ── Component ─────────────────────────────────────────────────────────────

export function MobileFileUpload({
  onFilesSelected,
  onUpload,
  accept = "image/*",
  multiple = true,
  maxFiles = 10,
  maxSizeBytes = 10 * 1024 * 1024,
  label,
  helperText,
  error: errorProp,
  disabled,
  id: idProp,
}: MobileFileUploadProps) {
  const generatedId = React.useId();
  const id = idProp ?? generatedId;
  const cameraInputId = `${id}-camera`;
  const galleryInputId = `${id}-gallery`;
  const dropRef = React.useRef<HTMLDivElement>(null);

  const [previews, setPreviews] = React.useState<FilePreview[]>([]);
  const [dragOver, setDragOver] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | undefined>();

  const error = errorProp ?? localError;

  // ── File validation ────────────────────────────────────────────────────
  const validate = (files: File[]): { valid: File[]; errorMsg?: string } => {
    const valid: File[] = [];
    const remaining = maxFiles - previews.length;

    for (const f of files) {
      if (valid.length >= remaining) {
        return { valid, errorMsg: `Maximum ${maxFiles} files allowed` };
      }
      if (f.size > maxSizeBytes) {
        return { valid, errorMsg: `"${f.name}" exceeds ${(maxSizeBytes / 1024 / 1024).toFixed(0)} MB limit` };
      }
      valid.push(f);
    }
    return { valid };
  };

  // ── Add files ──────────────────────────────────────────────────────────
  const addFiles = (files: File[]) => {
    setLocalError(undefined);
    const { valid, errorMsg } = validate(files);
    if (errorMsg) { setLocalError(errorMsg); navigator.vibrate?.([30, 30, 30]); return; }
    if (valid.length === 0) return;

    navigator.vibrate?.(8);
    onFilesSelected?.(valid);

    valid.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview: FilePreview = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          dataUrl: e.target?.result as string,
          rotation: 0,
          uploadProgress: 0,
          uploaded: false,
        };
        setPreviews((prev) => [...prev, preview]);

        // Auto-upload if handler provided
        if (onUpload) {
          const onProgress = (pct: number) => {
            setPreviews((prev) =>
              prev.map((p) => p.id === preview.id ? { ...p, uploadProgress: pct } : p)
            );
          };
          onUpload(file, onProgress)
            .then(() => {
              setPreviews((prev) =>
                prev.map((p) => p.id === preview.id ? { ...p, uploadProgress: 100, uploaded: true } : p)
              );
              navigator.vibrate?.(12);
            })
            .catch((err: unknown) => {
              const msg = err instanceof Error ? err.message : "Upload failed";
              setPreviews((prev) =>
                prev.map((p) => p.id === preview.id ? { ...p, error: msg } : p)
              );
              navigator.vibrate?.([20, 20, 20]);
            });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
    e.target.value = ""; // allow re-selecting same file
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) addFiles(Array.from(e.dataTransfer.files));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const removePreview = (pid: string) => {
    setPreviews((prev) => prev.filter((p) => p.id !== pid));
    navigator.vibrate?.(6);
  };

  const rotatePreview = (pid: string) => {
    setPreviews((prev) =>
      prev.map((p) => p.id === pid ? { ...p, rotation: (p.rotation + 90) % 360 } : p)
    );
    navigator.vibrate?.(6);
  };

  const canAddMore = previews.length < maxFiles && !disabled;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <span className="text-sm font-medium text-[var(--color-fg-subtle)] select-none">{label}</span>
      )}

      {/* Drop zone — hidden when at capacity */}
      {canAddMore && (
        <div
          ref={dropRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center",
            "transition-all duration-200 min-h-[140px]",
            dragOver
              ? "border-primary-500 bg-primary-50 scale-[1.01]"
              : error
              ? "border-red-400 bg-red-50/30"
              : "border-[var(--color-border)] bg-[var(--color-bg-subtle)] hover:border-primary-400 hover:bg-primary-50/30"
          )}
        >
          <UploadIcon />
          <p className="text-sm text-[var(--color-fg-muted)]">
            Drag &amp; drop files here, or
          </p>

          {/* Mobile: camera + gallery buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {/* Camera */}
            <label
              htmlFor={cameraInputId}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white",
                "min-h-[44px] min-w-[44px]",
                "shadow-sm hover:bg-primary-700 active:scale-95",
                "transition-all duration-150 select-none [-webkit-tap-highlight-color:transparent]",
                disabled && "pointer-events-none opacity-50"
              )}
            >
              <CameraIcon />
              <span>Take photo</span>
              <input
                id={cameraInputId}
                type="file"
                accept={accept}
                capture="environment"
                multiple={false}
                disabled={disabled}
                onChange={handleInputChange}
                className="sr-only"
                aria-label="Take photo with camera"
              />
            </label>

            {/* Gallery */}
            <label
              htmlFor={galleryInputId}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-xl border border-primary-600 bg-white px-4 py-2.5 text-sm font-semibold text-primary-700",
                "min-h-[44px] min-w-[44px]",
                "hover:bg-primary-50 active:scale-95",
                "transition-all duration-150 select-none [-webkit-tap-highlight-color:transparent]",
                disabled && "pointer-events-none opacity-50"
              )}
            >
              <GalleryIcon />
              <span>Choose from gallery</span>
              <input
                id={galleryInputId}
                type="file"
                accept={accept}
                multiple={multiple}
                disabled={disabled}
                onChange={handleInputChange}
                className="sr-only"
                aria-label="Choose from photo gallery"
              />
            </label>
          </div>

          <p className="text-xs text-[var(--color-fg-muted)]">
            {accept === "image/*" ? "PNG, JPG, WEBP" : accept} &bull; Max {(maxSizeBytes / 1024 / 1024).toFixed(0)} MB
            {maxFiles > 1 && ` · Up to ${maxFiles} files`}
          </p>

          {/* Drag overlay badge */}
          {dragOver && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-primary-500/10 backdrop-blur-sm">
              <span className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg">
                Drop to add
              </span>
            </div>
          )}
        </div>
      )}

      {/* Previews grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {previews.map((p) => (
            <div key={p.id} className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
              {/* Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.dataUrl}
                alt={p.file.name}
                className="h-full w-full object-cover transition-transform duration-300"
                style={{ transform: `rotate(${p.rotation}deg)` }}
              />

              {/* Upload progress overlay */}
              {!p.uploaded && !p.error && onUpload && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20">
                  <div
                    className="h-full bg-primary-500 transition-all duration-300"
                    style={{ width: `${p.uploadProgress}%` }}
                  />
                </div>
              )}

              {/* Success badge */}
              {p.uploaded && (
                <span className="absolute bottom-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow">
                  <CheckIcon />
                </span>
              )}

              {/* Error badge */}
              {p.error && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-500/60 p-1 text-center">
                  <span className="text-xs font-medium text-white leading-tight">{p.error}</span>
                </div>
              )}

              {/* Action buttons overlay (top-right) */}
              <div className="absolute right-1 top-1 flex flex-col gap-1">
                {/* Rotate */}
                <button
                  type="button"
                  onClick={() => rotatePreview(p.id)}
                  aria-label={`Rotate ${p.file.name}`}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 transition-colors"
                >
                  <RotateIcon />
                </button>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removePreview(p.id)}
                  aria-label={`Remove ${p.file.name}`}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/80 text-white backdrop-blur-sm hover:bg-red-600 transition-colors"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error / helper */}
      {(error || helperText) && (
        <p role={error ? "alert" : undefined} className={cn("text-xs", error ? "animate-field-error text-red-600" : "text-[var(--color-fg-muted)]")}>
          {error ?? helperText}
        </p>
      )}

      {/* File count */}
      {previews.length > 0 && maxFiles > 1 && (
        <p className="text-xs text-[var(--color-fg-muted)]">
          {previews.length}/{maxFiles} files selected
        </p>
      )}
    </div>
  );
}
