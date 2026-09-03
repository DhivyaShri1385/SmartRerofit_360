// frontend/src/pages/Dashboard.jsx
import PageHeader from "../components/PageHeader";
import PlaceholderPanel from "../components/PlaceholderPanel";

export default function Dashboard() {
  return (
    <div>
      <PageHeader title="Dashboard" description="Machine-level overview — Lathe-01" />
      <PlaceholderPanel label="Dashboard" />
    </div>
  );
}