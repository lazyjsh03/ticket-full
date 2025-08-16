import axios, { AxiosError } from 'axios';
import type { AxiosResponse } from 'axios';

// 상대 경로 사용 (Vite 프록시 활용)
const API_BASE_URL = '';

// 에러 메시지 매핑
const ERROR_MESSAGES = {
  400: '잘못된 요청입니다. 입력 정보를 확인해주세요.',
  401: '인증이 필요합니다. 다시 로그인해주세요.',
  403: '접근 권한이 없습니다.',
  404: '요청한 리소스를 찾을 수 없습니다.',
  409: '이미 예약된 좌석입니다.',
  422: '입력 정보가 올바르지 않습니다.',
  429: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
  500: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  502: '서버 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.',
  503: '서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.',
  504: '서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.',
} as const;

// 에러 타입 정의
export interface ApiError {
  status: number;
  message: string;
  originalError: AxiosError | Error;
  isNetworkError: boolean;
  isServerError: boolean;
  isClientError: boolean;
}

// 에러 처리 함수
export const handleApiError = (error: AxiosError | Error): ApiError => {
  console.error('API 에러 상세 정보:', {
    error,
    response: (error as AxiosError).response,
    request: (error as AxiosError).request,
    message: error.message,
  });

  // 네트워크 에러 (인터넷 연결 문제 등)
  if (
    (error as AxiosError).code === 'NETWORK_ERROR' ||
    !(error as AxiosError).response
  ) {
    return {
      status: 0,
      message: '네트워크 연결을 확인해주세요.',
      originalError: error,
      isNetworkError: true,
      isServerError: false,
      isClientError: false,
    };
  }

  const axiosError = error as AxiosError;
  const status = axiosError.response?.status || 500;
  const responseData = axiosError.response?.data as
    | { message?: string; error?: string }
    | undefined;
  const serverMessage = responseData?.message || responseData?.error;

  // 서버에서 제공한 메시지가 있으면 사용, 없으면 기본 메시지 사용
  const message =
    serverMessage ||
    ERROR_MESSAGES[status as keyof typeof ERROR_MESSAGES] ||
    '알 수 없는 오류가 발생했습니다.';

  return {
    status,
    message,
    originalError: error,
    isNetworkError: false,
    isServerError: status >= 500,
    isClientError: status >= 400 && status < 500,
  };
};

// axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10초 타임아웃
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
  (error: AxiosError) => {
    console.error('Request Interceptor 에러:', error);
    return Promise.reject(error);
  },
);

// Response Interceptor: 401 에러 시 토큰 제거 (강제 리디렉션 제거)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('API 응답 성공:', response.config.url, response.status);
    return response;
  },
  (error: AxiosError) => {
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
