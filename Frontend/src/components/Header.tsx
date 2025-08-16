import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // 디버깅을 위한 로그
  console.log('Header Debug:', { isAuthenticated });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-2xl font-bold transition-colors hover:text-blue-200"
          >
            공연 좌석 예매
          </Link>

          <nav className="flex items-center space-x-4">
            <Link
              to="/seats"
              className="rounded px-3 py-2 transition-colors hover:text-blue-200"
            >
              좌석 예매
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-blue-100">안녕하세요, 사용자님!</span>
                <Link
                  to="/profile"
                  className="rounded px-3 py-2 text-blue-100 transition-colors hover:text-blue-200"
                >
                  내 프로필
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white shadow-md transition-colors hover:bg-red-700"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white shadow-md transition-colors hover:bg-green-700"
                >
                  로그인
                </Link>
                <Link
                  to="/signup"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-md transition-colors hover:bg-blue-700"
                >
                  회원가입
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
