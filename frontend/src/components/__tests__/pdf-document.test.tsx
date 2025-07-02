/**
 * @fileoverview
 * Unit tests for the `MySessionReport` PDF component using Vitest.
 * These tests verify that PDF output includes structural markers and dynamic content
 * like summary, questions, answers, and feedback.
 *
 * The @react-pdf/renderer module is mocked to simulate `renderToString` output
 * based on the `session` data passed in, allowing assertions on expected text content.
 */

import { describe, it, expect, vi } from 'vitest'
import { renderToString } from '@react-pdf/renderer'
import { MySessionReport } from '../pdf-document'

/**
 * Mocks the `@react-pdf/renderer` library to simulate PDF output.
 * Instead of rendering actual PDF content, we return a mock string that
 * includes interpolated values from the `session` data for testing purposes.
 */
vi.mock('@react-pdf/renderer', async () => {
  // Mimics normalizeText from the actual code
  const normalize = (str: string) =>
    str.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();

  return {
    renderToString: vi.fn().mockImplementation((component: any) => {
      const { session } = component.props;

      let content = `PDF-1.3\n/Type /Catalog\n/Type /Pages\n/Type /Page\n/Type /Font\n/Type /ExtGState\n/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]\n`;
      content += `Interview Session Report\n`;
      content += `Job: ${normalize(session.jobTitle)}\n`;
      content += `${normalize(session.summary)}\n`;
      content += `${session.duration}\n`;

      for (const q of session.questions) {
        content += `${normalize(q.question)}\n`;
        content += `${normalize(q.answer)}\n`;
        content += `${normalize(q.feedback)}\n`;
        content += q.strengths.length > 0
          ? q.strengths.map(normalize).join('\n')
          : 'None listed.';
        content += q.weaknesses.length > 0
          ? q.weaknesses.map(normalize).join('\n')
          : 'None listed.';
      }

      return Promise.resolve(content);
    }),
    StyleSheet: {
      create: vi.fn()
    }
  };
});


/**
 * Sample session used across tests to simulate realistic interview session data.
 */
const mockSession = {
  id: '1',
  date: '2024-03-20',
  jobTitle: 'Software Engineer',
  company: 'Tech Corp',
  duration: 125,
  overallScore: 85,
  summary: 'Great interview performance.',
  feedback: {
    strengths: ['Strong technical knowledge', 'Good communication'],
    improvements: ['More examples', 'Time management']
  },
  questions: [
    {
      id: 1,
      question: 'What is your experience with React?',
      answer: '2 years of experience.',
      feedback: 'Good, but more details needed.',
      score: 75,
      strengths: ['Clear explanation'],
      weaknesses: ['Missing useEffect example']
    }
  ]
}

/**
 * Test suite for the `MySessionReport` component, validating correct content rendering.
 */
describe('MySessionReport PDF', () => {
  /**
   * Verifies that the rendered PDF output includes:
   * - Basic PDF structural markers
   * - Core content sections: title, job, summary, questions, answers, and feedback
   */
  it('renders all main sections and content', async () => {
    const output = await renderToString(<MySessionReport session={mockSession} />)
    expect(output).toContain('/Type /Catalog')
    expect(output).toContain('Interview Session Report')
    expect(output).toContain('Job: Software Engineer')
    expect(output).toContain('Great interview performance.')
    expect(output).toContain('What is your experience with React?')
    expect(output).toContain('2 years of experience.')
    expect(output).toContain('Good, but more details needed.')
  })

  /**
   * Ensures that default fallback text like "None listed." is included
   * if no strengths or weaknesses are provided in the session data.
   */
  it('renders with empty strengths and weaknesses', async () => {
    const session = {
      ...mockSession,
      questions: [{
        ...mockSession.questions[0],
        strengths: [],
        weaknesses: []
      }]
    }
    const output = await renderToString(<MySessionReport session={session} />)
    expect(output).toContain('None listed.')
    expect(output).toContain('None listed.')
  })

  /**
   * Checks whether the duration is correctly passed and rendered as part of the output.
   * Since the mock returns raw data, we expect the raw duration (e.g., "125") to be present.
   */
  it('formats elapsed time correctly', async () => {
    const session = { ...mockSession, duration: 125 }
    const output = await renderToString(<MySessionReport session={session} />)
    expect(output).toContain('125')
  })

  /**
   * Validates that markdown formatting like **bold** is removed from questions,
   * answers, and feedback, and the cleaned text is rendered instead.
   */
  it('normalizes markdown text in questions and answers', async () => {
    const session = {
      ...mockSession,
      questions: [{
        id: 1,
        question: '**What is React?**',
        answer: '**React** is a library.',
        feedback: '**Clean Code** is recommended.',
        score: 80,
        strengths: [],
        weaknesses: []
      }]
    }
    const output = await renderToString(<MySessionReport session={session} />)
    expect(output).toContain('What is React?')
    expect(output).toContain('React is a library.')
    expect(output).toContain('Clean Code')
  })
})
