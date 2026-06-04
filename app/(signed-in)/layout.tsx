"use client";

import { Chat } from "stream-chat-react";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import UserSyncWrapper from "@/components/UserSyncWrapper";
import StreamVideoWrapper from "@/components/StreamVideoWrapper";
import { CallProvider } from "@/components/call/CallProvider";
import { IncomingCallOverlay } from "@/components/call/IncomingCallOverlay";
import { OutgoingCallOverlay } from "@/components/call/OutgoingCallOverlay";
import { ActiveCallOverlay } from "@/components/call/ActiveCallOverlay";
import { MobileDashboardShell } from "@/components/mobile-dashboard";
import streamClient from "@/lib/stream";
import Link from "next/link";
import { Suspense } from "react";
import "stream-chat-react/dist/css/v2/index.css";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <UserSyncWrapper>
      <div className="h-[100dvh] flex flex-col overflow-hidden bg-background">
        <Chat client={streamClient}>
          <StreamVideoWrapper>
            <CallProvider>
              {/* Call overlays — rendered at layout level so they
                  can interrupt any page the user is viewing */}
              <IncomingCallOverlay />
              <OutgoingCallOverlay />
              <ActiveCallOverlay />

              <Suspense fallback={null}>
                <MobileDashboardShell />
              </Suspense>

              <div className="hidden h-full w-full md:flex">
                <SidebarProvider
                  style={
                    {
                      "--sidebar-width": "19rem",
                    } as React.CSSProperties
                  }
                >
                  <AppSidebar />
                  <SidebarInset className="flex h-full flex-col overflow-hidden">
                    <header className="flex h-16 shrink-0 items-center gap-2 px-4">
                      <SidebarTrigger className="-ml-1" />

                      <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                      />

                      <Link
                        href="/dashboard"
                        className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent"
                      >
                        Gossip
                      </Link>
                    </header>
                    <div className="flex flex-1 flex-col overflow-hidden p-4 pt-0">
                      {children}
                    </div>
                  </SidebarInset>
                </SidebarProvider>
              </div>
            </CallProvider>
          </StreamVideoWrapper>
        </Chat>
      </div>
    </UserSyncWrapper>
  );
}

export default Layout;
