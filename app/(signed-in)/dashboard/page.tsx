"use client";

import { DashboardChatView } from "@/components/DashboardChatView";

function Dashboard() {
  return (
    <div className="hidden h-full w-full flex-1 flex-col overflow-hidden md:flex">
      <DashboardChatView />
    </div>
  );
}

export default Dashboard;
