import React from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import '../styles/TablesPage.css';

export default function TablesPage() {
  return (
    <div className="dashboard-layout">
      <Sidebar activeTab="Tables" />
      <div className="dashboard-content">
        <TopBar />

        <div className="tables-container">
          <div className="tables-header">
            <div>
              <h2 className="tables-title">YOUR Tables</h2>
              <p className="tables-subtitle">Welcome to Clustro, manage your DB you’re the maestro!</p>
            </div>
            <button className="new-clustro-btn">+ new Clustro</button>
          </div>

          <div className="tables-chart-row">
            <div className="line-chart-placeholder">Line Chart Placeholder</div>
            <div className="bar-chart-placeholder">Bar Chart Placeholder</div>
          </div>

          <div className="tables-filter-row">
            <div className="table-heading-select">
              <label htmlFor="table-select" className="table-label">Prodcuts table</label>
              <select id="table-select" className="table-dropdown">
                <option value="products">Products table</option>
                <option value="employees">Employee overview</option>
                <option value="backups">Backup logs</option>
              </select>
            </div>
            <div className="filter-controls">
              <input type="text" placeholder="Quick Search..." />
              <input type="date" defaultValue="2023-07-29" />
              <button className="filter-btn">Filter Columns</button>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="product-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Work hours</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2341421</td>
                  <td>Ahmed Rashdan</td>
                  <td>Help Desk Executive</td>
                  <td>IT Department</td>
                  <td>29 July 2023</td>
                  <td><span className="badge badge-info">Work from office</span></td>
                  <td>09:00</td>
                  <td>18:00</td>
                  <td>10h 2m</td>
                </tr>
              </tbody>
            </table>
            <p className="pagination-text">Page 1 of 100</p>
          </div>
        </div>
      </div>
    </div>
  );
}