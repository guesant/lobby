export type CycleFrame = {
  module: string;
  dependencyIndex: number;
  entered: boolean;
};

export type CycleState = {
  active: Map<string, number>;
  path: string[];
  visited: Set<string>;
  cycles: string[][];
};
