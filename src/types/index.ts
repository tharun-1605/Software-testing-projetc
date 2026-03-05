// Type definitions for the Smart Grievance Tracking System

export type UserRole = 'student' | 'staff' | 'dept_admin' | 'super_admin';

export type ComplaintStatus = 
  | 'submitted'
  | 'categorized'
  | 'assigned'
  | 'in_progress'
  | 'on_hold'
  | 'resolved'
  | 'closed';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  department?: string;
  phone: string;
  profilePicture?: string;
  studentId?: string;
  employeeId?: string;
  isVerified: boolean;
  createdAt: Date;
  lastLogin: Date;
  isActive: boolean;
  preferences?: {
    notificationEmail: boolean;
    notificationInApp: boolean;
    languagePreference: string;
  };
}

export interface Attachment {
  url: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

export interface Grievance {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  subCategory: string;
  priority: PriorityLevel;
  status: ComplaintStatus;
  attachments: Attachment[];
  submittedAt: Date;
  firstResponseDeadline?: Date;
  resolutionDeadline?: Date;
  assignedTo?: string;
  previousAssignedTo?: string[];
  department?: string;
  relatedComplaints?: string[];
  tags: string[];
  isAnonymous: boolean;
  estimatedResolutionTime?: number;
  metadata?: {
    source: string;
    userAgent: string;
    ipAddress: string;
  };
}

export interface StatusUpdate {
  id: string;
  grievanceId: string;
  previousStatus: ComplaintStatus;
  newStatus: ComplaintStatus;
  updatedBy: string;
  updatedAt: Date;
  message: string;
  internalNotes?: string;
  attachments?: string[];
  updateType: 'status_change' | 'comment' | 'escalation';
  escalationReason?: string;
  onHoldReason?: string;
  resolutionSummary?: string;
}

export interface Comment {
  id: string;
  grievanceId: string;
  userId: string;
  message: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
  isInternal: boolean;
  replies?: CommentReply[];
  likes?: {
    count: number;
    likedBy: string[];
  };
}

export interface CommentReply {
  id: string;
  userId: string;
  message: string;
  createdAt: Date;
}

export interface Feedback {
  id: string;
  grievanceId: string;
  userId: string;
  rating: number; // 1-5
  resolutionSatisfaction: number; // 1-5
  processSatisfaction: number; // 1-5
  comments: string;
  wouldRecommend: boolean;
  suggestedImprovements?: string;
  submittedAt: Date;
  followUpNeeded: boolean;
  followUpReason?: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  headId: string;
  staff: string[];
  categories: string[];
  phone: string;
  email: string;
  location: string;
  workingHours?: {
    startTime: string;
    endTime: string;
    weekDays: string[];
  };
  slaSettings: {
    firstResponseHours: number;
    resolutionDays: number;
    escalationHours: number;
  };
  createdAt: Date;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon?: string;
  department: string;
  subCategories: SubCategory[];
  priorityRules?: {
    defaultPriority: PriorityLevel;
    highPriorityKeywords: string[];
    urgentPriorityKeywords: string[];
  };
  createdAt: Date;
  isActive: boolean;
}

export interface SubCategory {
  id: string;
  name: string;
  description: string;
  instructions?: string;
}

export interface Notification {
  id: string;
  userId: string;
  grievanceId?: string;
  type: 'status_update' | 'new_message' | 'deadline' | 'system';
  title: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
  readAt?: Date;
  actionUrl?: string;
  priority: 'high' | 'normal' | 'low';
  metadata?: {
    status: string;
    department: string;
    notificationType: 'email' | 'in-app' | 'both';
  };
}

export interface Analytics {
  id: string;
  date: string; // YYYY-MM-DD
  department: string;
  metrics: {
    totalComplaints: number;
    resolvedComplaints: number;
    pendingComplaints: number;
    averageResolutionTime: number;
    slaCompliance: number;
    userSatisfactionAverage: number;
  };
  categoryDistribution: Record<string, number>;
  staffMetrics: StaffMetric[];
  recordedAt: Date;
}

export interface StaffMetric {
  staffId: string;
  complaintsHandled: number;
  averageResolutionTime: number;
  satisfactionScore: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: 'create' | 'update' | 'delete' | 'view';
  targetType: string;
  targetId: string;
  previousValue?: Record<string, any>;
  newValue?: Record<string, any>;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  details: string;
}

export interface DashboardStats {
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  averageResolutionDays: number;
  satisfactionScore: number;
  slaCompliancePercentage: number;
}

export interface FilterOptions {
  status?: ComplaintStatus[];
  category?: string[];
  department?: string[];
  priority?: PriorityLevel[];
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  assignedTo?: string;
  sortBy?: 'newest' | 'oldest' | 'priority' | 'deadline';
}
