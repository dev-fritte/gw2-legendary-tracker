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
        "group relative flex items-center gap-4 rounded-lg border p-4 pl-5 cursor-pointer transition-all duration-150 overflow-hidden",
        selected
          ? "border-[rgba(147,73,204,0.5)] bg-[rgba(147,73,204,0.06)]"
          : "hover:border-[rgba(147,73,204,0.25)] hover:bg-[rgba(20,16,28,0.5)]",
      )}
      style={{ borderColor: selected ? undefined : "rgba(147,73,204,0.15)", background: selected ? undefined : "rgba(20,16,28,0.6)" }}
    >
      {/* Profession accent stripe */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: meta.hex,
          opacity: 0.75,
          borderRadius: "4px 0 0 4px",
        }}
      />

      <Checkbox
        id={`char-${character.name}`}
        checked={selected}
        onCheckedChange={() => onToggle(character.name)}
        className="mt-0.5 shrink-0"
      />

      {/* Profession icon */}
      <div style={{ width: 48, height: 48, flexShrink: 0 }}>
        <img
          src={meta.decoIcon}
          alt={character.profession}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>

      {/* Text block */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-[#e8e4f0] truncate">{character.name}</span>
        </div>

        <div className="mt-1 flex items-center gap-3 text-sm" style={{ color: "#6a6478" }}>
          <span>{t("characters.level", { level: character.level })}</span>
          <span style={{ color: "#3a3448" }}>·</span>
          <span className="capitalize">{character.race}</span>
          <span style={{ color: "#3a3448" }}>·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {hours.toLocaleString()} h
          </span>
          {templateCount > 0 && (
            <>
              <span style={{ color: "#3a3448" }}>·</span>
              <span className="flex items-center gap-1">
                <LayoutList className="w-3.5 h-3.5" />
                {t("characters.templates", { count: templateCount })}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Selected indicator */}
      <div
        className="self-stretch w-0.5 rounded-full transition-colors shrink-0"
        style={{ background: selected ? "#9349CC" : "transparent" }}
      />
    </label>
  );
}

export function CharacterCardSkeleton() {
  return (
    <div
      className="flex items-center gap-4 rounded-lg border p-4 pl-5"
      style={{ borderColor: "rgba(147,73,204,0.12)", background: "rgba(20,16,28,0.6)" }}
    >
      <div className="mt-0.5 h-4 w-4 rounded-sm bg-zinc-800 animate-pulse shrink-0" />
      <div
        className="w-10 h-10 rounded-md animate-pulse shrink-0"
        style={{ background: "rgba(147,73,204,0.1)" }}
      />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-32 rounded bg-zinc-800 animate-pulse" />
          <div className="h-5 w-20 rounded bg-zinc-800 animate-pulse" />
        </div>
        <div className="flex gap-3">
          <div className="h-3.5 w-14 rounded bg-zinc-800 animate-pulse" />
          <div className="h-3.5 w-16 rounded bg-zinc-800 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
