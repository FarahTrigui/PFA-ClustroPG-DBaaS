import { useAuth } from '../context/AuthContext';
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import '../styles/BackupsPage.css';
import { useNavigate } from 'react-router-dom';

export default function BackupsPage() {
  const { user } = useAuth();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const clientName = user?.username;

  useEffect(() => {
// In your fetchBackups function:
const fetchBackups = async () => {
  try {
    const response = await fetch(`http://localhost:5000/get-backups?client=${user?.username}`);
    if (!response.ok) {
      throw new Error('Failed to fetch backups');
    }
    const data = await response.json();
    setBackups(Array.isArray(data) ? data : []);  // Ensure it's an array
  } catch (err) {
    setError(err.message);
    setBackups([]);  // Reset backups on error
  } finally {
    setLoading(false);
  }
};

    fetchBackups();
  }, []);

  const triggerBackup = async (clusterName) => {
    try {
      const response = await fetch('http://localhost:5000/trigger-backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clusterName })
      });
      if (!response.ok) {
        throw new Error('Failed to trigger backup');
      }
      const newBackup = await response.json();
      setBackups([...backups, newBackup]);
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Success': 'bg-success',
      'Failed': 'bg-danger',
      'InProgress': 'bg-warning text-dark',
      'Completed': 'bg-success'
    };
    return <span className={`badge ${statusMap[status] || 'bg-secondary'}`}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar activeTab="Backups" />
        <div className="dashboard-content  scrollable-content">
          <TopBar />
          <div className="d-flex justify-content-center mt-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-layout">
        <Sidebar activeTab="Backups" />
        <div className="dashboard-content">
          <TopBar />
          <div className="alert alert-danger m-4">
            Error loading backups: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab="Backups" />
      <div className="dashboard-content  scrollable-content">
        <TopBar />
        <div className="scroll-wrapper">
        <div className="p-5 ">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="text-primary fw-bold">YOUR Backups</h4>
              <p className="fw-semibold">
                Welcome to Clustro, manage your DB you're the maestro!
              </p>
            </div>
            <button 
              className="btn btn-info text-white px-4 rounded-pill"
              onClick={() => navigate('/create-backup')}
            >
              + new Backup
            </button>
          </div>

          
          <table className="table table-bordered text-center">
            <thead className="table-light">
              <tr>
                <th>Backup name</th>
                <th>Cluster</th>
                <th>Size</th>
                <th>Time created</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((backup, idx) => (
                <tr key={idx}>
                  <td>{backup.metadata.name}</td>
                  <td>{backup.spec.cluster.name}</td>
                  <td>{backup.status?.size || 'N/A'}</td>
                  <td>{new Date(backup.metadata.creationTimestamp).toLocaleString()}</td>
                  <td>{getStatusBadge(backup.status?.phase || backup.status?.status)}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => triggerBackup(backup.spec.cluster.name)}
                    >
                      Trigger
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-info"
                      onClick={() => navigate(`/backup-details/${backup.metadata.name}`)}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </div>
  );
}
