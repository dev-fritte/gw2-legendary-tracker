import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ArrowLeft, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { NavSection } from '@/components/Navbar';
import { Navbar } from '@/components/Navbar';
import {
  WeaponRecommendationCard,
  WeaponRecommendationCardSkeleton,
} from './WeaponRecommendationCard';
import { TrinketRecommendationCard } from './TrinketRecommendationCard';
import { ArmorRecommendationCard } from './ArmorRecommendationCard';
import { useWeaponAnalysis } from '@/hooks/useWeaponAnalysis';
import { useTrinketAnalysis } from '@/hooks/useTrinketAnalysis';
import { useArmorAnalysis } from '@/hooks/useArmorAnalysis';
import { useStarterKits } from '@/hooks/useStarterKits';
import { ALL_ARMOR_WEIGHTS } from '@/utils/armorProperties';
import { useProfessionIconMap } from '@/hooks/useProfessions';
import type { Character } from '@/types/gw2-api';
import { TransferToProphecyModal } from './TransferToProphecyModal';

interface TrackerPageProps {
  apiKey: string;
  characters: Character[];
  onBack: () => void;
  onLogout: () => void;
  onNavigate: (section: NavSection) => void;
}

export function TrackerPage({
  apiKey,
  characters,
  onBack,
  onLogout,
  onNavigate,
}: Readonly<TrackerPageProps>) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'weapons' | 'trinkets' | 'armor'>('weapons');
  const [useStarterKitPriority, setUseStarterKitPriority] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const professionIcons = useProfessionIconMap(apiKey);
  const { kitMap } = useStarterKits(apiKey, characters);
  const { result, isLoading, isLoadingArmory, isLoadingItems, error, refetch } = useWeaponAnalysis(
    apiKey,
    characters,
    kitMap,
    useStarterKitPriority,
  );
  const { result: trinketResult, isLoading: isTrinketLoading, error: trinketError } =
    useTrinketAnalysis(apiKey, characters);
  const { result: armorResult, isLoading: isArmorLoading, error: armorError } =
    useArmorAnalysis(apiKey, characters);

  return (
    <div className="min-h-screen flex flex-col" style={{ color: '#e8e4f0' }}>
      <Navbar onLogout={onLogout} activeSection="zommoros" onNavigate={onNavigate} />

      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-8 space-y-6">
        {/* Page header */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-1.5 -ml-2"
            style={{ color: '#8e8a9a' }}
          >
            <ArrowLeft className="w-4 h-4" />
            {t('tracker.backToSelection')}
          </Button>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span style={{ color: '#9349CC', fontFamily: '"Cinzel", serif', fontSize: 20 }}>
                ✦
              </span>
              <h1
                className="text-xl font-semibold"
                style={{ color: '#e8e4f0', fontFamily: '"Cinzel", serif' }}
              >
                {t('tracker.title')}
              </h1>
            </div>
            <p className="text-sm" style={{ color: '#8e8a9a' }}>
              {t('tracker.description')}
            </p>
          </div>

          {/* Analyzed characters chips */}
          <div className="flex flex-wrap gap-1.5">
            {characters.map((c) => (
              <span
                key={c.name}
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs"
                style={{
                  border: '1px solid rgba(147,73,204,0.25)',
                  background: 'rgba(147,73,204,0.08)',
                  color: '#a89cc0',
                }}
              >
                {c.name}
              </span>
            ))}
          </div>

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(147,73,204,0.15)', paddingBottom: 0 }}>
            {(['weapons', 'trinkets', 'armor'] as const).map((tab) => {
              const isActive = activeTab === tab;
              const pendingCount =
                tab === 'weapons' ? (result?.recommendations.length ?? 0)
                : tab === 'trinkets' ? (trinketResult?.recommendations.length ?? 0)
                : (armorResult?.recommendations.length ?? 0);
              const label =
                tab === 'weapons' ? t('tracker.tabWeapons')
                : tab === 'trinkets' ? t('tracker.tabTrinkets')
                : t('tracker.tabArmor');
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: 600,
                    border: 'none',
                    borderBottom: isActive ? '2px solid #9349CC' : '2px solid transparent',
                    background: 'transparent',
                    color: isActive ? '#d4b8f0' : '#6a6478',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'color 0.15s',
                    marginBottom: -1,
                  }}
                >
                  {label}
                  {pendingCount > 0 && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '1px 5px',
                      borderRadius: 8,
                      background: isActive ? 'rgba(147,73,204,0.25)' : 'rgba(147,73,204,0.12)',
                      color: isActive ? '#c8a0f0' : '#5a5468',
                    }}>
                      {pendingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Starter Kit toggle — weapons tab only */}
          {activeTab === 'weapons' && <label
            className="inline-flex items-center gap-2.5 cursor-pointer select-none"
            style={{ width: 'fit-content' }}
          >
            <div
              role="checkbox"
              aria-checked={useStarterKitPriority}
              tabIndex={0}
              onClick={() => setUseStarterKitPriority((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') setUseStarterKitPriority((v) => !v);
              }}
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                border: useStarterKitPriority
                  ? '1px solid #9349CC'
                  : '1px solid rgba(147,73,204,0.4)',
                background: useStarterKitPriority
                  ? 'linear-gradient(135deg,#b06de0,#7a3aaa)'
                  : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.15s',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {useStarterKitPriority && (
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                  <path
                    d="M1 3.5L3.5 6L8 1"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <span className="text-xs" style={{ color: '#a89cc0' }}>
              {t('tracker.useStarterKits')}
            </span>
          </label>}
        </div>

        {/* Error state — weapons */}
        {activeTab === 'weapons' && error && (
          <div
            className="rounded-lg p-4 flex items-start gap-3"
            style={{ border: '1px solid rgba(220,60,60,0.3)', background: 'rgba(220,60,60,0.06)' }}
          >
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-red-300">{t('tracker.errorTitle')}</p>
              <p className="text-xs text-red-400/80">{(error as Error).message}</p>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-red-800 text-red-400 hover:bg-red-950/40"
                onClick={refetch}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                {t('tracker.errorRetry')}
              </Button>
            </div>
          </div>
        )}

        {/* Loading state — weapons */}
        {activeTab === 'weapons' && isLoading && !error && (
          <div className="space-y-4">
            <LoadingStatus isLoadingArmory={isLoadingArmory} isLoadingItems={isLoadingItems} />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <WeaponRecommendationCardSkeleton key={i} />
              ))}
            </div>
          </div>
        )}

        {/* Results — weapons */}
        {activeTab === 'weapons' && result && !error && (
          <>
            {result.recommendations.length === 0 && result.coveredByArmory.length === 0 && (
              <div
                className="rounded-lg py-14 text-center space-y-3"
                style={{
                  border: '1px solid rgba(147,73,204,0.15)',
                  background: 'rgba(20,16,28,0.6)',
                }}
              >
                <Sparkles
                  className="w-10 h-10 mx-auto"
                  style={{ color: 'rgba(147,73,204,0.35)' }}
                />
                <p className="text-sm max-w-sm mx-auto px-4" style={{ color: '#8e8a9a' }}>
                  {t('tracker.noRecommendations')}
                </p>
              </div>
            )}

            {result.recommendations.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-3">
                  <SectionHeader
                    label={t('tracker.sectionCraftNext')}
                    count={result.recommendations.length}
                    accent
                  />
                  <button
                    onClick={() => setShowTransferModal(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '3px 10px',
                      fontSize: 11,
                      fontWeight: 600,
                      borderRadius: 6,
                      border: '1px solid rgba(147,73,204,0.35)',
                      background: 'rgba(147,73,204,0.1)',
                      color: '#a78bca',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(147,73,204,0.2)';
                      (e.currentTarget as HTMLElement).style.color = '#d4c8e8';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(147,73,204,0.1)';
                      (e.currentTarget as HTMLElement).style.color = '#a78bca';
                    }}
                  >
                    {t('transfer.button')}
                    <ArrowRight style={{ width: 11, height: 11 }} />
                  </button>
                </div>
                {result.recommendations.map((rec, i) => (
                  <WeaponRecommendationCard
                    key={rec.weaponType}
                    recommendation={rec}
                    rank={i + 1}
                    professionIcons={professionIcons}
                  />
                ))}
              </section>
            )}

            {result.coveredByArmory.length > 0 && (
              <>
                {result.recommendations.length > 0 && (
                  <hr style={{ border: 'none', borderTop: '1px solid rgba(147,73,204,0.12)' }} />
                )}
                <section className="space-y-3">
                  <SectionHeader
                    label={t('tracker.sectionAlreadyHave')}
                    count={result.coveredByArmory.length}
                  />
                  {result.coveredByArmory.map((rec, i) => (
                    <WeaponRecommendationCard
                      key={rec.weaponType}
                      recommendation={rec}
                      rank={i + 1}
                      isCovered
                      professionIcons={professionIcons}
                    />
                  ))}
                </section>
              </>
            )}
          </>
        )}

        {/* Error state — trinkets */}
        {activeTab === 'trinkets' && trinketError && (
          <div
            className="rounded-lg p-4 flex items-start gap-3"
            style={{ border: '1px solid rgba(220,60,60,0.3)', background: 'rgba(220,60,60,0.06)' }}
          >
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-300">{t('tracker.errorTitle')}</p>
          </div>
        )}

        {/* Loading state — trinkets */}
        {activeTab === 'trinkets' && isTrinketLoading && !trinketError && (
          <div className="space-y-4">
            <LoadingStatus isLoadingArmory={true} isLoadingItems={false} />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <WeaponRecommendationCardSkeleton key={i} />
              ))}
            </div>
          </div>
        )}

        {/* Results — trinkets */}
        {activeTab === 'trinkets' && trinketResult && !trinketError && (
          <>
            {trinketResult.recommendations.length === 0 && trinketResult.coveredByArmory.length === 0 && (
              <div
                className="rounded-lg py-14 text-center space-y-3"
                style={{ border: '1px solid rgba(147,73,204,0.15)', background: 'rgba(20,16,28,0.6)' }}
              >
                <Sparkles className="w-10 h-10 mx-auto" style={{ color: 'rgba(147,73,204,0.35)' }} />
                <p className="text-sm max-w-sm mx-auto px-4" style={{ color: '#8e8a9a' }}>
                  {t('tracker.noRecommendations')}
                </p>
              </div>
            )}

            {trinketResult.recommendations.length > 0 && (
              <section className="space-y-3">
                <SectionHeader label={t('tracker.sectionCraftNext')} count={trinketResult.recommendations.length} accent />
                {trinketResult.recommendations.map((rec, i) => (
                  <TrinketRecommendationCard
                    key={rec.slotType}
                    recommendation={rec}
                    rank={i + 1}
                    professionIcons={professionIcons}
                  />
                ))}
              </section>
            )}

            {trinketResult.coveredByArmory.length > 0 && (
              <>
                {trinketResult.recommendations.length > 0 && (
                  <hr style={{ border: 'none', borderTop: '1px solid rgba(147,73,204,0.12)' }} />
                )}
                <section className="space-y-3">
                  <SectionHeader label={t('tracker.sectionAlreadyHave')} count={trinketResult.coveredByArmory.length} />
                  {trinketResult.coveredByArmory.map((rec, i) => (
                    <TrinketRecommendationCard
                      key={rec.slotType}
                      recommendation={rec}
                      rank={i + 1}
                      isCovered
                      professionIcons={professionIcons}
                    />
                  ))}
                </section>
              </>
            )}
          </>
        )}

        {/* Error state — armor */}
        {activeTab === 'armor' && armorError && (
          <div
            className="rounded-lg p-4 flex items-start gap-3"
            style={{ border: '1px solid rgba(220,60,60,0.3)', background: 'rgba(220,60,60,0.06)' }}
          >
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-red-300">{t('tracker.errorTitle')}</p>
              <p className="text-xs text-red-400/80">{armorError.message}</p>
            </div>
          </div>
        )}

        {/* Loading state — armor */}
        {activeTab === 'armor' && isArmorLoading && !armorError && (
          <div className="space-y-4">
            <LoadingStatus isLoadingArmory={true} isLoadingItems={false} />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
            </div>
          </div>
        )}

        {/* Results — armor */}
        {activeTab === 'armor' && armorResult && !armorError && (
          <>
            {armorResult.recommendations.length > 0 && (
              <section className="space-y-5">
                <SectionHeader label={t('tracker.sectionCraftNext')} count={armorResult.recommendations.length} accent />
                {ALL_ARMOR_WEIGHTS.map((weight) => {
                  const recs = armorResult.recommendations.filter((r) => r.weight === weight);
                  if (recs.length === 0) return null;
                  const weightLabel = weight === 'Heavy' ? t('armorTypes.HeavyArmor') : weight === 'Medium' ? t('armorTypes.MediumArmor') : t('armorTypes.LightArmor');
                  return (
                    <div key={weight} className="space-y-3">
                      <WeightGroupHeader weight={weight} label={weightLabel} count={recs.length} />
                      {recs.map((rec, i) => (
                        <ArmorRecommendationCard
                          key={`${rec.weight}:${rec.slot}`}
                          recommendation={rec}
                          rank={i + 1}
                          professionIcons={professionIcons}
                        />
                      ))}
                    </div>
                  );
                })}
              </section>
            )}

            {armorResult.recommendations.length === 0 && armorResult.coveredByArmory.length > 0 && (
              <div
                className="rounded-lg py-14 text-center space-y-3"
                style={{ border: '1px solid rgba(147,73,204,0.15)', background: 'rgba(20,16,28,0.6)' }}
              >
                <Sparkles className="w-10 h-10 mx-auto" style={{ color: 'rgba(147,73,204,0.35)' }} />
                <p className="text-sm max-w-sm mx-auto px-4" style={{ color: '#8e8a9a' }}>
                  {t('tracker.noRecommendations')}
                </p>
              </div>
            )}

            {armorResult.coveredByArmory.length > 0 && (
              <>
                {armorResult.recommendations.length > 0 && (
                  <hr style={{ border: 'none', borderTop: '1px solid rgba(147,73,204,0.12)' }} />
                )}
                <section className="space-y-5">
                  <SectionHeader label={t('tracker.sectionAlreadyHave')} count={armorResult.coveredByArmory.length} />
                  {ALL_ARMOR_WEIGHTS.map((weight) => {
                    const recs = armorResult.coveredByArmory.filter((r) => r.weight === weight);
                    if (recs.length === 0) return null;
                    const weightLabel = weight === 'Heavy' ? t('armorTypes.HeavyArmor') : weight === 'Medium' ? t('armorTypes.MediumArmor') : t('armorTypes.LightArmor');
                    return (
                      <div key={weight} className="space-y-3">
                        <WeightGroupHeader weight={weight} label={weightLabel} count={recs.length} />
                        {recs.map((rec, i) => (
                          <ArmorRecommendationCard
                            key={`${rec.weight}:${rec.slot}`}
                            recommendation={rec}
                            rank={i + 1}
                            isCovered
                            professionIcons={professionIcons}
                          />
                        ))}
                      </div>
                    );
                  })}
                </section>
              </>
            )}
          </>
        )}
      </main>

      {showTransferModal && result?.recommendations && (
        <TransferToProphecyModal
          apiKey={apiKey}
          recommendations={result.recommendations}
          onClose={() => setShowTransferModal(false)}
          onTransferred={() => {
            setShowTransferModal(false);
            onNavigate('prophecy');
          }}
        />
      )}
    </div>
  );
}

