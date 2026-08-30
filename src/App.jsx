import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import StaffDashboard from './pages/StaffDashboard';
import KitchenDashboard from './pages/KitchenDashboard';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user?.phone);

  const renderDashboard = () => {
    if (!isAuthenticated) return <Login />;
    if (user.role === 'staff' || user.role === 'employee') return <StaffDashboard />;
    if (user.role === 'kitchen') return <KitchenDashboard />;
    if (user.role === 'admin') return <AdminDashboard />;
    return <Login />;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Mọi thứ đều hiển thị trực tiếp trên URL gốc / giúp PWA khóa chặt không bị bật thanh Safari */}
        <Route path="/" element={renderDashboard()} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}