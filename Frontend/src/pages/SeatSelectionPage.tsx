import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReservation } from '../contexts/ReservationContext';
import { seatsAPI } from '../api/services';
import type { Seat } from '../types';

const SeatSelectionPage: React.FC = () => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
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
        setError('좌석 정보를 불러오는데 실패했습니다.');
        console.error('Failed to fetch seats:', err);
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
            'w-20 h-20 m-2 rounded-lg flex items-center justify-center text-white font-bold cursor-pointer transition-all duration-200 transform hover:scale-105 ';

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
                <div className="text-sm">{seatNumber}</div>
                <div className="text-xs">
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-xl">좌석 정보를 불러오는 중...</div>
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-xl text-red-600">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-800">좌석 선택</h1>
          <p className="text-gray-600">
            원하는 좌석을 선택하고 예매를 진행하세요
          </p>
        </div>

        {/* 좌석 상태 안내 */}
        <div className="mb-8 flex justify-center">
          <div className="flex space-x-6">
            <div className="flex items-center">
              <div className="mr-2 h-6 w-6 rounded bg-blue-500"></div>
              <span className="text-sm text-gray-700">예약 가능</span>
            </div>
            <div className="flex items-center">
              <div className="mr-2 h-6 w-6 rounded bg-green-500"></div>
              <span className="text-sm text-gray-700">선택됨</span>
            </div>
            <div className="flex items-center">
              <div className="mr-2 h-6 w-6 rounded bg-gray-400"></div>
              <span className="text-sm text-gray-700">예약됨</span>
            </div>
          </div>
        </div>

        {/* 좌석 격자 */}
        <div className="mb-8 flex justify-center">
          <div className="grid grid-cols-3 gap-2 rounded-lg bg-white p-6 shadow-lg">
            {renderSeatGrid()}
          </div>
        </div>

        {/* 예매 정보 확인 버튼 */}
        <div className="text-center">
          {selectedSeat ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-700">
                선택된 좌석:{' '}
                <span className="font-bold text-blue-600">
                  {selectedSeat}번
                </span>
              </p>
              <button
                onClick={handleReservation}
                className="rounded-lg bg-green-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-green-700 hover:shadow-xl"
              >
                선택 확정
              </button>
            </div>
          ) : (
            <p className="text-gray-500">예매할 좌석을 선택해주세요</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
