export type RunPlan = {
  operation: string;
  update_statistics: boolean;
  source_sha: string;
  publish: boolean;
};

export type GithubFetcher = (
  url: string,
  options?: RequestInit,
) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}>;
