import React from 'react';
import { TrendingUp, Clock, CheckCircle, AlertTriangle, Users, DollarSign, Calendar, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface StatsCardsProps {
  stats: {
    activeProjects: number;
    pendingApprovals: number;
    completedThisMonth: number;
    overdueItems: number;
  };
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const { user } = useAuth();

  const getCardsForRole = () => {
    if (user?.role === 'admin') {
      return [
        {
          title: 'Client Requests',
          value: 23,
          icon: FileText,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        },
        {
          title: 'Assigned to PMs',
          value: 18,
          icon: Users,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        },
        {
          title: 'Active Projects',
          value: stats.activeProjects,
          icon: TrendingUp,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
        },
        {
          title: 'Pending Assignments',
          value: 5,
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        },
      ];
    } else if (user?.role === 'pm') {
      return [
        {
          title: 'Assigned Projects',
          value: 4,
          icon: TrendingUp,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        },
        {
          title: 'Team Tasks',
          value: 12,
          icon: Users,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
        },
        {
          title: 'Client Communications',
          value: 8,
          icon: Calendar,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        },
        {
          title: 'Pending Reviews',
          value: stats.pendingApprovals,
          icon: Clock,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
        },
      ];
    } else if (user?.role === 'team_member') {
      return [
        {
          title: 'My Tasks',
          value: 6,
          icon: FileText,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        },
        {
          title: 'In Progress',
          value: 3,
          icon: Clock,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
        },
        {
          title: 'Completed',
          value: stats.completedThisMonth,
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        },
        {
          title: 'Due This Week',
          value: 2,
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        },
      ];
    } else {
      // Client role
      return [
        {
          title: 'My Requests',
          value: 3,
          icon: FileText,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        },
        {
          title: 'In Progress',
          value: 2,
          icon: Clock,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
        },
        {
          title: 'Completed',
          value: 8,
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        },
        {
          title: 'PM Communications',
          value: 5,
          icon: Users,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
        },
      ];
    }
  };

  const cards = getCardsForRole();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <div
            key={index}
            className={`p-6 rounded-xl border ${card.borderColor} ${card.bgColor} transition-transform hover:scale-105 cursor-pointer`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.bgColor} border ${card.borderColor}`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;