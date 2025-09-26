import React, { useState } from 'react';
import { Search, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search projects, documents, or team members..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => {
              // Real-time search functionality
              if (e.target.value.length > 2) {
                console.log(`Searching for: ${e.target.value}`);
              }
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                console.log(`Search executed: ${e.currentTarget.value}`);
              }
            }}
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button 
          onClick={() => alert('Notifications: \n• New project assigned\n• Deadline reminder: Logo concepts\n• Team member joined')}
          className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-sm font-medium text-gray-700">{user?.name}</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <button
                onClick={() => alert('Profile settings would open here')}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
              <hr className="my-1" />
              <button
                onClick={logout}
                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;