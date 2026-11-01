import { resolve } from 'node:path';

const repositoryRoot = resolve(import.meta.dirname, '../..');

const websiteRoot = resolve(repositoryRoot, 'website');

export { websiteRoot };
