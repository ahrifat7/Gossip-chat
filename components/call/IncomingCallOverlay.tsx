"use client";

import { useCallContext } from "./CallProvider";
import { Phone, PhoneOff } from "lucide-react";
import "./call-overlay.css";

/**
 * Full-screen overlay shown when another user is ringing this user.
 * Renders on top of everything via fixed positioning + z-index 9999.
 */
export function IncomingCallOverlay() {
  const { callStatus, callMembers, acceptCall, rejectCall, activeCall } =
    useCallContext();

  if (callStatus !== "incoming-ringing") return null;

  // The caller is the user who created the call
  const caller = callMembers.find(
    (m) => m.userId === activeCall?.state?.createdBy?.id,
  );
  const otherMembers = callMembers.filter(
    (m) => m.userId !== activeCall?.state?.createdBy?.id,
  );
  const displayName = caller?.name || "Someone";
  const displayImage = caller?.image || "";
  const isGroup = callMembers.length > 2;

  return (
    <div className="call-overlay" id="incoming-call-overlay">
      <div className="call-overlay-backdrop" />
      <div className="call-overlay-content">
        {/* Avatar with pulse rings */}
        <div className="call-avatar-wrapper">
          <div className="call-pulse-ring" />
          <div className="call-pulse-ring" />
          <div className="call-pulse-ring" />
          {displayImage ? (
            <img
              src={displayImage}
              alt={displayName}
              className="call-avatar"
            />
          ) : (
            <div className="call-avatar-placeholder">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Group members preview */}
        {isGroup && otherMembers.length > 0 && (
          <div className="call-members-preview">
            {otherMembers.slice(0, 3).map((m) =>
              m.image ? (
                <img
                  key={m.userId}
                  src={m.image}
                  alt={m.name}
                  className="call-members-avatar"
                />
              ) : null,
            )}
            {otherMembers.length > 3 && (
              <div className="call-members-count">
                +{otherMembers.length - 3}
              </div>
            )}
          </div>
        )}

        {/* Caller info */}
        <div className="call-info">
          <div className="call-info-name">{displayName}</div>
          <div className="call-info-status">
            {isGroup ? "Group video call" : "Incoming video call"}
            <span className="call-info-status-dots" />
          </div>
        </div>

        {/* Timeout progress bar */}
        <div className="call-timeout-bar">
          <div className="call-timeout-progress call-timeout-progress-incoming" />
        </div>

        {/* Accept / Decline buttons */}
        <div className="call-actions">
          <div className="call-btn-group">
            <button
              className="call-btn call-btn-reject"
              onClick={rejectCall}
              aria-label="Decline call"
              id="decline-call-btn"
            >
              <PhoneOff size={24} />
            </button>
            <span className="call-btn-label">Decline</span>
          </div>

          <div className="call-btn-group">
            <button
              className="call-btn call-btn-accept"
              onClick={acceptCall}
              aria-label="Accept call"
              id="accept-call-btn"
            >
              <Phone size={24} />
            </button>
            <span className="call-btn-label">Accept</span>
          </div>
        </div>
      </div>
    </div>
  );
}
