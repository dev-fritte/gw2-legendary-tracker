import { useTranslation } from "react-i18next";
import { Sparkles, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
    <Card
      className={cn(
        "transition-colors",
        isCovered
          ? "border-zinc-800/60 opacity-60"
          : "border-zinc-700 hover:border-zinc-600",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Rank + weapon icon */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            {!isCovered && (
              <span className="text-xs font-bold text-amber-500 w-5 text-center">
                #{rank}
              </span>
            )}
            <div className="relative">
              {icon ? (
                <img
                  src={icon}
                  alt={weaponLabel}
                  className="w-12 h-12 rounded-md border border-zinc-700 bg-zinc-800 object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-12 h-12 rounded-md border border-zinc-700 bg-zinc-800 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-zinc-600" />
                </div>
              )}
              {isCovered && (
                <div className="absolute inset-0 rounded-md bg-zinc-900/60 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <h3 className="font-semibold text-zinc-50 leading-tight">{weaponLabel}</h3>
                <div className="flex flex-wrap gap-2">
                  {existingLegendaryCount > 0 && (
                    <p className="text-xs text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {t("tracker.armoryCount", { count: existingLegendaryCount })}
                    </p>
                  )}
                  {hasEquippedLegendary && existingLegendaryCount === 0 && (
                    <p className="text-xs text-amber-400/70 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {t("tracker.weaponAlreadyLegendary")}
                    </p>
                  )}
                </div>
              </div>

              {!isCovered && impact > 0 && (
                <div className="shrink-0 flex flex-col items-end">
                  <div className="flex items-center gap-1.5 rounded-md bg-amber-600/15 border border-amber-600/30 px-2.5 py-1">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-sm font-bold text-amber-300">
                      {t("tracker.impactLabel", { count: impact })}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-600 mt-0.5 pr-0.5">
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
                    <span className={cn(
                      "truncate max-w-[120px]",
                      char.isLegendary ? "text-zinc-400" : "text-zinc-300",
                    )}>
                      {char.name}
                    </span>
                    {nonLegendarySlots > 1 && (
                      <span className="text-zinc-500">×{nonLegendarySlots}</span>
                    )}
                    {legendarySlots > 0 && (
                      <Sparkles className="w-2.5 h-2.5 text-amber-500/60" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function WeaponRecommendationCardSkeleton() {
  return (
    <Card className="border-zinc-800">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-1.5">
            <Skeleton className="h-3 w-5" />
            <Skeleton className="w-12 h-12 rounded-md" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-28 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
