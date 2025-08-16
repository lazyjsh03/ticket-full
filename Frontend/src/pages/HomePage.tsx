import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <div className="text-center">
          <h1 className="mb-6 text-3xl font-bold text-gray-800 sm:mb-10 sm:text-5xl">
            공연 좌석 예매 시스템
          </h1>

          <p className="mx-auto mb-8 text-base text-gray-600 sm:mb-15 sm:text-xl">
            간편하고 빠른 공연 좌석 예매를 경험해보세요. 실시간 좌석 현황
            확인부터 예약까지 한 번에!
          </p>

          <div className="space-y-3 sm:space-y-4">
            <Link
              to="/seats"
              className="inline-block w-full rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-colors hover:bg-blue-700 hover:shadow-xl sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
            >
              좌석 예매 시작하기
            </Link>

            <div className="text-xs text-gray-500 sm:text-sm">
              <p>
                아직 계정이 없으신가요?
                <Link
                  to="/signup"
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  회원가입
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* 특징 설명 */}
        <div className="mt-12 grid gap-6 sm:mt-20 sm:gap-8 md:grid-cols-3">
          <div className="rounded-lg bg-white p-4 text-center shadow-md sm:p-6">
            <div className="mb-3 text-3xl sm:mb-4 sm:text-4xl">🎭</div>
            <h3 className="mb-2 text-lg font-semibold sm:text-xl">
              실시간 좌석 현황
            </h3>
            <p className="text-sm text-gray-600 sm:text-base">
              현재 예약 가능한 좌석을 실시간으로 확인하세요
            </p>
          </div>

          <div className="rounded-lg bg-white p-4 text-center shadow-md sm:p-6">
            <div className="mb-3 text-3xl sm:mb-4 sm:text-4xl">⚡</div>
            <h3 className="mb-2 text-lg font-semibold sm:text-xl">빠른 예약</h3>
            <p className="text-sm text-gray-600 sm:text-base">
              간단한 클릭으로 원하는 좌석을 빠르게 예약하세요
            </p>
          </div>

          <div className="rounded-lg bg-white p-4 text-center shadow-md sm:p-6">
            <div className="mb-3 text-3xl sm:mb-4 sm:text-4xl">🔒</div>
            <h3 className="mb-2 text-lg font-semibold sm:text-xl">
              안전한 결제
            </h3>
            <p className="text-sm text-gray-600 sm:text-base">
              보안이 강화된 시스템으로 안전하게 예약하세요
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
