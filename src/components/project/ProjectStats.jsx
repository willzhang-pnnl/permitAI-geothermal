import {
  Building2,
  CircleCheck,
  FileText,
  Zap,
} from "lucide-react";

import {
  ACTIVITY_GROUPS,
  getCompletedGroups,
  getFacilities,
  getProjectDocuments,
  getTotalCapacity,
} from "../../utils/projectUtils";

export default function ProjectStats({ project }) {
  const facilities = getFacilities(project);
  const documents = getProjectDocuments(project);
  const completed = getCompletedGroups(project);

  const stats = [
    {
      label: "Total Capacity",
      value: `${getTotalCapacity(project)} MW`,
      icon: <Zap size={20} />,
      color: "blue",
    },
    {
      label: "Facilities",
      value: facilities.length,
      icon: <Building2 size={20} />,
      color: "purple",
    },
    {
      label: "Completed Phases",
      value: `${completed}/${ACTIVITY_GROUPS.length}`,
      icon: <CircleCheck size={20} />,
      color: "green",
    },
    {
      label: "Documents",
      value: documents.length,
      icon: <FileText size={20} />,
      color: "orange",
    },
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat) => (
        <div className="stat-card" key={stat.label}>
          <div className={`stat-icon ${stat.color}`}>
            {stat.icon}
          </div>

          <div>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}