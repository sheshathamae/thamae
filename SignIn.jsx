// src/components/SignIn.js
import React, { useState } from 'react';
import './Signin.css';

const SignIn = ({ onSignIn }) => {
  const [user, setUser] = useState({ name: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user.name || !user.password) {
      setError('Please fill all fields.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        throw new Error('User already exists.');
      }

      const result = await response.json();
      setMessage('Sign up successful!');

      setTimeout(() => {
        onSignIn(result); // Call the onSignIn prop with user data
      }, 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="sign-in">
      <h2>Sign Up</h2>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={user.name}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={user.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignIn;