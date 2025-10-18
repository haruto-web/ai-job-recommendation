import React, { useState } from 'react';
import './Auth.css';

function Register({ onRegister }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [userType, setUserType] = useState('jobseeker');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    if (password !== passwordConfirmation) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    
    try {
      await onRegister({ 
        name, 
        email, 
        password, 
        password_confirmation: passwordConfirmation, 
        user_type: userType 
      });
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        const errors = Object.values(err.response.data.errors).flat();
        setError(errors.join(' '));
      } else {
        setError('Registration failed. Please check your inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join our platform and start your journey</p>
        </div>
        
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your full name"
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Create a password"
                className="form-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="passwordConfirmation">Confirm Password</label>
            <div className="password-input-container">
              <input
                id="passwordConfirmation"
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                placeholder="Confirm your password"
                className="form-input"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle"
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="userType">I am a...</label>
            <div className="user-type-selector">
              <label className="user-type-option">
                <input
                  type="radio"
                  name="userType"
                  value="jobseeker"
                  checked={userType === 'jobseeker'}
                  onChange={(e) => setUserType(e.target.value)}
                />
                <span className="user-type-label">
                  <strong>Job Seeker</strong>
                  <small>Looking for opportunities</small>
                </span>
              </label>
              <label className="user-type-option">
                <input
                  type="radio"
                  name="userType"
                  value="employer"
                  checked={userType === 'employer'}
                  onChange={(e) => setUserType(e.target.value)}
                />
                <span className="user-type-label">
                  <strong>Employer</strong>
                  <small>Hiring talent</small>
                </span>
              </label>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="auth-button"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Already have an account? <a href="/login" className="auth-link">Sign in here</a></p>
        </div>
      </div>
    </div>
  );
}

export default Register;
