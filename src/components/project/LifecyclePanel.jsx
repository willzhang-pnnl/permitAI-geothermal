import { Activity } from "lucide-react";
import {
  ACTIVITY_GROUPS,
  getActivityGroup,
  getStatus,
} from "../../utils/projectUtils";
import StatusPill from "../common/StatusPill";

export default function LifecyclePanel({ project }) {
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

          return (
            <div className="lifecycle-row" key={group.key}>
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
    </section>
  );
}