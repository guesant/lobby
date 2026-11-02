import { type PageLoadData, type SiteData } from '../content/content.types.ts';
import { textOr } from '../content/text.model.ts';
import { requiredText } from '../content/validation.model.ts';

export function buildMetadata(
  data: SiteData,
  localized: SiteData['links']['locales'][string],
  locale: string,
): PageLoadData['build'] {
  const repositoryURL = `${textOr(process.env['GITHUB_SERVER_URL'], 'https://github.com')}/${textOr(process.env['GITHUB_REPOSITORY'], data.links.site.repository)}`;

  const commitSHA = process.env['GITHUB_SHA'] ?? '';

  const runID = process.env['GITHUB_RUN_ID'] ?? '';

  function uiText(key: string): string {
    return requiredText(localized.ui[key], `links.locales.${locale}.ui.${key}`);
  }

  function resolveCommitLabel(): string {
    if (commitSHA.length > 7) {
      return commitSHA.slice(0, 7);
    }

    return uiText('local_commit');
  }

  function resolveWorkflowURL(): string {
    if (runID) {
      return `${repositoryURL}/actions/runs/${runID}`;
    }

    return repositoryURL;
  }

  function resolveBuildLabel(): string {
    if (runID) {
      return uiText('footer_workflow');
    }

    return uiText('local_build');
  }

  const build = {
    commitLabel: resolveCommitLabel(),
    commitURL: `${repositoryURL}/commit/${commitSHA}`,
    versionLabel: uiText('footer_version'),
    workflowLabel: uiText('footer_workflow'),
    buildLabel: resolveBuildLabel(),
    workflowURL: resolveWorkflowURL(),
  };

  return build;
}
