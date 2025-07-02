/**
 * @fileoverview
 * This file contains tests for the MockInterviewPage component. It uses Vitest and Testing Library
 * to test various functionalities and states of the MockInterviewPage component.
 *
 * The tests cover:
 * - Rendering the initial state, including the "Create New Interview" button.
 * - Showing the interview setup form when the button is clicked.
 * - Handling form submission with correct data.
 * - Displaying validation errors when the form is submitted with missing information.
 * - Resetting the form when the cancel button is clicked.
 * - Showing a loading state during submission.
 *
 * Mocking is used for the `useInterviewSetup` hook to simulate different states and behaviors.
 * The tests ensure that the MockInterviewPage component handles form submission, validation, 
 * and loading states correctly.
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import MockInterviewPage from '../mock-interview'
import { useInterviewSetup } from '../../hooks/interview/useInterviewSetup'

// Mock the useInterviewSetup hook
vi.mock('../../hooks/interview/useInterviewSetup', () => ({
  useInterviewSetup: vi.fn()
}))

describe('MockInterviewPage', () => {
  const mockSubmitInterview = vi.fn()
  const mockResetErrors = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useInterviewSetup as any).mockReturnValue({
      submitInterview: mockSubmitInterview,
      loading: false,
      errors: {},
      resetErrors: mockResetErrors
    })
  })

  /**
   * Test to verify that the initial state of the page includes the necessary elements.
   * Ensures that the 'Mock Interview' title, 'Ready to practice?' text, and the 
   * 'Create New Interview' button are rendered correctly.
   */
  test('renders initial state with create new interview button', () => {
    render(<MockInterviewPage />)
    expect(screen.getByText('Mock Interview')).toBeInTheDocument()
    expect(screen.getByText('Ready to practice?')).toBeInTheDocument()
    expect(screen.getByText('Create New Interview')).toBeInTheDocument()
  })

  /**
   * Test to check that the interview setup form is displayed when the "Create New Interview" 
   * button is clicked. Ensures that the form includes all necessary fields.
   */
  test('shows interview setup form when create new interview is clicked', () => {
    render(<MockInterviewPage />)
    fireEvent.click(screen.getByText('Create New Interview'))
    expect(screen.getByText('Interview Setup')).toBeInTheDocument()
    expect(screen.getByLabelText('Chat Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Job Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Company Name')).toBeInTheDocument()
  })

  /**
   * Test to verify that the form data is correctly submitted when the form is filled out 
   * and the 'Start Interview' button is clicked.
   */
  test('handles form submission correctly', async () => {
    render(<MockInterviewPage />)
    fireEvent.click(screen.getByText('Create New Interview'))

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Chat Name'), {
      target: { value: 'Frontend Developer Interview' }
    })
    fireEvent.change(screen.getByLabelText('Job Title'), {
      target: { value: 'Frontend Developer' }
    })
    fireEvent.change(screen.getByLabelText('Company Name'), {
      target: { value: 'Google' }
    })
    fireEvent.change(screen.getByLabelText('Job Description'), {
      target: { value: 'Job description text' }
    })

    // Submit the form
    fireEvent.click(screen.getByText('Start Interview'))

    await waitFor(() => {
      expect(mockSubmitInterview).toHaveBeenCalledWith({
        chatName: 'Frontend Developer Interview',
        jobTitle: 'Frontend Developer',
        companyName: 'Google',
        jobDescription: 'Job description text',
        context: '',
        resume: null
      })
    })
  })

  /**
   * Test to verify that validation errors are displayed when the form is submitted with missing or invalid data.
   */
  test('displays validation errors when form is submitted with errors', () => {
    const mockErrors = {
      chatName: 'Chat name is required',
      jobTitle: 'Job title is required'
    }
    ;(useInterviewSetup as any).mockReturnValue({
      submitInterview: mockSubmitInterview,
      loading: false,
      errors: mockErrors,
      resetErrors: mockResetErrors
    })

    render(<MockInterviewPage />)
    fireEvent.click(screen.getByText('Create New Interview'))
    fireEvent.click(screen.getByText('Start Interview'))

    expect(screen.getByText('Chat name is required')).toBeInTheDocument()
    expect(screen.getByText('Job title is required')).toBeInTheDocument()
  })

  /**
   * Test to verify that the form is reset when the cancel button is clicked.
   * Ensures the form is hidden and the error states are cleared.
   */
  test('resets form when cancel is clicked', () => {
    render(<MockInterviewPage />)
    fireEvent.click(screen.getByText('Create New Interview'))

    // Fill in some form fields
    fireEvent.change(screen.getByLabelText('Chat Name'), {
      target: { value: 'Test Interview' }
    })

    // Click cancel
    fireEvent.click(screen.getByText('Cancel'))

    // Form should be hidden and reset
    expect(screen.queryByText('Interview Setup')).not.toBeInTheDocument()
    expect(mockResetErrors).toHaveBeenCalled()
  })

  /**
   * Test to ensure that a loading state is displayed when the form is being submitted.
   * Ensures that the 'Starting...' text is shown during the submission process.
   */
  test('shows loading state during submission', () => {
    ;(useInterviewSetup as any).mockReturnValue({
      submitInterview: mockSubmitInterview,
      loading: true,
      errors: {},
      resetErrors: mockResetErrors
    })

    render(<MockInterviewPage />)
    fireEvent.click(screen.getByText('Create New Interview'))
    expect(screen.getByText('Starting...')).toBeInTheDocument()
  })
}) 