import React from 'react';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <img src="/lorainne.jpg" alt="AI Powered Job Recommendation" className="hero-image" />
        <div className="hero-overlay">
          <h1 className="rgb-light">Welcome to AI-Powered Job Recommendation</h1>
          <p>Discover your next career opportunity with intelligent recommendations.</p>
        </div>
      </section>

      {/* Suggestion Cards */}
      <div className="suggestion-grid">
        <div className="card">
          <h3 className="card-title">Find Work</h3>
          <p>Explore job opportunities tailored for you.</p>
        </div>

        <div className="card">
          <h3 className="card-title">Post a Job</h3>
          <p>Employers can post openings and reach candidates easily.</p>
        </div>

        <div className="card">
          <h3 className="card-title">Career Tips</h3>
          <p>Get AI-driven advice for resumes, interviews, and more.</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} AI-Powered Job Recommendation</p>
        <p>Helping you connect with the right opportunities</p>
      </footer>
    </div>
  );
}

export default Home;
