import type { Package } from '@github/dependency-submission-toolkit';

export type SnapshotContext = {
  eventName: string;
  job: string;
  payload: Record<string, unknown>;
  ref: string;
  repo: {
    owner: string;
    repo: string;
  };
  runId: number;
  sha: string;
};

export type SnapshotEnvironment = {
  ref: string | undefined;
  repository: string[] | undefined;
  runId: number;
  sha: string | undefined;
};

export type SnapshotTarget = {
  directory: string;
  id: string;
  lockfile: string;
};

export type CycloneDXComponent = {
  bomRef: string;
  purl: string;
};

type CycloneDXDependency = {
  dependsOn: string[];
  ref: string;
};

export type CycloneDXModel = {
  components: CycloneDXComponent[];
  dependencies: CycloneDXDependency[];
  rootDependencies: string[];
};

export type CycloneDXDependencyList = {
  dependencies: CycloneDXDependency[];
  rootDependencies: string[];
};

export type PackageManifestDependencies = {
  development: Record<string, unknown>;
  optional: Record<string, unknown>;
  runtime: Record<string, unknown>;
};

export type SnapshotManifestInput = {
  dependencies: PackageManifestDependencies;
  model: CycloneDXModel;
  packages: Map<string, Package>;
  target: SnapshotTarget;
};
