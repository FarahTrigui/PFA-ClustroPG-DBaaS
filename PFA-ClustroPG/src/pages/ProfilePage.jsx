import React from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <TopBar />
        <div className="p-5">
          <h2>👤 My Profile</h2>
          <div className="card p-4" style={{ maxWidth: '400px' }}>
            {user?.avatar && (
              <img
                src={`http://localhost:5050${user.avatar}`}
                alt="avatar"
                className="rounded mb-3"
                style={{ width: '100px' }}
              />
            )}
            <p><strong>Username:</strong> {user?.username}</p>
            <p><strong>Email:</strong> {user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}