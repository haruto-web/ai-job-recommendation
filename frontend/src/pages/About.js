import React from 'react';
import './About.css';

function About() {
  return (
    <div className="about-container">
      <section className="about-hero">
        <h1>About AI-Powered Job Recommendation</h1>
        <p>Revolutionizing the way you find your dream job with intelligent AI technology.</p>
      </section>

      <section className="about-content">
        <div className="about-section">
          <h2>Our Mission</h2>
          <p>We connect talented individuals with their ideal career opportunities using advanced AI algorithms that understand your skills, preferences, and career goals.</p>
        </div>

        <div className="about-section">
          <h2>How It Works</h2>
          <p>Our AI analyzes your profile, matches you with relevant job postings, and provides personalized recommendations to help you land your next great opportunity.</p>
        </div>

        <div className="about-section">
          <h2>Features</h2>
          <ul>
            <li>Personalized job recommendations</li>
            <li>Resume optimization tips</li>
            <li>Career guidance and insights</li>
            <li>Employer-job seeker matching</li>
          </ul>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} AI-Powered Job Recommendation</p>
        <p>Helping you connect with the right opportunities</p>
      </footer>
    </div>
  );
}

export default About;
