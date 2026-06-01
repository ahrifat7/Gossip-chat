"use client";

import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated } from "convex/react";
import { Unauthenticated } from "convex/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { Download } from "lucide-react";

function Header() {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");
  const { isInstallable, installPWA } = usePWAInstall();

  return (
    <header className="flex items-center justify-between px-4 h-16 sm:px-6">
      <Link href="/dashboard" className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
        Gossip
      </Link>

      <div className="flex items-center gap-2">
        {isInstallable && (
          <Button variant="outline" size="sm" onClick={installPWA} className="gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Install App</span>
          </Button>
        )}
        <Authenticated>
          {!isDashboard && (
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
          )}
          <UserButton />
        </Authenticated>

        <Unauthenticated>
          <SignInButton
            mode="modal"
            forceRedirectUrl="/dashboard"
            signUpForceRedirectUrl="/dashboard"
          >
            <Button variant="outline">Sign In</Button>
          </SignInButton>
        </Unauthenticated>
      </div>
    </header>
  );
}

export default Header;
