"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

export function PwaRedirect() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Check if running as a PWA (standalone mode) and on mobile
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as NavigatorWithStandalone).standalone === true;
      const isMobile = window.innerWidth <= 639; // tailwind 'sm' breakpoint

      if (isStandalone && isMobile) {
        router.push("/dashboard");
      }
    }
  }, [isLoaded, isSignedIn, router]);

  return null;
}
