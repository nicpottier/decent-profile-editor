export const MAX_TEMP = 110;
export const MIN_TEMP = 40;

export const MAX_PRESSURE = 12;
export const MIN_PRESSURE = 0;

export const MAX_FLOW = 11;
export const MIN_FLOW = 0;

export interface Profile {
  name: string;
  description?: string;
  author?: string;
  frames: Array<Frame>;
}

export interface Frame {
  name: string;
  temp: number;
  duration: number;
  target: Target;
  trigger?: Trigger;
}

export interface FrameUpdate {
  index: number;
  frame: Frame;
}

export interface Target {
  type: TargetType;
  value: number;
  interpolate: boolean;
}

export interface Trigger {
  type: TriggerType;
  value: number;
  operator: TriggerOperator;
}

export enum TargetType {
  Pressure = 'pressure',
  Flow = 'flow',
}

export enum TriggerType {
  Pressure = 'pressure',
  Flow = 'flow',
}

export enum TriggerOperator {
  GreaterThan = 'greater_than',
  LessThan = 'less_than',
}
