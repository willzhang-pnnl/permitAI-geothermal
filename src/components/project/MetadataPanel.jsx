import { Settings2 } from "lucide-react";

export default function MetadataPanel({ project }) {
  const location = project.location || {};

  const metadata = [
    ["Project sponsor", project.project_sponsor],
    ["Project sector", project.project_sector],
    ["Project type", project.project_type],
    ["KGRA", project.kgra_name],
    ["State", location.state],
    ["County", location.county],
    ["Township / Range", location.township_range],
    ["Associated wells", project.well_numbers?.length || 0],
  ];

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">PROJECT INFORMATION</p>
          <h2>Metadata</h2>
        </div>

        <Settings2 size={20} className="heading-icon" />
      </div>

      <div className="metadata-list">
        {metadata.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value || "Not specified"}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}