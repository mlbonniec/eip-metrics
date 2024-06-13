import type { ProjectDomain, Project } from './types/project';
import { join } from 'path';
import { table } from 'table';
import axios from 'axios';
import fs from 'fs';

const directory: string = 'metrics';

axios.get<ProjectDomain[]>('https://eip-tek3.epitest.eu/api/projects/', {
  headers: {
    'Authorization': ['Bearer', process.env.ACCESS_TOKEN].join(' ')
  }
})
.then(res => {
  const body: ProjectDomain[] = res.data;

  try {
    if (!fs.existsSync(directory))
      fs.mkdirSync(directory);
  } catch (e) {
    console.error(`Fail to create ${directory} directory`, e);
  }

  const filename = `${Date.now()}.json`;
  const filepath: string = join(__dirname, '..', directory, filename);

  fs.writeFileSync(filepath, JSON.stringify(body), 'utf-8');

  const metrics: Project[] = body.map(e => {
    const ratio: number = e.starsCount > 0 ? (e.starsCount / e.viewsCount * 100) : 0

    return {
      name: e.name,
      views: e.viewsCount,
      stars: e.starsCount,
      ratio: Math.round(ratio * 100) / 100,
      type: e.envisagedType
    }
  });

  const sorted: Project[] = metrics.sort((a, b) => b.ratio - a.ratio);

  console.log(table([
    ['Position', 'Name', 'Views', 'Stars', 'Ratio', 'Type'],
    ...sorted.map((e, i) => [i + 1, e.name, e.views, e.stars, e.ratio, e.type])
  ]));
})
.catch(error => console.error(error));