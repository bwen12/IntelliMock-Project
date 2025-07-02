/**
 * Represents a chat session
 * 
 * @interface ChatSession
 * @property {string} email - The email address of the user associated with the chat session.
 * @property {string} chatName - The name given to the chat session.
 * @property {string} companyName - The name of the company associated with the chat session.
 * @property {string} jobTitle - The job title discussed during the chat.
 * @property {string} jobDescription - A brief description of the job position discussed.
 * @property {string} context - The context or background for the chat, such as interview details or other relevant information.
 * @property {string} cv - The user's CV or resume associated with the chat session.
 */
export interface ChatSession {
  email: string;
  chatName: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  context: string;
  cv: string;
}

  /**
 * Represents a message sent during a chat session.
 * 
 * @interface ChatMessage
 * @property {string} chatId - The unique identifier for the chat session.
 * @property {string} email - The email address of the participant who sent the message.
 * @property {string} message - The content of the message sent.
 * @property {"user" | "interviewer"} role - The role of the participant who sent the message.
 */
  export interface ChatMessage {
    chatId: string;
    email: string;
    message: string;
    role: "user" | "interviewer";
    isEnd?: boolean;
  }
  
  /**
 * Represents a question asked by the interviewer during the chat session.
 * 
 * @interface InterviewQuestion
 * @property {string} chatId - The unique identifier for the chat session.
 * @property {string} email - The email address of the interviewer.
 * @property {string} message - The content of the interview question.
 * @property {"interviewer"} role - The role of the person who asked the question (interviewer).
 */
  export interface InterviewQuestion {
    chatId: string;
    email: string;
    message: string;
    role: "interviewer";
  }
  
  /**
 * Represents an answer provided by the user during the chat session.
 * 
 * @interface UserAnswer
 * @property {string} chatId - The unique identifier for the chat session.
 * @property {string} email - The email address of the user.
 * @property {string} message - The content of the user's answer.
 * @property {"user"} role - The role of the person providing the answer (user).
 */
  export interface UserAnswer {
    chatId: string;
    email: string;
    message: string;
    role: "user";
  }
  
  /**
 * Represents a review for a specific interview session.
 * 
 * @interface Review
 * @property {string} chatId - The unique identifier for the chat session.
 * @property {string} email - The email address of the user or reviewer.
 * @property {QuestionReview[]} reviews - The list of question reviews for the interview.
 */
  export interface Review {
    chatId: string;
    email: string;
    reviews: QuestionReview[];
  }
  
  /**
 * Represents a review for a specific interview question.
 * 
 * @interface QuestionReview
 * @property {string} question - The interview question being reviewed.
 * @property {string} answer - The user's answer to the question.
 * @property {string} strengths - The strengths of the answer.
 * @property {string} weaknesses - The weaknesses of the answer.
 * @property {string} exemplar - An exemplar or example answer for comparison.
 * @property {string} rating - A rating for the answer, typically on a numerical or descriptive scale.
 */
  export interface QuestionReview {
    question: string;
    answer: string;
    strengths: string;
    weaknesses: string;
    exemplar: string;
    rating: string;
  }
  
  /**
 * Represents a summary of an interview session with a score.
 * 
 * @interface Summary
 * @property {string} chatId - The unique identifier for the chat session.
 * @property {string} email - The email address of the user who created the summary.
 * @property {string} summary - A textual summary of the interview session.
 * @property {number} score - A numerical score representing the evaluation of the interview session.
 */
  export interface Summary {
    chatId: string;
    email: string;
    summary: string;
    score: number;
  }
  