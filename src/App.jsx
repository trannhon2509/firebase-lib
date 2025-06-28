import React, { useState } from 'react';
import { useFirestoreCacheOnce } from './useFirestoreCacheOnce';
import TableCommon from './TableCommon';
import { Button, Space } from 'antd';

function App() {
  const { data: products, addItem, updateItem, deleteItem } = useFirestoreCacheOnce('products');
  const [form, setForm] = useState({ name: '', price: '' });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: '' });
  const [loading, setLoading] = useState(false);

  // Thêm sản phẩm mới
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    setLoading(true);
    await addItem({ name: form.name, price: Number(form.price) });
    setForm({ name: '', price: '' });
    setLoading(false);
  };

  // Bắt đầu sửa
  const startEdit = (product) => {
    setEditId(product.id);
    setEditForm({ name: product.name, price: product.price });
  };

  // Lưu sửa
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    await updateItem(editId, { name: editForm.name, price: Number(editForm.price) });
    setEditId(null);
    setEditForm({ name: '', price: '' });
    setLoading(false);
  };

  // Xóa sản phẩm
  const handleDelete = async (id) => {
    if (!window.confirm('Xóa sản phẩm này?')) return;
    setLoading(true);
    await deleteItem(id);
    setLoading(false);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      searchable: true,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      searchable: true,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      searchable: true,
      render: (price) => price !== undefined ? price : '-',
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (updatedAt) => updatedAt?.seconds ? new Date(updatedAt.seconds * 1000).toLocaleString() : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, product) => (
        <Space>
          <Button onClick={() => startEdit(product)} disabled={loading} size="small">Edit</Button>
          <Button onClick={() => handleDelete(product.id)} disabled={loading} size="small" danger>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Products</h2>
      <form onSubmit={editId ? handleUpdate : handleAdd} style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder="Name"
          value={editId ? editForm.name : form.name}
          onChange={e => editId ? setEditForm(f => ({ ...f, name: e.target.value })) : setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={editId ? editForm.price : form.price}
          onChange={e => editId ? setEditForm(f => ({ ...f, price: e.target.value })) : setForm(f => ({ ...f, price: e.target.value }))}
          required
        />
        <button type="submit" disabled={loading}>{editId ? 'Save' : 'Add'}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setEditForm({ name: '', price: '' }); }}>Cancel</button>}
      </form>
      <TableCommon columns={columns} dataSource={products} rowKey="id" />
    </div>
  );
}

export default App;