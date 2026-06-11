import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getRuntimeDataDir } from "@/lib/runtime-paths";
import type { AgentSessionRecord, BookingRecord, LeadRecord } from "@/lib/types";

const dataDir = getRuntimeDataDir();
const leadsPath = path.join(dataDir, "leads.json");
const sessionsPath = path.join(dataDir, "agent-sessions.json");
const bookingsPath = path.join(dataDir, "bookings.json");

export async function saveLocalLead(lead: LeadRecord) {
  const leads = await readJson<LeadRecord[]>(leadsPath, []);
  leads.unshift(lead);
  await writeJson(leadsPath, leads);
  return lead;
}

export async function listLocalLeads() {
  return readJson<LeadRecord[]>(leadsPath, []);
}

export async function updateLocalLead(
  leadId: string,
  updates: Partial<Pick<LeadRecord, "status" | "bookingStatus" | "adminNotes" | "lastContactedAt">>,
) {
  const leads = await readJson<LeadRecord[]>(leadsPath, []);
  const updated = leads.map((lead) =>
    lead.id === leadId ? { ...lead, ...updates, updatedAt: new Date().toISOString() } : lead,
  );
  await writeJson(leadsPath, updated);
  return updated.find((lead) => lead.id === leadId) ?? null;
}

export async function saveLocalAgentSession(session: AgentSessionRecord) {
  const sessions = await readJson<AgentSessionRecord[]>(sessionsPath, []);
  sessions.unshift(session);
  await writeJson(sessionsPath, sessions);
  return session;
}

export async function saveLocalBooking(booking: BookingRecord) {
  const bookings = await readJson<BookingRecord[]>(bookingsPath, []);
  bookings.unshift(booking);
  await writeJson(bookingsPath, bookings);
  return booking;
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(filePath: string, value: T) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
