# TODO: Fix Undefined Method 'createToken'

## Steps to Complete
- [x] Clear Laravel caches (config, cache, route, view) to resolve potential caching issues with the HasApiTokens trait
- [x] Test the authentication endpoints (register and login) to verify createToken method works
- [x] If error persists, check for any missing imports or trait usage in User model (though already present) - Error did not persist after cache clear

## Progress Tracking
- Started: [Date/Time]
- Completed: [Date/Time]

# TODO: Fix PHP Diagnostics Issues

## AuthController.php Fixes
- [x] Add PHPDoc type hint /** @var User $user */ before $user->createToken in register method
- [x] Change $request->email to $request->input('email') in register method (line 41)
- [x] Change $user->profile_image to $user->getAttribute('profile_image') in uploadProfileImage method (lines 111, 112, 117)

## JobController.php Fixes
- [x] Replace Response::HTTP_NOT_FOUND with 404 in show method (line 24)
- [x] Replace Response::HTTP_NOT_FOUND with 404 in update method (line 45)
- [x] Replace Response::HTTP_FORBIDDEN with 403 in store method (line 50)
- [x] Replace Response::HTTP_FORBIDDEN with 403 in update method (line 57)
- [x] Replace Response::HTTP_CREATED with 201 in store method (line 64)
- [x] Replace Response::HTTP_NOT_FOUND with 404 in destroy method (line 85)
- [x] Replace Response::HTTP_FORBIDDEN with 403 in destroy method (line 92)

# TODO: Switch Database to MySQL
- [x] Edit backend/.env to set DB_CONNECTION=mysql and uncomment MySQL settings
- [x] Clear Laravel config cache
- [x] Run fresh migrations to set up database in MySQL
- [x] Verify database connection

## Current Status (What's Working) - You Are Here
- ✅ User accounts with login/signup
- ✅ Job seekers and employers (user types)
- ✅ Employers can post jobs
- ✅ Job seekers can view jobs
- ✅ Basic profiles with images
- ✅ UI for "Create New Job" form has been made elegant with labels, modern styling, shadows, hover effects, and responsive design.
- ✅ Fixed 422 Unprocessable Content error for profile image uploads by changing PUT to POST method in both backend routes and frontend API calls.
- ✅ Added null safety check for user.name in Account.js to prevent runtime errors.
- ✅ Added auto-refresh functionality after profile image upload to immediately display the updated image.
- ✅ Added a error handling in applying jobs(the user cant apply to a job that already apply).
- ✅ fix error in submitting resume(Check the issue).
- ✅ Added resume management area in Jobs page for job seekers: Upload multiple resumes, , replace, delete, and view them.
- ✅ Updated backend AuthController to support multiple resumes with actions: add, , replace, delete.
- ✅ Updated UserProfile model to cast resumes as array.
- ✅ Ran migration to add resumes column to user_profiles table.


- [x] Add profile editing form in Account.js for job seekers (bio, skills, experience_level)
- [x] Update backend to handle profile updates

---

## Phase 1: Database Foundation (Week 1) - Ready to Start (Begin Here)
**Goal**: Set up data structure for applications and profiles.

**Tasks**:
- [x] Create applications table (tracks who applies to jobs)
- [x] Create user profiles table (skills for simple AI matching)
- [x] Update job/user tables with new links
- [x] Run database migrations

**Dependencies**: None
**Next**: Phase 2

---

## Phase 2: Job Apply & Hire System (Week 2) - Depends on Phase 2
**Goal**: Let users apply to jobs and hire each other.

**Tasks**:
- [x] Update DashboardController to include "incoming_projects" for jobseekers (accepted applications)
- [x] Add user profile info (bio, skills) to jobseeker dashboard
- [x] For employers, add "working_on_jobs" (accepted applications)
- [x] Update Navigation.js to include Dashboard link
- [x] Update Account.js to display user background (from UserProfile model)
- [x] Fix dashboard alignment issues for jobseeker and employer user types
- [x] Ensure dashboard shows correct content: Jobseeker (accepted jobs, working on jobs, transactions); Employer (created jobs, applications, working jobs)
- [x] Hide dashboard access if no user is logged in (redirect or protect route)
- [x] Test the apply/hire flow end-to-end

**Dependencies**: Phase 1 complete
**Next**: Phase 3

---

