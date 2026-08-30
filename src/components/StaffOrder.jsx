import React, { useState } from 'react';
import { Input, Modal, Spin, message } from 'antd';
import {
    SearchOutlined,
    PrinterOutlined,
    CheckCircleOutlined,
    EditOutlined,
    ArrowLeftOutlined,
    ShoppingOutlined,
    AppstoreOutlined,
    PlusOutlined
} from '@ant-design/icons';

export default function StaffOrder({
    selectedTable,
    onBack, // Quay lại danh sách bàn
    menuItems,
    loadingMenu,
    currentTableCart,
    totalAmount,
    onAddToCart,
    onUpdateQuantity,
    onCheckout,
    tableNote,
    onUpdateTableNote,
    onPrintKitchen,
    handlePrintNewKitchenOrder
}) {
    // State quản lý tab hiển thị: 'menu' (Thực đơn) hoặc 'cart' (Xem đơn)
    const [activeTab, setActiveTab] = useState('menu');

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tất cả');

    // Modal chỉnh số lượng / ghi chú khi bấm thêm món
    const [isQtyModalOpen, setIsQtyModalOpen] = useState(false);
    const [selectedDish, setSelectedDish] = useState(null);
    const [inputQuantity, setInputQuantity] = useState('1');
    const [itemNoteInput, setItemNoteInput] = useState('');

    const categories = ['Tất cả', ...new Set(menuItems.map(item => item.category).filter(Boolean))];

    const filteredMenuItems = menuItems.filter(item => {
        const matchesCategory = selectedCategory === 'Tất cả' || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleOpenQtyModal = (dish) => {
        setSelectedDish(dish);
        const defaultQty = dish.unit === 'kg' ? '0.5' : '1';
        setInputQuantity(defaultQty);
        setItemNoteInput('');
        setIsQtyModalOpen(true);
    };

    const handleConfirmAdd = () => {
        if (!selectedDish) return;
        let rawQty = parseFloat(inputQuantity);
        if (isNaN(rawQty) || rawQty <= 0) {
            message.error('Vui lòng nhập số lượng hợp lệ lớn hơn 0!');
            return;
        }
        const quantity = Math.round(rawQty * 100) / 100;

        onAddToCart({
            ...selectedDish,
            quantity: quantity,
            note: itemNoteInput.trim()
        });

        setIsQtyModalOpen(false);
        setSelectedDish(null);
        setInputQuantity('');
        setItemNoteInput('');
        message.success(`Đã thêm ${selectedDish.name} vào bàn!`);
    };

    // Kiểm tra xem có món nào chưa gửi bếp không
    const hasNewItemsToPrint = currentTableCart.some(item => !item.isPrinted);

    return (
        <div className="flex flex-col gap-3 pb-20 max-w-lg mx-auto">

            {/* 1. Header: Nút quay lại & Tên bàn */}
            <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                <button
                    onClick={onBack}
                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-all"
                >
                    <ArrowLeftOutlined />
                </button>
                <span className="font-bold text-slate-800 text-sm">
                    {selectedTable.name} {selectedTable.customerName ? `- ${selectedTable.customerName}` : ''}
                </span>
                <div className="w-9"></div>
            </div>

            {/* 2. Thanh chuyển đổi tab: [ Thực đơn ] và [ Xem đơn (X) ] */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl">
                <button
                    onClick={() => setActiveTab('menu')}
                    className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${activeTab === 'menu'
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-200/60'
                        }`}
                >
                    <AppstoreOutlined /> Thực đơn
                </button>

                <button
                    onClick={() => setActiveTab('cart')}
                    className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all relative ${activeTab === 'cart'
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-200/60'
                        }`}
                >
                    <ShoppingOutlined /> Xem đơn
                    {currentTableCart.length > 0 && (
                        <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${activeTab === 'cart' ? 'bg-white text-sky-600' : 'bg-rose-500 text-white'
                            }`}>
                            {currentTableCart.length}
                        </span>
                    )}
                </button>
            </div>

            {/* ================= TAB 1: THỰC ĐƠN ================= */}
            {activeTab === 'menu' && (
                <div className="flex flex-col gap-3">
                    {/* Ô tìm kiếm và danh mục */}
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                        <Input
                            placeholder="Tìm kiếm tên món..."
                            prefix={<SearchOutlined className="text-slate-400" />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            allowClear
                            className="rounded-xl text-xs py-2"
                        />

                        <div className="flex gap-1.5 overflow-x-auto pt-3 pb-1 scrollbar-none">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${selectedCategory === cat
                                            ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Danh sách món ăn dạng lưới (Grid 2 cột) */}
                    <div className="min-h-[300px]">
                        {loadingMenu ? (
                            <div className="text-center py-12"><Spin /></div>
                        ) : filteredMenuItems.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 text-xs italic bg-white rounded-2xl border border-slate-200">
                                Không tìm thấy món ăn phù hợp!
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2.5 max-h-[520px] overflow-y-auto pr-1">
                                {filteredMenuItems.map((dish) => (
                                    <div
                                        key={dish.id}
                                        onClick={() => handleOpenQtyModal(dish)}
                                        className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs hover:border-sky-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                                    >
                                        <div>
                                            {/* Tên món */}
                                            <h4 className="font-bold text-xs text-slate-800 group-hover:text-sky-600 transition-colors line-clamp-2 leading-snug">
                                                {dish.name}
                                            </h4>
                                        </div>

                                        <div className="flex items-end justify-between mt-3 pt-2 border-t border-slate-100">
                                            <span className="font-extrabold text-xs text-sky-600">
                                                {Number(dish.price).toLocaleString('vi-VN')}đ
                                            </span>
                                            <button className="w-7 h-7 rounded-xl bg-sky-50 group-hover:bg-sky-600 group-hover:text-white text-sky-600 flex items-center justify-center font-bold text-xs transition-all shadow-2xs">
                                                <PlusOutlined className="text-[10px]" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ================= TAB 2: XEM ĐƠN & THANH TOÁN ================= */}
            {activeTab === 'cart' && (
                <div className="flex flex-col gap-3">
                    {/* Danh sách món đã gọi */}
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                            Danh sách món đã gọi ({currentTableCart.length})
                        </h3>

                        {currentTableCart.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 text-xs italic">
                                Bàn chưa có món nào.<br />Vui lòng qua tab "Thực đơn" để chọn món!
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                                {currentTableCart.map((item) => {
                                    const isSeafood = item.category === 'Hải sản' || (item.unit && item.unit.toLowerCase() === 'kg');
                                    const unitLabel = item.unit || (isSeafood ? 'kg' : 'phần');
                                    const itemTotalPrice = item.price * item.quantity;
                                    const stepValue = isSeafood ? 0.1 : 1;
                                    const isPrinted = item.isPrinted === true;

                                    return (
                                        <div
                                            key={item.id}
                                            className={`p-3 rounded-xl border transition-all ${isPrinted ? 'bg-slate-50 border-slate-200' : 'bg-amber-50/70 border-amber-300'
                                                }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div className="pr-2 min-w-0 flex-1">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="font-bold text-xs text-slate-800">{item.name}</span>
                                                        {isPrinted ? (
                                                            <span className="bg-slate-200 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-medium">Đã gửi bếp</span>
                                                        ) : (
                                                            <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold animate-pulse">Món mới gọi</span>
                                                        )}
                                                    </div>

                                                    <div className="text-[11px] text-sky-600 font-bold mt-0.5">
                                                        {Number(itemTotalPrice).toLocaleString('vi-VN')} VNĐ
                                                        <span className="text-slate-400 font-normal ml-1">
                                                            ({item.quantity} {unitLabel})
                                                        </span>
                                                    </div>

                                                    {item.note && (
                                                        <div className="text-[11px] text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-md mt-1 italic inline-block">
                                                            <span className="font-bold">Note:</span> {item.note}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Nút tăng giảm số lượng */}
                                                <div className="flex items-center gap-1 shrink-0 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                                                    <button
                                                        onClick={() => onUpdateQuantity(item.id, -stepValue)}
                                                        className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-200 font-bold text-xs text-slate-600 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="text-xs font-bold text-slate-800 w-8 text-center">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => onUpdateQuantity(item.id, stepValue)}
                                                        className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-200 font-bold text-xs text-slate-600 flex items-center justify-center hover:bg-sky-50 hover:text-sky-600 transition-all"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Ghi chú bàn */}
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1.5">
                            <EditOutlined className="text-sky-600" /> Ghi chú:
                        </span>
                        <Input.TextArea
                            rows={2}
                            value={tableNote}
                            onChange={(e) => onUpdateTableNote(e.target.value)}
                            className="rounded-xl text-xs"
                        />
                    </div>

                    {/* Tổng tiền & Nút hành động in bếp / thanh toán */}
                    {currentTableCart.length > 0 && (
                        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500">Tổng tiền tạm tính:</span>
                                <span className="text-base font-extrabold text-rose-600">
                                    {Number(totalAmount).toLocaleString('vi-VN')} VNĐ
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => onPrintKitchen()}
                                    className={`py-2.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs ${hasNewItemsToPrint
                                            ? 'bg-amber-500 text-white hover:bg-amber-600 animate-bounce'
                                            : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                                        }`}
                                >
                                    <PrinterOutlined className="text-base" />
                                    {hasNewItemsToPrint ? 'In Món Mới' : 'In Lại Phiếu Bếp'}
                                </button>

                                <button
                                    onClick={() => onCheckout(selectedTable)}
                                    className="py-2.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-2xs"
                                >
                                    <CheckCircleOutlined className="text-base" /> Thanh toán
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modal nhập số lượng khi bấm thêm món từ thực đơn */}
            <Modal
                title={<span className="font-bold text-slate-800">Thêm món: {selectedDish?.name}</span>}
                open={isQtyModalOpen}
                onCancel={() => setIsQtyModalOpen(false)}
                onOk={handleConfirmAdd}
                okText="Xác nhận thêm"
                cancelText="Hủy"
                centered
            >
                <div className="flex flex-col gap-3 mt-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                            Số lượng ({selectedDish?.unit || 'phần'}{selectedDish?.unit === 'kg' ? ' - Nhập số lẻ như 0.5, 1.2' : ''}):
                        </label>
                        <Input
                            type="number"
                            step={selectedDish?.unit === 'kg' ? '0.1' : '1'}
                            min="0.1"
                            value={inputQuantity}
                            onChange={(e) => setInputQuantity(e.target.value)}
                            className="rounded-xl font-bold text-sm"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Ghi chú riêng cho món (Tùy chọn):</label>
                        <Input
                            placeholder="VD: Ít cay, không hành, nhiều đá..."
                            value={itemNoteInput}
                            onChange={(e) => setItemNoteInput(e.target.value)}
                            className="rounded-xl text-xs"
                        />
                    </div>
                </div>
            </Modal>

        </div>
    );
}