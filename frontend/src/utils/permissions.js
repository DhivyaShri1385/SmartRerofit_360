/** Central role -> route access map, mirrors backend role guards. */
export const ROLE_PERMISSIONS = {
  admin: ["*"], // full access
  engineer: [
    "/", "/live-monitoring", "/machines", "/sensors",
    "/predictive-maintenance", "/maintenance", "/reports",
  ],
  operator: ["/", "/live-monitoring", "/alerts", "/maintenance"],
};

export function canAccessRoute(role, path) {
  if (!role) return false;
  const allowed = ROLE_PERMISSIONS[role];
  if (!allowed) return false;
  if (allowed.includes("*")) return true;
  // machine detail pages inherit /machines access
  if (path.startsWith("/machines/")) return allowed.includes("/machines");
  return allowed.includes(path);
}