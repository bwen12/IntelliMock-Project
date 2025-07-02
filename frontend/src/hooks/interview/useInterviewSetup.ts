import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createChatSession } from "../../services/interviewService";
import { useNotification } from "../useNotification";

/**
 * Custom hook to handle interview session setup, including form validation, submission, and error handling.
 * 
 * This hook is responsible for managing the state related to the interview setup form, such as loading status, 
 * error messages, and handling the submission of the form data. It validates the form inputs, sends the data 
 * to the server, and navigates to the interview session page if successful.
 * 
 * @hook useInterviewSetup
 * @returns {Object} The hook's return value containing:
 *   - {Function} submitInterview - The function that handles the form submission, validates inputs, and sends data to the server.
 *   - {boolean} loading - Indicates if the interview setup form is in the process of being submitted.
 *   - {Object} errors - An object containing error messages for each field (if any), or a global error message.
 *   - {Function} resetErrors - A function to reset the error state.
 * 
 * @typedef {Object} InterviewFormData - The structure of the interview setup form data.
 * @property {string} chatName - The name of the chat for the interview session.
 * @property {string} jobTitle - The job title for the interview.
 * @property {string} companyName - The name of the company offering the job.
 * @property {string} jobDescription - A description of the job role.
 * @property {File | null} resume - The resume file uploaded by the user.
 * @property {string} context - Additional context for the interview.
 * 
 * @returns {Object} The result of the form submission:
 *   - {boolean} success - A flag indicating if the interview session was successfully created.
 *   - {Object} errors - An object containing error messages for any validation failures.
 */
export function useInterviewSetup() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const { showError } = useNotification();

    const resetErrors = () => setErrors({});

    /**
     * Submits the interview session form and handles validation, error handling, and API communication.
     * 
     * @param {InterviewFormData} interviewData - The data for the interview session form.
     * @returns {Object} The result of the submission:
     *   - {boolean} success - Indicates if the submission was successful.
     *   - {Object} errors - Contains errors related to the form fields or global errors.
     */
    const submitInterview = async ({
        chatName,
        jobTitle,
        companyName,
        jobDescription,
        resume,
        context,
    }: {
        chatName: string;
        jobTitle: string;
        companyName: string;
        jobDescription: string;
        resume: File | null;
        context: string;
    }) => {
        const newErrors: { [key: string]: string } = {};

        if (!chatName.trim()) newErrors.chatName = "Chat name is required";
        if (!jobTitle.trim()) newErrors.jobTitle = "Job title is required";
        if (!companyName.trim()) newErrors.companyName = "Company name is required";
        if (!jobDescription.trim()) newErrors.jobDescription = "Job description is required";
        if (!resume) newErrors.resume = "Please upload a resume / CV";

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return { success: false, errors: newErrors };
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("chatName", chatName);
            formData.append("jobTitle", jobTitle);
            formData.append("companyName", companyName);
            formData.append("jobDescription", jobDescription);
            formData.append("context", context?.trim() || "");
            formData.append("cv", resume!);

            const response = await createChatSession(formData);
            const chatId = response.id;

            navigate(`/interview-session/${chatId}`);
            return { success: true };
        } catch (err: any) {
            const apiMessage = err?.response?.data?.message || err?.response?.data;

            if (err?.response?.status === 400 && apiMessage?.toLowerCase().includes("already exists")) {
                showError(apiMessage);
                setErrors({ chatName: apiMessage });
                return { success: false, errors: { chatName: apiMessage } };
            }

            const fallbackMessage = apiMessage || "Failed to create interview session";
            showError(fallbackMessage);
            setErrors({ global: fallbackMessage });
            return { success: false, errors: { global: fallbackMessage } };
        } finally {
            setLoading(false);
        }
    };

    return { submitInterview, loading, errors, resetErrors };
}
