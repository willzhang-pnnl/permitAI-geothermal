export default function EmptyState({
  title = "No data found",
  description = "",
}) {
  return (
    <div className="empty-state large">
      <strong>{title}</strong>
      {description && <span>{description}</span>}
    </div>
  );
}