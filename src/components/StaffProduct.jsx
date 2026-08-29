import React from 'react';
import { ShopOutlined, ReloadOutlined } from '@ant-design/icons';

export default function StaffProduct({ menuItems, loadingMenu, onRefreshMenu }) {
  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-1">
        <button 
          onClick={onRefreshMenu}
          className="text-xs text-sky-600 font-semibold flex items-center gap-1 hover:underline"
        >
        </button>
      </div>

      {loadingMenu ? (
        <div className="text-center py-12 text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
          Đang tải thực đơn từ hệ thống...
        </div>
      ) : menuItems.length === 0 ? (
        <div className="text-center py-12 text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
          Chưa có sản phẩm nào được thiết lập.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {menuItems.map((dish) => (
            <div key={dish.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 flex justify-between items-center shadow-xs">
              <div>
                <div className="font-bold text-xs text-slate-800 mb-0.5">{dish.name}</div>
                <div className="text-[11px] text-slate-500">
                  {Number(dish.price).toLocaleString('vi-VN')} VNĐ / {dish.unit || (dish.category === 'Hải sản' ? 'kg' : 'phần')} • <span className="text-sky-600 font-medium">{dish.category}</span>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${dish.status === 'Còn hàng' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {dish.status || 'Còn hàng'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}