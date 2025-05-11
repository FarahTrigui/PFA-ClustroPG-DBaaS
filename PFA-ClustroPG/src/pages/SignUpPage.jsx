import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/SignUpPage.css';

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form.email, form.username, form.password);
      navigate('/login');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="signup-wrapper d-flex align-items-center justify-content-center">
      <div className="card signup-card p-4">
        <h1 className="text-center display-6 mb-3">ClustroPG</h1>
        <h2 className="text-center mb-1 signup-title">Sign Up</h2>
        <p className="text-center text-muted mb-4">
          Already have an account? <a href="/login">Log in</a>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              className="form-control"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <div className="form-text">
              We strongly recommend adding a significant username.
              This will help your friends identify you.
            </div>
          </div>

          <div className="mb-4 position-relative">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              className="form-control pe-5"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              className="btn btn-sm btn-link password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
            <div className="row mt-2 gx-2">
              <div className="col-6 form-text">● Use 8 or more characters</div>
              <div className="col-6 form-text">● Use upper and lower case letters (e.g. Aa)</div>
              <div className="col-6 form-text">● Use a number (e.g. 1234)</div>
              <div className="col-6 form-text">● Use a symbol (e.g. !@#$)</div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 mb-3">
            Sign in
          </button>

          <p className="text-center text-muted small">
            By creating an account, you agree to the <a href="#">Terms of use</a> and <a href="#">Privacy Policy</a>.
          </p>
        </form>
      </div>
    </div>
  );
}