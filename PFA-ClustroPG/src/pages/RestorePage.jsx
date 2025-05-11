import React from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import '../styles/RestorePage.css';

export default function RestorePage() {
  return (
    <div className="dashboard-layout">
      <Sidebar activeTab="Restore" />
      <div className="dashboard-content">
        <TopBar />
        <div className="restore-page-container scrollable-content">
          <h1 className="restore-title text-primary fw-bold">YOUR Restores</h1>
          <p className="restore-subtitle fw-semibold">
            Welcome to Clustro, manage your DB you’re the maestro!
          </p>

          <div className="restore-panels">
            <div className="restore-left">
              <div className="step">
                <span className="dot red"></span>
                <strong className="label">Cluster</strong>
                <button className="btn step-btn">Select cluster</button>
              </div>
              <div className="step">
                <span className="dot blue"></span>
                <strong className="label">Backup</strong>
                <button className="btn step-btn">Choose backup</button>
              </div>
              <div className="step">
                <span className="dot yellow"></span>
                <strong className="label">Restore</strong>
                <button className="btn step-btn highlight">Restore cluster</button>
              </div>
              <div className="step">
                <span className="dot green"></span>
                <strong className="label">Confirmation</strong>
                <button className="btn step-btn">ETA & warning</button>
              </div>

              <div className="backup-info">
                <h6>Backup details</h6>
                <p className="mb-0">Cluster: dninfz</p>
                <p className="mb-0">Backup: 101kkz</p>
                <p>Description: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              </div>

              <button className="btn cancel-btn">Cancel</button>
            </div>

            <div className="restore-right">
              <h6 className="review-title">Review on Restore</h6>
              <div className="review-details">Details</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}