import { apiClient, API_ENDPOINTS } from './client';
import type {
  LoginCredentials,
  SignupCredentials,
  AuthResponse,
  Seat,
  ReservationRequest,
  ReservationResponse,
} from '../types';

// 인증 관련 API
export const authAPI = {
  // 로그인
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.LOGIN, credentials);
    return response.data;
  },

  // 회원가입
  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.SIGNUP, credentials);
    return response.data;
  },
};

// 좌석 관련 API
export const seatsAPI = {
  // 전체 좌석 조회
  getSeats: async (): Promise<Seat[]> => {
    const response = await apiClient.get(API_ENDPOINTS.SEATS);
    return response.data;
  },

  // 좌석 예약
  reserveSeat: async (seatNumber: number): Promise<ReservationResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.RESERVE_SEAT, {
      seat_number: seatNumber,
    } as ReservationRequest);
    return response.data;
  },

  // 사용자별 예약된 좌석 조회
  getUserReservations: async (): Promise<Seat[]> => {
    const response = await apiClient.get(API_ENDPOINTS.USER_RESERVATIONS);
    return response.data;
  },

  // 좌석 예약 취소
  cancelReservation: async (
    seatNumber: number,
  ): Promise<{ message: string }> => {
    const response = await apiClient.delete(
      `${API_ENDPOINTS.CANCEL_RESERVATION}/${seatNumber}/cancel/`,
    );
    return response.data;
  },
};
