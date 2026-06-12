"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { ProfileRecord } from "@/lib/types";
import { profileUpdateSchema } from "@/lib/validation";
import LogoutButton from "@/components/platform/LogoutButton";

type ProfileInput = z.infer<typeof profileUpdateSchema>;

export default function SettingsClient({ profile }: { profile: ProfileRecord }) {
  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: { fullName: profile.fullName || "" },
  });

  const mutation = useMutation({
    mutationFn: async (values: ProfileInput) => {
      const response = await fetch("/api/platform/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to save profile.");
      return payload;
    },
  });

  return (
    <section className="platformPanel platformNarrow">
      <h1>Settings</h1>
      <p>{profile.email} · {profile.role.replace("_", " ")}</p>
      <form className="platformForm" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <label>
          Full name
          <input {...form.register("fullName")} placeholder="Your name" />
        </label>
        {mutation.error ? <p className="platformError">{mutation.error.message}</p> : null}
        {mutation.isSuccess ? <p className="platformSuccess">Profile saved.</p> : null}
        <button className="platformPrimaryButton" type="submit" disabled={mutation.isPending}>
          Save profile
        </button>
      </form>
      <LogoutButton />
    </section>
  );
}
