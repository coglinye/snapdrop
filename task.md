Overload App: LLM Specification and Task List
This document outlines the full specification and a detailed task list for the development of the "Overload" file transfer application, leveraging the existing Snapdrop open-source codebase as its foundation.

1. Project Overview
Project Name: Overload
Project Type: Cloud-based file transfer service
Target Market: Primarily Nigeria, with expansion to Ghana, Kenya, South Africa.
Business Model: Freemium with subscription tiers and integrated advertising.
Core Objective: To become Africa's leading file transfer platform, providing fast, reliable, and affordable file sharing solutions while supporting local businesses through strategic advertising placements.

Base Code: The application will be developed by forking and adapting the Snapdrop open-source project from GitHub. The LLM should assume the availability of the Snapdrop codebase and focus on extending and modifying it according to these specifications.

2. Core Feature Specifications
The LLM must implement the following features, integrating them into the Snapdrop base where applicable.

2.1 Core File Transfer Features
Upload & Download:

Implement file size limits based on tier: Free (2GB), Pro (20GB), Business (100GB).

Ensure support for all file types.

Develop multiple file selection (drag & drop, folder upload).

Integrate real-time upload/download progress indicators.

Implement resume capability for interrupted transfers.

Transfer Management:

Generate unique, secure download links.

Implement expiry settings: 1 day (free), 7 days (pro), 30 days (business).

Enforce download limits: 5 (free), 100 (pro), unlimited (business).

Add optional password protection for transfers.

Implement transfer history display (last 30 for Pro/Business only).

Notification System:

Integrate SendGrid for email notifications (send/receive, verification).

Integrate a local SMS gateway for SMS notifications (Pro/Business).

Develop in-app real-time status updates.

Allow custom messages for transfers.

2.2 User Account System
Authentication:

Implement registration via Email + password.

Integrate Google OAuth for registration/login.

Implement phone number registration with SMS verification.

Develop profile management (name, email, phone, company).

Enforce email and phone verification.

Dashboard Features:

Display complete transfer logs with status.

Show usage analytics (storage used, transfers sent/received).

Provide account settings (profile, notifications, billing).

Develop an API access dashboard (Business tier only).

2.3 Subscription & Payment System
Pricing Tiers: Implement the following tiers with their respective features and limitations:

Free Tier: ₦0/month, 2GB limit, 5GB monthly quota, 1-day expiry, basic email notifications, Overload branding + ads.

Pro Tier: ₦2,500/month, 20GB limit, 100GB monthly quota, 7-day expiry, Email + SMS notifications, password protection, transfer history, reduced ads.

Business Tier: ₦8,500/month, 100GB limit, 500GB monthly quota, 30-day expiry, custom branding, API access, priority support, ad-free, team collaboration.

Payment Integration:

Integrate Paystack for all payment processing.

Support Debit/Credit cards (Visa, Mastercard, Verve), Bank transfers, USSD codes, Mobile money (MTN, Airtel).

Implement monthly and annual billing cycles (20% annual discount).

Set Nigerian Naira (₦) as primary currency, USD as secondary.

Automate PDF invoice generation.

Implement a failed payment recovery system.

2.4 Advertising System
Ad Placements: Implement WeTransfer-style ad placements:

Full-screen wallpaper ads during transfers.

Header/footer banner ads.

Interstitial ads between transfer steps.

Optional pre-transfer video ads (skippable after 5s).

Native sponsored transfer themes.

Ad Management:

Develop a self-serve advertiser dashboard.

Implement campaign management (budget, targeting, scheduling).

Provide analytics (impressions, clicks, conversions).

Implement creative guidelines enforcement.

Manage prepaid advertising credits.

3. Technical Architecture & Integration
The LLM should prioritize integration with the Snapdrop codebase and the specified third-party services.

3.1 Frontend Requirements
Framework: Upgrade the Snapdrop frontend to React.js.

Design: Implement a mobile-first, responsive design with PWA capabilities.

Offline Support: Implement a service worker for basic offline functionality.

Languages: Support English. (Hausa, Yoruba, Igbo for Phase 2, initial English only).

Performance: Achieve <3s page load and <1s interaction response.

3.2 Backend Infrastructure
Cloud Provider: Assume AWS/Google Cloud with African edge locations for file storage and compute.

CDN: Integrate CloudFlare (with Lagos/Cape Town presence).

Database: Use PostgreSQL for user data and Redis for sessions.

File Storage: Integrate AWS S3 / Google Cloud Storage with lifecycle policies.

API: Implement a RESTful API, potentially with GraphQL for complex queries.

3.3 Third-Party Integrations
Paystack:

Full subscription management and recurring billing automation.

Webhook handling for real-time payment status updates.

Automated refund processing.

Revenue tracking and reporting.

SendGrid:

Transactional emails: Account verification, transfer notifications, payment confirmations, password resets.

Marketing emails: Feature announcements, usage summaries, promotional campaigns.

Template management and delivery optimization.

3.4 Security & Compliance
Data Encryption: Implement AES-256 at rest, TLS 1.3 in transit.

