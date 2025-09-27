# 🚀 STEP-BY-STEP SUPABASE SETUP (ERROR-FREE)

## ⚠️ **IMPORTANT: Follow These Steps in Order**

### **STEP 1: Create Database Tables** 
1. **Go to your Supabase project**: https://ypqopufopqclqnjcmkbu.supabase.co
2. **Navigate to SQL Editor**
3. **Copy and paste contents of `supabase-tables-only.sql`**
4. **Click "Run"** 
5. ✅ **Should see**: "Database tables and policies created successfully!"

### **STEP 2: Create Authentication Users**
1. **Go to Authentication → Users** in your Supabase dashboard
2. **Click "Add User"** and create these accounts **one by one**:

**User 1 - Admin:**
- Email: `admin@nexaflow.com`
- Password: `admin123456`
- ✅ **Auto Confirm User: YES**
- Click **"Create User"**

**User 2 - PM:**
- Email: `pm@nexaflow.com` 
- Password: `pm123456`
- ✅ **Auto Confirm User: YES**
- Click **"Create User"**

**User 3 - Team Member:**
- Email: `designer@nexaflow.com`
- Password: `designer123456`
- ✅ **Auto Confirm User: YES**
- Click **"Create User"**

**User 4 - Client:**
- Email: `client@techcorp.com`
- Password: `client123456`
- ✅ **Auto Confirm User: YES**
- Click **"Create User"**

### **STEP 3: Get Auth User IDs**
1. **Go to Authentication → Users**
2. **Copy the UUID for each user** (the long ID string next to each email)
3. **Write them down**:
   - Admin UUID: `[COPY FROM DASHBOARD]`
   - PM UUID: `[COPY FROM DASHBOARD]`
   - Designer UUID: `[COPY FROM DASHBOARD]`
   - Client UUID: `[COPY FROM DASHBOARD]`

### **STEP 4: Create User Profiles**
1. **Go to SQL Editor**
2. **Replace the UUIDs below** with the actual IDs from Step 3
3. **Run this SQL**:

```sql
-- Step 4A: First, insert user profiles with REAL auth UUIDs
-- REPLACE THE UUIDs BELOW WITH ACTUAL IDs FROM AUTHENTICATION → USERS

INSERT INTO users (id, email, name, role, avatar, company) VALUES
  ('PASTE_ADMIN_UUID_HERE', 'admin@nexaflow.com', 'John Admin', 'admin', 'https://ui-avatars.com/api/?name=John%20Admin&background=3B82F6&color=ffffff&size=32', 'NexaFlow Inc'),
  ('PASTE_PM_UUID_HERE', 'pm@nexaflow.com', 'Sarah Johnson', 'pm', 'https://ui-avatars.com/api/?name=Sarah%20Johnson&background=3B82F6&color=ffffff&size=32', 'NexaFlow Inc'),
  ('PASTE_DESIGNER_UUID_HERE', 'designer@nexaflow.com', 'Alex Chen', 'team_member', 'https://ui-avatars.com/api/?name=Alex%20Chen&background=3B82F6&color=ffffff&size=32', 'NexaFlow Inc'),
  ('PASTE_CLIENT_UUID_HERE', 'client@techcorp.com', 'Michael Client', 'client', 'https://ui-avatars.com/api/?name=Michael%20Client&background=3B82F6&color=ffffff&size=32', 'TechCorp LLC')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  avatar = EXCLUDED.avatar,
  company = EXCLUDED.company;

-- Verify users were created
SELECT 'Users created. Found ' || COUNT(*) || ' users in database.' as status FROM users;
```

**Then run this SEPARATE query to create the sample project:**

```sql
-- Step 4B: Create sample project (run this AFTER Step 4A succeeds)
-- REPLACE CLIENT_UUID_HERE with the same client UUID from Step 4A

INSERT INTO projects (title, description, client_id, status, priority, budget, deadline) VALUES
  ('Sample Website Redesign', 'Complete redesign of corporate website with modern UI/UX', 'PASTE_CLIENT_UUID_HERE', 'pending', 'high', 15000.00, NOW() + INTERVAL '30 days');

SELECT 'Sample project created successfully!' as status;
```

### **STEP 5: Test the System**
1. **Restart your dev server**: `Ctrl+C` then `npm run dev`
2. **Go to**: http://localhost:5173/
3. **Login as client**: `client@techcorp.com` / `client123456`
4. **Create a new project** → Should store in database ✅
5. **Check "My Projects" in sidebar** → Should appear ✅
6. **Switch to admin**: `admin@nexaflow.com` / `admin123456`
7. **Check projects** → Should see client's project for approval ✅

### **🎯 Expected Results:**
- ✅ **No foreign key constraint errors**
- ✅ **Real authentication with Supabase**
- ✅ **Projects stored in database**
- ✅ **Sidebar shows real project data**
- ✅ **Admin can approve/reject projects**
- ✅ **Complete workflow works end-to-end**

### **🚨 If You Get Errors:**

#### **Foreign Key Constraint Error (like you're seeing):**
```
Key (client_id)=(babd5e46-fc88-41de-b452-080582405da2) is not present in table "users"
```

**Fix Steps:**
1. **Check if users exist**: Run this query first:
   ```sql
   SELECT id, email, role FROM users;
   ```
2. **If no users found**: Run Step 4A first, then Step 4B separately
3. **If users exist but project fails**: Make sure the client_id UUID in the project matches exactly

#### **Debug Query - Check Your UUIDs:**
```sql
-- Run this to see what users exist and their UUIDs
SELECT 
    'Auth Users' as source, 
    id::text as uuid, 
    email 
FROM auth.users 
WHERE email IN ('admin@nexaflow.com', 'pm@nexaflow.com', 'designer@nexaflow.com', 'client@techcorp.com')

UNION ALL

SELECT 
    'Profile Users' as source, 
    id::text as uuid, 
    email 
FROM users;
```

#### **Other Common Errors:**
- **Login Fails**: Check passwords are exactly as entered in Step 2
- **No Projects Show**: Check RLS policies and user roles are correct
- **"Row Level Security" Error**: Make sure you're using the UUIDs from Authentication → Users

**This step-by-step approach eliminates the foreign key constraint error by ensuring users exist before creating projects!**