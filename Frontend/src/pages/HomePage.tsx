import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="mb-10 text-5xl font-bold text-gray-800">
            공연 좌석 예매 시스템
          </h1>

          <p className="mx-auto mb-15 text-xl text-gray-600">
            간편하고 빠른 공연 좌석 예매를 경험해보세요. 실시간 좌석 현황
            확인부터 예약까지 한 번에!
          </p>

          <div className="space-y-4">
            <Link
              to="/seats"
              className="inline-block rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-blue-700 hover:shadow-xl"
            >
              좌석 예매 시작하기
            </Link>

            <div className="text-sm text-gray-500">
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
        <div className="mt-20 grid gap-8 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 text-center shadow-md">
            <div className="mb-4 text-4xl">🎭</div>
            <h3 className="mb-2 text-xl font-semibold">실시간 좌석 현황</h3>
            <p className="text-gray-600">
              현재 예약 가능한 좌석을 실시간으로 확인하세요
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 text-center shadow-md">
            <div className="mb-4 text-4xl">⚡</div>
            <h3 className="mb-2 text-xl font-semibold">빠른 예약</h3>
            <p className="text-gray-600">
              간단한 클릭으로 원하는 좌석을 빠르게 예약하세요
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 text-center shadow-md">
            <div className="mb-4 text-4xl">🔒</div>
            <h3 className="mb-2 text-xl font-semibold">안전한 결제</h3>
            <p className="text-gray-600">
              보안이 강화된 시스템으로 안전하게 예약하세요
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
