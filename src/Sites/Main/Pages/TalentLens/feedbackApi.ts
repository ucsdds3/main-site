import { supabase } from "src/Utils/supabase";

import type { FeedbackSubmitPayload } from "./feedbackTypes";

export const submitTalentLensFeedback = async (payload: FeedbackSubmitPayload) => {
  const { data, error } = await supabase
    .from("TalentLensFeedback")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.id as string;
};
