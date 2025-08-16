import { vi } from 'vitest';

// Toast mock utilities
export const createToastMock = () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
});

// API error utilities
export const createApiError = (
  status: number,
  message: string,
  data?: Record<string, unknown>,
) => ({
  response: {
    status,
    data: data || { message },
  },
  message,
  config: { url: '/api/test' },
});

// Server error utilities for testing
export const createServerError = (status = 500, message?: string) => {
  const error = new Error(message || 'Internal Server Error');
  (
    error as Error & {
      response: { status: number; data: { error: string; message: string } };
    }
  ).response = {
    status,
    data: {
      error: message || 'Internal Server Error',
      message: message || 'Internal Server Error',
    },
  };
  (
    error as Error & {
      status: number;
      isServerError: boolean;
      isClientError: boolean;
      isNetworkError: boolean;
    }
  ).status = status;
  (
    error as Error & {
      status: number;
      isServerError: boolean;
      isClientError: boolean;
      isNetworkError: boolean;
    }
  ).isServerError = true;
  (
    error as Error & {
      status: number;
      isServerError: boolean;
      isClientError: boolean;
      isNetworkError: boolean;
    }
  ).isClientError = false;
  (
    error as Error & {
      status: number;
      isServerError: boolean;
      isClientError: boolean;
      isNetworkError: boolean;
    }
  ).isNetworkError = false;
  (
    error as Error & {
      status: number;
      isServerError: boolean;
      isClientError: boolean;
      isNetworkError: boolean;
    }
  ).message = message || 'Internal Server Error';
  return error;
};

// Client error utilities for testing
export const createClientError = (status = 400, message?: string) => {
  const error = new Error(message || 'Bad Request');
  (
    error as Error & {
      response: { status: number; data: { error: string; message: string } };
    }
  ).response = {
    status,
    data: {
      error: message || 'Bad Request',
      message: message || 'Bad Request',
    },
  };
  (
    error as Error & {
      status: number;
      isServerError: boolean;
      isClientError: boolean;
      isNetworkError: boolean;
    }
  ).status = status;
  (
    error as Error & {
      status: number;
      isServerError: boolean;
      isClientError: boolean;
      isNetworkError: boolean;
    }
  ).isServerError = false;
  (
    error as Error & {
      status: number;
      isServerError: boolean;
      isClientError: boolean;
      isNetworkError: boolean;
    }
  ).isClientError = true;
  (
    error as Error & {
      status: number;
      isServerError: boolean;
      isClientError: boolean;
      isNetworkError: boolean;
    }
  ).isNetworkError = false;
  (
    error as Error & {
      status: number;
      isServerError: boolean;
      isClientError: boolean;
      isNetworkError: boolean;
    }
  ).message = message || 'Bad Request';
  return error;
};

// Network error utilities for testing
export const createNetworkError = (message?: string) => {
  const error = new Error(message || 'Network Error');
  (
    error as Error & {
      code: string;
      status: number;
      isServerError: boolean;
      isClientError: boolean;
      isNetworkError: boolean;
    }
  ).code = 'NETWORK_ERROR';
  (
    error as Error & {
      code: string;
      status: number;
      isServerError: boolean;
      isClientError: boolean;
      isNetworkError: boolean;
    }
  ).status = 0;
  (
    error as Error & {
      code: string;
      status: number;
      isServerError: boolean;
      isClientError: boolean;
      isNetworkError: boolean;
    }
  ).isServerError = false;
  (
    error as Error & {
      code: string;
      status: number;
      isClientError: boolean;
      isNetworkError: boolean;
    }
  ).isClientError = false;
  (
    error as Error & {
      code: string;
      status: number;
      isServerError: boolean;
      isClientError: boolean;
      isNetworkError: boolean;
    }
  ).isNetworkError = true;
  (
    error as Error & {
      code: string;
      status: number;
      isServerError: boolean;
      isClientError: boolean;
      isNetworkError: boolean;
    }
  ).message = message || 'Network Error';
  return error;
};

