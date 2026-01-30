import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://aogowlvmcvvrnryxuzlr.supabase.co/";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZ293bHZtY3Z2cm5yeXh1emxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NjQ5MjIsImV4cCI6MjA3MTA0MDkyMn0.AhFnWB0QsSS1-E5rJaIE5syqKquq8LJ8iS5C7wlkQwg";


export const supabase = createClient(supabaseUrl, supabaseKey);
