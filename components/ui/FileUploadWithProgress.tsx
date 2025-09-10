"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, CheckCircle, AlertCircle, File } from "lucide-react";

interface FileUploadWithProgressProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  acceptedFormats?: string[];
  maxSize?: number; // in MB
  currentFile?: File;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export default function FileUploadWithProgress({
  onFileSelect,
  onFileRemove,
  acceptedFormats,
  maxSize,
  currentFile,
  disabled = false,
  error,
  className = "",
}: FileUploadWithProgressProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file size
      if (maxSize && file.size > maxSize * 1024 * 1024) {
        const sizeLimit =
          maxSize < 1 ? `${Math.round(maxSize * 1024)} KB` : `${maxSize} MB`;
        return `File must be smaller than ${sizeLimit}`;
      }

      // Check file format
      if (acceptedFormats && acceptedFormats.length > 0) {
        const fileExtension = file.name.split(".").pop()?.toLowerCase();
        if (!fileExtension || !acceptedFormats.includes(fileExtension)) {
          return `File format not allowed. Allowed: .${acceptedFormats.join(
            ", ."
          )}`;
        }
      }

      return null;
    },
    [acceptedFormats, maxSize]
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        return; // Error will be shown by parent component
      }

      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress (in real implementation, this would be actual upload progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            setTimeout(() => {
              setIsUploading(false);
              setUploadProgress(100);
              onFileSelect(file);
            }, 200);
            return 90;
          }
          return prev + Math.random() * 20;
        });
      }, 100);
    },
    [onFileSelect, validateFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [disabled, handleFileSelect]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleRemoveFile = useCallback(() => {
    setUploadProgress(0);
    setIsUploading(false);
    onFileRemove();
  }, [onFileRemove]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* File Upload Area */}
      <AnimatePresence mode="wait">
        {!currentFile && !isUploading ? (
          <motion.div
            key="upload-area"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
              isDragOver
                ? "border-heading bg-heading/5"
                : error
                ? "border-red-500/50 bg-red-500/5"
                : "border-gray-600 hover:border-gray-500"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => {
              if (!disabled) {
                document.getElementById("file-input")?.click();
              }
            }}
          >
            <input
              id="file-input"
              type="file"
              className="hidden"
              onChange={handleFileInputChange}
              accept={acceptedFormats?.map((format) => `.${format}`).join(",")}
              disabled={disabled}
            />

            <motion.div
              animate={{ scale: isDragOver ? 1.05 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <Upload
                className={`w-12 h-12 mx-auto mb-4 ${
                  isDragOver
                    ? "text-heading"
                    : error
                    ? "text-red-400"
                    : "text-gray-400"
                }`}
              />
              <p className="text-gray-300 mb-2">
                {isDragOver
                  ? "Drop your file here"
                  : "Click to upload or drag and drop"}
              </p>
              <p className="text-gray-500 text-sm">
                {acceptedFormats && acceptedFormats.length > 0 && (
                  <>Allowed: .{acceptedFormats.join(", .")}</>
                )}
                {maxSize && (
                  <>
                    {acceptedFormats ? " • " : ""}Max size:{" "}
                    {maxSize < 1
                      ? `${Math.round(maxSize * 1024)} KB`
                      : `${maxSize} MB`}
                  </>
                )}
              </p>
            </motion.div>
          </motion.div>
        ) : isUploading ? (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border border-gray-600 rounded-lg p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <File className="w-5 h-5 text-blue-400" />
              <span className="text-gray-300 font-medium">Uploading...</span>
              <span className="text-gray-500 text-sm ml-auto">
                {Math.round(uploadProgress)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-blue-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        ) : currentFile ? (
          <motion.div
            key="file-selected"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border border-green-500/30 bg-green-500/5 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-gray-300 font-medium truncate">
                  {currentFile.name}
                </p>
                <p className="text-gray-500 text-sm">
                  {formatFileSize(currentFile.size)}
                </p>
              </div>
              <button
                onClick={handleRemoveFile}
                className="text-gray-400 hover:text-red-400 transition-colors p-1"
                disabled={disabled}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
