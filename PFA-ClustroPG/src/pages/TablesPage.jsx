import { useAuth } from '../context/AuthContext';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import '../styles/TablesPage.css';
import { useLocation } from 'react-router-dom';

export default function TablesPage() {
  const [clusters, setClusters] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState('');
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [tableData, setTableData] = useState({ columns: [], rows: [] });
  const [tableStructure, setTableStructure] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState({
    clusters: false,
    tables: false,
    tableData: false,
    structure: false,
    addingRow: false,
    creatingTable: false
  });
  const [showAddRowModal, setShowAddRowModal] = useState(false);
  const [showCreateTableModal, setShowCreateTableModal] = useState(false);
  const [newRowData, setNewRowData] = useState({});
  const [newTableName, setNewTableName] = useState('');
  const [newTableColumns, setNewTableColumns] = useState([{ name: '', type: 'VARCHAR(255)' }]);

  const location = useLocation();
  const { user } = useAuth();
  const clientName = user?.username;

  // Enhanced fetch with error handling
  const fetchWithHandling = async (url, type) => {
    try {
      setLoading(prev => ({ ...prev, [type]: true }));
      setError(null);
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || `Error fetching ${type}`);
      }
      
      return data;
      
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  // Fetch table structure
  const fetchTableStructure = async (cluster, table) => {
    if (!cluster || !table) return;
    
    const data = await fetchWithHandling(
      `http://127.0.0.1:5000/get-table-structure?cluster=${cluster}&table=${table}`,
      'structure'
    );
    
    if (data) {
      setTableStructure(data.columns || []);
      // Initialize empty row data
      const initialData = {};
      data.columns.forEach(col => {
        initialData[col.name] = '';
      });
      setNewRowData(initialData);
    }
  };

  // Fetch table data
  const fetchTableData = async (cluster, table) => {
    if (!cluster || !table) {
      setTableData({ columns: [], rows: [] });
      return;
    }

    const data = await fetchWithHandling(
      `http://127.0.0.1:5000/get-table-data?cluster=${cluster}&table=${table}`,
      'tableData'
    );

    if (data) {
      setTableData({
        columns: Array.isArray(data.columns) ? data.columns : [],
        rows: Array.isArray(data.rows) ? data.rows : []
      });
    }
  };

  // Add new row to table
  const handleAddRow = async () => {
    if (!selectedCluster || !selectedTable) return;

    setLoading(prev => ({ ...prev, addingRow: true }));
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/add-table-row', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cluster: selectedCluster,
          table: selectedTable,
          values: newRowData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add row');
      }

      await fetchTableData(selectedCluster, selectedTable);
      setShowAddRowModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(prev => ({ ...prev, addingRow: false }));
    }
  };

  // Create new table
  const handleCreateTable = async () => {
    if (!selectedCluster || !newTableName || newTableColumns.some(c => !c.name)) {
      setError('Table name and all column names are required');
      return;
    }

    setLoading(prev => ({ ...prev, creatingTable: true }));
    setError(null);

    try {
      const columnDefs = newTableColumns.map(col => `${col.name} ${col.type}`);
      const response = await fetch('http://127.0.0.1:5000/create-table', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cluster: selectedCluster,
          table_name: newTableName,
          columns: columnDefs
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create table');
      }

      // Refresh tables list
      const tablesData = await fetchWithHandling(
        `http://127.0.0.1:5000/get-tables?cluster=${selectedCluster}`,
        'tables'
      );

      if (tablesData) {
        const tablesArray = Array.isArray(tablesData.tables) ? tablesData.tables : 
                          Array.isArray(tablesData) ? tablesData : [];
        setTables(tablesArray);
        setSelectedTable(newTableName);
        setShowCreateTableModal(false);
        setNewTableName('');
        setNewTableColumns([{ name: '', type: 'VARCHAR(255)' }]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(prev => ({ ...prev, creatingTable: false }));
    }
  };

  // Update new row data
  const handleRowDataChange = (column, value) => {
    setNewRowData(prev => ({
      ...prev,
      [column]: value
    }));
  };

  // Table creation helpers
  const addNewTableColumn = () => {
    setNewTableColumns([...newTableColumns, { name: '', type: 'VARCHAR(255)' }]);
  };

  const removeNewTableColumn = (index) => {
    const newColumns = [...newTableColumns];
    newColumns.splice(index, 1);
    setNewTableColumns(newColumns);
  };

  const updateNewTableColumn = (index, field, value) => {
    const newColumns = [...newTableColumns];
    newColumns[index][field] = value;
    setNewTableColumns(newColumns);
  };

  // Fetch all clusters
  useEffect(() => {
    const fetchClusters = async () => {
      const data = await fetchWithHandling(
        `http://127.0.0.1:5000/get-clusters?client=${clientName}`,
        'clusters'
      );
      
      if (data) {
        setClusters(data);
        if (data.length > 0) {
          setSelectedCluster(data[0].name);
        }
      }
    };
    
    fetchClusters();
  }, [clientName]);

  // Fetch tables of selected cluster
  useEffect(() => {
    const fetchTables = async () => {
      if (!selectedCluster) return;
      
      const data = await fetchWithHandling(
        `http://127.0.0.1:5000/get-tables?cluster=${selectedCluster}`,
        'tables'
      );
      
      if (data) {
        const tablesArray = Array.isArray(data.tables) ? data.tables : 
                          Array.isArray(data) ? data : [];
        setTables(tablesArray);
        setSelectedTable(tablesArray[0] || '');
      }
    };
    
    fetchTables();
  }, [selectedCluster]);

  // Fetch table data and structure when selection changes
  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedCluster, selectedTable);
      fetchTableStructure(selectedCluster, selectedTable);
    }
  }, [selectedTable, selectedCluster]);

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab="Tables" />
      <div className="dashboard-content">
        <TopBar clientName={clientName} />

        <div className="tables-container">
          <div className="tables-header">
            <div>
              <h2 className="tables-title">YOUR Tables</h2>
              <p className="tables-subtitle">Welcome to Clustro, manage your DB you're the maestro!</p>
            </div>
            <div className="table-actions">
              <button 
                className="create-table-btn"
                onClick={() => setShowCreateTableModal(true)}
                disabled={!selectedCluster || loading.tables}
              >
                Create Table
              </button>
              {selectedTable && (
                <button 
                  className="add-row-btn"
                  onClick={() => setShowAddRowModal(true)}
                  disabled={!selectedTable || loading.tableData}
                >
                  Add Row
                </button>
              )}
            </div>
          </div>

          {/* Cluster and Table selection */}
          <div className="selection-container">
            <select
              className="cluster-select"
              value={selectedCluster}
              onChange={(e) => setSelectedCluster(e.target.value)}
              disabled={loading.clusters}
            >
              {loading.clusters ? (
                <option>Loading clusters...</option>
              ) : clusters.length > 0 ? (
                clusters.map((cluster, idx) => (
                  <option key={idx} value={cluster.name}>
                    {cluster.name}
                  </option>
                ))
              ) : (
                <option>No clusters available</option>
              )}
            </select>

            <select
              className="table-select"
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              disabled={loading.tables || tables.length === 0}
            >
              {loading.tables ? (
                <option>Loading tables...</option>
              ) : tables.length > 0 ? (
                tables.map((table, idx) => (
                  <option key={idx} value={table}>
                    {table}
                  </option>
                ))
              ) : (
                <option>No tables available</option>
              )}
            </select>
          </div>

          {error && (
            <div className="error-message">
              <span>{error}</span>
              <button 
                className="error-close"
                onClick={() => setError(null)}
              >
                ×
              </button>
            </div>
          )}

          <div className="table-wrapper">
            {loading.tableData ? (
              <div className="loading-indicator">
                <div className="loading-spinner"></div>
                <span>Loading table data...</span>
              </div>
            ) : (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      {tableData.columns.map((col, idx) => (
                        <th key={idx}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.rows.length > 0 ? (
                      tableData.rows.map((row, rowIdx) => (
                        <tr key={rowIdx}>
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx}>
                              {cell !== null ? cell.toString() : 'NULL'}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={tableData.columns.length || 1} className="no-data">
                          {selectedTable ? "No data found in table" : "No table selected"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>

        {/* Add Row Modal */}
        {showAddRowModal && tableStructure.length > 0 && (
          <div className="modal-overlay">
            <div className="add-row-modal">
              <div className="modal-header">
                <h3>Add New Row to {selectedTable}</h3>
                <button 
                  className="modal-close"
                  onClick={() => setShowAddRowModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                {tableStructure.map((column, index) => (
                  <div key={index} className="form-group">
                    <label>
                      {column.name} ({column.type})
                    </label>
                    <input
                      type={column.type.includes('int') ? 'number' : 'text'}
                      value={newRowData[column.name] || ''}
                      onChange={(e) => handleRowDataChange(column.name, e.target.value)}
                      placeholder={`Enter ${column.name}`}
                    />
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowAddRowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="confirm-btn"
                  onClick={handleAddRow}
                  disabled={loading.addingRow}
                >
                  {loading.addingRow ? 'Adding...' : 'Add Row'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Table Modal */}
        {showCreateTableModal && (
          <div className="modal-overlay">
            <div className="create-table-modal">
              <div className="modal-header">
                <h3>Create New Table</h3>
                <button 
                  className="modal-close"
                  onClick={() => setShowCreateTableModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Table Name</label>
                  <input
                    type="text"
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    placeholder="Enter table name"
                  />
                </div>

                <h4>Columns</h4>
                {newTableColumns.map((column, index) => (
                  <div key={index} className="column-row">
                    <input
                      type="text"
                      value={column.name}
                      onChange={(e) => updateNewTableColumn(index, 'name', e.target.value)}
                      placeholder="Column name"
                    />
                    <select
                      value={column.type}
                      onChange={(e) => updateNewTableColumn(index, 'type', e.target.value)}
                    >
                      <option value="VARCHAR(255)">String</option>
                      <option value="INTEGER">Integer</option>
                      <option value="BIGINT">Big Integer</option>
                      <option value="BOOLEAN">Boolean</option>
                      <option value="DATE">Date</option>
                      <option value="TIMESTAMP">Timestamp</option>
                      <option value="TEXT">Text</option>
                      <option value="NUMERIC">Numeric</option>
                    </select>
                    <button
                      className="remove-column"
                      onClick={() => removeNewTableColumn(index)}
                      disabled={newTableColumns.length <= 1}
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <button className="add-column" onClick={addNewTableColumn}>
                  Add Column
                </button>
              </div>
              <div className="modal-footer">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowCreateTableModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="confirm-btn"
                  onClick={handleCreateTable}
                  disabled={!newTableName || newTableColumns.some(c => !c.name) || loading.creatingTable}
                >
                  {loading.creatingTable ? 'Creating...' : 'Create Table'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
