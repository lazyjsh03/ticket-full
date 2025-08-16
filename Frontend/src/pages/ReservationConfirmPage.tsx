import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReservation } from '../contexts/ReservationContext';
import { seatsAPI } from '../api/services';
import ReservationResultModal from '../components/ReservationResultModal';

const ReservationConfirmPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
      setError('이름과 전화번호는 필수 입력 항목입니다.');
      return;
    }

    // 전화번호 형식 검증 (간단한 검증)
    const phoneRegex = /^[0-9-+\s()]+$/;
    if (!phoneRegex.test(userInfo.phone)) {
      setError('올바른 전화번호 형식을 입력해주세요.');
      return;
    }

    // 사용자 정보 입력 완료
    setShowUserForm(false);
  };

  // 예약 확정 처리
  const handleConfirmReservation = async () => {
    if (!selectedSeat) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await seatsAPI.reserveSeat(selectedSeat);

      console.log('예약 API 응답:', response);

      // 백엔드 응답에 message 필드가 있으면 성공으로 처리
      if (response.message) {
        // 예매 결과 모달 표시
        setShowResultModal(true);

        // 자동 리디렉션 제거 - 사용자가 모달에서 확인 버튼을 누를 때까지 대기
      } else {
        setError('예약에 실패했습니다.');
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : '예약에 실패했습니다.';
      setError(errorMessage);
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
    setError('');
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <h1 className="mb-4 text-3xl font-bold text-gray-800">
                예매 정보 확인
              </h1>
              <p className="text-gray-600">
                선택하신 좌석 정보를 확인하고 예매를 확정하세요
              </p>
            </div>

            {/* 예매 정보 카드 */}
            <div className="mb-8 rounded-lg bg-white p-8 shadow-lg">
              <div className="mb-6 text-center">
                <div className="mb-4 text-6xl">🎭</div>
                <h2 className="mb-2 text-2xl font-semibold text-gray-800">
                  공연 좌석 예매
                </h2>
              </div>

              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 py-3">
                  <span className="font-medium text-gray-600">선택된 좌석</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {selectedSeat}번
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-200 py-3">
                  <span className="font-medium text-gray-600">좌석 위치</span>
                  <span className="text-gray-800">
                    {Math.ceil(selectedSeat / 3)}행{' '}
                    {((selectedSeat - 1) % 3) + 1}열
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-200 py-3">
                  <span className="font-medium text-gray-600">예매 상태</span>
                  <span className="font-medium text-green-600">예매 대기</span>
                </div>
              </div>

              {/* 사용자 정보 입력 폼 */}
              {showUserForm && (
                <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-6">
                  <h3 className="mb-4 text-lg font-semibold text-blue-800">
                    예매자 정보 입력
                  </h3>
                  <form onSubmit={handleUserInfoSubmit} className="space-y-4">
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
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="example@email.com"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      정보 입력 완료
                    </button>
                  </form>
                </div>
              )}

              {/* 사용자 정보 표시 */}
              {!showUserForm && (
                <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-6">
                  <h3 className="mb-4 text-lg font-semibold text-green-800">
                    입력된 예매자 정보
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">이름:</span>
                      <span className="font-medium">{userInfo.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">전화번호:</span>
                      <span className="font-medium">{userInfo.phone}</span>
                    </div>
                    {userInfo.email && (
                      <div className="flex justify-between">
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

              {/* 메시지 표시 */}
              {error && (
                <div
                  className={`mb-6 rounded-md p-4 ${
                    error
                      ? 'border border-red-200 bg-red-50 text-red-800'
                      : 'border border-green-200 bg-green-50 text-green-800'
                  }`}
                >
                  {error}
                </div>
              )}

              {/* 버튼 그룹 */}
              <div className="flex space-x-4">
                <button
                  onClick={handleGoBack}
                  className="flex-1 rounded-lg bg-gray-600 px-6 py-3 font-semibold text-white shadow-md transition-colors hover:bg-gray-700"
                >
                  좌석 다시 선택
                </button>

                <button
                  onClick={handleConfirmReservation}
                  disabled={isLoading || showUserForm}
                  className="flex-1 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white shadow-md transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400"
                >
                  {isLoading ? '예약 중...' : '최종 예약 확정'}
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
