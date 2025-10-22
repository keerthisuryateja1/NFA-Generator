export enum QualityType {
  STARTS_WITH = 'starts with',
  ENDS_WITH = 'ends with',
  CONTAINS = 'contains',
}

export interface Quality {
  id: number;
  type: QualityType;
  value: string;
}

export interface TransitionMap {
  [state: string]: {
    [symbol: string]: string[];
  };
}

export interface NFA {
  states: string[];
  alphabet: string[];
  transitions: TransitionMap;
  startState: string;
  finalStates: string[];
  deadState: string | null;
}
