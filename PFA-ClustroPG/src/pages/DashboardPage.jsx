import React from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import '../styles/DashboardPage.css';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-content">
        <TopBar />

        <div className="content-area px-5 py-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold mb-0">
              <span role="img" aria-label="wave">👋</span> Welcome to Clustro, manage your DB you’re the maestro!
            </h3>
            <button
              className="btn btn-info text-white px-4 rounded-pill"
              onClick={() => navigate('/create-cluster')}
            >
              + new Clustro
            </button>
          </div>

          <div className="row g-5">
            {/* Left panel */}
            <div className="col-md-4">
              <div className="dashboard-card p-4">
                <button className="btn btn-dark w-100 mb-2">DB information</button>
                <button className="btn btn-outline-secondary w-100 mb-2">Cluster information</button>
                <button className="btn btn-dark w-100 mb-2">Storage & Volumes</button>
                <button className="btn btn-outline-secondary w-100 mb-4">Backup History</button>

                <div className="list-group">
                  <button className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    Metrics <span>&gt;</span>
                  </button>
                  <button className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    Location map <span>&gt;</span>
                  </button>
                  <button className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    Organizational chart <span>&gt;</span>
                  </button>
                  <button className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    Equipment page <span>&gt;</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right panel */}
            <div className="col-md-8">
              <div className="dashboard-card p-4 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">📊 Bar Chart</h5>
                  <div className="dropdown">
                    <button className="btn btn-outline-primary dropdown-toggle btn-sm" data-bs-toggle="dropdown">
                      Last 30 days
                    </button>
                    <ul className="dropdown-menu">
                      <li><a className="dropdown-item" href="#">Last 7 days</a></li>
                      <li><a className="dropdown-item" href="#">Last 30 days</a></li>
                    </ul>
                  </div>
                </div>
                {/* Replace this div with actual chart */}
                <div className="chart-placeholder">[ Chart here ]</div>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <div className="dashboard-card p-4">
                    <h6>✅ Success Rate</h6>
                    <p>[ Chart or value: 98% ]</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="dashboard-card p-4">
                    <h6>⚠️ Payment Issues</h6>
                    <p>[ Chart or breakdown ]</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}