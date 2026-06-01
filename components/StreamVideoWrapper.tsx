"use client";

import { createToken } from "@/actions/createToken";
import { useUser } from "@clerk/nextjs";
import {
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

if (!process.env.NEXT_PUBLIC_STREAM_API_KEY) {
  throw new Error("NEXT_PUBLIC_STREAM_API_KEY is not set");
}

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;

/**
 * Global StreamVideoClient provider.
 * Lives in the signed-in layout so incoming call ring events
 * are detected on every authenticated page.
 */
function StreamVideoWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [client, setClient] = useState<StreamVideoClient | null>(null);

  // Keep userId in a ref so the tokenProvider callback stays stable
  const userIdRef = useRef(user?.id);
  useEffect(() => {
    userIdRef.current = user?.id;
  }, [user?.id]);

  const streamUser = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id,
      name:
        user.fullName ||
        user.emailAddresses[0]?.emailAddress ||
        "Unknown User",
      image: user.imageUrl || "",
      type: "authenticated" as const,
    };
  }, [user]);

  const tokenProvider = useCallback(async () => {
    const userId = userIdRef.current;
    if (!userId) throw new Error("User not authenticated");
    return await createToken(userId);
  }, []);

  useEffect(() => {
    if (!streamUser) return;

    let isMounted = true;

    const videoClient = new StreamVideoClient({
      apiKey: API_KEY,
      user: streamUser,
      tokenProvider,
    });

    // Defer to avoid cascading render warnings in React 18 strict mode
    Promise.resolve().then(() => {
      if (isMounted) setClient(videoClient);
    });

    return () => {
      isMounted = false;
      setClient(null);
      videoClient.disconnectUser().catch(console.error);
    };
  }, [streamUser, tokenProvider]);

  if (!client) return <>{children}</>;

  return <StreamVideo client={client}>{children}</StreamVideo>;
}

export default StreamVideoWrapper;
