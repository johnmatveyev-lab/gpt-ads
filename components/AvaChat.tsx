"use client";

import { Mic, MessageCircle, Phone, Send, X } from "lucide-react";
import { useState } from "react";
import type { AgentMessage } from "@/lib/types";
import { useAvaOrb } from "@/components/AvaVoiceOrbProvider";
import { formatPhoneDisplay } from "@/lib/phone";

const starter: AgentMessage = {
  role: "assistant",
  content:
    "Hi, I’m Ava. Tell me what kind of local business you run and where you serve customers. I’ll help you think through ChatGPT Ads readiness without making fake partner or guaranteed-results claims.",
};

export default function AvaChat({ bookingUrl, phoneNumber }: { bookingUrl: string; phoneNumber?: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AgentMessage[]>([starter]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { openOrb } = useAvaOrb();

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const nextMessages: AgentMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ava", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Ava is unavailable.");
      setMessages([...nextMessages, { role: "assistant", content: data.message }]);
    } catch (error) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? `I hit a setup issue: ${error.message}`
              : "I hit a setup issue. Please try the readiness audit form or book a call.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open ? (
        <section className="chatPanel" aria-label="Talk with Ava">
          <header className="chatHeader">
            <div>
              <strong>Talk with Ava</strong>
              <p>Your AI Growth Consultant</p>
            </div>
            <div className="chatHeaderActions">
              <button
                type="button"
                className="voiceToggle"
                onClick={openOrb}
                aria-label="Talk with Ava using voice"
                title="Talk to Ava"
              >
                <Mic size={18} />
              </button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close Ava chat">
                <X size={22} />
              </button>
            </div>
          </header>
          <div className="chatMessages">
            {messages.map((message, index) => (
              <div className={`message ${message.role}`} key={`${message.role}-${index}`}>
                {message.content}
              </div>
            ))}
            {loading ? <div className="message assistant">Ava is thinking...</div> : null}
            <a className="bookingLink" href={bookingUrl} target="_blank" rel="noreferrer">
              Prefer a human call? Book a time that works for you.
            </a>
            {phoneNumber ? (
              <a className="bookingLink" href={`tel:${phoneNumber}`}>
                <Phone size={14} /> Or call Ava now: {formatPhoneDisplay(phoneNumber)}
              </a>
            ) : null}
          </div>
          <form className="chatComposer" onSubmit={sendMessage}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask Ava about ChatGPT Ads..."
              aria-label="Message Ava"
            />
            <button type="submit" aria-label="Send message" disabled={loading}>
              <Send size={18} />
            </button>
          </form>
        </section>
      ) : null}
      <button className="chatLauncher" type="button" onClick={() => setOpen(true)} aria-label="Open Ava chat">
        <MessageCircle size={30} />
      </button>
    </>
  );
}
