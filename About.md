

Architecture Overview
Frontend (React):

Single-page application using React Router for navigation
Axios for API communication
Local storage for authentication tokens
Responsive design with custom CSS
Backend (Laravel):

RESTful API with Sanctum for authentication
MySQL database with models for Users, Jobs, Applications, and Profiles
File storage for resumes and profile images
Rate limiting and validation for security
User Flow
1. Landing & Registration
Users visit the home page showcasing AI-powered job matching features
New users register with name, email, password, and user type (jobseeker/employer)
Backend validates input, hashes passwords, and creates users with API tokens
2. Authentication
Login validates credentials against the database
Successful login stores JWT token in localStorage
Protected routes check authentication status on app load
Logout clears tokens and redirects to home
3. User Types & Dashboards
Job Seekers:

Browse AI-recommended jobs
Upload and manage multiple resumes
Apply to jobs with one-click applications
View application status and accepted projects
Update profiles with bio, skills, experience level, and portfolio
Track earnings and transaction history
Employers:

Post new job listings with details, requirements, and salary
View and manage their job postings
Review applications from job seekers
Accept/reject applications
Track hired workers and payments made
4. Job Management
Public API endpoints allow browsing jobs without login
Employers create jobs via authenticated API calls
Job seekers apply through the frontend, preventing duplicate applications
Applications include status tracking (pending/accepted/rejected)
5. Profile Management
Users can switch between jobseeker/employer roles
Upload profile images and resumes
Update detailed profiles for better job matching
View account information and join dates
6. Security Features
Input validation on both frontend and backend
Rate limiting on login attempts
CSRF protection and encrypted cookies
File upload restrictions (size, type)
Authentication middleware protecting sensitive endpoints
Key Technologies & Features
AI Integration: Claims to use AI for job matching (implementation details not visible in code)
File Handling: Secure upload/storage of resumes and images
Real-time Updates: Dashboard reflects current application/job status
Responsive Design: Works on desktop and mobile devices
Error Handling: Comprehensive error messages and loading states
The platform facilitates the entire job search and hiring process, from profile creation to application management, with a focus on user-friendly interfaces and robust backend validation.