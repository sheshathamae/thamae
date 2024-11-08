import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import Dashboard from './DashBoard';
import ProductForm from './ProductForm';
import ProductList from './ProductList';
import UserManagement from './UserManagement';
import SignIn from './SignIn'; 
import Login from './Login';
import Logout from './Logout';
import './App.css';
import { saveToLocalStorage, getFromLocalStorage, removeFromLocalStorage } from './LocalStorageHelper';

function App() {
  const [user, setUser] = useState(getFromLocalStorage('currentUser'));
  const [isSignUp, setIsSignUp] = useState(false); // Default is Login, not Sign Up
  const [refresh, setRefresh] = useState(false);

  // Check for current user in local storage on initial load
  useEffect(() => {
    const currentUser = getFromLocalStorage('currentUser');
    setUser(currentUser);
  }, []);

  const handleSignIn = (newUser) => {
    saveToLocalStorage('currentUser', newUser);
    setUser(newUser);
    setIsSignUp(false); // After signing up, show login
  };

  const handleLogin = (loggedInUser) => {
    saveToLocalStorage('currentUser', loggedInUser);
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    removeFromLocalStorage('currentUser');
  };

  const refreshData = () => {
    setRefresh(!refresh);
  };

  const goToSignUp = () => {
    setIsSignUp(true); // Navigate to the Sign Up form
  };

  return (
    <Router>
      <div className="App">
        <header>
          <h1>Streamline The Wings Stock Inventory System</h1>
        </header>

        {!user ? (
          <div>
            {/* Render Login or Sign Up based on the current state */}
            {isSignUp ? (
              <SignIn onSignIn={handleSignIn} />
            ) : (
              <Login onLogin={handleLogin} goToSignUp={goToSignUp} />
            )}
          </div>
        ) : (
          <div>
            <Logout onLogout={handleLogout} />
            {/* Navigation Links */}
            <nav>
              <ul>
                <li><Link to="/">Dashboard</Link></li>
                <li><Link to="/product-form">Add Product</Link></li>
                <li><Link to="/product-list">Product List</Link></li>
                <li><Link to="/user-management">User Management</Link></li>
              </ul>
            </nav>

            <div className="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/product-form" element={<ProductForm onFormSubmit={refreshData} />} />
                <Route path="/product-list" element={<ProductList />} />
                <Route path="/user-management" element={<UserManagement />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
