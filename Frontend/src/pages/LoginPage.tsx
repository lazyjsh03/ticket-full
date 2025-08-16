import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 로그인 후 리디렉션할 페이지 (기본값: 메인 페이지)
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('로그인 폼 제출 시작');

    if (!username.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      console.log('입력값 검증 실패: 빈 필드');
      return;
    }

    console.log('입력값 검증 통과, 로그인 시도');
    setIsLoading(true);
    setError('');

    try {
      console.log('AuthContext login 함수 호출');
      const success = await login(username, password);
      console.log('로그인 결과:', success);

      if (success) {
        console.log('로그인 성공, 페이지 이동:', from);
        navigate(from, { replace: true });
      } else {
        console.log('로그인 실패: 잘못된 credentials');
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (err: unknown) {
      console.error('로그인 중 예외 발생:', err);
      const errorMessage =
        err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      console.log('로그인 프로세스 완료');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mb-2 text-3xl font-bold text-gray-900">로그인</h2>
          <p className="text-gray-600">공연 좌석 예매 시스템에 로그인하세요</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                아이디
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="아이디를 입력하세요"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{' '}
              <Link
                to="/signup"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                회원가입
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
