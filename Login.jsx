import React, { useState } from 'react';
import './Login.css'; 

function Login({ onLogin, goToSignUp }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // State for success message

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message); 
        return;
      }

      const result = await response.json();
      setMessage('Login successful!');

      // Set timeout to clear inputs and invoke onLogin after showing message
      setTimeout(() => {
        onLogin(result.user);  // Pass the logged-in user to App.js
        setMessage('');        // Clear the success message
        setName('');           // Clear the name input field
        setPassword('');       // Clear the password input field
      }, 1000);
    } catch (error) {
      console.error('Error during login:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="login"> {/* Apply login class for styling */}
      <h2>Login</h2>
      {message && <div className="success-message">{message}</div>} {/* Display success message */}
      <form onSubmit={handleLoginSubmit}>
        <div>
          <label>Name:</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Login</button>
      </form>

      {/* Prompt for Sign Up if user doesn't have an account */}
      <div className="sign-up-prompt">
        <span>Don't have an account?</span>
        <button className="sign-up-link" onClick={goToSignUp}>
          Sign Up
        </button>
      </div>
    </div>
  );
}

export default Login;
