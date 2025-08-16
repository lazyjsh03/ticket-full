import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ReservationProvider } from './contexts/ReservationContext';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import ReservationConfirmPage from './pages/ReservationConfirmPage';
import UserProfilePage from './pages/UserProfilePage';
import './App.css';

// 페이지 로딩 중 표시할 컴포넌트
const PageLoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50">
    <LoadingSpinner size="large" text="페이지를 불러오는 중..." />
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <ReservationProvider>
          <div className="App">
            <Header />
            <main>
              <Suspense fallback={<PageLoadingFallback />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/seats" element={<SeatSelectionPage />} />
                  <Route
                    path="/reservation"
                    element={
                      <ProtectedRoute>
                        <ReservationConfirmPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <UserProfilePage />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Suspense>
            </main>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  maxWidth: '90vw',
                  fontSize: '14px',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </ReservationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
