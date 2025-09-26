import React from 'react';
import { Activity } from '../../types';
import { FileText, Check, X, MessageSquare, Upload, Users, Settings, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface RecentActivityProps {
  activities: Activity[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const { user } = useAuth();

  const getRoleSpecificActivities = () => {
    const baseTime = new Date();
    
    if (user?.role === 'admin') {
      return [
        {
          id: 'admin-1',
          type: 'system.update' as Activity['type'],
          userId: user.id,
          userName: 'Admin',
          projectId: 'req-1',
          projectName: 'Client Request System',
          timestamp: new Date(baseTime.getTime() - 30 * 60 * 1000),
          payload: { message: 'Assigned new client request to Sarah (PM)' }
        },
        {
          id: 'admin-2', 
          type: 'user.created' as Activity['type'],
          userId: user.id,
          userName: 'Admin',
          projectId: 'req-2',
          projectName: 'Brand Redesign Request',
          timestamp: new Date(baseTime.getTime() - 2 * 60 * 60 * 1000),
          payload: { message: 'Received new request from TechCorp client' }
        },
        {
          id: 'admin-3',
          type: 'backup.completed' as Activity['type'], 
          userId: user.id,
          userName: 'Admin',
          projectId: 'req-3',
          projectName: 'Website Development',
          timestamp: new Date(baseTime.getTime() - 4 * 60 * 60 * 1000),
          payload: { message: 'Assigned to Mike (PM) - High priority' }
        }
      ];
    } else if (user?.role === 'pm') {
      return [
        {
          id: 'pm-1',
          type: 'system.update' as Activity['type'],
          userId: user.id,
          userName: user.name,
          projectId: 'proj-1',
          projectName: 'Brand Redesign Project',
          timestamp: new Date(baseTime.getTime() - 15 * 60 * 1000),
          payload: { message: 'Assigned logo design task to Alex (Team)' }
        },
        {
          id: 'pm-2',
          type: 'deliverable.approved' as Activity['type'],
          userId: user.id,
          userName: user.name,
          projectId: 'proj-2', 
          projectName: 'Website Redesign',
          timestamp: new Date(baseTime.getTime() - 1 * 60 * 60 * 1000),
          payload: { message: 'Communicated progress update to client' }
        },
        {
          id: 'pm-3',
          type: 'comment.added' as Activity['type'],
          userId: user.id,
          userName: user.name,
          projectId: 'proj-1',
          projectName: 'Brand Redesign Project', 
          timestamp: new Date(baseTime.getTime() - 3 * 60 * 60 * 1000),
          payload: { message: 'Received completed wireframes from Jenny (Team)' }
        }
      ];
    } else if (user?.role === 'team_member') {
      return [
        {
          id: 'team-1',
          type: 'file.uploaded' as Activity['type'],
          userId: user?.id || 'team-1',
          userName: user?.name || 'Team Member',
          projectId: 'task-1',
          projectName: 'Logo Design Task',
          timestamp: new Date(baseTime.getTime() - 45 * 60 * 1000),
          payload: { fileName: 'logo-concepts-v3.figma', message: 'Uploaded final logo concepts' }
        },
        {
          id: 'team-2',
          type: 'deliverable.approved' as Activity['type'],
          userId: user?.id || 'team-1',
          userName: user?.name || 'Team Member',
          projectId: 'task-2',
          projectName: 'UI Components',
          timestamp: new Date(baseTime.getTime() - 2 * 60 * 60 * 1000),
          payload: { message: 'Completed button component designs' }
        },
        {
          id: 'team-3',
          type: 'comment.added' as Activity['type'],
          userId: user?.id || 'team-1',
          userName: user?.name || 'Team Member',
          projectId: 'task-1',
          projectName: 'Logo Design Task',
          timestamp: new Date(baseTime.getTime() - 4 * 60 * 60 * 1000),
          payload: { message: 'Started work on logo revisions' }
        }
      ];
    } else {
      // Client activities
      return [
        {
          id: 'client-1',
          type: 'system.update' as Activity['type'],
          userId: user?.id || 'client-1',
          userName: user?.name || 'Client User',
          projectId: 'req-1',
          projectName: 'Brand Redesign Request',
          timestamp: new Date(baseTime.getTime() - 20 * 60 * 1000),
          payload: { message: 'Submitted new brand redesign request' }
        },
        {
          id: 'client-2',
          type: 'comment.added' as Activity['type'],
          userId: user?.id || 'client-1',
          userName: user?.name || 'Client User',
          projectId: 'proj-1',
          projectName: 'Brand Redesign Project',
          timestamp: new Date(baseTime.getTime() - 2 * 60 * 60 * 1000),
          payload: { message: 'Discussed progress with Sarah (PM)' }
        },
        {
          id: 'client-3',
          type: 'deliverable.reviewed' as Activity['type'],
          userId: user?.id || 'client-1',
          userName: user?.name || 'Client User',
          projectId: 'proj-1',
          projectName: 'Brand Redesign Project',
          timestamp: new Date(baseTime.getTime() - 5 * 60 * 60 * 1000),
          payload: { message: 'Approved logo concepts via PM communication' }
        }
      ];
    }
  };

  const roleActivities = getRoleSpecificActivities();
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'file.uploaded':
        return Upload;
      case 'deliverable.approved':
        return Check;
      case 'deliverable.rejected':
        return X;
      case 'comment.added':
        return MessageSquare;
      case 'system.update':
        return Settings;
      case 'user.created':
        return Users;
      case 'backup.completed':
        return Shield;
      case 'deliverable.reviewed':
        return Check;
      case 'approval.pending':
        return FileText;
      default:
        return FileText;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'file.uploaded':
        return 'text-blue-600 bg-blue-50';
      case 'deliverable.approved':
        return 'text-green-600 bg-green-50';
      case 'deliverable.rejected':
        return 'text-red-600 bg-red-50';
      case 'comment.added':
        return 'text-purple-600 bg-purple-50';
      case 'system.update':
        return 'text-indigo-600 bg-indigo-50';
      case 'user.created':
        return 'text-emerald-600 bg-emerald-50';
      case 'backup.completed':
        return 'text-cyan-600 bg-cyan-50';
      case 'deliverable.reviewed':
        return 'text-green-600 bg-green-50';
      case 'approval.pending':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatActivityMessage = (activity: Activity) => {
    switch (activity.type) {
      case 'file.uploaded':
        return `uploaded ${activity.payload.fileName}`;
      case 'deliverable.approved':
        return `approved deliverable`;
      case 'deliverable.rejected':
        return `rejected deliverable`;
      case 'comment.added':
        return `added a comment`;
      case 'system.update':
        return activity.payload.message;
      case 'user.created':
        return activity.payload.message;
      case 'backup.completed':
        return activity.payload.message;
      case 'deliverable.reviewed':
        return activity.payload.message;
      case 'approval.pending':
        return activity.payload.message;
      default:
        return 'performed an action';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {user?.role === 'admin' ? 'Client Requests & Assignments' : 
           user?.role === 'pm' ? 'Team Coordination & Client Communication' : 
           user?.role === 'team_member' ? 'My Task Progress' :
           'My Requests & PM Communication'}
        </h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {roleActivities.slice(0, 6).map((activity) => {
          const Icon = getActivityIcon(activity.type);
          const colorClasses = getActivityColor(activity.type);
          
          return (
            <div key={activity.id} className="flex items-start space-x-4">
              <div className={`p-2 rounded-lg ${colorClasses}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.userName}</span>{' '}
                  {formatActivityMessage(activity)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  in <span className="font-medium">{activity.projectName}</span> • {activity.timestamp.toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;