import { Building2, Gauge } from "lucide-react";
import { getFacilities } from "../../utils/projectUtils";
import EmptyState from "../common/EmptyState";

export default function FacilitiesPanel({ project }) {
  const facilities = getFacilities(project);

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">ASSETS</p>
          <h2>Facilities</h2>
        </div>

        <Building2 size={20} className="heading-icon" />
      </div>

      {facilities.length === 0 ? (
        <EmptyState title="No facilities available" />
      ) : (
        <div className="facility-list">
          {facilities.map((facility) => (
            <div
              className="facility-item"
              key={facility.facility_id}
            >
              <div className="facility-avatar">
                <Gauge size={19} />
              </div>

              <div className="facility-main">
                <strong>
                  {facility.facility_name || "Unnamed Facility"}
                </strong>

                <span>
                  {facility.technology_type ||
                    "Technology not specified"}
                </span>
              </div>

              <div className="facility-value">
                <strong>{facility.unit_capacity_mw || 0} MW</strong>

                <span>
                  {facility.start_year
                    ? `Operating since ${facility.start_year}`
                    : "Start year unavailable"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}