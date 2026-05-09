import { useTranslation } from "react-i18next";
import { Sparkles, Users } from "lucide-react";
import { ProfessionIcon } from "@/components/ProfessionIcon";
import { getProfessionMeta } from "@/utils/professions";
import { cn } from "@/utils/cn";
import type { LegendaryWeaponRecommendation } from "@/types/gw2-api";

interface WeaponRecommendationCardProps {
  recommendation: LegendaryWeaponRecommendation;
  rank: number;
  isCovered?: boolean;
  professionIcons: Map<string, string>;
}

export function WeaponRecommendationCard({
  recommendation,
  rank,
  isCovered = false,
  professionIcons,
}: WeaponRecommendationCardProps) {
  const { t } = useTranslation();
  const {
    weaponType,
    impact,
    affectedCharacters,
    existingLegendaryCount,
    hasEquippedLegendary,
    icon,
  } = recommendation;

  const uniqueChars = [
    ...new Map(affectedCharacters.map((c) => [c.name, c])).values(),
  ];

  const weaponLabel = t(`weapons.${weaponType}`, { defaultValue: weaponType });

  return (
    <div
      className="rounded-lg transition-colors"
      style={{
        border: isCovered
          ? "1px solid rgba(147,73,204,0.12)"
          : "1px solid rgba(147,73,204,0.25)",
        background: "rgba(20,16,28,0.7)",
        opacity: isCovered ? 0.65 : 1,
      }}
      onMouseEnter={(e) => {
        if (!isCovered)
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(147,73,204,0.45)";
      }}
      onMouseLeave={(e) => {
        if (!isCovered)
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(147,73,204,0.25)";
      }}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Rank + weapon icon */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            {!isCovered && (
              <span
                className="text-xs font-bold w-5 text-center"
                style={{ color: "#e9c66b", fontFamily: '"Cinzel", serif' }}
              >
                #{rank}
              </span>
            )}
            <div className="relative">
              {icon ? (
                <img
                  src={icon}
                  alt={weaponLabel}
                  className="w-12 h-12 rounded-md object-cover"
                  style={{ border: "1px solid rgba(147,73,204,0.3)", background: "#14101c" }}
                  loading="lazy"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-md flex items-center justify-center"
                  style={{ border: "1px solid rgba(147,73,204,0.3)", background: "#14101c" }}
                >
                  <Sparkles className="w-5 h-5" style={{ color: "rgba(147,73,204,0.4)" }} />
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <h3 className="font-semibold leading-tight" style={{ color: "#e8e4f0" }}>
                  {weaponLabel}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {existingLegendaryCount > 0 && (
                    <p className="text-xs flex items-center gap-1" style={{ color: "#e9c66b" }}>
                      <Sparkles className="w-3 h-3" />
                      {t("tracker.armoryCount", { count: existingLegendaryCount })}
                    </p>
                  )}
                  {hasEquippedLegendary && existingLegendaryCount === 0 && (
                    <p className="text-xs flex items-center gap-1" style={{ color: "rgba(233,198,107,0.7)" }}>
                      <Sparkles className="w-3 h-3" />
                      {t("tracker.weaponAlreadyLegendary")}
                    </p>
                  )}
                </div>
              </div>

              {!isCovered && impact > 0 && (
                <div className="shrink-0 flex flex-col items-end">
                  <div
                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1"
                    style={{
                      background: "rgba(147,73,204,0.15)",
                      border: "1px solid rgba(147,73,204,0.35)",
                    }}
                  >
                    <Users className="w-3.5 h-3.5" style={{ color: "#b06de0" }} />
                    <span className="text-sm font-bold" style={{ color: "#c8a0f0", fontFamily: '"Cinzel", serif' }}>
                      {t("tracker.impactLabel", { count: impact })}
                    </span>
                  </div>
                  <span className="text-[10px] mt-0.5 pr-0.5" style={{ color: "#6a6478" }}>
                    {t("tracker.affectedCharacters")}
                  </span>
                </div>
              )}
            </div>

            {/* Character chips */}
            <div className="flex flex-wrap gap-1.5">
              {uniqueChars.map((char) => {
                const meta = getProfessionMeta(char.profession);
                const slotsForChar = affectedCharacters.filter((c) => c.name === char.name);
                const nonLegendarySlots = slotsForChar.filter((c) => !c.isLegendary).length;
                const legendarySlots = slotsForChar.filter((c) => c.isLegendary).length;

                return (
                  <div
                    key={char.name}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs",
                      char.isLegendary
                        ? "border-zinc-700 bg-zinc-800/60"
                        : cn(meta.bgColor, meta.borderColor),
                    )}
                  >
                    <ProfessionIcon
                      icon={professionIcons.get(char.profession)}
                      profession={char.profession}
                      className="w-3.5 h-3.5 shrink-0"
                    />
                    <span
                      className="truncate max-w-[120px]"
                      style={{ color: char.isLegendary ? "#6a6478" : "#c8bee0" }}
                    >
                      {char.name}
                    </span>
                    {nonLegendarySlots > 1 && (
                      <span style={{ color: "#6a6478" }}>×{nonLegendarySlots}</span>
                    )}
                    {legendarySlots > 0 && (
                      <Sparkles className="w-2.5 h-2.5" style={{ color: "rgba(233,198,107,0.6)" }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WeaponRecommendationCardSkeleton() {
  return (
    <div
      className="rounded-lg"
      style={{ border: "1px solid rgba(147,73,204,0.12)", background: "rgba(20,16,28,0.6)" }}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-1.5">
            <div className="h-3 w-5 rounded animate-pulse bg-zinc-800" />
            <div className="w-12 h-12 rounded-md animate-pulse bg-zinc-800" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex justify-between">
              <div className="h-5 w-24 rounded animate-pulse bg-zinc-800" />
              <div className="h-8 w-20 rounded-md animate-pulse bg-zinc-800" />
            </div>
            <div className="flex gap-1.5">
              <div className="h-5 w-28 rounded-full animate-pulse bg-zinc-800" />
              <div className="h-5 w-20 rounded-full animate-pulse bg-zinc-800" />
              <div className="h-5 w-24 rounded-full animate-pulse bg-zinc-800" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
