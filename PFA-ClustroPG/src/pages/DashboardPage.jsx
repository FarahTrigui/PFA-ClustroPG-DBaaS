import '../styles/MonitoringStaticPage.css';
import { useAuth } from '../context/AuthContext';
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { Line, Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default function MonitoringPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clusters, setClusters] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState('');
  const clientName = user?.username;

  // Fetch available clusters
  useEffect(() => {
    const fetchClusters = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/get-clusters?client=${user?.username}`);
        const data = await response.json();
        setClusters(data);
      } catch (error) {
        console.error('Error fetching clusters:', error);
      }
    };
    fetchClusters();
  }, []);

  // Fetch metrics for selected cluster
  useEffect(() => {
    if (!selectedCluster) return;
    setLoading(true);
    const fetchMetrics = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/metrics/cluster?cluster_name=${selectedCluster}`);
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [selectedCluster]);

  // Chart data generators
  const generateCPUChart = () => {
    if (!metrics?.system?.cpu) return null;
    return {
      labels: metrics.system.cpu.map(item => item.metric.pod),
      datasets: [{
        label: 'CPU Usage (cores)',
        data: metrics.system.cpu.map(item => parseFloat(item.value[1])),
        backgroundColor: 'rgba(75,192,192,0.6)',
      }]
    };
  };

  const generateMemoryChart = () => {
    if (!metrics?.system?.memory) return null;
    return {
      labels: metrics.system.memory.map(item => item.metric.pod),
      datasets: [{
        label: 'Memory Usage (bytes)',
        data: metrics.system.memory.map(item => parseFloat(item.value[1])),
        backgroundColor: 'rgba(153,102,255,0.6)',
      }]
    };
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content scrollable-content">
        <TopBar title="Monitoring Dashboard" />
        <div className="monitoring-container" style={{ backgroundColor: 'transparent' }}>
          <div className="monitoring-wrapper">
            <div className="monitoring-card">
              <h1 className="monitoring-title">Cluster Monitoring Overview</h1>

              <div className="monitoring-section">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="bg-gray-50 border border-gray-200 rounded p-4 w-full md:w-1/2">
                    <label className="font-semibold block text-sm text-gray-700 mb-1" htmlFor="clusterSelect">Selected Cluster:</label>
                    <select
                      id="clusterSelect"
                      value={selectedCluster}
                      onChange={(e) => setSelectedCluster(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    >
                      <option value="">-- Select --</option>
                      {clusters.map((c) => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded p-4 w-full md:w-1/2">
                    <h2 className="text-md font-semibold mb-2">PostgreSQL Metrics</h2>
                    {metrics ? (
                      <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                        <li><strong>Connections:</strong> {metrics.postgres.connections[0]?.value[1]}</li>
                        <li><strong>Replication Lag:</strong> {metrics.postgres.replication_lag[0]?.value[1]} sec</li>
                        <li><strong>Transaction Rate:</strong> {metrics.postgres.transaction_rate[0]?.value[1]} tx/s</li>
                        <li><strong>WAL Size:</strong> {metrics.postgres.wal_size[0]?.value[1]} bytes</li>
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No data available</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="monitoring-section">
                {loading && <p className="text-sm text-gray-500">Loading metrics...</p>}
                {metrics && (
                  <div className="cpu-mem-charts">
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold mb-2">CPU Usage</h2>
                      <div>
                        <Bar data={generateCPUChart()} options={{ maintainAspectRatio: false }} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold mb-2">Memory Usage</h2>
                      <div>
                        <Bar data={generateMemoryChart()} options={{ maintainAspectRatio: false }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
