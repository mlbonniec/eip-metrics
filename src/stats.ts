import type { ProjectDomain, Project } from './types/project';
import { ProjectStatus } from './types/project';
import axios, { type AxiosError } from 'axios';
import { table } from 'table';
import fs from 'fs';
import * as chalk from 'chalk';


type Body = { results: ProjectDomain[]; next: number | null; }

const result: ProjectDomain[] = [];
const directory: string = 'metrics';

async function fetchProjects(offset: number): Promise<void> {
  console.log(`Fetching projects… (offset=${offset})`);

  return axios.get<Body>('https://eip-tek3.epitest.eu/api/projects/', {
    headers: {
      'Authorization': ['Bearer', process.env.ACCESS_TOKEN].join(' ')
    },
    params: {
      offset,
      scholar_year: 2023,
      include_rejected: true,
      limit: 100
    }
  })
    .then(async res => {
      const body: Body = res.data;

      body.results.forEach(e => {
        if (result.find(r => r.id === e.id))
          return;
        result.push(e);
      });

      if (body.next)
        await fetchProjects(body.next);
    })
    .catch(err => {
      if (!axios.isAxiosError(err))
        console.error(`Fail to fetch projects: ${err}`);

      const axiosError: AxiosError = err;
      switch (axiosError.response?.status) {
        case 401:
          console.error('Invalid access token');
          break;
        default:
          console.error(`Unknown error: ${axiosError.message}`);
          break;
      }
    });
}

const getBarChart = (statuses: { [key: string]: number }, total: number): string => {
  let bar = '';
  for (const status in statuses) {
    if (total === 0 || isNaN(total)) {
      console.error('Total is zero or not a number');
      return "Nan";
    }

    const percentage = (Number(statuses[status]) / total) * 100;

    const color = status === 'rejected' ? '\x1b[31m' : // red
      status === 'pending' ? '\x1b[33m' : // yellow
        status === 'approved' ? '\x1b[32m' : // green
          status === 'draft' ? '\x1b[38;5;7m' : // gray
            '\x1b[34m'; // blue

    const barLength = Math.round(percentage / 2); // Adjust this to change the scale of the chart
    for (let i = 0; i < barLength; i++) {
      bar += `${color}█\x1b[0m`;
    }
    bar += '\x1b[0m'; // Reset color
  }
  return bar;
}

async function generateMetrics() {
  await fetchProjects(0);

  try {
    if (!fs.existsSync(directory))
      fs.mkdirSync(directory);
  } catch (e) {
    console.error(`Fail to create ${directory} directory`, e);
  }

  const metrics: Project[] = result.map(e => {
    const ratio: number = e.starsCount > 0 ? (e.starsCount / e.viewsCount * 100) : 0

    return {
      id: e.id,
      name: e.name,
      description: e.description,
      views: e.viewsCount,
      stars: e.starsCount,
      ratio: Math.round(ratio * 100) / 100,
      type: e.envisagedType,
      city: e.ownerCity.name,
      status: e.status
    }
  });


  const total = result.length;
  const rejected = result.filter(e => e.status === ProjectStatus.REJECTED).length;
  const pending = result.filter(e => e.status === ProjectStatus.PENDING).length;
  const approved = result.filter(e => e.status === ProjectStatus.APPROVED).length;
  const draft = result.filter(e => e.status === ProjectStatus.DRAFT).length;
  const waiting_update = result.filter(e => e.status === ProjectStatus.WAITING).length;

  const statuses: { [key: string]: number } = {
    rejected: result.filter(e => e.status === ProjectStatus.REJECTED).length,
    pending: result.filter(e => e.status === ProjectStatus.PENDING).length,
    approved: result.filter(e => e.status === ProjectStatus.APPROVED).length,
    draft: result.filter(e => e.status === ProjectStatus.DRAFT).length,
    waiting_update: result.filter(e => e.status === ProjectStatus.WAITING).length
  };

  console.log("Stats:");
  console.log(getBarChart(statuses, total));
  console.log(`Total: ${total}`);
  console.log(`\x1b[31m█\x1b[0m Rejected: ${rejected} (${((rejected / total) * 100).toFixed(2)}%)`);
  console.log(`\x1b[33m█\x1b[0m Pending: ${pending} (${((pending / total) * 100).toFixed(2)}%)`);
  console.log(`\x1b[32m█\x1b[0m Approved: ${approved} (${((approved / total) * 100).toFixed(2)}%)`);
  console.log(`\x1b[34m█\x1b[0m Waiting update: ${waiting_update} (${((waiting_update / total) * 100).toFixed(2)}%)`);
  console.log(`\x1b[38;5;7m█\x1b[0m Draft: ${draft} (${((draft / total) * 100).toFixed(2)}%)`);
  let totalExcludingDraft = rejected + pending + approved + waiting_update;

  console.log(`\nTotal without draft: ${total}`);
  console.log(`\x1b[31m█\x1b[0m Rejected: ${rejected} (${((rejected / totalExcludingDraft) * 100).toFixed(2)}%)`);
  console.log(`\x1b[33m█\x1b[0m Pending: ${pending} (${((pending / totalExcludingDraft) * 100).toFixed(2)}%)`);
  console.log(`\x1b[32m█\x1b[0m Approved: ${approved} (${((approved / totalExcludingDraft) * 100).toFixed(2)}%)`);
  console.log(`\x1b[34m█\x1b[0m Waiting update: ${waiting_update} (${((waiting_update / totalExcludingDraft) * 100).toFixed(2)}%)`);

  console.log('\nRennes :');

  const rennes = result.filter(e => e.ownerCity.name === 'Rennes');
  const rennesTotal = rennes.length;
  const rennesRejected = rennes.filter(e => e.status === ProjectStatus.REJECTED).length;
  const rennesPending = rennes.filter(e => e.status === ProjectStatus.PENDING).length;
  const rennesApproved = rennes.filter(e => e.status === ProjectStatus.APPROVED).length;
  const rennesWaiting_update = rennes.filter(e => e.status === ProjectStatus.WAITING).length;

  const rennesStatuses: { [key: string]: number } = {
    rejected: rennes.filter(e => e.status === ProjectStatus.REJECTED).length,
    pending: rennes.filter(e => e.status === ProjectStatus.PENDING).length,
    approved: rennes.filter(e => e.status === ProjectStatus.APPROVED).length,
    waiting_update: rennes.filter(e => e.status === ProjectStatus.WAITING).length
  };

  console.log(getBarChart(rennesStatuses, rennesTotal));
  console.log(`Total: ${rennesTotal}`);
  console.log(`\x1b[31m█\x1b[0m Rejected: ${rennesRejected} (${((rennesRejected / rennesTotal) * 100).toFixed(2)}%)`);
  console.log(`\x1b[33m█\x1b[0m Pending: ${rennesPending} (${((rennesPending / rennesTotal) * 100).toFixed(2)}%)`);
  console.log(`\x1b[32m█\x1b[0m Approved: ${rennesApproved} (${((rennesApproved / rennesTotal) * 100).toFixed(2)}%)`);
  console.log(`\x1b[34m█\x1b[0m Waiting update: ${rennesWaiting_update} (${((rennesWaiting_update / rennesTotal) * 100).toFixed(2)}%)`);


}

generateMetrics();