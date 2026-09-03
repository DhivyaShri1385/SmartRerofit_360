// frontend/src/pages/LiveMonitoring.jsx
import PageHeader from "../components/PageHeader";
import PlaceholderPanel from "../components/PlaceholderPanel";

export default function LiveMonitoring() {
  return (
    <div>
      <PageHeader title="Live Machine Monitoring" description="Simulated real-time parameter streaming" />
      <PlaceholderPanel label="Live Monitoring" />
    </div>
  );
}