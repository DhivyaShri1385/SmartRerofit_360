import { AlertTriangle } from "lucide-react";

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="panel p-6 flex items-center gap-3 text-status-critical">
      <AlertTriangle size={18} />
      <span>{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="ml-auto text-xs underline shrink-0">
          Retry
        </button>
      )}
    </div>
  );
}