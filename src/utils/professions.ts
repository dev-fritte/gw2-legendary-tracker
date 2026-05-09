export type Profession =
  | "Guardian"
  | "Warrior"
  | "Engineer"
  | "Ranger"
  | "Thief"
  | "Elementalist"
  | "Mesmer"
  | "Necromancer"
  | "Revenant";

interface ProfessionMeta {
  label: string;
  hex: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const PROFESSION_META: Record<Profession, ProfessionMeta> = {
  Guardian:     { label: "Guardian",     hex: "#5fb1c4", color: "text-[#5fb1c4]", bgColor: "bg-[#5fb1c4]/15", borderColor: "border-[#5fb1c4]/40" },
  Warrior:      { label: "Warrior",      hex: "#d4a93a", color: "text-[#d4a93a]", bgColor: "bg-[#d4a93a]/15", borderColor: "border-[#d4a93a]/40" },
  Engineer:     { label: "Engineer",     hex: "#cc8a3d", color: "text-[#cc8a3d]", bgColor: "bg-[#cc8a3d]/15", borderColor: "border-[#cc8a3d]/40" },
  Ranger:       { label: "Ranger",       hex: "#7ab86c", color: "text-[#7ab86c]", bgColor: "bg-[#7ab86c]/15", borderColor: "border-[#7ab86c]/40" },
  Thief:        { label: "Thief",        hex: "#a64252", color: "text-[#a64252]", bgColor: "bg-[#a64252]/15", borderColor: "border-[#a64252]/40" },
  Elementalist: { label: "Elementalist", hex: "#e07a7a", color: "text-[#e07a7a]", bgColor: "bg-[#e07a7a]/15", borderColor: "border-[#e07a7a]/40" },
  Mesmer:       { label: "Mesmer",       hex: "#b78bd6", color: "text-[#b78bd6]", bgColor: "bg-[#b78bd6]/15", borderColor: "border-[#b78bd6]/40" },
  Necromancer:  { label: "Necromancer",  hex: "#52b788", color: "text-[#52b788]", bgColor: "bg-[#52b788]/15", borderColor: "border-[#52b788]/40" },
  Revenant:     { label: "Revenant",     hex: "#c46a3d", color: "text-[#c46a3d]", bgColor: "bg-[#c46a3d]/15", borderColor: "border-[#c46a3d]/40" },
};

export function getProfessionMeta(profession: string): ProfessionMeta {
  return (
    PROFESSION_META[profession as Profession] ?? {
      label: profession,
      hex: "#6a6478",
      color: "text-zinc-400",
      bgColor: "bg-zinc-800",
      borderColor: "border-zinc-700",
    }
  );
}
