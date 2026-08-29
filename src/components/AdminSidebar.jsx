import React, { useState } from 'react';
import { 
  LineChartOutlined, 
  ShoppingOutlined, 
  TeamOutlined, 
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminSidebar({ activeTab, setActiveTab }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const menuItems = [
    { key: '1', label: 'Doanh thu', icon: <LineChartOutlined /> },
    { key: '2', label: 'Quản lý sản phẩm', icon: <ShoppingOutlined /> },
    { key: '3', label: 'Quản lý nhân viên', icon: <TeamOutlined /> },
  ];

  return (
    <aside className={`bg-[#0a192f] text-slate-300 flex flex-col sticky top-0 h-screen shadow-2xl z-20 flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Header Sidebar: Tên thương hiệu căn giữa & Nút Đóng/Mở */}
      <div className={`h-20 px-4 flex items-center border-b border-white/10 ${collapsed ? 'justify-center px-0' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex flex-col items-center flex-1 text-center overflow-hidden">
            <span className="text-white font-extrabold text-base tracking-wider whitespace-nowrap">
              HƯƠNG BIỂN
            </span>
          </div>
        )}

        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all flex-shrink-0"
          title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        >
          {collapsed ? <MenuUnfoldOutlined className="text-lg" /> : <MenuFoldOutlined className="text-lg" />}
        </button>
      </div>

      {/* Danh sách menu điều hướng */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              title={collapsed ? item.label : ''}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-medium text-sm transition-all duration-200 group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              } ${collapsed ? 'justify-center px-2' : ''}`}
            >
              <span className={`text-lg flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`}>
                {item.icon}
              </span>
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Nút Đăng xuất */}
      <div className="p-4 border-t border-white/10 bg-[#071120]/60 backdrop-blur-md">
        <button
          onClick={handleLogout}
          title={collapsed ? "Đăng xuất" : ""}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold text-xs text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-md shadow-rose-500/25 active:scale-95 transition-all ${collapsed ? 'px-2' : ''}`}
        >
          <LogoutOutlined className="text-base flex-shrink-0" />
          {!collapsed && <span className="whitespace-nowrap tracking-wide">ĐĂNG XUẤT</span>}
        </button>
      </div>
    </aside>
  );
}