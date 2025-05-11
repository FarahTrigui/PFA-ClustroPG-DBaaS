import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar'; 
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/CreateClusterPage.css';

export default function CreateClusterPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    clientName: user?.username || '',
    clientCompany: '',
    dbName: '',
    dbSize: 'DNS 1',
    backupNeeded: 'no',
    backupFrequency: '',
    hour: '',
    dayOfWeek: '',
    dayOfMonth: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (e) => {
    setForm((prev) => ({ ...prev, backupNeeded: e.target.value }));
  };

    const handleSubmit = async (e) => {
        e.preventDefault();
      
        const payload = {
          client_name: form.clientName,
          client_company: form.clientCompany,
          db_name: form.dbName,
          db_size: form.dbSize,
          backup_needed: form.backupNeeded,
          backup_frequency: form.backupFrequency,
        };
      
        try {
          const response = await fetch('http://127.0.0.1:5000/create-database', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
      
          const data = await response.json();
      
          if (response.ok) {
            alert(`✅ ${data.message}`);
          } else {
            alert(`❌ Error: ${data.error}`);
            console.error(data.stderr || data);
          }
        } catch (err) {
          console.error(err);
          alert('Something went wrong while creating the cluster.');
        }
      };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-content">
        <TopBar /> {/* ✅ add TopBar above content */}

        <div className="content-area p-5">
          <h2 className="mb-5 fw-bold">
            🛠 Create a New PostgreSQL Cluster
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="row g-5">
                <div className="col-md-6">
                    <label className="form-label">Client Name</label>
                    <input
                    type="text"
                    name="clientName"
                    className="form-control big-input"
                    value={form.clientName}
                    onChange={handleChange}
                    disabled
                    readOnly
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Client Company</label>
                    <input
                    type="text"
                    name="clientCompany"
                    className="form-control big-input"
                    value={form.clientCompany}
                    onChange={handleChange}
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Database Name</label>
                    <input
                    type="text"
                    name="dbName"
                    className="form-control big-input"
                    value={form.dbName}
                    onChange={handleChange}
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Database Size</label>
                    <select
                    name="dbSize"
                    className="form-select big-input"
                    value={form.dbSize}
                    onChange={handleChange}
                    >
                    <option>Small</option>
                    <option>Medium</option>
                    <option>Big</option>
                    <option>Very Big</option>
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Backup Needed</label>
                    <div className="d-flex align-items-center gap-4 mt-2">
                    <div className="form-check">
                        <input
                        className="form-check-input"
                        type="radio"
                        name="backupNeeded"
                        value="yes"
                        checked={form.backupNeeded === 'yes'}
                        onChange={handleRadioChange}
                        />
                        <label className="form-check-label">Yes</label>
                    </div>
                    <div className="form-check">
                        <input
                        className="form-check-input"
                        type="radio"
                        name="backupNeeded"
                        value="no"
                        checked={form.backupNeeded === 'no'}
                        onChange={handleRadioChange}
                        />
                        <label className="form-check-label">No</label>
                    </div>
                    </div>
                </div>

                {form.backupNeeded === 'yes' && (
                  <>
                    <div className="col-md-6">
                      <label className="form-label">Backup Frequency</label>
                      <select
                        name="backupFrequency"
                        className="form-select big-input"
                        value={form.backupFrequency}
                        onChange={handleChange}
                      >
                        <option value="">-- Select Frequency --</option>
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                      </select>
                    </div>

                    {(form.backupFrequency === 'Daily' ||
                      form.backupFrequency === 'Weekly' ||
                      form.backupFrequency === 'Monthly') && (
                      <div className="col-md-6">
                        <label className="form-label">Hour (0-23)</label>
                        <input
                          type="number"
                          name="hour"
                          className="form-control big-input"
                          value={form.hour}
                          min="0"
                          max="23"
                          onChange={handleChange}
                        />
                      </div>
                    )}

                    {form.backupFrequency === 'Weekly' && (
                      <div className="col-md-6">
                        <label className="form-label">Day of Week</label>
                        <select
                          name="dayOfWeek"
                          className="form-select big-input"
                          value={form.dayOfWeek}
                          onChange={handleChange}
                        >
                          <option value="">-- Select Day --</option>
                          <option>Monday</option>
                          <option>Tuesday</option>
                          <option>Wednesday</option>
                          <option>Thursday</option>
                          <option>Friday</option>
                          <option>Saturday</option>
                          <option>Sunday</option>
                        </select>
                      </div>
                    )}

                    {form.backupFrequency === 'Monthly' && (
                      <div className="col-md-6">
                        <label className="form-label">Day of Month</label>
                        <input
                          type="number"
                          name="dayOfMonth"
                          className="form-control big-input"
                          value={form.dayOfMonth}
                          min="1"
                          max="31"
                          onChange={handleChange}
                        />
                      </div>
                    )}
                  </>
                )}
            </div>


            <div className="d-flex justify-content-between mt-5">
              <button
                type="button"
                className="btn btn-outline-danger btn-lg rounded-pill px-4"
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-lg rounded-pill px-5"
                style={{
                  backgroundColor: '#d5efff',
                  color: '#000',
                  border: 'none',
                }}
              >
                Create Clustro
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
