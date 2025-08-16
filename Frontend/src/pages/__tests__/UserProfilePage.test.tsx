import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import UserProfilePage from '../UserProfilePage';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock API services
vi.mock('../../api/services', () => ({
  seatsAPI: {
    getUserReservations: vi.fn(),
    cancelReservation: vi.fn(),
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

// Mock window.confirm
const mockConfirm = vi.fn();
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: mockConfirm,
});

const renderUserProfilePage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <UserProfilePage />
      </AuthProvider>
    </BrowserRouter>,
  );
};

describe('UserProfilePage Error Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Reservation Fetch Errors', () => {
    it('should show error toast when fetching reservations fails', async () => {
      const { toast } = await import('react-hot-toast');
      const { useAuth } = await import('../../contexts/AuthContext');
      const { seatsAPI } = await import('../../api/services');

      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn(),
        login: vi.fn(),
        signup: vi.fn(),
      } as ReturnType<typeof useAuth>);

      vi.mocked(seatsAPI.getUserReservations).mockRejectedValue(
        new Error('Failed to fetch reservations'),
      );

      renderUserProfilePage();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to fetch reservations',
        );
      });
    });

    it('should show error toast when API throws unknown error', async () => {
      const { toast } = await import('react-hot-toast');
      const { useAuth } = await import('../../contexts/AuthContext');
      const { seatsAPI } = await import('../../api/services');

      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn(),
        login: vi.fn(),
        signup: vi.fn(),
      } as ReturnType<typeof useAuth>);

      vi.mocked(seatsAPI.getUserReservations).mockRejectedValue(
        'Unknown error',
      );

      renderUserProfilePage();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          '예약 정보를 불러오는데 실패했습니다. 다시 시도해주세요.',
        );
      });
    });

    it('should show error toast when network error occurs', async () => {
      const { toast } = await import('react-hot-toast');
      const { useAuth } = await import('../../contexts/AuthContext');
      const { seatsAPI } = await import('../../api/services');

      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn(),
        login: vi.fn(),
        signup: vi.fn(),
      } as ReturnType<typeof useAuth>);

      vi.mocked(seatsAPI.getUserReservations).mockRejectedValue(
        new Error('Network Error'),
      );

      renderUserProfilePage();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Network Error');
      });
    });
  });

  describe('Reservation Cancellation Errors', () => {
    it('should show error toast when cancellation API fails', async () => {
      const { toast } = await import('react-hot-toast');
      const { useAuth } = await import('../../contexts/AuthContext');
      const { seatsAPI } = await import('../../api/services');

      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn(),
        login: vi.fn(),
        signup: vi.fn(),
      } as ReturnType<typeof useAuth>);

      // Mock successful fetch but failed cancellation
      vi.mocked(seatsAPI.getUserReservations).mockResolvedValue([
        { id: 1, seat_number: 5, is_reserved: true, row: 2, column: 2 },
      ]);

      vi.mocked(seatsAPI.cancelReservation).mockRejectedValue(
        new Error('Cancellation failed'),
      );

      mockConfirm.mockReturnValue(true);

      renderUserProfilePage();

      await waitFor(() => {
        expect(screen.getByText('5번')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /예매 취소/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Cancellation failed');
      });
    });

    it('should show error toast when cancellation throws unknown error', async () => {
      const { toast } = await import('react-hot-toast');
      const { useAuth } = await import('../../contexts/AuthContext');
      const { seatsAPI } = await import('../../api/services');

      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn(),
        login: vi.fn(),
        signup: vi.fn(),
      } as ReturnType<typeof useAuth>);

      vi.mocked(seatsAPI.getUserReservations).mockResolvedValue([
        { id: 1, seat_number: 5, is_reserved: true, row: 2, column: 2 },
      ]);

      vi.mocked(seatsAPI.cancelReservation).mockRejectedValue('Unknown error');

      mockConfirm.mockReturnValue(true);

      renderUserProfilePage();

      await waitFor(() => {
        expect(screen.getByText('5번')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /예매 취소/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          '예매 취소에 실패했습니다. 다시 시도해주세요.',
        );
      });
    });

    it('should show error toast when cancellation network error occurs', async () => {
      const { toast } = await import('react-hot-toast');
      const { useAuth } = await import('../../contexts/AuthContext');
      const { seatsAPI } = await import('../../api/services');

      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn(),
        login: vi.fn(),
        signup: vi.fn(),
      } as ReturnType<typeof useAuth>);

      vi.mocked(seatsAPI.getUserReservations).mockResolvedValue([
        { id: 1, seat_number: 5, is_reserved: true, row: 2, column: 2 },
      ]);

      vi.mocked(seatsAPI.cancelReservation).mockRejectedValue(
        new Error('Network Error'),
      );

      mockConfirm.mockReturnValue(true);

      renderUserProfilePage();

      await waitFor(() => {
        expect(screen.getByText('5번')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /예매 취소/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Network Error');
      });
    });
  });

  describe('Success Scenarios', () => {
    it('should handle successful reservation cancellation', async () => {
      const { toast } = await import('react-hot-toast');
      const { useAuth } = await import('../../contexts/AuthContext');
      const { seatsAPI } = await import('../../api/services');

      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn(),
        login: vi.fn(),
        signup: vi.fn(),
      } as ReturnType<typeof useAuth>);

      vi.mocked(seatsAPI.getUserReservations).mockResolvedValue([
        { id: 1, seat_number: 5, is_reserved: true, row: 2, column: 2 },
      ]);

      vi.mocked(seatsAPI.cancelReservation).mockResolvedValue({
        message: '예약이 취소되었습니다.',
      });

      mockConfirm.mockReturnValue(true);

      renderUserProfilePage();

      await waitFor(() => {
        expect(screen.getByText('5번')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /예매 취소/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(seatsAPI.cancelReservation).toHaveBeenCalledWith(5);
        expect(toast.success).toHaveBeenCalledWith('예약이 취소되었습니다.');
      });
    });

    it('should display user reservations correctly', async () => {
      const { useAuth } = await import('../../contexts/AuthContext');
      const { seatsAPI } = await import('../../api/services');

      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        logout: vi.fn(),
        login: vi.fn(),
        signup: vi.fn(),
      } as ReturnType<typeof useAuth>);

      vi.mocked(seatsAPI.getUserReservations).mockResolvedValue([
        { id: 1, seat_number: 5, is_reserved: true, row: 2, column: 2 },
        { id: 2, seat_number: 10, is_reserved: true, row: 4, column: 1 },
      ]);

      renderUserProfilePage();

      await waitFor(() => {
        expect(screen.getByText('5번')).toBeInTheDocument();
        expect(screen.getByText('10번')).toBeInTheDocument();
        expect(screen.getByText('2행 2열')).toBeInTheDocument();
        expect(screen.getByText('4행 1열')).toBeInTheDocument();
      });
    });
  });
});
