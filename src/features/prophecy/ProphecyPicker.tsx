import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { GENERATION_ORDER, type LegendaryGeneration } from '@/utils/legendaryGenerations';
import { storage } from '@/services/storage';
import type { LegendaryPickerItem } from './useAllLegendaryItems';
import { GENERATION_TINT, GENERATION_TO_TAB } from './useAllLegendaryItems';
import { getSubLabel } from './prophecyHelpers';
import { GOLD, PICKER_TABS, PURPLE, PURPLE_DEEP, TAB_GENERATIONS } from './prophecyTypes';
import type { PickerTab } from './prophecyTypes';

// ─── ItemGroup ────────────────────────────────────────────────────────────────

interface ItemGroupProps {
  items: LegendaryPickerItem[];
  currentItem: string | null;
  onPick: (name: string) => void;
  t: TFunction;
  kitChosenWeaponTypes: Set<string>;
  showGenLabel?: boolean;
}

function ItemGroup({ items, currentItem, onPick, t, kitChosenWeaponTypes, showGenLabel }: Readonly<ItemGroupProps>) {
  if (items.length === 0) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
      {items.map((it) => {
        const isCurrent = currentItem === it.name;
        const tint = GENERATION_TINT[it.generation];
        const subLabel = getSubLabel(it, t);

        // Only mark Gen1 weapons the user has explicitly chosen in their starter kits
        const isStarterKit =
          it.generation === 'gen1' &&
          !!it.detailType &&
          kitChosenWeaponTypes.has(it.detailType);

        return (
          <button
            key={it.id}
            onClick={() => onPick(it.name)}
            style={{
              height: 72,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '0 12px',
              textAlign: 'left',
              cursor: 'pointer',
              background: isCurrent ? `${PURPLE}1f` : 'rgba(11,8,20,0.6)',
              border: `1px solid ${isCurrent ? `${PURPLE}88` : 'rgba(147,73,204,0.15)'}`,
              borderRadius: 8,
              color: '#e8e4f0',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s, background 0.15s',
              minWidth: 0,
            }}
            onMouseEnter={(e) => {
              if (!isCurrent)
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(147,73,204,0.4)';
            }}
            onMouseLeave={(e) => {
              if (!isCurrent)
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(147,73,204,0.15)';
            }}
          >
            {/* Icon — wrapped in relative container so the kit badge sits outside
                the overflow:hidden box */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 6,
                  background: it.icon
                    ? '#0b0814'
                    : `radial-gradient(circle at 30% 30%, ${tint}90, ${PURPLE_DEEP})`,
                  border: isStarterKit ? `1px solid ${GOLD}99` : `1px solid ${tint}66`,
                  boxShadow: isStarterKit ? `0 0 10px ${GOLD}55` : `0 0 8px ${tint}33`,
                  overflow: 'hidden',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                {it.icon ? (
                  <img
                    src={it.icon}
                    alt={it.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: 18, color: '#fff' }}>✦</span>
                )}
              </div>

              {/* Gold pip — only for Starter Kit weapons */}
              {isStarterKit && (
                <div
                  title="Erhältlich über ein Legendary Weapon Starter Kit"
                  style={{
                    position: 'absolute',
                    top: -5,
                    right: -5,
                    width: 15,
                    height: 15,
                    borderRadius: '50%',
                    background: GOLD,
                    border: '1.5px solid #0b0814',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 8,
                    lineHeight: 1,
                    color: '#1a1000',
                    fontWeight: 900,
                    pointerEvents: 'none',
                  }}
                >
                  ⚒
                </div>
              )}
            </div>

            {/* Text */}
            <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
              <div
                style={{
                  fontFamily: '"Cinzel", serif',
                  fontSize: 12,
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {it.name}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: '#8e8a9a',
                  marginTop: 2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {showGenLabel
                  ? `${String(t(`overview.${it.generation}`))} · ${subLabel || it.itemType}`
                  : subLabel || it.itemType}
              </div>
            </div>

            {isCurrent && <span style={{ color: PURPLE, fontSize: 16, flexShrink: 0 }}>✓</span>}
          </button>
        );
      })}
    </div>
  );
}

// ─── ProphecyPicker ───────────────────────────────────────────────────────────

interface PickerProps {
  allItems: LegendaryPickerItem[];
  currentItem: string | null;
  onPick: (name: string) => void;
  onClose: () => void;
}

export function ProphecyPicker({ allItems, currentItem, onPick, onClose }: PickerProps) {
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

  // Resolve item grid content without nested ternaries
  function renderItemGrid() {
    if (isSearching) {
      return (
        <ItemGroup
          items={searchResults}
          currentItem={currentItem}
          onPick={onPick}
          t={t}
          kitChosenWeaponTypes={kitChosenWeaponTypes}
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
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(147,73,204,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 10, letterSpacing: 3, color: PURPLE, fontWeight: 600 }}>
              {t('picker.eyebrow')}
            </div>
            <div
              style={{
                fontFamily: '"Cinzel", serif',
                fontSize: 22,
                fontWeight: 600,
                marginTop: 4,
                color: '#e8e4f0',
              }}
            >
              {t('picker.title')}
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              cursor: 'pointer',
              background: 'transparent',
              border: '1px solid rgba(147,73,204,0.3)',
              color: '#8e8a9a',
              fontSize: 18,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            ×
          </button>
        </div>

        {/* Tabs + search */}
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
                  onClick={() => {
                    setActiveTab(tab);
                    setQuery('');
                  }}
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
            onChange={(e) => setQuery(e.target.value)}
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

        {/* Starter Kit legend — only when weapon items are visible and the user has configured kits */}
        {(activeTab === 'Waffen' || isSearching) && kitChosenWeaponTypes.size > 0 && (
          <div
            style={{
              padding: '5px 24px',
              borderBottom: '1px solid rgba(147,73,204,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <div
              style={{
                width: 13,
                height: 13,
                borderRadius: '50%',
                background: GOLD,
                border: '1.5px solid #0b0814',
                display: 'grid',
                placeItems: 'center',
                fontSize: 7,
                color: '#1a1000',
                fontWeight: 900,
                flexShrink: 0,
              }}
            >
              ⚒
            </div>
            <span style={{ fontSize: 10, color: '#6a6478', letterSpacing: 0.3 }}>
              {t('picker.starterKitHint')}
            </span>
          </div>
        )}

        {/* Item grid */}
        <div style={{ padding: '16px 24px 24px', overflowY: 'auto', flex: 1 }}>
          {renderItemGrid()}
        </div>
      </div>
    </div>
  );
}
