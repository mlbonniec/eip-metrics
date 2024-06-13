enum ProjectType {
  SOLUTION = 'solution',
  TECHNICAL = 'technical',
  ENTREPRENEURSHIP = 'entrepreneurship'
}

export interface ProjectDomain {
  name: string;
  starsCount: number;
  viewsCount: number;
  envisagedType: ProjectType;
}

export interface Project {
  name: string;
  stars: number;
  views: number;
  ratio: number;
  type: ProjectType;
}
