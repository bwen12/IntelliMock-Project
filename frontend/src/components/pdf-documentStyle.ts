import { StyleSheet } from "@react-pdf/renderer";

/**
* Defines the styles for the PDF document used in the interview session report.
* These styles are applied to various elements of the document to ensure a consistent and professional layout.
* 
* @constant {Object} pdfStyles - A collection of style definitions for various elements of the PDF document.
* @property {Object} page - Style for the main page, including padding, font settings, and line height.
* @property {Object} header - Style for the document header, with larger text size, centered alignment, and bold weight.
* @property {Object} section - Style for individual sections, providing spacing between sections.
* @property {Object} sectionTitle - Style for the titles of sections, with bold text, border, and padding for separation.
* @property {Object} row - Defines the layout of rows, allowing horizontal alignment of items.
* @property {Object} label - Style for labels, with bold text and a fixed width to maintain consistent spacing.
* @property {Object} value - Style for the value text beside labels, set to be flexible to fill remaining space.
* @property {Object} bulletItem - Style for bullet points in the feedback sections, including smaller font and padding.
* @property {Object} qaBlock - Style for each Q&A block, providing margin and spacing between entries.
* @property {Object} qaQuestion - (Deprecated) Bolded question line in older format (use qaQuestionTitle / qaQuestionText).
* @property {Object} qaQuestionTitle - Style for the “Question {n}” label, with emphasis and spacing.
* @property {Object} qaQuestionText - Style for the actual question text, unbolded with subtle contrast.
* @property {Object} qaAnswer - Style for displaying the user's answer text.
* @property {Object} qaFeedback - Style for displaying model feedback and explanation.
* @property {Object} qaScore - Style for showing the individual score, italicised and aligned.
* @property {Object} boldLabel - A helper style for bolded inline labels (e.g., "Your Score:").
*/
const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#000",
    lineHeight: 1.4,
  },
  header: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "bold",
    borderBottom: "1pt solid #000",
    paddingBottom: 2,
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    width: 100,
    fontWeight: "bold",
  },
  value: {
    flex: 1,
  },
  bulletItem: {
    fontSize: 10,
    marginBottom: 2,
    paddingLeft: 4,
  },
  qaBlock: {
    marginBottom: 12,
  },
  qaQuestion: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 4,
  },
  qaAnswer: {
    fontSize: 10,
    marginBottom: 4,
  },
  qaFeedback: {
    fontSize: 10,
  },
  qaScore: {
    fontSize: 10,
    marginBottom: 4,
  },
  boldLabel: {
    fontWeight: "bold",
  },
  qaQuestionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 2,
  },
  qaQuestionText: {
    fontSize: 11,
    fontWeight: "normal",
    color: "#333",
    marginBottom: 6,
  },
});

export default pdfStyles;
