export type RowSnapshot = {
  color: string;
  background: string;
  outline: string;
  shadow: string;
  padding: [
    string,
    string,
    string,
    string,
  ];
  height: number;
  width: number;
};

export type StateName = 'normal' | 'hover' | 'focus' | 'active';

export type RowStates = Record<StateName, RowSnapshot>;