const WEIGHT_HEADER_COLORS: Record<string, string> = {
  Heavy: '#c8a0f0',
  Medium: '#b0c870',
  Light: '#80c8e0',
};

function WeightGroupHeader({ weight, label, count }: { weight: string; label: string; count: number }) {
  const color = WEIGHT_HEADER_COLORS[weight] ?? '#8e8a9a';
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
        {label}
      </span>
      <span className="text-xs" style={{ color: '#5a5468' }}>({count})</span>
      <div className="flex-1 h-px" style={{ background: 'rgba(147,73,204,0.1)' }} />
    </div>
  );
}

function SectionHeader({
  label,
  count,
  accent = false,
}: Readonly<{ label: string; count: number; accent?: boolean }>) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="text-xs font-semibold uppercase tracking-wider"
        style={{
          color: accent ? '#e9c66b' : '#6a6478',
          fontFamily: accent ? '"Cinzel", serif' : undefined,
        }}
      >
        {accent && '✦ '}
        {label}
      </span>
      <span className="text-xs" style={{ color: '#5a5468' }}>
        ({count})
      </span>
      <div className="flex-1 h-px" style={{ background: 'rgba(147,73,204,0.12)' }} />
    </div>
  );
}

function LoadingStatus({
  isLoadingArmory,
  isLoadingItems,
}: Readonly<{ isLoadingArmory: boolean; isLoadingItems: boolean }>) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3 text-sm" style={{ color: '#8e8a9a' }}>
      <div
        className="w-4 h-4 rounded-full border-2 shrink-0 animate-spin"
        style={{ borderColor: 'rgba(147,73,204,0.3)', borderTopColor: '#9349CC' }}
      />
      <span>
        {isLoadingArmory
          ? t('tracker.loadingArmory')
          : isLoadingItems
            ? t('tracker.loadingItems')
            : '…'}
      </span>
      <Skeleton className="h-3 w-32" />
    </div>
  );
}
