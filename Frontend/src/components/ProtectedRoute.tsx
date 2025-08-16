import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 디버깅을 위한 로그
  console.log('ProtectedRoute Debug:', {
    isAuthenticated,
    isLoading,
    currentPath: location.pathname,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" text="인증 상태를 확인하는 중..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('Access denied, redirecting to login');
    // 로그인 후 원래 페이지로 리디렉션하기 위해 현재 위치 저장
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('Access granted to protected route');
  return <>{children}</>;
};

export default ProtectedRoute;
