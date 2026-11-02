export function repositoryTotals(
  repositories: Map<
    number,
    {
      stars: number;
      forks: number;
    }
  >,
): {
  stars: number;
  forks: number;
} {
  let stars = 0;

  let forks = 0;

  for (const repository of repositories.values()) {
    stars += repository.stars;
    forks += repository.forks;
  }

  return {
    stars,
    forks,
  };
}
