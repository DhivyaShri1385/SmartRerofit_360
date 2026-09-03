/** Used across shell pages until each module's real UI is built. */
export default function PlaceholderPanel({ label }) {
  return (
    <div className="panel p-8 flex items-center justify-center text-gray-500 text-sm min-h-[200px]">
      {label} — module under construction
    </div>
  );
}