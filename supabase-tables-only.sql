-- SIMPLIFIED SUPABASE SETUP - TABLES ONLY
-- Run this first to create the database structure

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'pm', 'team_member', 'client')),
  avatar TEXT,
  company TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  client_id UUID NOT NULL REFERENCES users(id),
  admin_id UUID REFERENCES users(id),
  pm_id UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'admin_review', 'approved', 'rejected', 'in_progress', 'pm_review', 'client_review', 'completed')
  ),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  budget DECIMAL(10,2),
  deadline TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  rejection_reason TEXT,
  completed_by_pm BOOLEAN DEFAULT FALSE,
  completed_by_client BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  assigned_to UUID NOT NULL REFERENCES users(id),
  created_by UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'in_progress', 'completed', 'under_review', 'approved')
  ),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  deadline TIMESTAMP WITH TIME ZONE,
  completion_notes TEXT,
  attachments TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the project_activities table
CREATE TABLE IF NOT EXISTS project_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view projects based on role" ON projects;
DROP POLICY IF EXISTS "Clients can create projects" ON projects;
DROP POLICY IF EXISTS "Admins and PMs can update projects" ON projects;
DROP POLICY IF EXISTS "Users can view tasks based on role" ON tasks;
DROP POLICY IF EXISTS "PMs can create and update tasks" ON tasks;
DROP POLICY IF EXISTS "Team members can update their assigned tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view activities for accessible projects" ON project_activities;
DROP POLICY IF EXISTS "Authenticated users can create activities" ON project_activities;

-- Create RLS Policies

-- Users policies
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Projects policies
CREATE POLICY "Users can view projects based on role" ON projects FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id::text = auth.uid()::text 
    AND (
      users.role = 'admin' OR 
      (users.role = 'client' AND projects.client_id = users.id) OR
      (users.role = 'pm' AND projects.pm_id = users.id) OR
      users.role = 'team_member'
    )
  )
);

CREATE POLICY "Clients can create projects" ON projects FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id::text = auth.uid()::text 
    AND users.role = 'client'
    AND projects.client_id = users.id
  )
);

CREATE POLICY "Admins and PMs can update projects" ON projects FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id::text = auth.uid()::text 
    AND users.role IN ('admin', 'pm')
  )
);

-- Tasks policies
CREATE POLICY "Users can view tasks based on role" ON tasks FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id::text = auth.uid()::text 
    AND (
      users.role IN ('admin', 'pm') OR 
      tasks.assigned_to = users.id OR
      tasks.created_by = users.id
    )
  )
);

CREATE POLICY "PMs can create and update tasks" ON tasks FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id::text = auth.uid()::text 
    AND users.role = 'pm'
  )
);

CREATE POLICY "Team members can update their assigned tasks" ON tasks FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id::text = auth.uid()::text 
    AND (users.role = 'pm' OR tasks.assigned_to = users.id)
  )
);

-- Project activities policies
CREATE POLICY "Users can view activities for accessible projects" ON project_activities FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects, users
    WHERE projects.id = project_activities.project_id
    AND users.id::text = auth.uid()::text
    AND (
      users.role = 'admin' OR 
      (users.role = 'client' AND projects.client_id = users.id) OR
      (users.role = 'pm' AND projects.pm_id = users.id) OR
      users.role = 'team_member'
    )
  )
);

CREATE POLICY "Authenticated users can create activities" ON project_activities FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

-- Show success message
SELECT 'Database tables and policies created successfully!' as status;