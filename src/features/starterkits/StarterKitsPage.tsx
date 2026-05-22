import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Save,
} from 'lucide-react';
import type { NavSection } from '@/components/Navbar';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useOwnedStarterKits } from '@/hooks/useOwnedStarterKits';
import type { WeaponCardInfo } from '@/hooks/useGen1WeaponCards.ts';
import { useGen1WeaponCards } from '@/hooks/useGen1WeaponCards.ts';
import { useArmoryStatus } from '@/hooks/useArmoryStatus';
import { storage } from '@/services/storage';
import { STARTER_KIT_ORDER, STARTER_KIT_WEAPONS } from '@/utils/starterKits';
import type { WeaponType } from '@/types/gw2-api';

type KitChoices = Record<number, (WeaponType | null)[]>;
type FilterMode = 'all' | 'owned';

interface Props {
  apiKey: string;
  onLogout: () => void;
  onNavigate: (section: NavSection) => void;
}

function normalizeChoices(
  stored: (WeaponType | null)[] | undefined,
  count: number
): (WeaponType | null)[] {
  if (count === 0) return [];
  if (!stored || stored.length === 0) return Array(count).fill(null) as null[];
  if (stored.length === count) return stored;
  if (stored.length < count)
    return [...stored, ...(Array(count - stored.length).fill(null) as null[])];
  return stored.slice(0, count);
}

function wikiUrl(name: string): string {
  return `https://wiki.guildwars2.com/wiki/${encodeURIComponent(name.replace(/ /g, '_'))}`;
}

