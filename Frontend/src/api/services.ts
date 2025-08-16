import { apiClient, handleApiError, API_ENDPOINTS } from './client';
import type {
  SignupCredentials,
  AuthResponse,
  Seat,
  ReservationRequest,
  ReservationResponse,
} from '../types';
import type { AxiosError } from 'axios';

export const authAPI = {
  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.SIGNUP, credentials);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error as AxiosError | Error);
      throw apiError;
    }
  },

  async login(credentials: {
    username: string;
    password: string;
  }): Promise<AuthResponse> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.LOGIN, credentials);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error as AxiosError | Error);
      throw apiError;
    }
  },
};

// 좌석 관련 API
export const seatsAPI = {
  // 전체 좌석 조회
  getSeats: async (): Promise<Seat[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SEATS);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error as AxiosError | Error);
      throw apiError;
    }
  },

  // 좌석 예약
  reserveSeat: async (seatNumber: number): Promise<ReservationResponse> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.RESERVE_SEAT, {
        seat_number: seatNumber,
      } as ReservationRequest);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error as AxiosError | Error);

      // 예약 관련 특별한 에러 처리
      if (apiError.status === 409) {
        apiError.message = '이미 예약된 좌석입니다. 다른 좌석을 선택해주세요.';
      } else if (apiError.status === 422) {
        apiError.message =
          '선택한 좌석이 유효하지 않습니다. 다시 선택해주세요.';
      } else if (apiError.isServerError) {
        apiError.message =
          '서버 오류로 예약에 실패했습니다. 잠시 후 다시 시도해주세요.';
      }

      throw apiError;
    }
  },

  // 사용자별 예약된 좌석 조회
  getUserReservations: async (): Promise<Seat[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USER_RESERVATIONS);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error as AxiosError | Error);
      throw apiError;
    }
  },

  // 좌석 예약 취소
  cancelReservation: async (
    seatNumber: number,
  ): Promise<{ message: string }> => {
    try {
      const response = await apiClient.delete(
        `${API_ENDPOINTS.CANCEL_RESERVATION}/${seatNumber}/cancel/`,
      );
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error as AxiosError | Error);

      // 취소 관련 특별한 에러 처리
      if (apiError.status === 404) {
        apiError.message = '예약 정보를 찾을 수 없습니다.';
      } else if (apiError.status === 422) {
        apiError.message = '취소할 수 없는 예약입니다.';
      } else if (apiError.isServerError) {
        apiError.message =
          '서버 오류로 취소에 실패했습니다. 잠시 후 다시 시도해주세요.';
      }

      throw apiError;
    }
  },
};
