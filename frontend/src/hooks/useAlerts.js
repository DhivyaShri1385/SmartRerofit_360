import { useState, useEffect, useCallback } from "react";
import { getAlerts } from "../services/alertService";

const POLL_INTERVAL_MS = 8000;

export function useAlerts(filters = {}) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const data = await getAlerts(filters);
      setAlerts(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    setLoading(true);
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  return { alerts, loading, error, refresh };
}