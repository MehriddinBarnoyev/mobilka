// useSecurity.ts
import { useSyncExternalStore } from 'react';

// Internal global state
let isSecured = false;
let listeners = new Set<() => void>();

const subscribe = (callback: () => void) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

const getSnapshot = () => isSecured;

const setIsSecured = (value: boolean) => {
    console.log('setIsSecured', value);
  isSecured = value;
  listeners.forEach(cb => cb());
};

export function useSecurity() {
  const current = useSyncExternalStore(subscribe, getSnapshot);
  return {
    isSecured: current,
    setIsSecured,
  };
}
