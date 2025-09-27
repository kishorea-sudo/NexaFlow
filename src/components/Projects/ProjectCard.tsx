import React from 'react';
import { ProjectWithTasks } from '../../hooks/useProjects';
import { Calendar, Users, FileText, Clock, CheckCircle } from 'lucide-react';

interface ProjectCardProps {
  project: ProjectWithTasks;
  onSelect: (project: ProjectWithTasks) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
  const getStatusColor = (status: ProjectWithTasks['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'admin_review':
        return 'bg-orange-100 text-orange-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-green-100 text-green-800';
      case 'pm_review':
        return 'bg-purple-100 text-purple-800';
      case 'client_review':
        return 'bg-indigo-100 text-indigo-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: ProjectWithTasks['priority']) => {
    switch (priority) {
      case 'critical':
        return 'border-red-500';
      case 'high':
        return 'border-orange-500';
      case 'medium':
        return 'border-yellow-500';
      case 'low':
        return 'border-green-500';
      default:
        return 'border-gray-300';
    }
  };

  const completedTasks = project.tasks?.filter(t => t.status === 'approved').length || 0;
  const totalTasks = project.tasks?.length || 0;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div 
      className={`bg-white rounded-xl border-2 ${getPriorityColor(project.priority)} p-6 cursor-pointer card-interactive`}
      onClick={() => onSelect(project)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">{project.description}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
          {project.status.replace('_', ' ')}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 text-gray-500">
            {project.deadline && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(project.deadline).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{totalTasks} tasks</span>
            </div>
            {project.budget && (
              <div className="flex items-center space-x-1">
                <FileText className="w-4 h-4" />
                <span>${project.budget.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Progress</span>
            <span className="text-xs font-medium text-gray-700">{Math.round(completionRate)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            {(project.tasks?.filter(t => t.status === 'under_review').length || 0) > 0 && (
              <div className="flex items-center space-x-1 text-orange-600">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">Pending Review</span>
              </div>
            )}
            {completedTasks > 0 && (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs font-medium">{completedTasks} Completed</span>
              </div>
            )}
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            project.priority === 'critical' ? 'bg-red-100 text-red-800' :
            project.priority === 'high' ? 'bg-orange-100 text-orange-800' :
            project.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {project.priority}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;