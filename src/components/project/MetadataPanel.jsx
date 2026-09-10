import { Settings2 } from "lucide-react";

export default function MetadataPanel({ project }) {
  const location = project.location || {};
  const wells = project.well_numbers || [];

  const metadata = [
    ["Project sponsor", project.project_sponsor],
    ["Project sector", project.project_sector],
    ["Project type", project.project_type],
    ["Resource Area (KGRA)", project.kgra_name],
    ["State", location.state],
    ["County", location.county],
    ["Township / Range", location.township_range],
    ["Schema Version", project.schema_version],
  ];

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">PROJECT INFORMATION</p>
          <h2>Metadata</h2>
        </div>

        <Settings2 size={20} className="heading-icon" aria-hidden="true" />
      </div>

      <div className="metadata-list">
        {metadata.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value || "Not specified"}</strong>
          </div>
        ))}

        <div>
          <span>Associated Wells ({wells.length})</span>
          <div className="well-tags-container">
            {wells.length > 0 ? (
              wells.map((well) => (
                <span key={well} className="well-tag">
                  {well}
                </span>
              ))
            ) : (
              <strong>None recorded</strong>
            )}
          </div>
        </div>

        <div>
          <span>Project UUID</span>
          <strong className="code-font">{project.project_id || "Not specified"}</strong>
        </div>
      </div>
    </section>
  );
}
