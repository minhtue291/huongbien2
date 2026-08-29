import React, { useState, useEffect } from 'react';
import { PlusOutlined, ClockCircleOutlined, EditOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons';

function TableTimer({ startTime }) {
    const [elapsed, setElapsed] = useState('');
    const [isOverAnHour, setIsOverAnHour] = useState(false);

    useEffect(() => {
        if (!startTime) return;

        const updateTimer = () => {
            const now = Date.now();
            const diffSec = Math.floor((now - startTime) / 1000);

            const hours = Math.floor(diffSec / 3600);
            const minutes = Math.floor((diffSec % 3600) / 60);
            const seconds = diffSec % 60;

            if (hours > 0) {
                setIsOverAnHour(true);
                setElapsed(`${hours}h ${minutes}p`);
            } else {
                setIsOverAnHour(false);
                setElapsed(`${minutes}p ${seconds < 10 ? '0' : ''}${seconds}s`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [startTime]);

    return (
        <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${isOverAnHour ? 'text-rose-200 font-bold' : 'text-blue-100'}`}>
            <ClockCircleOutlined />
            {elapsed}
        </span>
    );
}

export default function StaffTable({
    tables,
    onOpenTableOrder,
    onOpenAddModal,
    onEditTable,
    onDeleteTable,
    orderItems
}) {
    // Quản lý trạng thái đang mở chế độ chọn bàn để "edit" hay "delete"
    const [actionModalType, setActionModalType] = useState(null); // 'edit' hoặc 'delete'

    const sortTables = (list) => {
        return [...list].sort((a, b) => {
            const nameA = a.name.trim();
            const nameB = b.name.trim();

            const isANumber = /^\d/.test(nameA);
            const isBNumber = /^\d/.test(nameB);

            if (!isANumber && isBNumber) return -1;
            if (isANumber && !isBNumber) return 1;

            return nameA.localeCompare(nameB, 'vi', { numeric: true, sensitivity: 'base' });
        });
    };

    const bookedTables = sortTables(tables.filter(t => !/^\d/.test(t.name.trim())));
    const outdoorTables = sortTables(tables.filter(t => /^\d/.test(t.name.trim()) && t.area === 'outdoor'));
    const indoorTables = sortTables(tables.filter(t => /^\d/.test(t.name.trim()) && t.area === 'indoor'));

    const renderTableSection = (listTables) => {
        if (listTables.length === 0) return null;

        return (
            <div className="grid grid-cols-2 gap-2.5">
                {listTables.map((table) => {
                    const tableCart = orderItems?.[table.id] || [];
                    const isOccupied = tableCart.length > 0;
                    const totalPrice = tableCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                    return (
                        <div
                            key={table.id}
                            onClick={() => onOpenTableOrder(table)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                                isOccupied
                                    ? 'bg-blue-500 border-blue-400 text-white shadow-sm'
                                    : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                            }`}
                        >
                            <div className="flex flex-col min-w-0">
                                <span className={`font-bold text-sm truncate ${isOccupied ? 'text-white' : 'text-slate-800'}`}>
                                    {table.name}
                                </span>
                                <div className="text-xs mt-1">
                                    {isOccupied ? (
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-amber-300 text-xs">
                                                {totalPrice.toLocaleString('vi-VN')}đ
                                            </span>
                                            {table.startTime && <TableTimer startTime={table.startTime} />}
                                        </div>
                                    ) : (
                                        <span className="text-slate-400">Trống</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-4 pb-6 relative">
            {/* Hàng nút điều khiển chung ở trên cùng */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onOpenAddModal}
                    className="flex-1 py-2.5 border border-dashed border-slate-300 rounded-xl text-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 bg-white hover:border-slate-400 hover:text-slate-900 transition-all shadow-xs"
                >
                    <PlusOutlined /> Thêm bàn mới
                </button>

                <button
                    onClick={() => setActionModalType('edit')}
                    className="px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-700 text-xs font-medium flex items-center gap-1 bg-white hover:bg-slate-50 transition-all shadow-xs"
                    title="Chọn bàn để sửa"
                >
                    <EditOutlined /> Sửa
                </button>

                <button
                    onClick={() => setActionModalType('delete')}
                    className="px-3.5 py-2.5 border border-slate-300 rounded-xl text-rose-600 text-xs font-medium flex items-center gap-1 bg-white hover:bg-rose-50 transition-all shadow-xs"
                    title="Chọn bàn để xoá"
                >
                    <DeleteOutlined /> Xoá
                </button>
            </div>

            {/* Modal thu nhỏ cho phép người dùng chọn bàn cần Sửa hoặc Xoá */}
            {actionModalType && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 shadow-sm flex flex-col gap-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">
                            {actionModalType === 'edit' ? 'Chọn bàn cần sửa tên:' : 'Chọn bàn cần xoá:'}
                        </span>
                        <button 
                            onClick={() => setActionModalType(null)}
                            className="text-slate-400 hover:text-slate-600 p-1"
                        >
                            <CloseOutlined className="text-xs" />
                        </button>
                    </div>

                    <div className="max-h-48 overflow-y-auto flex flex-col gap-1.5 pr-1">
                        {tables.length === 0 ? (
                            <span className="text-xs text-slate-400 text-center py-2">Không có bàn nào</span>
                        ) : (
                            sortTables(tables).map((table) => (
                                <div
                                    key={table.id}
                                    onClick={() => {
                                        if (actionModalType === 'edit' && onEditTable) {
                                            onEditTable(table);
                                        } else if (actionModalType === 'delete' && onDeleteTable) {
                                            onDeleteTable(table);
                                        }
                                        setActionModalType(null);
                                    }}
                                    className="flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition-all"
                                >
                                    <span className="text-xs font-medium text-slate-800">{table.name}</span>
                                    <span className="text-[11px] text-blue-600 font-medium">Chọn bàn này &rarr;</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {renderTableSection(bookedTables)}
            {renderTableSection(outdoorTables)}
            {renderTableSection(indoorTables)}

            {tables.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                    Chưa có bàn nào trong hệ thống.
                </div>
            )}
        </div>
    );
}