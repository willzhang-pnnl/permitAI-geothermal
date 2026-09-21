import { useState } from "react";
import { FileImage, ImageOff } from "lucide-react";

const resources = [
  {
    id: "geothermal-permitting-process",
    title: "Geothermal Permitting Process",
    description:
      "Reference diagram showing authority involvement, decision points, and operator activities across six geothermal development phases.",
    category: "Process diagram",
    source: "Supporting documentation",
    image: `${import.meta.env.BASE_URL}images/geothermal-permitting-process.png`,
    alt: "Geothermal permitting process diagram spanning leasing, exploration, well development, construction, operations, monitoring, and decommissioning phases.",
  },
];

function ResourceImage({ resource, className }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`resource-image-missing ${className || ""}`}>
        <ImageOff size={30} aria-hidden="true" />
        <span>Add the image at public/images/geothermal-permitting-process.png</span>
      </div>
    );
  }

  return (
    <img
      className={className}
      src={resource.image}
      alt={resource.alt}
      onError={() => setFailed(true)}
    />
  );
}

export default function ResourcesView() {
  return (
    <div className="resources-view">
      <header className="resources-header">
        <div>
          <p className="eyebrow">SUPPORTING MATERIALS</p>
          <h1>Visual reference library</h1>
          <p>
            Process diagrams and supporting images that provide context for
            geothermal permitting and project development records.
          </p>
        </div>
        <FileImage size={28} className="heading-icon" aria-hidden="true" />
      </header>

      <div className="resource-grid">
        {resources.map((resource) => (
          <article className="resource-entry" key={resource.id}>
            <div className="resource-entry-content">
              <span className="resource-type">{resource.category}</span>
              <h2>{resource.title}</h2>
              <p>{resource.description}</p>
              <span className="resource-source">Source: {resource.source}</span>
            </div>

            <figure className="resource-figure">
              <ResourceImage resource={resource} />
              <figcaption>{resource.alt}</figcaption>
            </figure>
          </article>
        ))}
      </div>
    </div>
  );
}
