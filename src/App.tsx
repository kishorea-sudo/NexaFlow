import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useProjects } from './hooks/useProjects';
import LoginForm from './components/Auth/LoginForm';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import StatsCards from './components/Dashboard/StatsCards';
import RecentActivity from './components/Dashboard/RecentActivity';
import ProjectCard from './components/Projects/ProjectCard';
import ProjectDetail from './components/Projects/ProjectDetail';
import ReportGenerator from './components/AI/ReportGenerator';
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard';
import { Project, AIReport } from './types';
import { FileText, Users, Settings, Bell, Zap, MessageSquare, CheckSquare, Inbox, BarChart3 } from 'lucide-react';

function AppContent() {
  const { user, isLoading } = useAuth();
  const { projects, activities, updateDeliverableStatus } = useProjects();
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [generatedReports, setGeneratedReports] = useState<AIReport[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'project' | 'task' | 'client' | 'team' | 'message' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'info', message: 'New project assigned', time: '2 minutes ago' },
    { id: 2, type: 'warning', message: 'Deadline approaching', time: '1 hour ago' },
    { id: 3, type: 'success', message: 'Task completed', time: '3 hours ago' }
  ]);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

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

  const handleSendMessage = () => {
    setModalType('message');
    setShowModal(true);
  };

  const handleSubmitForm = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setShowModal(false);
    // Add success notification
    setNotifications(prev => [{
      id: Date.now(),
      type: 'success',
      message: `${modalType?.charAt(0).toUpperCase()}${modalType?.slice(1)} ${modalType === 'message' ? 'sent' : 'created'} successfully!`,
      time: 'Just now'
    }, ...prev]);
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
    activeProjects: projects.filter(p => p.status === 'active').length,
    pendingApprovals: projects.reduce((acc, p) => 
      acc + p.deliverables.filter(d => d.status === 'review').length, 0
    ),
    completedThisMonth: projects.reduce((acc, p) => 
      acc + p.deliverables.filter(d => d.status === 'approved').length, 0
    ),
    overdueItems: projects.reduce((acc, p) => 
      acc + p.deliverables.filter(d => 
        d.status !== 'approved' && new Date(d.dueDate) < new Date()
      ).length, 0
    ),
  };

  const renderContent = () => {
    if (selectedProject && activeView === 'projects') {
      return (
        <ProjectDetail
          project={selectedProject}
          onBack={() => setSelectedProject(null)}
          onUpdateDeliverableStatus={updateDeliverableStatus}
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
                <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
                <p className="text-gray-600">Manage and track all your active projects</p>
              </div>
              {user.role !== 'client' && (
                <button 
                  onClick={() => handleCreateNew('project')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors btn-interactive"
                >
                  Create Project
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onSelect={(project) => {
                    setSelectedProject(project);
                  }}
                />
              ))}
            </div>
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
                    <span className="text-blue-600 font-semibold">SJ</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Sarah Johnson</h3>
                    <p className="text-sm text-gray-600">Project Manager</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Projects:</span>
                    <span className="font-medium">4 Active</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Team Size:</span>
                    <span className="font-medium">6 Members</span>
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  Manage Projects
                </button>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold">MR</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Mike Roberts</h3>
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
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">AC</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Alex Chen</h3>
                    <p className="text-sm text-gray-600">Team Member</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tasks:</span>
                    <span className="font-medium">5 Active</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Manager:</span>
                    <span className="font-medium">Sarah J.</span>
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
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Client Requests</h2>
              <p className="text-gray-600">Review and assign client requests to Project Managers</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">New Brand Identity</h3>
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Urgent</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">Client: TechCorp Inc.</p>
                <p className="text-sm text-gray-700 mb-4">Complete brand redesign including logo, guidelines, and marketing materials</p>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Assign to PM
                </button>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Website Development</h3>
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Medium</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">Client: StartupXYZ</p>
                <p className="text-sm text-gray-700 mb-4">Modern responsive website with e-commerce functionality</p>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Assign to PM
                </button>
              </div>
            </div>
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
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Logo Design Concepts</p>
                      <p className="text-sm text-gray-600">Assigned to: Alex Chen</p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">In Progress</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">UI Components</p>
                      <p className="text-sm text-gray-600">Assigned to: Sarah Kim</p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Completed</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Assign New Task</h3>
                <div className="space-y-4">
                  <input className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Task title" />
                  <select className="w-full p-3 border border-gray-300 rounded-lg">
                    <option>Select team member</option>
                    <option>Alex Chen</option>
                    <option>Sarah Kim</option>
                    <option>Mike Johnson</option>
                  </select>
                  <button 
                    onClick={() => handleCreateNew('task')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Task
                  </button>
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
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">My Tasks</h2>
              <p className="text-gray-600">Track your assigned tasks and deadlines</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">To Do</h3>
                <div className="space-y-3">
                  <div className="p-4 border-l-4 border-red-400 bg-red-50 rounded-r-lg">
                    <h4 className="font-medium text-gray-900">Logo Design Revisions</h4>
                    <p className="text-sm text-gray-600">Due: Tomorrow</p>
                    <p className="text-sm text-gray-700 mt-1">Create 3 alternative logo concepts based on client feedback</p>
                  </div>
                  <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50 rounded-r-lg">
                    <h4 className="font-medium text-gray-900">Color Palette Research</h4>
                    <p className="text-sm text-gray-600">Due: This Week</p>
                    <p className="text-sm text-gray-700 mt-1">Research and propose color schemes for the rebrand</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">In Progress</h3>
                <div className="space-y-3">
                  <div className="p-4 border-l-4 border-blue-400 bg-blue-50 rounded-r-lg">
                    <h4 className="font-medium text-gray-900">Brand Guidelines Document</h4>
                    <p className="text-sm text-gray-600">Progress: 60%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '60%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Brand Identity Redesign</h3>
                  <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">In Progress</span>
                </div>
                <p className="text-gray-600 mb-4">Complete overhaul of company branding including logo, colors, and guidelines</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Assigned PM: Sarah Johnson</span>
                  <button 
                    onClick={() => setActiveView('projects')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    View Progress
                  </button>
                </div>
              </div>
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

  const renderModal = () => {
    if (!showModal || !modalType) return null;

    const modalConfig = {
      project: { title: 'Create New Project', fields: ['projectName', 'description', 'client', 'deadline'] },
      task: { title: 'Create New Task', fields: ['taskName', 'description', 'assignee', 'priority', 'deadline'] },
      client: { title: 'Add New Client', fields: ['clientName', 'company', 'email', 'phone'] },
      team: { title: 'Add Team Member', fields: ['memberName', 'role', 'email', 'department'] },
      message: { title: 'Send Message', fields: ['recipient', 'subject', 'message'] }
    };

    const config = modalConfig[modalType];

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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select priority...</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                ) : (
                  <input
                    type={field.includes('email') ? 'email' : field.includes('phone') ? 'tel' : field.includes('deadline') ? 'date' : 'text'}
                    value={formData[field] || ''}
                    onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 input-enhanced"
                    placeholder={`Enter ${field}...`}
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
              disabled={loading}
              className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 btn-interactive ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="spinner mr-2"></div>
                  Creating...
                </div>
              ) : 'Create'}
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