import { useState } from "react";
import { Activity, FileText, X } from "lucide-react";
import {
  ACTIVITY_GROUPS,
  getActivityGroup,
  getStatus,
} from "../../utils/projectUtils";
import StatusPill from "../common/StatusPill";

export default function LifecyclePanel({ project }) {
  const [activeGroup, setActiveGroup] = useState(null);

  const activeGroupData = activeGroup
    ? getActivityGroup(project, activeGroup.key)
    : null;
  const activeActivities = activeGroupData?.activities || [];
  const activeStatus = activeGroupData
    ? activeGroupData.process_status || "not started"
    : null;

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">PERMITTING LIFECYCLE</p>
          <h2>Development phases</h2>
        </div>

        <Activity size={20} className="heading-icon" />
      </div>

      <div className="lifecycle-list">
        {ACTIVITY_GROUPS.map((group, index) => {
          const status = getStatus(project, group.key);
          const groupData = getActivityGroup(project, group.key);
          const activities = groupData.activities || [];
          const clickable = activities.length > 0;

          return (
            <div
              className={`lifecycle-row ${clickable ? "lifecycle-row-clickable" : ""}`}
              key={group.key}
              role={clickable ? "button" : undefined}
              tabIndex={clickable ? 0 : undefined}
              onClick={clickable ? () => setActiveGroup(group) : undefined}
              onKeyDown={
                clickable
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setActiveGroup(group);
                      }
                    }
                  : undefined
              }
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

              {index < ACTIVITY_GROUPS.length - 1 && (
                <div className="timeline-line" />
              )}
            </div>
          );
        })}
      </div>

      {activeGroup && (
        <div
          className="modal-overlay"
          onClick={() => setActiveGroup(null)}
        >
          <div
            className="modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <p className="eyebrow">{activeGroup.label}</p>
                <h2>Activities</h2>
              </div>

              <StatusPill status={activeStatus} />

              <button
                type="button"
                className="modal-close"
                onClick={() => setActiveGroup(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="activity-list">
              {activeActivities.map((activity, index) => (
                <div className="activity-item" key={index}>
                  <div className="activity-item-heading">
                    <strong>
                      {activity.activity_type || "Untitled activity"}
                    </strong>
                  </div>

                  <div className="activity-item-meta">
                    <span>{activity.level || "Level unspecified"}</span>
                    <span>
                      {activity.process_map_phase || "Phase unspecified"}
                    </span>
                  </div>

                  {activity.summary && (
                    <p className="activity-item-summary">
                      {activity.summary}
                    </p>
                  )}

                  {activity.document_availability_flag &&
                    activity.document && (
                      <div className="activity-item-document">
                        <FileText size={15} />
                        <span>
                          {activity.document.document_title ||
                            "Untitled document"}{" "}
                          · {activity.document.document_type || "Other"}
                        </span>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}