export interface DreamCompanyInput {
  degree: string;
  workExperience: string;
  skills: string;
  interests: string;
  targetSalary: string;
  location: string;
}

export interface OutreachInput {
  targetRole: string;
  targetCompany: string;
  linkedinInput: string;
}

export interface Company {
  name: string;
  reason: string;
}

export interface CompanyMatrix {
  tier1: Company[];
  tier2: Company[];
  tier3: Company[];
}

export interface TargetRole {
  title: string;
  level: string;
  reason: string;
}

export interface RoadmapPhase {
  phase: string;
  timeframe: string;
  actions: string[];
  skills: string[];
  strategicMoves: string[];
}

export interface ProfileAnalysis {
  marketLevel: string;
  strengths: string[];
  gaps: string[];
  assessment: string;
}

export interface DreamCompanyResults {
  profileAnalysis?: ProfileAnalysis;
  companyMatrix?: CompanyMatrix;
  targetRoles?: TargetRole[];
  careerRoadmap?: RoadmapPhase[];
}

export interface OutreachResults {
  linkedinDM?: string;
  networkingEmail?: string;
  recruiterMessage?: string;
}

export type StreamEvent =
  | { type: 'status'; message: string }
  | { type: 'section_start'; section: string }
  | { type: 'chunk'; section: string; text: string }
  | { type: 'section_end'; section: string }
  | { type: 'done' }
  | { type: 'error'; message: string };
