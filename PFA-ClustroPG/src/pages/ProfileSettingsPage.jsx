import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import '../styles/ProfileSettingsPage.css';

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(user?.avatar ? `http://localhost:5050${user.avatar}` : null);
  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
  });
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState(''); // 'success' or 'error'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpload = async () => {
    if (!file) return alert("No file selected");
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetch('http://localhost:5050/api/upload-avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to upload avatar');
      const data = await res.json();
      setPreview(`http://localhost:5050${data.avatar}`);
      setStatus('✅ Avatar updated!');
      setStatusType('success');
    } catch (err) {
      setStatus('❌ ' + err.message);
      setStatusType('error');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5050/api/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          email: form.email,
          username: form.username,
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Update failed');
      }

      setStatus('✅ Profile updated!');
      setStatusType('success');
    } catch (err) {
      setStatus('❌ ' + err.message);
      setStatusType('error');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <TopBar />
        <div className="p-5 active scrollable-content">
          <h2>👤 Profile Settings</h2>

          {status && (
            <div
              className={`alert ${statusType === 'success' ? 'alert-success' : 'alert-danger'}`}
              role="alert"
            >
              {status}
            </div>
          )}

          <div className="mb-3 avatar-box">
            <label className="form-label text-white">Your Avatar</label><br />
            {preview && <img src={preview} alt="avatar" width={100} className="rounded mb-2" />}
            <input type="file" onChange={(e) => setFile(e.target.files[0])} accept="image/*" className="form-control" />
            <button className="btn btn-light mt-2" onClick={handleUpload}>Upload Avatar</button>
          </div>

          <form onSubmit={handleUpdate}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                name="username"
                className="form-control"
                value={form.username}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                name="email"
                type="email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Current Password</label>
              <input
                name="currentPassword"
                type="password"
                className="form-control"
                value={form.currentPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label">New Password</label>
              <input
                name="newPassword"
                type="password"
                className="form-control"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="Leave empty to keep current password"
              />
            </div>

            <button className="btn btn-primary" type="submit">Update Profile</button>
          </form>
        </div>
      </div>
    </div>
  );
}