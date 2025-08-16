import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useReservation } from '../contexts/ReservationContext';
import { seatsAPI } from '../api/services';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Seat } from '../types';
import type { ApiError } from '../api/client';

const SeatSelectionPage: React.FC = () => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);

  const { setSelectedSeat: setGlobalSelectedSeat } = useReservation();
  const navigate = useNavigate();

  // 좌석 데이터 가져오기
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        setIsLoading(true);
        const seatsData = await seatsAPI.getSeats();
        setSeats(seatsData);
      } catch (err) {
        console.error('좌석 정보 로딩 에러 상세:', err);

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
          toast.error('좌석 정보를 불러오는데 실패했습니다.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeats();
  }, []);

  // 좌석 선택 처리
  const handleSeatClick = (seat: Seat) => {
    if (seat.is_reserved) {
      return; // 이미 예약된 좌석은 클릭 불가
    }

    if (selectedSeat === seat.seat_number) {
      // 같은 좌석을 다시 클릭하면 선택 해제
      setSelectedSeat(null);
      setGlobalSelectedSeat(null);
    } else {
      // 새로운 좌석 선택
      setSelectedSeat(seat.seat_number);
      setGlobalSelectedSeat(seat.seat_number);
    }
  };

  // 예매 정보 확인 페이지로 이동
  const handleReservation = () => {
    if (selectedSeat) {
      navigate('/reservation');
    }
  };

  // 3x3 격자로 좌석 렌더링
  const renderSeatGrid = () => {
    const gridSeats = [];

    for (let row = 1; row <= 3; row++) {
      for (let col = 1; col <= 3; col++) {
        const seatNumber = (row - 1) * 3 + col;
        const seat = seats.find((s) => s.seat_number === seatNumber);

        if (seat) {
          const isSelected = selectedSeat === seat.seat_number;
          const isReserved = seat.is_reserved;

          let seatClass =
            'w-16 h-16 m-1 rounded-lg flex items-center justify-center text-white font-bold cursor-pointer transition-all duration-200 transform hover:scale-105 sm:w-20 sm:h-20 sm:m-2 ';

          if (isReserved) {
            seatClass += 'bg-gray-400 cursor-not-allowed hover:scale-100';
          } else if (isSelected) {
            seatClass += 'bg-green-500 shadow-lg';
          } else {
            seatClass += 'bg-blue-500 hover:bg-blue-600';
          }

          gridSeats.push(
            <div
              key={seatNumber}
              className={seatClass}
              onClick={() => handleSeatClick(seat)}
              title={`${row}행 ${col}열 - 좌석 ${seatNumber}번`}
            >
              <div className="text-center">
                <div className="text-xs sm:text-sm">{seatNumber}</div>
                <div className="text-xs opacity-75">
                  {row}-{col}
                </div>
              </div>
            </div>,
          );
        }
      }
    }

    return gridSeats;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <LoadingSpinner size="large" text="좌석 정보를 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="mb-2 text-2xl font-bold text-gray-800 sm:mb-4 sm:text-3xl">
            좌석 선택
          </h1>
          <p className="text-sm text-gray-600 sm:text-base">
            원하는 좌석을 선택하고 예매를 진행하세요
          </p>
        </div>

        {/* 좌석 상태 안내 */}
        <div className="mb-6 flex flex-wrap justify-center gap-3 sm:mb-8 sm:gap-6">
          <div className="flex items-center">
            <div className="mr-2 h-4 w-4 rounded bg-blue-500 sm:h-6 sm:w-6"></div>
            <span className="text-xs text-gray-700 sm:text-sm">예약 가능</span>
          </div>
          <div className="flex items-center">
            <div className="mr-2 h-4 w-4 rounded bg-green-500 sm:h-6 sm:w-6"></div>
            <span className="text-xs text-gray-700 sm:text-sm">선택됨</span>
          </div>
          <div className="flex items-center">
            <div className="mr-2 h-4 w-4 rounded bg-gray-400 sm:h-6 sm:w-6"></div>
            <span className="text-xs text-gray-700 sm:text-sm">예약됨</span>
          </div>
        </div>

        {/* 좌석 격자 */}
        <div className="mb-6 flex justify-center sm:mb-8">
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-white p-3 shadow-lg sm:gap-2 sm:p-6">
            {renderSeatGrid()}
          </div>
        </div>

        {/* 예매 정보 확인 버튼 */}
        <div className="text-center">
          {selectedSeat ? (
            <div className="space-y-3 sm:space-y-4">
              <p className="text-base text-gray-700 sm:text-lg">
                선택된 좌석:{' '}
                <span className="font-bold text-blue-600">
                  {selectedSeat}번
                </span>
              </p>
              <button
                onClick={handleReservation}
                className="w-full rounded-lg bg-green-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-colors hover:bg-green-700 hover:shadow-xl sm:w-auto sm:px-8 sm:text-lg"
              >
                선택 확정
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-500 sm:text-base">
              예매할 좌석을 선택해주세요
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