export function StarterKitsPage({ apiKey, onLogout, onNavigate }: Readonly<Props>) {
  const { t } = useTranslation();
  const { ownedCounts, isLoading: isLoadingOwned, error, refetch } = useOwnedStarterKits(apiKey);
  const { weaponCardMap, isLoading: isLoadingCards } = useGen1WeaponCards(apiKey);
  const { unlockedItemIds, coveredWeaponTypes } = useArmoryStatus(apiKey);

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
            {isLoading ? (
              <KitListSkeleton />
            ) : displayedKits.length === 0 ? (
              <div
                style={{
                  padding: '32px 24px',
                  textAlign: 'center',
                  color: '#5a5468',
                  fontSize: 14,
                }}
              >
                {t('starterKits.noOwned')}
              </div>
            ) : (
              displayedKits.map((kitId, idx) => {
                const setNum = STARTER_KIT_ORDER.indexOf(kitId) + 1;
                const count = ownedCounts.get(kitId) ?? 0;
                const isOwned = count > 0;
                const isExpanded = expandedKits.has(kitId);
                const kitChoices = normalizeChoices(choices[kitId], count);
                const availableWeapons = STARTER_KIT_WEAPONS[kitId];
                const isLast = idx === displayedKits.length - 1;

                return (
                  <div
                    key={kitId}
                    style={isLast ? {} : { borderBottom: '1px solid rgba(147,73,204,0.1)' }}
                  >
                    <KitHeaderRow
                      setNum={setNum}
                      count={count}
                      isOwned={isOwned}
                      isExpanded={isExpanded}
                      kitChoices={kitChoices}
                      availableWeapons={availableWeapons}
                      weaponCardMap={weaponCardMap}
                      unlockedItemIds={unlockedItemIds}
                      coveredWeaponTypes={coveredWeaponTypes}
                      onToggle={() => toggleExpanded(kitId)}
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
                            coveredWeaponTypes={coveredWeaponTypes}
                            onChange={(weapon) => setSlotChoice(kitId, slotIdx, weapon)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Kit header row ────────────────────────────────────────────────────────────

interface KitHeaderRowProps {
  setNum: number;
  count: number;
  isOwned: boolean;
  isExpanded: boolean;
  kitChoices: (WeaponType | null)[];
  availableWeapons: WeaponType[];
  weaponCardMap: Map<WeaponType, WeaponCardInfo>;
  unlockedItemIds: Set<number>;
  coveredWeaponTypes: Set<WeaponType>;
  onToggle: () => void;
}

function KitHeaderRow({
  setNum,
  count,
  isOwned,
  isExpanded,
  kitChoices,
  availableWeapons,
  weaponCardMap,
  unlockedItemIds,
  coveredWeaponTypes,
  onToggle,
}: KitHeaderRowProps) {
  const { t } = useTranslation();
  const openCount = kitChoices.filter((c) => c === null).length;

  return (
    <div
      role={isOwned ? 'button' : undefined}
      tabIndex={isOwned ? 0 : undefined}
      onClick={isOwned ? onToggle : undefined}
      onKeyDown={
        isOwned
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggle();
              }
            }
          : undefined
      }
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '11px 16px',
        cursor: isOwned ? 'pointer' : 'default',
        background: isExpanded ? 'rgba(147,73,204,0.07)' : 'transparent',
        opacity: isOwned ? 1 : 0.35,
        transition: 'background 0.15s',
        userSelect: 'none',
        outline: 'none',
      }}
      onMouseEnter={(e) => {
        if (isOwned && !isExpanded)
          (e.currentTarget as HTMLDivElement).style.background = 'rgba(147,73,204,0.04)';
      }}
      onMouseLeave={(e) => {
        if (isOwned && !isExpanded)
          (e.currentTarget as HTMLDivElement).style.background = 'transparent';
      }}
    >
      <div style={{ width: 14, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        {isOwned &&
          (isExpanded ? (
            <ChevronDown style={{ width: 14, height: 14, color: '#9349CC' }} />
          ) : (
            <ChevronRight style={{ width: 14, height: 14, color: '#5a5468' }} />
          ))}
      </div>

      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#5a5468',
          width: 16,
          flexShrink: 0,
          textAlign: 'right',
        }}
      >
        {setNum}
      </span>

      <span
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: isOwned ? '#c8bee0' : '#6a6478',
          flexShrink: 0,
          minWidth: 160,
        }}
      >
        {t('starterKits.kitName', { num: setNum })}
      </span>

      {count > 1 && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#9349CC',
            background: 'rgba(147,73,204,0.15)',
            border: '1px solid rgba(147,73,204,0.3)',
            borderRadius: 10,
            padding: '1px 7px',
            flexShrink: 0,
          }}
        >
          ×{count}
        </span>
      )}

      {/* Summary chips */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          flex: 1,
          flexWrap: 'wrap',
          minWidth: 0,
        }}
      >
        {isOwned ? (
          <>
            {kitChoices.map((choice, i) => {
              if (!choice) return null;
              const cardInfo = weaponCardMap.get(choice);
              const isItemOwned = cardInfo ? unlockedItemIds.has(cardInfo.id) : false;
              const isTypeCovered = coveredWeaponTypes.has(choice);
              const chipStyle = CHIP_STYLES[getChipVariant(isItemOwned, isTypeCovered)];
              return (
                <span
                  key={i}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    color: chipStyle.color,
                    background: chipStyle.background,
                    border: chipStyle.border,
                    borderRadius: 4,
                    padding: '1px 6px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cardInfo && (
                    <img
                      src={cardInfo.icon}
                      alt=""
                      style={{ width: 14, height: 14, borderRadius: 2, objectFit: 'cover' }}
                    />
                  )}
                  {cardInfo ? cardInfo.name : t(`weapons.${choice}`)}
                </span>
              );
            })}
            {openCount > 0 && (
              <span style={{ fontSize: 11, color: '#4a4458', whiteSpace: 'nowrap' }}>
                {t('starterKits.openSlots', { count: openCount })}
              </span>
            )}
          </>
        ) : (
          availableWeapons.map((wt) => (
            <span
              key={wt}
              style={{
                fontSize: 11,
                color: '#3a3448',
                background: 'rgba(58,52,72,0.25)',
                borderRadius: 4,
                padding: '1px 6px',
                whiteSpace: 'nowrap',
              }}
            >
              {t(`weapons.${wt}`)}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Slot row with weapon cards ────────────────────────────────────────────────

interface SlotRowProps {
  slotIndex: number;
  totalSlots: number;
  choice: WeaponType | null;
  availableWeapons: WeaponType[];
  weaponCardMap: Map<WeaponType, WeaponCardInfo>;
  unlockedItemIds: Set<number>;
  coveredWeaponTypes: Set<WeaponType>;
  onChange: (weapon: WeaponType | null) => void;
}

function SlotRow({
  slotIndex,
  totalSlots,
  choice,
  availableWeapons,
  weaponCardMap,
  unlockedItemIds,
  coveredWeaponTypes,
  onChange,
}: SlotRowProps) {
  const { t } = useTranslation();

  return (
    <div
      style={{
        background: 'rgba(20,16,28,0.6)',
        borderRadius: 8,
        border: '1px solid rgba(147,73,204,0.1)',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#4a4458',
        }}
      >
        {t('starterKits.slotLabel', { index: slotIndex, total: totalSlots })}
      </span>

      <div style={{ display: 'flex', gap: 8 }}>
        {availableWeapons.map((wt) => {
          const info = weaponCardMap.get(wt);
          return (
            <WeaponCard
              key={wt}
              weaponType={wt}
              cardInfo={info}
              isSelected={choice === wt}
              isItemOwned={info ? unlockedItemIds.has(info.id) : false}
              isTypeCovered={coveredWeaponTypes.has(wt)}
              onSelect={() => onChange(choice === wt ? null : wt)}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Weapon card styles ───────────────────────────────────────────────────────

type CardVariant = 'selected' | 'owned' | 'covered' | 'default';

function getCardVariant(
  isSelected: boolean,
  isItemOwned: boolean,
  isTypeCovered: boolean
): CardVariant {
  if (isSelected) return 'selected';
  if (isItemOwned) return 'owned';
  if (isTypeCovered) return 'covered';
  return 'default';
}

interface CardStyles {
  borderColor: string;
  bgColor: string;
  boxShadow: string;
  imgFilter: string;
  nameColor: string;
  typeColor: string;
  hoverBorderColor: string;
}

const CARD_STYLES: Record<CardVariant, CardStyles> = {
  selected: {
    borderColor: 'rgba(147,73,204,0.75)',
    bgColor: 'linear-gradient(145deg, rgba(147,73,204,0.14), rgba(122,58,170,0.08))',
    boxShadow: '0 0 12px rgba(147,73,204,0.2)',
    imgFilter: 'none',
    nameColor: '#d4c8e8',
    typeColor: '#9349CC',
    hoverBorderColor: 'rgba(147,73,204,0.75)',
  },
  owned: {
    borderColor: 'rgba(147,73,204,0.12)',
    bgColor: 'rgba(74,222,128,0.05)',
    boxShadow: 'none',
    imgFilter: 'none',
    nameColor: '#86efac',
    typeColor: 'rgba(74,222,128,0.6)',
    hoverBorderColor: 'rgba(147,73,204,0.3)',
  },
  covered: {
    borderColor: 'rgba(147,73,204,0.12)',
    bgColor: 'rgba(251,191,36,0.04)',
    boxShadow: 'none',
    imgFilter: 'brightness(0.8)',
    nameColor: '#fcd34d',
    typeColor: 'rgba(251,191,36,0.5)',
    hoverBorderColor: 'rgba(147,73,204,0.3)',
  },
  default: {
    borderColor: 'rgba(147,73,204,0.12)',
    bgColor: 'rgba(20,16,28,0.7)',
    boxShadow: 'none',
    imgFilter: 'brightness(0.65)',
    nameColor: '#5a5468',
    typeColor: '#3a3448',
    hoverBorderColor: 'rgba(147,73,204,0.3)',
  },
};

// ─── Chip styles ──────────────────────────────────────────────────────────────

type ChipVariant = 'owned' | 'covered' | 'default';

function getChipVariant(isItemOwned: boolean, isTypeCovered: boolean): ChipVariant {
  if (isItemOwned) return 'owned';
  if (isTypeCovered) return 'covered';
  return 'default';
}

const CHIP_STYLES: Record<ChipVariant, { color: string; background: string; border: string }> = {
  owned: {
    color: '#86efac',
    background: 'rgba(74,222,128,0.08)',
    border: '1px solid rgba(74,222,128,0.25)',
  },
  covered: {
    color: '#fcd34d',
    background: 'rgba(251,191,36,0.08)',
    border: '1px solid rgba(251,191,36,0.25)',
  },
  default: {
    color: '#a78bca',
    background: 'rgba(147,73,204,0.1)',
    border: '1px solid rgba(147,73,204,0.22)',
  },
};

// ─── Weapon card ──────────────────────────────────────────────────────────────

function WeaponCard({
  weaponType,
  cardInfo,
  isSelected,
  isItemOwned,
  isTypeCovered,
  onSelect,
}: {
  weaponType: WeaponType;
  cardInfo: WeaponCardInfo | undefined;
  isSelected: boolean;
  isItemOwned: boolean;
  isTypeCovered: boolean;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  const variant = getCardVariant(isSelected, isItemOwned, isTypeCovered);
  const styles = CARD_STYLES[variant];

  return (
    <div
      onClick={onSelect}
      style={{
        flex: '1 1 0',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: 8,
        borderRadius: 8,
        cursor: 'pointer',
        border: `1.5px solid ${styles.borderColor}`,
        background: styles.bgColor,
        transition: 'all 0.15s',
        boxShadow: styles.boxShadow,
      }}
      onMouseEnter={(e) => {
        if (!isSelected)
          (e.currentTarget as HTMLDivElement).style.borderColor = styles.hoverBorderColor;
      }}
      onMouseLeave={(e) => {
        if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = styles.borderColor;
      }}
    >
      {/* Icon with status badge + wiki link */}
      <div style={{ position: 'relative', aspectRatio: '1', width: '100%' }}>
        {cardInfo ? (
          <>
            <img
              src={cardInfo.icon}
              alt={cardInfo.name}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 5,
                objectFit: 'cover',
                display: 'block',
                filter: styles.imgFilter,
                transition: 'filter 0.15s',
              }}
            />

            {/* Armory status badge — top-left */}
            {(isItemOwned || isTypeCovered) && (
              <div
                title={isItemOwned ? t('starterKits.ownedInArmory') : t('starterKits.typeCovered')}
                style={{
                  position: 'absolute',
                  top: 3,
                  left: 3,
                  width: 16,
                  height: 16,
                  borderRadius: 3,
                  background: isItemOwned ? 'rgba(22,163,74,0.85)' : 'rgba(180,130,0,0.85)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#fff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
                }}
              >
                {isItemOwned ? '✓' : '~'}
              </div>
            )}

            {/* Wiki link — bottom-right */}
            <a
              href={wikiUrl(cardInfo.name)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title={t('starterKits.openWiki')}
              style={{
                position: 'absolute',
                bottom: 3,
                right: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 16,
                height: 16,
                borderRadius: 3,
                background: 'rgba(0,0,0,0.6)',
                color: 'rgba(255,255,255,0.55)',
                textDecoration: 'none',
              }}
            >
              <ExternalLink style={{ width: 9, height: 9 }} />
            </a>
          </>
        ) : (
          <div
            className="animate-pulse"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 5,
              background: 'rgba(147,73,204,0.08)',
            }}
          />
        )}
      </div>

      {/* Text */}
      <div>
        <p
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: styles.nameColor,
            margin: 0,
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={cardInfo?.name}
        >
          {cardInfo ? cardInfo.name : '…'}
        </p>
        <p
          style={{
            fontSize: 9,
            color: styles.typeColor,
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontWeight: 700,
          }}
        >
          {t(`weapons.${weaponType}`)}
        </p>
      </div>
    </div>
  );
}

// ─── Helper components ─────────────────────────────────────────────────────────

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#5a5468',
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 22, fontWeight: 700, color: '#e8e4f0', lineHeight: 1 }}>
        {value}
      </span>
    </div>
  );
}

function FilterToggle({
  value,
  onChange,
  allCount,
  ownedCount,
}: {
  value: FilterMode;
  onChange: (v: FilterMode) => void;
  allCount: number;
  ownedCount: number;
}) {
  const { t } = useTranslation();
  return (
    <div
      style={{
        display: 'flex',
        border: '1px solid rgba(147,73,204,0.25)',
        borderRadius: 6,
        overflow: 'hidden',
      }}
    >
      {(['all', 'owned'] as const).map((mode) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          style={{
            padding: '4px 12px',
            fontSize: 12,
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s',
            background:
              value === mode ? 'linear-gradient(135deg, #9349CC, #7a3aaa)' : 'transparent',
            color: value === mode ? '#fff' : '#8e8a9a',
          }}
        >
          {mode === 'all'
            ? t('starterKits.filterAll', { count: allCount })
            : t('starterKits.filterOwned', { count: ownedCount })}
        </button>
      ))}
    </div>
  );
}

function KitListSkeleton() {
  return (
    <div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse"
          style={{
            height: 46,
            borderBottom: i < 5 ? '1px solid rgba(147,73,204,0.1)' : undefined,
            background: 'rgba(147,73,204,0.03)',
          }}
        />
      ))}
    </div>
  );
}
