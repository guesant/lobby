import { contentFileVersion } from './content-file-version.server.ts';
import { contentFiles } from './content-files.model.ts';

export async function contentSignature(root: string): Promise<string> {
  const getVersion = contentFileVersion.bind(null, root);

  const versionPromises = contentFiles.map(getVersion);

  const versions = await Promise.all(versionPromises);

  return versions.join('|');
}
