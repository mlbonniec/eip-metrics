enum ProjectType {
  SOLUTION = 'solution',
  TECHNICAL = 'technical',
  ENTREPRENEURSHIP = 'entrepreneurship'
}

export enum ProjectStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface ProjectDomain {
  id: number;
  name: string;
  description: string;
  starsCount: number;
  viewsCount: number;
  envisagedType: ProjectType;
  ownerCity: {
    name: string;
  };
  status: ProjectStatus;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  stars: number;
  views: number;
  ratio: number;
  city: string;
  type: ProjectType;
  status: ProjectStatus;
}
