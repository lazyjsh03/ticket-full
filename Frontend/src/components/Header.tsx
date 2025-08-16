import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 디버깅을 위한 로그
  console.log('Header Debug:', { isAuthenticated });

  const handleLogout = () => {
    logout();
    toast.success('로그아웃되었습니다.');
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-xl font-bold transition-colors hover:text-blue-200 sm:text-2xl"
          >
            공연 좌석 예매
          </Link>

          {/* 모바일 메뉴 버튼 */}
          <button
            onClick={toggleMobileMenu}
            className="rounded p-2 text-white hover:bg-blue-700 sm:hidden"
            aria-label="메뉴 열기"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden items-center space-x-4 sm:flex">
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
                  className="rounded-lg bg-gray-500 px-4 py-2 font-semibold text-white shadow-md transition-colors hover:bg-gray-600"
                >
                  회원가입
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* 모바일 메뉴 */}
        {isMobileMenuOpen && (
          <nav className="mt-4 border-t border-blue-500 pt-4 sm:hidden">
            <div className="flex flex-col space-y-2">
              <Link
                to="/seats"
                className="rounded px-3 py-2 transition-colors hover:bg-blue-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                좌석 예매
              </Link>

              {isAuthenticated ? (
                <>
                  <span className="px-3 py-2 text-blue-100">
                    안녕하세요, 사용자님!
                  </span>
                  <Link
                    to="/profile"
                    className="rounded px-3 py-2 text-blue-100 transition-colors hover:bg-blue-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    내 프로필
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full rounded-lg bg-red-600 px-4 py-2 text-left font-semibold text-white shadow-md transition-colors hover:bg-red-700"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/login"
                    className="rounded-lg bg-green-600 px-4 py-2 text-center font-semibold text-white shadow-md transition-colors hover:bg-green-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    로그인
                  </Link>
                  <Link
                    to="/signup"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-center font-semibold text-white shadow-md transition-colors hover:bg-blue-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    회원가입
                  </Link>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
