import { supabase } from "src/Utils/supabase";

const MATCH_TIMEOUT_MS = 120000;

export type SkillVerdictStatus = "yes" | "no" | "unclear";
export type SkillEvidenceLevel = "used" | "listed" | "none";

export interface SkillVerdict {
  name: string;
  status: SkillVerdictStatus;
  evidence_level: SkillEvidenceLevel;
  evidence: string;
}

export interface SkillMatchPerson {
  display_name: string;
  supported_count: number;
  used_count: number;
  listed_count: number;
  skill_count: number;
  provisional_fit: number;
  skills: SkillVerdict[];
}

export interface SkillMatchResponse {
  skills: string[];
  engagement: "off";
  resumes_checked: number;
  excluded_count: number;
  with_any_support: number;
  with_used_support: number;
  results: SkillMatchPerson[];
}

const apiBaseUrl = () => {
  const url = (import.meta.env.VITE_TALENTLENS_V2_API_URL ?? "").trim().replace(/\/$/, "");
  if (!url) {
    throw new Error("Set VITE_TALENTLENS_V2_API_URL to the local TalentLens API.");
  }
  return url;
};

export async function matchSkillsAgainstResumes(
  skills: string[],
  exclude: string[]
): Promise<SkillMatchResponse> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), MATCH_TIMEOUT_MS);

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    const response = await fetch(`${apiBaseUrl()}/hackathon/skill-match`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ skills, exclude }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      const detail = body && typeof body.detail === "string" ? body.detail : "";
      throw new Error(detail || `Skill check failed (${response.status}).`);
    }

    return response.json() as Promise<SkillMatchResponse>;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("The skill check timed out. Leave the API running and try again.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
