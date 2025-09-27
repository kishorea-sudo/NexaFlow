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
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard';
import ReportGenerator from './components/AI/ReportGenerator';
import { Project, AIReport } from './types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { projects, activities, updateDeliverableStatus } = useProjects();
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [generatedReports, setGeneratedReports] = useState<AIReport[]>([]);

  const handleGenerateReport = (report: AIReport) => {
    setGeneratedReports(prev => [report, ...prev]);
    // Simulate WhatsApp notification
    setTimeout(() => {
      alert(`📱 WhatsApp notification sent!\n\n"Weekly report for ${report.projectId} has been generated and shared with stakeholders."`);
    }, 1000);
  };

  const getFilteredProjects = () => {
    if (user?.role === 'team_member') {
      return projects.filter(p => user.assignedProjects?.includes(p.id));
    } else if (user?.role === 'pm') {
      return projects.filter(p => user.managedProjects?.includes(p.id));
    } else if (user?.role === 'client') {
      return projects.filter(p => p.clientId === user.id);
    }
    return projects; // Admin sees all
  };

  const filteredProjects = getFilteredProjects();

  const stats = {
    activeProjects: filteredProjects.filter(p => p.status === 'active').length,
    pendingApprovals: filteredProjects.reduce((acc, p) => 
      acc + p.deliverables.filter(d => d.status === 'review').length, 0
    ),
    completedThisMonth: filteredProjects.reduce((acc, p) => 
      acc + p.deliverables.filter(d => d.status === 'approved').length, 0
    ),
    overdueItems: filteredProjects.reduce((acc, p) => 
      acc + p.deliverables.filter(d => 
        d.status !== 'approved' && new Date(d.dueDate) < new Date()
      ).length, 0
    ),
  };

  const renderContent = () => {
    if (selectedProject) {
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
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.role === 'admin' ? 'System Overview' : 
                 user?.role === 'pm' ? 'Project Manager Dashboard' : 
                 user?.role === 'team_member' ? 'My Tasks Dashboard' :
                 'Client Portal'}
              </h1>
              <p className="text-gray-600 mt-2">
                {user?.role === 'admin' ? 'Monitor all client requests and project assignments' : 
                 user?.role === 'pm' ? 'Manage your projects and coordinate with team members' : 
                 user?.role === 'team_member' ? 'Track your assigned tasks and deliverables' :
                 'View your project requests and communicate with project managers'}
              </p>
            </div>
            
            <StatsCards stats={stats} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentActivity activities={activities} />
              
              <div className="space-y-6">
                {user?.role !== 'team_member' && (
                  <ReportGenerator
                    projectId={filteredProjects[0]?.id || 'demo'}
                    onGenerate={handleGenerateReport}
                  />
                )}
                
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    {user?.role === 'admin' && (
                      <>
                        <button 
                          onClick={() => alert('New client request form would open here')}
                          className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-medium text-gray-900">Process New Client Request</div>
                          <div className="text-sm text-gray-600">Assign incoming requests to project managers</div>
                        </button>
                        <button 
                          onClick={() => alert('Team management interface would open here')}
                          className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-medium text-gray-900">Manage Team Members</div>
                          <div className="text-sm text-gray-600">Add, remove, or reassign team members</div>
                        </button>
                      </>
                    )}
                    
                    {user?.role === 'pm' && (
                      <>
                        <button 
                          onClick={() => alert('Task assignment interface would open here')}
                          className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-medium text-gray-900">Assign Team Tasks</div>
                          <div className="text-sm text-gray-600">Delegate work to team members</div>
                        </button>
                        <button 
                          onClick={() => alert('Client communication hub would open here')}
                          className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-medium text-gray-900">Client Communication</div>
                          <div className="text-sm text-gray-600">Send updates and receive feedback</div>
                        </button>
                      </>
                    )}
                    
                    {user?.role === 'team_member' && (
                      <>
                        <button 
                          onClick={() => alert('File upload interface would open here')}
                          className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-medium text-gray-900">Upload Deliverable</div>
                          <div className="text-sm text-gray-600">Submit completed work for review</div>
                        </button>
                        <button 
                          onClick={() => alert('Task status update interface would open here')}
                          className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-medium text-gray-900">Update Task Status</div>
                          <div className="text-sm text-gray-600">Report progress to project manager</div>
                        </button>
                      </>
                    )}
                    
                    {user?.role === 'client' && (
                      <>
                        <button 
                          onClick={() => alert('New request form would open here')}
                          className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-medium text-gray-900">Submit New Request</div>
                          <div className="text-sm text-gray-600">Create a new project request</div>
                        </button>
                        <button 
                          onClick={() => alert('PM communication interface would open here')}
                          className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <div className="font-medium text-gray-900">Message Project Manager</div>
                          <div className="text-sm text-gray-600">Communicate directly with your PM</div>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'projects':
      case 'my-tasks':
      case 'requests':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {user?.role === 'team_member' ? 'My Tasks' : 
                   user?.role === 'client' ? 'My Requests' : 'Projects'}
                </h1>
                <p className="text-gray-600 mt-2">
                  {filteredProjects.length} {user?.role === 'team_member' ? 'assigned tasks' : 
                   user?.role === 'client' ? 'active requests' : 'active projects'}
                </p>
              </div>
              {user?.role !== 'team_member' && (
                <button 
                  onClick={() => alert('Create new project form would open here')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors btn-interactive"
                >
                  {user?.role === 'client' ? 'New Request' : 'New Project'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onSelect={setSelectedProject}
                />
              ))}
            </div>
          </div>
        );

      case 'analytics':
        return <AnalyticsDashboard />;

      case 'team':
      case 'team-tasks':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.role === 'admin' ? 'Team Management' : 'Team Tasks'}
              </h1>
              <p className="text-gray-600 mt-2">
                {user?.role === 'admin' ? 'Manage team members and their assignments' : 'Coordinate team member tasks'}
              </p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Management Interface</h3>
                <p className="text-gray-600 mb-6">
                  {user?.role === 'admin' ? 
                    'Add team members, assign roles, and manage project assignments' :
                    'View team member tasks, assign work, and track progress'}
                </p>
                <button 
                  onClick={() => alert('Team management features would be implemented here')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors btn-interactive"
                >
                  {user?.role === 'admin' ? 'Manage Team' : 'Assign Tasks'}
                </button>
              </div>
            </div>
          </div>
        );

      case 'client-requests':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Client Requests</h1>
              <p className="text-gray-600 mt-2">Process and assign incoming client requests</p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📋</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Client Request Management</h3>
                <p className="text-gray-600 mb-6">
                  Review incoming requests, assign to project managers, and track progress
                </p>
                <button 
                  onClick={() => alert('Client request management interface would be implemented here')}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors btn-interactive"
                >
                  Process Requests
                </button>
              </div>
            </div>
          </div>
        );

      case 'communication':
      case 'client-communication':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.role === 'client' ? 'Project Manager Communication' : 'Client Communication'}
              </h1>
              <p className="text-gray-600 mt-2">
                {user?.role === 'client' ? 
                  'Direct communication with your assigned project manager' :
                  'Communicate with clients and provide project updates'}
              </p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Communication Hub</h3>
                <p className="text-gray-600 mb-6">
                  {user?.role === 'client' ? 
                    'Chat with your project manager, receive updates, and provide feedback' :
                    'Send updates to clients, receive feedback, and maintain clear communication'}
                </p>
                <button 
                  onClick={() => alert('Communication interface with WhatsApp integration would be implemented here')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors btn-interactive"
                >
                  Open Chat
                </button>
              </div>
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.role === 'team_member' ? 'Task Documents' : 'Project Documents'}
              </h1>
              <p className="text-gray-600 mt-2">
                {user?.role === 'team_member' ? 
                  'Access documents related to your assigned tasks' :
                  'Manage project files, deliverables, and documentation'}
              </p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📁</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Management</h3>
                <p className="text-gray-600 mb-6">
                  Upload, organize, and manage project documents with version control
                </p>
                <button 
                  onClick={() => alert('Document management system would be implemented here')}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors btn-interactive"
                >
                  Manage Documents
                </button>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-2">Manage your notification preferences and history</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Notifications</h3>
                <div className="space-y-4">
                  {[
                    { type: 'success', message: 'Logo concepts approved by client', time: '2 hours ago' },
                    { type: 'warning', message: 'Deadline approaching for brand guidelines', time: '4 hours ago' },
                    { type: 'info', message: 'New team member added to project', time: '1 day ago' },
                  ].map((notification, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        notification.type === 'success' ? 'bg-green-500' :
                        notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Email Notifications', enabled: true },
                    { label: 'WhatsApp Updates', enabled: true },
                    { label: 'In-App Notifications', enabled: true },
                    { label: 'Weekly Reports', enabled: false },
                  ].map((setting, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{setting.label}</span>
                      <button 
                        onClick={() => alert(`${setting.label} setting would be toggled here`)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          setting.enabled ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          setting.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.role === 'admin' ? 'System Settings' : 'Account Settings'}
              </h1>
              <p className="text-gray-600 mt-2">
                {user?.role === 'admin' ? 
                  'Configure system-wide settings and preferences' :
                  'Manage your account preferences and settings'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input 
                      type="text" 
                      value={user?.name || ''} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input 
                      type="email" 
                      value={user?.email || ''} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <input 
                      type="text" 
                      value={user?.role || ''} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {user?.role === 'admin' ? 'System Preferences' : 'Preferences'}
                </h3>
                <div className="space-y-4">
                  {user?.role === 'admin' ? [
                    { label: 'Auto-assign new requests', enabled: true },
                    { label: 'Send daily system reports', enabled: false },
                    { label: 'Enable WhatsApp integration', enabled: true },
                    { label: 'Require approval for all uploads', enabled: true },
                  ] : [
                    { label: 'Dark mode', enabled: false },
                    { label: 'Email notifications', enabled: true },
                    { label: 'Desktop notifications', enabled: true },
                    { label: 'Weekly digest', enabled: false },
                  ]}.map((setting, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{setting.label}</span>
                      <button 
                        onClick={() => alert(`${setting.label} would be toggled here`)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          setting.enabled ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          setting.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Feature Coming Soon</h3>
              <p className="text-gray-600">This feature is currently under development.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading NexaFlow...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return <Dashboard />;
};

export default App;