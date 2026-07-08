"use client";

import { Mic } from "lucide-react";
import { useAvaOrb } from "@/components/AvaVoiceOrbProvider";

export default function TalkWithAvaButton({ className = "" }: { className?: string }) {
  const { openOrb } = useAvaOrb();

  return (
    <button type="button" className={`talkWithAvaButton ${className}`} onClick={openOrb}>
      <span className="talkWithAvaGlow" aria-hidden="true" />
      <Mic size={18} />
      Talk with Ava
    </button>
  );
}
