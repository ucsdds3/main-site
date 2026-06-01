import type { TalentLensSearchRequest, TalentLensSearchResponse } from "./types";

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
  const response = await fetch(`${getTalentLensApiBaseUrl()}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
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
};
