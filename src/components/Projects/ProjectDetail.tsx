import React, { useState } from 'react';
import { ProjectWithTasks } from '../../hooks/useProjects';
import ProjectStatusFlow from './ProjectStatusFlow';
import { ArrowLeft, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ProjectDetailProps {
  project: ProjectWithTasks;
  onBack: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack }) => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'tasks' | 'status'>('overview');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4 mb-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{project.title}</h2>
            <p className="text-gray-600 mt-1">{project.description}</p>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {['overview', 'status', 'tasks'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                selectedTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Project Information</h4>
              <p className="text-gray-600">Client ID: {project.client_id}</p>
              <p className="text-gray-600">Created: {formatDate(project.created_at)}</p>
            </div>
          </div>
        )}

        {selectedTab === 'status' && (
          <div className="space-y-6">
            <ProjectStatusFlow project={project} userRole={user?.role || 'client'} />
          </div>
        )}

        {selectedTab === 'tasks' && (
          <div className="space-y-4">
            {project.tasks && project.tasks.length > 0 ? (
              project.tasks.map((task) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900">{task.title}</h4>
                  <p className="text-gray-600 mt-1">{task.description}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
                <p className="text-gray-600">Tasks will appear here once the project is assigned to a PM</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
