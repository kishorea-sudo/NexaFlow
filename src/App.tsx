import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useProjects, ProjectWithTasks } from './hooks/useProjects';
import LoginForm from './components/Auth/LoginForm';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import StatsCards from './components/Dashboard/StatsCards';
import RecentActivity from './components/Dashboard/RecentActivity';
import ProjectCard from './components/Projects/ProjectCard';
import ProjectDetail from './components/Projects/ProjectDetail';
import ReportGenerator from './components/AI/ReportGenerator';
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard';
import { AIReport } from './types';
import { FileText, Zap, CheckSquare } from 'lucide-react';

function AppContent() {
  const { user, isLoading } = useAuth();
  const { 
    projects, 
    tasks, 
    activities, 
    loading: projectsLoading, 
    error: projectsError,
    createProject,
    updateProjectStatus,
    assignProjectToPM,
    createTask,
    updateTaskStatus,
    markProjectComplete,
    refresh: refreshProjects
  } = useProjects();
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState<ProjectWithTasks | null>(null);
  const [generatedReports, setGeneratedReports] = useState<AIReport[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'project' | 'task' | 'client' | 'team' | 'message' | 'approve' | 'reject' | 'assign' | 'complete' | null>(null);
  const [selectedProjectForAction, setSelectedProjectForAction] = useState<string | null>(null);
  const [actionData, setActionData] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Array<{id: number, type: string, message: string, time: string}>>([]);
  const [formData, setFormData] = useState<any>({
    quickAssignees: [], // For multiple assignee selection
    assignmentMode: 'single' // 'single' or 'multiple'
  });
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'in_progress' | 'team_completed' | 'completed'>('all');
  const [feedbackModal, setFeedbackModal] = useState<{isOpen: boolean, task: any, type: 'approve' | 'reject'}>({isOpen: false, task: null, type: 'approve'});
  const [feedbackData, setFeedbackData] = useState<{comment: string, ratings: {quality: number, timeline: number, communication: number}, attachments: string[]}>({comment: '', ratings: {quality: 5, timeline: 5, communication: 5}, attachments: []});
  const [loading, setLoading] = useState(false);

  // Set role-specific notifications when user changes
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    
    // Role-specific notifications
    switch (user.role) {
      case 'client':
        setNotifications([
          { id: 1, type: 'info', message: 'Project approved by admin', time: '2 minutes ago' },
          { id: 2, type: 'success', message: 'Project ready for your review', time: '1 hour ago' },
          { id: 3, type: 'warning', message: 'Payment reminder for completed project', time: '3 hours ago' }
        ]);
        break;
      case 'admin':
        setNotifications([
          { id: 1, type: 'info', message: 'New project pending approval', time: '2 minutes ago' },
          { id: 2, type: 'warning', message: 'Multiple projects awaiting review', time: '1 hour ago' },
          { id: 3, type: 'success', message: 'Project approved successfully', time: '3 hours ago' }
        ]);
        break;
      case 'pm':
        setNotifications([
          { id: 1, type: 'info', message: 'New project assigned', time: '2 minutes ago' },
          { id: 2, type: 'warning', message: 'Project deadline approaching', time: '1 hour ago' },
          { id: 3, type: 'success', message: 'Team completed all tasks', time: '3 hours ago' }
        ]);
        break;
      case 'team_member':
        setNotifications([
          { id: 1, type: 'info', message: 'New task assigned to you', time: '2 minutes ago' },
          { id: 2, type: 'warning', message: 'Task deadline approaching', time: '1 hour ago' },
          { id: 3, type: 'success', message: 'Task approved by PM', time: '3 hours ago' }
        ]);
        break;
      default:
        setNotifications([]);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <img 
            src="/logo.png" 
            alt="NexaFlow Logo" 
            className="w-16 h-16 object-contain mx-auto mb-4 animate-pulse"
          />
          <p className="text-gray-600">Loading NexaFlow...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const handleReportGenerated = (report: AIReport) => {
    setGeneratedReports(prev => [report, ...prev]);
  };

  const handleCreateNew = (type: 'project' | 'task' | 'client' | 'team') => {
    setModalType(type);
    setFormData({});
    setShowModal(true);
  };

  const handleProjectAction = (projectId: string, action: 'approve' | 'reject' | 'assign' | 'complete') => {
    setSelectedProjectForAction(projectId);
    setModalType(action);
    setActionData({});
    setShowModal(true);
  };

  const handleApproveProject = async () => {
    if (!selectedProjectForAction) return;
    setLoading(true);
    try {
      await updateProjectStatus(selectedProjectForAction, 'approved', actionData.notes);
      setNotifications(prev => [{
        id: Date.now(),
        type: 'success',
        message: 'Project approved successfully!',
        time: 'Just now'
      }, ...prev]);
      setShowModal(false);
    } catch (error: any) {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'error',
        message: error.message,
        time: 'Just now'
      }, ...prev]);
    }
    setLoading(false);
  };

  const handleRejectProject = async () => {
    if (!selectedProjectForAction) return;
    setLoading(true);
    try {
      await updateProjectStatus(selectedProjectForAction, 'rejected', actionData.reason);
      setNotifications(prev => [{
        id: Date.now(),
        type: 'warning',
        message: 'Project rejected',
        time: 'Just now'
      }, ...prev]);
      setShowModal(false);
    } catch (error: any) {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'error',
        message: error.message,
        time: 'Just now'
      }, ...prev]);
    }
    setLoading(false);
  };

  const handleAssignToPM = async () => {
    if (!selectedProjectForAction || !actionData.pmId) return;
    setLoading(true);
    try {
      await assignProjectToPM(selectedProjectForAction, actionData.pmId);
      setNotifications(prev => [{
        id: Date.now(),
        type: 'success',
        message: 'Project assigned to PM successfully!',
        time: 'Just now'
      }, ...prev]);
      setShowModal(false);
    } catch (error: any) {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'error',
        message: error.message,
        time: 'Just now'
      }, ...prev]);
    }
    setLoading(false);
  };

  const handleMarkComplete = async () => {
    if (!selectedProjectForAction || !user) return;
    setLoading(true);
    try {
      await markProjectComplete(selectedProjectForAction, user.role as 'pm' | 'client');
      setNotifications(prev => [{
        id: Date.now(),
        type: 'success',
        message: 'Project marked as complete!',
        time: 'Just now'
      }, ...prev]);
      setShowModal(false);
    } catch (error: any) {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'error',
        message: error.message,
        time: 'Just now'
      }, ...prev]);
    }
    setLoading(false);
  };

  const handleSendMessage = () => {
    setModalType('message');
    setShowModal(true);
  };

  const handleSubmitForm = async () => {
    if (!modalType) return;
    
    setLoading(true);
    try {
      switch (modalType) {
        case 'project':
          // Validate budget if provided
          let budget = undefined;
          if (formData.budget) {
            const parsedBudget = parseFloat(formData.budget);
            if (isNaN(parsedBudget) || parsedBudget < 0) {
              throw new Error('Budget must be a valid positive number');
            }
            budget = parsedBudget;
          }
          
          await createProject({
            title: formData.projectName,
            description: formData.description,
            priority: formData.priority || 'medium',
            deadline: formData.deadline,
            budget: budget
          });
          setNotifications(prev => [{
            id: Date.now(),
            type: 'success',
            message: 'Project submitted for admin review!',
            time: 'Just now'
          }, ...prev]);
          break;
          
        case 'task':
          if (formData.projectId && formData.assignee) {
            await createTask({
              project_id: formData.projectId,
              title: formData.taskName,
              description: formData.description,
              assigned_to: formData.assignee,
              priority: formData.priority || 'medium',
              deadline: formData.deadline
            });
            setNotifications(prev => [{
              id: Date.now(),
              type: 'success',
              message: 'Task created and assigned successfully!',
              time: 'Just now'
            }, ...prev]);
          }
          break;
          
        case 'approve':
          await handleApproveProject();
          return;
          
        case 'reject':
          await handleRejectProject();
          return;
          
        case 'assign':
          await handleAssignToPM();
          return;
          
        case 'complete':
          await handleMarkComplete();
          return;
          
        default:
          // Handle other form types (client, team, message)
          setNotifications(prev => [{
            id: Date.now(),
            type: 'success',
            message: `${modalType?.charAt(0).toUpperCase()}${modalType?.slice(1)} ${modalType === 'message' ? 'sent' : 'created'} successfully!`,
            time: 'Just now'
          }, ...prev]);
      }
      
      setShowModal(false);
      setFormData({});
    } catch (error: any) {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'error',
        message: error.message || 'An error occurred',
        time: 'Just now'
      }, ...prev]);
    }
    setLoading(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search logic here
  };

  const handleNotificationAction = (id: number, action: 'read' | 'delete') => {
    if (action === 'delete') {
      setNotifications(prev => prev.filter(n => n.id !== id));
    } else {
      // Mark as read logic
    }
  };

  const handleSettingsSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setNotifications(prev => [{
        id: Date.now(),
        type: 'success',
        message: 'Settings saved successfully!',
        time: 'Just now'
      }, ...prev]);
    }, 1000);
  };

  const handleExportData = () => {
    // Simulate data export
    const data = JSON.stringify({ projects, activities }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexaflow-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = {
    activeProjects: projects.filter(p => p.status === 'in_progress').length,
    pendingApprovals: projects.filter(p => 
      p.status === 'pending' || p.status === 'admin_review' || p.status === 'pm_review' || p.status === 'client_review'
    ).length,
    completedThisMonth: projects.filter(p => p.status === 'completed').length,
    overdueItems: projects.filter(p => 
      p.deadline && new Date(p.deadline) < new Date() && p.status !== 'completed'
    ).length,
  };

  const renderContent = () => {
    if (selectedProject && activeView === 'projects') {
      return (
        <ProjectDetail
          project={selectedProject}
          onBack={() => setSelectedProject(null)}
        />
      );
    }

    switch (activeView) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {user.name}!
              </h2>
              <p className="text-gray-600">
                {user.role === 'admin' 
                  ? 'Manage client requests and assign them to Project Managers.' 
                  : user.role === 'pm' 
                  ? 'Coordinate between clients and team members for project success.'
                  : user.role === 'team_member'
                  ? 'Focus on your assigned tasks and report progress to your PM.'
                  : 'Submit requests and communicate with your assigned Project Manager.'}
              </p>
            </div>
            
            <StatsCards stats={stats} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  {user.role === 'admin' ? 'Active Projects (All PMs)' : 
                   user.role === 'pm' ? 'My Assigned Projects' : 
                   user.role === 'team_member' ? 'Projects I Work On' :
                   'My Projects with PM'}
                </h3>
                <div className="space-y-4">
                  {projects.slice(0, 3).map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onSelect={setSelectedProject}
                    />
                  ))}
                </div>
              </div>
              
              <RecentActivity activities={activities} />
            </div>

            {(user.role === 'admin' || user.role === 'pm') && (
              <ReportGenerator
                projectId={projects[0]?.id || ''}
                onGenerate={handleReportGenerated}
              />
            )}
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.role === 'admin' ? 'All Projects' : 
                   user.role === 'pm' ? 'My Projects' : 
                   user.role === 'client' ? 'My Requests' : 
                   user.role === 'team_member' ? 'My Tasks' : 'Projects'}
                </h2>
                <p className="text-gray-600">
                  {user.role === 'admin' ? 'Review and manage all client project requests' :
                   user.role === 'pm' ? 'Manage your assigned projects and tasks' :
                   user.role === 'client' ? 'Track your submitted project requests' :
                   user.role === 'team_member' ? 'View and manage your assigned tasks' :
                   'View your assigned project tasks'}
                </p>
              </div>
              {user.role === 'client' && (
                <button 
                  onClick={() => handleCreateNew('project')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors btn-interactive"
                >
                  Submit New Request
                </button>
              )}
            </div>

            {/* Team Member Tasks View */}
            {user.role === 'team_member' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Your Assigned Tasks</h3>
                <div className="grid grid-cols-1 gap-4">
                  {tasks.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                      <p className="text-gray-500">No tasks assigned yet</p>
                      <p className="text-sm text-gray-400 mt-1">Tasks assigned by your Project Manager will appear here</p>
                    </div>
                  ) : (
                    tasks.map((task) => (
                      <div key={task.id} className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900">{task.title}</h4>
                            <p className="text-gray-600 mt-1">{task.description}</p>
                            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                task.priority === 'critical' ? 'bg-red-100 text-red-800' :
                                task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {task.priority}
                              </span>
                              {task.deadline && (
                                <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                              )}
                              <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2 ml-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              task.status === 'completed' ? 'bg-green-100 text-green-800' :
                              task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {task.status.replace('_', ' ')}
                            </span>
                            {task.status !== 'completed' && (
                              <div className="flex flex-col space-y-1">
                                {task.status === 'pending' && (
                                  <button
                                    onClick={() => updateTaskStatus(task.id, 'in_progress')}
                                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                                  >
                                    Start Task
                                  </button>
                                )}
                                {task.status === 'in_progress' && (
                                  <button
                                    onClick={() => updateTaskStatus(task.id, 'completed')}
                                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                  >
                                    Complete
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            
            {/* Admin Project Review Section */}
            {user.role === 'admin' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Pending Reviews</h3>
                <div className="grid grid-cols-1 gap-4">
                  {projects.filter(p => p.status === 'pending').map((project) => (
                    <div key={project.id} className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900">{project.title}</h4>
                          <p className="text-gray-600 mt-1">{project.description}</p>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <span>Priority: {project.priority}</span>
                            {project.budget && <span>Budget: ${project.budget.toLocaleString()}</span>}
                            {project.deadline && <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>}
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleProjectAction(project.id, 'approve')}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 btn-interactive"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleProjectAction(project.id, 'reject')}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 btn-interactive"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleProjectAction(project.id, 'assign')}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 btn-interactive"
                          >
                            Assign to PM
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Processed Projects Section */}
            {user.role === 'admin' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Recently Processed</h3>
                <div className="grid grid-cols-1 gap-4">
                  {projects.filter(p => p.status === 'approved' || p.status === 'rejected').map((project) => (
                    <div key={project.id} className={`rounded-lg border p-6 ${
                      project.status === 'approved' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900">{project.title}</h4>
                          <p className="text-gray-600 mt-1">{project.description}</p>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <span>Priority: {project.priority}</span>
                            {project.budget && <span>Budget: ${project.budget.toLocaleString()}</span>}
                            {project.deadline && <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>}
                          </div>
                          {project.admin_notes && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-800"><strong>Admin Notes:</strong> {project.admin_notes}</p>
                            </div>
                          )}
                          {project.rejection_reason && (
                            <div className="mt-3 p-3 bg-red-100 rounded-lg">
                              <p className="text-sm text-red-800"><strong>Rejection Reason:</strong> {project.rejection_reason}</p>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                            project.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {project.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                          </span>
                          {project.status === 'approved' && (
                            <div className="mt-2">
                              <button
                                onClick={() => handleProjectAction(project.id, 'assign')}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 btn-interactive"
                              >
                                Assign to PM
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {projects.filter(p => p.status === 'approved' || p.status === 'rejected').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No processed projects yet. Approved or rejected projects will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Admin Completed Projects Section */}
            {user.role === 'admin' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Completed Projects</h3>
                <div className="grid grid-cols-1 gap-4">
                  {projects.filter(p => p.status === 'completed').map((project) => (
                    <div key={project.id} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900">{project.title}</h4>
                          <p className="text-gray-600 mt-1">{project.description}</p>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <span>Priority: {project.priority}</span>
                            {project.budget && <span>Budget: ${project.budget.toLocaleString()}</span>}
                            {project.deadline && <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>}
                            <span>Completed: {new Date(project.updated_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            {project.pm_id && (
                              <span className="text-blue-600">
                                PM: {project.pm_id === '22222222-2222-2222-2222-222222222222' ? 'Michael Johnson' : 
                                     project.pm_id === '22222222-2222-2222-2222-222222222223' ? 'Emily Davis' : 'Unknown PM'}
                              </span>
                            )}
                            {project.client_id && (
                              <span className="text-green-600">
                                Client ID: {project.client_id.substring(0, 8)}...
                              </span>
                            )}
                          </div>
                          <div className="mt-3 p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-800"><strong>Status:</strong> Project has been successfully completed and delivered.</p>
                          </div>
                        </div>
                        <div className="ml-4">
                          <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                            Completed
                          </span>
                          <div className="mt-2 text-xs text-gray-500">
                            {project.updated_at && new Date(project.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {projects.filter(p => p.status === 'completed').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No completed projects yet. Successfully finished projects will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* PM Task Review Section */}
            {user.role === 'pm' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Task Reviews</h3>
                  <p className="text-gray-600 mb-4">Review and approve tasks submitted by your team members</p>
                  
                  {/* Tasks awaiting PM review */}
                  <div className="space-y-3">
                    {tasks.filter(task => task.status === 'team_completed').length > 0 ? (
                      tasks.filter(task => task.status === 'team_completed').map(task => {
                        const getAssigneeName = (assigneeId: string | string[]) => {
                          const demoUsers = [
                            { id: '33333333-3333-3333-3333-333333333333', name: 'Alex Chen', designation: 'UI/UX Designer' },
                            { id: '33333333-3333-3333-3333-333333333334', name: 'David Rodriguez', designation: 'Frontend Developer' },
                            { id: '33333333-3333-3333-3333-333333333335', name: 'Lisa Wang', designation: 'Backend Developer' },
                            { id: '33333333-3333-3333-3333-333333333336', name: 'Robert Thompson', designation: 'QA Engineer' }
                          ];
                          
                          if (Array.isArray(assigneeId)) {
                            const names = assigneeId.map(id => demoUsers.find(u => u.id === id)?.name || 'Unknown').filter(Boolean);
                            return names.length > 2 ? `${names.slice(0, 2).join(', ')} +${names.length - 2} more` : names.join(', ');
                          } else {
                            const user = demoUsers.find(u => u.id === assigneeId);
                            return user ? `${user.name} (${user.designation})` : 'Unknown User';
                          }
                        };
                        
                        return (
                          <div key={task.id} className="p-4 border border-yellow-300 bg-yellow-50 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{task.title}</h4>
                                <p className="text-sm text-gray-600">Completed by: {getAssigneeName(task.assigned_to)}</p>
                                <p className="text-sm text-gray-600">Priority: {task.priority}</p>
                                {task.description && (
                                  <p className="text-sm text-gray-700 mt-1">{task.description}</p>
                                )}
                                {task.completion_notes && (
                                  <p className="text-xs text-gray-600 mt-1 italic bg-gray-100 p-2 rounded">Team Note: {task.completion_notes}</p>
                                )}
                              </div>
                              <div className="flex space-x-2 ml-4">
                                <button
                                  onClick={() => updateTaskStatus(task.id, 'pm_approved', 'Approved by Project Manager, ready for client review')}
                                  className="text-xs bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700"
                                >
                                  Approve & Send to Client
                                </button>
                                <button
                                  onClick={() => updateTaskStatus(task.id, 'in_progress', 'Returned by PM for revision')}
                                  className="text-xs bg-orange-600 text-white px-3 py-1 rounded-full hover:bg-orange-700"
                                >
                                  Request Changes
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-sm">No tasks awaiting your review</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Tasks approved by PM, awaiting client review */}
                  {tasks.filter(task => task.status === 'pm_approved').length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-900 mb-3">Awaiting Client Review</h4>
                      <div className="space-y-2">
                        {tasks.filter(task => task.status === 'pm_approved').map(task => (
                          <div key={task.id} className="p-3 border border-purple-300 bg-purple-50 rounded-lg">
                            <div className="flex justify-between items-center">
                              <div>
                                <h5 className="text-sm font-medium text-gray-900">{task.title}</h5>
                                <p className="text-xs text-gray-600">Sent to client for final approval</p>
                              </div>
                              <span className="text-xs text-purple-600 font-medium">📋 Client Review</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Client Task Review Section */}
            {user.role === 'client' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Work for Your Review</h3>
                  <p className="text-gray-600 mb-4">Review and approve completed work from your project team</p>
                  
                  {/* Tasks awaiting client review */}
                  <div className="space-y-3">
                    {tasks.filter(task => task.status === 'pm_approved').length > 0 ? (
                      tasks.filter(task => task.status === 'pm_approved').map(task => {
                        return (
                          <div key={task.id} className="p-4 border border-blue-300 bg-blue-50 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{task.title}</h4>
                                <p className="text-sm text-gray-600">Priority: {task.priority}</p>
                                {task.description && (
                                  <p className="text-sm text-gray-700 mt-1">{task.description}</p>
                                )}
                                <p className="text-xs text-green-600 mt-1 font-medium">✅ Approved by Project Manager</p>
                              </div>
                              <div className="flex space-x-2 ml-4">
                                <button
                                  onClick={() => setFeedbackModal({isOpen: true, task: task, type: 'approve'})}
                                  className="text-xs bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700"
                                >
                                  Approve & Complete
                                </button>
                                <button
                                  onClick={() => setFeedbackModal({isOpen: true, task: task, type: 'reject'})}
                                  className="text-xs bg-orange-600 text-white px-3 py-1 rounded-full hover:bg-orange-700"
                                >
                                  Request Changes
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-sm">No work awaiting your review</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Projects grid - hidden for team members as they see tasks instead */}
            {user.role !== 'team_member' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.filter(p => {
                  // Admin sees all projects
                  if (user.role === 'admin') return true;
                  // PM sees all non-pending projects (including completed)
                  if (user.role === 'pm') return p.status !== 'pending';
                  // Client sees non-pending projects but NOT completed ones
                  if (user.role === 'client') return p.status !== 'pending' && p.status !== 'completed';
                  // Default case
                  return p.status !== 'pending';
                }).map((project) => (
                <div key={project.id} className="relative">
                  <ProjectCard
                    project={project}
                    onSelect={(project) => {
                      setSelectedProject(project);
                    }}
                  />
                  {/* Project Status Actions */}
                  {((user.role === 'pm' && project.pm_id === user.id) || 
                    (user.role === 'client' && project.client_id === user.id)) && 
                    project.status === 'client_review' && (
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => handleProjectAction(project.id, 'complete')}
                        className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      >
                        Mark Complete
                      </button>
                    </div>
                  )}
                </div>
              ))}
              </div>
            )}
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {user.role === 'admin' ? 'System Analytics' : 'Project Analytics'}
              </h2>
              <p className="text-gray-600">
                {user.role === 'admin' 
                  ? 'Platform-wide performance metrics and insights' 
                  : 'Analytics and insights for your managed projects'}
              </p>
            </div>
            <AnalyticsDashboard />
          </div>
        );

      case 'documents':
      case 'task-documents': // Team member specific
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {user.role === 'team_member' ? 'Task Documents' : 'Project Documents'}
              </h2>
              <p className="text-gray-600">
                {user.role === 'pm' ? 'All documents related to your managed projects' : 
                 user.role === 'team_member' ? 'Documents and resources for your assigned tasks' :
                 'Project documents and deliverables'}
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {user.role === 'pm' && (
                <>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Project Brief</h3>
                        <p className="text-sm text-gray-600">Brand Redesign Project</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-4">Complete project requirements and client specifications</p>
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      View Document
                    </button>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <FileText className="w-8 h-8 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Client Feedback</h3>
                        <p className="text-sm text-gray-600">TechCorp Review Notes</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-4">Latest client feedback on logo concepts and revisions</p>
                    <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      View Feedback
                    </button>
                  </div>
                </>
              )}
              {user.role === 'team_member' && (
                <>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <FileText className="w-8 h-8 text-purple-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Task Brief</h3>
                        <p className="text-sm text-gray-600">Logo Design Task</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-4">Detailed requirements for logo concept creation</p>
                    <button 
                      onClick={() => {
                        setNotifications(prev => [{
                          id: Date.now(),
                          type: 'info',
                          message: 'Opening project brief...',
                          time: 'Just now'
                        }, ...prev]);
                      }}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      View Brief
                    </button>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <FileText className="w-8 h-8 text-orange-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Reference Files</h3>
                        <p className="text-sm text-gray-600">Design Assets</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-4">Brand guidelines and reference materials</p>
                    <button 
                      onClick={handleExportData}
                      className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                      Download Assets
                    </button>
                  </div>
                </>
              )}
              {user.role === 'client' && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Project Deliverables</h3>
                      <p className="text-sm text-gray-600">Brand Redesign</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">Completed deliverables and project files</p>
                  <button 
                    onClick={() => setActiveView('documents')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    View Files
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Team Management</h2>
                <p className="text-gray-600">Manage team members, roles, and permissions</p>
              </div>
              <button 
                onClick={() => handleCreateNew('team')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add New Member
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">MJ</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Michael Johnson</h3>
                    <p className="text-sm text-gray-600">Project Manager</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Projects:</span>
                    <span className="font-medium">3 Active</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Team Size:</span>
                    <span className="font-medium">4 Members</span>
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  Manage Projects
                </button>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold">ED</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Emily Davis</h3>
                    <p className="text-sm text-gray-600">Project Manager</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Projects:</span>
                    <span className="font-medium">2 Active</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Team Size:</span>
                    <span className="font-medium">3 Members</span>
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  Manage Projects
                </button>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">AC</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Alex Chen</h3>
                    <p className="text-sm text-gray-600">UI/UX Designer</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tasks:</span>
                    <span className="font-medium">3 Active</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Manager:</span>
                    <span className="font-medium">Michael J.</span>
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  View Profile
                </button>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-semibold">DR</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">David Rodriguez</h3>
                    <p className="text-sm text-gray-600">Frontend Developer</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tasks:</span>
                    <span className="font-medium">4 Active</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Manager:</span>
                    <span className="font-medium">Emily D.</span>
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  View Profile
                </button>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                    <span className="text-pink-600 font-semibold">LW</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Lisa Wang</h3>
                    <p className="text-sm text-gray-600">Backend Developer</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tasks:</span>
                    <span className="font-medium">2 Active</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Manager:</span>
                    <span className="font-medium">Michael J.</span>
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  View Profile
                </button>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <span className="text-teal-600 font-semibold">RT</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Robert Thompson</h3>
                    <p className="text-sm text-gray-600">QA Engineer</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tasks:</span>
                    <span className="font-medium">3 Active</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Manager:</span>
                    <span className="font-medium">Emily D.</span>
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  View Profile
                </button>
              </div>
            </div>
          </div>
        );

      case 'automations':
        return (
          <div className="text-center py-12">
            <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Automation Rules</h3>
            <p className="text-gray-600">Create and manage workflow automations</p>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h2>
              <p className="text-gray-600">
                {user.role === 'admin' ? 'System alerts and client request notifications' : 
                 user.role === 'pm' ? 'Client updates, team progress, and project alerts' : 
                 user.role === 'team_member' ? 'Task assignments and deadline reminders' :
                 'Project updates and PM communications'}
              </p>
            </div>
            <div className="space-y-4">
              {user.role === 'admin' && (
                <>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">New Urgent Client Request</h4>
                        <p className="text-sm text-gray-600">TechCorp submitted a high-priority brand redesign request</p>
                        <span className="text-xs text-gray-500">5 minutes ago</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Project Assignment Completed</h4>
                        <p className="text-sm text-gray-600">Website redesign project assigned to Sarah (PM)</p>
                        <span className="text-xs text-gray-500">2 hours ago</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {user.role === 'pm' && (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Task Completed</h4>
                        <p className="text-sm text-gray-600">Alex completed the logo design concepts</p>
                        <span className="text-xs text-gray-500">30 minutes ago</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Client Feedback Received</h4>
                        <p className="text-sm text-gray-600">TechCorp provided feedback on the initial designs</p>
                        <span className="text-xs text-gray-500">1 hour ago</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {user.role === 'team_member' && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">New Task Assigned</h4>
                        <p className="text-sm text-gray-600">Sarah assigned you: Create color palette variations</p>
                        <span className="text-xs text-gray-500">15 minutes ago</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Deadline Reminder</h4>
                        <p className="text-sm text-gray-600">Logo revisions due tomorrow at 5 PM</p>
                        <span className="text-xs text-gray-500">3 hours ago</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {user.role === 'client' && (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Project Update</h4>
                        <p className="text-sm text-gray-600">Sarah (PM): Logo concepts are ready for your review</p>
                        <span className="text-xs text-gray-500">1 hour ago</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">Request Status Update</h4>
                        <p className="text-sm text-gray-600">Your brand redesign request has been assigned to a PM</p>
                        <span className="text-xs text-gray-500">2 days ago</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {user.role === 'admin' ? 'System Settings' : 
                 user.role === 'pm' ? 'Profile Settings' : 
                 'Account Settings'}
              </h2>
              <p className="text-gray-600">
                {user.role === 'admin' ? 'Configure system-wide settings and platform preferences' : 
                 user.role === 'pm' ? 'Manage your profile and project management preferences' : 
                 'Update your account information and personal preferences'}
              </p>
            </div>

            {/* Admin System Settings */}
            {user.role === 'admin' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Projects per PM</label>
                      <input type="number" className="w-full p-3 border border-gray-300 rounded-lg input-enhanced" defaultValue="10" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Auto-Assignment Rules</label>
                      <select className="w-full p-3 border border-gray-300 rounded-lg input-enhanced">
                        <option>Round Robin</option>
                        <option>Workload Based</option>
                        <option>Manual Only</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <label className="text-sm text-gray-700">Enable automatic client notifications</label>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Security & Access</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                      <input type="number" className="w-full p-3 border border-gray-300 rounded-lg input-enhanced" defaultValue="60" />
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <label className="text-sm text-gray-700">Require 2FA for all users</label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded" />
                      <label className="text-sm text-gray-700">Enable audit logging</label>
                    </div>
                    <button 
                      onClick={() => {
                        if (confirm('Are you sure you want to reset all user sessions? This will log out all users.')) {
                          setNotifications(prev => [{
                            id: Date.now(),
                            type: 'warning',
                            message: 'All user sessions have been reset',
                            time: 'Just now'
                          }, ...prev]);
                        }
                      }}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Reset All User Sessions
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <label className="text-sm text-gray-700">Email alerts for urgent requests</label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <label className="text-sm text-gray-700">Daily system reports</label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded" />
                      <label className="text-sm text-gray-700">WhatsApp notifications</label>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup & Maintenance</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                      <select className="w-full p-3 border border-gray-300 rounded-lg input-enhanced">
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                      </select>
                    </div>
                    <button 
                      onClick={() => {
                        setLoading(true);
                        setTimeout(() => {
                          setLoading(false);
                          setNotifications(prev => [{
                            id: Date.now(),
                            type: 'success',
                            message: 'System backup completed successfully',
                            time: 'Just now'
                          }, ...prev]);
                        }, 2000);
                      }}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Run Backup Now
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Enable maintenance mode? This will temporarily disable user access.')) {
                          setNotifications(prev => [{
                            id: Date.now(),
                            type: 'info',
                            message: 'System maintenance mode enabled',
                            time: 'Just now'
                          }, ...prev]);
                        }
                      }}
                      className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      System Maintenance Mode
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PM Profile Settings */}
            {user.role === 'pm' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" defaultValue={user.name} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input type="email" className="w-full p-3 border border-gray-300 rounded-lg" defaultValue={user.email} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input type="tel" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="+1 (555) 123-4567" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                      <select className="w-full p-3 border border-gray-300 rounded-lg">
                        <option>Creative</option>
                        <option>Development</option>
                        <option>Marketing</option>
                        <option>Operations</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Preferences</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Project View</label>
                      <select className="w-full p-3 border border-gray-300 rounded-lg">
                        <option>List View</option>
                        <option>Card View</option>
                        <option>Timeline View</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Task Assignment Method</label>
                      <select className="w-full p-3 border border-gray-300 rounded-lg">
                        <option>Manual Assignment</option>
                        <option>Auto-Assign by Skill</option>
                        <option>Round Robin</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <label className="text-sm text-gray-700">Auto-notify clients on progress updates</label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded" />
                      <label className="text-sm text-gray-700">Require task time estimates</label>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <label className="text-sm text-gray-700">Email notifications for new assignments</label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <label className="text-sm text-gray-700">Team progress alerts</label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded" />
                      <label className="text-sm text-gray-700">Client message notifications</label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded" />
                      <label className="text-sm text-gray-700">WhatsApp notifications</label>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
                  <div className="space-y-4">
                    <button 
                      onClick={() => alert('Password change form would open here')}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Change Password
                    </button>
                    <button 
                      onClick={() => {
                        setNotifications(prev => [{
                          id: Date.now(),
                          type: 'success',
                          message: 'Two-factor authentication enabled successfully',
                          time: 'Just now'
                        }, ...prev]);
                      }}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Enable Two-Factor Auth
                    </button>
                    <button 
                      onClick={handleExportData}
                      className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Download My Data
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Team Member Account Settings */}
            {user.role === 'team_member' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" defaultValue={user.name} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input type="email" className="w-full p-3 border border-gray-300 rounded-lg" defaultValue={user.email} readOnly />
                      <p className="text-xs text-gray-500 mt-1">Contact admin to change email</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input type="tel" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="+1 (555) 123-4567" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                      <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="UI Design, Figma, Photoshop" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Preferences</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Work Hours</label>
                      <div className="grid grid-cols-2 gap-3">
                        <input type="time" className="p-3 border border-gray-300 rounded-lg" defaultValue="09:00" />
                        <input type="time" className="p-3 border border-gray-300 rounded-lg" defaultValue="17:00" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                      <select className="w-full p-3 border border-gray-300 rounded-lg">
                        <option>UTC-8 (PST)</option>
                        <option>UTC-5 (EST)</option>
                        <option>UTC+0 (GMT)</option>
                        <option>UTC+5:30 (IST)</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <label className="text-sm text-gray-700">Available for weekend work</label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded" />
                      <label className="text-sm text-gray-700">Prefer urgent task notifications</label>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <label className="text-sm text-gray-700">Task assignment notifications</label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <label className="text-sm text-gray-700">Deadline reminders (24h before)</label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded" />
                      <label className="text-sm text-gray-700">PM feedback notifications</label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded" />
                      <label className="text-sm text-gray-700">WhatsApp notifications</label>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Security</h3>
                  <div className="space-y-4">
                    <button 
                      onClick={() => alert('Password change form would open here')}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Change Password
                    </button>
                    <button 
                      onClick={() => {
                        setNotifications(prev => [{
                          id: Date.now(),
                          type: 'success',
                          message: 'Two-factor authentication enabled successfully',
                          time: 'Just now'
                        }, ...prev]);
                      }}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Enable Two-Factor Authentication
                    </button>
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-2">Current PM: Sarah Johnson</p>
                      <p className="text-xs text-gray-500">Contact admin to request PM change</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Client Account Settings */}
            {user.role === 'client' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" defaultValue={user.name} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input type="email" className="w-full p-3 border border-gray-300 rounded-lg" defaultValue={user.email} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                      <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="TechCorp Inc." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input type="tel" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="+1 (555) 123-4567" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication Preferences</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Contact Method</label>
                      <select className="w-full p-3 border border-gray-300 rounded-lg">
                        <option>Email</option>
                        <option>Phone</option>
                        <option>WhatsApp</option>
                        <option>In-App Only</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <label className="text-sm text-gray-700">Project update notifications</label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <label className="text-sm text-gray-700">Milestone completion alerts</label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded" />
                      <label className="text-sm text-gray-700">Weekly progress reports</label>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Review Approval Time</label>
                      <select className="w-full p-3 border border-gray-300 rounded-lg">
                        <option>24 hours</option>
                        <option>48 hours</option>
                        <option>1 week</option>
                        <option>Custom</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <label className="text-sm text-gray-700">Auto-approve minor revisions</label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" className="rounded" />
                      <label className="text-sm text-gray-700">Require detailed progress reports</label>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-1">Assigned PM: Sarah Johnson</p>
                      <p className="text-xs text-gray-500">Contact admin to request PM change</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Security</h3>
                  <div className="space-y-4">
                    <button 
                      onClick={() => alert('Password change form would open here')}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Change Password
                    </button>
                    <button 
                      onClick={() => {
                        setNotifications(prev => [{
                          id: Date.now(),
                          type: 'success',
                          message: 'Two-factor authentication enabled successfully',
                          time: 'Just now'
                        }, ...prev]);
                      }}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Enable Two-Factor Authentication
                    </button>
                    <button 
                      onClick={handleExportData}
                      className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Download Project Data
                    </button>
                    <div className="pt-4 border-t">
                      <button 
                        onClick={() => {
                          if (confirm('Are you sure you want to request account deletion? This action cannot be undone.')) {
                            alert('Account deletion request has been submitted. You will receive a confirmation email.');
                          }
                        }}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Request Account Deletion
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => setActiveView('dashboard')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSettingsSave}
                disabled={loading}
                className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 btn-interactive ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        );

      // Admin-specific menu items
      case 'client-requests':
        const pendingRequests = projects.filter(p => p.status === 'pending');
        
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Client Requests</h2>
              <p className="text-gray-600">Review and assign client requests to Project Managers</p>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading client requests...</p>
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
                <p className="text-gray-600">All client requests have been reviewed.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {pendingRequests.map((project) => (
                  <div key={project.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">{project.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        project.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        project.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        project.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {project.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Client: {project.client_id === '44444444-4444-4444-4444-444444444444' ? 'Michael Client' : 'Unknown Client'}</p>
                    <p className="text-sm text-gray-700 mb-4">{project.description}</p>
                    
                    <div className="text-xs text-gray-500 mb-4">
                      {project.budget && <p>Budget: ${project.budget.toLocaleString()}</p>}
                      {project.deadline && <p>Deadline: {new Date(project.deadline).toLocaleDateString()}</p>}
                      <p>Submitted: {new Date(project.created_at).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <button 
                        onClick={() => handleProjectAction(project.id, 'approve')}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Approve Request
                      </button>
                      <button 
                        onClick={() => handleProjectAction(project.id, 'assign')}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Assign to PM
                      </button>
                      <button 
                        onClick={() => handleProjectAction(project.id, 'reject')}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Reject Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      // PM-specific menu items  
      case 'team-tasks':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Team Tasks</h2>
              <p className="text-gray-600">Assign and track tasks for your team members</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Active Tasks</h3>
                <div className="space-y-3">
                  {tasks.filter(task => task.created_by === user?.id).length > 0 ? (
                    tasks
                      .filter(task => task.created_by === user?.id)
                      .map(task => {
                        // Get the assignee name from demo users
                        const getAssigneeName = (assigneeId: string | string[]) => {
                          const demoUsers = [
                            { id: '33333333-3333-3333-3333-333333333333', name: 'Alex Chen' },
                            { id: '33333333-3333-3333-3333-333333333334', name: 'David Rodriguez' },
                            { id: '33333333-3333-3333-3333-333333333335', name: 'Lisa Wang' },
                            { id: '33333333-3333-3333-3333-333333333336', name: 'Robert Thompson' },
                            { id: '22222222-2222-2222-2222-222222222222', name: 'Michael Johnson' },
                            { id: '22222222-2222-2222-2222-222222222223', name: 'Emily Davis' },
                            { id: '11111111-1111-1111-1111-111111111111', name: 'Demo Admin' },
                            { id: '44444444-4444-4444-4444-444444444444', name: 'Demo Client' }
                          ];
                          
                          if (Array.isArray(assigneeId)) {
                            const names = assigneeId.map(id => demoUsers.find(u => u.id === id)?.name || 'Unknown').filter(Boolean);
                            return names.length > 2 ? `${names.slice(0, 2).join(', ')} +${names.length - 2} more` : names.join(', ');
                          } else {
                            return demoUsers.find(u => u.id === assigneeId)?.name || 'Unknown User';
                          }
                        };

                        const getStatusColor = (status: string) => {
                          switch (status) {
                            case 'completed': return 'bg-green-50 text-green-800 border-green-200';
                            case 'in_progress': return 'bg-blue-50 text-blue-800 border-blue-200';
                            case 'pending': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
                            default: return 'bg-gray-50 text-gray-800 border-gray-200';
                          }
                        };

                        const getPriorityColor = (priority: string) => {
                          switch (priority) {
                            case 'critical': return 'border-l-red-500';
                            case 'high': return 'border-l-orange-500';
                            case 'medium': return 'border-l-blue-500';
                            case 'low': return 'border-l-green-500';
                            default: return 'border-l-gray-500';
                          }
                        };

                        return (
                          <div key={task.id} className={`p-3 border-l-4 rounded-lg bg-gray-50 ${getPriorityColor(task.priority)}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{task.title}</p>
                                <p className="text-sm text-gray-600">Assigned to: {getAssigneeName(task.assigned_to)}</p>
                                {task.description && (
                                  <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                                )}
                                <div className="flex items-center space-x-2 mt-2">
                                  <span className="text-xs text-gray-500">Priority: {task.priority}</span>
                                  {task.deadline && (
                                    <span className="text-xs text-gray-500">• Due: {new Date(task.deadline).toLocaleDateString()}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-2">
                                <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(task.status)}`}>
                                  {task.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                                <button
                                  onClick={() => updateTaskStatus(task.id, 
                                    task.status === 'pending' ? 'in_progress' : 
                                    task.status === 'in_progress' ? 'completed' : 'pending'
                                  )}
                                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                                >
                                  Update Status
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-lg font-medium">No Active Tasks</p>
                      <p className="text-sm">Create your first task using the form on the right</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Assign New Task</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                    <input 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Enter task title..." 
                      value={formData.quickTaskTitle || ''}
                      onChange={(e) => setFormData({...formData, quickTaskTitle: e.target.value})}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">Assign Task</label>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, assignmentMode: 'single', quickAssignee: '', quickAssignees: []})}
                          className={`px-3 py-1 text-xs rounded-full transition-colors ${
                            formData.assignmentMode === 'single' 
                              ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Single Member
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, assignmentMode: 'multiple', quickAssignee: '', quickAssignees: []})}
                          className={`px-3 py-1 text-xs rounded-full transition-colors ${
                            formData.assignmentMode === 'multiple' 
                              ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Team Group
                        </button>
                      </div>
                    </div>
                    
                    {formData.assignmentMode === 'single' ? (
                      <select 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.quickAssignee || ''}
                        onChange={(e) => setFormData({...formData, quickAssignee: e.target.value})}
                      >
                        <option value="">Select team member</option>
                        <option value="33333333-3333-3333-3333-333333333333">Alex Chen - UI/UX Designer</option>
                        <option value="33333333-3333-3333-3333-333333333334">David Rodriguez - Frontend Developer</option>
                        <option value="33333333-3333-3333-3333-333333333335">Lisa Wang - Backend Developer</option>
                        <option value="33333333-3333-3333-3333-333333333336">Robert Thompson - QA Engineer</option>
                      </select>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600 mb-2">Select team members for group assignment:</div>
                        <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                          {[
                            { id: '33333333-3333-3333-3333-333333333333', name: 'Alex Chen', designation: 'UI/UX Designer' },
                            { id: '33333333-3333-3333-3333-333333333334', name: 'David Rodriguez', designation: 'Frontend Developer' },
                            { id: '33333333-3333-3333-3333-333333333335', name: 'Lisa Wang', designation: 'Backend Developer' },
                            { id: '33333333-3333-3333-3333-333333333336', name: 'Robert Thompson', designation: 'QA Engineer' }
                          ].map(member => (
                            <label key={member.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={(formData.quickAssignees || []).includes(member.id)}
                                onChange={(e) => {
                                  const assignees = formData.quickAssignees || [];
                                  if (e.target.checked) {
                                    setFormData({...formData, quickAssignees: [...assignees, member.id]});
                                  } else {
                                    setFormData({...formData, quickAssignees: assignees.filter((id: string) => id !== member.id)});
                                  }
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-sm">{member.name}</div>
                                <div className="text-xs text-gray-500">{member.designation}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                        {(formData.quickAssignees || []).length > 0 && (
                          <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                            {(formData.quickAssignees || []).length} member(s) selected
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.quickPriority || 'medium'}
                      onChange={(e) => setFormData({...formData, quickPriority: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={async () => {
                        // Validate task assignment
                        const hasAssignee = formData.assignmentMode === 'single' 
                          ? formData.quickAssignee 
                          : (formData.quickAssignees && formData.quickAssignees.length > 0);
                        
                        if (!formData.quickTaskTitle || !hasAssignee) {
                          alert('Please fill in task title and assign to at least one team member');
                          return;
                        }
                        
                        setLoading(true);
                        try {
                          // Create task with a default project or the first available project
                          const targetProject = projects.find(p => p.pm_id === user?.id) || projects[0];
                          if (!targetProject) {
                            alert('No projects available. Please create a project first.');
                            return;
                          }
                          
                          // Determine assignees based on mode
                          const assignees = formData.assignmentMode === 'single' 
                            ? formData.quickAssignee 
                            : formData.quickAssignees;
                          
                          await createTask({
                            project_id: targetProject.id,
                            title: formData.quickTaskTitle,
                            description: `Task assigned by ${user?.name}`,
                            assigned_to: assignees,
                            priority: formData.quickPriority || 'medium'
                          });
                          
                          const assignmentMessage = formData.assignmentMode === 'single' 
                            ? 'Task created and assigned successfully!' 
                            : `Task created and assigned to ${(formData.quickAssignees || []).length} team members!`;
                          
                          setNotifications(prev => [{
                            id: Date.now(),
                            type: 'success',
                            message: assignmentMessage,
                            time: 'Just now'
                          }, ...prev]);
                          
                          // Clear form
                          setFormData({
                            ...formData,
                            quickTaskTitle: '',
                            quickAssignee: '',
                            quickAssignees: [],
                            quickPriority: 'medium',
                            assignmentMode: 'single'
                          });
                          
                        } catch (error: any) {
                          setNotifications(prev => [{
                            id: Date.now(),
                            type: 'error',
                            message: error.message || 'Failed to create task',
                            time: 'Just now'
                          }, ...prev]);
                        }
                        setLoading(false);
                      }}
                      disabled={loading || !formData.quickTaskTitle || 
                        (formData.assignmentMode === 'single' ? !formData.quickAssignee : 
                         !(formData.quickAssignees && formData.quickAssignees.length > 0))}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Creating...' : 'Quick Assign'}
                    </button>
                    <button 
                      onClick={() => handleCreateNew('task')}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Advanced
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'client-communication':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Client Communication</h2>
              <p className="text-gray-600">Manage communications with your clients</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">TC</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">TechCorp Inc.</h3>
                    <p className="text-sm text-gray-600">Brand Redesign Project</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm">Latest update sent 2 hours ago</p>
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Send Update
                </button>
              </div>
            </div>
          </div>
        );

      // Team Member-specific menu items
      case 'my-tasks':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">My Tasks</h2>
                <p className="text-gray-600">Track your assigned tasks and deadlines</p>
              </div>
              <div className="flex space-x-2">
                <select
                  value={taskFilter}
                  onChange={(e) => setTaskFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Tasks</option>
                  <option value="pending">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="team_completed">Submitted for Review</option>
                  <option value="completed">Approved</option>
                </select>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading your tasks...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* To Do Tasks */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">To Do</h3>
                  <div className="space-y-3">
                    {tasks.filter(task => taskFilter === 'all' || task.status === 'pending').filter(task => task.status === 'pending').length > 0 ? (
                      tasks.filter(task => taskFilter === 'all' || task.status === 'pending').filter(task => task.status === 'pending').map(task => {
                        const getCreatorName = (creatorId: string) => {
                          const demoUsers = [
                            { id: '22222222-2222-2222-2222-222222222222', name: 'Michael Johnson' },
                            { id: '22222222-2222-2222-2222-222222222223', name: 'Emily Davis' },
                            { id: '11111111-1111-1111-1111-111111111111', name: 'Demo Admin' },
                            { id: '33333333-3333-3333-3333-333333333333', name: 'Alex Chen' },
                            { id: '33333333-3333-3333-3333-333333333334', name: 'David Rodriguez' },
                            { id: '33333333-3333-3333-3333-333333333335', name: 'Lisa Wang' },
                            { id: '33333333-3333-3333-3333-333333333336', name: 'Robert Thompson' },
                            { id: '44444444-4444-4444-4444-444444444444', name: 'Demo Client' }
                          ];
                          return demoUsers.find(u => u.id === creatorId)?.name || 'Unknown';
                        };

                        const getPriorityColor = (priority: string) => {
                          switch (priority) {
                            case 'critical': return 'border-red-500 bg-red-50';
                            case 'high': return 'border-orange-500 bg-orange-50';
                            case 'medium': return 'border-yellow-500 bg-yellow-50';
                            case 'low': return 'border-green-500 bg-green-50';
                            default: return 'border-gray-500 bg-gray-50';
                          }
                        };

                        return (
                          <div key={task.id} className={`p-4 border-l-4 rounded-r-lg ${getPriorityColor(task.priority)}`}>
                            <h4 className="font-medium text-gray-900">{task.title}</h4>
                            <p className="text-sm text-gray-600">Assigned by: {getCreatorName(task.created_by)}</p>
                            <p className="text-sm text-gray-600">Priority: {task.priority}</p>
                            {task.deadline && (
                              <p className="text-sm text-gray-600">Due: {new Date(task.deadline).toLocaleDateString()}</p>
                            )}
                            {task.description && (
                              <p className="text-sm text-gray-700 mt-1">{task.description}</p>
                            )}
                            <button
                              onClick={() => updateTaskStatus(task.id, 'in_progress')}
                              className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700"
                            >
                              Start Task
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-sm">No pending tasks</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* In Progress Tasks */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">In Progress</h3>
                  <div className="space-y-3">
                    {tasks.filter(task => taskFilter === 'all' || task.status === 'in_progress').filter(task => task.status === 'in_progress').length > 0 ? (
                      tasks.filter(task => taskFilter === 'all' || task.status === 'in_progress').filter(task => task.status === 'in_progress').map(task => {
                        const getCreatorName = (creatorId: string) => {
                          const demoUsers = [
                            { id: '22222222-2222-2222-2222-222222222222', name: 'Michael Johnson' },
                            { id: '22222222-2222-2222-2222-222222222223', name: 'Emily Davis' },
                            { id: '11111111-1111-1111-1111-111111111111', name: 'Demo Admin' },
                            { id: '33333333-3333-3333-3333-333333333333', name: 'Alex Chen' },
                            { id: '33333333-3333-3333-3333-333333333334', name: 'David Rodriguez' },
                            { id: '33333333-3333-3333-3333-333333333335', name: 'Lisa Wang' },
                            { id: '33333333-3333-3333-3333-333333333336', name: 'Robert Thompson' },
                            { id: '44444444-4444-4444-4444-444444444444', name: 'Demo Client' }
                          ];
                          return demoUsers.find(u => u.id === creatorId)?.name || 'Unknown';
                        };

                        return (
                          <div key={task.id} className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                            <h4 className="font-medium text-gray-900">{task.title}</h4>
                            <p className="text-sm text-gray-600">Assigned by: {getCreatorName(task.created_by)}</p>
                            <p className="text-sm text-gray-600">Priority: {task.priority}</p>
                            {task.deadline && (
                              <p className="text-sm text-gray-600">Due: {new Date(task.deadline).toLocaleDateString()}</p>
                            )}
                            {task.description && (
                              <p className="text-sm text-gray-700 mt-1">{task.description}</p>
                            )}
                            <div className="mt-2 flex space-x-2">
                              <button
                                onClick={() => updateTaskStatus(task.id, 'team_completed', 'Task completed by team member, ready for PM review')}
                                className="text-xs bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700"
                              >
                                Submit for Review
                              </button>
                              <button
                                onClick={() => updateTaskStatus(task.id, 'pending')}
                                className="text-xs bg-gray-600 text-white px-3 py-1 rounded-full hover:bg-gray-700"
                              >
                                Move to To Do
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-sm">No tasks in progress</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Review & Completed Tasks */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Review & Completed</h3>
                  <div className="space-y-3">
                    {tasks.filter(task => taskFilter === 'all' || ['team_completed', 'pm_review', 'pm_approved', 'client_review', 'client_approved', 'completed'].includes(task.status)).filter(task => ['team_completed', 'pm_review', 'pm_approved', 'client_review', 'client_approved', 'completed'].includes(task.status)).length > 0 ? (
                      tasks.filter(task => taskFilter === 'all' || ['team_completed', 'pm_review', 'pm_approved', 'client_review', 'client_approved', 'completed'].includes(task.status)).filter(task => ['team_completed', 'pm_review', 'pm_approved', 'client_review', 'client_approved', 'completed'].includes(task.status)).map(task => {
                        const getCreatorName = (creatorId: string) => {
                          const demoUsers = [
                            { id: '22222222-2222-2222-2222-222222222222', name: 'Michael Johnson' },
                            { id: '22222222-2222-2222-2222-222222222223', name: 'Emily Davis' },
                            { id: '11111111-1111-1111-1111-111111111111', name: 'Demo Admin' },
                            { id: '33333333-3333-3333-3333-333333333333', name: 'Alex Chen' },
                            { id: '33333333-3333-3333-3333-333333333334', name: 'David Rodriguez' },
                            { id: '33333333-3333-3333-3333-333333333335', name: 'Lisa Wang' },
                            { id: '33333333-3333-3333-3333-333333333336', name: 'Robert Thompson' },
                            { id: '44444444-4444-4444-4444-444444444444', name: 'Demo Client' }
                          ];
                          return demoUsers.find(u => u.id === creatorId)?.name || 'Unknown';
                        };

                        const getStatusInfo = (status: string) => {
                          switch (status) {
                            case 'team_completed': return { color: 'border-yellow-500 bg-yellow-50', text: '⏳ Awaiting PM Review', textColor: 'text-yellow-600' };
                            case 'pm_review': return { color: 'border-blue-500 bg-blue-50', text: '👀 Under PM Review', textColor: 'text-blue-600' };
                            case 'pm_approved': return { color: 'border-purple-500 bg-purple-50', text: '✅ PM Approved', textColor: 'text-purple-600' };
                            case 'client_review': return { color: 'border-orange-500 bg-orange-50', text: '👥 Client Review', textColor: 'text-orange-600' };
                            case 'client_approved': return { color: 'border-green-500 bg-green-50', text: '🎉 Client Approved', textColor: 'text-green-600' };
                            case 'completed': return { color: 'border-green-500 bg-green-50', text: '✅ Fully Completed', textColor: 'text-green-600' };
                            default: return { color: 'border-gray-500 bg-gray-50', text: 'Unknown Status', textColor: 'text-gray-600' };
                          }
                        };
                        
                        const statusInfo = getStatusInfo(task.status);
                        
                        return (
                          <div key={task.id} className={`p-4 border-l-4 rounded-r-lg ${statusInfo.color}`}>
                            <h4 className="font-medium text-gray-900">{task.title}</h4>
                            <p className="text-sm text-gray-600">Assigned by: {getCreatorName(task.created_by)}</p>
                            <p className="text-sm text-gray-600">Priority: {task.priority}</p>
                            <p className={`text-sm font-medium ${statusInfo.textColor}`}>{statusInfo.text}</p>
                            {task.description && (
                              <p className="text-sm text-gray-700 mt-1">{task.description}</p>
                            )}
                            {task.completion_notes && (
                              <p className="text-xs text-gray-500 mt-1 italic">Note: {task.completion_notes}</p>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-sm">No completed tasks</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Show helpful message if no tasks at all */}
            {!loading && tasks.length === 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Tasks Assigned</h3>
                <p className="text-gray-600">You don't have any tasks assigned yet. Tasks assigned by project managers will appear here.</p>
              </div>
            )}
          </div>
        );

      // Client-specific menu items
      case 'requests':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">My Requests</h2>
              <p className="text-gray-600">Track your submitted requests and their progress</p>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading your requests...</p>
                </div>
              ) : projects.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Requests Yet</h3>
                  <p className="text-gray-600 mb-4">You haven't submitted any project requests yet.</p>
                  <button 
                    onClick={() => setActiveView('projects')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Submit New Request
                  </button>
                </div>
              ) : (
                projects.map((project) => (
                  <div key={project.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">{project.title}</h3>
                      <span className={`px-3 py-1 text-sm rounded-full ${
                        project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        project.status === 'approved' ? 'bg-green-100 text-green-800' :
                        project.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        <p>Priority: {project.priority}</p>
                        {project.budget && <p>Budget: ${project.budget.toLocaleString()}</p>}
                        {project.deadline && <p>Deadline: {new Date(project.deadline).toLocaleDateString()}</p>}
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedProject(project);
                          setActiveView('project-details');
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        View Details
                      </button>
                    </div>
                    {project.admin_notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700">Admin Notes:</p>
                        <p className="text-sm text-gray-600">{project.admin_notes}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'communication':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Manager Chat</h2>
              <p className="text-gray-600">Communicate directly with your assigned Project Manager</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">SJ</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Sarah Johnson</h3>
                  <p className="text-sm text-gray-600">Your Project Manager</p>
                </div>
              </div>
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                    <p className="text-sm">Hi! I wanted to update you on the logo concepts. We've completed the initial designs and they're ready for your review.</p>
                    <span className="text-xs text-gray-500">2 hours ago</span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white rounded-lg p-3 max-w-xs">
                    <p className="text-sm">Great! I'll review them today and get back to you with feedback.</p>
                    <span className="text-xs text-blue-200">1 hour ago</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <input className="flex-1 p-3 border border-gray-300 rounded-lg input-enhanced" placeholder="Type your message..." />
                <button 
                  onClick={handleSendMessage}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 btn-interactive"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        );

      case 'project-details':
        if (!selectedProject) {
          return (
            <div className="text-center py-8">
              <p className="text-gray-600">No project selected</p>
              <button 
                onClick={() => setActiveView('requests')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to My Requests
              </button>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <button 
                  onClick={() => setActiveView('requests')}
                  className="flex items-center text-blue-600 hover:text-blue-700 mb-2"
                >
                  ← Back to My Requests
                </button>
                <h2 className="text-2xl font-bold text-gray-900">{selectedProject.title}</h2>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    selectedProject.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedProject.status === 'approved' ? 'bg-green-100 text-green-800' :
                    selectedProject.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    selectedProject.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedProject.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    selectedProject.priority === 'critical' ? 'bg-red-100 text-red-800' :
                    selectedProject.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    selectedProject.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {selectedProject.priority} Priority
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Description</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedProject.description}</p>
                </div>

                {selectedProject.admin_notes && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800">{selectedProject.admin_notes}</p>
                    </div>
                  </div>
                )}

                {selectedProject.rejection_reason && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Rejection Reason</h3>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800">{selectedProject.rejection_reason}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Budget</p>
                      <p className="text-gray-900">
                        {selectedProject.budget ? `$${selectedProject.budget.toLocaleString()}` : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Deadline</p>
                      <p className="text-gray-900">
                        {selectedProject.deadline ? new Date(selectedProject.deadline).toLocaleDateString() : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Created</p>
                      <p className="text-gray-900">{new Date(selectedProject.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Last Updated</p>
                      <p className="text-gray-900">{new Date(selectedProject.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Progress</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className="text-sm font-medium">
                        {selectedProject.status === 'pending' ? 'Awaiting Review' :
                         selectedProject.status === 'approved' ? 'Approved' :
                         selectedProject.status === 'rejected' ? 'Rejected' :
                         selectedProject.status === 'in_progress' ? 'In Progress' :
                         'Completed'}
                      </span>
                    </div>
                    {selectedProject.status === 'in_progress' && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Overall Progress</span>
                          <span className="text-gray-900">45%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: '45%'}}></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderNotifications = () => {
    if (notifications.length === 0) return null;

    return (
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.slice(0, 3).map((notification) => (
          <div
            key={notification.id}
            className={`notification-toast p-4 rounded-lg shadow-lg max-w-sm animate-slide-in ${
              notification.type === 'success' ? 'border-l-4 border-green-500' :
              notification.type === 'error' ? 'border-l-4 border-red-500' :
              notification.type === 'warning' ? 'border-l-4 border-yellow-500' :
              'border-l-4 border-blue-500'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
              </div>
              <button
                onClick={() => handleNotificationAction(notification.id, 'delete')}
                className="text-gray-400 hover:text-gray-600 ml-4"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderWorkflowModal = () => {
    const project = projects.find(p => p.id === selectedProjectForAction);
    
    return (
      <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md animate-slide-in shadow-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {modalType === 'approve' ? 'Approve Project' :
             modalType === 'reject' ? 'Reject Project' :
             modalType === 'assign' ? 'Assign to Project Manager' :
             'Mark Project Complete'}
          </h3>
          
          {project && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">{project.title}</h4>
              <p className="text-sm text-gray-600">{project.description}</p>
            </div>
          )}

          <div className="space-y-4">
            {modalType === 'approve' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes (Optional)</label>
                <textarea
                  value={actionData.notes || ''}
                  onChange={(e) => setActionData({...actionData, notes: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg input-enhanced"
                  rows={3}
                  placeholder="Add approval notes..."
                />
              </div>
            )}

            {modalType === 'reject' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason *</label>
                <textarea
                  value={actionData.reason || ''}
                  onChange={(e) => setActionData({...actionData, reason: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg input-enhanced"
                  rows={3}
                  placeholder="Please provide a reason for rejection..."
                  required
                />
              </div>
            )}

            {modalType === 'assign' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Project Manager *</label>
                <select
                  value={actionData.pmId || ''}
                  onChange={(e) => setActionData({...actionData, pmId: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg input-enhanced"
                  required
                >
                  <option value="">Select Project Manager...</option>
                  <option value="22222222-2222-2222-2222-222222222222">Michael Johnson</option>
                  <option value="22222222-2222-2222-2222-222222222223">Emily Davis</option>
                </select>
              </div>
            )}

            {modalType === 'complete' && (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Are you sure you want to mark this project as complete? 
                  {user?.role === 'pm' ? ' The client will also need to confirm completion.' : 
                   user?.role === 'client' ? ' The PM will also need to confirm completion.' : ''}
                </p>
              </div>
            )}
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 btn-interactive"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitForm}
              disabled={loading || (modalType === 'reject' && !actionData.reason) || (modalType === 'assign' && !actionData.pmId)}
              className={`flex-1 px-4 py-2 text-white rounded-lg btn-interactive ${
                modalType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                modalType === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                modalType === 'assign' ? 'bg-blue-600 hover:bg-blue-700' :
                'bg-green-600 hover:bg-green-700'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="spinner mr-2"></div>
                  Processing...
                </div>
              ) : (
                modalType === 'approve' ? 'Approve' :
                modalType === 'reject' ? 'Reject' :
                modalType === 'assign' ? 'Assign' :
                'Mark Complete'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderModal = () => {
    if (!showModal || !modalType) return null;

    // Handle workflow-specific modals
    if (['approve', 'reject', 'assign', 'complete'].includes(modalType)) {
      return renderWorkflowModal();
    }

    const modalConfig = {
      project: { title: 'Submit New Project Request', fields: ['projectName', 'description', 'priority', 'deadline', 'budget'] },
      task: { title: 'Create New Task', fields: ['projectId', 'taskName', 'description', 'assignee', 'priority', 'deadline'] },
      client: { title: 'Add New Client', fields: ['clientName', 'company', 'email', 'phone'] },
      team: { title: 'Add Team Member', fields: ['memberName', 'role', 'email', 'department'] },
      message: { title: 'Send Message', fields: ['recipient', 'subject', 'message'] }
    };

    const config = modalConfig[modalType as keyof typeof modalConfig];

    return (
      <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md animate-slide-in shadow-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{config.title}</h3>
          <div className="space-y-4">
            {config.fields.map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                </label>
                {field === 'message' || field === 'description' ? (
                  <textarea
                    value={formData[field] || ''}
                    onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder={`Enter ${field}...`}
                  />
                ) : field === 'role' ? (
                  <select
                    value={formData[field] || ''}
                    onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select role...</option>
                    <option value="admin">Admin</option>
                    <option value="pm">Project Manager</option>
                    <option value="team_member">Team Member</option>
                    <option value="client">Client</option>
                  </select>
                ) : field === 'priority' ? (
                  <select
                    value={formData[field] || ''}
                    onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 input-enhanced"
                  >
                    <option value="">Select priority...</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                ) : field === 'projectId' ? (
                  <select
                    value={formData[field] || ''}
                    onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 input-enhanced"
                  >
                    <option value="">Select project...</option>
                    {projects.filter(p => p.status === 'in_progress' && user?.role === 'pm').map(project => (
                      <option key={project.id} value={project.id}>{project.title}</option>
                    ))}
                  </select>
                ) : field === 'assignee' ? (
                  <select
                    value={formData[field] || ''}
                    onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 input-enhanced"
                  >
                    <option value="">Select team member...</option>
                    <option value="33333333-3333-3333-3333-333333333333">Alex Chen - UI/UX Designer</option>
                    <option value="33333333-3333-3333-3333-333333333334">David Rodriguez - Frontend Developer</option>
                    <option value="33333333-3333-3333-3333-333333333335">Lisa Wang - Backend Developer</option>
                    <option value="33333333-3333-3333-3333-333333333336">Robert Thompson - QA Engineer</option>
                  </select>
                ) : (
                  <input
                    type={
                      field.includes('email') ? 'email' : 
                      field.includes('phone') ? 'tel' : 
                      field.includes('deadline') ? 'date' : 
                      field === 'budget' ? 'number' : 
                      'text'
                    }
                    value={formData[field] || ''}
                    onChange={(e) => {
                      if (field === 'budget') {
                        // Only allow numbers, decimal point, and empty string
                        const value = e.target.value;
                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                          setFormData({...formData, [field]: value});
                        }
                      } else {
                        setFormData({...formData, [field]: e.target.value});
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 input-enhanced"
                    placeholder={field === 'budget' ? 'Enter budget amount (numbers only)...' : `Enter ${field}...`}
                    min={field === 'budget' ? '0' : undefined}
                    step={field === 'budget' ? '0.01' : undefined}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 btn-interactive"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitForm}
              disabled={loading || 
                (modalType === 'project' && (
                  !formData.projectName || 
                  !formData.description ||
                  (formData.budget && (isNaN(parseFloat(formData.budget)) || parseFloat(formData.budget) < 0))
                )) ||
                (modalType === 'task' && (!formData.taskName || !formData.projectId || !formData.assignee))
              }
              className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 btn-interactive ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="spinner mr-2"></div>
                  {modalType === 'project' ? 'Submitting...' : 'Creating...'}
                </div>
              ) : (modalType === 'project' ? 'Submit Request' : 'Create')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          {renderContent()}
        </main>
      </div>
      {renderModal()}
      {renderNotifications()}
      
      {/* Feedback Modal */}
      {feedbackModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                {feedbackModal.type === 'approve' ? 'Approve & Complete Task' : 'Request Changes'}
              </h3>
              <button
                onClick={() => setFeedbackModal({isOpen: false, task: null, type: 'approve'})}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <h4 className="font-medium mb-2">Task: {feedbackModal.task?.title}</h4>
              <p className="text-gray-600 mb-4">{feedbackModal.task?.description}</p>
              
              {feedbackModal.task?.assignedMembers && feedbackModal.task.assignedMembers.length > 0 && (
                <div className="mb-4">
                  <span className="text-sm text-gray-500">Assigned to: </span>
                  <span className="text-sm font-medium">
                    {feedbackModal.task.assignedMembers.join(', ')}
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              
              const feedback = {
                rating: {
                  quality: parseInt(formData.get('quality') as string) || 5,
                  timeline: parseInt(formData.get('timeline') as string) || 5,
                  communication: parseInt(formData.get('communication') as string) || 5
                },
                comment: formData.get('comment') as string || '',
                type: feedbackModal.type,
                timestamp: new Date().toISOString(),
                reviewer: user?.name || 'Client'
              };

              try {
                // Update task status based on feedback type
                const newStatus = feedbackModal.type === 'approve' ? 'completed' : 'in_progress';
                await updateTaskStatus(feedbackModal.task.id, newStatus);
                
                // For now, we'll just log the feedback (could be stored in localStorage or sent to backend)
                console.log('Task feedback:', {
                  taskId: feedbackModal.task.id,
                  feedback
                });
                
                setFeedbackModal({isOpen: false, task: null, type: 'approve'});
                
                // Show success notification
                setNotifications(prev => [...prev, {
                  id: Date.now(),
                  message: feedbackModal.type === 'approve' 
                    ? 'Task approved and completed successfully!' 
                    : 'Feedback submitted. Task sent back for revisions.',
                  type: 'success',
                  time: new Date().toLocaleTimeString()
                }]);
              } catch (error) {
                console.error('Error submitting feedback:', error);
                setNotifications(prev => [...prev, {
                  id: Date.now(),
                  message: 'Error submitting feedback. Please try again.',
                  type: 'error',
                  time: new Date().toLocaleTimeString()
                }]);
              }
            }}>
              
              {/* Rating Section */}
              <div className="mb-6">
                <h5 className="font-medium mb-4">Rate the work quality:</h5>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Quality of Work:</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">1</span>
                      <input
                        type="range"
                        name="quality"
                        min="1"
                        max="5"
                        defaultValue="5"
                        className="flex-1 mx-2"
                      />
                      <span className="text-sm">5</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Timeline Adherence:</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">1</span>
                      <input
                        type="range"
                        name="timeline"
                        min="1"
                        max="5"
                        defaultValue="5"
                        className="flex-1 mx-2"
                      />
                      <span className="text-sm">5</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Communication:</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">1</span>
                      <input
                        type="range"
                        name="communication"
                        min="1"
                        max="5"
                        defaultValue="5"
                        className="flex-1 mx-2"
                      />
                      <span className="text-sm">5</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  {feedbackModal.type === 'approve' ? 'Additional Comments (Optional):' : 'What changes are needed?'}
                </label>
                <textarea
                  name="comment"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={feedbackModal.type === 'approve' 
                    ? 'Great work! Any additional feedback...' 
                    : 'Please describe what needs to be changed...'}
                  required={feedbackModal.type === 'reject'}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setFeedbackModal({isOpen: false, task: null, type: 'approve'})}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2 text-white rounded-lg ${
                    feedbackModal.type === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  {feedbackModal.type === 'approve' ? 'Approve & Complete' : 'Submit Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;