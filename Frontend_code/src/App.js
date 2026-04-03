import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import AdPlayer from './pages/AdPlayerPage';
import HomePage from './pages/HomePage';
import BaggageCheckPage from './pages/BaggageCheckPage';
import Maintenance from './pages/MaintenancePage';
import LoginPage from './pages/LoginPage';

function App() {
  // Disable pinch‑zoom and drag gestures
  useEffect(() => {
    const preventTouchMove = (e) => {
      // Only block if the element is not explicitly scrollable (customize as needed)
      if (!e.target.closest('.scrollable')) {
        e.preventDefault();
      }
    };
    window.addEventListener('touchmove', preventTouchMove, { passive: false });
    window.addEventListener('dragstart', (e) => e.preventDefault());

    return () => {
      window.removeEventListener('touchmove', preventTouchMove);
      window.removeEventListener('dragstart', (e) => e.preventDefault());
    };
  }, []);

  return (
    <Router>
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          userSelect: 'none',          // Prevent text selection
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          touchAction: 'none',         // Disable pinch‑zoom and panning
          WebkitUserDrag: 'none',      // Prevent dragging images/elements
        }}
      >
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/ad_player" element={<AdPlayer />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/baggageCheckPage" element={<BaggageCheckPage />} />
          <Route path="/maintenance" element={<Maintenance />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;