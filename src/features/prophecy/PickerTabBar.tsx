import { useTranslation } from 'react-i18next';
import { PURPLE } from './prophecyTypes';
import type { PickerTab } from './prophecyTypes';

interface PickerTabBarProps {
  allVisibleTabs: PickerTab[];
  activeTab: PickerTab;
  tabCounts: Map<string, number>;
  isSearching: boolean;
  query: string;
  onTabChange: (tab: PickerTab) => void;
  onQueryChange: (q: string) => void;
}

export function PickerTabBar({
  allVisibleTabs,
  activeTab,
  tabCounts,
  isSearching,
  query,
  onTabChange,
  onQueryChange,
}: Readonly<PickerTabBarProps>) {
  const { t } = useTranslation();

  return (
    <div
      style={{
        padding: '14px 24px',
        borderBottom: '1px solid rgba(147,73,204,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1 }}>
        {allVisibleTabs.map((tab) => {
          const active = activeTab === tab && !isSearching;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              style={{
                padding: '7px 12px',
                fontSize: 12,
                fontFamily: '"Cinzel", serif',
                letterSpacing: 0.5,
                fontWeight: 600,
                background: active ? `${PURPLE}26` : 'transparent',
                color: active ? '#fff' : '#8e8a9a',
                border: `1px solid ${active ? `${PURPLE}66` : 'rgba(147,73,204,0.15)'}`,
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              {String(t(`picker.tabs.${tab}`, { defaultValue: tab }))}
              <span style={{ opacity: 0.5, marginLeft: 4, fontSize: 11 }}>
                {tabCounts.get(tab) ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      <input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={String(t('picker.search'))}
        style={{
          width: 180,
          padding: '7px 12px',
          fontSize: 12,
          background: 'rgba(11,8,20,0.8)',
          color: '#e8e4f0',
          border: '1px solid rgba(147,73,204,0.2)',
          borderRadius: 6,
          fontFamily: 'inherit',
          outline: 'none',
        }}
      />
    </div>
  );
}
