import React from 'react';
import { CheckCircle, Clock, AlertCircle, XCircle, User, Users, FileText } from 'lucide-react';
import { ProjectWithTasks } from '../../hooks/useProjects';

interface ProjectStatusFlowProps {
  project: ProjectWithTasks;
  userRole: string;
}

const ProjectStatusFlow: React.FC<ProjectStatusFlowProps> = ({ project, userRole }) => {
  const getStatusIcon = (status: string, isActive: boolean) => {
    const iconClass = `w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-400'}`;
    
    switch (status) {
      case 'pending':
        return <FileText className={iconClass} />;
      case 'admin_review':
        return <AlertCircle className={iconClass} />;
      case 'approved':
        return <CheckCircle className={iconClass} />;
      case 'rejected':
        return <XCircle className={iconClass} />;
      case 'in_progress':
        return <Users className={iconClass} />;
      case 'pm_review':
        return <User className={iconClass} />;
      case 'client_review':
        return <Clock className={iconClass} />;
      case 'completed':
        return <CheckCircle className={iconClass} />;
      default:
        return <Clock className={iconClass} />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Submitted';
      case 'admin_review':
        return 'Admin Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'in_progress':
        return 'In Progress';
      case 'pm_review':
        return 'PM Review';
      case 'client_review':
        return 'Client Review';
      case 'completed':
        return 'Completed';
      default:
        return status.replace('_', ' ');
    }
  };

  const workflowSteps = [
    'pending',
    'admin_review', 
    'approved',
    'in_progress',
    'pm_review',
    'client_review',
    'completed'
  ];

  const currentStepIndex = workflowSteps.indexOf(project.status);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Workflow Status</h3>
      
      <div className="space-y-4">
        {workflowSteps.map((status, index) => {
          const isActive = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;
          
          return (
            <div key={status} className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                isActive ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {getStatusIcon(status, isActive)}
              </div>
              
              <div className="flex-1">
                <div className={`font-medium ${
                  isCurrent ? 'text-blue-600' : isActive ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {getStatusLabel(status)}
                </div>
                
                {isCurrent && (
                  <div className="text-sm text-gray-600 mt-1">
                    {status === 'pending' && 'Waiting for admin review'}
                    {status === 'admin_review' && 'Admin is reviewing your request'}
                    {status === 'approved' && 'Approved - waiting for PM assignment'}
                    {status === 'in_progress' && 'PM is working on tasks'}
                    {status === 'pm_review' && 'PM reviewing completed work'}
                    {status === 'client_review' && 'Client reviewing deliverables'}
                    {status === 'completed' && 'Project successfully completed'}
                  </div>
                )}
              </div>
              
              {isActive && (
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              )}
            </div>
          );
        })}
      </div>

      {project.status === 'rejected' && project.rejection_reason && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg">
          <div className="text-sm font-medium text-red-800">Rejection Reason:</div>
          <div className="text-sm text-red-700 mt-1">{project.rejection_reason}</div>
        </div>
      )}

      {project.admin_notes && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-800">Admin Notes:</div>
          <div className="text-sm text-blue-700 mt-1">{project.admin_notes}</div>
        </div>
      )}

      {/* Completion Status */}
      {project.status === 'client_review' && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <div className="text-sm font-medium text-yellow-800">Completion Status:</div>
          <div className="space-y-1 mt-2">
            <div className="flex items-center text-sm">
              <span className={`w-3 h-3 rounded-full mr-2 ${project.completed_by_pm ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              <span className={project.completed_by_pm ? 'text-green-700' : 'text-gray-600'}>
                PM Approval {project.completed_by_pm ? '✓' : '(Pending)'}
              </span>
            </div>
            <div className="flex items-center text-sm">
              <span className={`w-3 h-3 rounded-full mr-2 ${project.completed_by_client ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              <span className={project.completed_by_client ? 'text-green-700' : 'text-gray-600'}>
                Client Approval {project.completed_by_client ? '✓' : '(Pending)'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectStatusFlow;