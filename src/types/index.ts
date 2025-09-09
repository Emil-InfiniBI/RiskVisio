export type Factory = 'BTL' | 'BTO' | 'BTI' | 'BTX' | 'BTT' | 'BTG';

export interface Incident {
  id: string;
  title: string;
  description: string;
  type: 'safety' | 'security' | 'environmental' | 'operational' | 'hr';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  reportedBy: string;
  reportedDate: string;
  assignedTo?: string;
  factory: Factory;
  location: string;
  tags: string[];
  rootCause?: string;
  actions: string[];
  evidence: string[];
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  category: 'operational' | 'financial' | 'strategic' | 'compliance' | 'reputational' | 'technology';
  probability: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  riskScore: number;
  status: 'identified' | 'assessed' | 'treated' | 'monitored' | 'closed';
  owner: string;
  factory: Factory;
  identifiedDate: string;
  reviewDate: string;
  mitigationStrategy: string;
  currentControls: string[];
  targetRiskScore?: number;
}

export interface ApiKey {
  id: string;
  clientId: string;
  clientSecret?: string; // Only shown once during creation
  name: string;
  enabled: boolean;
  accessType: 'full' | 'limited';
  createdDate: string;
  createdBy: string;
  lastUsed?: string;
  revokedDate?: string;
  revokedBy?: string;
}

export interface ComplianceItem {
  id: string;
  requirement: string;
  regulation: string;
  description: string;
  status: 'compliant' | 'non-compliant' | 'partial' | 'under-review';
  priority: 'low' | 'medium' | 'high' | 'critical';
  owner: string;
  factory: Factory;
  dueDate: string;
  lastAssessed: string;
  evidence: string[];
  actions: string[];
  notes: string;
}

export interface Investigation {
  id: string;
  incidentId: string;
  investigator: string;
  factory: Factory;
  startDate: string;
  endDate?: string;
  status: 'open' | 'in-progress' | 'completed';
  findings: string;
  rootCause: string;
  recommendations: string[];
  evidence: string[];
  timeline: Array<{
    date: string;
    event: string;
    details: string;
  }>;
}

export interface Occurrence {
  id: string;
  type: 'risk-observation' | 'near-miss' | 'accident' | 'commuting-accident' | 'work-related-illness' | 'environment' | 'improvement-proposal';
  title: string;
  description: string;
  location: string;
  factory: Factory;
  reportedBy: string;
  reportedDate: string;
  reportedTime: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'under-review' | 'investigated' | 'closed';
  involvedPersons?: string[];
  immediateActions?: string[];
  potentialConsequences?: string;
  rootCause?: string;
  correctiveActions?: string[];
  evidence?: string[];
  assignedTo?: string;
  reviewDate?: string;
  closedDate?: string;
  // Extended fields for full form
  reportedByName?: string;
  reportedByEmail?: string;
  courseOfEvents?: string;
  involvedOpinion?: string;
  involvedProposal?: string;
  operatingSituation?: string;
  injuryRisk?: string;
  locationDetails?: string;
  objectId?: string;
  activity?: string;
  qhseRepresentative?: string;
  incidentCategories?: string[];
  processing?: string[];
  restrictedAccess?: boolean;
  employee?: boolean;
  occurrenceManager?: string;
  // Accident-specific fields
  sickLeave?: string;
  jobTransferDays?: string;
  permanentJobTransfer?: boolean;
  medicallyTreated?: boolean;
  injuryTypes?: string[];
  injuredBodyParts?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  fullName: string;
  email: string;
  factories: Factory[];
  isActive: boolean;
  createdDate: string;
  lastLogin?: string;
}