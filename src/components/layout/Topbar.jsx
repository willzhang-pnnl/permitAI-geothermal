import { Upload } from "lucide-react";

export default function Topbar({
  title,
  subtitle,
  onUpload,
  uploading = false,
}) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{subtitle}</p>
        <h1>{title}</h1>
      </div>

      <label className={`upload-button ${uploading ? "disabled" : ""}`}>
        <Upload size={17} />
        {uploading ? "Importing..." : "Import JSON"}

        <input
          type="file"
          accept=".json,application/json"
          multiple
          disabled={uploading}
          onChange={(event) => {
            onUpload(Array.from(event.target.files || []));
            event.target.value = "";
          }}
        />
      </label>
    </header>
  );
}