export default function PageHeader({ title, description }) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-semibold text-gray-100">{title}</h1>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
    </div>
  );
}