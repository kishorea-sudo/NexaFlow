export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'pm' | 'client' | 'team_member';
  designation?: string; // For team members - their job title/designation
  avatar?: string;
  createdAt: Date;
  lastActive: Date;
  assignedProjects?: string[]; // For team members - only their assigned projects
  managedProjects?: string[]; // For PMs - projects they manage
}

export interface Project {
  id: string;
  name: string;
  description: string;
  clientId: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeline: {
    startDate: Date;
    endDate: Date;
    milestones: Milestone[];
  };
  team: string[];
  deliverables: Deliverable[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Deliverable {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'draft' | 'review' | 'approved' | 'rejected' | 'revision';
  requiresReview: boolean;
  assigneeId: string;
  dueDate: Date;
  currentVersionId?: string;
  versions: Version[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Version {
  id: string;
  deliverableId: string;
  version: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploaderId: string;
  status: 'pending' | 'approved' | 'rejected';
  signerMetadata?: {
    signerId: string;
    signedAt: Date;
    method: 'in-app' | 'whatsapp' | 'email';
    ipAddress: string;
  };
  createdAt: Date;
}

export interface Activity {
  id: string;
  projectId: string;
  projectName: string;
  userId: string;
  userName: string;
  type: 'project.created' | 'file.uploaded' | 'deliverable.approved' | 'deliverable.rejected' | 'comment.added' | 'milestone.completed' | 'system.update' | 'user.created' | 'backup.completed' | 'deliverable.reviewed' | 'approval.pending';
  payload: Record<string, any>;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  deliverableIds: string[];
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  channel: 'in-app' | 'email' | 'whatsapp';
  status: 'unread' | 'read';
  actionUrl?: string;
  createdAt: Date;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  active: boolean;
  createdAt: Date;
}

export interface RuleCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
}

export interface RuleAction {
  type: 'update_status' | 'send_notification' | 'assign_user' | 'create_activity';
  params: Record<string, any>;
}

export interface AIReport {
  id: string;
  projectId: string;
  summary: string;
  actions: string[];
  risk: string;
  generatedAt: Date;
  sentAt?: Date;
  recipients: string[];
}

export interface Analytics {
  overdueCount: number;
  avgApprovalTime: number;
  openDeliverablesCount: number;
  activityVelocity: number;
  completionRate: number;
  clientSatisfaction: number;
}