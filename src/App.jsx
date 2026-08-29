import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import StaffDashboard from './pages/StaffDashboard';
import KitchenDashboard from './pages/KitchenDashboard';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user.phone);

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={
            !isAuthenticated ? (
              <Login />
            ) : (
              <Navigate to={`/${user.role === 'employee' ? 'staff' : user.role}`} replace />
            )
          } 
        />
        
        <Route 
          path="/staff" 
          element={
            isAuthenticated && (user.role === 'staff' || user.role === 'employee') 
              ? <StaffDashboard /> 
              : <Navigate to="/login" replace />
          } 
        />
        
        <Route 
          path="/kitchen" 
          element={
            isAuthenticated && user.role === 'kitchen' 
              ? <KitchenDashboard /> 
              : <Navigate to="/login" replace />
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            isAuthenticated && user.role === 'admin' 
              ? <AdminDashboard /> 
              : <Navigate to="/login" replace />
          } 
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}