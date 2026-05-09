import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Users, RefreshCw, ChevronRight, AlertTriangle, ArrowUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Navbar } from "@/components/Navbar";
import type { NavSection } from "@/components/Navbar";
import { CharacterCard, CharacterCardSkeleton } from "./CharacterCard";
import { useCharacterNames, useCharacterDetails } from "@/hooks/useCharacters";
import { storage } from "@/services/storage";
import { getProfessionMeta } from "@/utils/professions";
import { cn } from "@/utils/cn";
import type { Character } from "@/types/gw2-api";

type SortKey = "playtime" | "profession" | "alphabetical";

function sortCharacters(chars: Character[], key: SortKey): Character[] {
  return chars.slice().sort((a, b) => {
    switch (key) {
      case "playtime":
        return b.age - a.age;
      case "profession":
        return a.profession.localeCompare(b.profession) || b.age - a.age;
      case "alphabetical":
        return a.name.localeCompare(b.name);
    }
  });
}

interface CharacterSelectionPageProps {
  apiKey: string;
  onLogout: () => void;
  onAnalyze: (characters: Character[]) => void;
  onNavigate: (section: NavSection) => void;
}

export function CharacterSelectionPage({
  apiKey,
  onLogout,
  onAnalyze,
  onNavigate,
}: CharacterSelectionPageProps) {
  const { t } = useTranslation();

  // ── Data fetching ──────────────────────────────────────────────
  const namesQuery = useCharacterNames(apiKey);
  const names = namesQuery.data ?? [];
  const detailsQuery = useCharacterDetails(apiKey, names, namesQuery.isSuccess);

  // ── Sort state ─────────────────────────────────────────────────
  const [sortKey, setSortKey] = useState<SortKey>("playtime");
  const characters = useMemo(
    () => sortCharacters(detailsQuery.data ?? [], sortKey),
    [detailsQuery.data, sortKey],
  );

  // ── Selection state ────────────────────────────────────────────
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(storage.getSelectedCharacters()),
  );

  useEffect(() => {
    storage.setSelectedCharacters([...selected]);
  }, [selected]);

  useEffect(() => {
    if (characters.length > 0 && storage.getSelectedCharacters().length === 0) {
      setSelected(new Set(characters.map((c) => c.name)));
    }
  }, [characters]);

  const toggle = useCallback((name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }, []);

  const allSelected = characters.length > 0 && characters.every((c) => selected.has(c.name));
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(characters.map((c) => c.name)));

  const selectedCharacters = characters.filter((c) => selected.has(c.name));

  // ── Loading / error ────────────────────────────────────────────
  const isLoadingNames = namesQuery.isPending;
  const isLoadingDetails = namesQuery.isSuccess && detailsQuery.isPending;
  const skeletonCount = isLoadingDetails ? Math.min(names.length, 8) : 0;
  const error = namesQuery.error ?? detailsQuery.error;

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: "playtime",     label: t("characters.sortPlaytime") },
    { key: "profession",   label: t("characters.sortProfession") },
    { key: "alphabetical", label: t("characters.sortAlphabetical") },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ color: "#e8e4f0" }}>
      <Navbar onLogout={onLogout} activeSection="zommoros" onNavigate={onNavigate} />

      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-8 space-y-6">
        {/* Page header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            <span style={{ color: "#9349CC" }}>{t("characters.stepLabel")}</span>
            <span style={{ color: "#3a3448" }}>—</span>
            <span style={{ color: "#5a5468" }}>{t("characters.stepSub")}</span>
          </div>
          <h1 style={{ fontFamily: '"Cinzel", serif', fontSize: 36, fontWeight: 700, color: "#e8e4f0", lineHeight: 1.1, margin: 0 }}>
            {t("characters.pageTitle")}
          </h1>
          <p className="text-sm" style={{ color: "#6a6478" }}>{t("characters.description")}</p>
        </div>

        {/* Error state */}
        {error && (
          <div className="rounded-lg border border-red-800/50 bg-red-950/20 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-red-300">{t("characters.errorTitle")}</p>
              <p className="text-xs text-red-400/80">{(error as Error).message}</p>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-red-800 text-red-400 hover:bg-red-950/40"
                onClick={() => { namesQuery.refetch(); detailsQuery.refetch(); }}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                {t("characters.errorRetry")}
              </Button>
            </div>
          </div>
        )}

        {/* Loading: names */}
        {isLoadingNames && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <CharacterCardSkeleton key={i} />)}
          </div>
        )}

        {/* Character list */}
        {!isLoadingNames && !error && (
          <>
            {(characters.length > 0 || skeletonCount > 0) && (
              <div
                className="flex items-center justify-between gap-4"
                style={{
                  border: "1px solid rgba(147,73,204,0.18)",
                  background: "rgba(20,16,28,0.8)",
                  borderRadius: 8,
                  padding: "12px 16px",
                }}
              >
                {/* Select-all */}
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    disabled={characters.length === 0}
                  />
                  <span className="text-sm select-none" style={{ color: "#e8e4f0" }}>
                    {allSelected ? t("characters.deselectAll") : t("characters.selectAll")}
                  </span>
                </label>

                <div className="flex items-center gap-3">
                  {/* Counter */}
                  {characters.length > 0 && (
                    <span className="text-sm" style={{ color: "#6a6478" }}>
                      <span style={{ color: "#e8e4f0", fontWeight: 600 }}>{selected.size}</span>
                      {" "}{t("characters.selectedCount", { total: characters.length })}
                    </span>
                  )}

                  {/* Sort dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-sm">
                        <ArrowUpDown className="w-3.5 h-3.5" />
                        {t("characters.sortLabel")} · {SORT_OPTIONS.find((o) => o.key === sortKey)?.label}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuLabel>{t("characters.sortBy")}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {SORT_OPTIONS.map(({ key, label }) => (
                        <DropdownMenuItem
                          key={key}
                          onClick={() => setSortKey(key)}
                          className={cn(
                            "cursor-pointer",
                            sortKey === key && "text-[#9349CC] focus:text-[#b06de0]",
                          )}
                        >
                          {label}
                          {sortKey === key && <Check className="ml-auto w-3.5 h-3.5" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}

            {/* Skeleton cards while details load */}
            {skeletonCount > 0 && (
              <div className="space-y-3">
                <p className="text-xs text-zinc-500">{t("characters.loadingDetails")}</p>
                {Array.from({ length: skeletonCount }).map((_, i) => <CharacterCardSkeleton key={i} />)}
              </div>
            )}

            {/* Profession-grouped view */}
            {characters.length > 0 && sortKey === "profession" ? (
              <ProfessionGroupedList
                characters={characters}
                selected={selected}
                onToggle={toggle}
              />
            ) : characters.length > 0 ? (
              <div className="space-y-2">
                {characters.map((char) => (
                  <CharacterCard
                    key={char.name}
                    character={char}
                    selected={selected.has(char.name)}
                    onToggle={toggle}
                  />
                ))}
              </div>
            ) : null}

            {/* Empty state */}
            {namesQuery.isSuccess && names.length === 0 && (
              <div className="text-center py-12 text-zinc-500">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">{t("characters.noCharacters")}</p>
              </div>
            )}
          </>
        )}

        {/* Sticky footer */}
        {characters.length > 0 && (
          <div className="sticky bottom-0 pt-4 pb-2 -mx-4 px-4" style={{ background: "linear-gradient(to top, #0b0814 60%, transparent)" }}>
            <button
              disabled={selectedCharacters.length === 0}
              onClick={() => onAnalyze(selectedCharacters)}
              style={{
                width: "100%",
                padding: "14px 16px",
                border: "none",
                borderRadius: 8,
                background: selectedCharacters.length > 0
                  ? "linear-gradient(180deg, #9349CC 0%, #5a2a7e 100%)"
                  : "rgba(147,73,204,0.2)",
                color: "#fff",
                fontFamily: '"Cinzel", serif',
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: 1,
                textTransform: "uppercase",
                cursor: selectedCharacters.length > 0 ? "pointer" : "not-allowed",
                boxShadow: selectedCharacters.length > 0
                  ? "0 0 24px rgba(147,73,204,0.3), inset 0 1px 0 rgba(255,255,255,0.15)"
                  : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.2s",
              }}
            >
              {selectedCharacters.length === 0
                ? t("characters.analyzeButtonDisabled")
                : `✦ ${t("characters.analyzeButton", { count: selectedCharacters.length })}`}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// When sorted by profession: render a section header per profession group
function ProfessionGroupedList({
  characters,
  selected,
  onToggle,
}: {
  characters: Character[];
  selected: Set<string>;
  onToggle: (name: string) => void;
}) {
  const groups = characters.reduce<Map<string, Character[]>>((acc, char) => {
    const list = acc.get(char.profession) ?? [];
    list.push(char);
    acc.set(char.profession, list);
    return acc;
  }, new Map());

  return (
    <div className="space-y-5">
      {[...groups.entries()].map(([profession, chars]) => {
        const meta = getProfessionMeta(profession);
        return (
          <div key={profession} className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-xs font-semibold uppercase tracking-wider",
                  meta.color,
                )}
              >
                {meta.label}
              </span>
              <span className="text-xs" style={{ color: "#5a5468" }}>({chars.length})</span>
              <div className="flex-1 h-px" style={{ background: "rgba(147,73,204,0.12)" }} />
            </div>
            {chars.map((char) => (
              <CharacterCard
                key={char.name}
                character={char}
                selected={selected.has(char.name)}
                onToggle={onToggle}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
