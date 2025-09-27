# NexaFlow Supabase Setup Guide

## Quick Setup for Jury Demonstration

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" 
3. Sign in with GitHub/Google
4. Click "New Project"
5. Fill in:
   - Name: `NexaFlow-Demo`
   - Database Password: (generate strong password)
   - Region: Choose closest to your location
6. Click "Create new project"

### 2. Get Your Credentials
Once project is created:
1. Go to Project Settings → API
2. Copy these values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **Anon/Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. Update Environment Variables
Replace the contents of `.env` file with:
```
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_DEMO_MODE=false
```

### 4. Set Up Database
1. In Supabase Dashboard, go to SQL Editor
2. Copy the entire contents of `database.sql` file
3. Paste and click "Run"
4. This creates all tables, policies, and demo users

### 5. Restart Development Server
```bash
npm run dev
```

## Demo Users Created Automatically

The database setup creates these test accounts:

**Admin User:**
- Email: admin@nexaflow.com
- Password: admin123
- Role: Full system administration

**Project Manager:**
- Email: pm@nexaflow.com  
- Password: pm123
- Role: Project and team management

**Team Member:**
- Email: designer@nexaflow.com
- Password: designer123
- Role: Task execution and updates

**Client User:**
- Email: client@techcorp.com
- Password: client123
- Role: Project creation and approval

## Jury Demonstration Flow

1. **Client Creates Project**
   - Login as client@techcorp.com
   - Create new project with requirements
   - Project status: `pending`

2. **Admin Reviews**
   - Login as admin@nexaflow.com
   - Review project details
   - Approve/Reject with notes
   - Status: `approved` or `rejected`

3. **PM Manages Project**
   - Login as pm@nexaflow.com
   - Break project into tasks
   - Assign tasks to team members
   - Status: `in_progress`

4. **Team Executes**
   - Login as designer@nexaflow.com
   - Complete assigned tasks
   - Upload deliverables
   - Status: `pm_review`

5. **PM Reviews & Sends to Client**
   - PM reviews completed work
   - Sends to client for approval
   - Status: `client_review`

6. **Client Final Approval**
   - Client reviews final deliverables
   - Both PM and Client must mark complete
   - Status: `completed`

## Features Demonstrated

✅ **Complete Authentication System**
✅ **Role-Based Access Control** 
✅ **7-Stage Workflow Process**
✅ **Task Management & Assignment**
✅ **Real-time Status Updates**
✅ **Audit Trail & Activity Logging**
✅ **Interactive Confirmation Popups**
✅ **Dual Approval System (PM + Client)**
✅ **Document Upload & Management**
✅ **Priority & Deadline Management**

The system is production-ready with full database integration!