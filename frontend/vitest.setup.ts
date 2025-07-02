import { expect, vi, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

// Add Jest compatibility
declare global {
  var jest: typeof vi
}
global.jest = vi

// Automatically cleanup after each test
afterEach(() => {
  cleanup()
})

vi.mock('@react-pdf/renderer', async () => {
  return {
    StyleSheet: {
      create: (styles: any) => styles,
    },
    Document: (props: any) => React.createElement(React.Fragment, null, props.children),
    Page: (props: any) => React.createElement(React.Fragment, null, props.children),
    Text: (props: any) => React.createElement(React.Fragment, null, props.children),
    View: (props: any) => React.createElement(React.Fragment, null, props.children),
    PDFViewer: (props: any) => React.createElement(React.Fragment, null, props.children),
    Font: {
      register: vi.fn(),
    },
    renderToString: vi.fn().mockImplementation(async (element) => {
      return '<mock-pdf-content>' + JSON.stringify(element.props) + '</mock-pdf-content>'
    }),
  }
})
