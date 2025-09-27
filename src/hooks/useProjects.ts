import { useState, useEffect } from 'react';
import { dbFunctions, Project, Task } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface ProjectWithTasks extends Project {
  tasks?: Task[];
  client?: any;
  admin?: any;
  pm?: any;
}

export interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  type: 'deliverable' | 'approval' | 'progress' | 'assignment' | 'project';
}

// Demo user IDs for temporary storage
const TEMP_DEMO_USER_IDS = [
  '44444444-4444-4444-4444-444444444444', // client - John Smith
  '11111111-1111-1111-1111-111111111111', // admin - Admin Sarah
  '22222222-2222-2222-2222-222222222222', // pm1 - Michael Johnson
  '22222222-2222-2222-2222-222222222223', // pm2 - Emily Davis
  '33333333-3333-3333-3333-333333333333', // designer - Alex Chen
  '33333333-3333-3333-3333-333333333334', // frontend dev - David Rodriguez
  '33333333-3333-3333-3333-333333333335', // backend dev - Lisa Wang
  '33333333-3333-3333-3333-333333333336'  // qa engineer - Robert Thompson
];

// Persistent storage helpers
const STORAGE_KEYS = {
  PROJECTS: 'nexaflow_projects',
  TASKS: 'nexaflow_tasks',
  ACTIVITIES: 'nexaflow_activities'
};

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.warn(`Failed to load ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn(`Failed to save ${key} to localStorage:`, error);
  }
};

// Initialize default sample project if none exists
const getInitialProjects = (): ProjectWithTasks[] => {
  const stored = loadFromStorage<ProjectWithTasks[]>(STORAGE_KEYS.PROJECTS, []);
  
  // If no projects in storage, create a sample project
  if (stored.length === 0) {
    const sampleProject: ProjectWithTasks = {
      id: 'sample-project-1',
      title: 'Sample Website Redesign',
      description: 'Complete redesign of corporate website with modern UI/UX',
      priority: 'high',
      status: 'pending',
      client_id: '44444444-4444-4444-4444-444444444444',
      admin_id: undefined,
      pm_id: undefined,
      budget: 15000,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      admin_notes: undefined,
      rejection_reason: undefined,
      completed_by_pm: false,
      completed_by_client: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tasks: []
    };
    const initialProjects = [sampleProject];
    saveToStorage(STORAGE_KEYS.PROJECTS, initialProjects);
    return initialProjects;
  }
  
  return stored;
};

// Global storage for demo projects (now persists across browser sessions)
let globalTempProjects: ProjectWithTasks[] = getInitialProjects();

export const useProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectWithTasks[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // Load data immediately for demo users, or with timeout for real users
      const loadData = async () => {
        await Promise.all([
          loadProjects(),
          loadTasks(),
          loadActivities()
        ]);
      };
      
      loadData();
    } else {
      // If no user, set loading to false quickly
      setLoading(false);
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;

    // Check if this is a temporary demo user (fallback for testing)
    if (TEMP_DEMO_USER_IDS.includes(user.id)) {
      // For temporary demo users, use global storage that persists across user switches
      let filteredProjects = globalTempProjects;
      
      // Debug: Log global projects
      console.log('Global temp projects:', globalTempProjects);
      console.log('Current user:', user.id, user.role);
      
      // Filter based on user role
      if (user.role === 'client') {
        // Clients see their projects but NOT completed ones
        filteredProjects = globalTempProjects.filter(p => p.client_id === user.id && p.status !== 'completed');
      } else if (user.role === 'pm') {
        // PMs see all their projects including completed ones
        filteredProjects = globalTempProjects.filter(p => p.pm_id === user.id);
      }
      // Admin sees all projects (no filter)

      console.log('Filtered projects for user:', filteredProjects);
      console.log('Pending projects for admin:', filteredProjects.filter(p => p.status === 'pending'));
      
      setProjects(filteredProjects);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      
      // Add timeout to prevent long loading times
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 3000)
      );
      
      const dataPromise = dbFunctions.getProjects(user.id, user.role);
      
      const { data, error } = await Promise.race([dataPromise, timeoutPromise]) as any;
      if (error) throw error;
      setProjects(data || []);
      setError(null);
    } catch (err: any) {
      console.warn('Failed to load projects from Supabase, using demo mode:', err.message);
      // Fallback to demo mode
      setProjects([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    if (!user) return;

    // Check if this is a temporary demo user
    if (TEMP_DEMO_USER_IDS.includes(user.id)) {
      // Load projects and tasks from persistent storage
      globalTempProjects = loadFromStorage(STORAGE_KEYS.PROJECTS, getInitialProjects());
      const storedTasks = loadFromStorage<Task[]>(STORAGE_KEYS.TASKS, []);
      
      // Combine tasks from projects and standalone tasks, removing duplicates
      const projectTasks = globalTempProjects.flatMap(p => p.tasks || []);
      const combinedTasks = [...projectTasks, ...storedTasks];
      
      // Remove duplicates by ID (this is likely the source of duplicate XR2 tasks)
      const taskMap = new Map();
      combinedTasks.forEach(task => {
        if (!taskMap.has(task.id)) {
          taskMap.set(task.id, task);
        }
      });
      const allTasks = Array.from(taskMap.values());
      
      // Filter tasks based on user role
      let filteredTasks: Task[] = [];
      
      if (user.role === 'team_member') {
        // Team members see ONLY their own tasks - complete isolation
        filteredTasks = allTasks.filter(task => {
          if (Array.isArray(task.assigned_to)) {
            return task.assigned_to.includes(user.id);
          } else {
            return task.assigned_to === user.id;
          }
        }).map(task => {
          // Remove sensitive information that might reveal other team members' work
          return {
            ...task,
            description: task.description || 'Task details'
          };
        });
      } else if (user.role === 'pm') {
        // PMs see tasks they created or for projects they manage
        filteredTasks = allTasks.filter(task => 
          task.created_by === user.id || 
          globalTempProjects.some(p => p.pm_id === user.id && p.tasks?.some(t => t.id === task.id))
        );
      } else if (user.role === 'client') {
        // Clients see tasks from their projects
        filteredTasks = allTasks.filter(task => 
          globalTempProjects.some(p => p.client_id === user.id && p.tasks?.some(t => t.id === task.id))
        );
      } else {
        // Admin and other roles see all tasks
        filteredTasks = allTasks;
      }

      // Add sample tasks for team members if none exist
      if (user.role === 'team_member' && filteredTasks.length === 0) {
        const sampleTasks: Task[] = [
          {
            id: 'sample-task-1',
            project_id: 'sample-project-1',
            title: 'Design Logo Concepts',
            description: 'Create initial logo design concepts for brand identity',
            assigned_to: user.id,
            created_by: '22222222-2222-2222-2222-222222222222', // PM
            status: 'pending',
            priority: 'high',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'sample-task-2',
            project_id: 'sample-project-1',
            title: 'UI Component Development',
            description: 'Develop reusable UI components for the application',
            assigned_to: user.id,
            created_by: '22222222-2222-2222-2222-222222222222', // PM
            status: 'in_progress',
            priority: 'medium',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        filteredTasks = sampleTasks;
      }

      // Save filtered tasks to storage for persistence
      saveToStorage(STORAGE_KEYS.TASKS, allTasks);
      setTasks(filteredTasks);
      return;
    }

    try {
      // Add timeout to prevent long loading times
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 3000)
      );
      
      const dataPromise = dbFunctions.getTasks(undefined, user.id, user.role);
      
      const { data, error } = await Promise.race([dataPromise, timeoutPromise]) as any;
      if (error) throw error;
      setTasks(data || []);
    } catch (err: any) {
      console.warn('Failed to load tasks from Supabase, using demo mode:', err.message);
      setTasks([]);
    }
  };

  const loadActivities = async () => {
    if (!user) return;

    try {
      // For now, we'll show some mock activities until we implement proper activity tracking
      const mockActivities: Activity[] = [
        {
          id: '1',
          user: user.name,
          action: 'logged_in',
          target: 'System',
          time: 'Just now',
          type: 'progress'
        }
      ];
      setActivities(mockActivities);
    } catch (err: any) {
      console.error('Failed to load activities:', err.message);
      setActivities([]);
    }
  };

  const createProject = async (projectData: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    deadline?: string;
    budget?: number;
  }) => {
    if (!user) throw new Error('User not authenticated');

    // Check if this is a temporary demo user (fallback for testing)
    if (TEMP_DEMO_USER_IDS.includes(user.id)) {
      // For temporary demo users, create mock project in global storage
      const mockProject: ProjectWithTasks = {
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: projectData.title,
        description: projectData.description,
        priority: projectData.priority,
        status: 'pending' as const,
        client_id: user.id,
        admin_id: undefined,
        pm_id: undefined,
        budget: projectData.budget,
        deadline: projectData.deadline,
        admin_notes: undefined,
        rejection_reason: undefined,
        completed_by_pm: false,
        completed_by_client: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tasks: []
      };

      // Add to global storage and save to persistent storage
      globalTempProjects = [mockProject, ...globalTempProjects];
      saveToStorage(STORAGE_KEYS.PROJECTS, globalTempProjects);
      
      // Refresh current user's projects
      await loadProjects();
      
      // Update activities
      setActivities(prev => [{
        id: `activity-${Date.now()}`,
        user: user.name,
        action: 'created',
        target: `Project: ${projectData.title}`,
        time: 'Just now',
        type: 'project'
      }, ...prev]);

      return mockProject;
    }

    try {
      const { data, error } = await dbFunctions.createProject({
        ...projectData,
        client_id: user.id,
        status: 'pending',
        completed_by_pm: false,
        completed_by_client: false
      });

      if (error) throw error;

      // Log activity
      await dbFunctions.logActivity({
        project_id: data.id,
        user_id: user.id,
        action: 'created',
        description: `Project "${projectData.title}" submitted for admin review`
      });

      await loadProjects();
      
      // Update activities
      setActivities(prev => [{
        id: `activity-${Date.now()}`,
        user: user.name,
        action: 'created',
        target: `Project: ${projectData.title}`,
        time: 'Just now',
        type: 'project'
      }, ...prev]);

      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create project');
    }
  };

  const updateProjectStatus = async (
    projectId: string, 
    status: Project['status'], 
    notes?: string
  ) => {
    if (!user) throw new Error('User not authenticated');

    // Check if this is a temporary demo user
    if (TEMP_DEMO_USER_IDS.includes(user.id)) {
      // For temporary demo users, update project in global storage and save to persistent storage
      globalTempProjects = globalTempProjects.map(project => 
        project.id === projectId 
          ? { 
              ...project, 
              status, 
              admin_notes: status === 'rejected' ? undefined : notes,
              rejection_reason: status === 'rejected' ? notes : undefined,
              updated_at: new Date().toISOString() 
            }
          : project
      );
      saveToStorage(STORAGE_KEYS.PROJECTS, globalTempProjects);
      
      // Refresh current user's projects
      await loadProjects();
      
      // Update activities
      setActivities(prev => [{
        id: `activity-${Date.now()}`,
        user: user.name,
        action: status,
        target: `Project status updated to ${status}`,
        time: 'Just now',
        type: 'project'
      }, ...prev]);

      return { id: projectId, status };
    }

    try {
      const updates: Partial<Project> = { status };
      if (notes) {
        if (status === 'rejected') {
          updates.rejection_reason = notes;
        } else {
          updates.admin_notes = notes;
        }
      }

      const { data, error } = await dbFunctions.updateProject(projectId, updates);
      if (error) throw error;

      // Log activity
      await dbFunctions.logActivity({
        project_id: projectId,
        user_id: user.id,
        action: status,
        description: `Project status updated to ${status}${notes ? ` with notes: ${notes}` : ''}`
      });

      await loadProjects();
      
      // Update activities
      setActivities(prev => [{
        id: `activity-${Date.now()}`,
        user: user.name,
        action: status,
        target: `Project status updated to ${status}`,
        time: 'Just now',
        type: 'project'
      }, ...prev]);

      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update project status');
    }
  };

  const assignProjectToPM = async (projectId: string, pmId: string) => {
    if (!user || user.role !== 'admin') throw new Error('Unauthorized');

    // Check if this is a temporary demo user
    if (TEMP_DEMO_USER_IDS.includes(user.id)) {
      // For temporary demo users, update project in global storage and save to persistent storage
      globalTempProjects = globalTempProjects.map(project => 
        project.id === projectId 
          ? { ...project, pm_id: pmId, status: 'in_progress', updated_at: new Date().toISOString() }
          : project
      );
      saveToStorage(STORAGE_KEYS.PROJECTS, globalTempProjects);
      
      // Refresh current user's projects
      await loadProjects();
      
      // Update activities
      setActivities(prev => [{
        id: `activity-${Date.now()}`,
        user: user.name,
        action: 'assigned',
        target: `Project assigned to Project Manager`,
        time: 'Just now',
        type: 'project'
      }, ...prev]);

      return { id: projectId, pm_id: pmId, status: 'in_progress' };
    }

    try {
      const { data, error } = await dbFunctions.updateProject(projectId, {
        pm_id: pmId,
        status: 'in_progress'
      });

      if (error) throw error;

      await dbFunctions.logActivity({
        project_id: projectId,
        user_id: user.id,
        action: 'assigned',
        description: `Project assigned to Project Manager`
      });

      await loadProjects();
      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to assign project');
    }
  };

  const createTask = async (taskData: {
    project_id: string;
    title: string;
    description: string;
    assigned_to: string | string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
    deadline?: string;
  }) => {
    if (!user) throw new Error('User not authenticated');

    // Check if this is a temporary demo user or temporary project
    const isTemporaryProject = taskData.project_id.startsWith('temp-');
    const isTemporaryUser = TEMP_DEMO_USER_IDS.includes(user.id);

    if (isTemporaryUser || isTemporaryProject) {
      // For temporary demo users/projects, create mock task(s) in memory
      const assignees = Array.isArray(taskData.assigned_to) ? taskData.assigned_to : [taskData.assigned_to];
      const tasksToCreate: Task[] = [];
      
      // Create individual tasks for each assignee to ensure proper task management
      assignees.forEach((assigneeId, index) => {
        const mockTask: Task = {
          id: `temp-task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`,
          project_id: taskData.project_id,
          title: assignees.length > 1 ? `${taskData.title} (${index + 1}/${assignees.length})` : taskData.title,
          description: taskData.description + (assignees.length > 1 ? ` [Group task ${index + 1}/${assignees.length}]` : ''),
          assigned_to: assigneeId,
          created_by: user.id,
          status: 'pending',
          priority: taskData.priority,
          deadline: taskData.deadline,
          completion_notes: undefined,
          attachments: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        tasksToCreate.push(mockTask);
      });

      // Store all tasks in globalTempProjects and save to persistent storage
      const projectIndex = globalTempProjects.findIndex(p => p.id === taskData.project_id);
      if (projectIndex !== -1) {
        if (!globalTempProjects[projectIndex].tasks) {
          globalTempProjects[projectIndex].tasks = [];
        }
        globalTempProjects[projectIndex].tasks!.push(...tasksToCreate);
      } else {
        // If project doesn't exist in temp storage, create it
        globalTempProjects.push({
          id: taskData.project_id,
          title: 'Temporary Project',
          description: 'Project for task assignment',
          status: 'in_progress',
          priority: 'medium',
          client_id: '44444444-4444-4444-4444-444444444444',
          pm_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          completed_by_pm: false,
          completed_by_client: false,
          tasks: tasksToCreate
        });
      }

      // Save to persistent storage
      saveToStorage(STORAGE_KEYS.PROJECTS, globalTempProjects);

      // Also save standalone tasks for additional persistence
      const currentTasks = loadFromStorage<Task[]>(STORAGE_KEYS.TASKS, []);
      // Filter out any duplicate tasks by ID to prevent duplicates
      const existingTaskIds = new Set(currentTasks.map(t => t.id));
      const newTasks = tasksToCreate.filter(t => !existingTaskIds.has(t.id));
      saveToStorage(STORAGE_KEYS.TASKS, [...newTasks, ...currentTasks]);

      // Add to current tasks state, preventing duplicates
      setTasks(prev => {
        const existingIds = new Set(prev.map(t => t.id));
        const newTasks = tasksToCreate.filter(t => !existingIds.has(t.id));
        return [...newTasks, ...prev];
      });
      
      // Update activities for task creation
      const assigneeCount = assignees.length;
      const activityMessage = assigneeCount > 1 
        ? `Task: ${taskData.title} (assigned to ${assigneeCount} members)` 
        : `Task: ${taskData.title}`;
      
      setActivities(prev => [{
        id: `activity-${Date.now()}`,
        user: user.name,
        action: 'created',
        target: activityMessage,
        time: 'Just now',
        type: 'assignment'
      }, ...prev]);

      return tasksToCreate[0]; // Return the first task for compatibility
    }

    try {
      const { data, error } = await dbFunctions.createTask({
        ...taskData,
        created_by: user.id,
        status: 'pending'
      });

      if (error) throw error;

      await dbFunctions.logActivity({
        project_id: taskData.project_id,
        user_id: user.id,
        action: 'task_created',
        description: `Task "${taskData.title}" assigned to team member`
      });

      await loadTasks();
      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create task');
    }
  };

  const updateTaskStatus = async (
    taskId: string,
    status: Task['status'],
    notes?: string,
    attachments?: string[]
  ) => {
    if (!user) throw new Error('User not authenticated');

    // Check if this is a temporary demo user or temporary task
    const isTemporaryTask = taskId.startsWith('temp-');
    const isTemporaryUser = TEMP_DEMO_USER_IDS.includes(user.id);

    if (isTemporaryUser || isTemporaryTask) {
      // For temporary demo users/tasks, update task in memory and persistent storage
      const updatedTasks = tasks.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status, 
              completion_notes: notes,
              attachments: attachments,
              updated_at: new Date().toISOString() 
            }
          : task
      );
      
      // Update tasks in projects storage as well
      globalTempProjects = globalTempProjects.map(project => ({
        ...project,
        tasks: project.tasks?.map(task => 
          task.id === taskId 
            ? { 
                ...task, 
                status, 
                completion_notes: notes,
                attachments: attachments,
                updated_at: new Date().toISOString() 
              }
            : task
        )
      }));
      
      // Save to persistent storage
      saveToStorage(STORAGE_KEYS.PROJECTS, globalTempProjects);
      saveToStorage(STORAGE_KEYS.TASKS, updatedTasks);
      
      setTasks(updatedTasks);
      
      // Update activities
      setActivities(prev => [{
        id: `activity-${Date.now()}`,
        user: user.name,
        action: 'task_updated',
        target: `Task status updated to ${status}`,
        time: 'Just now',
        type: 'progress'
      }, ...prev]);

      return { id: taskId, status };
    }

    try {
      const updates: Partial<Task> = { status };
      if (notes) updates.completion_notes = notes;
      if (attachments) updates.attachments = attachments;

      const { data, error } = await dbFunctions.updateTask(taskId, updates);
      if (error) throw error;

      await loadTasks();
      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update task');
    }
  };

  const markProjectComplete = async (projectId: string, role: 'pm' | 'client') => {
    if (!user) throw new Error('User not authenticated');

    try {
      const updates: Partial<Project> = {};
      if (role === 'pm') updates.completed_by_pm = true;
      if (role === 'client') updates.completed_by_client = true;

      const { data, error } = await dbFunctions.updateProject(projectId, updates);
      if (error) throw error;

      // Check if both PM and client have marked as complete
      const project = projects.find(p => p.id === projectId);
      if (project) {
        const bothCompleted = (role === 'pm' ? true : project.completed_by_pm) && 
                             (role === 'client' ? true : project.completed_by_client);
        
        if (bothCompleted) {
          await dbFunctions.updateProject(projectId, { status: 'completed' });
        }
      }

      await loadProjects();
      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to mark project complete');
    }
  };

  // Development utility to clear all persistent data
  const clearAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    globalTempProjects = getInitialProjects();
    setProjects([]);
    setTasks([]);
    setActivities([]);
    console.log('All persistent data cleared!');
  };

  // Development utility to remove duplicate tasks
  const removeDuplicateTasks = () => {
    // Clean standalone tasks
    const currentTasks = loadFromStorage<Task[]>(STORAGE_KEYS.TASKS, []);
    const uniqueTasks = currentTasks.filter((task, index, array) => 
      array.findIndex(t => t.id === task.id) === index
    );
    saveToStorage(STORAGE_KEYS.TASKS, uniqueTasks);
    
    // Clean project tasks as well
    const currentProjects = loadFromStorage<ProjectWithTasks[]>(STORAGE_KEYS.PROJECTS, []);
    const cleanedProjects = currentProjects.map(project => ({
      ...project,
      tasks: project.tasks ? project.tasks.filter((task, index, array) => 
        array.findIndex(t => t.id === task.id) === index
      ) : []
    }));
    saveToStorage(STORAGE_KEYS.PROJECTS, cleanedProjects);
    globalTempProjects = cleanedProjects;
    
    // Reload tasks to reflect changes
    loadTasks();
    
    console.log(`Removed ${currentTasks.length - uniqueTasks.length} duplicate standalone tasks`);
    console.log('Cleaned project tasks for duplicates');
  };

  return {
    projects,
    tasks,
    activities,
    loading,
    error,
    createProject,
    updateProjectStatus,
    assignProjectToPM,
    createTask,
    updateTaskStatus,
    markProjectComplete,
    refresh: loadProjects,
    clearAllData, // Development utility
    removeDuplicateTasks // Development utility
  };
};