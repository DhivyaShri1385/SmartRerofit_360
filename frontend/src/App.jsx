import { Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import LiveMonitoring from "./pages/LiveMonitoring";
import Machines from "./pages/Machines";
import Sensors from "./pages/Sensors";
import PredictiveMaintenance from "./pages/PredictiveMaintenance";
import Energy from "./pages/Energy";
import Alerts from "./pages/Alerts";
import Maintenance from "./pages/Maintenance";
import Reports from "./pages/Reports";
import SettingsPage from "./pages/SettingsPage";
import Machines from "./pages/Machines";
import MachineDetail from "./pages/MachineDetail";

export default function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/live-monitoring" element={<LiveMonitoring />} />
        <Route path="/machines" element={<Machines />} />
        <Route path="/sensors" element={<Sensors />} />
        <Route path="/predictive-maintenance" element={<PredictiveMaintenance />} />
        <Route path="/energy" element={<Energy />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/machines" element={<Machines />} />
<Route path="/machines/:machineId" element={<MachineDetail />} />
      </Route>
    </Routes>
  );
}