import {
  record,
  requiredText,
} from '../../../website/src/lib/features/content/validation.model.ts';
import { integer } from '../statistics-request.ts';

export function collectRepository(
  value: unknown,
  username: string,
  repositories: Map<
    number,
    {
      stars: number;
      forks: number;
    }
  >,
): void {
  const repository = record(value, 'GitHub repository');

  const id = integer(repository['id']);

  if (repository['private'] !== false || !id) {
    throw new Error('Repository response is not explicitly public');
  }

  const ownerRecord = record(repository['owner'], 'GitHub repository owner');

  const owner = requiredText(
    ownerRecord['login'],
    'GitHub repository owner login',
  );

  if (owner.toLowerCase() !== username.toLowerCase()) {
    throw new Error('Repository belongs to another account');
  }

  const stars = integer(repository['stargazers_count']);

  const forks = integer(repository['forks_count']);

  repositories.set(id, {
    stars,
    forks,
  });
}
