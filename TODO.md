# Roadmap: Complete Your Simplified AI Job Matching Website

## Current Status (What's Working) - You Are Here
- ✅ User accounts with login/signup
- ✅ Job seekers and employers (user types)
- ✅ Employers can post jobs
- ✅ Job seekers can view jobs
- ✅ Basic profiles with images

## Roadmap Overview
This simplified roadmap focuses on core features: Job Applications/Hiring and Simple AI Recommendations. No payments or external jobs to keep it easy. Total estimated time: 2-3 weeks. Start with Phase 1.

---

## Phase 1: Database Foundation (Week 1) - Ready to Start (Begin Here)
**Goal**: Set up data structure for applications and profiles.

**Tasks**:
- [x] Create applications table (tracks who applies to jobs)
- [x] Create user profiles table (skills for simple AI matching)
- [x] Update job/user tables with new links
- [x] Run database migrations

**Dependencies**: None
**Time**: 2-3 days
**Next**: Phase 2

---

## Phase 2: Job Apply & Hire System (Week 2) - Depends on Phase 1
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
**Time**: 4-5 days
**Next**: Phase 3

---

## Additional Tasks
- [x] Add "Our Team" section to About page with team members' images and names in horizontal layout

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
**Time**: 3-4 days
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
**Time**: 2-3 days
**Launch Ready!**

---

## What You Need Before Starting
- **OpenAI API Key**: For simple AI matching (free tier available)
- **Time**: 1-2 hours/day to code

## Install These First
- Backend: `composer require openai-php/client`

## Milestones & Progress
- [x] Basics Done (Current Status)
- [x] Phase 1 Done
- [x] Phase 2 Done
- [ ] Phase 3 Done
- [ ] Phase 4 Done - Site Complete!
