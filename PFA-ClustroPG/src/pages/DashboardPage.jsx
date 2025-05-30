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
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar title="Monitoring Dashboard" />

        <div className="p-6 space-y-6">
          <div>
            <label className="font-semibold">Select Cluster:</label>
            <select
              value={selectedCluster}
              onChange={(e) => setSelectedCluster(e.target.value)}
              className="ml-2 p-2 border rounded"
            >
              <option value="">-- Select --</option>
              {clusters.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {loading && <p>Loading metrics...</p>}

          {metrics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2">CPU Usage</h2>
                  <Bar data={generateCPUChart()} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2">Memory Usage</h2>
                  <Bar data={generateMemoryChart()} />
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">PostgreSQL Metrics</h2>
                <ul className="list-disc list-inside">
                  <li><strong>Connections:</strong> {metrics.postgres.connections[0]?.value[1]}</li>
                  <li><strong>Replication Lag:</strong> {metrics.postgres.replication_lag[0]?.value[1]} sec</li>
                  <li><strong>Transaction Rate:</strong> {metrics.postgres.transaction_rate[0]?.value[1]} tx/s</li>
                  <li><strong>WAL Size:</strong> {metrics.postgres.wal_size[0]?.value[1]} bytes</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
