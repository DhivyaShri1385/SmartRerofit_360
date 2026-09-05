import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { createMaintenanceRecord } from "../services/maintenanceService";

const TYPES = ["preventive", "corrective", "inspection", "condition_based"];

export default function MaintenanceFormModal({ machines, defaultMachineId, onClose, onCreated }) {
  const [form, setForm] = useState({
    machine_id: defaultMachineId || (machines[0]?.id ?? ""),
    maintenance_type: "preventive",
    description: "",
    performed_by: "",
    parts_used: "",
    scheduled_date: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        scheduled_date: form.scheduled_date ? new Date(form.scheduled_date).toISOString() : null,
      };
      const created = await createMaintenanceRecord(payload);
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create maintenance record");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="panel w-full max-w-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-200">New Maintenance Record</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Machine</label>
            <select
              value={form.machine_id}
              onChange={(e) => setForm((f) => ({ ...f, machine_id: e.target.value }))}
              className="w-full bg-surface-elevated border border-surface-border rounded px-3 py-2 text-sm text-gray-100"
              required
            >
              {machines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Type</label>
            <select
              value={form.maintenance_type}
              onChange={(e) => setForm((f) => ({ ...f, maintenance_type: e.target.value }))}
              className="w-full bg-surface-elevated border border-surface-border rounded px-3 py-2 text-sm text-gray-100"
            >
              {TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full bg-surface-elevated border border-surface-border rounded px-3 py-2 text-sm text-gray-100"
              rows={2}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Performed By</label>
              <input
                value={form.performed_by}
                onChange={(e) => setForm((f) => ({ ...f, performed_by: e.target.value }))}
                className="w-full bg-surface-elevated border border-surface-border rounded px-3 py-2 text-sm text-gray-100"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Scheduled Date</label>
              <input
                type="datetime-local"
                value={form.scheduled_date}
                onChange={(e) => setForm((f) => ({ ...f, scheduled_date: e.target.value }))}
                className="w-full bg-surface-elevated border border-surface-border rounded px-3 py-2 text-sm text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Parts Used</label>
            <input
              value={form.parts_used}
              onChange={(e) => setForm((f) => ({ ...f, parts_used: e.target.value }))}
              className="w-full bg-surface-elevated border border-surface-border rounded px-3 py-2 text-sm text-gray-100"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="w-full bg-surface-elevated border border-surface-border rounded px-3 py-2 text-sm text-gray-100"
              rows={2}
            />
          </div>

          {error && <div className="text-xs text-status-critical">{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="text-sm px-4 py-2 rounded border border-surface-border text-gray-400 hover:text-gray-200">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded bg-accent hover:bg-accent-muted text-white disabled:opacity-60"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Create Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}