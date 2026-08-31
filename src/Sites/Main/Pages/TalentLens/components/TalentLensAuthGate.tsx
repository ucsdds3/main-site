import { useState, type FormEvent, type ReactNode } from "react";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { FiAlertCircle } from "react-icons/fi";

import Button from "src/Shared/Components/Button";
import Page from "src/Shared/Page/Page";
import { supabase } from "src/Utils/supabase";

import { useTalentLensAuth } from "../hooks/useTalentLensAuth";

const TalentLensAuthGate = ({ children }: { children: ReactNode }) => {
  const { status, user, error, refresh } = useTalentLensAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signInError, setSignInError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSignInError(null);
    setIsSubmitting(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setIsSubmitting(false);
    if (authError) {
      setSignInError(authError.message);
      return;
    }

    await refresh();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    await refresh();
  };

  if (status === "loading") {
    return (
      <Page>
        <main className="mx-auto flex min-h-[50vh] w-full max-w-xl items-center justify-center px-6 py-20">
          <p className="text-(--obs-text-muted)">Checking TalentLens access…</p>
        </main>
      </Page>
    );
  }

  if (status === "signed_out") {
    return (
      <Page>
        <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-6 py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#19B5CA]">
              Recruiter access
            </p>
            <h1 className="mt-3 font-heading text-4xl text-(--obs-text-primary)">TalentLens sign in</h1>
            <p className="mt-3 text-sm leading-6 text-(--obs-text-muted)">
              TalentLens is restricted to approved recruiters and DS3 board. Sign in with the email
              address on the allowlist.
            </p>
          </div>

          <form className="grid gap-4 rounded-lg border border-(--obs-border) bg-(--obs-surface) p-6" onSubmit={handleSignIn}>
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-(--obs-text-primary)">Email</span>
              <div className="flex items-center rounded-lg border border-(--obs-border) bg-transparent px-3 py-2">
                <FaEnvelope className="mr-2 shrink-0 text-(--obs-text-muted)" aria-hidden />
                <input
                  className="w-full bg-transparent text-(--obs-text-primary) outline-none"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  placeholder="recruiter@company.com"
                  required
                />
              </div>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium text-(--obs-text-primary)">Password</span>
              <div className="flex items-center rounded-lg border border-(--obs-border) bg-transparent px-3 py-2">
                <FaLock className="mr-2 shrink-0 text-(--obs-text-muted)" aria-hidden />
                <input
                  className="w-full bg-transparent text-(--obs-text-primary) outline-none"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  required
                />
              </div>
            </label>

            {signInError || error ? (
              <p className="rounded-md border border-[#ff6b6b]/35 bg-[#ff6b6b]/10 px-3 py-2 text-sm text-(--obs-text-primary)">
                {signInError || error}
              </p>
            ) : null}

            <Button btnClass="w-full justify-center" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in…" : "Sign in to TalentLens"}
            </Button>
          </form>
        </main>
      </Page>
    );
  }

  if (status === "denied") {
    return (
      <Page>
        <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-6 py-20">
          <div className="flex gap-3 rounded-lg border border-[#ff6b6b]/35 bg-[#ff6b6b]/10 p-5">
            <FiAlertCircle className="mt-1 shrink-0 text-xl text-[#ff8f8f]" aria-hidden />
            <div>
              <p className="font-semibold text-(--obs-text-primary)">Access not granted</p>
              <p className="mt-2 text-sm leading-6 text-(--obs-text-muted)">
                {user?.email
                  ? `${user.email} is signed in but is not on the TalentLens recruiter allowlist.`
                  : "This account is not on the TalentLens recruiter allowlist."}
              </p>
              {error ? <p className="mt-2 text-sm text-(--obs-text-muted)">{error}</p> : null}
            </div>
          </div>
          <button
            type="button"
            className="self-start rounded-md border border-(--obs-border) px-4 py-2 text-sm text-(--obs-text-primary) hover:border-[#19B5CA]/45"
            onClick={() => void handleSignOut()}
          >
            Sign out
          </button>
        </main>
      </Page>
    );
  }

  return <>{children}</>;
};

export default TalentLensAuthGate;
