import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { seatsAPI } from '../api/services';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Seat } from '../types';
import type { ApiError } from '../api/client';

const UserProfilePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [userReservations, setUserReservations] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingSeat, setCancellingSeat] = useState<number | null>(null);

  // 사용자 예약 정보 가져오기
  useEffect(() => {
    const fetchUserReservations = async () => {
      try {
        setIsLoading(true);
        const reservations = await seatsAPI.getUserReservations();
        console.log('사용자 예약 정보:', reservations);
        setUserReservations(reservations);
      } catch (err: unknown) {
        console.error('예약 정보 로딩 에러 상세:', err);

        // ApiError 타입인지 확인
        if (
          err &&
          typeof err === 'object' &&
          'status' in err &&
          'message' in err
        ) {
          const apiError = err as ApiError;

          if (apiError.isServerError) {
            toast.error(`${apiError.message} (오류 코드: ${apiError.status})`);
            toast.error('잠시 후 다시 시도해주세요.', { duration: 4000 });
          } else if (apiError.isNetworkError) {
            toast.error(apiError.message);
            toast.error('인터넷 연결을 확인하고 다시 시도해주세요.', {
              duration: 4000,
            });
          } else {
            toast.error(apiError.message);
          }
        } else {
          const errorMessage =
            err instanceof Error
              ? err.message
              : '예약 정보를 불러오는데 실패했습니다. 다시 시도해주세요.';
          toast.error(errorMessage);
        }
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
      toast.success(response.message);

      // 예약 목록 새로고침 (백엔드에서 최신 데이터 가져오기)
      const updatedReservations = await seatsAPI.getUserReservations();
      setUserReservations(updatedReservations);
    } catch (err: unknown) {
      console.error('예약 취소 에러 상세:', err);

      // ApiError 타입인지 확인
      if (
        err &&
        typeof err === 'object' &&
        'status' in err &&
        'message' in err
      ) {
        const apiError = err as ApiError;

        if (apiError.isServerError) {
          toast.error(`${apiError.message} (오류 코드: ${apiError.status})`);
          toast.error('잠시 후 다시 시도해주세요.', { duration: 4000 });
        } else if (apiError.isNetworkError) {
          toast.error(apiError.message);
          toast.error('인터넷 연결을 확인하고 다시 시도해주세요.', {
            duration: 4000,
          });
        } else {
          toast.error(apiError.message);
        }
      } else {
        const errorMessage =
          err instanceof Error
            ? err.message
            : '예매 취소에 실패했습니다. 다시 시도해주세요.';

        toast.error(errorMessage);
      }
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="mb-4 text-xl font-bold text-gray-800 sm:text-2xl">
            로그인이 필요합니다
          </h1>
          <p className="text-sm text-gray-600 sm:text-base">
            프로필을 확인하려면 먼저 로그인해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          {/* 페이지 헤더 */}
          <div className="mb-6 text-center sm:mb-8">
            <h1 className="mb-2 text-2xl font-bold text-gray-800 sm:mb-4 sm:text-3xl">
              👤 사용자 프로필
            </h1>
            <p className="text-sm text-gray-600 sm:text-base">
              예매한 공연 정보를 확인하고 관리하세요
            </p>
          </div>

          {/* 사용자 정보 카드 */}
          <div className="mb-6 rounded-lg bg-white p-4 shadow-lg sm:mb-8 sm:p-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-800 sm:mb-4 sm:text-xl">
              기본 정보
            </h2>
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              <div>
                <span className="text-sm text-gray-600 sm:text-base">
                  사용자 ID:
                </span>
                <span className="ml-2 text-sm font-medium sm:text-base">
                  사용자
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600 sm:text-base">
                  가입일:
                </span>
                <span className="ml-2 text-sm font-medium sm:text-base">
                  2024년 8월
                </span>
              </div>
            </div>
          </div>

          {/* 예매 현황 */}
          <div className="rounded-lg bg-white p-4 shadow-lg sm:p-6">
            <div className="mb-4 flex flex-col space-y-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <h2 className="text-lg font-semibold text-gray-800 sm:text-xl">
                🎭 예매 현황
              </h2>
              <button
                onClick={() => window.location.reload()}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 sm:w-auto sm:text-base"
              >
                새로고침
              </button>
            </div>

            {isLoading ? (
              <div className="py-6 text-center sm:py-8">
                <LoadingSpinner
                  size="large"
                  text="예매 정보를 불러오는 중..."
                />
              </div>
            ) : userReservations.length === 0 ? (
              <div className="py-8 text-center sm:py-12">
                <div className="mb-3 text-4xl sm:mb-4 sm:text-6xl">🎫</div>
                <h3 className="mb-2 text-lg font-semibold text-gray-800 sm:text-xl">
                  아직 예매한 공연이 없습니다
                </h3>
                <p className="mb-4 text-sm text-gray-600 sm:mb-6 sm:text-base">
                  첫 번째 공연을 예매해보세요!
                </p>
                <a
                  href="/seats"
                  className="inline-block w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:w-auto sm:px-6 sm:py-3 sm:text-base"
                >
                  좌석 예매하기
                </a>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {userReservations.map((seat) => (
                  <div
                    key={seat.seat_number}
                    className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md sm:p-6"
                  >
                    <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
                      {/* 좌석 정보 */}
                      <div className="mb-3 flex-1 md:mb-0">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                          <div>
                            <span className="text-xs text-gray-600 sm:text-sm">
                              공연명
                            </span>
                            <p className="text-sm font-semibold sm:text-base">
                              오페라 갈라 콘서트
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600 sm:text-sm">
                              공연일
                            </span>
                            <p className="text-sm font-semibold sm:text-base">
                              2024년 12월 25일
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600 sm:text-sm">
                              좌석 번호
                            </span>
                            <p className="font-semibold text-blue-600">
                              {seat.seat_number}번
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-600 sm:text-sm">
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