Access Controls: Implement RBAC with audit logging.

Compliance: Adhere to GDPR and Nigerian data laws (local data residency options).

Security Features: Implement real-time malware scanning, API and upload rate limiting.

4. User Experience Design
Visual Style: Clean, modern, WeTransfer-inspired.

Color Palette: Primary: #FF6B35 (African sunset orange); Secondary: #2E8B57 (Deep green); Accent: #FFD700 (Gold).

Typography: Use Open Sans/Poppins.

Iconography: Custom African-inspired icons.

Mobile Experience: Progressive Web App (PWA), touch optimization, data consciousness (compression, WiFi prompts), local storage for offline transfer queue.

5. LLM Development Task List
The LLM should approach development in the following phases, prioritizing tasks within each phase.

Phase 1: Foundation (Months 1-2)
Task 1.1: Snapdrop Codebase Analysis & Setup:

Analyze the existing Snapdrop codebase structure (frontend & backend).

Identify key modules for file transfer, peer-to-peer communication, and server-side handling.

Set up a local development environment for the Snapdrop fork.

Task 1.2: Initial Backend Architecture:

Set up basic AWS S3 / Google Cloud Storage integration for persistent file storage.

Establish PostgreSQL database and Redis for initial user/session data structures.

Develop a basic RESTful API endpoint for testing connectivity.

Task 1.3: Paystack Integration (Initial):

Integrate Paystack API for basic payment initiation and webhook listening.

Implement initial currency handling for NGN.

Task 1.4: SendGrid Integration (Initial):

Integrate SendGrid API for sending basic transactional emails (e.g., test emails).

Phase 2: Core Features (Months 3-4)
Task 2.1: User Registration & Authentication:

Implement email/password registration and login.

Integrate Google OAuth for authentication.

Develop email verification flow via SendGrid.

Task 2.2: Core File Upload/Download Functionality (Modified Snapdrop):

Modify Snapdrop's file transfer mechanism to use cloud storage (S3/GCS) instead of direct peer-to-peer for authenticated users.

Implement progress indicators for uploads/downloads.

Apply initial file size limits based on free tier (2GB).

Task 2.3: Basic Subscription System:

Define database schemas for user tiers and subscription status.

Implement basic logic to differentiate free and paid features (initially for file size limits).

Task 2.4: Basic Dashboard Development:

Create a simple user dashboard displaying account information.

Phase 3: Advanced Features (Months 5-6)
Task 3.1: Full File Transfer Feature Set:

Implement file size limits for Pro (20GB) and Business (100GB) tiers.

Develop secure unique link generation.

Implement link expiry logic and download limits.

Add password protection for transfers.

Implement transfer history logging and display for Pro/Business users.

Develop resume capability for uploads.

Task 3.2: Full Subscription System:

Implement Paystack integration for recurring billing (monthly/annual).

Develop automated invoice generation.

Implement logic for upgrading/downgrading tiers.

Integrate Paystack webhooks for real-time payment status updates.

Task 3.3: Enhanced Notification System:

Implement transfer success/failure email notifications via SendGrid.

Integrate local SMS gateway for Pro/Business transfer notifications.

Develop in-app notification system for real-time updates.

Task 3.4: Advertising System (Initial):

Develop backend logic for serving wallpaper and banner ads (initially hardcoded placeholders).

Implement ad placement in the frontend (free tier only).

Phase 4: Launch Preparation (Month 7)
Task 4.1: Performance Optimization:

Optimize database queries and API responses.

Implement CDN (CloudFlare) integration for static assets and file downloads.

Frontend performance tuning (React bundling, lazy loading).

Task 4.2: Security Hardening:

Implement comprehensive rate limiting for API and uploads.

Integrate a malware scanning service for uploaded files.

Conduct security audits for common vulnerabilities.

Task 4.3: PWA & Mobile Optimization:

Convert the React frontend into a Progressive Web App (PWA).

Ensure full responsiveness and touch optimization across devices.

Implement service worker for basic offline capabilities.

Task 4.4: Final Polish:

Implement the specified color palette, typography, and African-inspired icons.

Refine all user flows for optimal experience.

Phase 5: Launch & Growth (Months 8-12)
Task 5.1: Self-Serve Advertising Portal:

Develop the advertiser dashboard for campaign management, budgeting, and analytics.

Implement creative guidelines and prepaid credit management.

Task 5.2: Usage Analytics & Reporting:

Integrate analytics tools for tracking MAU, transfer volume, retention, conversion.

Develop dashboard displays for these metrics.

Task 5.3: Team Collaboration Features (Business Tier):

Implement basic features for team accounts (e.g., shared transfer history, team member management).

Task 5.4: Multi-language Support (Phase 2):

Begin implementation of localization for Hausa, Yoruba, Igbo.

This detailed specification and task list provide a clear roadmap for the LLM to develop the Overload application, leveraging the Snapdrop codebase and integrating the specified third-party services. The focus should be on building a robust, secure, and user-friendly platform tailored for the African market.