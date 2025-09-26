import React from 'react';
import { 
  BarChart3, 
  FileText, 
  FolderOpen, 
  Home, 
  Settings, 
  Users, 
  Bell,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const { user } = useAuth();

  const getMenuItems = () => {
    if (user?.role === 'admin') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'client-requests', label: 'Client Requests', icon: FileText },
        { id: 'projects', label: 'All Projects', icon: FolderOpen },
        { id: 'team', label: 'Team Management', icon: Users },
        { id: 'analytics', label: 'System Analytics', icon: BarChart3 },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'settings', label: 'System Settings', icon: Settings },
      ];
    } else if (user?.role === 'pm') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'projects', label: 'My Projects', icon: FolderOpen },
        { id: 'team-tasks', label: 'Team Tasks', icon: Users },
        { id: 'client-communication', label: 'Client Communication', icon: MessageSquare },
        { id: 'documents', label: 'Project Documents', icon: FileText },
        { id: 'analytics', label: 'Project Analytics', icon: BarChart3 },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'settings', label: 'Profile Settings', icon: Settings },
      ];
    } else if (user?.role === 'team_member') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'my-tasks', label: 'My Tasks', icon: FileText },
        { id: 'documents', label: 'Task Documents', icon: FolderOpen },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'settings', label: 'Account Settings', icon: Settings },
      ];
    } else {
      // Client role
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'requests', label: 'My Requests', icon: FileText },
        { id: 'projects', label: 'My Projects', icon: FolderOpen },
        { id: 'communication', label: 'Project Manager Chat', icon: MessageSquare },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'settings', label: 'Account Settings', icon: Settings },
      ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img 
            src="/logo.png" 
            alt="NexaFlow Logo" 
            className="w-8 h-8 object-contain"
          />
          <div>
            <h1 className="text-xl font-bold text-gray-900">NexaFlow</h1>
            <p className="text-xs text-gray-500">
              {user?.role === 'admin' ? 'System Administrator' : 
               user?.role === 'pm' ? 'Project Manager' : 
               user?.role === 'team_member' ? 'Team Member' :
               'Client Portal'}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors sidebar-item ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;