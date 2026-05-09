import { useTranslation } from "react-i18next";
import { LayoutList, Clock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/utils/cn";
import { getProfessionMeta } from "@/utils/professions";
import type { Character } from "@/types/gw2-api";

interface CharacterCardProps {
  character: Character;
  selected: boolean;
  onToggle: (name: string) => void;
}

export function CharacterCard({ character, selected, onToggle }: CharacterCardProps) {
  const { t } = useTranslation();
  const meta = getProfessionMeta(character.profession);

  const templateCount = new Set(character.equipment.flatMap((e) => e.tabs ?? [])).size;
  const hours = Math.floor(character.age / 3600);

  return (
    <label
      htmlFor={`char-${character.name}`}
      className={cn(
        "group flex items-start gap-4 rounded-lg border p-4 cursor-pointer transition-all duration-150",
        "hover:border-zinc-600 hover:bg-zinc-800/50",
        selected
          ? "border-amber-600/50 bg-amber-600/5"
          : "border-zinc-800 bg-zinc-900",
      )}
    >
      <Checkbox
        id={`char-${character.name}`}
        checked={selected}
        onCheckedChange={() => onToggle(character.name)}
        className="mt-0.5 shrink-0"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-zinc-50 truncate">{character.name}</span>
          {/* Profession badge */}
          <span
            className={cn(
              "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold shrink-0",
              meta.color,
              meta.bgColor,
              meta.borderColor,
            )}
          >
            {meta.label}
          </span>
        </div>

        <div className="mt-1 flex items-center gap-3 text-sm text-zinc-500">
          <span>{t("characters.level", { level: character.level })}</span>
          <span className="text-zinc-700">·</span>
          <span className="capitalize">{character.race}</span>
          <span className="text-zinc-700">·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {hours.toLocaleString()} h
          </span>
          {templateCount > 0 && (
            <>
              <span className="text-zinc-700">·</span>
              <span className="flex items-center gap-1">
                <LayoutList className="w-3.5 h-3.5" />
                {t("characters.templates", { count: templateCount })}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Selection indicator line */}
      <div
        className={cn(
          "self-stretch w-0.5 rounded-full transition-colors shrink-0",
          selected ? "bg-amber-500" : "bg-transparent",
        )}
      />
    </label>
  );
}

// Skeleton version for loading state
export function CharacterCardSkeleton() {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <div className="mt-0.5 h-4 w-4 rounded-sm bg-zinc-800 animate-pulse shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-32 rounded bg-zinc-800 animate-pulse" />
          <div className="h-5 w-20 rounded-md bg-zinc-800 animate-pulse" />
        </div>
        <div className="flex gap-3">
          <div className="h-3.5 w-14 rounded bg-zinc-800 animate-pulse" />
          <div className="h-3.5 w-16 rounded bg-zinc-800 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
