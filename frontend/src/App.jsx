import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LiveMonitoring from "./pages/LiveMonitoring";
import Machines from "./pages/Machines";
import MachineDetail from "./pages/MachineDetail";
import MachineFloorView from "./pages/MachineFloorView";
import Sensors from "./pages/Sensors";
import SensorDetail from "./pages/SensorDetail";
import Devices from "./pages/Devices";
import DeviceDetail from "./pages/DeviceDetail";
import PredictiveMaintenance from "./pages/PredictiveMaintenance";
import Energy from "./pages/Energy";
import Alerts from "./pages/Alerts";
import AlertDetail from "./pages/AlertDetail";
import Maintenance from "./pages/Maintenance";
import MaintenanceDetail from "./pages/MaintenanceDetail";
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
          <Route path="/machine-floor" element={<MachineFloorView />} />
          <Route path="/sensors" element={<Sensors />} />
          <Route path="/sensors/:sensorId" element={<SensorDetail />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/devices/:deviceId" element={<DeviceDetail />} />
          <Route path="/predictive-maintenance" element={<PredictiveMaintenance />} />
          <Route path="/energy" element={<Energy />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/alerts/:alertId" element={<AlertDetail />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/maintenance/:recordId" element={<MaintenanceDetail />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}