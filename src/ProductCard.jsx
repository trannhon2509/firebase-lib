import React from 'react';
import './App.css';

function ProductCard({ product }) {
  return (
    <div className="product-card" style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: 16,
      border: '1px solid #eee',
      borderRadius: 12,
      boxShadow: '0 2px 8px #f0f0f0',
      background: '#fff',
      maxWidth: 350
    }}>
      <img src={product.image} alt={product.name} width={60} style={{ borderRadius: '50%' }} />
      <div>
        <div style={{ fontWeight: 'bold', fontSize: 18 }}>{product.name}</div>
        <div>Giá: <b>{product.price} USD</b></div>
        <div>Số lượng: {product.quantity}</div>
        <div>Màu sắc: {product.colors && product.colors.length > 0 ? (
          product.colors.map((color, idx) => (
            <span key={color+idx} style={{
              display: 'inline-block',
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: color,
              marginRight: 4,
              border: '1px solid #aaa',
              verticalAlign: 'middle',
            }} title={color}></span>
          ))
        ) : (
          <span>N/A</span>
        )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;

