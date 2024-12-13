import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';

const AccessDenied = () => {
  return (
    <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center">
      <div className="text-center">
        <FontAwesomeIcon icon={faLock} className="text-danger mb-4" size="5x" />
        <h1 className="display-4 mb-4">Access Denied</h1>
        <div className="card shadow-sm">
          <div className="card-body">
            <h2 className="card-title h4 mb-3">Access to this page is restricted</h2>
            <p className="card-text mb-4">
              Please check with the site admin if you believe this is a mistake.
            </p>
            <a href="/" className="btn btn-primary">Return to Home</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;