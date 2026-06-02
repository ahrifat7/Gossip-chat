"use client";

import { useState } from "react";
import Dashboard from "@/app/(signed-in)/dashboard/page";
import ExploreUsers from "@/components/ExploreUsers";
import ClerkProfile from "@/components/ClerkProfile";

export default function MobileDashboard() {
  const [activeTab, setActiveTab] = useState<"chats" | "explore" | "profile">(
    "chats",
  );

  const renderContent = () => {
    switch (activeTab) {
      case "chats":
        return <Dashboard />;
      case "explore":
        return <ExploreUsers />;
      case "profile":
        return <ClerkProfile />;
    }
  };

  const activeClass = "text-primary bg-primary/10";
  const inactiveClass = "text-muted-foreground";

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#FCF8F5]">
      <div className="flex-1 overflow-auto">{renderContent()}</div>
      <nav className="fixed bottom-0 inset-x-0 h-16 bg-white/90 backdrop-blur-xl border-t flex justify-around items-center">
        <button
          type="button"
          onClick={() => setActiveTab("chats")}
          className={`flex flex-col items-center ${activeTab === "chats" ? activeClass : inactiveClass}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16h6M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <span className="text-xs">Chats</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("explore")}
          className={`flex flex-col items-center ${activeTab === "explore" ? activeClass : inactiveClass}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 4a6 6 0 00-6 6v6h12V10a6 6 0 00-6-6z"
            />
          </svg>
          <span className="text-xs">Explore</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center ${activeTab === "profile" ? activeClass : inactiveClass}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.121 17.804A9 9 0 1118.879 6.196M12 12v.01"
            />
          </svg>
          <span className="text-xs">Profile</span>
        </button>
      </nav>
    </div>
  );
}
