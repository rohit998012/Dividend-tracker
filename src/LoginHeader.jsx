import React from "react";
import { Link } from "react-router-dom";

export default function LoginHeader({ user, onLoginClick, onLogoutClick }) {
  return (
    <div className="container-fluid bg-white shadow-sm fixed-top py-3 px-4">
      <div className="d-flex justify-content-between align-items-center">
        <img
          src="https://th.bing.com/th/id/OIP.6lb6Wa09nEEIuPIkzzzRlgHaJg?rs=1&pid=ImgDetMain"
          className="project-logo"
          alt="project-logo"
        />
        {user ? (
          <div className="d-flex justify-content-between align-items-center nav-links gap-4">
            <h4>
              <Link to="/">Home</Link>
            </h4>
            <h4>
              <Link to="/portfolio">Portfolio</Link>
            </h4>
          </div>
        ) : null}

        {/* If user is logged in, show name + Logout button */}
        {user ? (
          <div className="d-flex align-items-center gap-3">
            <span className="fw-bold">{user.displayName || user.email}</span>
            <button className="btn btn-danger" onClick={onLogoutClick}>
              <i className="bi bi-box-arrow-right"></i> Logout
            </button>
          </div>
        ) : (
          // Show Login button if user is not logged in
          <button className="btn btn-primary" onClick={onLoginClick}>
            <i className="bi bi-box-arrow-in-right"></i> Login
          </button>
        )}
      </div>
    </div>
  );
}
