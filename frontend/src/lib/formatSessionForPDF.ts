import { Summary, Review as ReviewData } from "@/types/interview";
import { Chat } from "@/types/chat";

/**
 * Cleans a list of items by removing unwanted characters and trimming each item.
 * 
 * @param {string[]} items - The list of strings to be cleaned.
 * @returns {string[]} - The cleaned list of strings.
 */
function cleanList(items: string[]): string[] {
  return items
    .map(item => item.replace(/\*\*|^- */g, "").trim())
    .filter(Boolean);
}


/**
 * Normalizes a string by removing unwanted characters and trimming whitespace.
 * 
 * @param {string} str - The string to be normalized.
 * @returns {string} - The normalized string.
 */
function normalizeText(str: string): string {

  return str
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Interface representing the data structure for a session to be formatted for PDF output.
 */
export interface PDFSessionData {
  id: string;
  date: string;
  jobTitle: string;
  company: string;
  duration: number;
  overallScore: number;
  summary: string;
  feedback: {
    strengths: string[];
    improvements: string[];
  };
  questions: {
    id: number;
    question: string;
    answer: string;
    feedback: string;
    score: number;
    strengths: string[];
    weaknesses: string[];
  }[];
}

/**
 * Formats interview session data into a structure suitable for generating a PDF report.
 * 
 * This function takes the summary, review data, and user chat data, normalizes and cleans up the information,
 * and returns a structured data format that can be used to generate a PDF report of the session.
 * 
 * @param {Summary | null} summary - The summary data of the session.
 * @param {ReviewData | null} reviewData - The review data containing strengths, weaknesses, and ratings.
 * @param {Chat | null} userChat - The chat data associated with the user session.
 * 
 * @returns {PDFSessionData | null} - The formatted session data for PDF generation or null if data is incomplete.
 */
export function formatSessionForPDF(
  summary: Summary | null,
  reviewData: ReviewData | null,
  userChat: Chat | null
): PDFSessionData | null {
  if (!summary || !reviewData || !userChat) return null;
  const reviews = reviewData.reviews;

  const rawStrengths = reviews.flatMap(r =>
    Array.isArray(r.strengths) ? r.strengths : r.strengths?.split("\n") || []
  );
  const rawImprovements = reviews.flatMap(r =>
    Array.isArray(r.weaknesses) ? r.weaknesses : r.weaknesses?.split("\n") || []
  );

  const cleanedSummary = normalizeText(
    summary.summary.replace(/^\*\*Summary:\*\*\s*/, "")
  );

  return {
    id: userChat.id,
    date: userChat.createdDate,
    jobTitle: userChat.jobTitle,
    company: userChat.companyName,
    duration: userChat.timeElapsed,
    overallScore: summary.score * 10,
    summary: cleanedSummary,
    feedback: {
      strengths: cleanList(rawStrengths).map(normalizeText),
      improvements: cleanList(rawImprovements).map(normalizeText),
    },

    questions: reviews.map((r, idx) => {
      const rawRating = parseFloat(r.rating ?? "0");
      const score = isNaN(rawRating)
        ? 0
        : Math.min(Math.max(rawRating * 10, 0), 100);

      const qStrengths = cleanList(
        Array.isArray(r.strengths) ? r.strengths : r.strengths?.split("\n") || []
      ).map(normalizeText);

      const qWeaknesses = cleanList(
        Array.isArray(r.weaknesses) ? r.weaknesses : r.weaknesses?.split("\n") || []
      ).map(normalizeText);

      return {
        id: idx + 1,
        question: normalizeText(r.question),
        answer: normalizeText(r.answer),
        feedback: normalizeText(r.exemplar ?? ""),
        score,
        strengths: qStrengths,
        weaknesses: qWeaknesses,
      };
    }),
  };
}
