import React from 'react';

interface UserInfo {
  name: string;
  phone: string;
  email: string;
}

interface ReservationResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  seatNumber: number;
  userInfo: UserInfo;
}

const ReservationResultModal: React.FC<ReservationResultModalProps> = ({
  isOpen,
  onClose,
  seatNumber,
  userInfo,
}) => {
  if (!isOpen) return null;

  // 좌석 위치 계산
  const row = Math.ceil(seatNumber / 3);
  const col = ((seatNumber - 1) % 3) + 1;

  // 3x3 좌석 격자 렌더링
  const renderSeatGrid = () => {
    const gridSeats = [];

    for (let r = 1; r <= 3; r++) {
      for (let c = 1; c <= 3; c++) {
        const currentSeatNumber = (r - 1) * 3 + c;
        const isReserved = currentSeatNumber === seatNumber;

        let seatClass =
          'w-12 h-12 m-0.5 rounded-lg flex items-center justify-center text-white font-bold text-xs transition-all duration-200 sm:w-16 sm:h-16 sm:m-1 sm:text-sm ';

        if (isReserved) {
          seatClass += 'bg-red-500 shadow-lg scale-110';
        } else {
          seatClass += 'bg-gray-300';
        }

        gridSeats.push(
          <div
            key={currentSeatNumber}
            className={seatClass}
            title={`${r}행 ${c}열 - 좌석 ${currentSeatNumber}번`}
          >
            <div className="text-center">
              <div className="text-xs sm:text-sm">
                {r}-{c}
              </div>
            </div>
          </div>,
        );
      }
    }

    return gridSeats;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/50 p-2 sm:p-4">
      <div className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-xl sm:max-w-2xl">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4 sm:p-6">
          <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
            🎭 예매 완료
          </h2>
          <button
            onClick={onClose}
            className="text-xl font-bold text-gray-400 hover:text-gray-600 sm:text-2xl"
          >
            ×
          </button>
        </div>

        {/* 모달 내용 */}
        <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
          {/* 공연 정보 */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 sm:p-4">
            <h3 className="mb-2 text-base font-semibold text-blue-800 sm:mb-3 sm:text-lg">
              공연 정보
            </h3>
            <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 sm:gap-4 sm:text-sm">
              <div>
                <span className="text-gray-600">공연명:</span>
                <span className="ml-2 font-medium">오페라 갈라 콘서트</span>
              </div>
              <div>
                <span className="text-gray-600">공연일:</span>
                <span className="ml-2 font-medium">2024년 12월 25일</span>
              </div>
              <div>
                <span className="text-gray-600">공연시간:</span>
                <span className="ml-2 font-medium">오후 7:30</span>
              </div>
              <div>
                <span className="text-gray-600">공연장:</span>
                <span className="ml-2 font-medium">예술의전당</span>
              </div>
            </div>
          </div>

          {/* 좌석 정보 */}
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 sm:p-4">
            <h3 className="mb-2 text-base font-semibold text-green-800 sm:mb-3 sm:text-lg">
              좌석 정보
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <span className="text-gray-600">선택된 좌석:</span>
                <span className="text-lg font-bold text-green-600 sm:text-xl">
                  {seatNumber}번
                </span>
              </div>
              <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <span className="text-gray-600">좌석 위치:</span>
                <span className="font-medium">
                  {row}행 {col}열
                </span>
              </div>

              {/* 좌석 격자 */}
              <div className="mt-3 sm:mt-4">
                <p className="mb-2 text-xs text-gray-600 sm:text-sm">
                  좌석 배치도 (🔴 = 예매된 좌석)
                </p>
                <div className="flex justify-center">
                  <div className="grid grid-cols-3 gap-0.5 rounded-lg bg-white p-2 shadow-inner sm:gap-1 sm:p-3">
                    {renderSeatGrid()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 예매자 정보 */}
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 sm:p-4">
            <h3 className="mb-2 text-base font-semibold text-purple-800 sm:mb-3 sm:text-lg">
              예매자 정보
            </h3>
            <div className="space-y-1 text-xs sm:space-y-2 sm:text-sm">
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
          </div>

          {/* 주의사항 */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 sm:p-4">
            <h3 className="mb-2 text-base font-semibold text-yellow-800 sm:mb-3 sm:text-lg">
              ⚠️ 주의사항
            </h3>
            <ul className="space-y-1 text-xs text-yellow-700 sm:space-y-2 sm:text-sm">
              <li>• 예약 확정 후에는 좌석 변경이 불가능합니다.</li>
              <li>• 공연 시작 30분 전까지 입장해주세요.</li>
              <li>• 예약 확인을 위해 신분증을 지참해주세요.</li>
              <li>• 문의사항이 있으시면 고객센터로 연락해주세요.</li>
              <li>• 예매 취소는 공연 3일 전까지 가능합니다.</li>
            </ul>
          </div>

          {/* 예매 번호 */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center sm:p-4">
            <p className="mb-1 text-xs text-gray-600 sm:text-sm">예매 번호</p>
            <p className="font-mono text-lg font-bold text-gray-800 sm:text-2xl">
              {Date.now().toString().slice(-8)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              예매 확인 시 위 번호를 사용하세요
            </p>
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="flex justify-end border-t border-gray-200 p-4 sm:p-6">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:w-auto sm:px-6 sm:text-base"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationResultModal;
