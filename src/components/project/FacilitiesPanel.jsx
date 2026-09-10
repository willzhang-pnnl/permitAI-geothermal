import { useState } from "react";
import { Building2, Gauge } from "lucide-react";
import { getFacilities } from "../../utils/projectUtils";
import EmptyState from "../common/EmptyState";
import Modal from "../common/Modal";

export default function FacilitiesPanel({ project }) {
  const [activeFacility, setActiveFacility] = useState(null);
  const facilities = getFacilities(project);

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">ASSETS</p>
          <h2>Facilities</h2>
        </div>

        <Building2 size={20} className="heading-icon" aria-hidden="true" />
      </div>

      {facilities.length === 0 ? (
        <EmptyState title="No facilities available" />
      ) : (
        <div className="facility-list">
          {facilities.map((facility) => (
            <div
              className="facility-item facility-item-clickable"
              key={facility.facility_id}
              role="button"
              tabIndex={0}
              onClick={() => setActiveFacility(facility)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setActiveFacility(facility);
                }
              }}
              aria-label={`View details for ${facility.facility_name || "facility"}`}
            >
              <div className="facility-avatar" aria-hidden="true">
                <Gauge size={19} />
              </div>

              <div className="facility-main">
                <strong>
                  {facility.facility_name || "Unnamed Facility"}
                </strong>

                <span>
                  {facility.technology_type || "Technology not specified"}
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

      <Modal
        isOpen={Boolean(activeFacility)}
        onClose={() => setActiveFacility(null)}
        title={activeFacility?.facility_name || "Unnamed Facility"}
        eyebrow="FACILITY SPECIFICATIONS"
      >
        {activeFacility && (
          <div className="metadata-list facility-metadata-list">
            <div>
              <span>Technology</span>
              <strong>{activeFacility.technology_type || "Not specified"}</strong>
            </div>
            <div>
              <span>Unit Capacity</span>
              <strong>{activeFacility.unit_capacity_mw ? `${activeFacility.unit_capacity_mw} MW` : "Not specified"}</strong>
            </div>
            <div>
              <span>Commissioning / Start Year</span>
              <strong>{activeFacility.start_year || "Not specified"}</strong>
            </div>
            <div>
              <span>Owner</span>
              <strong>{activeFacility.owner || "Not specified"}</strong>
            </div>
            <div>
              <span>Operator</span>
              <strong>{activeFacility.operator || "Not specified"}</strong>
            </div>
            <div>
              <span>Coordinates</span>
              <strong>
                {activeFacility.latitude && activeFacility.longitude
                  ? `${activeFacility.latitude.toFixed(4)}°, ${activeFacility.longitude.toFixed(4)}°`
                  : "Not specified"}
              </strong>
            </div>
            <div>
              <span>Facility ID</span>
              <strong className="code-font">{activeFacility.facility_id || "Not specified"}</strong>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
