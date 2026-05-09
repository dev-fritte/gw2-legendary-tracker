import { useTranslation } from "react-i18next";
import { LogOut, Languages, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/i18n";
import { cn } from "@/utils/cn";

interface NavbarProps {
  onLogout: () => void;
}

export function Navbar({ onLogout }: NavbarProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language.split("-")[0] as LanguageCode;

  const handleLanguageChange = (code: LanguageCode) => {
    i18n.changeLanguage(code);
  };

  const currentLangMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) ?? SUPPORTED_LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/75">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-600/20 border border-amber-600/30">
            <span className="text-amber-400 text-xs font-bold">GW2</span>
          </div>
          <span className="font-semibold text-zinc-50 text-sm tracking-tight">
            Legendary Tracker
          </span>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 text-zinc-400 hover:text-zinc-50">
                <Languages className="h-4 w-4" />
                <span className="hidden sm:inline">{currentLangMeta.flag} {currentLangMeta.label}</span>
                <span className="sm:hidden">{currentLangMeta.flag}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>{t("nav.language")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {SUPPORTED_LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={cn(
                    "cursor-pointer",
                    currentLang === lang.code && "text-amber-400 focus:text-amber-300",
                  )}
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.label}
                  {currentLang === lang.code && (
                    <Check className="ml-auto h-3.5 w-3.5" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-4 w-px bg-zinc-800" />

          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="gap-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-950/30"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t("nav.logout")}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
