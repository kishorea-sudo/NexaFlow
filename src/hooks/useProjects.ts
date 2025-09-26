import { useState, useEffect } from 'react';
import { Project, Deliverable, Activity } from '../types';

// Demo data
const demoProjects: Project[] = [
  {
    id: 'PROJ-001',
    name: 'Brand Redesign Project',
    description: 'Complete brand identity overhaul including logo, guidelines, and marketing materials',
    clientId: '2',
    status: 'active',
    priority: 'high',
    timeline: {
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-03-30'),
      milestones: [
        {
          id: 'M1',
          title: 'Discovery & Strategy',
          description: 'Brand audit and strategic planning',
          dueDate: new Date('2024-02-01'),
          status: 'completed',
          deliverableIds: ['DEL-001']
        },
        {
          id: 'M2',
          title: 'Design Development',
          description: 'Logo concepts and brand guidelines',
          dueDate: new Date('2024-02-28'),
          status: 'in-progress',
          deliverableIds: ['DEL-002', 'DEL-003']
        }
      ]
    },
    team: ['3', '4'],
    deliverables: [
      {
        id: 'DEL-001',
        projectId: 'PROJ-001',
        title: 'Brand Strategy Document',
        description: 'Comprehensive brand strategy and positioning',
        status: 'approved',
        requiresReview: true,
        assigneeId: '3',
        dueDate: new Date('2024-02-01'),
        currentVersionId: 'V1',
        versions: [
          {
            id: 'V1',
            deliverableId: 'DEL-001',
            version: '1.0',
            fileUrl: '#',
            fileName: 'brand-strategy-v1.pdf',
            fileSize: 2450000,
            uploaderId: '3',
            status: 'approved',
            signerMetadata: {
              signerId: '2',
              signedAt: new Date('2024-01-28'),
              method: 'in-app',
              ipAddress: '192.168.1.1'
            },
            createdAt: new Date('2024-01-25')
          }
        ],
        comments: [],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-28')
      },
      {
        id: 'DEL-002',
        projectId: 'PROJ-001',
        title: 'Logo Concepts',
        description: 'Initial logo design concepts and variations',
        status: 'review',
        requiresReview: true,
        assigneeId: '4',
        dueDate: new Date('2024-02-15'),
        currentVersionId: 'V2',
        versions: [
          {
            id: 'V2',
            deliverableId: 'DEL-002',
            version: '1.0',
            fileUrl: '#',
            fileName: 'logo-concepts-v1.figma',
            fileSize: 5200000,
            uploaderId: '4',
            status: 'pending',
            createdAt: new Date('2024-02-10')
          }
        ],
        comments: [],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-02-10')
      }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-10')
  },
  {
    id: 'PROJ-002',
    name: 'Website Development',
    description: 'Modern responsive website with CMS integration',
    clientId: '5',
    status: 'active',
    priority: 'medium',
    timeline: {
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-04-15'),
      milestones: [
        {
          id: 'M3',
          title: 'Design Phase',
          description: 'UI/UX design and wireframes',
          dueDate: new Date('2024-02-28'),
          status: 'completed',
          deliverableIds: ['DEL-003']
        }
      ]
    },
    team: ['3'],
    deliverables: [
      {
        id: 'DEL-003',
        projectId: 'PROJ-002',
        title: 'Website Mockups',
        description: 'High-fidelity website design mockups',
        status: 'approved',
        requiresReview: true,
        assigneeId: '3',
        dueDate: new Date('2024-02-28'),
        versions: [],
        comments: [],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-25')
      }
    ],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-25')
  }
];

const demoActivities: Activity[] = [
  {
    id: 'ACT-001',
    projectId: 'PROJ-001',
    actorId: '3',
    type: 'file.uploaded',
    payload: {
      deliverableId: 'DEL-002',
      fileName: 'logo-concepts-v1.figma',
      version: '1.0'
    },
    timestamp: new Date('2024-02-10T10:30:00'),
  },
  {
    id: 'ACT-002',
    projectId: 'PROJ-001',
    actorId: '2',
    type: 'deliverable.approved',
    payload: {
      deliverableId: 'DEL-001',
      version: '1.0'
    },
    timestamp: new Date('2024-01-28T15:45:00'),
  }
];

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProjects(demoProjects);
      setActivities(demoActivities);
      setIsLoading(false);
    }, 500);
  }, []);

  const getProjectById = (id: string): Project | undefined => {
    return projects.find(p => p.id === id);
  };

  const getActivitiesByProject = (projectId: string): Activity[] => {
    return activities.filter(a => a.projectId === projectId);
  };

  const updateDeliverableStatus = (deliverableId: string, status: Deliverable['status']) => {
    setProjects(prev => prev.map(project => ({
      ...project,
      deliverables: project.deliverables.map(deliverable =>
        deliverable.id === deliverableId
          ? { ...deliverable, status, updatedAt: new Date() }
          : deliverable
      )
    })));

    // Add activity
    const newActivity: Activity = {
      id: `ACT-${Date.now()}`,
      projectId: projects.find(p => p.deliverables.some(d => d.id === deliverableId))?.id || '',
      actorId: '2', // Current user
      type: status === 'approved' ? 'deliverable.approved' : 'deliverable.rejected',
      payload: { deliverableId, status },
      timestamp: new Date(),
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  return {
    projects,
    activities,
    isLoading,
    getProjectById,
    getActivitiesByProject,
    updateDeliverableStatus,
  };
};