// useSecurity.ts
import { useSyncExternalStore } from 'react';

// Internal global state
let isLoggedin = false;
let listeners = new Set<() => void>();

const subscribe = (callback: () => void) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

const getSnapshot = () => isLoggedin;

const setIsLoggedIn = (value: boolean) => {
  isLoggedin = value;
  listeners.forEach(cb => cb());
};

// Custom global hook
export function useAuth() {
  const current = useSyncExternalStore(subscribe, getSnapshot);
  return {
    isLoggedin: current,
    setIsLoggedIn,
  };
}
