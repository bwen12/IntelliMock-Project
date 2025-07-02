/**
 * Represents a chat session related to the job interview process.
 * 
 * @interface Chat
 * @property {string} id - A unique identifier for the chat session.
 * @property {string} chatName - The name given to the chat session, often related to the interview or conversation.
 * @property {string} companyName - The name of the company associated with the chat session.
 * @property {string} jobTitle - The job title for the position discussed during the chat.
 * @property {string} createdDate - The date when the chat session was created, in ISO 8601 string format.
 * @property {number} timeElapsed - The elapsed time in seconds since the chat session was created.
 */
export interface Chat{
    id: string;
    chatName: string;
    companyName: string;
    jobTitle: string;
    createdDate: string;
    timeElapsed: number;
}

