import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SignupPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('회원가입 폼 제출 시작');

    // 입력값 검증
    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('모든 필수 항목을 입력해주세요.');
      console.log('입력값 검증 실패: 빈 필드');
      return;
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      console.log('입력값 검증 실패: 비밀번호 불일치');
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      console.log('입력값 검증 실패: 비밀번호 길이 부족');
      return;
    }

    console.log('입력값 검증 통과, 회원가입 시도');
    setIsLoading(true);
    setError('');

    try {
      console.log('AuthContext signup 함수 호출');
      const success = await signup(username, password, email || undefined);
      console.log('회원가입 결과:', success);

      if (success) {
        console.log('회원가입 + 자동 로그인 성공, 메인 페이지로 이동');
        // 회원가입 성공 시 자동 로그인되어 메인 페이지로 이동
        navigate('/');
      } else {
        console.log('회원가입 실패');
        setError('회원가입에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err: unknown) {
      console.error('회원가입 중 예외 발생:', err);
      const errorMessage =
        err instanceof Error ? err.message : '회원가입 중 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      console.log('회원가입 프로세스 완료');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mb-2 text-3xl font-bold text-gray-900">회원가입</h2>
          <p className="text-gray-600">공연 좌석 예매 시스템에 가입하세요</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                아이디 *
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
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                이메일 (선택)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="이메일을 입력하세요 (선택사항)"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                비밀번호 *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="비밀번호를 입력하세요 (최소 6자)"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                비밀번호 확인 *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="비밀번호를 다시 입력하세요"
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
              {isLoading ? '가입 중...' : '회원가입'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                로그인
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
