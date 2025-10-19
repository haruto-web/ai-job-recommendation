import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Account.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

function Account({ isLoggedIn }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState('jobseeker');
  const [selectedFile, setSelectedFile] = useState(null);
  const [profileData, setProfileData] = useState({
    bio: '',
    skills: [],
    experience_level: '',
    portfolio_url: ''
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      const fetchUser = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${API_URL}/user?t=${Date.now()}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
          setUserType(response.data.user_type);
          if (response.data.profile) {
            setProfileData({
              bio: response.data.profile.bio || '',
              skills: response.data.profile.skills || [],
              experience_level: response.data.profile.experience_level || '',
              portfolio_url: response.data.profile.portfolio_url || ''
            });
            
            // Auto-fetch AI analysis if user has resumes but no analysis
            if ((response.data.profile.resumes && response.data.profile.resumes.length > 0) || response.data.profile.resume_url) {
              if (!response.data.profile.ai_analysis) {
                fetchAiAnalysis();
              }
            }
          }
        } catch (error) {
          console.error('Failed to fetch user:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const fetchAiAnalysis = async () => {
    try {
      setLoadingAnalysis(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/user/resume-analysis`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAiAnalysis(response.data);
    } catch (error) {
      console.error('Failed to fetch AI analysis:', error);
      setAiAnalysis(null);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleSaveUserType = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/user`, { user_type: userType }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('User type updated successfully!');
    } catch (error) {
      console.error('Failed to update user type:', error);
      alert('Failed to update user type.');
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return;

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('profile_image', selectedFile);

      const response = await axios.post(`${API_URL}/user/profile-image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setUser(response.data);
      setSelectedFile(null);
      // Auto-refresh the page to show the updated profile image
      window.location.reload();
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload profile image. Please try again.');
    }
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/user/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser({ ...user, profile: profileData });
      setEditingProfile(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };



  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="account-container">
        <section className="account-hero">
          <h1>Please Log In</h1>
          <p>You need to be logged in to view your profile.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="account-container">
      <section className="account-hero">
        <h1>Your Profile</h1>
        <p>Manage your account and preferences</p>
      </section>

      <section className="profile-content">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {user.profile_image ? (
                <img
                  src={`http://localhost:8000/storage/${user.profile_image}`}
                  alt="Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                />
              ) : (
                <span>{user && user.name ? user.name.charAt(0).toUpperCase() : '?'}</span>
              )}
            </div>
            <div className="profile-info">
              <h2>{user.name}</h2>
              <p>{user.email}</p>
            </div>
            <div className="profile-upload">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                id="profile-image-input"
                style={{ display: 'none' }}
              />
              <label htmlFor="profile-image-input" className="upload-btn">
                Choose File
              </label>
              <button onClick={handleImageUpload} disabled={!selectedFile} className="upload-btn">
                {selectedFile ? 'Upload Profile Image' : 'Select Image First'}
              </button>
              {selectedFile && (
                <p className="selected-file-text">Selected file: {selectedFile.name}</p>
              )}
            </div>
          </div>

          <div className="user-type-section">
            <h3>User Type</h3>
            <div className="user-type-toggle">
              <button
                className={`type-btn ${userType === 'jobseeker' ? 'active' : ''}`}
                onClick={() => setUserType('jobseeker')}
                type="button"
              >
                Job Seeker
              </button>
              <button
                className={`type-btn ${userType === 'employer' ? 'active' : ''}`}
                onClick={() => setUserType('employer')}
                type="button"
              >
                Employer
              </button>
            </div>
            <p className="user-type-desc">
              {userType === 'jobseeker'
                ? 'You are currently set as a job seeker. You can browse and apply for jobs.'
                : 'You are currently set as an employer. You can post jobs and find candidates.'
              }
            </p>
            <button onClick={handleSaveUserType} className="save-btn" type="button">
              Save Changes
            </button>
          </div>

          <div className="profile-details">
            <h3>Profile Details</h3>
            <div className="detail-item">
              <strong>Joined:</strong> {new Date(user.created_at).toLocaleDateString()}
            </div>
            <div className="detail-item">
              <strong>Email Verified:</strong> {user.email_verified_at ? 'Yes' : 'No'}
            </div>
            <div className="detail-item">
              <strong>User Type:</strong> {userType === 'jobseeker' ? 'Job Seeker' : 'Employer'}
            </div>
          </div>

          {userType === 'jobseeker' && (
            <div className="jobseeker-info">
              <h3>Job Seeker Information</h3>
              <p>View your applications and earnings in the <a href="/dashboard">Dashboard</a>.</p>
              <div className="user-background">
                <h4>Your Background</h4>
                {editingProfile ? (
                  <div className="edit-profile-form">
                    <label>Bio:</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      rows="4"
                    />
                    <label>Skills (comma-separated):</label>
                    <input
                      type="text"
                      value={profileData.skills.join(', ')}
                      onChange={(e) => setProfileData({ ...profileData, skills: e.target.value.split(',').map(s => s.trim()) })}
                      placeholder="e.g., JavaScript, React, Node.js"
                    />
                    <label>Experience Level:</label>
                    <select
                      value={profileData.experience_level}
                      onChange={(e) => setProfileData({ ...profileData, experience_level: e.target.value })}
                    >
                      <option value="">Select experience level</option>
                      <option value="entry">Entry Level</option>
                      <option value="mid">Mid Level</option>
                      <option value="senior">Senior Level</option>
                      <option value="expert">Expert</option>
                    </select>
                    <label>Portfolio URL:</label>
                    <input
                      type="url"
                      value={profileData.portfolio_url}
                      onChange={(e) => setProfileData({ ...profileData, portfolio_url: e.target.value })}
                      placeholder="https://yourportfolio.com"
                    />
                    <div className="form-buttons">
                      <button onClick={handleSaveProfile} className="save-btn">Save</button>
                      <button onClick={() => setEditingProfile(false)} className="cancel-btn">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {user.profile ? (
                      <div>
                        {user.profile.bio && <p><strong>Bio:</strong> {user.profile.bio}</p>}
                        {user.profile.skills && user.profile.skills.length > 0 && (
                          <p><strong>Skills:</strong> {user.profile.skills.join(', ')}</p>
                        )}
                        {user.profile.experience_level && <p><strong>Experience Level:</strong> {user.profile.experience_level}</p>}
                        {user.profile.portfolio_url && <p><strong>Portfolio:</strong> <a href={user.profile.portfolio_url} target="_blank" rel="noopener noreferrer">{user.profile.portfolio_url}</a></p>}
                        <div>
                          <strong>Resumes:</strong>
                          {user.profile.resumes && user.profile.resumes.length > 0 ? (
                            <div style={{ marginTop: '15px' }}>
                              {user.profile.resumes.map((resume, index) => (
                                <div key={index} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                                  <span>{resume.name}</span>
                                  <div style={{ marginTop: '5px' }}>
                                    <a href={`${API_URL}/storage/${resume.url}`} target="_blank" rel="noopener noreferrer">View</a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p>No resumes uploaded yet. Go to the <a href="/jobs">Jobs</a> page to manage your resumes.</p>
                          )}
                        </div>
                        
                        {/* AI Analysis Section */}
                        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #007bff', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 style={{ margin: 0, color: '#007bff' }}>🤖 AI Resume Analysis</h3>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                onClick={fetchAiAnalysis} 
                                disabled={loadingAnalysis}
                                style={{ 
                                  padding: '5px 10px', 
                                  backgroundColor: '#007bff', 
                                  color: 'white', 
                                  border: 'none', 
                                  borderRadius: '4px',
                                  cursor: loadingAnalysis ? 'not-allowed' : 'pointer'
                                }}
                              >
                                {loadingAnalysis ? 'Loading...' : 'Refresh Analysis'}
                              </button>
                              <button 
                                onClick={async () => {
                                  try {
                                    setLoadingAnalysis(true);
                                    const token = localStorage.getItem('token');
                                    await axios.post(`${API_URL}/user/trigger-ai-analysis`, {}, {
                                      headers: { Authorization: `Bearer ${token}` }
                                    });
                                    // Refresh the analysis after triggering
                                    setTimeout(() => fetchAiAnalysis(), 2000);
                                  } catch (error) {
                                    console.error('Failed to trigger AI analysis:', error);
                                    alert('Failed to trigger AI analysis. Please try again.');
                                  } finally {
                                    setLoadingAnalysis(false);
                                  }
                                }}
                                disabled={loadingAnalysis}
                                style={{ 
                                  padding: '5px 10px', 
                                  backgroundColor: '#28a745', 
                                  color: 'white', 
                                  border: 'none', 
                                  borderRadius: '4px',
                                  cursor: loadingAnalysis ? 'not-allowed' : 'pointer'
                                }}
                              >
                                {loadingAnalysis ? 'Processing...' : '🤖 Run AI Analysis'}
                              </button>
                            </div>
                          </div>
                          
                          {aiAnalysis ? (
                            <div>
                              {aiAnalysis.resume_summary && (
                                <div style={{ marginBottom: '15px' }}>
                                  <strong>📝 AI Summary:</strong>
                                  <p style={{ margin: '5px 0', fontStyle: 'italic' }}>{aiAnalysis.resume_summary}</p>
                                </div>
                              )}
                              
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                                {aiAnalysis.extracted_experience && (
                                  <div>
                                    <strong>💼 Experience:</strong>
                                    <p style={{ margin: '5px 0' }}>{aiAnalysis.extracted_experience}</p>
                                  </div>
                                )}
                                
                                {aiAnalysis.extracted_education && (
                                  <div>
                                    <strong>🎓 Education:</strong>
                                    <p style={{ margin: '5px 0' }}>{aiAnalysis.extracted_education}</p>
                                  </div>
                                )}
                                
                                {aiAnalysis.extracted_certifications && (
                                  <div>
                                    <strong>🏆 Certifications:</strong>
                                    <p style={{ margin: '5px 0' }}>{aiAnalysis.extracted_certifications}</p>
                                  </div>
                                )}
                                
                                {aiAnalysis.extracted_languages && (
                                  <div>
                                    <strong>🌍 Languages:</strong>
                                    <p style={{ margin: '5px 0' }}>{aiAnalysis.extracted_languages}</p>
                                  </div>
                                )}
                              </div>
                              
                              {aiAnalysis.ai_analysis && (
                                <div style={{ marginTop: '15px' }}>
                                  {aiAnalysis.ai_analysis.strengths && aiAnalysis.ai_analysis.strengths.length > 0 && (
                                    <div style={{ marginBottom: '10px' }}>
                                      <strong>✨ Key Strengths:</strong>
                                      <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                                        {aiAnalysis.ai_analysis.strengths.map((strength, index) => (
                                          <li key={index}>{strength}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {aiAnalysis.ai_analysis.key_achievements && aiAnalysis.ai_analysis.key_achievements.length > 0 && (
                                    <div>
                                      <strong>🏅 Key Achievements:</strong>
                                      <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                                        {aiAnalysis.ai_analysis.key_achievements.map((achievement, index) => (
                                          <li key={index}>{achievement}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {aiAnalysis.last_ai_analysis && (
                                <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
                                  Last analyzed: {new Date(aiAnalysis.last_ai_analysis).toLocaleString()}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div>
                              <p style={{ margin: '10px 0', color: '#666' }}>
                                No AI analysis available yet. Upload a resume to get AI-powered insights about your profile!
                              </p>
                              <button 
                                onClick={fetchAiAnalysis}
                                style={{ 
                                  padding: '8px 15px', 
                                  backgroundColor: '#28a745', 
                                  color: 'white', 
                                  border: 'none', 
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                Get AI Analysis
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p>No profile information available. Update your profile to improve job matches.</p>
                    )}
                    <button onClick={() => setEditingProfile(true)} className="edit-profile-btn">Edit Profile</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {userType === 'employer' && (
            <div className="employer-info">
              <h3>Employer Information</h3>
              <p>Manage your jobs and applications in the <a href="/dashboard">Dashboard</a>.</p>
            </div>
          )}
        </div>
      </section>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} AI-Powered Job Recommendation</p>
        <p>Helping you connect with the right opportunities</p>
      </footer>
    </div>
  );
}

export default Account;
