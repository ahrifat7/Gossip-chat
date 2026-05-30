"use client";

import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<div />}
              className="flex items-center justify-between w-full"
            >
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">
                  Welcome back
                </span>
                <span className="text-sm font-semibold">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              <UserButton signInUrl="/sign-in" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            <Button className="w-full" variant="outline">
              Start New Chat
            </Button>

            {/* Channels List */}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
