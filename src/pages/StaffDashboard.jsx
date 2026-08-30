import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import {
  AppstoreOutlined,
  ShopOutlined,
  LogoutOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

// Nhập các component con
import StaffTable from '../components/StaffTable';
import StaffOrder from '../components/StaffOrder';
import StaffProduct from '../components/StaffProduct';

export default function StaffDashboard() {
  const [currentTab, setCurrentTab] = useState('tables'); // 'tables' hoặc 'products'
  const [tableArea, setTableArea] = useState('outdoor'); // 'outdoor' hoặc 'indoor'

  // State quản lý danh sách bàn từ Firebase
  const [tables, setTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null); // Lưu bàn đang mở order

  // State menu thực đơn từ Firebase & giỏ hàng theo bàn
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [orderItems, setOrderItems] = useState({});
  
  // State quản lý ghi chú tổng theo từng bàn { [tableId]: 'Nội dung ghi chú' }
  const [tableNotes, setTableNotes] = useState({});

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  
  // State phục vụ cho việc Sửa bàn
  const [isEditTableModalOpen, setIsEditTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);

  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const navigate = useNavigate();

  // Lấy trực tiếp user từ AuthContext (đã bao gồm phone, role, name)
  const { user, logout } = useAuth();

  const productsCollectionRef = collection(db, 'products');
  const tablesCollectionRef = collection(db, 'tables');

  // Lấy danh sách món từ Firebase
  const fetchMenuItems = async () => {
    setLoadingMenu(true);
    try {
      const data = await getDocs(productsCollectionRef);
      const productList = data.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMenuItems(productList);
    } catch (error) {
      console.error("Lỗi khi tải thực đơn:", error);
    } finally {
      setLoadingMenu(false);
    }
  };

  // Lấy danh sách bàn từ Firebase và khôi phục giỏ hàng, ghi chú
  const fetchTables = async () => {
    setLoadingTables(true);
    try {
      const data = await getDocs(tablesCollectionRef);
      const initialOrders = {};
      const initialNotes = {};

      const tableList = data.docs.map((docSnap) => {
        const tableData = docSnap.data();
        const tableId = docSnap.id;

        if (tableData.cart && Array.isArray(tableData.cart) && tableData.cart.length > 0) {
          initialOrders[tableId] = tableData.cart;
        }
        if (tableData.tableNote) {
          initialNotes[tableId] = tableData.tableNote;
        }

        return {
          id: tableId,
          ...tableData,
        };
      });

      setTables(tableList);
      setOrderItems(initialOrders);
      setTableNotes(initialNotes);
    } catch (error) {
      console.error("Lỗi khi tải danh sách bàn:", error);
    } finally {
      setLoadingTables(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
    fetchTables();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Thêm bàn mới lên Firebase
  const handleAddTable = async (values) => {
    try {
      const newTableData = {
        name: values.name,
        area: values.area,
        status: 'empty',
        guests: 0,
        startTime: null,
        staffName: null,
        cart: [],
        tableNote: ''
      };
      
      const docRef = await addDoc(tablesCollectionRef, newTableData);
      setTables([...tables, { id: docRef.id, ...newTableData }]);
      setIsTableModalOpen(false);
      form.resetFields();
      message.success('Thêm bàn mới thành công!');
    } catch (error) {
      console.error("Lỗi khi thêm bàn:", error);
      message.error('Không thể thêm bàn mới!');
    }
  };

  // Kích hoạt mở modal sửa bàn
  const handleOpenEditTable = (table) => {
    setEditingTable(table);
    editForm.setFieldsValue({
      name: table.name,
      area: table.area || 'outdoor'
    });
    setIsEditTableModalOpen(true);
  };

  // Cập nhật thông tin bàn lên Firebase
  const handleUpdateTable = async (values) => {
    if (!editingTable) return;
    try {
      const tableDocRef = doc(db, 'tables', editingTable.id);
      await updateDoc(tableDocRef, {
        name: values.name,
        area: values.area
      });

      setTables(tables.map(t => t.id === editingTable.id ? { ...t, name: values.name, area: values.area } : t));
      setIsEditTableModalOpen(false);
      setEditingTable(null);
      editForm.resetFields();
      message.success('Cập nhật thông tin bàn thành công!');
    } catch (error) {
      console.error("Lỗi khi cập nhật bàn:", error);
      message.error('Không thể cập nhật thông tin bàn!');
    }
  };

  // Xoá bàn khỏi Firebase
  const handleDeleteTable = async (table) => {
    Modal.confirm({
      title: 'Xác nhận xoá bàn',
      content: `Bạn có chắc chắn muốn xoá "${table.name}" không?`,
      okText: 'Xoá',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteDoc(doc(db, 'tables', table.id));
          setTables(tables.filter(t => t.id !== table.id));
          
          if (selectedTable && selectedTable.id === table.id) {
            setSelectedTable(null);
          }
          
          message.success('Đã xoá bàn thành công!');
        } catch (error) {
          console.error("Lỗi khi xoá bàn:", error);
          message.error('Không thể xoá bàn này!');
        }
      }
    });
  };

  // Mở bàn
  const handleOpenTableOrder = async (table) => {
    setSelectedTable(table);
  };

  // Xử lý khi thêm món mới vào giỏ và đồng bộ Firebase
  const handleAddToCart = async (product) => {
    const tableId = selectedTable.id;
    const currentCart = orderItems[tableId] || [];
    
    const updatedCart = [...currentCart, { ...product }];
    const newOrderItems = { ...orderItems, [tableId]: updatedCart };
    setOrderItems(newOrderItems);

    const startTime = currentCart.length === 0 ? Date.now() : (selectedTable.startTime || Date.now());
    const staffName = currentCart.length === 0 ? (user?.name || 'Nhân viên') : (selectedTable.staffName || user?.name || 'Nhân viên');

    if (currentCart.length === 0) {
      setTables(tables.map(t =>
        t.id === tableId
          ? { ...t, status: 'occupied', startTime: startTime, staffName: staffName }
          : t
      ));
      setSelectedTable(prev => ({ ...prev, status: 'occupied', startTime: startTime, staffName: staffName }));
    }

    try {
      const tableDocRef = doc(db, 'tables', tableId);
      await updateDoc(tableDocRef, {
        status: 'occupied',
        startTime: startTime,
        staffName: staffName,
        cart: updatedCart,
        tableNote: tableNotes[tableId] || ''
      });
    } catch (error) {
      console.error("Lỗi cập nhật giỏ hàng lên Firebase:", error);
      message.error('Không thể đồng bộ order lên hệ thống!');
    }
  };

  // Xử lý khi tăng/giảm số lượng món và đồng bộ Firebase
  const handleUpdateQuantity = async (productId, delta) => {
    const tableId = selectedTable.id;
    const currentCart = orderItems[tableId] || [];

    const updatedCart = currentCart.map(item => {
      if (item.id === productId) {
        const newQty = Math.round((item.quantity + delta) * 100) / 100;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean);

    const newOrderItems = { ...orderItems, [tableId]: updatedCart };
    setOrderItems(newOrderItems);

    let updateData = { cart: updatedCart };

    if (updatedCart.length === 0) {
      setTables(prevTables =>
        prevTables.map(t =>
          t.id === tableId
            ? { ...t, status: 'empty', startTime: null, staffName: null }
            : t
        )
      );

      setSelectedTable(prev => prev ? { ...prev, status: 'empty', startTime: null, staffName: null } : null);

      setTableNotes(prev => {
        const newNotes = { ...prev };
        delete newNotes[tableId];
        return newNotes;
      });

      updateData = {
        status: 'empty',
        startTime: null,
        staffName: null,
        cart: [],
        tableNote: ''
      };
    }

    try {
      const tableDocRef = doc(db, 'tables', tableId);
      await updateDoc(tableDocRef, updateData);
    } catch (error) {
      console.error("Lỗi cập nhật số lượng lên Firebase:", error);
    }
  };

  // Cập nhật nội dung ghi chú tổng và đồng bộ Firebase
  const handleUpdateTableNote = async (noteText) => {
    if (!selectedTable) return;
    const tableId = selectedTable.id;

    setTableNotes({
      ...tableNotes,
      [tableId]: noteText
    });

    try {
      const tableDocRef = doc(db, 'tables', tableId);
      await updateDoc(tableDocRef, {
        tableNote: noteText
      });
    } catch (error) {
      console.error("Lỗi lưu ghi chú lên Firebase:", error);
    }
  };

  // Thanh toán và reset dữ liệu bàn trên Firebase
  // Thanh toán và reset dữ liệu bàn trên Firebase (Đã bỏ Modal.confirm vì dùng Modal QR riêng)
  // Thanh toán, lưu doanh thu lên Firebase và reset dữ liệu bàn
  const handleCheckout = async (table) => {
    const targetTable = table || selectedTable;
    if (!targetTable) return;
    
    const tableId = targetTable.id;
    const currentCart = orderItems[tableId] || [];
    
    if (currentCart.length === 0) {
      return;
    }

    // Tính tổng tiền của đơn hàng
    const totalAmount = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    try {
      // 1. Lưu thông tin đơn hàng vào collection 'orders' (hoặc 'revenues') để Admin làm doanh thu
      const ordersCollectionRef = collection(db, 'orders');
      await addDoc(ordersCollectionRef, {
        tableId: tableId,
        tableName: targetTable.name,
        area: targetTable.area || 'outdoor',
        cart: currentCart,
        totalAmount: totalAmount,
        staffName: targetTable.staffName || 'Nhân viên',
        startTime: targetTable.startTime || null,
        checkoutTime: Date.now(), // Thời điểm thanh toán
        createdAt: new Date().toISOString()
      });

      // 2. Reset trạng thái bàn về 'empty' trên Firestore
      const tableDocRef = doc(db, 'tables', tableId);
      await updateDoc(tableDocRef, {
        status: 'empty',
        startTime: null,
        staffName: null,
        cart: [],
        tableNote: ''
      });

      // 3. Cập nhật lại State trên giao diện
      setTables(prevTables => 
        prevTables.map(t => 
          t.id === tableId 
            ? { ...t, status: 'empty', startTime: null, staffName: null } 
            : t
        )
      );

      setOrderItems(prevOrders => {
        const newOrders = { ...prevOrders };
        delete newOrders[tableId];
        return newOrders;
      });

      setTableNotes(prev => {
        const newNotes = { ...prev };
        delete newNotes[tableId];
        return newNotes;
      });

      setSelectedTable(null);
    } catch (error) {
      console.error("Lỗi khi thanh toán và lưu doanh thu:", error);
      message.error('Không thể hoàn tất thanh toán!');
    }
  };

  // Hàm in đơn cho bếp
 const handlePrintKitchenOrder = () => {
    if (!selectedTable) return;
    const currentCart = orderItems[selectedTable.id] || [];
    if (currentCart.length === 0) {
      message.warning('Bàn chưa có món nào để in đơn bếp!');
      return;
    }

    const tableNote = tableNotes[selectedTable.id];
    const creatorName = selectedTable.staffName || user?.name || 'Nhân viên';
    const orderTime = selectedTable.startTime 
      ? new Date(selectedTable.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) 
      : new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const printWindow = window.open('', '_blank', 'width=350,height=500');
    if (!printWindow) {
      message.error('Vui lòng cho phép trình duyệt mở pop-up để in!');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Bếp - ${selectedTable.name}</title>
          <style>
              body { font-family: monospace; font-size: 13px; margin: 0; padding: 5px; width: 280px; }
              .center { text-align: center; }
              .bold { font-weight: bold; }
              .title { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
              .divider { border-top: 1px dashed #000; margin: 6px 0; }
              .info div { margin-bottom: 2px; }
              table { width: 100%; border-collapse: collapse; margin-top: 4px; }
              th, td { text-align: left; padding: 3px 0; font-size: 13px; }
              th { border-bottom: 1px solid #000; }
              td { border-bottom: 1px dotted #ccc; vertical-align: top; }
              .item-note { font-size: 11px; font-style: italic; color: #444; }
              .note-box { margin-top: 6px; padding: 4px; border: 1px dashed #000; font-size: 12px; }
          </style>
      </head>
      <body>
          <div class="center">
              <div class="title">PHIẾU BẾP</div>
              <div class="bold" style="font-size: 15px;">${selectedTable.name}</div>
          </div>
          
          <div class="divider"></div>
          
          <div class="info">
              <div><strong>Giờ:</strong> ${orderTime} | <strong>NV:</strong> ${creatorName}</div>
          </div>

          <table>
              <thead>
                  <tr>
                      <th style="width: 75%;">Món</th>
                      <th style="width: 25%; text-align: right;">SL</th>
                  </tr>
              </thead>
              <tbody>
                  ${currentCart.map(item => `
                      <tr>
                          <td>
                              <span class="bold">${item.name}</span>
                              ${item.note ? `<br/><span class="item-note">Lưu ý: ${item.note}</span>` : ''}
                          </td>
                          <td style="text-align: right;" class="bold">${item.quantity}</td>
                      </tr>
                  `).join('')}
              </tbody>
          </table>

          ${tableNote ? `
              <div class="note-box">
                  <strong>Ghi chú bàn:</strong> ${tableNote}
              </div>
          ` : ''}

          <script>
              window.onload = function() { window.print(); window.close(); }
          </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Hàm in đơn cho bếp (Chỉ in các món mới chưa in)
  const handlePrintNewKitchenOrder = async () => {
    if (!selectedTable) return;
    const tableId = selectedTable.id;
    const currentCart = orderItems[tableId] || [];
    
    // Lọc ra các món chưa in bếp
    const newItemsToPrint = currentCart.filter(item => !item.isPrinted);
    
    if (newItemsToPrint.length === 0) {
      message.warning('Không có món mới nào cần in thêm!');
      return;
    }

    const tableNote = tableNotes[tableId];
    const creatorName = selectedTable.staffName || user?.name || 'Nhân viên';
    const orderTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const printWindow = window.open('', '_blank', 'width=350,height=500');
    if (!printWindow) {
      message.error('Vui lòng cho phép trình duyệt mở pop-up để in!');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>PHIẾU BẾP (MÓN MỚI) - ${selectedTable.name}</title>
          <style>
              body { font-family: monospace; font-size: 13px; margin: 0; padding: 5px; width: 280px; }
              .center { text-align: center; }
              .bold { font-weight: bold; }
              .title { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
              .divider { border-top: 1px dashed #000; margin: 6px 0; }
              .info div { margin-bottom: 2px; }
              table { width: 100%; border-collapse: collapse; margin-top: 4px; }
              th, td { text-align: left; padding: 3px 0; font-size: 13px; }
              th { border-bottom: 1px solid #000; }
              td { border-bottom: 1px dotted #ccc; vertical-align: top; }
              .item-note { font-size: 11px; font-style: italic; color: #444; }
              .note-box { margin-top: 6px; padding: 4px; border: 1px dashed #000; font-size: 12px; }
          </style>
      </head>
      <body>
          <div class="center">
              <div class="title">PHIẾU BẾP (BỔ SUNG)</div>
              <div class="bold" style="font-size: 15px;">${selectedTable.name}</div>
          </div>
          
          <div class="divider"></div>
          
          <div class="info">
              <div><strong>Giờ:</strong> ${orderTime} | <strong>NV:</strong> ${creatorName}</div>
          </div>

          <table>
              <thead>
                  <tr>
                      <th style="width: 75%;">Món</th>
                      <th style="width: 25%; text-align: right;">SL</th>
                  </tr>
              </thead>
              <tbody>
                  ${newItemsToPrint.map(item => `
                      <tr>
                          <td>
                              <span class="bold">${item.name}</span>
                              ${item.note ? `<br/><span class="item-note">Lưu ý: ${item.note}</span>` : ''}
                          </td>
                          <td style="text-align: right;" class="bold">${item.quantity}</td>
                      </tr>
                  `).join('')}
              </tbody>
          </table>

          ${tableNote ? `
              <div class="note-box">
                  <strong>Ghi chú bàn:</strong> ${tableNote}
              </div>
          ` : ''}

          <script>
              window.onload = function() { window.print(); window.close(); }
          </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Sau khi in thành công, cập nhật trạng thái các món này thành isPrinted: true
    const updatedCart = currentCart.map(item => ({
      ...item,
      isPrinted: true
    }));

    const newOrderItems = { ...orderItems, [tableId]: updatedCart };
    setOrderItems(newOrderItems);

    try {
      const tableDocRef = doc(db, 'tables', tableId);
      await updateDoc(tableDocRef, {
        cart: updatedCart
      });
      message.success(`Đã gửi in ${newItemsToPrint.length} món mới xuống bếp!`);
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái in lên Firebase:", error);
    }
  };

  const currentTableCart = selectedTable ? (orderItems[selectedTable.id] || []) : [];
  const totalAmount = currentTableCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const currentTableNote = selectedTable ? (tableNotes[selectedTable.id] || '') : '';

  return (
    <div className="min-h-screen bg-slate-100 pb-20 flex flex-col">
      {/* Header Mobile */}
      <header className="bg-white px-4 py-3 border-b border-slate-200 sticky top-0 z-30 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-2">
          {selectedTable && (
            <button
              onClick={() => setSelectedTable(null)}
              className="text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <ArrowLeftOutlined className="text-base" />
            </button>
          )}
          <h1 className="text-base font-bold text-slate-800 m-0">
            {selectedTable
              ? `${selectedTable.name} ${selectedTable.staffName ? `- ${selectedTable.staffName}` : ''}`
              : currentTab === 'tables' ? 'Quản Lý Bàn' : 'Sản Phẩm & Thực Đơn'}
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-rose-500 bg-rose-50 p-2 rounded-xl border border-rose-100 flex items-center justify-center"
        >
          <LogoutOutlined className="text-base" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 max-w-md mx-auto w-full">
        {selectedTable ? (
          <StaffOrder
            selectedTable={selectedTable}
            menuItems={menuItems}
            loadingMenu={loadingMenu}
            currentTableCart={currentTableCart}
            totalAmount={totalAmount}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
            onRefreshMenu={fetchMenuItems}
            onCheckout={handleCheckout}
            currentStaffName={user?.name}
            tableNote={currentTableNote}
            onUpdateTableNote={handleUpdateTableNote}
            // onPrintKitchen={handlePrintKitchenOrder}
            onPrintKitchen={handlePrintNewKitchenOrder}
          />
        ) : currentTab === 'tables' ? (
          <StaffTable
            tables={tables}
            tableArea={tableArea}
            setTableArea={setTableArea}
            onOpenTableOrder={handleOpenTableOrder}
            onOpenAddModal={() => {
              form.setFieldsValue({ area: tableArea });
              setIsTableModalOpen(true);
            }}
            onEditTable={handleOpenEditTable}
            onDeleteTable={handleDeleteTable}
            orderItems={orderItems}
          />
        ) : (
          <StaffProduct
            menuItems={menuItems}
            loadingMenu={loadingMenu}
            onRefreshMenu={fetchMenuItems}
          />
        )}
      </main>

      {/* Modal Thêm Bàn Mới */}
      <Modal
        title={<span className="font-bold text-slate-800">Thêm Bàn Mới</span>}
        open={isTableModalOpen}
        onCancel={() => setIsTableModalOpen(false)}
        onOk={() => form.submit()}
        okText="Thêm"
        cancelText="Hủy"
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleAddTable} className="mt-4">
          <Form.Item name="name" label="Tên bàn / Số bàn" rules={[{ required: true, message: 'Vui lòng nhập tên bàn!' }]}>
            <Input placeholder="Ví dụ: Bàn 05, Bàn VIP 2..." className="rounded-xl" />
          </Form.Item>
          <Form.Item name="area" label="Khu vực" rules={[{ required: true }]}>
            <Select className="rounded-xl">
              <Select.Option value="outdoor">Ngoài Trời</Select.Option>
              <Select.Option value="indoor">Trong Nhà</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Sửa Bàn */}
      <Modal
        title={<span className="font-bold text-slate-800">Sửa Thông Tin Bàn</span>}
        open={isEditTableModalOpen}
        onCancel={() => setIsEditTableModalOpen(false)}
        onOk={() => editForm.submit()}
        okText="Lưu"
        cancelText="Hủy"
        centered
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdateTable} className="mt-4">
          <Form.Item name="name" label="Tên bàn / Số bàn" rules={[{ required: true, message: 'Vui lòng nhập tên bàn!' }]}>
            <Input placeholder="Ví dụ: Bàn 05..." className="rounded-xl" />
          </Form.Item>
          <Form.Item name="area" label="Khu vực" rules={[{ required: true }]}>
            <Select className="rounded-xl">
              <Select.Option value="outdoor">Ngoài Trời</Select.Option>
              <Select.Option value="indoor">Trong Nhà</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Bottom Navigation Bar */}
      {!selectedTable && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 flex justify-around items-center z-40 shadow-lg max-w-md mx-auto">
          <button
            onClick={() => setCurrentTab('tables')}
            className={`flex flex-col items-center gap-1 transition-all ${currentTab === 'tables' ? 'text-sky-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <AppstoreOutlined className="text-xl" />
            <span className="text-[11px] font-semibold">Quản Lí Bàn</span>
          </button>

          <button
            onClick={() => setCurrentTab('products')}
            className={`flex flex-col items-center gap-1 transition-all ${currentTab === 'products' ? 'text-sky-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <ShopOutlined className="text-xl" />
            <span className="text-[11px] font-semibold">Sản Phẩm</span>
          </button>
        </nav>
      )}
    </div>
  );
}