export type SecurityOperation = {
  kind: 'renovate' | 'osv' | 'filesystem' | 'sbom-generation' | 'semgrep';
};

export type SecurityAuditResult = {
  failures: string[];
};
