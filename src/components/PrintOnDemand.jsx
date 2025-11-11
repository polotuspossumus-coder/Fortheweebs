import React, { useState } from 'react';
import './PrintOnDemand.css';

export function PrintOnDemand() {
  const [activeTab, setActiveTab] = useState('comics');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orders, setOrders] = useState([
    {
      id: 'ORD-001',
      product: 'My Manga Vol. 1',
      type: 'Comic Book',
      quantity: 25,
      status: 'Printing',
      revenue: '$312.50',
      date: '2025-11-08'
    },
    {
      id: 'ORD-002',
      product: 'Character Trading Cards',
      type: 'Trading Cards',
      quantity: 100,
      status: 'Shipped',
      revenue: '$175.00',
      date: '2025-11-05'
    }
  ]);

  const products = {
    comics: [
      { name: 'Comic Book', size: '6.625" x 10.25"', pages: '24-200', price: '$12.50', yourCut: '75%' },
      { name: 'Manga Volume', size: '5" x 7.5"', pages: '100-300', price: '$15.00', yourCut: '75%' },
      { name: 'Art Book', size: '8.5" x 11"', pages: '48-120', price: '$25.00', yourCut: '75%' },
      { name: 'Graphic Novel', size: '7" x 10"', pages: '100-400', price: '$20.00', yourCut: '75%' },
      { name: 'Coloring Book', size: '8.5" x 11"', pages: '24-100', price: '$10.00', yourCut: '75%' },
      { name: 'Novel / Light Novel', size: '5.5" x 8.5"', pages: '100-600', price: '$14.00', yourCut: '75%' }
    ],
    cards: [
      { name: 'Standard Trading Cards', size: '2.5" x 3.5"', quantity: '50-5000', price: '$1.75/card', yourCut: '75%' },
      { name: 'Premium Foil Cards', size: '2.5" x 3.5"', quantity: '50-5000', price: '$2.50/card', yourCut: '75%' },
      { name: 'Holographic Cards', size: '2.5" x 3.5"', quantity: '50-5000', price: '$3.00/card', yourCut: '75%' },
      { name: 'Jumbo Cards', size: '5" x 7"', quantity: '25-1000', price: '$5.00/card', yourCut: '75%' }
    ],
    merch: [
      { name: 'Poster Prints', size: '18" x 24"', quantity: '1-1000', price: '$15.00', yourCut: '75%' },
      { name: 'Art Prints', size: '11" x 14"', quantity: '1-1000', price: '$12.00', yourCut: '75%' },
      { name: 'Sticker Sheets', size: '8.5" x 11"', quantity: '50-5000', price: '$5.00', yourCut: '75%' },
      { name: 'Bookmarks', size: '2" x 7"', quantity: '50-5000', price: '$3.00', yourCut: '75%' }
    ]
  };

  return (
    <div className="print-on-demand">
      <div className="pod-header">
        <h1>📦 Print-on-Demand Shop</h1>
        <p className="pod-tagline">
          Turn your digital art into physical products. We handle printing, shipping & returns. You keep 75%.
        </p>
        <div className="pod-stats">
          <div className="stat-card">
            <span className="stat-value">$1,247</span>
            <span className="stat-label">This Month</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">156</span>
            <span className="stat-label">Orders</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">12</span>
            <span className="stat-label">Active Products</span>
          </div>
        </div>
      </div>

      <div className="pod-tabs">
        <button 
          className={activeTab === 'comics' ? 'active' : ''} 
          onClick={() => setActiveTab('comics')}
        >
          📚 Comics & Books
        </button>
        <button 
          className={activeTab === 'cards' ? 'active' : ''} 
          onClick={() => setActiveTab('cards')}
        >
          🎴 Trading Cards
        </button>
        <button 
          className={activeTab === 'merch' ? 'active' : ''} 
          onClick={() => setActiveTab('merch')}
        >
          🎨 Art Prints & Merch
        </button>
        <button 
          className={activeTab === 'orders' ? 'active' : ''} 
          onClick={() => setActiveTab('orders')}
        >
          📊 Orders & Sales
        </button>
      </div>

      {activeTab !== 'orders' && (
        <div className="products-grid">
          {products[activeTab].map((product, idx) => (
            <div key={idx} className="product-card">
              <div className="product-icon">
                {activeTab === 'comics' && '📖'}
                {activeTab === 'cards' && '🎴'}
                {activeTab === 'merch' && '🖼️'}
              </div>
              <h3>{product.name}</h3>
              <div className="product-details">
                <p><strong>Size:</strong> {product.size}</p>
                <p><strong>{activeTab === 'comics' ? 'Pages' : 'Quantity'}:</strong> {product.pages || product.quantity}</p>
                <p><strong>Base Price:</strong> {product.price}</p>
                <p className="your-cut"><strong>You Keep:</strong> <span className="highlight">{product.yourCut}</span></p>
              </div>
              <button className="create-btn" onClick={() => setSelectedProduct(product)}>
                Create {product.name}
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="orders-section">
          <div className="orders-header">
            <h2>Recent Orders</h2>
            <button className="export-btn">📥 Export CSV</button>
          </div>
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Your Revenue</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="order-id">{order.id}</td>
                    <td>{order.product}</td>
                    <td>{order.type}</td>
                    <td>{order.quantity}</td>
                    <td>
                      <span className={`status status-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="revenue">{order.revenue}</td>
                    <td>{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedProduct(null)}>×</button>
            <h2>Create {selectedProduct.name}</h2>
            
            <div className="setup-wizard">
              <div className="wizard-step">
                <h3>📁 Step 1: Upload Your Files</h3>
                <div className="upload-area">
                  <div className="upload-box">
                    <span className="upload-icon">☁️</span>
                    <p>Drag & drop your files or click to browse</p>
                    <p className="upload-hint">PDF, PNG, JPG - High-res 300 DPI recommended</p>
                  </div>
                </div>
              </div>

              <div className="wizard-step">
                <h3>⚙️ Step 2: Configure Product</h3>
                <div className="config-options">
                  <label>
                    <span>Product Name</span>
                    <input type="text" placeholder="My Awesome Manga Vol. 1" />
                  </label>
                  <label>
                    <span>Description</span>
                    <textarea placeholder="Tell customers about your product..." rows="3"></textarea>
                  </label>
                  <label>
                    <span>Retail Price</span>
                    <input type="number" placeholder="15.00" />
                    <small>Base cost: {selectedProduct.price} | You keep 75%</small>
                  </label>
                  {activeTab === 'cards' && (
                    <>
                      <label>
                        <span>Cards per Pack</span>
                        <select>
                          <option>5 cards</option>
                          <option>10 cards</option>
                          <option>15 cards</option>
                          <option>Full Set (50+)</option>
                        </select>
                      </label>
                      <label>
                        <span>Card Back Design</span>
                        <select>
                          <option>Use uploaded design</option>
                          <option>ForTheWeebs default</option>
                          <option>Custom template</option>
                        </select>
                      </label>
                    </>
                  )}
                </div>
              </div>

              <div className="wizard-step">
                <h3>🚀 Step 3: Publish to Store</h3>
                <div className="publish-options">
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked />
                    <span>List on ForTheWeebs Marketplace</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    <span>Allow custom orders (buyers can request variations)</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    <span>Limited edition (set quantity limit)</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setSelectedProduct(null)}>
                  Cancel
                </button>
                <button className="btn-primary">
                  Create Product & Go Live
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pod-info">
        <div className="info-card">
          <h3>📦 How It Works</h3>
          <ol>
            <li>Upload your artwork/comic pages in high resolution</li>
            <li>We handle printing, quality control, packaging & shipping</li>
            <li>Customer orders → We fulfill → You get paid 75%</li>
            <li>No upfront costs, no inventory, no risk</li>
          </ol>
        </div>
        <div className="info-card">
          <h3>💰 Revenue Split</h3>
          <ul>
            <li><strong>You Keep:</strong> 75% of retail price</li>
            <li><strong>Platform Fee:</strong> 25% (covers printing, shipping, support, returns)</li>
            <li><strong>No Hidden Fees:</strong> What you see is what you get</li>
            <li><strong>Monthly Payouts:</strong> Direct deposit, PayPal, or Stripe</li>
          </ul>
        </div>
        <div className="info-card">
          <h3>🎴 Trading Cards Special</h3>
          <ul>
            <li>Standard, foil, holographic, or textured finishes</li>
            <li>Create full sets or individual cards</li>
            <li>Booster pack options for collectibility</li>
            <li>Rarity tiers (common, rare, ultra-rare)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
