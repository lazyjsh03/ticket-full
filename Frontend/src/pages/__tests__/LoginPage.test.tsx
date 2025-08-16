import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import LoginPage from '../LoginPage';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock AuthContext
vi.mock('../../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../../contexts/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn(() => ({ state: { from: { pathname: '/' } } })),
  };
});

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </BrowserRouter>,
  );
};

describe('LoginPage Basic Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('should render login form', async () => {
      const { useAuth } = await import('../../contexts/AuthContext');

      vi.mocked(useAuth).mockReturnValue({
        login: vi.fn(),
        signup: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: false,
        isLoading: false,
      } as ReturnType<typeof useAuth>);

      renderLoginPage();

      expect(
        screen.getByPlaceholderText('아이디를 입력하세요'),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('비밀번호를 입력하세요'),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: '로그인' }),
      ).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call login function with form data', async () => {
      const { useAuth } = await import('../../contexts/AuthContext');

      const mockLogin = vi.fn().mockResolvedValue(true);
      vi.mocked(useAuth).mockReturnValue({
        login: mockLogin,
        signup: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: false,
        isLoading: false,
      } as ReturnType<typeof useAuth>);

      renderLoginPage();

      const usernameInput = screen.getByPlaceholderText('아이디를 입력하세요');
      const passwordInput =
        screen.getByPlaceholderText('비밀번호를 입력하세요');

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const loginButton = screen.getByRole('button', { name: '로그인' });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
      });
    });

    it('should handle login failure', async () => {
      const { toast } = await import('react-hot-toast');
      const { useAuth } = await import('../../contexts/AuthContext');

      const mockLogin = vi.fn().mockResolvedValue(false);
      vi.mocked(useAuth).mockReturnValue({
        login: mockLogin,
        signup: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: false,
        isLoading: false,
      } as ReturnType<typeof useAuth>);

      renderLoginPage();

      const usernameInput = screen.getByPlaceholderText('아이디를 입력하세요');
      const passwordInput =
        screen.getByPlaceholderText('비밀번호를 입력하세요');

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const loginButton = screen.getByRole('button', { name: '로그인' });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
        expect(toast.error).toHaveBeenCalledWith(
          '아이디 또는 비밀번호가 올바르지 않습니다.',
        );
      });
    });
  });
});
