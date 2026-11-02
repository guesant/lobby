export const statisticsPath = 'website/src/data/statistics.yaml';

export const commitArguments = [
  '-c',
  'user.name=github-actions[bot]',
  '-c',
  'user.email=41898282+github-actions[bot]@users.noreply.github.com',
  'commit',
  '--only',
  '-m',
  'chore(stats): refresh public statistics',
  '--',
  statisticsPath,
];
