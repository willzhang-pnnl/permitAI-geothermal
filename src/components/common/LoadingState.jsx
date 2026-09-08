export default function LoadingState({ message = "Loading data..." }) {
  return (
    <div className="loading-state">
      <div className="loading-spinner" />
      <span>{message}</span>
    </div>
  );
}