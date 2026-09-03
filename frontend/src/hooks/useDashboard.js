import { useState, useEffect, useCallback } from "react";
import { getDashboardOverview } from "../services/dashboardService";

const POLL_INTERVAL_MS = 15000; // demo refresh cadence

export function useDashboard(machineId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!machineId) return;
    try {
      const overview = await getDashboardOverview(machineId);
      setData(overview);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [machineId]);

  useEffect(() => {
    setLoading(true);
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}