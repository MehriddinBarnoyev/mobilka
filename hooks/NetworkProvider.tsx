// hooks/NetworkProvider.tsx
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";

type NetworkContextType = {
  isConnected: boolean;            // tarmoq interfeysi (WiFi/Cellular) mavjudligi
  isInternetReachable: boolean;    // NetInfo tomonidan qaytarilgan internet reachability (may be null)
  isOnline: boolean;               // biz hisoblagan yakuniy internet mavjudligi
};

const NetworkContext = createContext<NetworkContextType>({
  isConnected: false,
  isInternetReachable: false,
  isOnline: false,
});

const ACTIVE_PROBE_URL = "https://clients3.google.com/generate_204";
const PROBE_TIMEOUT_MS = 3000;

async function activeProbe(timeout = PROBE_TIMEOUT_MS): Promise<boolean> {
  // lightweight probe: google generate_204 returns 204 for connectivity check
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(ACTIVE_PROBE_URL, { method: "GET", signal: controller.signal });
    clearTimeout(id);
    console.log("[NetworkProvider][probe] probe response status:", res.status);
    return res.ok && res.status >= 200 && res.status < 300;
  } catch (err: any) {
    clearTimeout(id);
    console.log("[NetworkProvider][probe] probe error:", err?.message ?? err);
    return false;
  }
}

export const NetworkProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(false);

  const probingRef = useRef<Promise<boolean> | null>(null);

  useEffect(() => {
    let cancelled = false;

    // initial fetch
    NetInfo.fetch()
      .then((state: NetInfoState) => {
        if (cancelled) return;
        console.log("[NetworkProvider] NetInfo.fetch ->", state);
        setIsInternetReachable(state.isInternetReachable ?? null);
      })
      .catch((e) => {
        console.log("[NetworkProvider] NetInfo.fetch error:", e);
      });

    // subscribe to changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      if (cancelled) return;
      console.log("[NetworkProvider] NetInfo.event ->", state);
      setIsConnected(state.isConnected ?? false);
      setIsInternetReachable(state.isInternetReachable ?? null);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  // whenever connectivity flags change, decide final isOnline and probe if needed
  useEffect(() => {
    let mounted = true;

    async function decideOnline() {
      console.log(
        "[NetworkProvider] decideOnline() | isConnected:",
        isConnected,
        "isInternetReachable:",
        isInternetReachable,
      );

      // if no network interface -> offline
      if (!isConnected) {
        if (mounted) setIsOnline(false);
        return;
      }

      // if NetInfo explicitly says internet reachable true -> online
      if (isInternetReachable === true) {
        if (mounted) setIsOnline(true);
        return;
      }

      // if NetInfo says false OR null -> perform active probe (but avoid duplicate probes)
      if (probingRef.current == null) {
        console.log("[NetworkProvider] starting active probe...");
        const probePromise = activeProbe(PROBE_TIMEOUT_MS)
          .then((ok) => {
            console.log("[NetworkProvider] activeProbe result:", ok);
            return ok;
          })
          .catch((e) => {
            console.log("[NetworkProvider] activeProbe caught error:", e);
            return false;
          })
          .finally(() => {
            probingRef.current = null;
          });

        probingRef.current = probePromise;
      } else {
        console.log("[NetworkProvider] probe already in progress, reusing it");
      }

      const result = await probingRef.current;
      if (!mounted) return;
      setIsOnline(Boolean(result));
    }

    decideOnline();

    return () => {
      mounted = false;
    };
  }, [isConnected, isInternetReachable]);

  // debug render log
  console.log("[NetworkProvider] render ->", { isConnected, isInternetReachable, isOnline });

  return (
    <NetworkContext.Provider value={{ isConnected, isInternetReachable: Boolean(isInternetReachable), isOnline }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);
