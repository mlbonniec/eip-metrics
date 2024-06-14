enum ProjectType {
  SOLUTION = 'solution',
  TECHNICAL = 'technical',
  ENTREPRENEURSHIP = 'entrepreneurship'
}

export interface ProjectDomain {
  id: number;
  name: string;
  starsCount: number;
  viewsCount: number;
  envisagedType: ProjectType;
  ownerCity: {
    name: string;
  };
}

export interface Project {
  id: number;
  name: string;
  stars: number;
  views: number;
  ratio: number;
  city: string;
  type: ProjectType;
}
