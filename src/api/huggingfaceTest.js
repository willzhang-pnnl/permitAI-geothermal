// Quick connectivity check for a Hugging Face hosted dataset file.
// Client-side only (fetch), so it works on static hosts like GitHub Pages.
// NOTE: any token here is bundled into public JS - see .env.example for details.

const HF_TOKEN = import.meta.env.VITE_HF_TOKEN || "";
const HF_DATASET_REPO =
  import.meta.env.VITE_HF_DATASET_REPO || "PNNL/PermitTECv0.1";
const HF_DATASET_FILE = import.meta.env.VITE_HF_DATASET_FILE || "dataset.json";

function getHuggingFaceFileUrl(repo = HF_DATASET_REPO, file = HF_DATASET_FILE) {
  return `https://huggingface.co/datasets/${repo}/resolve/main/${file}`;
}

export async function testHuggingFaceConnection() {
  const url = getHuggingFaceFileUrl();
  const headers = HF_TOKEN ? { Authorization: `Bearer ${HF_TOKEN}` } : {};

  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      console.error(
        `[HF test] Could not reach ${url} - HTTP ${response.status} ${response.statusText}`
      );
      return { ok: false, status: response.status };
    }

    console.log(`[HF test] Reached ${url} - HTTP ${response.status}`);
    return { ok: true, status: response.status };
  } catch (error) {
    console.error(`[HF test] Request to ${url} failed:`, error);
    return { ok: false, error };
  }
}
