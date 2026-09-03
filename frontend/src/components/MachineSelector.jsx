export default function MachineSelector({ machines, selectedId, onChange }) {
  return (
    <select
      value={selectedId || ""}
      onChange={(e) => onChange(e.target.value)}
      className="bg-surface-elevated border border-surface-border rounded text-sm text-gray-200 px-3 py-1.5"
    >
      {machines.map((m) => (
        <option key={m.id} value={m.id}>{m.name}</option>
      ))}
    </select>
  );
}