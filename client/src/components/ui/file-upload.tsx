import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, FileText, Image, File } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  currentFile?: string | null;
  accept?: Record<string, string[]>;
  maxSize?: number;
  className?: string;
  disabled?: boolean;
}

export default function FileUpload({
  onFileSelect,
  onFileRemove,
  currentFile,
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  className,
  disabled = false
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setUploadError(null);
      
      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0].errors[0];
        if (error.code === 'file-too-large') {
          setUploadError(`File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
        } else if (error.code === 'file-invalid-type') {
          setUploadError('Invalid file type. Please select a valid file.');
        } else {
          setUploadError('File upload failed. Please try again.');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect, maxSize]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept,
    maxSize,
    multiple: false,
    disabled
  });

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-8 w-8 text-blue-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-8 w-8 text-blue-600" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const getFileName = (filePath: string) => {
    return filePath.split('/').pop() || filePath;
  };

  if (currentFile) {
    return (
      <Card className={cn("relative", className)}>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            {getFileIcon(currentFile)}
            <div>
              <p className="text-sm font-medium">{getFileName(currentFile)}</p>
              <p className="text-xs text-gray-500">Current file</p>
            </div>
          </div>
          {onFileRemove && !disabled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onFileRemove}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-gray-300",
          disabled && "opacity-50 cursor-not-allowed",
          uploadError && "border-red-300 bg-red-50"
        )}
      >
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <input {...getInputProps()} />
          
          <Upload className={cn(
            "h-8 w-8 mb-2",
            isDragActive ? "text-primary" : "text-gray-400"
          )} />
          
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isDragActive ? "Drop the file here" : "Click to upload or drag and drop"}
            </p>
            <p className="text-xs text-gray-500">
              PDF, DOC, DOCX, JPG, PNG up to {maxSize / (1024 * 1024)}MB
            </p>
          </div>
          
          {uploadError && (
            <p className="text-xs text-red-600 mt-2">{uploadError}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
