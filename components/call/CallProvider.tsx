"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Call,
  CallingState,
  StreamVideoClient,
  useCalls,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type CallStatus =
  | "idle"
  | "outgoing-ringing"
  | "incoming-ringing"
  | "joining"
  | "active";

export interface CallMember {
  userId: string;
  name: string;
  image: string;
}

interface CallContextValue {
  /** Current call object (null when idle) */
  activeCall: Call | null;
  /** Current lifecycle state */
  callStatus: CallStatus;
  /** Members involved in the call */
  callMembers: CallMember[];

  /** Initiate a ringing call to the given members */
  startCall: (memberUserIds: string[]) => Promise<void>;
  /** Accept an incoming ringing call */
  acceptCall: () => Promise<void>;
  /** Reject / decline an incoming call */
  rejectCall: () => Promise<void>;
  /** Hang up — cancel outgoing or leave active call */
  hangUp: () => Promise<void>;
}

const CallContext = createContext<CallContextValue | null>(null);

export function useCallContext() {
  const ctx = useContext(CallContext);
  if (!ctx) {
    throw new Error("useCallContext must be used within a <CallProvider>");
  }
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Idle defaults (used before StreamVideo is ready)                    */
/* ------------------------------------------------------------------ */

const noopAsync = async () => {};

const IDLE_VALUE: CallContextValue = {
  activeCall: null,
  callStatus: "idle",
  callMembers: [],
  startCall: async () => {
    throw new Error("Stream Video client not ready yet");
  },
  acceptCall: noopAsync,
  rejectCall: noopAsync,
  hangUp: noopAsync,
};

/* ------------------------------------------------------------------ */
/*  Outer shell — always safe to render                                */
/* ------------------------------------------------------------------ */

/**
 * Safe wrapper that provides idle defaults until <StreamVideo> is
 * available, then delegates to the real hook-based provider.
 */
export function CallProvider({ children }: { children: React.ReactNode }) {
  // Try to get the client — returns null if outside <StreamVideo>
  let client: StreamVideoClient | null | undefined = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    client = useStreamVideoClient();
  } catch {
    // Not inside <StreamVideo> yet — that's fine, we'll use idle defaults
  }

  if (!client) {
    return (
      <CallContext.Provider value={IDLE_VALUE}>
        {children}
      </CallContext.Provider>
    );
  }

  return <CallProviderInner>{children}</CallProviderInner>;
}

/* ------------------------------------------------------------------ */
/*  Inner provider — only mounted when <StreamVideo> context exists    */
/* ------------------------------------------------------------------ */

const RING_TIMEOUT_MS = 30_000; // 30-second auto-cancel

function CallProviderInner({ children }: { children: React.ReactNode }) {
  const client = useStreamVideoClient();
  const calls = useCalls();

  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [callMembers, setCallMembers] = useState<CallMember[]>([]);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---------- helpers ---------- */

  const clearRingTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const resetState = useCallback(() => {
    clearRingTimeout();
    setActiveCall(null);
    setCallStatus("idle");
    setCallMembers([]);
  }, [clearRingTimeout]);

  const startRingTimeout = useCallback(
    (call: Call) => {
      clearRingTimeout();
      timeoutRef.current = setTimeout(async () => {
        try {
          // leave & reject so the backend stops ringing everyone
          await call.leave({ reject: true });
        } catch {
          // call may already have ended
        }
        resetState();
      }, RING_TIMEOUT_MS);
    },
    [clearRingTimeout, resetState],
  );

  const extractMembers = useCallback((call: Call): CallMember[] => {
    const members = call.state.members || [];
    return members.map((m) => ({
      userId: m.user_id || m.user?.id || "",
      name: m.user?.name || m.user?.id || "Unknown",
      image: m.user?.image || "",
    }));
  }, []);

  /* ---------- detect incoming ringing calls ---------- */

  useEffect(() => {
    // Only look for incoming calls when we're idle (no active call already)
    if (callStatus !== "idle" || !calls.length) return;

    const incomingCall = calls.find(
      (c) =>
        !c.isCreatedByMe &&
        c.state.callingState === CallingState.RINGING,
    );

    if (incomingCall) {
      // Defer to avoid cascading render warnings
      Promise.resolve().then(() => {
        setActiveCall(incomingCall);
        setCallStatus("incoming-ringing");
        setCallMembers(extractMembers(incomingCall));
        startRingTimeout(incomingCall);
      });
    }
  }, [calls, callStatus, extractMembers, startRingTimeout]);

  /* ---------- watch callingState changes on activeCall ---------- */

  useEffect(() => {
    if (!activeCall) return;

    const sub = activeCall.state.callingState$.subscribe((state) => {
      switch (state) {
        case CallingState.JOINED:
          clearRingTimeout();
          setCallStatus("active");
          break;

        case CallingState.LEFT:
        case CallingState.IDLE:
          resetState();
          break;

        case CallingState.RINGING:
          // already handled
          break;

        case CallingState.JOINING:
          setCallStatus("joining");
          break;
      }
    });

    const subParticipants = activeCall.state.participants$.subscribe((participants) => {
      if (
        participants.length > 0 &&
        activeCall.state.callingState !== CallingState.JOINED
      ) {
        activeCall.join().catch((err) => {
          console.error("Failed to auto-join call when participant joined", err);
        });
      }
    });

    return () => {
      sub.unsubscribe();
      subParticipants.unsubscribe();
    };
  }, [activeCall, clearRingTimeout, resetState]);

  /* ---------- actions ---------- */

  const startCall = useCallback(
    async (memberUserIds: string[]) => {
      if (!client) throw new Error("Stream Video client not ready");

      const callId = crypto.randomUUID();
      const call = client.call("default", callId);

      await call.getOrCreate({
        ring: true,
        data: {
          members: memberUserIds.map((id) => ({ user_id: id })),
        },
      });

      setActiveCall(call);
      setCallStatus("outgoing-ringing");
      setCallMembers(extractMembers(call));
      startRingTimeout(call);
    },
    [client, extractMembers, startRingTimeout],
  );

  const acceptCall = useCallback(async () => {
    if (!activeCall) return;
    clearRingTimeout();
    setCallStatus("joining");
    await activeCall.join();
    // callingState$ subscription will flip to "active"
  }, [activeCall, clearRingTimeout]);

  const rejectCall = useCallback(async () => {
    if (!activeCall) return;
    try {
      await activeCall.leave({ reject: true });
    } catch {
      // call may already be gone
    }
    resetState();
  }, [activeCall, resetState]);

  const hangUp = useCallback(async () => {
    if (!activeCall) return;
    try {
      if (
        callStatus === "outgoing-ringing" ||
        callStatus === "incoming-ringing"
      ) {
        await activeCall.leave({ reject: true });
      } else {
        await activeCall.leave();
      }
    } catch {
      // graceful fallback
    }
    resetState();
  }, [activeCall, callStatus, resetState]);

  /* ---------- cleanup on unmount ---------- */

  useEffect(() => {
    return () => clearRingTimeout();
  }, [clearRingTimeout]);

  return (
    <CallContext.Provider
      value={{
        activeCall,
        callStatus,
        callMembers,
        startCall,
        acceptCall,
        rejectCall,
        hangUp,
      }}
    >
      {children}
    </CallContext.Provider>
  );
}

