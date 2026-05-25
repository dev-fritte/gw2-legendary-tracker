import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GENERATION_ORDER, type LegendaryGeneration } from '@/utils/legendaryGenerations';
import { storage } from '@/services/storage';
import type { LegendaryPickerItem } from './useAllLegendaryItems';
import { GENERATION_TO_TAB } from './useAllLegendaryItems';
import { PICKER_TABS, PURPLE, TAB_GENERATIONS } from './prophecyTypes';
import type { PickerTab } from './prophecyTypes';
import { ItemGroup } from './ItemGroup';
import { PickerHeader } from './PickerHeader';
import { PickerTabBar } from './PickerTabBar';

export interface RoadmapUsage {
  /** Item names that sit in already-done steps */
  done: Set<string>;
  /** Item names that sit in planned (not-yet-done) steps */
  planned: Set<string>;
}

interface PickerProps {
  allItems: LegendaryPickerItem[];
  currentItem: string | null;
  usedInRoadmap: RoadmapUsage;
  onPick: (name: string) => void;
  onClose: () => void;
}

export function ProphecyPicker({
  allItems,
  currentItem,
  usedInRoadmap,
  onPick,
  onClose,
}: Readonly<PickerProps>) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<PickerTab>('Waffen');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Build tab → generation → items map
  const tabMap = new Map<string, Map<LegendaryGeneration, LegendaryPickerItem[]>>();
  for (const item of allItems) {
    const tab = GENERATION_TO_TAB[item.generation] ?? 'Sonstige';
    if (!tabMap.has(tab)) tabMap.set(tab, new Map());
    const genMap = tabMap.get(tab)!;
    if (!genMap.has(item.generation)) genMap.set(item.generation, []);
    genMap.get(item.generation)!.push(item);
  }

  const tabCounts = new Map<string, number>();
  for (const [tab, genMap] of tabMap) {
    let n = 0;
    for (const items of genMap.values()) n += items.length;
    tabCounts.set(tab, n);
  }

  // Build the set of weapon types the user has actually chosen in their starter kits.
  // Read once when the picker mounts (choices don't change while it's open).
  const kitChosenWeaponTypes = useMemo(() => {
    const choices = storage.getKitChoices();
    const result = new Set<string>();
    for (const slots of Object.values(choices)) {
      for (const wt of slots) {
        if (wt !== null) result.add(wt);
      }
    }
    return result;
  }, []);

  const isSearching = query.trim().length > 0;
  const searchResults = isSearching
    ? allItems.filter(
        (it) =>
          it.name.toLowerCase().includes(query.toLowerCase()) ||
          (it.detailType ?? '').toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  const activeGenMap =
    tabMap.get(activeTab) ?? new Map<LegendaryGeneration, LegendaryPickerItem[]>();
  const genOrder = (TAB_GENERATIONS[activeTab] ?? GENERATION_ORDER).filter((g) =>
    activeGenMap.has(g),
  );

  const allVisibleTabs = [
    ...PICKER_TABS,
    ...(tabMap.has('Sonstige') ? (['Sonstige'] as const) : []),
  ] as PickerTab[];

  function renderItemGrid() {
    if (isSearching) {
      return (
        <ItemGroup
          items={searchResults}
          currentItem={currentItem}
          onPick={onPick}
          t={t}
          kitChosenWeaponTypes={kitChosenWeaponTypes}
          usedInRoadmap={usedInRoadmap}
          showGenLabel
        />
      );
    }
    if (genOrder.length === 0) {
      return (
        <p style={{ color: '#5a5468', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
          {t('picker.noResults')}
        </p>
      );
    }
    return genOrder.map((gen) => (
      <div key={gen} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: PURPLE,
            }}
          >
            {t(`overview.${gen}`)}
          </span>
          <div style={{ flex: 1, height: 1, background: 'rgba(147,73,204,0.15)' }} />
          <span style={{ fontSize: 11, color: '#5a5468' }}>
            {activeGenMap.get(gen)?.length ?? 0}
          </span>
        </div>
        <ItemGroup
          items={activeGenMap.get(gen) ?? []}
          currentItem={currentItem}
          onPick={onPick}
          t={t}
          kitChosenWeaponTypes={kitChosenWeaponTypes}
          usedInRoadmap={usedInRoadmap}
        />
      </div>
    ));
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(11,8,20,0.75)',
        backdropFilter: 'blur(6px)',
        display: 'grid',
        placeItems: 'center',
        padding: 40,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 900,
          maxHeight: '90vh',
          background: '#14101c',
          border: '1px solid rgba(147,73,204,0.35)',
          borderRadius: 14,
          boxShadow: '0 20px 80px rgba(147,73,204,0.25), 0 0 0 1px rgba(147,73,204,0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <PickerHeader onClose={onClose} />

        <PickerTabBar
          allVisibleTabs={allVisibleTabs}
          activeTab={activeTab}
          tabCounts={tabCounts}
          isSearching={isSearching}
          query={query}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setQuery('');
          }}
          onQueryChange={setQuery}
        />

<div style={{ padding: '16px 24px 24px', overflowY: 'auto', flex: 1 }}>
          {renderItemGrid()}
        </div>
      </div>
    </div>
  );
}
