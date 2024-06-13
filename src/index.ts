import type { ProjectDomain, Project } from './types/project';
import axios from 'axios';

axios.get<ProjectDomain[]>('https://eip-tek3.epitest.eu/api/projects/', {
  headers: {
    'Authorization': ['Bearer', process.env.ACCESS_TOKEN].join(' ')
  }
})
.then(res => {
  const metrics: Project[] = res.data.map(e => {
    const ratio: number = e.starsCount > 0 ? (e.starsCount / e.viewsCount * 100) : 0

    return {
      name: e.name,
      views: e.viewsCount,
      stars: e.starsCount,
      ratio: Math.round(ratio * 100) / 100
    }
  });

  const sorted: Project[] = metrics.sort((a, b) => b.ratio - a.ratio);

  console.table(sorted);
})
.catch(error => console.error(error));