## Additional Tasks
- [x] Add labels to the job form inputs in Dashboard.js for better accessibility and elegance.
- [x] Update Dashboard.css to style the job-form with modern, elegant design: flex layout, card appearance, shadows, hover effects, and responsive design.
- [x] Add "Our Team" section to About page with team members' images and names in horizontal layout
- [x] Add resume submission area for job seekers: Allow users to upload resume files (PDF/DOCX), save in database, and provide access to edit or delete submitted resumes. This feature should be accessible via the Jobs navigation. For employers: Enable job creation in the dashboard, and allow employers to view jobs posted by other employers in the Jobs section.


## Task: Add Resume Submission for Job Seekers and Job Creation for Employers
### Information Gathered
- Backend: Laravel API with AuthController (handles profile image upload), JobController (handles job creation), UserProfile model (has resume_url field).
- Frontend: React with Jobs page (shows jobs, apply), Dashboard page (shows user-specific data).
- Resume: UserProfile has resume_url, but no upload method yet. Need to add uploadResume in AuthController.
- Job Creation: Already exists in JobController store, but not exposed in frontend Dashboard for employers.
- Jobs Page: Shows all jobs, but employers need to see all jobs, jobseekers need resume upload.

### Plan
- Backend Changes:
  - Add uploadResume method in AuthController to handle PDF/DOCX uploads, store in 'resumes' folder, update UserProfile resume_url.
  - Add route in api.php for PUT /user/resume.
  - Ensure UserProfile can store multiple resumes if needed, but for now, one resume_url.
- Frontend Changes:
  - Jobs.js: For jobseekers, add a section to upload resume (file input, upload button), list uploaded resumes with delete button.
  - Dashboard.js: For employers, add a form to create job (title, description, etc.), submit to POST /jobs.
  - Jobs.js: Ensure employers can see all jobs, perhaps add a "Create Job" link or button if employer.

### Dependent Files to Edit
- backend/app/Http/Controllers/Api/AuthController.php: Add uploadResume method.
- backend/routes/api.php: Add route for resume upload.
- frontend/src/pages/Jobs.js: Add resume upload UI for jobseekers.
- frontend/src/pages/Dashboard.js: Add job creation form for employers.

### Followup Steps
- Test resume upload: Upload PDF/DOCX, check storage, update profile.
- Test job creation: Create job from dashboard, verify in jobs list.
- Test delete resume: Delete uploaded resume.
- Update main TODO.md to mark this task as done.


---

## Phase 3: Simple AI Recommendations (Week 3) - Depends on Phase 2
**Goal**: Basic job matching based on user skills and resume analysis.

**Tasks**:
- [ ] Install OpenAI for simple matching
- [ ] Profile forms for skills (text input)
- [ ] Add resume upload functionality to user profiles (PDF/DOCX support)
- [ ] Install PDF/DOCX parsing libraries (smalot/pdfparser, phpoffice/phpword)
- [ ] AI engine to read and analyze user resumes for skills extraction
- [ ] AI engine to match jobs to users (keyword-based via OpenAI)
- [ ] Show "Recommended for You" on jobs page
- [ ] Match scores (e.g., "70% match")

**Dependencies**: Phase 2 complete, OpenAI API key
**Next**: Phase 4

---

## Phase 4: Testing & Launch (Week 4) - Depends on Phase 3
**Goal**: Make sure everything works and launch.

**Tasks**:
- [ ] Test apply/hire/AI flows
- [ ] Fix bugs and slow parts
- [ ] Security checks
- [ ] Performance optimization

**Dependencies**: Phase 3 complete
**Launch Ready!**

---

## What You Need Before Starting
- **OpenAI API Key**: For simple AI matching (free tier available)

## Install These First
- Backend: `composer require openai-php/client`

## Milestones & Progress
- [x] Basics Done (Current Status)
- [x] Phase 1 Done
- [x] Phase 2 Done
- [ ] Phase 3 Done
- [ ] Phase 4 Done - Site Complete!

## Task: Separate Resume Display and Management
### Information Gathered
- Account.js: Currently displays resumes with view, change, and delete options.
- Jobs.js: Has full management: add, replace, delete, view.
- Task: Account page should show resumes under "Your Background" with view links only. Jobs page keeps full management.

### Plan
- Edit Account.js: Remove change and delete buttons from resume display, keep view links.
- No changes to Jobs.js as it already has full management.
- Backend remains unchanged.

### Dependent Files to Edit
- frontend/src/pages/Account.js: Remove replace and delete functionality.

### Followup Steps
- Test Account page: Resumes shown with view only.
- Test Jobs page: Full management still works.
- Update TODO.md to mark this task as done.
- [x] Task completed: Removed change and delete buttons from Account.js resume display.


