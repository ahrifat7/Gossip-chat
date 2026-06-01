"use client";

import { useCallContext } from "./CallProvider";
import { PhoneOff } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import "./call-overlay.css";

/**
 * Full-screen overlay shown to the caller while waiting for the callee(s)
 * to pick up. Auto-cancels after 30s via the CallProvider timeout.
 */
export function OutgoingCallOverlay() {
  const { callStatus, callMembers, hangUp } = useCallContext();
  const { user } = useUser();

  if (callStatus !== "outgoing-ringing") return null;

  // Show the people we're calling (exclude ourselves)
  const callees = callMembers.filter((m) => m.userId !== user?.id);
  const isGroup = callees.length > 1;
  const primaryCallee = callees[0];
  const displayName = isGroup
    ? `Group call (${callees.length} people)`
    : primaryCallee?.name || "Unknown";
  const displayImage = primaryCallee?.image || "";

  return (
    <div className="call-overlay" id="outgoing-call-overlay">
      <div className="call-overlay-backdrop" />
      <div className="call-overlay-content">
        {/* Avatar with outgoing ripple */}
        <div className="call-avatar-wrapper">
          <div className="call-outgoing-ring" />
          <div className="call-outgoing-ring" />
          <div className="call-outgoing-ring" />
          {displayImage ? (
            <img
              src={displayImage}
              alt={displayName}
              className="call-avatar"
            />
          ) : (
            <div className="call-avatar-placeholder">
              {(primaryCallee?.name || "?").charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Group members preview */}
        {isGroup && (
          <div className="call-members-preview">
            {callees.slice(0, 4).map((m) =>
              m.image ? (
                <img
                  key={m.userId}
                  src={m.image}
                  alt={m.name}
                  className="call-members-avatar"
                />
              ) : null,
            )}
            {callees.length > 4 && (
              <div className="call-members-count">
                +{callees.length - 4}
              </div>
            )}
          </div>
        )}

        {/* Call info */}
        <div className="call-info">
          <div className="call-info-name">{displayName}</div>
          <div className="call-info-status">
            Calling
            <span className="call-info-status-dots" />
          </div>
        </div>

        {/* Timeout progress bar */}
        <div className="call-timeout-bar">
          <div className="call-timeout-progress" />
        </div>

        {/* Hang up button */}
        <div className="call-actions">
          <div className="call-btn-group">
            <button
              className="call-btn call-btn-hangup"
              onClick={hangUp}
              aria-label="Hang up"
              id="hangup-call-btn"
            >
              <PhoneOff size={28} />
            </button>
            <span className="call-btn-label">Hang Up</span>
          </div>
        </div>
      </div>
    </div>
  );
}
