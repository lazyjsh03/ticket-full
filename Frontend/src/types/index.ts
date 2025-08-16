// 사용자 관련 타입
export interface User {
  id: number;
  username: string;
  email?: string;
}

// 좌석 관련 타입
export interface Seat {
  id: number;
  seat_number: number;
  is_reserved: boolean;
  row: number;
  column: number;
}

// 인증 관련 타입
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupCredentials {
  username: string;
  password: string;
  email?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

// 예약 관련 타입
export interface ReservationRequest {
  seat_number: number;
}

export interface ReservationResponse {
  message: string;
  // 백엔드 응답에 맞게 수정
  // success, seat_number 필드 제거
}

// API 응답 타입
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
