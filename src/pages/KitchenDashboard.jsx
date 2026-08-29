import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

export default function KitchenDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-4 max-w-md w-full">
        <h1 className="text-xl font-bold text-slate-800 m-0">Trang Quản Trị Bếp</h1>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all shadow-sm"
        >
          <LogoutOutlined />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}