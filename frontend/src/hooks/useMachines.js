import { useState, useEffect, useCallback } from "react";
import { getMachines } from "../services/machineService";

export function useMachines() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMachines();
      setMachines(data);
    } catch (err) {
      setError(err.message || "Failed to load machines");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { machines, loading, error, refresh };
}