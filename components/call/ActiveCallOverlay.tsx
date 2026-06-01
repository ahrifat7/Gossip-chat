"use client";

import { useCallContext } from "./CallProvider";
import {
  StreamCall,
  StreamTheme,
  SpeakerLayout,
  CallControls,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import "./call-overlay.css";

/**
 * Full-screen overlay for an active (joined) video call.
 * Wraps Stream's SpeakerLayout + CallControls in a fixed overlay
 * so the call persists across page navigation.
 */
export function ActiveCallOverlay() {
  const { activeCall, callStatus, hangUp } = useCallContext();

  if (!activeCall || (callStatus !== "active" && callStatus !== "joining")) {
    return null;
  }

  return (
    <StreamCall call={activeCall}>
      <StreamTheme>
        <ActiveCallContent onLeave={hangUp} />
      </StreamTheme>
    </StreamCall>
  );
}

/* ------------------------------------------------------------------ */
/*  Inner content (needs StreamCall context for hooks)                  */
/* ------------------------------------------------------------------ */

function ActiveCallContent({ onLeave }: { onLeave: () => Promise<void> }) {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const [elapsed, setElapsed] = useState(0);

  // Call timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="active-call-overlay" id="active-call-overlay">
      {/* Header bar */}
      <div className="active-call-header">
        <div className="active-call-header-info">
          <div className="active-call-header-dot" />
          <span className="active-call-header-text">
            {participants.length} participant{participants.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="active-call-timer">{formatTime(elapsed)}</div>
      </div>

      {/* Video layout */}
      <div className="active-call-body">
        <SpeakerLayout />
      </div>

      {/* Controls */}
      <div className="active-call-controls">
        <CallControls onLeave={onLeave} />
      </div>
    </div>
  );
}
