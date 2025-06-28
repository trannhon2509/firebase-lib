import React, { useState } from 'react';
import { useFirestoreCacheOnce } from './useFirestoreCacheOnce';

function App() {
  const {
    data: products,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    pageSize,
    addItem,
    updateItem,
    deleteItem
  } = useFirestoreCacheOnce('products', 3);
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

  // Render các nút số trang
  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          disabled={currentPage === i || loading}
          style={{
            margin: '0 2px',
            fontWeight: currentPage === i ? 'bold' : 'normal',
            background: currentPage === i ? '#1976d2' : '#fff',
            color: currentPage === i ? '#fff' : '#000',
            border: '1px solid #1976d2',
            borderRadius: 3,
            minWidth: 32
          }}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

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
      <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Updated At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr><td colSpan="5" style={{ textAlign: 'center' }}>No products</td></tr>
          ) : (
            products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name || '-'}</td>
                <td>{product.price !== undefined ? product.price : '-'}</td>
                <td>{product.updatedAt?.seconds ? new Date(product.updatedAt.seconds * 1000).toLocaleString() : '-'}</td>
                <td>
                  <button onClick={() => startEdit(product)} disabled={loading}>Edit</button>
                  <button onClick={() => handleDelete(product.id)} disabled={loading} style={{ marginLeft: 4 }}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Pagination controls */}
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={prevPage} disabled={currentPage === 1 || loading}>Prev</button>
        {renderPageNumbers()}
        <button onClick={nextPage} disabled={currentPage === totalPages || loading}>Next</button>
        <span style={{ marginLeft: 8 }}>
          Trang {currentPage}/{totalPages} (mỗi trang {pageSize} sản phẩm)
        </span>
      </div>
    </div>
  );
}

export default App;