import { useAuth } from '../context/AuthContext';
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import '../styles/ClustersPage.css';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ClustersPage() {
  const { user } = useAuth();
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract client name from URL or state
  const clientName = user?.username;

  useEffect(() => {
    const fetchClusters = async () => {
      try {
        const response = await fetch(`http://localhost:5000/get-clusters?client=${user?.username}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Ensure we're working with properly formatted data
        const formattedClusters = data.map(cluster => ({
          name: cluster.name || cluster.metadata?.name || 'Unknown',
          status: cluster.status || cluster.status?.phase || 'Unknown',
          instances: cluster.instances || cluster.status?.instances || 'N/A',
          ready: cluster.ready || cluster.status?.readyInstances || 'N/A',
          primary: cluster.primary || cluster.status?.currentPrimary || 'N/A',
          created: cluster.created || cluster.metadata?.creationTimestamp || 'Unknown'
        }));
        
        setClusters(formattedClusters);
      } catch (err) {
        setError(err.toString()); // Convert error to string
      } finally {
        setLoading(false);
      }
    };

    fetchClusters();
  }, [clientName]);

  const handleDelete = async (clusterName) => {
    if (!window.confirm(`Are you sure you want to delete ${clusterName}?`)) return;
    
    try {
      const response = await fetch(`http://localhost:5000/get-clusters/${clusterName}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete cluster');
      }
      
      setClusters(clusters.filter(c => c.name !== clusterName));
    } catch (err) {
      setError(err.toString());
    }
  };

  const getStatusBadge = (status) => {
  if (!status) return <span className="badge bg-secondary">Unknown</span>;

  const normalizedStatus = status.toLowerCase();
  const isHealthy = normalizedStatus.includes("healthy");

  return (
    <span className={`badge ${isHealthy ? "bg-success" : "bg-warning"}`}>
      {isHealthy ? "Healthy" : status}
    </span>
  );
};

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar activeTab="Clusters" />
        <div className="dashboard-content">
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
        <Sidebar activeTab="Clusters" />
        <div className="dashboard-content">
          <TopBar />
          <div className="alert alert-danger m-4">
            Error loading clusters: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab="Clusters" />
      <div className="dashboard-content">
        <TopBar clientName={clientName} />
        <div className="p-5 scrollable-content">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="text-primary fw-bold">YOUR CLUSTERS</h4>
              <p className="fw-semibold">
                Showing clusters for: <span className="text-info">{clientName}</span>
              </p>
            </div>
            <button 
              className="btn btn-info text-white px-4 rounded-pill"
              onClick={() => navigate('/create-cluster', { state: { clientName } })}
            >
              + New Cluster
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered text-center">
              <thead className="table-light">
                <tr>
                  <th>Cluster Name</th>
                  <th>Status</th>
                  <th>Instances</th>
                  <th>Ready</th>
                  <th>Primary</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clusters.length > 0 ? (
                  clusters.map((cluster) => (
                    <tr key={cluster.name}>
                      <td>{cluster.name}</td>
                      <td>{getStatusBadge(cluster.status)}</td>
                      <td>{cluster.instances}</td>
                      <td>{cluster.ready}</td>
                      <td>{cluster.primary}</td>
                      <td>{new Date(cluster.created).toLocaleDateString()}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button 
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => navigate(`/clusters/${cluster.name}`)}
                          >
                            View
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(cluster.name)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-muted py-4">
                      No clusters found for {clientName}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
