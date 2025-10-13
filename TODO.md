# AI-Powered Job Recommendation Website - Implementation Flow

## Overview
This TODO outlines the step-by-step flow to implement missing features: AI integration for job recommendations, payment integration (manual/automatic), and job integration (manual apply, employer post/hire, pay for hires).

## Current State
- ✅ Basic Laravel backend with auth, job CRUD, user types (jobseeker/employer)
- ✅ React frontend with login, jobs display, account management
- ❌ No job applications, hiring, payments, or AI recommendations

## Implementation Flow

### Phase 1: Database and Model Enhancements (Foundation)
- [ ] Create `applications` migration (user_id, job_id, status: applied/hired/rejected, applied_at, hired_at)
- [ ] Create `user_profiles` migration (user_id, skills JSON, experience_years, location_preferences, salary_expectations)
- [ ] Create `subscriptions` migration (user_id, stripe_id, status, plan_type, ends_at)
- [ ] Create `transactions` migration (user_id, type: subscription/hire, amount, stripe_payment_id, status)
- [ ] Update Job model: add employer_id (foreign key to users), relationships to applications
- [ ] Update User model: add profile relationship, applications relationship
- [ ] Create Application model with relationships
- [ ] Create Subscription and Transaction models

### Phase 2: Job Integration (Apply, Post, Hire)
- [ ] Backend: Create ApplicationController (apply, view applications, hire, reject)
- [ ] Backend: Update JobController (filter jobs by employer, add employer_id on create)
- [ ] Backend: Add API routes for applications (/api/applications, /api/jobs/{id}/apply, /api/applications/{id}/hire)
- [ ] Frontend: Update Jobs.js (add Apply button, show applied status)
- [ ] Frontend: Create Applications.js page (jobseekers view applied jobs)
- [ ] Frontend: Update Account.js (employers see posted jobs, jobseekers see applications)
- [ ] Frontend: Add Hire button on application details (mark hired)

### Phase 3: Payment Integration (Manual/Auto Pay)
- [ ] Backend: Install Stripe SDK (`composer require stripe/stripe-php`)
- [ ] Backend: Create PaymentController (create subscription, one-time hire payment, webhook handling)
- [ ] Backend: Add Stripe config in services.php, middleware for premium features
- [ ] Backend: Add payment routes (/api/subscribe, /api/pay-hire/{application_id})
- [ ] Frontend: Install Stripe JS (`npm install @stripe/stripe-js`)
- [ ] Frontend: Create PaymentForm component (Stripe Elements for subscriptions)
- [ ] Frontend: Add subscription UI on Account.js (upgrade to premium)
- [ ] Frontend: Add manual pay button on hire (one-time payment via Stripe)
- [ ] Frontend: Implement auto-pay for premium (recurring subscriptions)

### Phase 4: AI Integration (Recommendations)
- [ ] Backend: Install OpenAI SDK (`composer require openai-php/client`)
- [ ] Backend: Create RecommendationController (match jobs based on user profile)
- [ ] Backend: Add AI logic (skill matching, NLP via OpenAI for job descriptions)
- [ ] Backend: Add recommendation route (/api/recommendations)
- [ ] Frontend: Update Account.js (add profile form: skills, experience, preferences)
- [ ] Frontend: Update Jobs.js (fetch and display AI-recommended jobs first)
- [ ] Frontend: Add match score display (e.g., "85% match")

### Phase 5: External Job Integration (Optional Expansion)
- [ ] Backend: Create JobImportService (fetch from Indeed API or similar)
- [ ] Backend: Add queue job for daily imports
- [ ] Frontend: Add search/filter on Jobs.js (include external jobs)

### Phase 6: Testing and Polish
- [ ] Add unit tests for controllers/models
- [ ] Add integration tests for payments/AI
- [ ] Update frontend error handling (payment failures, API errors)
- [ ] Security: Validate inputs, rate limiting on applications
- [ ] Performance: Optimize queries, caching for recommendations

## Dependencies to Install
- Backend: stripe/stripe-php, openai-php/client, guzzlehttp/guzzle
- Frontend: @stripe/stripe-js

## Environment Setup
- Add to .env: STRIPE_SECRET_KEY, OPENAI_API_KEY, JOB_API_KEY (for external jobs)
- Run migrations after each phase

## Priority Order
1. Phase 1 (models/migrations)
2. Phase 2 (job apply/hire)
3. Phase 3 (payments)
4. Phase 4 (AI)
5. Phase 5 (external jobs)
6. Phase 6 (testing)


#  need gawin or suggest kayo.
