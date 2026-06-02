"use client";

import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function ClerkProfile() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
      <UserButton />
      {/* You can add more account management links here if desired */}
    </div>
  );
}
