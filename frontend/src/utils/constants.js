export const MACHINE_STATUS = {
  NORMAL: "normal",
  WARNING: "warning",
  CRITICAL: "critical",
  OFFLINE: "offline",
};

export const ALERT_LEVEL = {
  INFORMATION: "information",
  WARNING: "warning",
  CRITICAL: "critical",
};

export const NAV_ITEMS = [
  { label: "Dashboard", path: "/", icon: "LayoutDashboard" },
  { label: "Live Monitoring", path: "/live-monitoring", icon: "Activity" },
  { label: "Machines", path: "/machines", icon: "Settings2" },
  { label: "Sensors", path: "/sensors", icon: "Radio" },
  { label: "Predictive Maintenance", path: "/predictive-maintenance", icon: "Brain" },
  { label: "Energy", path: "/energy", icon: "Zap" },
  { label: "Alerts", path: "/alerts", icon: "Bell" },
  { label: "Maintenance", path: "/maintenance", icon: "Wrench" },
  { label: "Reports", path: "/reports", icon: "FileBarChart" },
  { label: "Settings", path: "/settings", icon: "SlidersHorizontal" },
];