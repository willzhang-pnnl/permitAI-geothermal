import { useState } from "react";
import { Activity, ChevronDown, FileText } from "lucide-react";
import {
  getActivityGroup,
  getProjectActivityGroups,
  getStatus,
} from "../../utils/projectUtils";
import StatusPill from "../common/StatusPill";
import Modal from "../common/Modal";

export default function LifecyclePanel({ project }) {
  const [expandedGroups, setExpandedGroups] = useState(() => new Set());
  const [activeActivity, setActiveActivity] = useState(null);

  const groups = getProjectActivityGroups(project);

  function toggleGroup(groupKey) {
    setExpandedGroups((currentGroups) => {
      const nextGroups = new Set(currentGroups);
      if (nextGroups.has(groupKey)) {
        nextGroups.delete(groupKey);
      } else {
        nextGroups.add(groupKey);
      }
      return nextGroups;
    });
  }

  return (
    <section className="panel panel-stacked">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">PERMITTING LIFECYCLE</p>
          <h2>Development phases</h2>
        </div>

        <Activity size={20} className="heading-icon" aria-hidden="true" />
      </div>

      <div className="lifecycle-list">
        {groups.map((group) => {
          const status = getStatus(project, group.key);
          const groupData = getActivityGroup(project, group.key);
          const activities = groupData.activities || [];
          const isExpanded = expandedGroups.has(group.key);

          return (
            <div className="lifecycle-phase" key={group.key}>
              <button
                type="button"
                className="lifecycle-row lifecycle-row-clickable"
                onClick={() => toggleGroup(group.key)}
                aria-expanded={isExpanded}
                aria-controls={`activities-${group.key}`}
              >
                <div className={`timeline-dot ${status}`}>
                  <span />
                </div>

                <div className="lifecycle-content">
                  <div className="lifecycle-title">
                    <strong>{group.label}</strong>
                    <StatusPill status={status} />
                  </div>

                  <div className="lifecycle-meta">
                    {activities.length > 0
                      ? `${activities.length} activit${
                          activities.length === 1 ? "y" : "ies"
                        }`
                      : "No activities recorded"}
                  </div>
                </div>

                <ChevronDown
                  className={`lifecycle-chevron ${isExpanded ? "expanded" : ""}`}
                  size={18}
                  aria-hidden="true"
                />
              </button>

              {isExpanded && (
                <div className="lifecycle-activities" id={`activities-${group.key}`}>
                  {activities.length === 0 ? (
                    <p className="muted">No activities recorded for this phase.</p>
                  ) : (
                    activities.map((activity, activityIndex) => (
                      <button
                        type="button"
                        className="lifecycle-activity"
                        key={activity.row_number ?? activityIndex}
                        onClick={() =>
                          setActiveActivity({ activity, group, status })
                        }
                      >
                        <strong>{activity.activity_type || "Untitled activity"}</strong>
                        <span>{activity.level || "Level unspecified"}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={Boolean(activeActivity)}
        onClose={() => setActiveActivity(null)}
        title={activeActivity?.activity.activity_type || "Activity metadata"}
        eyebrow={activeActivity?.group.label}
        badge={
          activeActivity ? <StatusPill status={activeActivity.status} /> : null
        }
      >
        {activeActivity && (
          <div className="activity-item">
            <div className="activity-item-meta activity-metadata-grid">
              <span>Level: {activeActivity.activity.level || "Unspecified"}</span>
              <span>
                Phase: {activeActivity.activity.process_map_phase || "Unspecified"}
              </span>
              <span>
                Activity group: {activeActivity.activity.activity_group || "Unspecified"}
              </span>
              <span>
                Row number: {activeActivity.activity.row_number ?? "Unspecified"}
              </span>
            </div>

            {activeActivity.activity.summary && (
              <p className="activity-item-summary">
                {activeActivity.activity.summary}
              </p>
            )}

            <div className="activity-item-document">
              <FileText size={15} aria-hidden="true" />
              <span>
                {activeActivity.activity.document_availability_flag
                  ? activeActivity.activity.document?.document_title ||
                    "Document available"
                  : "No document available"}
                {activeActivity.activity.document?.document_type
                  ? ` · ${activeActivity.activity.document.document_type}`
                  : ""}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
