import { createContext, Context } from "react";
import {
  Subscriber,
  Unsubscriber,
  ManualScroller,
  Listener,
  ManualScrollConfig,
} from "src/types";

interface ScrollContext {
  subscriber: [Subscriber, Unsubscriber];
  manualScroll: ManualScroller;
}

/**
 * Creates a scroll context with a non-null default value.
 */
export const createScrollContext = (): Context<ScrollContext> => {
  const subscriberFn = (listener: Listener): void => {
    listener;
  };

  const manualScrollFn = (config: ManualScrollConfig): void => {
    config;
  };

  const defaultContext: ScrollContext = {
    subscriber: [subscriberFn, subscriberFn],
    manualScroll: manualScrollFn,
  };

  return createContext(defaultContext);
};
