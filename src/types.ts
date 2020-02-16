export type CubicBezier = [number, number, number, number];

export interface ManualScrollConfig {
  to: number;
  duration: number;
  timing?: CubicBezier;
}

/** The function that will get called when the user scrolls. */
export type Listener = (scroll: number, max: number) => void;

export type Subscriber = (listener: Listener) => void;
export type Unsubscriber = (listener: Listener) => void;

export type ManualScroller = (config: ManualScrollConfig) => void;
