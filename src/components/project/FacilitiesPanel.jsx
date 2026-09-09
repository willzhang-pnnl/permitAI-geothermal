import { useState } from "react";
import { Building2, Gauge, X } from "lucide-react";
import { getFacilities } from "../../utils/projectUtils";
import EmptyState from "../common/EmptyState";

export default function FacilitiesPanel({ project }) {
  const [activeFacility, setActiveFacility] = useState(null);
  const facilities = getFacilities(project);

  const formatLabel = (key) =>
    key
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const formatValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "Not specified";
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  };

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

      {activeFacility && (
        <div
          className="modal-overlay"
          onClick={() => setActiveFacility(null)}
        >
          <div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="facility-details-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <p className="eyebrow">FACILITY DETAILS</p>
                <h2 id="facility-details-title">
                  {activeFacility.facility_name || "Unnamed Facility"}
                </h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setActiveFacility(null)}
                aria-label="Close facility details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="metadata-list facility-metadata-list">
              {Object.entries(activeFacility).map(([key, value]) => (
                <div key={key}>
                  <span>{formatLabel(key)}</span>
                  <strong>{formatValue(value)}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}