// localStorage mock utilities
export const createLocalStorageMock = () => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
});

// Console mock utilities
export const createConsoleMock = () => ({
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
  info: vi.spyOn(console, 'info').mockImplementation(() => {}),
});

// Form validation error utilities
export const createFormValidationError = (field: string, message: string) => ({
  field,
  message,
  type: 'validation',
});

// Authentication error utilities
export const createAuthError = (
  type: 'invalid_credentials' | 'token_expired' | 'unauthorized',
  message?: string,
) => {
  const defaultMessages = {
    invalid_credentials: '아이디 또는 비밀번호가 올바르지 않습니다.',
    token_expired: '토큰이 만료되었습니다.',
    unauthorized: '인증이 필요합니다.',
  };

  return {
    type,
    message: message || defaultMessages[type],
    status: 401,
  };
};

// Seat reservation error utilities
export const createSeatError = (
  type: 'already_reserved' | 'invalid_seat' | 'reservation_failed',
  message?: string,
) => {
  const defaultMessages = {
    already_reserved: '이미 예약된 좌석입니다.',
    invalid_seat: '유효하지 않은 좌석입니다.',
    reservation_failed: '좌석 예약에 실패했습니다.',
  };

  return {
    type,
    message: message || defaultMessages[type],
    status: 400,
  };
};

// Error response utilities
export const createErrorResponse = (status: number, error: Error | string) => {
  return {
    response: {
      status,
      data: {
        error: typeof error === 'string' ? error : error.message,
        message: typeof error === 'string' ? error : error.message,
      },
    },
    message: typeof error === 'string' ? error : error.message,
    config: { url: '/api/test' },
  };
};

// Mock cleanup utilities
export const cleanupMocks = () => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
};

// Test data utilities
export const createMockUser = (overrides = {}) => ({
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  ...overrides,
});

export const createMockSeat = (overrides = {}) => ({
  seat_number: 1,
  is_reserved: false,
  row: 1,
  col: 1,
  ...overrides,
});

export const createMockReservation = (overrides = {}) => ({
  id: 1,
  seat_number: 1,
  user_id: 1,
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

// Error simulation utilities
export const simulateNetworkError = () => {
  return new Error('Network Error');
};

export const simulateTimeoutError = () => {
  return new Error('Request timeout');
};

export const simulateServerError = (status = 500) => {
  const error = new Error('Internal Server Error');
  (
    error as Error & { response: { status: number; data: { error: string } } }
  ).response = { status, data: { error: 'Internal Server Error' } };
  return error;
};

// Async error utilities
export const createAsyncError = (delay: number, error: Error) => {
  return new Promise<never>((_, reject) => {
    setTimeout(() => reject(error), delay);
  });
};

export const createAsyncSuccess = <T>(delay: number, data: T) => {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

// Error boundary testing utilities
export const createErrorBoundaryError = (message: string) => {
  const error = new Error(message);
  error.name = 'ErrorBoundaryError';
  return error;
};

// Form submission error utilities
export const createFormSubmissionError = (
  field: string,
  value: unknown,
  rule: string,
) => ({
  field,
  value,
  rule,
  message: `Validation failed for ${field}: ${rule}`,
});

// Rate limit error utilities
export const createRateLimitError = (retryAfter?: number) => ({
  response: {
    status: 429,
    data: {
      error: 'Too many requests',
      retry_after: retryAfter,
    },
  },
  message: 'Too many requests',
  config: { url: '/api/test' },
});

// Database error utilities
export const createDatabaseError = (operation: string, table: string) => ({
  response: {
    status: 500,
    data: {
      message: `Database operation failed: ${operation} on ${table}`,
      code: 'DB_ERROR',
    },
  },
  message: 'Database operation failed',
  config: { url: '/api/test' },
});
