"use client";

import { useCallback, useRef, useState } from "react";

export type AvaVoiceStatus = "idle" | "connecting" | "listening" | "speaking" | "error";

/**
 * Streams mic audio to the xAI Realtime Voice Agent API and plays back the
 * agent's audio response. Assumes the configured agent (XAI_VOICE_AGENT_ID)
 * has server-side voice activity detection enabled, so turns are detected
 * and responded to automatically once audio is streamed in.
 */
export function useAvaVoice() {
  const [status, setStatus] = useState<AvaVoiceStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState("");

  const wsRef = useRef<WebSocket | null>(null);
  const micContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const nextPlaybackTimeRef = useRef(0);

  const stop = useCallback(() => {
    processorRef.current?.disconnect();
    micStreamRef.current?.getTracks().forEach((track) => track.stop());
    micContextRef.current?.close().catch(() => undefined);
    playbackContextRef.current?.close().catch(() => undefined);
    wsRef.current?.close();

    wsRef.current = null;
    processorRef.current = null;
    micStreamRef.current = null;
    micContextRef.current = null;
    playbackContextRef.current = null;
    setStatus("idle");
    setLiveTranscript("");
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setStatus("connecting");

    try {
      const tokenResponse = await fetch("/api/ava/voice/token", { method: "POST" });
      const tokenData = await tokenResponse.json();
      if (!tokenResponse.ok) throw new Error(tokenData.error || "Unable to start voice session.");

      const ws = new WebSocket(tokenData.wsUrl, ["realtime", `xai-client-secret.${tokenData.token}`]);
      wsRef.current = ws;

      const playbackContext = new AudioContext({ sampleRate: 24000 });
      playbackContextRef.current = playbackContext;
      nextPlaybackTimeRef.current = playbackContext.currentTime;

      ws.onopen = () => {
        startMic(ws, micStreamRef, micContextRef, processorRef, setStatus).catch((micError) => {
          setError(micError instanceof Error ? micError.message : "Microphone access failed.");
          setStatus("error");
        });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleServerEvent(data, playbackContext, nextPlaybackTimeRef, setStatus, setError, setLiveTranscript);
        } catch {
          // Ignore malformed frames.
        }
      };

      ws.onerror = () => {
        setError("Voice connection error.");
        setStatus("error");
      };

      ws.onclose = () => {
        setStatus((current) => (current === "error" ? current : "idle"));
      };
    } catch (thrown) {
      setError(thrown instanceof Error ? thrown.message : "Unable to start voice session.");
      setStatus("error");
    }
  }, []);

  return { status, error, liveTranscript, start, stop };
}

async function startMic(
  ws: WebSocket,
  micStreamRef: { current: MediaStream | null },
  micContextRef: { current: AudioContext | null },
  processorRef: { current: ScriptProcessorNode | null },
  setStatus: (status: AvaVoiceStatus) => void,
) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  micStreamRef.current = stream;

  const audioContext = new AudioContext();
  micContextRef.current = audioContext;
  const source = audioContext.createMediaStreamSource(stream);

  const processor = audioContext.createScriptProcessor(4096, 1, 1);
  processorRef.current = processor;

  // A zero-gain node keeps the ScriptProcessorNode graph running (required
  // by some browsers) without feeding mic input back into the speakers.
  const mute = audioContext.createGain();
  mute.gain.value = 0;

  processor.onaudioprocess = (audioEvent) => {
    if (ws.readyState !== WebSocket.OPEN) return;
    const input = audioEvent.inputBuffer.getChannelData(0);
    const resampled = downsampleTo24k(input, audioContext.sampleRate);
    const pcm16 = floatTo16BitPCM(resampled);
    ws.send(
      JSON.stringify({
        type: "input_audio_buffer.append",
        audio: arrayBufferToBase64(pcm16.buffer),
      }),
    );
  };

  source.connect(processor);
  processor.connect(mute);
  mute.connect(audioContext.destination);
  setStatus("listening");
}

function handleServerEvent(
  data: Record<string, unknown>,
  playbackContext: AudioContext,
  cursorRef: { current: number },
  setStatus: (status: AvaVoiceStatus) => void,
  setError: (message: string) => void,
  setLiveTranscript: (updater: (previous: string) => string) => void,
) {
  switch (data.type) {
    case "response.output_audio_transcript.delta":
      setStatus("speaking");
      setLiveTranscript((previous) => previous + (typeof data.delta === "string" ? data.delta : ""));
      break;
    case "response.output_audio.delta":
      if (typeof data.delta === "string") {
        playPcmChunk(data.delta, playbackContext, cursorRef);
      }
      break;
    case "response.done":
      setStatus("listening");
      setLiveTranscript(() => "");
      break;
    case "error": {
      const errorPayload = data.error as { message?: string } | undefined;
      setError(errorPayload?.message || "Voice session error.");
      setStatus("error");
      break;
    }
    default:
      break;
  }
}

function downsampleTo24k(input: Float32Array, inputRate: number): Float32Array {
  const targetRate = 24000;
  if (inputRate === targetRate) return input;
  const ratio = inputRate / targetRate;
  const newLength = Math.round(input.length / ratio);
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    result[i] = input[Math.floor(i * ratio)];
  }
  return result;
}

function floatTo16BitPCM(input: Float32Array): Int16Array {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const clamped = Math.max(-1, Math.min(1, input[i]));
    output[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
  }
  return output;
}

function arrayBufferToBase64(buffer: ArrayBufferLike): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToInt16Array(base64: string): Int16Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Int16Array(bytes.buffer);
}

function playPcmChunk(base64: string, context: AudioContext, cursorRef: { current: number }) {
  const pcm16 = base64ToInt16Array(base64);
  const float32 = new Float32Array(pcm16.length);
  for (let i = 0; i < pcm16.length; i++) float32[i] = pcm16[i] / 0x8000;

  const audioBuffer = context.createBuffer(1, float32.length, 24000);
  audioBuffer.copyToChannel(float32, 0);

  const source = context.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(context.destination);

  const startAt = Math.max(cursorRef.current, context.currentTime);
  source.start(startAt);
  cursorRef.current = startAt + audioBuffer.duration;
}
