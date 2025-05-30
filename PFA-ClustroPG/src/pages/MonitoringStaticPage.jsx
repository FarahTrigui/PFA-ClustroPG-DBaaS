import React from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import '../styles/MonitoringStaticPage.css';
Chart.register(...registerables);

const dummyCPUData = {
  labels: ['cluster-pod-1', 'cluster-pod-2', 'cluster-pod-3'],
  datasets: [{
    label: 'CPU Usage (cores)',
    data: [0.3, 0.45, 0.25],
    backgroundColor: 'rgba(75,192,192,0.6)',
  }]
};

const dummyMemoryData = {
  labels: ['cluster-pod-1', 'cluster-pod-2', 'cluster-pod-3'],
  datasets: [{
    label: 'Memory Usage (bytes)',
    data: [204857600, 304857600, 104857600],
    backgroundColor: 'rgba(153,102,255,0.6)',
  }]
};

export default function MonitoringStaticPage() {
  return (
    
     <div className="dashboard-layout">
      <Sidebar activeTab="Monitoring" />
      <div className="dashboard-content scrollable-content">
        <TopBar />
        <div className="monitoring-container" style={{ backgroundColor: 'transparent' }}>

          <div className="monitoring-wrapper">
          <div className="monitoring-card">
            <h1 className="monitoring-title">Cluster Monitoring Overview</h1>

            <div className="monitoring-section">
              {/* Info Row */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="bg-gray-50 border border-gray-200 rounded p-4 w-full md:w-1/2">
                  <label className="font-semibold block text-sm text-gray-700 mb-1" htmlFor="clusterSelect">Selected Cluster:</label>
                  <select id="clusterSelect" className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                    <option value="example-cluster">example-cluster</option>
                    <option value="analytics-cluster">analytics-cluster</option>
                    <option value="reporting-cluster">reporting-cluster</option>
                  </select>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded p-4 w-full md:w-1/2">
                  <h2 className="text-md font-semibold mb-2">PostgreSQL Metrics</h2>
                  <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                    <li><strong>Connections:</strong> 15</li>
                    <li><strong>Replication Lag:</strong> 0.5 sec</li>
                    <li><strong>Transaction Rate:</strong> 27 tx/s</li>
                    <li><strong>WAL Size:</strong> 5242880 bytes</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="monitoring-section">
              {/* Charts */}
              <div className="cpu-mem-charts">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold mb-2">CPU Usage</h2>
                  <div >
                    <Bar data={dummyCPUData} options={{ maintainAspectRatio: false }} />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold mb-2">Memory Usage</h2>
                  <div >
                    <Bar data={dummyMemoryData} options={{ maintainAspectRatio: false }} />
                  </div>
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