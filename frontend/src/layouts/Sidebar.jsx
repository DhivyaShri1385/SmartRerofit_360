import { NavLink } from "react-router-dom";
import * as Icons from "lucide-react";
import { NAV_ITEMS } from "../utils/constants";
import { useAuth } from "../context/AuthContext";
import { canAccessRoute } from "../utils/permissions";

export default function Sidebar({ collapsed, onClose }) {
  const { user } = useAuth();
  const visibleItems = NAV_ITEMS.filter((item) => canAccessRoute(user?.role, item.path));

  return (
    <aside
      className={`h-full bg-surface-panel border-r border-surface-border flex flex-col
        transition-all duration-200 ${collapsed ? "w-16" : "w-64"}`}
    >
      <div className="h-14 flex items-center gap-2 px-4 border-b border-surface-border">
        <Icons.Cpu className="text-accent shrink-0" size={22} />
        {!collapsed && (
          <span className="font-semibold tracking-tight text-gray-100 whitespace-nowrap">
            SmartRetrofit 360
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {visibleItems.map((item) => {
          const Icon = Icons[item.icon] || Icons.Circle;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors
                 ${isActive
                   ? "bg-accent/15 text-accent"
                   : "text-gray-400 hover:bg-surface-elevated hover:text-gray-200"}`
              }
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="p-3 border-t border-surface-border text-[11px] text-gray-500">
          v0.1.0 · Prototype build
        </div>
      )}
    </aside>
  );
}