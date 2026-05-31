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
import streamClient from "@/lib/stream";
import Link from "next/link";
import "stream-chat-react/dist/css/v2/index.css";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <UserSyncWrapper>
      <div className="h-screen flex flex-col overflow-hidden bg-background">
        <Chat client={streamClient}>
          <SidebarProvider
            style={
              {
                "--sidebar-width": "19rem",
              } as React.CSSProperties
            }
          >
            <AppSidebar />
            <SidebarInset className="flex flex-col overflow-hidden h-full">
              <header className="flex h-16 shrink-0 items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />

                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />

                <Link
                  href="/dashboard"
                  className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60"
                >
                  Gossip
                </Link>
              </header>
              <div className="flex flex-1 flex-col p-4 pt-0 overflow-hidden">
                {children}
              </div>
            </SidebarInset>
          </SidebarProvider>
        </Chat>
      </div>
    </UserSyncWrapper>
  );
}

export default Layout;
