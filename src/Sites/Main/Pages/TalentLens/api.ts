import type { TalentLensSearchRequest, TalentLensSearchResponse } from "./types";
import { supabase } from "src/Utils/supabase";

const SEARCH_TIMEOUT_MS = 30000;

const getEnvApiUrl = (value: string | undefined) => value?.trim().replace(/\/$/, "") ?? "";

export const getTalentLensApiBaseUrl = (): string => {
  const apiUrl = getEnvApiUrl(import.meta.env.VITE_TALENTLENS_V2_API_URL);

  if (!apiUrl) {
    throw new Error(
      "TalentLens V2 API URL is not configured. Set VITE_TALENTLENS_V2_API_URL in your environment."
    );
  }

  return apiUrl;
};

export const searchTalentLens = async (
  request: TalentLensSearchRequest
): Promise<TalentLensSearchResponse> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;

    const response = await fetch(`${getTalentLensApiBaseUrl()}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    if (!response.ok) {
      const message = await response.text().catch(() => "");
      throw new Error(
        message
          ? `TalentLens V2 search failed (${response.status}): ${message}`
          : `TalentLens V2 search failed with status ${response.status}.`
      );
    }

    return response.json() as Promise<TalentLensSearchResponse>;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("TalentLens V2 search timed out. Check the API service and try again.");
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
};
