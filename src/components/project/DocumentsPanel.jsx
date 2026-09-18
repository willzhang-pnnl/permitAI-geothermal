import { useState } from "react";
import {
  ChevronRight,
  FileText,
  Lock,
  Unlock,
} from "lucide-react";

import {
  getProjectDocuments,
} from "../../utils/projectUtils";

import EmptyState from "../common/EmptyState";
import Modal from "../common/Modal";

export default function DocumentsPanel({ project }) {
  const [activeDocument, setActiveDocument] = useState(null);
  const documents = getProjectDocuments(project);

  return (
    <section className="panel panel-stacked">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">DOCUMENTATION</p>
          <h2>Available documents</h2>
        </div>

        <FileText size={20} className="heading-icon" aria-hidden="true" />
      </div>

      {documents.length === 0 ? (
        <EmptyState title="No documents available" />
      ) : (
        <div className="document-list">
          {documents.map((document, index) => (
            <div
              className="document-item document-item-clickable"
              key={document.document_uuid || index}
              role="button"
              tabIndex={0}
              onClick={() => setActiveDocument(document)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setActiveDocument(document);
                }
              }}
              aria-label={`View document ${document.document_title || "details"}`}
            >
              <div className="document-icon" aria-hidden="true">
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
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={Boolean(activeDocument)}
        onClose={() => setActiveDocument(null)}
        title={activeDocument?.document_title || "Untitled document"}
        eyebrow="DOCUMENT DETAILS"
        badge={
          activeDocument ? (
            <span className="doc-type-pill">{activeDocument.document_type || "Doc"}</span>
          ) : null
        }
      >
        {activeDocument && (
          <div className="metadata-list facility-metadata-list">
            <div>
              <span>Document Type</span>
              <strong>{activeDocument.document_type || "Not specified"}</strong>
            </div>
            <div>
              <span>Associated Phase</span>
              <strong>{activeDocument.groupLabel || activeDocument.groupKey || "Not specified"}</strong>
            </div>
            <div>
              <span>Activity Type</span>
              <strong>{activeDocument.activityType || "Not specified"}</strong>
            </div>
            <div>
              <span>Lead Agency</span>
              <strong>{activeDocument.lead_agency || "Not specified"}</strong>
            </div>
            <div>
              <span>Prepared By</span>
              <strong>{activeDocument.prepared_by || "Not specified"}</strong>
            </div>
            <div>
              <span>Publication Date</span>
              <strong>{activeDocument.publish_date || "Not specified"}</strong>
            </div>
            <div>
              <span>Public Access</span>
              <strong>
                {activeDocument.public_access ? (
                  <span className="inline-status green">
                    <Unlock size={12} aria-hidden="true" /> Publicly Available
                  </span>
                ) : (
                  <span className="inline-status orange">
                    <Lock size={12} aria-hidden="true" /> Restricted Access
                  </span>
                )}
              </strong>
            </div>
            <div>
              <span>Document Source</span>
              <strong>{activeDocument.document_source || "Not specified"}</strong>
            </div>
            <div>
              <span>Document UUID</span>
              <strong className="code-font">{activeDocument.document_uuid || "Not specified"}</strong>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
