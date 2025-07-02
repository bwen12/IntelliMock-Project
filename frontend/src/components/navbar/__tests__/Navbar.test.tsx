import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

/**
 * Renders the Navbar component inside a React Router context.
 * Used to test UI navigation behavior with routing.
 */
const renderNavbar = async () => {
  const { default: Navbar } = await import('../Navbar')
  let result
  await act(async () => {
    result = render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    )
  })
  return result
}

/**
 * Dynamically mocks the authentication context based on user login state.
 * Used to test Navbar behavior for both authenticated and unauthenticated views.
 *
 * @param authenticated - Whether to mock a logged-in user or not
 */
function mockAuthContext(authenticated: boolean) {
  vi.doMock('../../../contexts/AuthProvider', () => ({
    useAuthContext: () => ({
      user: authenticated
        ? {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@intellimock.ai',
        }
        : null,
      setUser: vi.fn(),
    }),
  }))
}

/**
 * Mocks the mobile menu component with a simple toggleable button for test isolation.
 */
vi.mock('../MobileMenu', () => ({
  default: ({ isOpen, onClose }: any) => (
    <>
      {isOpen && <button onClick={onClose}>Close Menu</button>}
    </>
  )
}))

/**
 * Mocks the logout service to avoid backend dependencies during logout tests.
 */
vi.mock('../../../services/authService', () => ({
  logout: vi.fn(),
}))

/**
 * Reset mocked modules and spies before each test run to prevent state leakage.
 */
beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
})

/**
 * Test suite: Navbar behavior when the user is NOT logged in (unauthenticated).
 */
describe('Navbar - unauthenticated', () => {
  beforeEach(() => {
    mockAuthContext(false)
  })

  test('renders logo and brand name', async () => {
    await renderNavbar()
    expect(screen.getByAltText('IntelliMock Logo')).toBeInTheDocument()
    expect(screen.getByText('IntelliMock')).toBeInTheDocument()
  })

  test('renders mobile menu toggle button', async () => {
    await renderNavbar()
    expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument()
  })

  test('toggles mobile menu open and close', async () => {
    await renderNavbar()
    const toggle = screen.getByLabelText('Toggle menu')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(screen.getByText('Close Menu'))
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  test('renders only public navigation links', async () => {
    await renderNavbar()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.queryByText('Summary')).not.toBeInTheDocument()
  })

  test('renders Sign in button when user is not authenticated', async () => {
    await renderNavbar()
    expect(screen.getByText('Sign in')).toBeInTheDocument()
  })
})

/**
 * Test suite: Navbar behavior when the user IS logged in (authenticated).
 */
describe('Navbar - authenticated', () => {
  beforeEach(() => {
    mockAuthContext(true)
  })

  test('renders protected navigation links', async () => {
    await renderNavbar()
    expect(screen.getByText('Mock Interview')).toBeInTheDocument()
    expect(screen.getByText('Summary')).toBeInTheDocument()
  })

  test('renders user avatar and profile dropdown', async () => {
    await renderNavbar()
    const avatar = screen.getByLabelText('User menu')
    expect(avatar).toBeInTheDocument()

    fireEvent.click(avatar)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@intellimock.ai')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  test('fallback profile picture appears on image error', async () => {
    await renderNavbar()
    const img = screen.getByAltText('John Doe') as HTMLImageElement
    fireEvent.error(img)
    expect(img.src).toContain('dicebear.com/7.x/initials/svg')
  })

  test('closes user menu on outside click', async () => {
    await renderNavbar()
    const avatar = screen.getByLabelText('User menu')
    fireEvent.click(avatar)

    // Simulate click outside the dropdown
    fireEvent.mouseDown(document.body)

    expect(screen.queryByText('Logout')).not.toBeInTheDocument()
  })
})
