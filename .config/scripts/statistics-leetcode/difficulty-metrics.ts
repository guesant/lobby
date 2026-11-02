import { countFor } from './count-for.ts';

export function difficultyMetrics(
  solved: unknown[],
  totals: unknown[],
  metrics: Record<string, number>,
): Record<string, number> {
  const available: Record<string, number> = {};

  for (const difficulty of [
    'All',
    'Easy',
    'Medium',
    'Hard',
  ]) {
    let key = difficulty.toLowerCase();

    if (difficulty === 'All') {
      key = 'solved';
    }

    const count = countFor(solved, difficulty);

    const total = countFor(totals, difficulty);

    if (count > total) {
      throw new Error('Solved count exceeds total');
    }

    metrics[key] = count;
    available[key] = total;
  }

  if (
    countFor(solved, 'Easy') +
      countFor(solved, 'Medium') +
      countFor(solved, 'Hard') !==
    countFor(solved, 'All')
  ) {
    throw new Error('LeetCode difficulty counts do not add up');
  }

  return available;
}
