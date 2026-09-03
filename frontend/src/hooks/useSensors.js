import { useState, useEffect, useCallback } from "react";
import { getSensors } from "../services/sensorService";

export function useSensors(machineId = null) {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSensors(machineId);
      setSensors(data);
    } catch (err) {
      setError(err.message || "Failed to load sensors");
    } finally {
      setLoading(false);
    }
  }, [machineId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { sensors, loading, error, refresh };
}