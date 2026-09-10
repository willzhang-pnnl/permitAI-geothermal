import { useState, useMemo } from "react";
import {
  FileText,
  Filter,
  Lock,
  Search,
  Unlock,
  X,
  ExternalLink,
} from "lucide-react";
import { getAllDocuments } from "../../utils/projectUtils";
import EmptyState from "../common/EmptyState";
import Modal from "../common/Modal";

export default function DocumentsView({
  projects = [],
  onSelectProject,
}) {
  const [search, setSearch] = useState("");
  const [docTypeFilter, setDocTypeFilter] = useState("");
  const [agencyFilter, setAgencyFilter] = useState("");
  const [activeDocument, setActiveDocument] = useState(null);

  const allDocuments = useMemo(() => getAllDocuments(projects), [projects]);

  // Extract unique document types and lead agencies
  const docTypes = useMemo(() => {
    const set = new Set();
    allDocuments.forEach((d) => {
      if (d.document_type) set.add(d.document_type);
    });
    return Array.from(set).sort();
  }, [allDocuments]);

  const agencies = useMemo(() => {
    const set = new Set();
    allDocuments.forEach((d) => {
      if (d.lead_agency) set.add(d.lead_agency);
    });
    return Array.from(set).sort();
  }, [allDocuments]);

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    const q = search.trim().toLowerCase();
    const type = docTypeFilter.trim().toLowerCase();
    const agency = agencyFilter.trim().toLowerCase();

    return allDocuments.filter((doc) => {
      const matchesQuery =
        !q ||
        [
          doc.document_title,
          doc.projectName,
          doc.projectState,
          doc.lead_agency,
          doc.groupLabel,
          doc.activityType,
        ].some((val) => String(val || "").toLowerCase().includes(q));

      const matchesType =
        !type || String(doc.document_type || "").toLowerCase() === type;

      const matchesAgency =
        !agency || String(doc.lead_agency || "").toLowerCase() === agency;

      return matchesQuery && matchesType && matchesAgency;
    });
  }, [allDocuments, search, docTypeFilter, agencyFilter]);

  const hasActiveFilters = Boolean(search || docTypeFilter || agencyFilter);

  function resetFilters() {
    setSearch("");
    setDocTypeFilter("");
    setAgencyFilter("");
  }

  return (
    <div className="documents-view">
      <section className="overview-banner">
        <div>
          <span className="banner-kicker">REGULATORY REPOSITORY</span>
          <h2>Geothermal Environmental & Permitting Documents</h2>
          <p>
            Central registry of environmental assessments (EAs), authorisations,
            and regulatory filings across all portfolio projects.
          </p>
        </div>

        <div className="banner-number">
          <strong>{allDocuments.length}</strong>
          <span>Total filings</span>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="toolbar-container">
        <div className="toolbar-primary">
          <div className="search-box">
            <Search size={18} aria-hidden="true" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents by title, project, agency, phase..."
              aria-label="Search documents"
            />
            {search && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearch("")}
                aria-label="Clear document search"
              >
                <X size={15} aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="toolbar-filters">
            <div className="filter-select-wrapper">
              <Filter size={14} className="filter-icon" aria-hidden="true" />
              <select
                value={docTypeFilter}
                onChange={(e) => setDocTypeFilter(e.target.value)}
                aria-label="Filter by document type"
              >
                <option value="">All Document Types</option>
                {docTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-select-wrapper">
              <select
                value={agencyFilter}
                onChange={(e) => setAgencyFilter(e.target.value)}
                aria-label="Filter by lead agency"
              >
                <option value="">All Agencies</option>
                {agencies.map((agency) => (
                  <option key={agency} value={agency}>
                    {agency}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="reset-filters-btn"
                onClick={resetFilters}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="toolbar-status-row">
          <span className="result-count">
            Showing <strong>{filteredDocuments.length}</strong> of{" "}
            {allDocuments.length} document{allDocuments.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <div className="empty-state-container">
          <EmptyState
            title="No documents match your filters"
            description="Try changing your search terms or clearing agency filters."
          />
          {hasActiveFilters && (
            <button
              type="button"
              className="clear-filters-action-btn"
              onClick={resetFilters}
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="documents-table-wrapper">
          <table className="documents-table" aria-label="Regulatory documents list">
            <thead>
              <tr>
                <th>Document Title</th>
                <th>Project</th>
                <th>Phase</th>
                <th>Type</th>
                <th>Lead Agency</th>
                <th>Publish Date</th>
                <th>Access</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc, idx) => (
                <tr key={doc.document_uuid || idx}>
                  <td className="doc-title-cell">
                    <button
                      type="button"
                      className="table-link-btn"
                      onClick={() => setActiveDocument(doc)}
                    >
                      <FileText size={16} className="doc-type-icon" aria-hidden="true" />
                      <strong>{doc.document_title || "Untitled Document"}</strong>
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="project-jump-link"
                      onClick={() => onSelectProject(doc.projectId)}
                      title="Open project details"
                    >
                      <span>{doc.projectName || "Unknown Project"}</span>
                      <ExternalLink size={12} aria-hidden="true" />
                    </button>
                  </td>
                  <td>
                    <span className="phase-pill">{doc.groupLabel || "General"}</span>
                  </td>
                  <td>
                    <span className="doc-type-pill">{doc.document_type || "Other"}</span>
                  </td>
                  <td>{doc.lead_agency || "Not specified"}</td>
                  <td>{doc.publish_date || "—"}</td>
                  <td>
                    {doc.public_access ? (
                      <span className="status-indicator green" title="Publicly accessible">
                        <Unlock size={12} aria-hidden="true" /> Public
                      </span>
                    ) : (
                      <span className="status-indicator orange" title="Restricted">
                        <Lock size={12} aria-hidden="true" /> Restricted
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="inspect-btn"
                      onClick={() => setActiveDocument(doc)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Document Detail Modal */}
      <Modal
        isOpen={Boolean(activeDocument)}
        onClose={() => setActiveDocument(null)}
        title={activeDocument?.document_title || "Document Details"}
        eyebrow="REGULATORY FILING"
        badge={
          activeDocument ? (
            <span className="doc-type-pill">{activeDocument.document_type || "Doc"}</span>
          ) : null
        }
      >
        {activeDocument && (
          <div className="metadata-list facility-metadata-list">
            <div>
              <span>Associated Project</span>
              <strong>
                <button
                  type="button"
                  className="project-jump-link"
                  onClick={() => {
                    const pid = activeDocument.projectId;
                    setActiveDocument(null);
                    onSelectProject(pid);
                  }}
                >
                  {activeDocument.projectName}
                  <ExternalLink size={12} aria-hidden="true" />
                </button>
              </strong>
            </div>
            <div>
              <span>Project State</span>
              <strong>{activeDocument.projectState || "Not specified"}</strong>
            </div>
            <div>
              <span>Permitting Phase</span>
              <strong>{activeDocument.groupLabel || "Not specified"}</strong>
            </div>
            <div>
              <span>Activity Type</span>
              <strong>{activeDocument.activityType || "Not specified"}</strong>
            </div>
            <div>
              <span>Document Type</span>
              <strong>{activeDocument.document_type || "Not specified"}</strong>
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
              <span>Publish Date</span>
              <strong>{activeDocument.publish_date || "Not specified"}</strong>
            </div>
            <div>
              <span>Access Classification</span>
              <strong>
                {activeDocument.public_access ? "Public Domain" : "Controlled Access"}
              </strong>
            </div>
            <div>
              <span>Data Source</span>
              <strong>{activeDocument.document_source || "Not specified"}</strong>
            </div>
            <div>
              <span>Document UUID</span>
              <strong className="code-font">{activeDocument.document_uuid || "Not specified"}</strong>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

