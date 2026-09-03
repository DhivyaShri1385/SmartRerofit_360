// frontend/src/pages/Energy.jsx
import PageHeader from "../components/PageHeader";
import PlaceholderPanel from "../components/PlaceholderPanel";

export default function Energy() {
  return (
    <div>
      <PageHeader title="Energy Monitoring" description="Demo energy data — hardware validation pending" />
      <PlaceholderPanel label="Energy" />
    </div>
  );
}