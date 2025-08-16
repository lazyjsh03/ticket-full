import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useReservation } from '../contexts/ReservationContext';
import { seatsAPI } from '../api/services';
import { InlineSpinner } from '../components/LoadingSpinner';
import ReservationResultModal from '../components/ReservationResultModal';
import type { ApiError } from '../api/client';

const ReservationConfirmPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  // 사용자 정보 입력 상태 추가
  const [userInfo, setUserInfo] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [showUserForm, setShowUserForm] = useState(true);

  // 예매 결과 모달 상태
  const [showResultModal, setShowResultModal] = useState(false);

  const { selectedSeat, clearSelection } = useReservation();
  const navigate = useNavigate();

  // 선택된 좌석이 없으면 좌석 선택 페이지로 리디렉션
  useEffect(() => {
    if (!selectedSeat) {
      navigate('/seats');
    }
  }, [selectedSeat, navigate]);

  // 사용자 정보 입력 처리
  const handleUserInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 사용자 정보 제출 처리
  const handleUserInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 필드 검증
    if (!userInfo.name.trim() || !userInfo.phone.trim()) {
      toast.error('이름과 전화번호는 필수 입력 항목입니다.');
      return;
    }

    // 전화번호 형식 검증 (간단한 검증)
    const phoneRegex = /^[0-9-+\s()]+$/;
    if (!phoneRegex.test(userInfo.phone)) {
      toast.error('올바른 전화번호 형식을 입력해주세요.');
      return;
    }

    // 사용자 정보 입력 완료
    setShowUserForm(false);
  };

  // 예약 확정 처리
  const handleConfirmReservation = async () => {
    if (!selectedSeat) return;

    setIsLoading(true);

    try {
      const response = await seatsAPI.reserveSeat(selectedSeat);

      console.log('예약 API 응답:', response);

      // 백엔드 응답에 message 필드가 있으면 성공으로 처리
      if (response.message) {
        // 예매 결과 모달 표시
        setShowResultModal(true);

        // 자동 리디렉션 제거 - 사용자가 모달에서 확인 버튼을 누를 때까지 대기
      } else {
        toast.error('예약에 실패했습니다.');
      }
    } catch (error: unknown) {
      console.error('예약 에러 상세:', error);

      // ApiError 타입인지 확인
      if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        'message' in error
      ) {
        const apiError = error as ApiError;

        // 서버 에러 (500, 502, 503, 504)인 경우
        if (apiError.isServerError) {
          toast.error(`${apiError.message} (오류 코드: ${apiError.status})`);

          // 서버 에러 시 사용자에게 재시도 안내
          setTimeout(() => {
            toast.error(
              '잠시 후 다시 시도해주세요. 문제가 지속되면 고객센터에 문의해주세요.',
              {
                duration: 6000,
              },
            );
          }, 2000);
        }
        // 클라이언트 에러 (400, 401, 403, 404, 409, 422)인 경우
        else if (apiError.isClientError) {
          toast.error(apiError.message);

          // 409 (이미 예약됨) 에러인 경우 좌석 선택 페이지로 이동 안내
          if (apiError.status === 409) {
            setTimeout(() => {
              toast.error('다른 좌석을 선택해주세요.', { duration: 4000 });
            }, 2000);
          }
        }
        // 네트워크 에러인 경우
        else if (apiError.isNetworkError) {
          toast.error(apiError.message);

          setTimeout(() => {
            toast.error('인터넷 연결을 확인하고 다시 시도해주세요.', {
              duration: 4000,
            });
          }, 2000);
        }
        // 기타 에러
        else {
          toast.error(apiError.message || '예약에 실패했습니다.');
        }
      }
      // 일반 Error 객체인 경우
      else if (error instanceof Error) {
        toast.error(error.message);
      }
      // 알 수 없는 에러
      else {
        toast.error('예약에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 좌석 선택 페이지로 돌아가기
  const handleGoBack = () => {
    navigate('/seats');
  };

  // 사용자 정보 입력 폼으로 돌아가기
  const handleEditUserInfo = () => {
    setShowUserForm(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setShowResultModal(false);
    // 모달 닫기 후 좌석 선택 페이지로 리디렉션
    clearSelection();
    navigate('/seats');
  };

  if (!selectedSeat) {
    return null; // 리디렉션 중
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <div className="mb-6 text-center sm:mb-8">
              <h1 className="mb-2 text-2xl font-bold text-gray-800 sm:mb-4 sm:text-3xl">
                예매 정보 확인
              </h1>
              <p className="text-sm text-gray-600 sm:text-base">
                선택하신 좌석 정보를 확인하고 예매를 확정하세요
              </p>
            </div>

            {/* 예매 정보 카드 */}
            <div className="mb-6 rounded-lg bg-white p-4 shadow-lg sm:mb-8 sm:p-8">
              <div className="mb-4 text-center sm:mb-6">
                <div className="mb-2 text-4xl sm:mb-4 sm:text-6xl">🎭</div>
                <h2 className="mb-1 text-xl font-semibold text-gray-800 sm:mb-2 sm:text-2xl">
                  공연 좌석 예매
                </h2>
              </div>

              <div className="mb-4 space-y-3 sm:mb-6 sm:space-y-4">
                <div className="flex flex-col space-y-1 border-b border-gray-200 py-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:py-3">
                  <span className="text-sm font-medium text-gray-600 sm:text-base">
                    선택된 좌석
                  </span>
                  <span className="text-xl font-bold text-blue-600 sm:text-2xl">
                    {selectedSeat}번
                  </span>
                </div>

                <div className="flex flex-col space-y-1 border-b border-gray-200 py-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:py-3">
                  <span className="text-sm font-medium text-gray-600 sm:text-base">
                    좌석 위치
                  </span>
                  <span className="text-gray-800 sm:text-base">
                    {Math.ceil(selectedSeat / 3)}행{' '}
                    {((selectedSeat - 1) % 3) + 1}열
                  </span>
                </div>

                <div className="flex flex-col space-y-1 border-b border-gray-200 py-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:py-3">
                  <span className="text-sm font-medium text-gray-600 sm:text-base">
                    예매 상태
                  </span>
                  <span className="font-medium text-green-600 sm:text-base">
                    예매 대기
                  </span>
                </div>
              </div>

              {/* 사용자 정보 입력 폼 */}
              {showUserForm && (
                <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 sm:mb-6 sm:p-6">
                  <h3 className="mb-3 text-base font-semibold text-blue-800 sm:mb-4 sm:text-lg">
                    예매자 정보 입력
                  </h3>
                  <form
                    onSubmit={handleUserInfoSubmit}
                    className="space-y-3 sm:space-y-4"
                  >
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        이름 *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={userInfo.name}
                        onChange={handleUserInfoChange}
                        required
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-base"
                        placeholder="예매자 이름을 입력하세요"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        전화번호 *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={userInfo.phone}
                        onChange={handleUserInfoChange}
                        required
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-base"
                        placeholder="010-1234-5678"
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
                        type="email"
                        id="email"
                        name="email"
                        value={userInfo.email}
                        onChange={handleUserInfoChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-base"
                        placeholder="example@email.com"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:text-base"
                    >
                      정보 입력 완료
                    </button>
                  </form>
                </div>
              )}

              {/* 사용자 정보 표시 */}
              {!showUserForm && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 sm:mb-6 sm:p-6">
                  <h3 className="mb-3 text-base font-semibold text-green-800 sm:mb-4 sm:text-lg">
                    입력된 예매자 정보
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex flex-col space-y-1 sm:flex-row sm:justify-between sm:space-y-0">
                      <span className="text-gray-600">이름:</span>
                      <span className="font-medium">{userInfo.name}</span>
                    </div>
                    <div className="flex flex-col space-y-1 sm:flex-row sm:justify-between sm:space-y-0">
                      <span className="text-gray-600">전화번호:</span>
                      <span className="font-medium">{userInfo.phone}</span>
                    </div>
                    {userInfo.email && (
                      <div className="flex flex-col space-y-1 sm:flex-row sm:justify-between sm:space-y-0">
                        <span className="text-gray-600">이메일:</span>
                        <span className="font-medium">{userInfo.email}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleEditUserInfo}
                    className="mt-3 text-sm text-blue-600 underline hover:text-blue-800"
                  >
                    정보 수정하기
                  </button>
                </div>
              )}

              {/* 버튼 그룹 */}
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleGoBack}
                  className="flex-1 rounded-lg bg-gray-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-gray-700 sm:px-6 sm:text-base"
                >
                  좌석 다시 선택
                </button>

                <button
                  onClick={handleConfirmReservation}
                  disabled={isLoading || showUserForm}
                  className="flex-1 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400 sm:px-6 sm:text-base"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <InlineSpinner size="small" />
                      <span>예약 중...</span>
                    </div>
                  ) : (
                    '최종 예약 확정'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 예매 결과 모달 */}
      <ReservationResultModal
        isOpen={showResultModal}
        onClose={handleCloseModal}
        seatNumber={selectedSeat}
        userInfo={userInfo}
      />
    </>
  );
};

export default ReservationConfirmPage;
