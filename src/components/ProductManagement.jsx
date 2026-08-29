import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Space, Modal, Form, Input, Select, InputNumber, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
// Nhập các hàm Firestore của bạn (Điều chỉnh lại đường dẫn cho đúng với dự án thực tế)
import { db } from '../firebase/config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export default function ProductManagement() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dishes, setDishes] = useState([]);
    const [form] = Form.useForm();

    // Theo dõi giá trị của trường inventoryType và category
    const trackInventoryType = Form.useWatch('inventoryType', form);
    const trackCategory = Form.useWatch('category', form);

    // Tên collection trên Firestore
    const productsCollectionRef = collection(db, 'products');

    // Lấy danh sách sản phẩm từ Firestore khi component được mount
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await getDocs(productsCollectionRef);
            const productList = data.docs.map((doc) => ({
                key: doc.id, // Dùng ID của Firestore làm key cho Ant Design Table
                ...doc.data(),
            }));
            setDishes(productList);
        } catch (error) {
            console.error("Lỗi khi tải danh sách sản phẩm:", error);
            message.error('Không thể tải danh sách sản phẩm từ hệ thống!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Tự động gán đơn vị tính dựa trên danh mục được chọn
    const handleCategoryChange = (value) => {
        if (value === 'Hải sản') {
            form.setFieldsValue({ unit: 'kg' });
        } else {
            form.setFieldsValue({ unit: 'phần' });
        }
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            form.setFieldsValue(product);
        } else {
            setEditingProduct(null);
            form.resetFields();
            // Đặt mặc định khi thêm mới: danh mục mặc định chưa chọn, kho không giới hạn, đơn vị phần
            form.setFieldsValue({ inventoryType: 'unlimited', unit: 'phần', status: 'Còn hàng' });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (values) => {
        try {
            // Tự động ép đơn vị tính thành 'kg' nếu là Hải sản, ngược lại là 'phần'
            const unitValue = values.category === 'Hải sản' ? 'kg' : 'phần';

            const dataToSave = {
                ...values,
                unit: unitValue,
                quantity: values.inventoryType === 'fixed' ? (values.quantity ?? 0) : null
            };

            if (editingProduct) {
                // Cập nhật sản phẩm hiện có
                const productDocRef = doc(db, 'products', editingProduct.key);
                await updateDoc(productDocRef, dataToSave);
                message.success('Cập nhật sản phẩm thành công!');
            } else {
                // Thêm mới sản phẩm vào Firestore
                await addDoc(productsCollectionRef, dataToSave);
                message.success('Thêm sản phẩm mới thành công!');
            }
            setIsModalOpen(false);
            fetchProducts(); // Tải lại danh sách mới nhất
        } catch (error) {
            console.error("Lỗi khi lưu sản phẩm:", error);
            message.error('Có lỗi xảy ra khi lưu!');
        }
    };

    const handleDelete = async (key) => {
        try {
            const productDocRef = doc(db, 'products', key);
            await deleteDoc(productDocRef);
            message.success('Đã xóa sản phẩm!');
            fetchProducts(); // Tải lại danh sách
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
            message.error('Không thể xóa sản phẩm này!');
        }
    };

    const columns = [
        { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
        { title: 'Danh mục', dataIndex: 'category', key: 'category' },
        {
            title: 'Giá bán',
            dataIndex: 'price',
            key: 'price',
            render: (price, record) => (
                <span>
                    {Number(price).toLocaleString('vi-VN')} VNĐ {record.category === 'Hải sản' ? '/ kg' : '/ phần'}
                </span>
            )
        },
        { 
            title: 'Số lượng tồn kho', 
            key: 'quantity',
            render: (_, record) => (
                record.inventoryType === 'unlimited' ? (
                    <span className="text-slate-400 italic">Không giới hạn</span>
                ) : (
                    <span className="font-semibold text-slate-700">
                        {record.quantity ?? 0} {record.category === 'Hải sản' ? 'kg' : 'phần'}
                    </span>
                )
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status === 'Còn hàng' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {status}
                </span>
            )
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        className="text-sky-600 font-medium p-0"
                        onClick={() => handleOpenModal(record)}
                    >
                        Sửa
                    </Button>
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        className="font-medium p-0"
                        onClick={() => handleDelete(record.key)}
                    >
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <Card variant="borderless" className="shadow-sm rounded-2xl bg-white border border-slate-100 p-4">
            <div className="flex justify-between mb-4 items-center">
                <h3 className="font-bold text-slate-800 m-0 text-base">Quản lý Kho & Thực đơn</h3>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    className="bg-sky-600 hover:bg-sky-500 rounded-xl font-medium shadow-sm h-10 px-4"
                    onClick={() => handleOpenModal()}
                >
                    Thêm sản phẩm
                </Button>
            </div>

            <Table
                dataSource={dishes}
                columns={columns}
                loading={loading}
                pagination={{ pageSize: 5 }}
            />

            <Modal
                title={editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                okText="Lưu"
                cancelText="Hủy"
                centered
            >
                <Form form={form} layout="vertical" onFinish={handleSave} className="mt-4">
                    <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}>
                        <Input placeholder="Nhập tên sản phẩm..." className="rounded-lg" />
                    </Form.Item>

                    <Form.Item name="category" label="Danh mục" rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}>
                        <Select placeholder="Chọn danh mục" className="rounded-lg" onChange={handleCategoryChange}>
                            <Select.Option value="Hải sản">Hải sản</Select.Option>
                            <Select.Option value="Món mặn">Món mặn</Select.Option>
                            <Select.Option value="Rau">Rau</Select.Option>
                            <Select.Option value="Canh">Canh</Select.Option>
                            <Select.Option value="Món nhậu">Món nhậu</Select.Option>
                            <Select.Option value="Cơm">Cơm</Select.Option>
                            <Select.Option value="Lẩu">Lẩu</Select.Option>
                            <Select.Option value="Tráng miệng">Tráng miệng</Select.Option>
                            <Select.Option value="Đồ uống">Đồ uống</Select.Option>
                        </Select>
                    </Form.Item>

                    {/* Hiển thị thông báo đơn vị tính tự động dựa theo danh mục được chọn */}
                    {/* <Form.Item label="Đơn vị tính (Tự động theo danh mục)">
                        <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium text-sm">
                            {trackCategory === 'Hải sản' ? '⚖️ Tính theo Kilogram (kg)' : '🍽️ Tính theo Phần / Đĩa / Tô / Ly'}
                        </div>
                    </Form.Item> */}

                    <Form.Item name="price" label="Giá bán (VNĐ)" rules={[{ required: true, message: 'Vui lòng nhập giá bán!' }]}>
                        <InputNumber
                            className="w-full rounded-lg"
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value ? value.replace(/\$\s?|(,*)/g, '') : ''}
                        />
                    </Form.Item >

                    {/* Phân loại hình thức quản lý số lượng */}
                    <Form.Item name="inventoryType" label="Hình thức quản lý kho" rules={[{ required: true }]}>
                        <Select className="rounded-lg">
                            <Select.Option value="unlimited">Không giới hạn</Select.Option>
                            <Select.Option value="fixed">Tồn kho</Select.Option>
                        </Select>
                    </Form.Item>

                    {/* Chỉ hiện ô nhập số lượng nếu chọn loại có số lượng cố định */}
                    {trackInventoryType === 'fixed' && (
                        <Form.Item name="quantity" label="Số lượng tồn kho" rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}>
                            <InputNumber 
                                placeholder="Nhập số lượng..." 
                                className="w-full rounded-lg" 
                                min={0} 
                                step={trackCategory === 'Hải sản' ? 0.1 : 1} 
                            />
                        </Form.Item>
                    )}

                    <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}>
                        <Select placeholder="Chọn trạng thái" className="rounded-lg">
                            <Select.Option value="Còn hàng">Còn hàng</Select.Option>
                            <Select.Option value="Hết hàng">Hết hàng</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
}