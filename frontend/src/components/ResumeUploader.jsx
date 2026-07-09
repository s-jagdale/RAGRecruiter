import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileText, X, Loader2 } from "lucide-react";
import { cn } from "../utils/cn";

const ACCEPTED_TYPES = [".pdf", ".docx"];

export default function ResumeUploader({ onFileSelected, isUploading, uploadedFilename, onClear }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const validateAndEmit = useCallback(
    (file) => {
      if (!file) return;
      const lower = file.name.toLowerCase();
      const isValid = ACCEPTED_TYPES.some((ext) => lower.endsWith(ext));
      if (!isValid) {
        alert("Only .pdf and .docx resumes are supported.");
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndEmit(e.dataTransfer.files?.[0]);
  };

  if (uploadedFilename) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-primary-200 bg-primary-50 px-4 py-3.5">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-primary-600" />
          <span className="text-sm font-medium text-ink-900">{uploadedFilename}</span>
        </div>
        <button
          onClick={onClear}
          aria-label="Remove uploaded resume"
          className="rounded-lg p-1 text-ink-500 hover:bg-white hover:text-red-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
        isDragging ? "border-primary-500 bg-primary-50" : "border-ink-900/15 hover:border-primary-300"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => validateAndEmit(e.target.files?.[0])}
      />
      {isUploading ? (
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      ) : (
        <UploadCloud className="h-8 w-8 text-primary-500" />
      )}
      <div>
        <p className="font-medium text-ink-900">
          {isUploading ? "Uploading and parsing your resume..." : "Drag & drop your resume, or click to browse"}
        </p>
        <p className="mt-1 text-sm text-ink-500">Supports PDF and DOCX</p>
      </div>
    </div>
  );
}
