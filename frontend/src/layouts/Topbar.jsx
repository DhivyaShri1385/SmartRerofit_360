import { Menu, Wifi, WifiOff, UserCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getSystemHealth } from "../services/healthService";

export default function Topbar({ onToggleSidebar }) {
  const [connected, setConnected] = useState(null);

  useEffect(() => {
    let mounted = true;
    getSystemHealth()
      .then(() => mounted && setConnected(true))
      .catch(() => mounted && setConnected(false));
    return () => { mounted = false; };
  }, []);

  return (
    <header className="h-14 bg-surface-panel border-b border-surface-border flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded hover:bg-surface-elevated text-gray-400"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>
        <span className="demo-tag">Demo Data</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs">
          {connected === null ? (
            <span className="text-gray-500">Checking backend…</span>
          ) : connected ? (
            <>
              <Wifi size={14} className="text-status-normal" />
              <span className="text-status-normal">Backend Online</span>
            </>
          ) : (
            <>
              <WifiOff size={14} className="text-status-critical" />
              <span className="text-status-critical">Backend Unreachable</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <UserCircle2 size={22} className="text-gray-500" />
          <span className="hidden sm:inline">Guest User</span>
        </div>
      </div>
    </header>
  );
}