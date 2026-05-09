import { cn } from "@/utils/cn";

interface ProfessionIconProps {
  icon: string | undefined;
  profession: string;
  className?: string;
}

export function ProfessionIcon({ icon, profession, className }: ProfessionIconProps) {
  if (!icon) {
    // Fallback: first three letters while loading
    return (
      <span className={cn("font-semibold text-zinc-400 text-[10px] leading-none", className)}>
        {profession.slice(0, 3)}
      </span>
    );
  }

  return (
    <img
      src={icon}
      alt={profession}
      className={cn("object-contain", className)}
    />
  );
}
