import { Loader2 } from "lucide-react";

export default function LoadingState({ label = "Loading…" }) {
  return (
    <div className="panel p-10 flex items-center justify-center text-gray-500 gap-2">
      <Loader2 size={18} className="animate-spin" /> {label}
    </div>
  );
}