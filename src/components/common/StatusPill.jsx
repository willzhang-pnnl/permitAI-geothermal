import {
  CircleCheck,
  CircleDot,
} from "lucide-react";
import {
  formatStatus,
  statusClass,
} from "../../utils/projectUtils";

export default function StatusPill({ status }) {
  return (
    <span className={`status-pill ${statusClass(status)}`}>
      {status === "completed" ? (
        <CircleCheck size={13} />
      ) : (
        <CircleDot size={13} />
      )}
      {formatStatus(status)}
    </span>
  );
}