import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Loading from './components/Loading';
import Login from './components/Login';
import Register from './components/Register';
import Home from './pages/Home';
import About from './pages/About';
import Jobs from './pages/Jobs';
import Account from './pages/Account';
import Dashboard from './pages/Dashboard';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoggedIn(false);
    }
  };

  const handleRegister = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      localStorage.setItem('token', response.data.token);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Registration failed:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        throw error;
      } else {
        throw new Error('Registration failed. Please check your inputs.');
      }
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.removeItem('token');
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        setIsLoggedIn(false);
        return;
      }
      try {
        await axios.get(`${API_URL}/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <Router>
      <Navigation isLoggedIn={isLoggedIn} onLogin={handleLogin} onRegister={handleRegister} onLogout={handleLogout} />
      <div style={{ marginTop: '0' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={isLoggedIn ? <Navigate to="/account" /> : <Login onLogin={handleLogin} />} />
          <Route path="/register" element={isLoggedIn ? <Navigate to="/account" /> : <Register onRegister={handleRegister} />} />
          <Route path="/jobs" element={isLoggedIn ? <Jobs /> : <Navigate to="/login" />} />
          <Route path="/account" element={isLoggedIn ? <Account isLoggedIn={isLoggedIn} /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
