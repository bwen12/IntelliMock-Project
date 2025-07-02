import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FileUpload } from '../file-upload'

/**
 * @fileoverview
 * Test suite for the FileUpload component.
 * Validates file type restrictions, file size checks, UI behavior, and event handling.
 */
describe('FileUpload', () => {
  const mockOnFileChange = vi.fn()

  beforeEach(() => {
    // Reset the mock function before each test to avoid test pollution
    mockOnFileChange.mockClear()
  })

  /**
   * @test
   * Ensures the FileUpload component renders with default instructional text and file restrictions.
   */
  test('renders upload area with default text', () => {
    render(<FileUpload onFileChange={mockOnFileChange} />)
    expect(screen.getByText('Drag and drop your file here or click to browse')).toBeInTheDocument()
    expect(screen.getByText('PDF files only, max 5MB')).toBeInTheDocument()
  })

  /**
   * @test
   * Verifies that non-PDF files trigger an error and do not invoke the callback.
   */
  test('shows error for non-PDF file', () => {
    render(<FileUpload onFileChange={mockOnFileChange} />)
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const input = screen.getByTestId('file-input')
    fireEvent.change(input, { target: { files: [file] } })
    expect(mockOnFileChange).not.toHaveBeenCalled()
    expect(screen.getByText('Please upload a PDF file.')).toBeInTheDocument()
  })

  /**
   * @test
   * Verifies that an oversized PDF file triggers a file size error and is rejected.
   */
  test('shows error for oversized file', () => {
    render(<FileUpload onFileChange={mockOnFileChange} maxSize={1} />)
    const file = new File(['a'.repeat(2 * 1024 * 1024)], 'big.pdf', { type: 'application/pdf' })
    const input = screen.getByTestId('file-input')
    fireEvent.change(input, { target: { files: [file] } })
    expect(mockOnFileChange).not.toHaveBeenCalled()
    expect(screen.getByText('File size exceeds 1MB limit.')).toBeInTheDocument()
  })

  /**
   * @test
   * Verifies that a valid PDF file is accepted and passed to the `onFileChange` callback.
   */
  test('accepts valid PDF file', () => {
    render(<FileUpload onFileChange={mockOnFileChange} />)
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    const input = screen.getByTestId('file-input')
    fireEvent.change(input, { target: { files: [file] } })
    expect(mockOnFileChange).toHaveBeenCalledWith(file)
  })

  /**
   * @test
   * Ensures clicking the remove button clears the uploaded file and invokes callback with null.
   */
  test('removes file when clicking remove button', () => {
    render(<FileUpload onFileChange={mockOnFileChange} />)
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    const input = screen.getByTestId('file-input')
    fireEvent.change(input, { target: { files: [file] } })
    expect(mockOnFileChange).toHaveBeenCalledWith(file)
    const removeButton = screen.getByRole('button')
    fireEvent.click(removeButton)
    expect(mockOnFileChange).toHaveBeenCalledWith(null)
    expect(screen.getByText('Drag and drop your file here or click to browse')).toBeInTheDocument()
  })

  /**
   * @test
   * Tests drag and drop interaction, verifying class toggling on drag events.
   */
  test('handles drag and drop events', () => {
    render(<FileUpload onFileChange={mockOnFileChange} />)
    const dropzone = screen.getByTestId('dropzone')
    fireEvent.dragEnter(dropzone)
    expect(dropzone).toHaveClass('border-primary')
    fireEvent.dragLeave(dropzone)
    expect(dropzone).not.toHaveClass('border-primary')
  })
}) 