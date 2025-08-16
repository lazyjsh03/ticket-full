import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock API services
vi.mock('../../api/services', () => ({
  authAPI: {
    login: vi.fn(),
    signup: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Test component to access context
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="isAuthenticated">{auth.isAuthenticated.toString()}</div>
      <div data-testid="isLoading">{auth.isLoading.toString()}</div>
      <button onClick={() => auth.login('test', 'password')}>Login</button>
      <button onClick={() => auth.signup('test', 'password')}>Signup</button>
      <button onClick={auth.logout}>Logout</button>
    </div>
  );
};

const renderAuthProvider = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    </BrowserRouter>,
  );
};

describe('AuthContext Basic Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default state', async () => {
      renderAuthProvider();

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent(
          'false',
        );
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });
    });

    it('should handle missing tokens gracefully', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      renderAuthProvider();

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent(
          'false',
        );
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });
    });
  });

  describe('Basic Login Flow', () => {
    it('should handle successful login', async () => {
      const { authAPI } = await import('../../api/services');
      vi.mocked(authAPI.login).mockResolvedValue({
        access: 'access-token',
        refresh: 'refresh-token',
        user: { id: 1, username: 'testuser' },
      });

      renderAuthProvider();

      const loginButton = screen.getByText('Login');
      loginButton.click();

      await waitFor(() => {
        expect(vi.mocked(authAPI.login)).toHaveBeenCalledWith({
          username: 'test',
          password: 'password',
        });
      });
    });

    it('should handle login failure', async () => {
      const { authAPI } = await import('../../api/services');
      vi.mocked(authAPI.login).mockRejectedValue(new Error('Login failed'));

      renderAuthProvider();

      const loginButton = screen.getByText('Login');
      loginButton.click();

      await waitFor(() => {
        expect(vi.mocked(authAPI.login)).toHaveBeenCalledWith({
          username: 'test',
          password: 'password',
        });
      });
    });
  });

  describe('Basic Signup Flow', () => {
    it('should handle successful signup', async () => {
      const { authAPI } = await import('../../api/services');
      vi.mocked(authAPI.signup).mockResolvedValue({
        access: 'access-token',
        refresh: 'refresh-token',
        user: { id: 1, username: 'testuser' },
      });
      vi.mocked(authAPI.login).mockResolvedValue({
        access: 'access-token',
        refresh: 'refresh-token',
        user: { id: 1, username: 'testuser' },
      });

      renderAuthProvider();

      const signupButton = screen.getByText('Signup');
      signupButton.click();

      await waitFor(() => {
        expect(vi.mocked(authAPI.signup)).toHaveBeenCalledWith({
          username: 'test',
          password: 'password',
          email: undefined,
        });
      });
    });

    it('should handle signup failure', async () => {
      const { authAPI } = await import('../../api/services');
      vi.mocked(authAPI.signup).mockRejectedValue(new Error('Signup failed'));

      renderAuthProvider();

      const signupButton = screen.getByText('Signup');
      signupButton.click();

      await waitFor(() => {
        expect(vi.mocked(authAPI.signup)).toHaveBeenCalledWith({
          username: 'test',
          password: 'password',
          email: undefined,
        });
      });
    });
  });

  describe('Logout', () => {
    it('should handle logout', () => {
      renderAuthProvider();

      const logoutButton = screen.getByText('Logout');

      // Should not crash
      expect(() => {
        logoutButton.click();
      }).not.toThrow();
    });
  });
});
