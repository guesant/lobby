export type ProcessState = {
  name: string;
  reject: (reason: Error) => void;
  resolve: (value: undefined) => void;
};
