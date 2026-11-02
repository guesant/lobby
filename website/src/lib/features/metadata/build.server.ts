import { type PageLoadData, type SiteData } from '../content/content.types.ts';
import { requiredText } from '../content/required-text.model.ts';
import { textOr } from '../content/text-or.model.ts';
import { buildLabel } from './build-label.server.ts';
import { commitLabel } from './commit-label.server.ts';
import { workflowURL } from './workflow-url.server.ts';

export function buildMetadata(
  data: SiteData,
  localized: SiteData['links']['locales'][string],
  locale: string,
): PageLoadData['build'] {
  const repositoryURL = `${textOr(process.env['GITHUB_SERVER_URL'], 'https://github.com')}/${textOr(process.env['GITHUB_REPOSITORY'], data.links.site.repository)}`;

  const commitSHA = process.env['GITHUB_SHA'] ?? '';

  const runID = process.env['GITHUB_RUN_ID'] ?? '';

  const runNumber = textOr(process.env['GITHUB_RUN_NUMBER'], runID);

  const build = {
    commitLabel: commitLabel(commitSHA, localized.ui, locale),
    commitURL: `${repositoryURL}/commit/${commitSHA}`,
    versionLabel: requiredText(
      localized.ui['footer_version'],
      `links.locales.${locale}.ui.footer_version`,
    ),
    workflowLabel: requiredText(
      localized.ui['footer_workflow'],
      `links.locales.${locale}.ui.footer_workflow`,
    ),
    buildLabel: buildLabel({
      locale,
      localized: localized.ui,
      runID,
      runNumber,
    }),
    workflowURL: workflowURL(repositoryURL, runID),
  };

  return build;
}
