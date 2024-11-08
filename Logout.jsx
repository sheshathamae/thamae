// src/components/Logout.js
import React from 'react';
import { removeFromLocalStorage } from './LocalStorageHelper';

const Logout = ({ onLogout }) => {
  const handleLogout = () => {
    // Remove current user from Local Storage
    removeFromLocalStorage('currentUser');
    // Trigger the logout action in the parent component
    onLogout();
  };

  return (
    <div className="logout">
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Logout;
