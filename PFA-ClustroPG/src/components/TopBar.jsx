import React from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import '../styles/TopBar.css';

export default function TopBar() {
  const { user, logout } = useAuth();

  return (
    <div className="topbar d-flex justify-content-end align-items-center px-4 py-3 shadow-sm bg-white">
      {/* User info and logout */}
      {user && (
        <div className="d-flex align-items-center gap-4">
          <div className="user-info d-flex align-items-center gap-2">
            <img
              src={user.avatar ? `http://localhost:5050${user.avatar}` : '/avatar.jpg'}
              alt="avatar"
              className="user-avatar"
            />
            <div>
              <div className="fw-semibold">{user.username}</div>
              <div className="text-muted small">{user.email}</div>
            </div>
          </div>
          <button className="btn btn-outline-secondary btn-sm" onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}