import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import '../styles/MonitoringPage.css';

export default function MonitoringPage() {
  return (
    <div className="dashboard-layout">
      <Sidebar activeTab="Monitoring" />
      <div className="dashboard-content scrollable-content">
        <TopBar />
        <div className="monitoring-container" style={{ backgroundColor: 'transparent' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="monitoring-title">YOUR Monitorings</h1>
            <Link to="/dashboard" className="btn-new-metrics">
              See My Metrics
            </Link>
          </div>

          <div className="container-fluid">
            <div className="row m-5">
              <div className="col-md-6">
                <div className="card bg-dark text-white p-4 rounded-4 shadow-sm border-0">
                  <div className="position-relative" style={{ width: '155px', height: '155px', margin: '0 auto' }}>
                    <div className="sleep-ring sleep-ring-score"></div>
                    <div className="sleep-ring sleep-ring-quality"></div>
                    <div className="sleep-ring sleep-ring-goal"></div>
                    <div className="position-absolute top-50 start-50 translate-middle text-center">
                      <div className="fw-bold">8hr 00m</div>
                      <div className="small text-muted">Perfect sleep</div>
                    </div>
                  </div>
                  <ul className="list-unstyled small">
                    <li><span className="badge bg-warning me-2">&nbsp;</span>Sleep Goal</li>
                    <li><span className="badge bg-success me-2">&nbsp;</span>Sleep Quality</li>
                    <li><span className="badge bg-primary me-2">&nbsp;</span>Sleep Score</li>
                  </ul>
                  <div className="mt-3 small text-muted bg-secondary bg-opacity-10 p-3 rounded">
                    <i className="bi bi-info-circle-fill me-1"></i>
                    <strong>Perfect sleep!</strong> You reached your aim <strong>sleep time</strong> and there was <strong>no issue</strong> during your sleep.
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card bg-dark text-white p-4 rounded-4 shadow-sm border-0">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-bar-chart-fill fs-4 text-muted me-2"></i>
                    <h5 className="fw-bold mb-0">Cluster Performance Monitoring</h5>
                  </div>
                  <p className="small text-muted mb-3">
                    Gain insight into your cluster health by tracking each stage of your rest. VitaPulse provides a detailed breakdown of your cycles to help you optimize recovery.
                  </p>
                  <div className="card bg-secondary bg-opacity-10 border border-secondary border-opacity-25 p-3 rounded-4">
                    <div className="row g-3 text-center">
                      <div className="col-6">
                        <div
                          className="donut-chart donut-1 mb-2"
                          style={{ '--percentage': 27 }}
                        >
                          <div className="donut-label">27%</div>
                        </div>
                        <div><small>Deep Sleep</small></div>
                      </div>
                      <div className="col-6">
                        <div
                          className="donut-chart donut-2 mb-2"
                          style={{ '--percentage': 48 }}
                        >
                          <div className="donut-label">48%</div>
                        </div>
                        <div><small>Relax sleep</small></div>
                      </div>
                      <div className="col-6">
                        <div
                          className="donut-chart donut-3 mb-2"
                          style={{ '--percentage': 18 }}
                        >
                          <div className="donut-label">18%</div>
                        </div>
                        <div><small>Cache usage</small></div>
                      </div>
                      <div className="col-6">
                        <div
                          className="donut-chart donut-4 mb-2"
                          style={{ '--percentage': 7 }}
                        >
                          <div className="donut-label">7%</div>
                        </div>
                        <div><small>Disk I/O</small></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#1f1f1f', padding: '4rem 2rem' }}>
            <div className="text-center text-white mb-5">
              <h2>What You Can Do With <span className="text-info">Monitoring</span></h2>
            </div>

            <div className="row text-white text-center">
              <div className="col-md-4">
                <div className="p-4 bg-primary bg-gradient rounded-4 shadow">
                  <h5 className="fw-bold">Daily statics</h5>
                  <small>Ability to see Cluster Health Overview</small>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-4 bg-primary bg-gradient rounded-4 shadow">
                  <h5 className="fw-bold">Daily Performance tracking</h5>
                  <small>CPU usage (%), Memory usage (GB), Disk I/O, Network I/O</small>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-4 bg-primary bg-gradient rounded-4 shadow">
                  <h5 className="fw-bold">Alerting and Threshold</h5>
                  <small>Table of triggered alerts, option to customize thresholds</small>
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