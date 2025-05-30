import React, { useState, useEffect } from 'react';
import {
  FaDatabase,
  FaUsers,
  FaDownload,
  FaChartBar,
  FaCog,
  FaUser,
  FaCogs
} from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';

export default function Sidebar({ activeTab }) {
  const [showDashboard, setShowDashboard] = useState(true);
  const [showProfile, setShowProfile] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 900);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 900;
      setIsMobile(mobile);
      setShowSidebar(!mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {isMobile && !showSidebar && (
        <button className="burger-btn open-btn" onClick={() => setShowSidebar(true)}>
          ☰
        </button>
      )}
      {showSidebar && (
        <div
          className="sidebar p-3"
          style={{ maxHeight: '100vh', overflowY: 'auto' }}
        >
          <div className="sidebar-header d-flex justify-content-between align-items-center">
            <a className="logo" href="/dashboard">
              <h4 className="fw-bold mb-3">ClustroPG</h4>
            </a>
            {isMobile && (
              <button className="burger-btn close-btn" onClick={() => setShowSidebar(false)}>
                ✕
              </button>
            )}
          </div>

          {/* DASHBOARD SECTION */}
          <hr></hr>
          <div className="section">
            <div
              className="section-header d-flex justify-content-between align-items-center"
              onClick={() => setShowDashboard(!showDashboard)}
            >
              <a href="/dashboard"><span className="fw-bold" >Dashboard</span></a>
              <span>{showDashboard ? '▲' : '▼'}</span>
            </div>
            {showDashboard && (
              <div className="section-items">
                <SidebarItem icon={<FaDatabase />} label="Clusters" to="/clusters" activeTab={activeTab} />
                <SidebarItem icon={<FaUsers />} label="Backups" to="/backups" activeTab={activeTab} />
                <SidebarItem icon={<FaDownload />} label="Restore" to="/restores" activeTab={activeTab} />
                <SidebarItem icon={<FaChartBar />} label="Monitoring" to="/monitoring" activeTab={activeTab} />
                <SidebarItem icon={<FaCog />} label="Settings" activeTab={activeTab} />
              </div>
            )}
          </div>

          <hr />

          {/* PROFILE SECTION */}
          <div className="section">
            <div
              className="section-header d-flex justify-content-between align-items-center"
              onClick={() => setShowProfile(!showProfile)}
            >
              <span className="fw-bold">Profile</span>
              <span>{showProfile ? '▲' : '▼'}</span>
            </div>
            {showProfile && (
              <div className="section-items">
                <SidebarItem icon={<FaUser />} label="My profile" to="/profile" activeTab={activeTab} />
                <SidebarItem icon={<FaCogs />} label="Profile Settings" to="/profile-settings" activeTab={activeTab} />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function SidebarItem({ icon, label, to, activeTab }) {
  const location = useLocation();
  const isActive = (to && location.pathname === to) || (activeTab === label);
  const itemClass = `sidebar-item d-flex align-items-center gap-2 py-2 px-2 rounded hoverable${
    isActive ? ' sidebar-item-active' : ''
  }`;
  const content = (
    <div className={itemClass}>
      {icon}
      <span>{label}</span>
    </div>
  );
  return to ? (
    <Link to={to} className="text-decoration-none">
      {content}
    </Link>
  ) : (
    content
  );
}
