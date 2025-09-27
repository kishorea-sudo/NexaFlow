# 🚀 COMPLETE SUPABASE SETUP GUIDE FOR JURY DEMO

## 📋 **STEP 1: Database Setup**

1. **Go to your Supabase project**: https://ypqopufopqclqnjcmkbu.supabase.co
2. **Navigate to SQL Editor**
3. **Copy and paste the entire contents of `supabase-complete-setup.sql`**
4. **Click "Run"** - This creates all tables, policies, and sample data

## 👥 **STEP 2: Create Authentication Users**

### **Method A: Using Supabase Dashboard (Recommended)**

1. **Go to Authentication → Users** in your Supabase dashboard
2. **Click "Add User"** and create these accounts:

   **Admin User:**
   - Email: `admin@nexaflow.com`
   - Password: `admin123456`
   - Confirm Password: `admin123456`
   - ✅ Auto Confirm User: **YES**

   **Project Manager:**
   - Email: `pm@nexaflow.com` 
   - Password: `pm123456`
   - Confirm Password: `pm123456`
   - ✅ Auto Confirm User: **YES**

   **Team Member:**
   - Email: `designer@nexaflow.com`
   - Password: `designer123456`
   - Confirm Password: `designer123456`
   - ✅ Auto Confirm User: **YES**

   **Client User:**
   - Email: `client@techcorp.com`
   - Password: `client123456`
   - Confirm Password: `client123456`
   - ✅ Auto Confirm User: **YES**

### **Method B: Using SQL (If Method A doesn't work)**

If the dashboard method fails, run this in SQL Editor:

```sql
-- Enable users to be created via SQL (temporary)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token,
  recovery_token
) VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'admin@nexaflow.com', crypt('admin123456', gen_salt('bf')), NOW(), NOW(), NOW(), '', '', '', ''),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'pm@nexaflow.com', crypt('pm123456', gen_salt('bf')), NOW(), NOW(), NOW(), '', '', '', ''),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'designer@nexaflow.com', crypt('designer123456', gen_salt('bf')), NOW(), NOW(), NOW(), '', '', '', ''),
  ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'client@techcorp.com', crypt('client123456', gen_salt('bf')), NOW(), NOW(), NOW(), '', '', '', '')
ON CONFLICT (email) DO NOTHING;
```

## 🔗 **STEP 3: Link Auth Users to Profile Data**

After creating auth users, you need to update the user profile IDs to match the auth IDs:

1. **Go to Authentication → Users** 
2. **Copy each user's UUID** (the long ID string)
3. **Go to SQL Editor** and run:

```sql
-- Update user profile IDs to match auth IDs
-- Replace the UUIDs below with the actual auth user IDs from step 2

UPDATE users SET id = 'PASTE_ADMIN_AUTH_UUID_HERE' WHERE email = 'admin@nexaflow.com';
UPDATE users SET id = 'PASTE_PM_AUTH_UUID_HERE' WHERE email = 'pm@nexaflow.com';  
UPDATE users SET id = 'PASTE_DESIGNER_AUTH_UUID_HERE' WHERE email = 'designer@nexaflow.com';
UPDATE users SET id = 'PASTE_CLIENT_AUTH_UUID_HERE' WHERE email = 'client@techcorp.com';

-- Update project client_id to match the new client UUID
UPDATE projects SET client_id = 'PASTE_CLIENT_AUTH_UUID_HERE' WHERE client_id = '44444444-4444-4444-4444-444444444444';

-- Update activity user_id to match the new client UUID  
UPDATE project_activities SET user_id = 'PASTE_CLIENT_AUTH_UUID_HERE' WHERE user_id = '44444444-4444-4444-4444-444444444444';
```

## 🔧 **STEP 4: Verify Configuration**

Your `.env` file should have:
```
VITE_SUPABASE_URL=https://ypqopufopqclqnjcmkbu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwcW9wdWZvcHFjbHFuamNta2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Mjg2NTYsImV4cCI6MjA3NDUwNDY1Nn0.72qKgp22Op8-hil5WgJj6gnk6NaOqrZZeAeXcfTpYYk
VITE_DEMO_MODE=false
```

## 🎯 **STEP 5: Test the System**

### **Test Login & Project Creation:**

1. **Start your app**: `npm run dev`
2. **Login as client**: `client@techcorp.com` / `client123456`
3. **Create a new project** → Should be stored in Supabase database
4. **Check sidebar "My Projects"** → Should show your new project
5. **Switch to admin**: `admin@nexaflow.com` / `admin123456`  
6. **Check projects list** → Should see client's project with approve/reject options

### **Test Complete Workflow:**

1. **Client creates project** → Status: `pending`
2. **Admin approves** → Status: `approved`  
3. **PM assigns project** → Status: `in_progress`
4. **Team completes tasks** → Status: `pm_review`
5. **PM sends to client** → Status: `client_review`
6. **Both PM & Client approve** → Status: `completed`

## 🚨 **Troubleshooting**

### **If login fails:**
- Check that auth users were created successfully
- Verify email addresses match exactly
- Try the demo user fallback: Use old passwords `demo123`

### **If projects don't appear:**
- Check RLS policies are enabled
- Verify user IDs match between auth and profiles
- Check browser console for error messages

### **If you see "Failed to fetch":**
- Verify your Supabase URL and anon key are correct
- Check that your Supabase project is active
- Test the connection in your Supabase dashboard

## 🎬 **Ready for Jury Demo!**

Once setup is complete:
- ✅ **Real database storage** for all projects and data
- ✅ **Supabase authentication** with role-based access  
- ✅ **Live project workflow** from client → admin → PM → team → completion
- ✅ **Real-time updates** across all user roles
- ✅ **Complete audit trail** of all actions

Your jury demonstration will now use a **real production database** instead of demo data!