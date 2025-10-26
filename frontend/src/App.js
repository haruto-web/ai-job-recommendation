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
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setIsLoggedIn(true);

      // Redirect admin users to admin dashboard
      if (response.data.user.user_type === 'admin') {
        window.location.href = '/admin';
      }
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  const handleRegister = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
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
      setUser(null);
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
        setUser(null);
        return;
      }
      try {
        const response = await axios.get(`${API_URL}/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
        setUser(null);
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
      <Navigation
        isLoggedIn={isLoggedIn}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={handleLogout}
        userType={user?.user_type}
      />
      <div style={{ marginTop: '0' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={isLoggedIn ? <Navigate to={user?.user_type === 'admin' ? '/admin' : '/dashboard'} /> : <Login onLogin={handleLogin} />} />
          <Route path="/register" element={isLoggedIn ? <Navigate to={user?.user_type === 'admin' ? '/admin' : '/dashboard'} /> : <Register onRegister={handleRegister} />} />
          <Route path="/jobs" element={isLoggedIn && user?.user_type !== 'admin' ? <Jobs /> : <Navigate to="/login" />} />
          <Route path="/account" element={isLoggedIn ? <Account isLoggedIn={isLoggedIn} /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={isLoggedIn && user?.user_type !== 'admin' ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/admin" element={isLoggedIn && user?.user_type === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
