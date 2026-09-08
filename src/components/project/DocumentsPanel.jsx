import {
  ChevronRight,
  FileText,
} from "lucide-react";

import {
  getProjectDocuments,
} from "../../utils/projectUtils";

import EmptyState from "../common/EmptyState";

export default function DocumentsPanel({ project }) {
  const documents = getProjectDocuments(project);

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">DOCUMENTATION</p>
          <h2>Available documents</h2>
        </div>

        <FileText size={20} className="heading-icon" />
      </div>

      {documents.length === 0 ? (
        <EmptyState title="No documents available" />
      ) : (
        <div className="document-list">
          {documents.map((document, index) => (
            <div
              className="document-item"
              key={document.document_uuid || index}
            >
              <div className="document-icon">
                <FileText size={18} />
              </div>

              <div>
                <strong>
                  {document.document_title || "Untitled document"}
                </strong>

                <span>
                  {document.document_type || "Other"} ·{" "}
                  {document.activityType || "Activity"}
                </span>
              </div>

              <ChevronRight
                size={17}
                className="document-arrow"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}