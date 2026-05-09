import { useTranslation } from "react-i18next";
import { ArrowLeft, AlertTriangle, RefreshCw, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/Navbar";
import type { NavSection } from "@/components/Navbar";
import { WeaponRecommendationCard, WeaponRecommendationCardSkeleton } from "./WeaponRecommendationCard";
import { useWeaponAnalysis } from "@/hooks/useWeaponAnalysis";
import { useProfessionIconMap } from "@/hooks/useProfessions";
import type { Character } from "@/types/gw2-api";

interface TrackerPageProps {
  apiKey: string;
  characters: Character[];
  onBack: () => void;
  onLogout: () => void;
  onNavigate: (section: NavSection) => void;
}

export function TrackerPage({ apiKey, characters, onBack, onLogout, onNavigate }: Readonly<TrackerPageProps>) {
  const { t } = useTranslation();
  const professionIcons = useProfessionIconMap(apiKey);
  const { result, isLoading, isLoadingArmory, isLoadingItems, error, refetch } =
    useWeaponAnalysis(apiKey, characters);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar onLogout={onLogout} activeSection="zommoros" onNavigate={onNavigate} />

      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-8 space-y-6">
        {/* Page header */}
        <div className="space-y-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 -ml-2 text-zinc-400 hover:text-zinc-50">
            <ArrowLeft className="w-4 h-4" />
            {t("tracker.backToSelection")}
          </Button>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h1 className="text-xl font-semibold text-zinc-50">{t("tracker.title")}</h1>
            </div>
            <p className="text-sm text-zinc-400">{t("tracker.description")}</p>
          </div>

          {/* Context: which characters were analyzed */}
          <div className="flex flex-wrap gap-1.5">
            {characters.map((c) => (
              <span
                key={c.name}
                className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-800/60 px-2.5 py-0.5 text-xs text-zinc-400"
              >
                {c.name}
              </span>
            ))}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="rounded-lg border border-red-800/50 bg-red-950/20 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-red-300">{t("tracker.errorTitle")}</p>
              <p className="text-xs text-red-400/80">{(error as Error).message}</p>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-red-800 text-red-400 hover:bg-red-950/40"
                onClick={refetch}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                {t("tracker.errorRetry")}
              </Button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && !error && (
          <div className="space-y-4">
            <LoadingStatus isLoadingArmory={isLoadingArmory} isLoadingItems={isLoadingItems} />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <WeaponRecommendationCardSkeleton key={i} />
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {result && !error && (
          <>
            {/* No recommendations at all */}
            {result.recommendations.length === 0 && result.coveredByArmory.length === 0 && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 py-14 text-center space-y-3">
                <Sparkles className="w-10 h-10 mx-auto text-amber-400/40" />
                <p className="text-sm text-zinc-400 max-w-sm mx-auto px-4">
                  {t("tracker.noRecommendations")}
                </p>
              </div>
            )}

            {/* Primary recommendations */}
            {result.recommendations.length > 0 && (
              <section className="space-y-3">
                <SectionHeader
                  label={t("tracker.sectionCraftNext")}
                  count={result.recommendations.length}
                  accent
                />
                {result.recommendations.map((rec, i) => (
                  <WeaponRecommendationCard key={rec.weaponType} recommendation={rec} rank={i + 1} professionIcons={professionIcons} />
                ))}
              </section>
            )}

            {/* Already covered by armory */}
            {result.coveredByArmory.length > 0 && (
              <>
                {result.recommendations.length > 0 && <Separator />}
                <section className="space-y-3">
                  <SectionHeader
                    label={t("tracker.sectionAlreadyHave")}
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
      </main>
    </div>
  );
}

function SectionHeader({
  label,
  count,
  accent = false,
}: Readonly<{
    label: string;
    count: number;
    accent?: boolean;
}>) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-xs font-semibold uppercase tracking-wider ${
          accent ? "text-amber-400" : "text-zinc-500"
        }`}
      >
        {label}
      </span>
      <span className="text-xs text-zinc-600">({count})</span>
      <div className="flex-1 h-px bg-zinc-800" />
    </div>
  );
}

function LoadingStatus({
  isLoadingArmory,
  isLoadingItems,
}: Readonly<{
    isLoadingArmory: boolean;
    isLoadingItems: boolean;
}>) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3 text-sm text-zinc-500">
      <div className="w-4 h-4 rounded-full border-2 border-amber-600/40 border-t-amber-500 animate-spin shrink-0" />
      <span>
        {isLoadingArmory
          ? t("tracker.loadingArmory")
          : isLoadingItems
            ? t("tracker.loadingItems")
            : "…"}
      </span>
      <Skeleton className="h-3 w-32" />
    </div>
  );
}
