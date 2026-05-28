import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCw, Save } from 'lucide-react';
import type { NavSection } from '@/components/Navbar';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useOwnedStarterKits } from '@/hooks/useOwnedStarterKits';
import { useGen1WeaponCards } from '@/hooks/useGen1WeaponCards.ts';
import { useArmoryStatus } from '@/hooks/useArmoryStatus';
import { storage } from '@/services/storage';
import { STARTER_KIT_ORDER, STARTER_KIT_WEAPONS } from '@/utils/starterKits';
import type { WeaponCardInfo } from '@/hooks/useGen1WeaponCards.ts';
import type { WeaponType } from '@/types/gw2-api';
import type { KitChoices, FilterMode } from './starterKitTypes';
import { normalizeChoices } from './starterKitUtils';
import { KitHeaderRow } from './KitHeaderRow';
import { SlotRow } from './SlotRow';
import { StatPill, FilterToggle, KitListSkeleton } from './StarterKitHelpers';

interface Props {
  apiKey: string;
  onLogout: () => void;
  onNavigate: (section: NavSection) => void;
}

export function StarterKitsPage({ apiKey, onLogout, onNavigate }: Readonly<Props>) {
  const { t } = useTranslation();
  const { ownedCounts, isLoading: isLoadingOwned, error, refetch } = useOwnedStarterKits(apiKey);
  const { weaponCardMap, isLoading: isLoadingCards } = useGen1WeaponCards(
    apiKey,
    useTranslation().i18n.language.startsWith('de') ? 'de' : 'en',
  );
  const { unlockedItemIds, partiallyCoveredWeaponTypes, coveredWeaponTypes } = useArmoryStatus(apiKey);

  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [expandedKits, setExpandedKits] = useState<Set<number>>(new Set());
  const [choices, setChoices] = useState<KitChoices>(() => {
    const raw = storage.getKitChoices();
    const result: KitChoices = {};
    for (const [key, val] of Object.entries(raw)) {
      result[Number(key)] = val as (WeaponType | null)[];
    }
    return result;
  });

  const isLoading = isLoadingOwned || isLoadingCards;

  const toggleExpanded = (kitId: number) => {
    setExpandedKits((prev) => {
      const next = new Set(prev);
      if (next.has(kitId)) next.delete(kitId);
      else next.add(kitId);
      return next;
    });
  };

  const setSlotChoice = (kitId: number, slotIdx: number, weapon: WeaponType | null) => {
    setChoices((prev) => {
      const count = ownedCounts.get(kitId) ?? 0;
      const current = normalizeChoices(prev[kitId], count);
      const updated = [...current];
      updated[slotIdx] = weapon;
      const newChoices = { ...prev, [kitId]: updated };
      const toStore: Record<string, (string | null)[]> = {};
      for (const [k, v] of Object.entries(newChoices)) toStore[k] = v;
      storage.setKitChoices(toStore);
      return newChoices;
    });
  };

  const ownedKitTypes = STARTER_KIT_ORDER.filter((id) => (ownedCounts.get(id) ?? 0) > 0).length;
  const totalSlots = STARTER_KIT_ORDER.reduce((sum, id) => sum + (ownedCounts.get(id) ?? 0), 0);
  const filledSlots = STARTER_KIT_ORDER.reduce((sum, id) => {
    const count = ownedCounts.get(id) ?? 0;
    return sum + normalizeChoices(choices[id], count).filter((c) => c !== null).length;
  }, 0);

  const displayedKits =
    filterMode === 'owned'
      ? STARTER_KIT_ORDER.filter((id) => (ownedCounts.get(id) ?? 0) > 0)
      : STARTER_KIT_ORDER;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0b0814', color: '#e8e4f0' }}>
      <Navbar onLogout={onLogout} activeSection="starterkits" onNavigate={onNavigate} />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 space-y-6">
        {/* Page header */}
        <div className="space-y-3">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            <span style={{ color: '#9349CC' }}>{t('starterKits.stepLabel')}</span>
            <span style={{ color: '#3a3448' }}>—</span>
            <span style={{ color: '#5a5468' }}>{t('starterKits.stepSub')}</span>
          </div>
          <h1
            style={{
              fontFamily: '"Cinzel", serif',
              fontSize: 36,
              fontWeight: 700,
              color: '#e8e4f0',
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {t('starterKits.title')}
          </h1>
          <p className="text-sm" style={{ color: '#6a6478', maxWidth: 560 }}>
            {t('starterKits.description')}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              borderRadius: 8,
              border: '1px solid rgba(239,68,68,0.3)',
              background: 'rgba(239,68,68,0.08)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <AlertTriangle
              style={{ width: 18, height: 18, color: '#f87171', flexShrink: 0, marginTop: 1 }}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#fca5a5', margin: 0 }}>
                {t('starterKits.errorTitle')}
              </p>
              <p style={{ fontSize: 12, color: 'rgba(252,165,165,0.7)', margin: 0 }}>
                {(error as Error).message}
              </p>
              <Button
                size="sm"
                variant="outline"
                style={{
                  alignSelf: 'flex-start',
                  borderColor: 'rgba(239,68,68,0.3)',
                  color: '#f87171',
                }}
                onClick={refetch}
              >
                <RefreshCw style={{ width: 12, height: 12, marginRight: 4 }} />
                {t('starterKits.errorRetry')}
              </Button>
            </div>
          </div>
        )}

        {/* Stats + filter bar */}
        {!error && (
          <div
            style={{
              border: '1px solid rgba(147,73,204,0.18)',
              background: 'rgba(20,16,28,0.8)',
              borderRadius: 8,
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <StatPill
                label={t('starterKits.ownedKits')}
                value={isLoadingOwned ? '…' : `${ownedKitTypes} / ${STARTER_KIT_ORDER.length}`}
              />
              <StatPill
                label={t('starterKits.slotsFilled')}
                value={isLoadingOwned ? '…' : `${filledSlots} / ${totalSlots}`}
              />
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Save style={{ width: 11, height: 11, color: '#3a3448' }} />
                <span style={{ fontSize: 11, color: '#3a3448' }}>{t('starterKits.autoSaved')}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  color: '#5a5468',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {t('starterKits.filterLabel')}
              </span>
              <FilterToggle
                value={filterMode}
                onChange={setFilterMode}
                allCount={STARTER_KIT_ORDER.length}
                ownedCount={ownedKitTypes}
              />
            </div>
          </div>
        )}

        {/* Kit list */}
        {!error && (
          <div
            style={{
              border: '1px solid rgba(147,73,204,0.18)',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <KitListContent
              isLoading={isLoading}
              displayedKits={displayedKits}
              ownedCounts={ownedCounts}
              expandedKits={expandedKits}
              choices={choices}
              weaponCardMap={weaponCardMap}
              unlockedItemIds={unlockedItemIds}
              partiallyCoveredWeaponTypes={partiallyCoveredWeaponTypes}
              coveredWeaponTypes={coveredWeaponTypes}
              onToggle={toggleExpanded}
              onSlotChange={setSlotChoice}
              noOwnedLabel={t('starterKits.noOwned')}
            />
          </div>
        )}
      </main>
    </div>
  );
}

// ─── KitListContent ───────────────────────────────────────────────────────────

interface KitListContentProps {
  isLoading: boolean;
  displayedKits: number[];
  ownedCounts: Map<number, number>;
  expandedKits: Set<number>;
  choices: KitChoices;
  weaponCardMap: Map<WeaponType, WeaponCardInfo>;
  unlockedItemIds: Set<number>;
  partiallyCoveredWeaponTypes: Set<WeaponType>;
  coveredWeaponTypes: Set<WeaponType>;
  onToggle: (kitId: number) => void;
  onSlotChange: (kitId: number, slotIdx: number, weapon: WeaponType | null) => void;
  noOwnedLabel: string;
}

function KitListContent({
  isLoading,
  displayedKits,
  ownedCounts,
  expandedKits,
  choices,
  weaponCardMap,
  unlockedItemIds,
  partiallyCoveredWeaponTypes,
  coveredWeaponTypes,
  onToggle,
  onSlotChange,
  noOwnedLabel,
}: Readonly<KitListContentProps>) {
  if (isLoading) return <KitListSkeleton />;

  if (displayedKits.length === 0) {
    return (
      <div style={{ padding: '32px 24px', textAlign: 'center', color: '#5a5468', fontSize: 14 }}>
        {noOwnedLabel}
      </div>
    );
  }

  return displayedKits.map((kitId, idx) => {
    const setNum = STARTER_KIT_ORDER.indexOf(kitId) + 1;
    const count = ownedCounts.get(kitId) ?? 0;
    const isOwned = count > 0;
    const isExpanded = expandedKits.has(kitId);
    const kitChoices = normalizeChoices(choices[kitId], count);
    const availableWeapons = STARTER_KIT_WEAPONS[kitId];
    const isLast = idx === displayedKits.length - 1;

    return (
      <div key={kitId} style={isLast ? {} : { borderBottom: '1px solid rgba(147,73,204,0.1)' }}>
        <KitHeaderRow
          setNum={setNum}
          count={count}
          isOwned={isOwned}
          isExpanded={isExpanded}
          kitChoices={kitChoices}
          availableWeapons={availableWeapons}
          weaponCardMap={weaponCardMap}
          unlockedItemIds={unlockedItemIds}
          partiallyCoveredWeaponTypes={partiallyCoveredWeaponTypes}
          coveredWeaponTypes={coveredWeaponTypes}
          onToggle={() => onToggle(kitId)}
        />

        {isOwned && isExpanded && (
          <div
            style={{
              borderTop: '1px solid rgba(147,73,204,0.1)',
              background: 'rgba(11,8,20,0.5)',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {kitChoices.map((choice, slotIdx) => (
              <SlotRow
                key={slotIdx}
                slotIndex={slotIdx + 1}
                totalSlots={count}
                choice={choice}
                availableWeapons={availableWeapons}
                weaponCardMap={weaponCardMap}
                unlockedItemIds={unlockedItemIds}
                partiallyCoveredWeaponTypes={partiallyCoveredWeaponTypes}
                coveredWeaponTypes={coveredWeaponTypes}
                onChange={(weapon) => onSlotChange(kitId, slotIdx, weapon)}
              />
            ))}
          </div>
        )}
      </div>
    );
  });
}
