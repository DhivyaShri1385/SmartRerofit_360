import { Menu, Wifi, WifiOff, UserCircle2, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSystemHealth } from "../services/healthService";
import { useAuth } from "../context/AuthContext";

export default function Topbar({ onToggleSidebar }) {
  const [connected, setConnected] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    getSystemHealth()
      .then(() => mounted && setConnected(true))
      .catch(() => mounted && setConnected(false));
    return () => { mounted = false; };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

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
          <div className="hidden sm:flex flex-col leading-tight">
            <span>{user?.full_name || user?.username}</span>
            <span className="text-[10px] text-gray-500 capitalize">{user?.role}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-1.5 rounded hover:bg-surface-elevated text-gray-400 hover:text-status-critical"
          aria-label="Logout"
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}