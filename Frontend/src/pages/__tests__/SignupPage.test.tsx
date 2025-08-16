import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SignupPage from '../SignupPage';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock AuthContext
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

const renderSignupPage = () => {
  return render(
    <BrowserRouter>
      <SignupPage />
    </BrowserRouter>,
  );
};

describe('SignupPage Error Scenarios', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // 필요한 모듈들을 동적으로 import
    const { useAuth } = await import('../../contexts/AuthContext');
    const { useNavigate } = await import('react-router-dom');

    vi.mocked(useAuth).mockReturnValue({
      signup: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: false,
      isLoading: false,
    } as ReturnType<typeof useAuth>);

    vi.mocked(useNavigate).mockReturnValue(vi.fn());
  });

  describe('Input Validation Errors', () => {
    it('should show error toast when username is empty', async () => {
      const { toast } = await import('react-hot-toast');

      renderSignupPage();

      // 폼 제출 (submit 이벤트 발생)
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          '모든 필수 항목을 입력해주세요.',
        );
      });
    });

    it('should show error toast when password is empty', async () => {
      const { toast } = await import('react-hot-toast');

      renderSignupPage();

      const usernameInput = screen.getByPlaceholderText('아이디를 입력하세요');
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });

      // 폼 제출 (submit 이벤트 발생)
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          '모든 필수 항목을 입력해주세요.',
        );
      });
    });

    it('should show error toast when confirm password is empty', async () => {
      const { toast } = await import('react-hot-toast');

      renderSignupPage();

      const usernameInput = screen.getByPlaceholderText('아이디를 입력하세요');
      const passwordInput = screen.getByPlaceholderText(
        '비밀번호를 입력하세요 (최소 6자)',
      );

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      // 폼 제출 (submit 이벤트 발생)
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          '모든 필수 항목을 입력해주세요.',
        );
      });
    });

    it('should show error toast when passwords do not match', async () => {
      const { toast } = await import('react-hot-toast');

      renderSignupPage();

      const usernameInput = screen.getByPlaceholderText('아이디를 입력하세요');
      const passwordInput = screen.getByPlaceholderText(
        '비밀번호를 입력하세요 (최소 6자)',
      );
      const confirmPasswordInput =
        screen.getByPlaceholderText('비밀번호를 다시 입력하세요');

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'different123' },
      });

      const signupButton = screen.getByRole('button', { name: '회원가입' });
      fireEvent.click(signupButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          '비밀번호가 일치하지 않습니다.',
        );
      });
    });

    it('should show error toast when password is too short', async () => {
      const { toast } = await import('react-hot-toast');

      renderSignupPage();

      const usernameInput = screen.getByPlaceholderText('아이디를 입력하세요');
      const passwordInput = screen.getByPlaceholderText(
        '비밀번호를 입력하세요 (최소 6자)',
      );
      const confirmPasswordInput =
        screen.getByPlaceholderText('비밀번호를 다시 입력하세요');

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: '123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: '123' } });

      const signupButton = screen.getByRole('button', { name: '회원가입' });
      fireEvent.click(signupButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          '비밀번호는 최소 6자 이상이어야 합니다.',
        );
      });
    });

    it('should show error toast when username is only whitespace', async () => {
      const { toast } = await import('react-hot-toast');

      renderSignupPage();

      const usernameInput = screen.getByPlaceholderText('아이디를 입력하세요');
      const passwordInput = screen.getByPlaceholderText(
        '비밀번호를 입력하세요 (최소 6자)',
      );
      const confirmPasswordInput =
        screen.getByPlaceholderText('비밀번호를 다시 입력하세요');

      fireEvent.change(usernameInput, { target: { value: '   ' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'password123' },
      });

      const signupButton = screen.getByRole('button', { name: '회원가입' });
      fireEvent.click(signupButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          '모든 필수 항목을 입력해주세요.',
        );
      });
    });
  });

  describe('API Error Scenarios', () => {
    it('should show error toast when signup API fails', async () => {
      const { toast } = await import('react-hot-toast');
      const { useAuth } = await import('../../contexts/AuthContext');

      const mockSignup = vi.fn();
      vi.mocked(useAuth).mockReturnValue({
        signup: mockSignup,
        login: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: false,
        isLoading: false,
      } as ReturnType<typeof useAuth>);

      mockSignup.mockResolvedValue(false);

      renderSignupPage();

      const usernameInput = screen.getByPlaceholderText('아이디를 입력하세요');
      const passwordInput = screen.getByPlaceholderText(
        '비밀번호를 입력하세요 (최소 6자)',
      );
      const confirmPasswordInput =
        screen.getByPlaceholderText('비밀번호를 다시 입력하세요');

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'password123' },
      });

      const signupButton = screen.getByRole('button', { name: '회원가입' });
      fireEvent.click(signupButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          '회원가입에 실패했습니다. 다시 시도해주세요.',
        );
      });
    });

    it('should show error toast when signup API throws specific error', async () => {
      const { toast } = await import('react-hot-toast');
      const { useAuth } = await import('../../contexts/AuthContext');

      const errorMessage = 'Username already exists';
      const mockSignup = vi.fn();
      vi.mocked(useAuth).mockReturnValue({
        signup: mockSignup,
        login: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: false,
        isLoading: false,
      } as ReturnType<typeof useAuth>);

      mockSignup.mockRejectedValue(new Error(errorMessage));

      renderSignupPage();

      const usernameInput = screen.getByPlaceholderText('아이디를 입력하세요');
      const passwordInput = screen.getByPlaceholderText(
        '비밀번호를 입력하세요 (최소 6자)',
      );
      const confirmPasswordInput =
        screen.getByPlaceholderText('비밀번호를 다시 입력하세요');

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'password123' },
      });

      const signupButton = screen.getByRole('button', { name: '회원가입' });
      fireEvent.click(signupButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Username already exists');
      });
    });

    it('should show generic error toast when signup API throws unknown error', async () => {
      const { toast } = await import('react-hot-toast');
      const { useAuth } = await import('../../contexts/AuthContext');

      const mockSignup = vi.fn();
      vi.mocked(useAuth).mockReturnValue({
        signup: mockSignup,
        login: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: false,
        isLoading: false,
      } as ReturnType<typeof useAuth>);

      mockSignup.mockRejectedValue('Unknown error');

      renderSignupPage();

      const usernameInput = screen.getByPlaceholderText('아이디를 입력하세요');
      const passwordInput = screen.getByPlaceholderText(
        '비밀번호를 입력하세요 (최소 6자)',
      );
      const confirmPasswordInput =
        screen.getByPlaceholderText('비밀번호를 다시 입력하세요');

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'password123' },
      });

      const signupButton = screen.getByRole('button', { name: '회원가입' });
      fireEvent.click(signupButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          '회원가입 중 오류가 발생했습니다.',
        );
      });
    });
  });

  describe('Loading State Errors', () => {
    it('should disable signup button when loading', async () => {
      const { useAuth } = await import('../../contexts/AuthContext');
      const mockSignup = vi.fn();
      vi.mocked(useAuth).mockReturnValue({
        signup: mockSignup,
        login: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: false,
        isLoading: false,
      } as ReturnType<typeof useAuth>);

      renderSignupPage();

      // 로딩 상태를 시뮬레이션하기 위해 signup 함수가 Promise를 반환하도록 설정
      mockSignup.mockImplementation(() => new Promise(() => {}));

      // 폼을 제출하여 로딩 상태를 활성화
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();

      // 필수 필드 입력
      const usernameInput = screen.getByPlaceholderText('아이디를 입력하세요');
      const passwordInput = screen.getByPlaceholderText(
        '비밀번호를 입력하세요 (최소 6자)',
      );
      const confirmPasswordInput =
        screen.getByPlaceholderText('비밀번호를 다시 입력하세요');

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'password123' },
      });

      // 폼 제출
      fireEvent.submit(form!);

      // 로딩 상태에서는 버튼이 비활성화되어야 함
      await waitFor(() => {
        const signupButton = screen.getByText('가입 중...').closest('button');
        expect(signupButton).toBeDisabled();
      });
    });

    it('should show loading text when loading', async () => {
      const { useAuth } = await import('../../contexts/AuthContext');
      const mockSignup = vi.fn();
      vi.mocked(useAuth).mockReturnValue({
        signup: mockSignup,
        login: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: false,
        isLoading: false,
      } as ReturnType<typeof useAuth>);

      renderSignupPage();

      // 로딩 상태를 시뮬레이션하기 위해 signup 함수가 Promise를 반환하도록 설정
      mockSignup.mockImplementation(() => new Promise(() => {}));

      // 폼을 제출하여 로딩 상태를 활성화
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();

      // 필수 필드 입력
      const usernameInput = screen.getByPlaceholderText('아이디를 입력하세요');
      const passwordInput = screen.getByPlaceholderText(
        '비밀번호를 입력하세요 (최소 6자)',
      );
      const confirmPasswordInput =
        screen.getByPlaceholderText('비밀번호를 다시 입력하세요');

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'password123' },
      });

      // 폼 제출
      fireEvent.submit(form!);

      // 로딩 상태에서는 '가입 중...' 텍스트가 표시되어야 함
      await waitFor(() => {
        expect(screen.getByText('가입 중...')).toBeInTheDocument();
      });
    });
  });

  describe('Success Scenarios', () => {
    it('should show success toast and navigate when signup succeeds', async () => {
      const { toast } = await import('react-hot-toast');
      const { useAuth } = await import('../../contexts/AuthContext');
      const { useNavigate } = await import('react-router-dom');

      const mockSignup = vi.fn();
      vi.mocked(useAuth).mockReturnValue({
        signup: mockSignup,
        login: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: false,
        isLoading: false,
      } as ReturnType<typeof useAuth>);

      mockSignup.mockResolvedValue(true);

      renderSignupPage();

      const usernameInput = screen.getByPlaceholderText('아이디를 입력하세요');
      const passwordInput = screen.getByPlaceholderText(
        '비밀번호를 입력하세요 (최소 6자)',
      );
      const confirmPasswordInput =
        screen.getByPlaceholderText('비밀번호를 다시 입력하세요');

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'password123' },
      });

      const signupButton = screen.getByRole('button', { name: '회원가입' });
      fireEvent.click(signupButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          '회원가입이 완료되었습니다! 자동으로 로그인되었습니다.',
        );
        // useNavigate가 호출되었는지 확인
        expect(vi.mocked(useNavigate)).toHaveBeenCalled();
      });
    });

    it('should handle email input correctly', async () => {
      const { toast } = await import('react-hot-toast');
      const { useAuth } = await import('../../contexts/AuthContext');

      const mockSignup = vi.fn();
      vi.mocked(useAuth).mockReturnValue({
        signup: mockSignup,
        login: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: false,
        isLoading: false,
      } as ReturnType<typeof useAuth>);

      mockSignup.mockResolvedValue(true);

      renderSignupPage();

      const usernameInput = screen.getByPlaceholderText('아이디를 입력하세요');
      const emailInput =
        screen.getByPlaceholderText('이메일을 입력하세요 (선택사항)');
      const passwordInput = screen.getByPlaceholderText(
        '비밀번호를 입력하세요 (최소 6자)',
      );
      const confirmPasswordInput =
        screen.getByPlaceholderText('비밀번호를 다시 입력하세요');

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'password123' },
      });

      const signupButton = screen.getByRole('button', { name: '회원가입' });
      fireEvent.click(signupButton);

      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalledWith(
          'testuser',
          'password123',
          'test@example.com',
        );
        expect(toast.success).toHaveBeenCalledWith(
          '회원가입이 완료되었습니다! 자동으로 로그인되었습니다.',
        );
      });
    });
  });
});
