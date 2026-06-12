"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { ApiIntegrationRecord, ProfileRecord } from "@/lib/types";
import { integrationInputSchema } from "@/lib/validation";

type IntegrationInput = z.infer<typeof integrationInputSchema>;
type IntegrationFormInput = z.input<typeof integrationInputSchema>;

export default function IntegrationClient({ profile }: { profile: ProfileRecord }) {
  const queryClient = useQueryClient();
  const [parametersText, setParametersText] = useState("{}");
  const [parametersError, setParametersError] = useState("");
  const form = useForm<IntegrationFormInput, unknown, IntegrationInput>({
    resolver: zodResolver(integrationInputSchema),
    defaultValues: {
      networkName: "openai",
      environment: "production",
      accountId: "",
      apiKey: "",
      accessToken: "",
      parameters: {},
      isActive: true,
    },
  });

  const { data, error } = useQuery({
    queryKey: ["platform-integrations"],
    enabled: profile.role === "owner",
    queryFn: async () => {
      const response = await fetch("/api/platform/integrations");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to load integrations.");
      return payload as { integrations: ApiIntegrationRecord[] };
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: IntegrationInput) => {
      const response = await fetch("/api/platform/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to save integration.");
      return payload;
    },
    onSuccess: () => {
      form.reset({
        networkName: "openai",
        environment: "production",
        accountId: "",
        apiKey: "",
        accessToken: "",
        parameters: {},
        isActive: true,
      });
      setParametersText("{}");
      setParametersError("");
      queryClient.invalidateQueries({ queryKey: ["platform-integrations"] });
    },
  });

  if (profile.role !== "owner") {
    return (
      <section className="platformPanel">
        <h1>Integrations</h1>
        <p>Only owners can manage API credentials.</p>
      </section>
    );
  }

  return (
    <div className="platformTwoColumn">
      <section className="platformPanel">
        <h1>Ad network credential vault</h1>
        <p>Store owner-managed credentials for approved integrations. Secrets are encrypted and not displayed again.</p>
        <form
          className="platformForm"
          onSubmit={form.handleSubmit((values) => {
            try {
              const parsedParameters = JSON.parse(parametersText || "{}") as Record<string, unknown>;
              setParametersError("");
              mutation.mutate({ ...values, parameters: parsedParameters });
            } catch {
              setParametersError("Parameters must be valid JSON.");
            }
          })}
        >
          <label>
            Network
            <select {...form.register("networkName")}>
              <option value="openai">OpenAI Ads</option>
              <option value="google">Google Ads API v17+</option>
              <option value="facebook">Meta/Facebook Graph API v20.0+</option>
              <option value="tiktok">TikTok Marketing API v1.3+</option>
            </select>
          </label>
          <label>
            Environment
            <select {...form.register("environment")}>
              <option value="production">Production</option>
              <option value="sandbox">Sandbox</option>
            </select>
          </label>
          <label>
            Account ID
            <input {...form.register("accountId")} placeholder="acct_..." />
          </label>
          <label>
            API key or developer token
            <input {...form.register("apiKey")} type="password" placeholder="Paste the production API key" />
          </label>
          <label>
            Optional account token
            <input {...form.register("accessToken")} type="password" placeholder="Paste access token when required" />
          </label>
          <label>
            Environment parameters JSON
            <textarea
              value={parametersText}
              onChange={(event) => setParametersText(event.target.value)}
              placeholder='{"managerAccountId":"1234567890"}'
            />
          </label>
          <label className="platformCheckbox">
            <input type="checkbox" {...form.register("isActive")} />
            Active
          </label>
          {parametersError ? <p className="platformError">{parametersError}</p> : null}
          {mutation.error ? <p className="platformError">{mutation.error.message}</p> : null}
          <button className="platformPrimaryButton" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Encrypt and save"}
          </button>
        </form>
      </section>
      <section className="platformPanel">
        <h2>Stored integrations</h2>
        {error ? <p className="platformError">{error.message}</p> : null}
        <div className="platformList">
          {(data?.integrations ?? []).map((integration) => (
            <div className="platformListRow" key={integration.id}>
              <span>
                <strong>{integration.networkName}</strong>
                <small>
                  {integration.environment} · {integration.accountId}
                </small>
              </span>
              <span>{integration.status.replace("_", " ")}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
