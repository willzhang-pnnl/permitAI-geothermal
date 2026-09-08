const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const body = await response.json();
      message = body.detail || message;
    } catch {
      // La respuesta no era JSON.
    }

    throw new Error(message);
  }

  return response.json();
}

export async function fetchProjects({ search = "", state = "" } = {}) {
  const params = new URLSearchParams();

  if (search.trim()) {
    params.set("search", search.trim());
  }

  if (state.trim()) {
    params.set("state", state.trim());
  }

  const query = params.toString();

  return apiRequest(`/projects${query ? `?${query}` : ""}`);
}

export async function fetchProject(projectId) {
  return apiRequest(`/projects/${encodeURIComponent(projectId)}`);
}

export async function uploadProjectFiles(files) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  return apiRequest("/import", {
    method: "POST",
    body: formData,
  });
}