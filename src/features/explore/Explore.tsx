"use client"

import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import Tabs from "@/components/ui/Tabs";
import TrendingTab from "./views/TrendingTab";
import PeopleTab from "./views/PeopleTab";
import MediaTab from "./views/MediaTab";

const SESSION_TAB_KEY = "buzz-explore-tab";
type ExploreTab = "trending" | "people" | "media";

const tabs: { id: ExploreTab; label: string; icon: React.ReactNode }[] = [
  {
    id: "trending",
    label: "Trending",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  {
    id: "people",
    label: "People",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "media",
    label: "Media",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
];

export default function Explore() {
  usePageTitle("Explore");

  const [activeTab, setActiveTab] = useState<ExploreTab>(() => {
    const saved = sessionStorage.getItem(SESSION_TAB_KEY);
    return (saved as ExploreTab) || "trending";
  });

  const handleTabChange = (tab: ExploreTab) => {
    setActiveTab(tab);
    sessionStorage.setItem(SESSION_TAB_KEY, tab);
  };

  return (
    <div className="space-y-5">
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(key) => handleTabChange(key as ExploreTab)}
      />

      {activeTab === "trending" && <TrendingTab />}
      {activeTab === "people" && <PeopleTab />}
      {activeTab === "media" && <MediaTab />}
    </div>
  );
}