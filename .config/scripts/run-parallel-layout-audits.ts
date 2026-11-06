import checkBiosBrowser from './check-bios-browser.ts';
import checkCompactControls from './check-compact-controls.ts';
import checkComponentParity from './check-component-parity.ts';
import checkLanguageBrowser from './check-language-browser.ts';
import checkLinkViewBrowser from './check-link-view-browser.ts';
import checkListingBrowser from './check-listing-browser.ts';
import checkNativeRuntime from './check-native-runtime-browser.ts';
import checkNavigationBrowser from './check-navigation-browser.ts';
import checkTerminalBrowser from './check-terminal-browser.ts';
import { runLayoutAuditBatch } from './run-layout-audit-batch.ts';
import type { Browser } from 'puppeteer-core';

export async function runParallelLayoutAudits(
  browser: Browser,
  baseURL: string,
  reportDirectory: string,
): Promise<void> {
  const navigationAudit = checkNavigationBrowser({
    browser,
    baseURL,
    reportDirectory,
  });

  const languageAudit = checkLanguageBrowser(browser, baseURL);

  const listingAudit = checkListingBrowser(browser, baseURL, reportDirectory);

  await runLayoutAuditBatch([
    navigationAudit,
    languageAudit,
    listingAudit,
  ]);

  const parityAudit = checkComponentParity({
    browser,
    baseURL,
    reportDirectory,
  });

  const linkViewAudit = checkLinkViewBrowser(browser, baseURL, reportDirectory);

  const controlsAudit = checkCompactControls(browser, baseURL, reportDirectory);

  await runLayoutAuditBatch([
    parityAudit,
    linkViewAudit,
    controlsAudit,
  ]);

  const terminalAudit = checkTerminalBrowser(browser, baseURL, reportDirectory);

  const biosAudit = checkBiosBrowser(browser, baseURL, reportDirectory);

  const runtimeAudit = checkNativeRuntime(browser, baseURL);

  await runLayoutAuditBatch([
    terminalAudit,
    biosAudit,
    runtimeAudit,
  ]);
}
