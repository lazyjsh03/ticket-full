import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface ReservationContextType {
  selectedSeat: number | null;
  setSelectedSeat: (seatNumber: number | null) => void;
  clearSelection: () => void;
}

const ReservationContext = createContext<ReservationContextType | undefined>(
  undefined,
);

// eslint-disable-next-line react-refresh/only-export-components
export const useReservation = () => {
  const context = useContext(ReservationContext);
  if (context === undefined) {
    throw new Error('useReservation must be used within a ReservationProvider');
  }
  return context;
};

interface ReservationProviderProps {
  children: ReactNode;
}

export const ReservationProvider: React.FC<ReservationProviderProps> = ({
  children,
}) => {
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);

  const clearSelection = () => {
    setSelectedSeat(null);
  };

  const value: ReservationContextType = {
    selectedSeat,
    setSelectedSeat,
    clearSelection,
  };

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  );
};
