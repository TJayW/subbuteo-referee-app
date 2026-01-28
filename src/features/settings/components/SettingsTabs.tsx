/**
 * Reusable Settings Tabs Container
 * 
 * Provides accessible ARIA tablist + tabpanel structure
 * Responsive with horizontal scroll on mobile, flex wrap on desktop
 */

import React, { useState } from 'react';

export interface TabDef {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface SettingsTabsProps {
  tabs: TabDef[];
}

export const SettingsTabs: React.FC<SettingsTabsProps> = ({ tabs }) => {
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id || '');

  return (
    <div className="flex flex-col gap-0">
      {/* Tab List - Always on single row */}
      <div
        role="tablist"
        className="flex gap-0 border-b border-slate-200 bg-slate-50/70"
        aria-orientation="horizontal"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTabId === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={activeTabId === tab.id ? 0 : -1}
            onClick={() => setActiveTabId(tab.id)}
            className={`flex-1 px-3 py-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 text-center ${
              activeTabId === tab.id
                ? 'text-slate-900 border-b-slate-900 bg-white'
                : 'text-slate-600 border-b-transparent hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`tabpanel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          className={activeTabId === tab.id ? 'block mt-4' : 'hidden'}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
};
