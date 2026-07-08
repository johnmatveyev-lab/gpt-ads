"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useAvaVoice } from "@/components/useAvaVoice";

type AvaOrbContextValue = {
  openOrb: () => void;
  closeOrb: () => void;
  isOpen: boolean;
};

const AvaOrbContext = createContext<AvaOrbContextValue | null>(null);

export function useAvaOrb() {
  const context = useContext(AvaOrbContext);
  if (!context) throw new Error("useAvaOrb must be used within AvaVoiceOrbProvider");
  return context;
}

export default function AvaVoiceOrbProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const voice = useAvaVoice();
  const hasStartedRef = useRef(false);

  const openOrb = useCallback(() => setIsOpen(true), []);
  const closeOrb = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (isOpen && !hasStartedRef.current) {
      hasStartedRef.current = true;
      voice.start();
    }
    if (!isOpen && hasStartedRef.current) {
      hasStartedRef.current = false;
      voice.stop();
    }
    // voice.start/voice.stop are stable useCallback refs from useAvaVoice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <AvaOrbContext.Provider value={{ openOrb, closeOrb, isOpen }}>
      {children}
      {isOpen ? (
        <div className="avaOrbOverlay" role="dialog" aria-modal="true" aria-label="Talk with Ava">
          <button type="button" className="avaOrbClose" onClick={closeOrb} aria-label="Close voice call with Ava">
            <X size={22} />
          </button>
          <div className={`avaOrb avaOrb-${voice.status}`}>
            <span className="avaOrbRing avaOrbRing-1" />
            <span className="avaOrbRing avaOrbRing-2" />
            <span className="avaOrbCore" />
          </div>
          <p className="avaOrbStatus">{orbStatusLabel(voice.status, voice.error)}</p>
          {voice.liveTranscript ? <p className="avaOrbTranscript">{voice.liveTranscript}</p> : null}
        </div>
      ) : null}
    </AvaOrbContext.Provider>
  );
}

function orbStatusLabel(status: string, error: string | null) {
  if (error) return error;
  switch (status) {
    case "connecting":
      return "Connecting to Ava…";
    case "listening":
      return "Listening…";
    case "speaking":
      return "Ava is speaking…";
    default:
      return "Say hello to Ava.";
  }
}
