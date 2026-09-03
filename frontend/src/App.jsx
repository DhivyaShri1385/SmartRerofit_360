import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LiveMonitoring from "./pages/LiveMonitoring";
import Machines from "./pages/Machines";
import MachineDetail from "./pages/MachineDetail";
import Sensors from "./pages/Sensors";
import PredictiveMaintenance from "./pages/PredictiveMaintenance";
import Energy from "./pages/Energy";
import Alerts from "./pages/Alerts";
import Maintenance from "./pages/Maintenance";
import Reports from "./pages/Reports";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/live-monitoring" element={<LiveMonitoring />} />
          <Route path="/machines" element={<Machines />} />
          <Route path="/machines/:machineId" element={<MachineDetail />} />
          <Route path="/sensors" element={<Sensors />} />
          <Route path="/predictive-maintenance" element={<PredictiveMaintenance />} />
          <Route path="/energy" element={<Energy />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}