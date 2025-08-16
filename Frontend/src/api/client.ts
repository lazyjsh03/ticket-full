import axios from 'axios';

// 상대 경로 사용 (Vite 프록시 활용)
const API_BASE_URL = '';

// axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Access Token을 자동으로 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API 요청에 토큰 추가:', config.url);
    } else {
      console.log('API 요청 (토큰 없음):', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Request Interceptor 에러:', error);
    return Promise.reject(error);
  },
);

// Response Interceptor: 401 에러 시 토큰 제거 (강제 리디렉션 제거)
apiClient.interceptors.response.use(
  (response) => {
    console.log('API 응답 성공:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('API 응답 에러:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });

    if (error.response?.status === 401) {
      console.log('401 에러: 토큰 제거');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      // 강제 리디렉션 제거 - React Router가 처리하도록 함
    }
    return Promise.reject(error);
  },
);

// API 엔드포인트 상수
export const API_ENDPOINTS = {
  // 인증 관련
  LOGIN: '/api/users/login/',
  SIGNUP: '/api/users/signup/',

  // 좌석 관련
  SEATS: '/api/seats/',
  RESERVE_SEAT: '/api/seats/reserve/',
  USER_RESERVATIONS: '/api/users/me/reservations/',
  CANCEL_RESERVATION: '/api/seats',
} as const;
