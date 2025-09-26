import React from 'react';
import { BarChart3, TrendingUp, Clock, CheckCircle, Users, FileText } from 'lucide-react';

const AnalyticsDashboard: React.FC = () => {
  const kpis = [
    {
      title: 'Avg Approval Time',
      value: '2.3 days',
      change: '-12%',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Completion Rate',
      value: '89%',
      change: '+5%',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Active Users',
      value: '24',
      change: '+8%',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Documents Processed',
      value: '156',
      change: '+23%',
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Track performance and insights across all projects</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Export Data
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Custom Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className={`p-6 rounded-xl border border-gray-200 ${kpi.bgColor}`}>
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-8 h-8 ${kpi.color}`} />
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  kpi.change.startsWith('+') 
                    ? 'text-green-700 bg-green-100' 
                    : 'text-red-700 bg-red-100'
                }`}>
                  {kpi.change}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                <p className="text-sm text-gray-600">{kpi.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Project Performance</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {[
              { name: 'Brand Redesign', progress: 78, color: 'bg-blue-500' },
              { name: 'Website Development', progress: 92, color: 'bg-green-500' },
              { name: 'Mobile App', progress: 45, color: 'bg-orange-500' },
              { name: 'Marketing Campaign', progress: 67, color: 'bg-purple-500' },
            ].map((project, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{project.name}</span>
                  <span className="text-gray-500">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${project.color} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Activity</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <div key={day} className="text-center">
                  <div className="text-xs text-gray-500 mb-2">{day}</div>
                  <div 
                    className="bg-blue-100 rounded-full mx-auto"
                    style={{ 
                      width: '24px', 
                      height: `${20 + Math.random() * 40}px`,
                      backgroundColor: `rgba(59, 130, 246, ${0.3 + Math.random() * 0.7})`
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">This week</span>
                <span className="font-semibold text-gray-900">124 activities</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-gray-600">Average daily</span>
                <span className="font-semibold text-gray-900">18 activities</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Approval Velocity Trends</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Interactive charts and detailed analytics</p>
            <p className="text-sm text-gray-400">Premium feature - upgrade to access</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;