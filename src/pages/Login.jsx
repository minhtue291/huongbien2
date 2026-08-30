import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // Lấy hàm login từ Context

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const inputPhone = values.phone.trim();
      
      const userDocRef = doc(db, 'users', inputPhone);
      const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role ? userData.role.trim().toLowerCase() : 'staff';
        const staffName = userData.name || 'Nhân viên'; // Lấy tên từ Firestore

        // Cập nhật State toàn cục qua Context kèm theo name
        login(inputPhone, role, staffName);

        message.success(`Đăng nhập thành công: ${staffName} (${role.toUpperCase()})`);

        // Chuyển trang mượt mà bằng React Router ngay lập tức
        if (role === 'admin') {
          navigate('/admin', { replace: true });
        } else if (role === 'kitchen') {
          navigate('/kitchen', { replace: true });
        } else {
          navigate('/staff', { replace: true });
        }

      }else {
        message.error('Số điện thoại này chưa được đăng ký trong hệ thống!');
      }
    } catch (error) {
      console.error(error);
      message.error('Lỗi kết nối hệ thống: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl border-0">
        <div className="text-center mb-6">
          <Title level={3} className="text-blue-600 m-0">Hương Biển</Title>
          <Text type="secondary">Đăng nhập hệ thống quản lý</Text>
        </div>
        
        <Form name="phone-login" onFinish={handleLogin} layout="vertical" size="large">
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { pattern: /^[0-9]+$/, message: 'Chỉ được nhập số!' }
            ]}
          >
            <Input 
              prefix={<PhoneOutlined />} 
              placeholder="Nhập số điện thoại của bạn" 
              inputMode="numeric"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} className="h-12 bg-blue-600 font-bold rounded-xl">
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}