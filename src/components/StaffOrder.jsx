import React, { useState, useEffect } from 'react';
import { message, Input } from 'antd';
import {
    ShoppingCartOutlined,
    PlusOutlined,
    ReloadOutlined,
    FireOutlined,
    SearchOutlined,
    CloseOutlined,
    FormOutlined,
    QrcodeOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';

// Import ảnh QR VNPay từ thư mục assets (Điều chỉnh lại đường dẫn cho khớp với dự án thực tế của bạn)
import vnpayQrImage from '../assets/vnpay.png';

export default function StaffOrder({
    selectedTable,
    menuItems,
    loadingMenu,
    currentTableCart,
    totalAmount,
    onAddToCart,
    onUpdateQuantity,
    onRefreshMenu,
    onCheckout, // Hàm gốc của hệ thống cũ (được gọi sau khi bấm xác nhận trên Modal QR)
    onUpdateItemNote,
    tableNote = '',
    onUpdateTableNote,
    onPrintKitchen,
}) {
    const [mobileTab, setMobileTab] = useState('menu');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // State quản lý Modal thêm món
    const [isQtyModalOpen, setIsQtyModalOpen] = useState(false);
    const [selectedDish, setSelectedDish] = useState(null);
    const [inputQuantity, setInputQuantity] = useState('');
    const [itemNoteInput, setItemNoteInput] = useState('');

    // State quản lý Modal QR Thanh Toán mới
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

    const categories = ['all', ...new Set(menuItems.map(dish => dish.category).filter(Boolean))]
        .sort((a, b) => {
            if (a === 'all') return -1;
            if (b === 'all') return 1;
            if (a === 'Hải sản') return -1;
            if (b === 'Hải sản') return 1;
            return 0;
        });

    const filteredMenuItems = menuItems.filter(dish => {
        const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (dish.category && dish.category.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'all' || dish.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleOpenQtyModal = (dish) => {
        setSelectedDish(dish);
        const isSeafood = dish?.category === 'Hải sản' || (dish?.unit && dish.unit.toLowerCase() === 'kg');
        setInputQuantity(isSeafood ? '' : '1');
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
    };

    // 1. Khi bấm nút thanh toán ở giao diện -> Chỉ mở Modal QR, không gọi hàm cũ ngay
    const handleOpenCheckoutModal = () => {
        if (currentTableCart.length === 0) return;
        setIsCheckoutModalOpen(true);
    };

    // 2. Khi nhân viên bấm "Xác nhận đã thanh toán" trên Modal QR -> Gọi hàm gốc `onCheckout` để thực thi logic cũ của hệ thống
    const handleCompletePayment = () => {
        if (onCheckout) {
            onCheckout(selectedTable); // Truyền bàn hiện tại vào hàm gốc của hệ thống
        }
        setIsCheckoutModalOpen(false);
        message.success(`Thanh toán thành công cho bàn ${selectedTable?.name || ''}!`);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-16 md:pb-6 relative">

            {/* Thanh chuyển đổi nhanh trên Mobile */}
            <div className="md:hidden flex items-center bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs sticky top-[57px] z-20">
                <button
                    onClick={() => setMobileTab('menu')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${mobileTab === 'menu' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                >
                    <FireOutlined /> Thực đơn
                </button>
                <button
                    onClick={() => setMobileTab('cart')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all relative ${mobileTab === 'cart' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                >
                    <ShoppingCartOutlined /> Xem đơn ({currentTableCart.length})
                    {currentTableCart.length > 0 && mobileTab === 'menu' && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold border-2 border-white">
                            {currentTableCart.length}
                        </span>
                    )}
                </button>
            </div>

            {/* CỘT TRÁI: THỰC ĐƠN */}
            <div className={`md:col-span-7 flex flex-col gap-3 ${mobileTab === 'cart' ? 'hidden md:flex' : 'flex'}`}>
                <div className="flex gap-2">
                    <Input
                        placeholder="Tìm kiếm tên món..."
                        prefix={<SearchOutlined className="text-slate-400 mr-1" />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        allowClear
                        className="rounded-xl py-2 text-xs shadow-2xs bg-white"
                    />
                    <button
                        onClick={onRefreshMenu}
                        className="text-xs text-slate-700 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5 border border-slate-200 shadow-2xs shrink-0"
                        title="Làm mới thực đơn"
                    >
                        <ReloadOutlined />
                    </button>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {categories.map((cat) => {
                        const isSelected = selectedCategory === cat;
                        const label = cat === 'all' ? 'Tất cả' : cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all border ${isSelected
                                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

                {loadingMenu ? (
                    <div className="text-center py-16 text-xs text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                        Đang tải thực đơn từ hệ thống...
                    </div>
                ) : filteredMenuItems.length === 0 ? (
                    <div className="text-center py-16 text-xs text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                        Không tìm thấy món ăn phù hợp.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-2.5 max-h-[calc(100vh-330px)] overflow-y-auto pr-1">
                        {filteredMenuItems.map((dish) => {
                            const isSeafood = dish.category === 'Hải sản' || (dish.unit && dish.unit.toLowerCase() === 'kg');
                            const cartItem = currentTableCart.find(item => item.id === dish.id);
                            const orderedQuantity = cartItem ? cartItem.quantity : 0;
                            const isAlreadyOrdered = orderedQuantity > 0;
                            const unitLabel = dish.unit || (isSeafood ? 'kg' : 'phần');

                            return (
                                <div
                                    key={dish.id}
                                    onClick={() => {
                                        if (!isAlreadyOrdered) {
                                            handleOpenQtyModal(dish);
                                        }
                                    }}
                                    className={`bg-white p-3.5 rounded-2xl border flex justify-between items-center shadow-2xs transition-all ${isAlreadyOrdered
                                            ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                                            : 'border-slate-200 hover:border-sky-400 hover:shadow-md cursor-pointer active:scale-[0.99] group'
                                        }`}
                                >
                                    <div className="pr-2">
                                        <div className={`font-bold text-xs transition-colors flex items-center gap-2 ${isAlreadyOrdered ? 'text-slate-400' : 'text-slate-800 group-hover:text-sky-600'}`}>
                                            {dish.name}
                                            {isAlreadyOrdered && (
                                                <span className="bg-slate-200 text-slate-600 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs">
                                                    Đã gọi ({orderedQuantity} {unitLabel})
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                                            <span className={`font-bold px-2 py-0.5 rounded-md border ${isAlreadyOrdered ? 'text-slate-400 bg-slate-100 border-slate-200' : 'text-sky-700 bg-sky-50 border-sky-100'}`}>
                                                {Number(dish.price).toLocaleString('vi-VN')} VNĐ
                                            </span>
                                            <span className="text-slate-300">•</span>
                                            <span className="text-slate-500 font-medium">{unitLabel}</span>
                                            <span className="text-slate-300">•</span>
                                            <span className="text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-md">{dish.category}</span>
                                        </div>
                                    </div>
                                    <button
                                        disabled={isAlreadyOrdered}
                                        className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center transition-all shadow-2xs shrink-0 ${isAlreadyOrdered
                                                ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                                                : 'bg-sky-50 text-sky-600 border border-sky-100 group-hover:bg-sky-600 group-hover:text-white'
                                            }`}
                                    >
                                        <PlusOutlined />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* CỘT PHẢI: GIỎ HÀNG & NÚT THANH TOÁN */}
            <div className={`md:col-span-5 flex flex-col gap-3 ${mobileTab === 'menu' ? 'hidden md:flex' : 'flex'}`}>
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between h-[calc(100vh-140px)]">
                    <div className="flex flex-col flex-1 min-h-0">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                            <h3 className="font-bold text-slate-800 text-sm m-0 flex items-center gap-2">
                                <ShoppingCartOutlined className="text-sky-600 text-base" /> Món đã gọi
                            </h3>
                            <span className="bg-sky-50 text-sky-700 font-bold text-xs px-2.5 py-1 rounded-full border border-sky-100 shadow-2xs">
                                {currentTableCart.length} món
                            </span>
                        </div>

                        {currentTableCart.length === 0 ? (
                            <div className="text-center py-20 text-xs text-slate-400 italic flex flex-col items-center justify-center gap-2">
                                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 mb-1">
                                    <ShoppingCartOutlined className="text-xl text-slate-300" />
                                </div>
                                <span className="font-medium text-slate-500">Chưa có món nào được gọi.</span>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2.5 overflow-y-auto flex-1 pr-1">
                                {currentTableCart.map((item) => {
                                    const isSeafood = item.category === 'Hải sản' || (item.unit && item.unit.toLowerCase() === 'kg');
                                    const unitLabel = item.unit || (isSeafood ? 'kg' : 'phần');
                                    const itemTotalPrice = item.price * item.quantity;
                                    const stepValue = isSeafood ? 0.1 : 1;

                                    return (
                                        <div key={item.id} className="flex justify-between items-center bg-slate-50/80 p-3 rounded-xl border border-slate-100/80 hover:border-slate-200 transition-all">
                                            <div className="pr-2 min-w-0 flex-1">
                                                <div className="font-bold text-xs text-slate-800 truncate">{item.name}</div>
                                                <div className="text-[11px] text-sky-600 font-bold mt-0.5">
                                                    {Number(itemTotalPrice).toLocaleString('vi-VN')} VNĐ
                                                    <span className="text-slate-400 font-normal ml-1">
                                                        ({item.quantity} {unitLabel} x {Number(item.price).toLocaleString('vi-VN')}đ)
                                                    </span>
                                                </div>
                                                {item.note && (
                                                    <div className="text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md mt-1.5 italic border border-amber-100/60 inline-flex items-center gap-1">
                                                        <span className="font-bold not-italic">Note:</span> {item.note}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                                                <button
                                                    onClick={() => onUpdateQuantity(item.id, -stepValue)}
                                                    className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-200 font-bold text-xs text-slate-600 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
                                                >
                                                    -
                                                </button>
                                                <span className="text-xs font-bold text-slate-800 w-14 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => onUpdateQuantity(item.id, stepValue)}
                                                    className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-200 font-bold text-xs text-slate-600 flex items-center justify-center hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200 transition-all"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 mt-3 bg-white flex flex-col gap-2.5">
                        <div>
                            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 mb-1">
                                <FormOutlined className="text-sky-600" /> Ghi chú:
                            </div>
                            <textarea
                                rows={1}
                                value={tableNote}
                                onChange={(e) => {
                                    if (onUpdateTableNote) {
                                        onUpdateTableNote(e.target.value);
                                    }
                                }}
                                onInput={(e) => {
                                    e.target.style.height = 'auto';
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                }}
                                placeholder="Nhập ghi chú cho bàn..."
                                className="w-full bg-slate-50 px-3 py-2 text-xs border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white transition-all shadow-2xs resize-none overflow-hidden"
                            />
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 flex justify-between items-center">
                            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Tổng cộng:</span>
                            <span className="font-extrabold text-base text-emerald-600">
                                {totalAmount.toLocaleString('vi-VN')} VNĐ
                            </span>
                        </div>
                        <button
                            disabled={currentTableCart.length === 0}
                            onClick={onPrintKitchen}
                            className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border ${currentTableCart.length === 0
                                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                }`}
                        >
                            In đơn bếp
                        </button>
                        {/* Nút bấm gọi hàm mở Modal QR */}
                        <button
                            disabled={currentTableCart.length === 0}
                            onClick={handleOpenCheckoutModal}
                            className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${currentTableCart.length === 0
                                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.99] shadow-md shadow-emerald-600/20'
                                }`}
                        >
                            <QrcodeOutlined /> Thanh toán bàn (QR VNPay)
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL NHẬP SỐ LƯỢNG MÓN */}
            {isQtyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
                            <span className="font-bold text-xs text-slate-800">
                                Thêm món: <span className="text-sky-600">{selectedDish?.name}</span>
                            </span>
                            <button
                                onClick={() => setIsQtyModalOpen(false)}
                                className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center text-xs transition-all"
                            >
                                <CloseOutlined />
                            </button>
                        </div>
                        <div className="p-4 flex flex-col gap-3">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                    Số lượng ({selectedDish?.unit || 'phần'})
                                </label>
                                <input
                                    type="number"
                                    autoFocus
                                    step="any"
                                    min="0.01"
                                    value={inputQuantity}
                                    onChange={(e) => setInputQuantity(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleConfirmAdd()}
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                    Ghi chú riêng cho món
                                </label>
                                <input
                                    type="text"
                                    value={itemNoteInput}
                                    onChange={(e) => setItemNoteInput(e.target.value)}
                                    placeholder="VD: Ít đá, không hành..."
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50/50 border-t border-slate-100">
                            <button
                                onClick={() => setIsQtyModalOpen(false)}
                                className="flex-1 py-2.5 rounded-xl font-bold text-xs text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirmAdd}
                                className="flex-1 py-2.5 rounded-xl font-bold text-xs text-white bg-sky-600 hover:bg-sky-700 shadow-sm transition-all"
                            >
                                Thêm vào đơn
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL QR VNPAY & XÁC NHẬN THANH TOÁN (THAY THẾ HOÀN TOÀN CÁI CŨ) */}
            {isCheckoutModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-150">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
                            <div className="flex items-center gap-2">
                                <QrcodeOutlined className="text-sky-600 text-lg" />
                                <span className="font-bold text-sm text-slate-800">
                                    Thanh toán {selectedTable?.name || 'Bàn'}
                                </span>
                            </div>
                            <button
                                onClick={() => setIsCheckoutModalOpen(false)}
                                className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center text-xs transition-all"
                            >
                                <CloseOutlined />
                            </button>
                        </div>

                        {/* Body Modal chứa QR VNPay */}
                        <div className="p-6 flex flex-col items-center text-center gap-4">
                            <div className="text-xs text-slate-500">
                                Quét mã QR bên dưới bằng ứng dụng ngân hàng hoặc ví điện tử để thanh toán VNPay.
                            </div>

                            {/* Khung chứa ảnh QR VNPay */}
                            <div className="p-3 bg-white border-2 border-dashed border-slate-200 rounded-2xl shadow-xs inline-block">
                                <img
                                    src={vnpayQrImage}
                                    alt="QR VNPay Thanh Toán"
                                    className="w-48 h-48 object-contain mx-auto rounded-lg"
                                />
                            </div>

                            <div className="flex flex-col gap-1 w-full bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500">Tổng tiền thanh toán:</span>
                                    <span className="font-extrabold text-emerald-600 text-sm">
                                        {totalAmount.toLocaleString('vi-VN')} VNĐ
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Modal thực thi cả QR lẫn hàm gốc cũ */}
                        <div className="flex items-center gap-2 px-5 py-3.5 bg-slate-50 border-t border-slate-100">
                            <button
                                onClick={() => setIsCheckoutModalOpen(false)}
                                className="flex-1 py-3 rounded-xl font-bold text-xs text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all"
                            >
                                Quay lại
                            </button>
                            <button
                                onClick={handleCompletePayment}
                                className="flex-1 py-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
                            >
                                <CheckCircleOutlined /> Xác nhận đã thanh toán
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}