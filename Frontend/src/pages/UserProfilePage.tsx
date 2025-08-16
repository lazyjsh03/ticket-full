import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { seatsAPI } from '../api/services';
import type { Seat } from '../types';

const UserProfilePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [userReservations, setUserReservations] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingSeat, setCancellingSeat] = useState<number | null>(null);

  // 사용자 예약 정보 가져오기
  useEffect(() => {
    const fetchUserReservations = async () => {
      try {
        setIsLoading(true);
        setError('');
        const reservations = await seatsAPI.getUserReservations();
        console.log('사용자 예약 정보:', reservations);
        setUserReservations(reservations);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : '예약 정보를 불러오는데 실패했습니다. 다시 시도해주세요.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserReservations();
    }
  }, [isAuthenticated]);

  // 예매 취소 처리
  const handleCancelReservation = async (seatNumber: number) => {
    if (!window.confirm(`좌석 ${seatNumber}번의 예매를 취소하시겠습니까?`)) {
      return;
    }

    try {
      setCancellingSeat(seatNumber);
      const response = await seatsAPI.cancelReservation(seatNumber);

      // 성공 메시지 표시
      alert(response.message);

      // 예약 목록 새로고침 (백엔드에서 최신 데이터 가져오기)
      const updatedReservations = await seatsAPI.getUserReservations();
      setUserReservations(updatedReservations);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : '예매 취소에 실패했습니다. 다시 시도해주세요.';

      alert(errorMessage);
    } finally {
      setCancellingSeat(null);
    }
  };

  // 좌석 위치 계산
  const getSeatLocation = (seatNumber: number) => {
    const row = Math.ceil(seatNumber / 3);
    const col = ((seatNumber - 1) % 3) + 1;
    return `${row}행 ${col}열`;
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-800">
            로그인이 필요합니다
          </h1>
          <p className="text-gray-600">
            프로필을 확인하려면 먼저 로그인해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          {/* 페이지 헤더 */}
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-3xl font-bold text-gray-800">
              👤 사용자 프로필
            </h1>
            <p className="text-gray-600">
              예매한 공연 정보를 확인하고 관리하세요
            </p>
          </div>

          {/* 사용자 정보 카드 */}
          <div className="mb-8 rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              기본 정보
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <span className="text-gray-600">사용자 ID:</span>
                <span className="ml-2 font-medium">사용자</span>
              </div>
              <div>
                <span className="text-gray-600">가입일:</span>
                <span className="ml-2 font-medium">2024년 8월</span>
              </div>
            </div>
          </div>

          {/* 예매 현황 */}
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                🎭 예매 현황
              </h2>
              <button
                onClick={() => window.location.reload()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                새로고침
              </button>
            </div>

            {isLoading ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="text-gray-600">예매 정보를 불러오는 중...</p>
              </div>
            ) : error ? (
              <div className="py-8 text-center">
                <p className="mb-4 text-red-600">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  다시 시도
                </button>
              </div>
            ) : userReservations.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mb-4 text-6xl">🎫</div>
                <h3 className="mb-2 text-xl font-semibold text-gray-800">
                  아직 예매한 공연이 없습니다
                </h3>
                <p className="mb-6 text-gray-600">
                  첫 번째 공연을 예매해보세요!
                </p>
                <a
                  href="/seats"
                  className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  좌석 예매하기
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {userReservations.map((seat) => (
                  <div
                    key={seat.seat_number}
                    className="rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-md"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      {/* 좌석 정보 */}
                      <div className="mb-4 flex-1 md:mb-0">
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                          <div>
                            <span className="text-sm text-gray-600">
                              공연명
                            </span>
                            <p className="font-semibold">오페라 갈라 콘서트</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">
                              공연일
                            </span>
                            <p className="font-semibold">2024년 12월 25일</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">
                              좌석 번호
                            </span>
                            <p className="font-semibold text-blue-600">
                              {seat.seat_number}번
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">
                              좌석 위치
                            </span>
                            <p className="font-semibold">
                              {getSeatLocation(seat.seat_number)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 예매 취소 버튼 */}
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                          onClick={() =>
                            handleCancelReservation(seat.seat_number)
                          }
                          disabled={cancellingSeat === seat.seat_number}
                          className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
                        >
                          {cancellingSeat === seat.seat_number
                            ? '취소 중...'
                            : '예매 취소'}
                        </button>
                      </div>
                    </div>

                    {/* 공연장 정보 */}
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-4">📍 예술의전당</span>
                        <span className="mr-4">🕐 오후 7:30</span>
                        <span>💰 50,000원</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 통계 정보 */}
          {userReservations.length > 0 && (
            <div className="mt-8 rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-semibold text-gray-800">
                📊 예매 통계
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="text-center">
                  <div className="mb-2 text-3xl font-bold text-blue-600">
                    {userReservations.length}
                  </div>
                  <div className="text-gray-600">총 예매 건수</div>
                </div>
                <div className="text-center">
                  <div className="mb-2 text-3xl font-bold text-green-600">
                    {userReservations.length * 50000}
                  </div>
                  <div className="text-gray-600">총 결제 금액 (원)</div>
                </div>
                <div className="text-center">
                  <div className="mb-2 text-3xl font-bold text-purple-600">
                    {userReservations.length > 0 ? '진행중' : '없음'}
                  </div>
                  <div className="text-gray-600">현재 상태</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
