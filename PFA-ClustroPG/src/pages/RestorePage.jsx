import { useAuth } from '../context/AuthContext';
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

export default function RestorePage() {
  const { user } = useAuth();
  const clientName = user?.username;
  const [clusters, setClusters] = useState([]);
  const [backups, setBackups] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState("");
  const [selectedBackup, setSelectedBackup] = useState("");
  const [message, setMessage] = useState("");

  // Load clusters
  useEffect(() => {
    fetch(`http://127.0.0.1:5000/get-clusters?client=${clientName}`)
      .then(res => res.json())
      .then(setClusters);
  }, [clientName]);

  // Load backups when cluster selected
  useEffect(() => {
    if (selectedCluster) {
      fetch(`http://127.0.0.1:5000/get-backups?client=${clientName}`)
        .then(res => res.json())
        .then(data => {
          const clusterBackups = data.filter(b => b.spec.cluster.name === selectedCluster);
          setBackups(clusterBackups);
        });
    }
  }, [selectedCluster]);

  const handleRestore = () => {
    if (!selectedCluster || !selectedBackup) {
      setMessage("Please select both cluster and backup.");
      return;
    }

    fetch('http://localhost:5000/restore-cluster', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
	clientname: clientName,
        source_cluster: selectedCluster,
        backup_name: selectedBackup
      })
    })
      .then(res => res.json())
      .then(data => setMessage(data.message || data.error));
  };

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab="Restore" />
      <div className="dashboard-content scrollable-content">
        <TopBar />

        <div className="p-5">
          <h3 className="text-primary fw-bold">Restore a Cluster</h3>

          <div className="form-group mt-4">
            <label>Step 1: Select Cluster</label>
            <select className="form-control" onChange={e => setSelectedCluster(e.target.value)}>
              <option value="">-- Choose cluster --</option>
              {clusters.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group mt-3">
            <label>Step 2: Choose Backup</label>
            <select className="form-control" onChange={e => setSelectedBackup(e.target.value)}>
              <option value="">-- Choose backup --</option>
              {backups.map(b => (
                <option key={b.metadata.name} value={b.metadata.name}>
                  {b.metadata.name} — {new Date(b.metadata.creationTimestamp).toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <button className="btn btn-success" onClick={handleRestore}>Restore Cluster</button>
          </div>

          {message && <div className="alert alert-info mt-4">{message}</div>}
        </div>
      </div>
    </div>
  );
}
