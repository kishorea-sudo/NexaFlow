import React, { useState } from 'react';
import { Project, Deliverable } from '../../types';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle,
  Upload,
  Eye,
  MessageSquare,
  Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onUpdateDeliverableStatus: (deliverableId: string, status: Deliverable['status']) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ 
  project, 
  onBack, 
  onUpdateDeliverableStatus 
}) => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'deliverables' | 'activity'>('overview');

  const getStatusColor = (status: Deliverable['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'review':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'revision':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleApproval = (deliverableId: string, approved: boolean) => {
    onUpdateDeliverableStatus(deliverableId, approved ? 'approved' : 'rejected');
  };

  const completedDeliverables = project.deliverables.filter(d => d.status === 'approved').length;
  const totalDeliverables = project.deliverables.length;
  const completionRate = totalDeliverables > 0 ? (completedDeliverables / totalDeliverables) * 100 : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
            <p className="text-gray-600 mt-1">{project.description}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Progress</p>
              <p className="text-lg font-semibold text-gray-900">{Math.round(completionRate)}%</p>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="stroke-gray-200"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="stroke-blue-600"
                  strokeWidth="3"
                  strokeDasharray={`${completionRate}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>Due {project.timeline.endDate.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{project.team.length} team members</span>
          </div>
          <div className="flex items-center space-x-1">
            <FileText className="w-4 h-4" />
            <span>{totalDeliverables} deliverables</span>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {['overview', 'deliverables', 'activity'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                selectedTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Timeline</h3>
                <div className="space-y-4">
                  {project.timeline.milestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-start space-x-3">
                      <div className={`w-3 h-3 rounded-full mt-1 ${
                        milestone.status === 'completed' ? 'bg-green-500' :
                        milestone.status === 'in-progress' ? 'bg-blue-500' :
                        milestone.status === 'overdue' ? 'bg-red-500' : 'bg-gray-300'
                      }`} />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                        <p className="text-sm text-gray-600">{milestone.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Due: {milestone.dueDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {user?.role !== 'client' && (
                    <button className="w-full flex items-center space-x-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Upload className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900">Upload Deliverable</span>
                    </button>
                  )}
                  <button className="w-full flex items-center space-x-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <FileText className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-900">Generate Weekly Report</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-900">Send WhatsApp Update</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'deliverables' && (
          <div className="space-y-4">
            {project.deliverables.map((deliverable) => (
              <div key={deliverable.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">{deliverable.title}</h4>
                    <p className="text-gray-600 mt-1">{deliverable.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Due: {deliverable.dueDate.toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Assignee: User {deliverable.assigneeId}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(deliverable.status)}`}>
                    {deliverable.status}
                  </span>
                </div>

                {deliverable.versions.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-900">Latest Version</h5>
                    {deliverable.versions.map((version) => (
                      <div key={version.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-8 h-8 text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-900">{version.fileName}</p>
                            <p className="text-sm text-gray-500">
                              Version {version.version} • {(version.fileSize / 1000000).toFixed(1)} MB
                            </p>
                            <p className="text-xs text-gray-500">
                              Uploaded {version.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                          
                          {user?.role === 'client' && deliverable.status === 'review' && (
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => handleApproval(deliverable.id, false)}
                                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                              >
                                Request Changes
                              </button>
                              <button
                                onClick={() => handleApproval(deliverable.id, true)}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                              >
                                Approve
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {selectedTab === 'activity' && (
          <div className="space-y-4">
            <div className="text-center py-12 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Activity Timeline</p>
              <p className="text-sm">Project activities and updates will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;