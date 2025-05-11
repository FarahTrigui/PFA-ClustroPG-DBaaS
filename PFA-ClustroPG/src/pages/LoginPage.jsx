import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/LoginPage.css';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="login-wrapper d-flex align-items-center justify-content-center">
      <div className="card login-card p-4">
        <h1 className="text-center display-6 mb-2">ClustroPG</h1>
        <h2 className="text-center login-title mb-1">Log in</h2>
        <p className="text-center text-muted mb-4">
          Don’t have an account? <a href="/signup">Sign up</a>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Your email</label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="mb-4 position-relative">
            <label htmlFor="password" className="form-label">Your password</label>
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
            <div className="text-end mt-1">
              <a href="#" className="small">Forget your password</a>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 mb-3">
            Log in
          </button>

          <img
            src="/postgres-kubernetes.svg"
            alt="PostgreSQL Kubernetes"
            className="img-fluid rounded mt-2"
          />
        </form>
      </div>
    </div>
  );
}