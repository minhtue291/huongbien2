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

  const getDashboardByRole = () => {
    if (!isAuthenticated) return <Login />;
    if (user.role === 'staff' || user.role === 'employee') return <StaffDashboard />;
    if (user.role === 'kitchen') return <KitchenDashboard />;
    if (user.role === 'admin') return <AdminDashboard />;
    return <Login />;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Đường dẫn gốc / sẽ trực tiếp hiển thị Dashboard nếu đã đăng nhập hoặc Login nếu chưa */}
        <Route path="/" element={getDashboardByRole()} />

        {/* Giữ lại route /login dự phòng */}
        <Route 
          path="/login" 
          element={
            !isAuthenticated ? (
              <Login />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        
        <Route 
          path="/staff" 
          element={
            isAuthenticated && (user.role === 'staff' || user.role === 'employee') 
              ? <StaffDashboard /> 
              : <Navigate to="/" replace />
          } 
        />
        
        <Route 
          path="/kitchen" 
          element={
            isAuthenticated && user.role === 'kitchen' 
              ? <KitchenDashboard /> 
              : <Navigate to="/" replace />
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            isAuthenticated && user.role === 'admin' 
              ? <AdminDashboard /> 
              : <Navigate to="/" replace />
          } 
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}