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
  color: string;       // Tailwind arbitrary color for text
  bgColor: string;     // Tailwind arbitrary color for background
  borderColor: string; // Tailwind arbitrary color for border
  abbreviation: string;
}

export const PROFESSION_META: Record<Profession, ProfessionMeta> = {
  Guardian: {
    label: "Guardian",
    color: "text-[#1a6e8a]",
    bgColor: "bg-[#1a6e8a]/15",
    borderColor: "border-[#1a6e8a]/40",
    abbreviation: "Gdn",
  },
  Warrior: {
    label: "Warrior",
    color: "text-[#c8a72e]",
    bgColor: "bg-[#c8a72e]/15",
    borderColor: "border-[#c8a72e]/40",
    abbreviation: "War",
  },
  Engineer: {
    label: "Engineer",
    color: "text-[#c07830]",
    bgColor: "bg-[#c07830]/15",
    borderColor: "border-[#c07830]/40",
    abbreviation: "Eng",
  },
  Ranger: {
    label: "Ranger",
    color: "text-[#67a833]",
    bgColor: "bg-[#67a833]/15",
    borderColor: "border-[#67a833]/40",
    abbreviation: "Rng",
  },
  Thief: {
    label: "Thief",
    color: "text-[#974550]",
    bgColor: "bg-[#974550]/15",
    borderColor: "border-[#974550]/40",
    abbreviation: "Thf",
  },
  Elementalist: {
    label: "Elementalist",
    color: "text-[#dc6e6e]",
    bgColor: "bg-[#dc6e6e]/15",
    borderColor: "border-[#dc6e6e]/40",
    abbreviation: "Ele",
  },
  Mesmer: {
    label: "Mesmer",
    color: "text-[#8f47b3]",
    bgColor: "bg-[#8f47b3]/15",
    borderColor: "border-[#8f47b3]/40",
    abbreviation: "Mes",
  },
  Necromancer: {
    label: "Necromancer",
    color: "text-[#52a76f]",
    bgColor: "bg-[#52a76f]/15",
    borderColor: "border-[#52a76f]/40",
    abbreviation: "Nec",
  },
  Revenant: {
    label: "Revenant",
    color: "text-[#a04030]",
    bgColor: "bg-[#a04030]/15",
    borderColor: "border-[#a04030]/40",
    abbreviation: "Rev",
  },
};

export function getProfessionMeta(profession: string): ProfessionMeta {
  return (
    PROFESSION_META[profession as Profession] ?? {
      label: profession,
      color: "text-zinc-400",
      bgColor: "bg-zinc-800",
      borderColor: "border-zinc-700",
      abbreviation: profession.slice(0, 3),
    }
  );
}
