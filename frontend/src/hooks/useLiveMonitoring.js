import { useState, useEffect, useCallback, useRef } from "react";
import { getLiveSnapshot } from "../services/liveMonitoringService";

const POLL_INTERVAL_MS = 5000; // matches backend simulation tick interval

export function useLiveMonitoring(machineId) {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const consecutiveFailures = useRef(0);

  const fetchSnapshot = useCallback(async () => {
    if (!machineId) return;
    try {
      const data = await getLiveSnapshot(machineId);
      setSnapshot(data);
      setConnectionError(false);
      consecutiveFailures.current = 0;
    } catch (err) {
      consecutiveFailures.current += 1;
      // Only surface a connection error after repeated failures, to avoid
      // flickering the UI on a single dropped request.
      if (consecutiveFailures.current >= 2) {
        setConnectionError(true);
      }
    } finally {
      setLoading(false);
    }
  }, [machineId]);

  useEffect(() => {
    setLoading(true);
    fetchSnapshot();
    const interval = setInterval(fetchSnapshot, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchSnapshot]);

  return { snapshot, loading, connectionError };
}