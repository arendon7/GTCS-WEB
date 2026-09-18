"use client";

import React from "react";

export interface TabOption {
  id: string;
  label: string;
}

export function TabSlider({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: TabOption[];
  activeTab: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="tab-slider-container" role="tablist">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            type="button"
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            className="tab-slider-btn"
            data-active={isActive ? "true" : "false"}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
