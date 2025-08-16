import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthResponse } from '../types';
import { authAPI } from '../api/services';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (
    username: string,
    password: string,
    email?: string,
  ) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트 마운트 시 저장된 토큰 확인
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('accessToken');
      console.log('AuthContext 초기화:', { token: !!token });

      if (token) {
        setIsAuthenticated(true);
        console.log('토큰 존재, 인증 상태: true');
      } else {
        setIsAuthenticated(false);
        console.log('토큰 없음, 인증 상태: false');
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('로그인 시도 시작:', username);

      const response: AuthResponse = await authAPI.login({
        username,
        password,
      });

      console.log('로그인 API 응답 성공:', response);

      // 토큰을 localStorage에 저장
      localStorage.setItem('accessToken', response.access);
      localStorage.setItem('refreshToken', response.refresh);
      console.log('토큰 저장 완료');

      // 인증 상태 업데이트
      setIsAuthenticated(true);
      console.log('인증 상태 업데이트: true');

      return true;
    } catch (error) {
      console.error('로그인 실패 상세:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      return false;
    } finally {
      setIsLoading(false);
      console.log('로그인 프로세스 완료, 로딩 상태 해제');
    }
  };

  const signup = async (
    username: string,
    password: string,
    email?: string,
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('회원가입 시도 시작:', username);

      // 1단계: 회원가입 API 호출
      const signupResponse: AuthResponse = await authAPI.signup({
        username,
        password,
        email,
      });

      console.log('회원가입 API 성공:', signupResponse);

      // 2단계: 회원가입 성공 후 즉시 로그인 API 호출
      console.log('회원가입 완료, 자동 로그인 시도');
      const loginResponse: AuthResponse = await authAPI.login({
        username,
        password,
      });

      console.log('자동 로그인 API 성공:', loginResponse);

      // 3단계: 로그인 응답의 토큰을 localStorage에 저장
      localStorage.setItem('accessToken', loginResponse.access);
      localStorage.setItem('refreshToken', loginResponse.refresh);
      console.log('로그인 토큰 저장 완료');

      // 4단계: 인증 상태 업데이트
      setIsAuthenticated(true);
      console.log('회원가입 + 자동 로그인 완료, 인증 상태: true');

      return true;
    } catch (error) {
      console.error('회원가입 또는 자동 로그인 실패:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      return false;
    } finally {
      setIsLoading(false);
      console.log('회원가입 프로세스 완료, 로딩 상태 해제');
    }
  };

  const logout = () => {
    console.log('로그아웃 실행');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    console.log('인증 상태 초기화: false');
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
  };

  console.log('AuthContext 값:', { isAuthenticated, isLoading });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
