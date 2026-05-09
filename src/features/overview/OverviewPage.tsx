import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import type { NavSection } from "@/components/Navbar";
import { useLegendaryOverview } from "@/hooks/useLegendaryOverview";
import type { LegendaryGridItem } from "@/hooks/useLegendaryOverview";
import {
  getLegendaryGeneration,
  GENERATION_ORDER,
  type LegendaryGeneration,
} from "@/utils/legendaryGenerations";

interface OverviewPageProps {
  apiKey: string;
  onLogout: () => void;
  onNavigate: (section: NavSection) => void;
}

type ViewMode = "flat" | "grouped";
type FilterType = "all" | "weapons" | "armor";

export function OverviewPage({ apiKey, onLogout, onNavigate }: OverviewPageProps) {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>("flat");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const { items: allItems, isLoading, isLoadingItems, error, refetch } =
    useLegendaryOverview(apiKey);

  const items =
    filterType === "weapons" ? allItems.filter((i) => i.itemType === "Weapon")
    : filterType === "armor"   ? allItems.filter((i) => i.itemType !== "Weapon")
    : allItems;
  const unlockedCount = items.filter((i) => i.count > 0).length;
  const totalCount = items.length;

  return (
    <div className="min-h-screen flex flex-col" style={{ color: "#e8e4f0" }}>
      <Navbar onLogout={onLogout} activeSection="overview" onNavigate={onNavigate} />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <div
            className="flex items-center gap-2"
            style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}
          >
            <span style={{ color: "#9349CC" }}>{t("overview.stepLabel")}</span>
            <span style={{ color: "#3a3448" }}>—</span>
            <span style={{ color: "#5a5468" }}>{t("overview.stepSub")}</span>
          </div>
          <h1 style={{ fontFamily: '"Cinzel", serif', fontSize: 36, fontWeight: 700, color: "#e8e4f0", lineHeight: 1.1, margin: 0 }}>
            {t("overview.title")}
          </h1>
          <p className="text-sm" style={{ color: "#6a6478" }}>{t("overview.description")}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-800/50 bg-red-950/20 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-red-300">{t("overview.errorTitle")}</p>
              <p className="text-xs text-red-400/80">{(error as Error).message}</p>
              <Button size="sm" variant="outline" className="h-7 text-xs border-red-800 text-red-400 hover:bg-red-950/40" onClick={refetch}>
                <RefreshCw className="w-3 h-3 mr-1" />
                {t("overview.errorRetry")}
              </Button>
            </div>
          </div>
        )}

        {/* Summary bar */}
        {!error && (
          <div
            style={{
              border: "1px solid rgba(147,73,204,0.18)",
              background: "rgba(20,16,28,0.8)",
              borderRadius: 8,
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {/* Row 1: count + view toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span className="text-sm" style={{ color: "#6a6478" }}>
                {t("overview.unlocked")}:{" "}
                <span style={{ color: "#e8e4f0", fontWeight: 600 }}>{unlockedCount}</span>
                {" / "}
                <span style={{ color: "#e8e4f0", fontWeight: 600 }}>{totalCount}</span>
                {isLoading && (
                  <span className="ml-3" style={{ color: "#5a5468" }}>
                    · {isLoadingItems ? t("overview.loadingItems") : t("overview.loading")}
                  </span>
                )}
              </span>

              <PillToggle<ViewMode>
                value={viewMode}
                onChange={setViewMode}
                options={[
                  { value: "flat",    label: t("overview.viewAll") },
                  { value: "grouped", label: t("overview.viewGrouped") },
                ]}
              />
            </div>

            {/* Row 2: type filter */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "#5a5468", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {t("overview.filterLabel")}
              </span>
              <PillToggle<FilterType>
                value={filterType}
                onChange={setFilterType}
                options={[
                  { value: "all",     label: t("overview.filterAll") },
                  { value: "weapons", label: t("overview.filterWeapons") },
                  { value: "armor",   label: t("overview.filterArmor") },
                ]}
              />
            </div>
          </div>
        )}

        {/* Grid */}
        {isLoading && items.length === 0 ? (
          <LegendaryGridSkeleton />
        ) : viewMode === "grouped" ? (
          <GroupedView items={items} />
        ) : (
          <LegendaryGrid items={items} />
        )}
      </main>
    </div>
  );
}

function PillToggle<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div style={{ display: "flex", border: "1px solid rgba(147,73,204,0.25)", borderRadius: 6, overflow: "hidden" }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            padding: "4px 12px",
            fontSize: 12,
            fontWeight: 500,
            border: "none",
            cursor: "pointer",
            transition: "all 0.15s",
            background: value === opt.value ? "linear-gradient(135deg, #9349CC, #7a3aaa)" : "transparent",
            color: value === opt.value ? "#fff" : "#8e8a9a",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function GroupedView({ items }: { items: LegendaryGridItem[] }) {
  const { t } = useTranslation();

  const grouped = new Map<LegendaryGeneration, LegendaryGridItem[]>();
  for (const item of items) {
    const gen = getLegendaryGeneration(item.id, item.itemType);
    const list = grouped.get(gen) ?? [];
    list.push(item);
    grouped.set(gen, list);
  }

  return (
    <div className="space-y-8">
      {GENERATION_ORDER.filter((gen) => (grouped.get(gen)?.length ?? 0) > 0).map((gen) => {
        const groupItems = grouped.get(gen)!;
        const unlockedInGroup = groupItems.filter((i) => i.count > 0).length;
        return (
          <div key={gen} className="space-y-3">
            {/* Section header */}
            <div className="flex items-center gap-3">
              <span style={{ color: "#9349CC", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {t(`overview.${gen}`)}
              </span>
              <span style={{ color: "#5a5468", fontSize: 11 }}>
                {unlockedInGroup}/{groupItems.length}
              </span>
              <div className="flex-1 h-px" style={{ background: "rgba(147,73,204,0.15)" }} />
            </div>
            <LegendaryGrid items={groupItems} />
          </div>
        );
      })}
    </div>
  );
}

function LegendaryGrid({ items }: { items: LegendaryGridItem[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))", gap: 4 }}>
      {items.map((item) => (
        <LegendaryTile key={item.id} item={item} />
      ))}
    </div>
  );
}

function LegendaryTile({ item }: { item: LegendaryGridItem }) {
  const unlocked = item.count > 0;
  return (
    <div
      title={`${item.name}${item.count > 0 ? ` (×${item.count})` : ""}`}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1",
        borderRadius: 4,
        overflow: "hidden",
        border: unlocked ? "1px solid rgba(147,73,204,0.6)" : "1px solid rgba(147,73,204,0.15)",
        background: "rgba(11,8,20,0.9)",
        cursor: "default",
      }}
    >
      <img
        src={item.icon}
        alt={item.name}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          filter: unlocked ? "none" : "grayscale(100%) brightness(0.35)",
        }}
      />
      {item.count > 0 && (
        <span
          style={{
            position: "absolute",
            bottom: 2,
            right: 3,
            fontSize: 11,
            fontWeight: 700,
            color: "#fff",
            textShadow: "0 1px 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.9)",
            lineHeight: 1,
          }}
        >
          {item.count}
        </span>
      )}
    </div>
  );
}

function LegendaryGridSkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))", gap: 4 }}>
      {Array.from({ length: 120 }).map((_, i) => (
        <div
          key={i}
          style={{
            aspectRatio: "1",
            borderRadius: 4,
            border: "1px solid rgba(147,73,204,0.12)",
            background: "rgba(147,73,204,0.06)",
          }}
          className="animate-pulse"
        />
      ))}
    </div>
  );
}
