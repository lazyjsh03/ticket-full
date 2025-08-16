import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ReservationConfirmPage from '../ReservationConfirmPage';

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
    reserveSeat: vi.fn(),
  },
}));

// Mock ReservationContext
vi.mock('../../contexts/ReservationContext', () => ({
  useReservation: vi.fn(),
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn(() => ({
      state: {
        selectedSeats: [1, 2],
        from: { pathname: '/seats' },
      },
    })),
  };
});

// Test component wrapper
const renderReservationConfirmPage = () => {
  return render(
    <BrowserRouter>
      <ReservationConfirmPage />
    </BrowserRouter>,
  );
};

describe('ReservationConfirmPage Error Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Input Validation Errors', () => {
    it('should show error toast when name is empty', async () => {
      const { toast } = await import('react-hot-toast');
      const { useReservation } = await import(
        '../../contexts/ReservationContext'
      );

      vi.mocked(useReservation).mockReturnValue({
        selectedSeat: 1,
        setSelectedSeat: vi.fn(),
        clearSelection: vi.fn(),
      } as ReturnType<typeof useReservation>);

      renderReservationConfirmPage();

      // 이름만 입력하고 전화번호는 비워둠
      const nameInput = screen.getByPlaceholderText('예매자 이름을 입력하세요');
      fireEvent.change(nameInput, { target: { value: '홍길동' } });

      // 폼 제출 (submit 이벤트 발생)
      const form = nameInput.closest('form');
      expect(form).toBeInTheDocument();
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          '이름과 전화번호는 필수 입력 항목입니다.',
        );
      });
    });

    it('should show error toast when phone is empty', async () => {
      const { toast } = await import('react-hot-toast');
      const { useReservation } = await import(
        '../../contexts/ReservationContext'
      );

      vi.mocked(useReservation).mockReturnValue({
        selectedSeat: 1,
        setSelectedSeat: vi.fn(),
        clearSelection: vi.fn(),
      } as ReturnType<typeof useReservation>);

      renderReservationConfirmPage();

      // 전화번호만 입력하고 이름은 비워둠
      const phoneInput = screen.getByPlaceholderText('010-1234-5678');
      fireEvent.change(phoneInput, { target: { value: '010-1234-5678' } });

      // 폼 제출 (submit 이벤트 발생)
      const form = phoneInput.closest('form');
      expect(form).toBeInTheDocument();
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          '이름과 전화번호는 필수 입력 항목입니다.',
        );
      });
    });

    it('should show error toast when phone format is invalid', async () => {
      const { toast } = await import('react-hot-toast');
      const { useReservation } = await import(
        '../../contexts/ReservationContext'
      );

      vi.mocked(useReservation).mockReturnValue({
        selectedSeat: 1,
        setSelectedSeat: vi.fn(),
        clearSelection: vi.fn(),
      } as ReturnType<typeof useReservation>);

      renderReservationConfirmPage();

      // 이름과 전화번호 입력 (전화번호 형식이 잘못됨)
      const nameInput = screen.getByPlaceholderText('예매자 이름을 입력하세요');
      const phoneInput = screen.getByPlaceholderText('010-1234-5678');

      fireEvent.change(nameInput, { target: { value: '홍길동' } });
      fireEvent.change(phoneInput, { target: { value: 'invalid-phone' } });

      // 폼 제출 (submit 이벤트 발생)
      const form = nameInput.closest('form');
      expect(form).toBeInTheDocument();
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          '올바른 전화번호 형식을 입력해주세요.',
        );
      });
    });
  });

  describe('API Error Scenarios', () => {
    it('should show error toast when reservation API fails', async () => {
      const { toast } = await import('react-hot-toast');
      const { useReservation } = await import(
        '../../contexts/ReservationContext'
      );
      const { seatsAPI } = await import('../../api/services');

      vi.mocked(useReservation).mockReturnValue({
        selectedSeat: 1,
        setSelectedSeat: vi.fn(),
        clearSelection: vi.fn(),
      } as ReturnType<typeof useReservation>);

      vi.mocked(seatsAPI.reserveSeat).mockRejectedValue(
        new Error('Reservation failed'),
      );

      renderReservationConfirmPage();

      // 사용자 정보 입력
      const nameInput = screen.getByPlaceholderText('예매자 이름을 입력하세요');
      const phoneInput = screen.getByPlaceholderText('010-1234-5678');

      fireEvent.change(nameInput, { target: { value: '홍길동' } });
      fireEvent.change(phoneInput, { target: { value: '010-1234-5678' } });

      // 폼 제출
      const submitButton = screen.getByRole('button', {
        name: '정보 입력 완료',
      });
      fireEvent.click(submitButton);

      // 최종 예약 확정 버튼 클릭
      const confirmButton = screen.getByRole('button', {
        name: '최종 예약 확정',
      });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Reservation failed');
      });
    });

    it('should show error toast when API throws unknown error', async () => {
      const { toast } = await import('react-hot-toast');
      const { useReservation } = await import(
        '../../contexts/ReservationContext'
      );
      const { seatsAPI } = await import('../../api/services');

      vi.mocked(useReservation).mockReturnValue({
        selectedSeat: 1,
        setSelectedSeat: vi.fn(),
        clearSelection: vi.fn(),
      } as ReturnType<typeof useReservation>);

      vi.mocked(seatsAPI.reserveSeat).mockRejectedValue('Unknown error');

      renderReservationConfirmPage();

      // 사용자 정보 입력
      const nameInput = screen.getByPlaceholderText('예매자 이름을 입력하세요');
      const phoneInput = screen.getByPlaceholderText('010-1234-5678');

      fireEvent.change(nameInput, { target: { value: '홍길동' } });
      fireEvent.change(phoneInput, { target: { value: '010-1234-5678' } });

      // 폼 제출
      const submitButton = screen.getByRole('button', {
        name: '정보 입력 완료',
      });
      fireEvent.click(submitButton);

      // 최종 예약 확정 버튼 클릭
      const confirmButton = screen.getByRole('button', {
        name: '최종 예약 확정',
      });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          '예약에 실패했습니다. 다시 시도해주세요.',
        );
      });
    });

    it('should show error toast when network error occurs', async () => {
      const { toast } = await import('react-hot-toast');
      const { useReservation } = await import(
        '../../contexts/ReservationContext'
      );
      const { seatsAPI } = await import('../../api/services');

      vi.mocked(useReservation).mockReturnValue({
        selectedSeat: 1,
        setSelectedSeat: vi.fn(),
        clearSelection: vi.fn(),
      } as ReturnType<typeof useReservation>);

      vi.mocked(seatsAPI.reserveSeat).mockRejectedValue(
        new Error('Network Error'),
      );

      renderReservationConfirmPage();

      // 사용자 정보 입력
      const nameInput = screen.getByPlaceholderText('예매자 이름을 입력하세요');
      const phoneInput = screen.getByPlaceholderText('010-1234-5678');

      fireEvent.change(nameInput, { target: { value: '홍길동' } });
      fireEvent.change(phoneInput, { target: { value: '010-1234-5678' } });

      // 폼 제출
      const submitButton = screen.getByRole('button', {
        name: '정보 입력 완료',
      });
      fireEvent.click(submitButton);

      // 최종 예약 확정 버튼 클릭
      const confirmButton = screen.getByRole('button', {
        name: '최종 예약 확정',
      });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Network Error');
      });
    });
  });

  describe('Success Scenarios', () => {
    it('should handle successful reservation', async () => {
      const { useReservation } = await import(
        '../../contexts/ReservationContext'
      );
      const { seatsAPI } = await import('../../api/services');

      vi.mocked(useReservation).mockReturnValue({
        selectedSeat: 1,
        setSelectedSeat: vi.fn(),
        clearSelection: vi.fn(),
      } as ReturnType<typeof useReservation>);

      vi.mocked(seatsAPI.reserveSeat).mockResolvedValue({
        message: '예약이 완료되었습니다!',
      });

      renderReservationConfirmPage();

      // 사용자 정보 입력
      const nameInput = screen.getByPlaceholderText('예매자 이름을 입력하세요');
      const phoneInput = screen.getByPlaceholderText('010-1234-5678');

      fireEvent.change(nameInput, { target: { value: '홍길동' } });
      fireEvent.change(phoneInput, { target: { value: '010-1234-5678' } });

      // 폼 제출
      const submitButton = screen.getByRole('button', {
        name: '정보 입력 완료',
      });
      fireEvent.click(submitButton);

      // 최종 예약 확정 버튼 클릭
      const confirmButton = screen.getByRole('button', {
        name: '최종 예약 확정',
      });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(seatsAPI.reserveSeat).toHaveBeenCalledWith(1);
        // 성공 시에는 모달이 표시됨
        expect(screen.getByText('🎭 예매 완료')).toBeInTheDocument();
      });
    });
  });
});
