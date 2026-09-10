export const ACTIVITY_GROUP_LABELS = {
  leasing: "Leasing",
  surface_exploration: "Surface Exploration",
  resource_confirmation: "Resource Confirmation",
  utilization_well_development_subsurface: "Utilization Well Development",
  utilization_construction: "Utilization Construction",
  production_well_development: "Production Well Development",
  transmission: "Transmission",
  safety_environmental: "Safety & Environmental",
  surface_operations_maintenance: "Surface Operations & Maintenance",
  subsurface_operations_maintenance: "Subsurface Operations & Maintenance",
  reclamation: "Reclamation",
  project_abandonment_reclamation: "Project Abandonment & Reclamation",
  decommissioning_reclamation: "Decommissioning & Reclamation",
};

export const STANDARD_ACTIVITY_GROUPS = [
  { key: "leasing", label: "Leasing" },
  { key: "surface_exploration", label: "Surface Exploration" },
  { key: "resource_confirmation", label: "Resource Confirmation" },
  { key: "utilization_well_development_subsurface", label: "Utilization Well Development" },
  { key: "utilization_construction", label: "Utilization Construction" },
  { key: "production_well_development", label: "Production Well Development" },
  { key: "transmission", label: "Transmission" },
  { key: "safety_environmental", label: "Safety & Environmental" },
  { key: "reclamation", label: "Reclamation" },
];

export function formatLabel(key) {
  if (!key) return "";
  return String(key)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/**
 * Returns the ordered list of activity groups present on the project.
 * Falls back to STANDARD_ACTIVITY_GROUPS if project has no groups defined.
 */
export function getProjectActivityGroups(project) {
  if (!project?.activity_groups) {
    return STANDARD_ACTIVITY_GROUPS;
  }

  const rawKeys = Object.keys(project.activity_groups).filter(
    (key) => key !== "_notes"
  );

  if (rawKeys.length === 0) {
    return STANDARD_ACTIVITY_GROUPS;
  }

  // Preserve standard ordering for known keys, then append any custom keys
  const standardKeysOrder = Object.keys(ACTIVITY_GROUP_LABELS);
  const sortedKeys = [...rawKeys].sort((a, b) => {
    const idxA = standardKeysOrder.indexOf(a);
    const idxB = standardKeysOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  return sortedKeys.map((key) => ({
    key,
    label: ACTIVITY_GROUP_LABELS[key] || formatLabel(key),
  }));
}

export const ACTIVITY_GROUPS = STANDARD_ACTIVITY_GROUPS;

export function getActivityGroup(project, groupKey) {
  return (
    project?.activity_groups?.[groupKey] || {
      process_status: null,
      activities: [],
    }
  );
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
  const groups = getProjectActivityGroups(project);
  return groups.filter(
    (group) => getStatus(project, group.key) === "completed"
  ).length;
}

export function getProjectProgress(project) {
  const groups = getProjectActivityGroups(project);
  if (groups.length === 0) return 0;

  const completed = groups.filter(
    (group) => getStatus(project, group.key) === "completed"
  ).length;

  return Math.round((completed / groups.length) * 100);
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
            groupLabel: ACTIVITY_GROUP_LABELS[groupKey] || formatLabel(groupKey),
            projectId: project.project_id,
            projectName: project.project_name,
            projectState: project.location?.state || project.state,
          });
        }
      });
    }
  );

  return documents;
}

/**
 * Extracts all regulatory documents from an array of projects.
 */
export function getAllDocuments(projects = []) {
  return projects.flatMap((project) => getProjectDocuments(project));
}

/**
 * Extracts distinct US states represented in the projects collection.
 */
export function getUniqueStates(projects = []) {
  const states = new Set();
  projects.forEach((p) => {
    const state = p.location?.state || p.state;
    if (state) states.add(state);
  });
  return Array.from(states).sort();
}

/**
 * Extracts distinct generation technologies across all project facilities.
 */
export function getUniqueTechnologies(projects = []) {
  const technologies = new Set();
  projects.forEach((p) => {
    (p.facilities || []).forEach((f) => {
      if (f.technology_type) technologies.add(f.technology_type);
    });
  });
  return Array.from(technologies).sort();
}

/**
 * Computes portfolio-wide aggregates for overview dashboard.
 */
export function getPortfolioStats(projects = []) {
  let totalCapacity = 0;
  let totalFacilities = 0;
  const stateCapacityMap = {};
  const technologyMap = {};

  projects.forEach((project) => {
    const facilities = project.facilities || [];
    totalFacilities += facilities.length;

    const state = project.location?.state || project.state || "Unknown";

    facilities.forEach((facility) => {
      const mw = Number(facility.unit_capacity_mw || 0);
      totalCapacity += mw;

      stateCapacityMap[state] = (stateCapacityMap[state] || 0) + mw;

      const tech = facility.technology_type || "Other";
      if (!technologyMap[tech]) {
        technologyMap[tech] = { count: 0, mw: 0 };
      }
      technologyMap[tech].count += 1;
      technologyMap[tech].mw += mw;
    });
  });

  const allDocs = getAllDocuments(projects);

  return {
    totalProjects: projects.length,
    totalCapacity,
    totalFacilities,
    totalDocuments: allDocs.length,
    statesCount: Object.keys(stateCapacityMap).length,
    stateCapacity: Object.entries(stateCapacityMap)
      .map(([state, mw]) => ({ state, mw }))
      .sort((a, b) => b.mw - a.mw),
    technologies: Object.entries(technologyMap)
      .map(([tech, data]) => ({
        technology: tech,
        count: data.count,
        mw: data.mw,
      }))
      .sort((a, b) => b.mw - a.mw),
  };
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
 * Normalizes project shape so consumers can reliably access project.location
 * and top-level state/county properties.
 */
export function normalizeProject(project) {
  if (!project) return null;

  const state = project.location?.state || project.state || null;
  const county = project.location?.county || project.county || null;

  return {
    ...project,
    state,
    county,
    location: {
      state,
      county,
      township_range:
        project.location?.township_range || project.township_range || null,
      state_fips:
        project.location?.state_fips || project.state_fips || null,
      county_fips:
        project.location?.county_fips || project.county_fips || null,
    },
  };
}