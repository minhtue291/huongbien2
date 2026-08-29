import React, { useState } from 'react';
import { Card, Statistic, Row, Col, Space, Button, Table } from 'antd';
import { DollarOutlined, ShoppingOutlined, TeamOutlined, DeleteOutlined, LineChartOutlined } from '@ant-design/icons';
import AdminSidebar from '../components/AdminSidebar';
import ProductManagement from '../components/ProductManagement'; // Import component mới

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('1');

  const [staffs] = useState([
    { key: '1', phone: '0348525999', name: 'Quản trị viên', role: 'admin' },
    { key: '2', phone: '0912345678', name: 'Nhân viên A', role: 'staff' },
  ]);

  const staffColumns = [
    { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
    { title: 'Họ tên', dataIndex: 'name', key: 'name' },
    { title: 'Quyền hạn', dataIndex: 'role', key: 'role', render: (role) => <b className="text-sky-600">{role.toUpperCase()}</b> },
    {
      title: 'Hành động',
      key: 'action',
      render: () => (
        <Button type="link" danger icon={<DeleteOutlined />} className="p-0">Thu hồi</Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar bên trái */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Nội dung chính bên phải thay đổi theo Tab */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="px-8 py-6 bg-white border-b border-slate-100 shadow-sm">
          <h1 className="text-xl font-bold text-slate-800 m-0">
            {activeTab === '1' && 'Báo cáo Doanh thu'}
            {activeTab === '2' && 'Quản lý Sản phẩm / Thực đơn'}
            {activeTab === '3' && 'Quản lý Nhân sự & Tài khoản'}
          </h1>
        </header>

        <main className="p-6 md:p-8 flex-1">
          {activeTab === '1' && (
            <div className="space-y-6">
              <Row gutter={20}>
                <Col xs={24} sm={8}>
                  <Card variant="borderless" className="shadow-sm rounded-2xl bg-sky-50/50 border border-sky-100">
                    <Statistic 
                      title={<span className="text-slate-500 font-medium">Doanh thu hôm nay</span>} 
                      value="4,850,000 đ" 
                      styles={{ content: { color: '#0284c7', fontWeight: 'bold' } }} 
                      prefix={<DollarOutlined className="text-sky-500" />} 
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card variant="borderless" className="shadow-sm rounded-2xl bg-cyan-50/50 border border-cyan-100">
                    <Statistic 
                      title={<span className="text-slate-500 font-medium">Tổng đơn hàng</span>} 
                      value={38} 
                      styles={{ content: { color: '#0ea5e9', fontWeight: 'bold' } }} 
                      prefix={<ShoppingOutlined className="text-cyan-500" />} 
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card variant="borderless" className="shadow-sm rounded-2xl bg-blue-50/50 border border-blue-100">
                    <Statistic 
                      title={<span className="text-slate-500 font-medium">Nhân sự hoạt động</span>} 
                      value={6} 
                      styles={{ content: { color: '#0369a1', fontWeight: 'bold' } }} 
                      prefix={<TeamOutlined className="text-blue-500" />} 
                    />
                  </Card>
                </Col>
              </Row>
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
                <LineChartOutlined className="text-5xl text-slate-300 mb-3" />
                <p className="text-slate-500 text-sm font-medium m-0">Biểu đồ thống kê chi tiết doanh thu hệ thống</p>
              </div>
            </div>
          )}

          {/* Tab 2: Sử dụng Component Quản lý sản phẩm đã tách */}
          {activeTab === '2' && <ProductManagement />}

          {activeTab === '3' && (
            <Card variant="borderless" className="shadow-sm rounded-2xl bg-white border border-slate-100 p-4">
              <div className="flex justify-between mb-4 items-center">
                <h3 className="font-bold text-slate-800 m-0 text-base">Danh sách tài khoản nhân sự</h3>
                <Button type="primary" icon={<PlusOutlined />} className="bg-sky-600 hover:bg-sky-500 rounded-xl font-medium shadow-sm h-10 px-4">Cấp tài khoản</Button>
              </div>
              <Table dataSource={staffs} columns={staffColumns} pagination={{ pageSize: 5 }} />
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}