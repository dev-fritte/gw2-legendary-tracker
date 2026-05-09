import { useTranslation } from "react-i18next";
import { ArrowLeft, AlertTriangle, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/Navbar";
import { WeaponRecommendationCard, WeaponRecommendationCardSkeleton } from "./WeaponRecommendationCard";
import { useWeaponAnalysis } from "@/hooks/useWeaponAnalysis";
import { useProfessionIconMap } from "@/hooks/useProfessions";
import type { NavSection } from "@/components/Navbar";
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
    <div className="min-h-screen flex flex-col" style={{ color: "#e8e4f0" }}>
      <Navbar onLogout={onLogout} activeSection="zommoros" onNavigate={onNavigate} />

      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-8 space-y-6">
        {/* Page header */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-1.5 -ml-2"
            style={{ color: "#8e8a9a" }}
          >
            <ArrowLeft className="w-4 h-4" />
            {t("tracker.backToSelection")}
          </Button>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span style={{ color: "#9349CC", fontFamily: '"Cinzel", serif', fontSize: 20 }}>✦</span>
              <h1
                className="text-xl font-semibold"
                style={{ color: "#e8e4f0", fontFamily: '"Cinzel", serif' }}
              >
                {t("tracker.title")}
              </h1>
            </div>
            <p className="text-sm" style={{ color: "#8e8a9a" }}>
              {t("tracker.description")}
            </p>
          </div>

          {/* Analyzed characters chips */}
          <div className="flex flex-wrap gap-1.5">
            {characters.map((c) => (
              <span
                key={c.name}
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs"
                style={{
                  border: "1px solid rgba(147,73,204,0.25)",
                  background: "rgba(147,73,204,0.08)",
                  color: "#a89cc0",
                }}
              >
                {c.name}
              </span>
            ))}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div
            className="rounded-lg p-4 flex items-start gap-3"
            style={{ border: "1px solid rgba(220,60,60,0.3)", background: "rgba(220,60,60,0.06)" }}
          >
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
            {result.recommendations.length === 0 && result.coveredByArmory.length === 0 && (
              <div
                className="rounded-lg py-14 text-center space-y-3"
                style={{ border: "1px solid rgba(147,73,204,0.15)", background: "rgba(20,16,28,0.6)" }}
              >
                <Sparkles className="w-10 h-10 mx-auto" style={{ color: "rgba(147,73,204,0.35)" }} />
                <p className="text-sm max-w-sm mx-auto px-4" style={{ color: "#8e8a9a" }}>
                  {t("tracker.noRecommendations")}
                </p>
              </div>
            )}

            {result.recommendations.length > 0 && (
              <section className="space-y-3">
                <SectionHeader
                  label={t("tracker.sectionCraftNext")}
                  count={result.recommendations.length}
                  accent
                />
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
                  <hr style={{ border: "none", borderTop: "1px solid rgba(147,73,204,0.12)" }} />
                )}
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
}: Readonly<{ label: string; count: number; accent?: boolean }>) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="text-xs font-semibold uppercase tracking-wider"
        style={{
          color: accent ? "#e9c66b" : "#6a6478",
          fontFamily: accent ? '"Cinzel", serif' : undefined,
        }}
      >
        {accent && "✦ "}{label}
      </span>
      <span className="text-xs" style={{ color: "#5a5468" }}>({count})</span>
      <div className="flex-1 h-px" style={{ background: "rgba(147,73,204,0.12)" }} />
    </div>
  );
}

function LoadingStatus({
  isLoadingArmory,
  isLoadingItems,
}: Readonly<{ isLoadingArmory: boolean; isLoadingItems: boolean }>) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3 text-sm" style={{ color: "#8e8a9a" }}>
      <div
        className="w-4 h-4 rounded-full border-2 shrink-0 animate-spin"
        style={{ borderColor: "rgba(147,73,204,0.3)", borderTopColor: "#9349CC" }}
      />
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
