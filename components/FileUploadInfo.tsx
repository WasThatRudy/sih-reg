import React from "react";
import { FileText } from "lucide-react";

interface FileUploadInfoProps {
  acceptedFormats?: string[];
  maxSize?: number;
  required?: boolean;
  className?: string;
}

export default function FileUploadInfo({
  acceptedFormats,
  maxSize,
  required,
  className = "",
}: FileUploadInfoProps) {
  if (!acceptedFormats?.length && !maxSize) {
    return null;
  }

  const formatMaxSize = (sizeInMB: number) => {
    if (sizeInMB < 1) {
      return `${Math.round(sizeInMB * 1024)} KB`;
    }
    return `${sizeInMB} MB`;
  };

  return (
    <div
      className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${className}`}
    >
      <div className="flex items-start gap-2">
        <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <div className="font-medium text-blue-900 mb-1">
            File Requirements
            {required && <span className="text-red-500 ml-1">*</span>}
          </div>
          <ul className="text-blue-700 space-y-1">
            {maxSize && (
              <li className="flex items-center gap-1">
                <span className="w-1 h-1 bg-blue-600 rounded-full flex-shrink-0"></span>
                Maximum file size: <strong>{formatMaxSize(maxSize)}</strong>
              </li>
            )}
            {acceptedFormats && acceptedFormats.length > 0 && (
              <li className="flex items-start gap-1">
                <span className="w-1 h-1 bg-blue-600 rounded-full flex-shrink-0 mt-2"></span>
                <div>
                  Allowed formats:{" "}
                  <strong>.{acceptedFormats.join(", .")}</strong>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Validation helper function for frontend use
export function validateFileUpload(
  file: File,
  acceptedFormats?: string[],
  maxSizeInMB?: number
): { isValid: boolean; error?: string } {
  // Check file size
  if (maxSizeInMB && file.size > maxSizeInMB * 1024 * 1024) {
    const formatSize =
      maxSizeInMB < 1
        ? `${Math.round(maxSizeInMB * 1024)} KB`
        : `${maxSizeInMB} MB`;
    return {
      isValid: false,
      error: `File size must be less than ${formatSize}`,
    };
  }

  // Check file format
  if (acceptedFormats && acceptedFormats.length > 0) {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (!fileExtension || !acceptedFormats.includes(fileExtension)) {
      return {
        isValid: false,
        error: `File format not allowed. Allowed formats: .${acceptedFormats.join(
          ", ."
        )}`,
      };
    }
  }

  return { isValid: true };
}
