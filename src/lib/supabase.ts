import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'pm' | 'team_member' | 'client'
  designation?: string
  avatar?: string
  company?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  title: string
  description: string
  client_id: string
  admin_id?: string
  pm_id?: string
  status: 'pending' | 'admin_review' | 'approved' | 'rejected' | 'in_progress' | 'pm_review' | 'client_review' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  budget?: number
  deadline?: string
  admin_notes?: string
  rejection_reason?: string
  created_at: string
  updated_at: string
  completed_by_pm: boolean
  completed_by_client: boolean
}

export interface TaskFeedback {
  id: string
  task_id: string
  user_id: string
  user_name: string
  feedback_type: 'approval' | 'rejection' | 'comment' | 'rating'
  comment?: string
  ratings?: {
    quality: number // 1-5
    timeline: number // 1-5
    communication: number // 1-5
  }
  attachments?: string[]
  created_at: string
  reply_to?: string // For threaded comments
}

export interface Task {
  id: string
  project_id: string
  title: string
  description: string
  assigned_to: string | string[] // Support both single and multiple assignees
  created_by: string
  status: 'pending' | 'in_progress' | 'team_completed' | 'pm_review' | 'pm_approved' | 'client_review' | 'client_approved' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  deadline?: string
  completion_notes?: string
  attachments?: string[]
  feedback?: TaskFeedback[] // Feedback history
  created_at: string
  updated_at: string
}

export interface ProjectActivity {
  id: string
  project_id: string
  user_id: string
  action: string
  description: string
  metadata?: any
  created_at: string
}

// Database Functions
export const dbFunctions = {
  // Users
  async getUser(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single()
    return { data, error }
  },

  // Projects
  async getProjects(userId?: string, role?: string) {
    let query = supabase.from('projects').select(`
      *,
      client:users!projects_client_id_fkey(*),
      admin:users!projects_admin_id_fkey(*),
      pm:users!projects_pm_id_fkey(*),
      tasks(*)
    `)

    if (role === 'client' && userId) {
      // Clients see their projects but NOT completed ones
      query = query.eq('client_id', userId).neq('status', 'completed')
    } else if (role === 'pm' && userId) {
      // PMs see all their projects including completed ones
      query = query.eq('pm_id', userId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    return { data, error }
  },

  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('projects')
      .insert([{ ...project, status: 'pending' }])
      .select()
      .single()
    return { data, error }
  },

  async updateProject(id: string, updates: Partial<Project>) {
    const { data, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Tasks
  async getTasks(projectId?: string, userId?: string, role?: string) {
    let query = supabase.from('tasks').select(`
      *,
      project:projects(*),
      assignee:users!tasks_assigned_to_fkey(*),
      creator:users!tasks_created_by_fkey(*)
    `)

    if (projectId) {
      query = query.eq('project_id', projectId)
    } else if (role === 'team_member' && userId) {
      query = query.eq('assigned_to', userId)
    } else if (role === 'pm' && userId) {
      query = query.eq('created_by', userId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    return { data, error }
  },

  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ ...task, status: 'pending' }])
      .select()
      .single()
    return { data, error }
  },

  async updateTask(id: string, updates: Partial<Task>) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Activity Log
  async logActivity(activity: Omit<ProjectActivity, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('project_activities')
      .insert([activity])
      .select()
      .single()
    return { data, error }
  },

  async getProjectActivities(projectId: string) {
    const { data, error } = await supabase
      .from('project_activities')
      .select(`
        *,
        user:users(*)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    return { data, error }
  }
}