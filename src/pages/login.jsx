import React, { useState } from "react";
import { login as loginRequest } from "../services/authApi";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await loginRequest({ email, password });
      const user = res.data?.data ?? res.data;
      if (!user) {
        setError("Unknown error: no user received.");
      } else {
        onLogin(user);
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid login credentials.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow-sm" style={{ width: 360 }}>
        <div className="card-body">
          <h3 className="mb-3 text-center">ServeSmart Login</h3>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              className="btn btn-dark w-100"
              disabled={submitting}
            >
              {submitting ? "Processing..." : "Log in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
