"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LoginPanel({ nextPath = "/platform" }: { nextPath?: string }) {
  const [status, setStatus] = useState("");

  async function signIn() {
    setStatus("Opening Google sign-in...");
    const supabase = createSupabaseBrowserClient();
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) setStatus(error.message);
  }

  return (
    <section className="platformLoginCard">
      <p className="platformEyebrow">GPT Ads Platform</p>
      <h1>Sign in to manage readiness, leads, and OpenAI Ads setup.</h1>
      <p>
        Google OAuth is handled through Supabase Auth. Owner and sales access is invite-gated by
        configured allowlists; everyone else enters as a customer.
      </p>
      <button type="button" className="platformPrimaryButton" onClick={signIn}>
        Continue with Google
      </button>
      {status ? <span className="platformStatus">{status}</span> : null}
    </section>
  );
}
