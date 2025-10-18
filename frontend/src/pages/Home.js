import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Find Your Dream Job with
              <span className="text-gradient"> AI-Powered</span> Recommendations
            </h1>
            <p className="hero-subtitle">
              Connect with opportunities that match your skills, experience, and career goals. 
              Our intelligent platform uses advanced AI to help you discover the perfect role.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn-primary">
                Get Started Free
              </Link>
              <Link to="/about" className="btn-secondary">
                Learn More
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card card-1">
              <div className="card-icon">⚡</div>
              <div className="card-text">Smart Matching</div>
            </div>
            <div className="floating-card card-2">
              <div className="card-icon">🎯</div>
              <div className="card-text">AI Analysis</div>
            </div>
            <div className="floating-card card-3">
              <div className="card-icon">📊</div>
              <div className="card-text">Career Growth</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Our Platform?</h2>
            <p>Experience the future of job searching with intelligent matching and personalized recommendations.</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Smart Matching</h3>
              <p>Our AI analyzes your profile and matches you with the most relevant job opportunities based on your skills and preferences.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Quick Applications</h3>
              <p>Apply to multiple jobs with just one click. Our streamlined process saves you time and effort.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Career Insights</h3>
              <p>Get detailed analytics about your job search progress and receive personalized career advice.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure & Private</h3>
              <p>Your data is protected with enterprise-grade security. We respect your privacy and keep your information safe.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Career?</h2>
            <p>Join thousands of professionals who have found their dream jobs through our platform.</p>
            <div className="cta-actions">
              <Link to="/register" className="btn-primary large">
                Start Your Journey
              </Link>
              <Link to="/jobs" className="btn-outline large">
                Browse Jobs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
            <div className="footer-logo">
              <span className="footer-icon">J</span>
              <span className="footer-text">JobAI</span>
            </div>
              <p>Connecting talent with opportunity through intelligent matching.</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Platform</h4>
                <Link to="/jobs">Find Jobs</Link>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/account">Account</Link>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <Link to="/about">About Us</Link>
                <Link to="/contact">Contact</Link>
                <Link to="/careers">Careers</Link>
              </div>
              <div className="footer-column">
                <h4>Support</h4>
                <Link to="/help">Help Center</Link>
                <Link to="/privacy">Privacy Policy</Link>
                <Link to="/terms">Terms of Service</Link>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} JobAI. All rights reserved.</p>
            <p>Helping you connect with the right opportunities</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
