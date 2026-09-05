export const ROLE_PERMISSIONS = {
  admin: ["*"],
  engineer: [
    "/", "/live-monitoring", "/machines", "/machine-floor", "/sensors", "/devices",
    "/predictive-maintenance", "/maintenance", "/reports",
  ],
  operator: ["/", "/live-monitoring", "/machine-floor", "/alerts", "/maintenance"],
};

export function canAccessRoute(role, path) {
  if (!role) return false;
  const allowed = ROLE_PERMISSIONS[role];
  if (!allowed) return false;
  if (allowed.includes("*")) return true;
  if (path.startsWith("/machines/")) return allowed.includes("/machines");
  if (path.startsWith("/devices/")) return allowed.includes("/devices");
  return allowed.includes(path);
}