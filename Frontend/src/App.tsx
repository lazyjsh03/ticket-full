import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ReservationProvider } from './contexts/ReservationContext';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import ReservationConfirmPage from './pages/ReservationConfirmPage';
import UserProfilePage from './pages/UserProfilePage';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ReservationProvider>
          <div className="App">
            <Header />
            <main>
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
            </main>
          </div>
        </ReservationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
