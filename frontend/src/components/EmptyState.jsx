import { Inbox } from "lucide-react";

export default function EmptyState({ message = "Nothing here yet." }) {
  return (
    <div className="panel p-10 flex flex-col items-center justify-center text-gray-500 gap-2">
      <Inbox size={24} />
      <span>{message}</span>
    </div>
  );
}