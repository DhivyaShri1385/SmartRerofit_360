import { useState, useEffect, useCallback } from "react";
import { getSensorHistory } from "../services/sensorReadingService";

const POLL_INTERVAL_MS = 6000;

export function useSensorHistory(sensorId, limit = 60) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    if (!sensorId) return;
    try {
      const data = await getSensorHistory(sensorId, limit);
      setHistory(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load sensor history");
    } finally {
      setLoading(false);
    }
  }, [sensorId, limit]);

  useEffect(() => {
    setLoading(true);
    fetchHistory();
    const interval = setInterval(fetchHistory, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchHistory]);

  return { history, loading, error };
}