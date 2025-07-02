import { Document, Page, Text, View } from "@react-pdf/renderer";
import pdfStyles from "./pdf-documentStyle";
import { PDFSessionData } from "@/lib/formatSessionForPDF";

/**
 * MySessionReport generates a PDF document for an interview session report.
 * The report includes the following sections:
 * - **Overview**: Job title, company, date, duration, and overall score.
 * - **Summary of Your Interview**: A summary of the interview session.
 * - **Feedback**: Lists strengths and areas for improvement.
 * - **Questions & Answers**: Displays individual questions, the user's answer, the model's answer, and feedback, including the user's score.
 * 
 * **Props**:
 * - `session`: An object containing session data (PDFSessionData), which includes job title, company, date, duration, overall score, feedback, and Q&A.
 * 
 * **Helper Functions**:
 * - `cleanList`: Cleans up a list of items by removing any markdown syntax and trimming whitespace.
 * - `normalizeText`: Removes markdown syntax and trims the text.
 * - `formatElapsedTime`: Converts time in seconds into a formatted string (MM:SS).
 * 
 * **Features**:
 * - Converts session data into a well-structured PDF report.
 * - Handles markdown formatting for feedback sections (strengths and areas for improvement).
 * - Automatically formats the date and time, making it suitable for inclusion in reports.
 */

/**
 * Normalizes the text by removing asterisks and extra spaces.
 * 
 * @param {string} str - The string to be normalized.
 * @returns {string} - The normalized string.
 */
function normalizeText(str: string): string {
  return str.replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Formats the elapsed time in seconds into a string in the format "MM:SS".
 * 
 * @param {number} seconds - The elapsed time in seconds.
 * @returns {string} - The formatted time string.
 */
function formatElapsedTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

/**
 * MySessionReport component generates a PDF report for a given interview session.
 * It includes an overview, summary, feedback, and Q&A sections.
 * 
 * @param {Object} session - The interview session data to be included in the report.
 * @returns {Document} - A PDF document containing the interview session report.
 */
export function MySessionReport({ session }: { session: PDFSessionData }) {
  return (
    <Document>
      <Page style={pdfStyles.page}>
        <Text style={pdfStyles.header}>Interview Session Report</Text>

        {/* Overview */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Overview</Text>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>Job:</Text>
            <Text style={pdfStyles.value}>{session.jobTitle} @ {session.company}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>Date:</Text>
            <Text style={pdfStyles.value}>{new Date(session.date).toLocaleString()}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>Duration:</Text>
            <Text style={pdfStyles.value}>{formatElapsedTime(session.duration)}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>Overall Score:</Text>
            <Text style={pdfStyles.value}>{session.overallScore}%</Text>
          </View>
        </View>

        {/* Summary */}
        <View style={[pdfStyles.section, { marginBottom: 24 }]} wrap={false}>
          <Text style={pdfStyles.sectionTitle}>Summary of Your Interview</Text>
          <Text style={pdfStyles.value}>{normalizeText(session.summary)}</Text>
        </View>

        {/* Questions */}
        <View style={pdfStyles.section} break>
          <Text style={pdfStyles.sectionTitle}>Questions & Answers</Text>
          {session.questions.map((q, i) => (
            <View key={q.id} style={pdfStyles.qaBlock}>
              {/* Question Number Header */}
              <Text style={pdfStyles.qaQuestionTitle}>Question {i + 1}</Text>

              {/* Actual Question Text */}
              <Text style={pdfStyles.qaQuestionText}>{normalizeText(q.question)}</Text>

              {/* Score */}
              <Text style={pdfStyles.qaScore}>
                <Text style={pdfStyles.boldLabel}>Your Score: </Text>
                {q.score}%
              </Text>

              {/* Answer */}
              <Text style={pdfStyles.qaAnswer}>
                <Text style={pdfStyles.boldLabel}>Your Answer: </Text>
                {normalizeText(q.answer)}
              </Text>

              {/* Feedback */}
              <Text style={pdfStyles.qaFeedback}>
                <Text style={pdfStyles.boldLabel}>Model Answer: </Text>
                {normalizeText(q.feedback)}
              </Text>

              {/* Strengths */}
              <Text style={pdfStyles.qaFeedback}>
                <Text style={pdfStyles.boldLabel}>Areas of Strength:</Text>
              </Text>
              {q.strengths.length > 0 ? (
                q.strengths.map((point, idx) => (
                  <Text key={`s-${idx}`} style={pdfStyles.bulletItem}>
                    • {normalizeText(point)}
                  </Text>
                ))
              ) : (
                <Text style={pdfStyles.value}>None listed.</Text>
              )}

              {/* Weaknesses */}
              <Text style={[pdfStyles.qaFeedback, { marginTop: 6 }]}>
                <Text style={pdfStyles.boldLabel}>Areas for Improvement:</Text>
              </Text>
              {q.weaknesses.length > 0 ? (
                q.weaknesses.map((point, idx) => (
                  <Text key={`w-${idx}`} style={pdfStyles.bulletItem}>
                    • {normalizeText(point)}
                  </Text>
                ))
              ) : (
                <Text style={pdfStyles.value}>None listed.</Text>
              )}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}