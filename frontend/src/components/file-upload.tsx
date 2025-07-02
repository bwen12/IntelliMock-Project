"use client"

import type React from "react"

import { useState, useRef } from "react"
import { FileText, Upload, X } from "lucide-react"
import { Button } from "./ui/button"

/**
 * FileUpload component allows users to upload a PDF file with drag-and-drop support and a file input.
 * It validates the file type and size before passing the file to the `onFileChange` handler.
 * 
 * **Props**:
 * - `onFileChange`: A function that receives the selected file or `null` when the file is removed.
 * - `accept`: The type of files allowed (default is `.pdf`).
 * - `maxSize`: The maximum file size allowed in MB (default is `5MB`).
 * 
 * **Functionality**:
 * - Drag-and-drop or file selection via an input element.
 * - Displays the file name after a successful upload.
 * - Shows an error message if the file is invalid (wrong type or exceeds the size limit).
 * - Allows file removal by clicking the close (X) icon next to the file name.
 * 
 * **Styling**:
 * - The component has custom styles for drag-and-drop, hover effects, and error states.
 * 
 */
interface FileUploadProps {
  onFileChange: (file: File | null) => void
  accept?: string
  maxSize?: number // in MB
}

/**
 * 
 * @param param0 - `onFileChange`: Callback function to handle file changes.
 * @param param0 - `accept`: Accepted file types (default is `.pdf`).
 * @param param0 - `maxSize`: Maximum file size in MB (default is `5MB`).
 * @returns 
 */
export function FileUpload({ onFileChange, accept = ".pdf", maxSize = 5 }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  /**
   * Handles drag events to manage the drag state and prevent default behavior.
   * @param e - The drag event triggered by the user.
   */
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  /**
   * Validates the file type and size before uploading.
   * @param file - The file to be validated.
   * @returns `true` if valid, `false` otherwise.
   */
  const validateFile = (file: File): boolean => {
    // Check file type
    if (accept && !file.type.includes("pdf")) {
      setError(`Please upload a PDF file.`)
      return false
    }

    // Check file size
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit.`)
      return false
    }

    return true
  }

  /**
   * Handles the drop event to process the file.
   * @param e - The drag event triggered by the user.
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (validateFile(file)) {
        setFileName(file.name)
        setError(null)
        onFileChange(file)
      }
    }
  }

  /**
   * Handles the file input change event to process the selected file.
   * @param e - The change event triggered by the file input.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (validateFile(file)) {
        setFileName(file.name)
        setError(null)
        onFileChange(file)
      }
    }
  }

  /**
   * Handles the click event to trigger the file input.
   */
  const handleClick = () => {
    inputRef.current?.click()
  }

  /**
   * Removes the selected file and resets the state.
   */
  const removeFile = () => {
    setFileName(null)
    setError(null)
    onFileChange(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        data-testid="dropzone"
        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg p-4 transition-all cursor-pointer ${
          dragActive
            ? "border-primary bg-primary/5"
            : isHovering
              ? "border-primary/70 bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" data-testid="file-input" aria-label="upload" />

        {fileName ? (
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">{fileName}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation()
                removeFile()
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload
              className={`h-6 w-6 ${isHovering ? "text-primary scale-110" : "text-muted-foreground"} transition-all duration-200`}
            />
            <p className="text-sm text-center text-muted-foreground">Drag and drop your file here or click to browse</p>
            <p className="text-xs text-muted-foreground">PDF files only, max {maxSize}MB</p>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
