import type { TalentLensSearchRequest, TalentLensSearchResponse } from "./types";

const SEARCH_TIMEOUT_MS = 30000;

const getTalentLensApiBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_TALENTLENS_API_URL?.trim();

  if (!apiUrl) {
    throw new Error(
      "TalentLens API URL is not configured. Set VITE_TALENTLENS_API_URL in your environment."
    );
  }

  return apiUrl.replace(/\/$/, "");
};

export const searchTalentLens = async (
  request: TalentLensSearchRequest
): Promise<TalentLensSearchResponse> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${getTalentLensApiBaseUrl()}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    if (!response.ok) {
      const message = await response.text().catch(() => "");
      throw new Error(
        message
          ? `TalentLens search failed (${response.status}): ${message}`
          : `TalentLens search failed with status ${response.status}.`
      );
    }

    return response.json() as Promise<TalentLensSearchResponse>;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("TalentLens search timed out. Check the API service and try again.");
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
};
