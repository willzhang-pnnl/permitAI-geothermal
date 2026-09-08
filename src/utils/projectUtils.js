export const ACTIVITY_GROUPS = [
  {
    key: "leasing",
    label: "Leasing",
  },
  {
    key: "surface_exploration",
    label: "Surface Exploration",
  },
  {
    key: "utilization_construction",
    label: "Utilization Construction",
  },
  {
    key: "utilization_well_development_subsurface",
    label: "Utilization Well Development",
  },
  {
    key: "safety_environmental",
    label: "Safety & Environmental",
  },
  {
    key: "surface_operations_maintenance",
    label: "Surface Operations & Maintenance",
  },
  {
    key: "subsurface_operations_maintenance",
    label: "Subsurface Operations & Maintenance",
  },
  {
    key: "project_abandonment_reclamation",
    label: "Project Abandonment & Reclamation",
  },
  {
    key: "decommissioning_reclamation",
    label: "Decommissioning & Reclamation",
  },
];

export function getActivityGroup(project, groupKey) {
  return project?.activity_groups?.[groupKey] || {
    process_status: null,
    activities: [],
  };
}

export function getStatus(project, groupKey) {
  return getActivityGroup(project, groupKey).process_status || "not started";
}

export function getFacilities(project) {
  return project?.facilities || [];
}

export function getTotalCapacity(project) {
  return getFacilities(project).reduce(
    (total, facility) => total + Number(facility.unit_capacity_mw || 0),
    0
  );
}

export function getCompletedGroups(project) {
  return ACTIVITY_GROUPS.filter(
    (group) => getStatus(project, group.key) === "completed"
  ).length;
}

export function getProjectProgress(project) {
  return Math.round(
    (getCompletedGroups(project) / ACTIVITY_GROUPS.length) * 100
  );
}

export function getProjectDocuments(project) {
  const documents = [];

  Object.entries(project?.activity_groups || {}).forEach(
    ([groupKey, group]) => {
      if (groupKey === "_notes") return;

      (group.activities || []).forEach((activity) => {
        if (activity.document_availability_flag && activity.document) {
          documents.push({
            ...activity.document,
            activityType: activity.activity_type,
            groupKey,
          });
        }
      });
    }
  );

  return documents;
}

export function formatStatus(status) {
  return String(status || "not started")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function statusClass(status) {
  switch (status) {
    case "completed":
      return "status-completed";
    case "in progress":
      return "status-progress";
    case "paused":
      return "status-paused";
    case "cancelled":
      return "status-cancelled";
    default:
      return "status-planned";
  }
}

/**
 * El endpoint de detalle anterior devuelve state/county de forma plana.
 * Esta función permite que los componentes trabajen siempre con
 * project.location.
 */
export function normalizeProject(project) {
  if (!project) return null;

  return {
    ...project,
    location: project.location || {
      state: project.state || null,
      county: project.county || null,
      township_range: project.township_range || null,
      state_fips: project.state_fips || null,
      county_fips: project.county_fips || null,
    },
  };
}