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

export type NavSection = "zommoros" | "overview";

interface NavbarProps {
  onLogout: () => void;
  activeSection?: NavSection;
  onNavigate?: (section: NavSection) => void;
}

export function Navbar({ onLogout, activeSection, onNavigate }: NavbarProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language.split("-")[0] as LanguageCode;

  const handleLanguageChange = (code: LanguageCode) => {
    i18n.changeLanguage(code);
  };

  const currentLangMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) ?? SUPPORTED_LANGUAGES[0];

  const navItems: { section: NavSection; label: string }[] = [
    { section: "overview", label: t("nav.overview") },
    { section: "zommoros", label: t("nav.zommorosChoice") },
  ];

  return (
    <header
      className="sticky top-0 z-40 w-full"
      style={{
        background: "rgba(11,8,20,0.85)",
        borderBottom: "1px solid rgba(147,73,204,0.18)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
        {/* Brand */}
        <a
          href="#overview"
          onClick={(e) => { e.preventDefault(); onNavigate?.("overview"); }}
          className="flex items-center gap-2.5 shrink-0"
          style={{ textDecoration: "none" }}
        >
          <img
            src="/favicon.svg"
            alt="Legendary Mystic Forge"
            style={{ width: 28, height: 28, borderRadius: 6, boxShadow: "0 0 12px rgba(147,73,204,0.5)" }}
          />
          <span
            className="text-sm font-semibold tracking-tight hidden sm:block"
            style={{ fontFamily: '"Cinzel", serif', color: "#e8e4f0" }}
          >
            Legendary{" "}
            <span style={{ color: "#9349CC" }}>Mystic Forge</span>
          </span>
        </a>

        {/* Nav items */}
        {onNavigate && (
          <nav className="flex items-center gap-1 flex-1">
            {navItems.map(({ section, label }) => (
              <a
                key={section}
                href={`#${section}`}
                onClick={(e) => { e.preventDefault(); onNavigate(section); }}
                className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                style={
                  activeSection === section
                    ? {
                        background: "rgba(147,73,204,0.15)",
                        border: "1px solid rgba(147,73,204,0.4)",
                        color: "#fff",
                        textDecoration: "none",
                      }
                    : {
                        border: "1px solid transparent",
                        color: "#8e8a9a",
                        textDecoration: "none",
                      }
                }
                onMouseEnter={(e) => {
                  if (activeSection !== section) {
                    (e.currentTarget as HTMLAnchorElement).style.color = "#c8bee0";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== section) {
                    (e.currentTarget as HTMLAnchorElement).style.color = "#8e8a9a";
                  }
                }}
              >
                {label}
              </a>
            ))}
          </nav>
        )}

        {/* Right side controls */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          {/* Language switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                style={{ color: "#8e8a9a" }}
              >
                <Languages className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {currentLangMeta.flag} {currentLangMeta.label}
                </span>
                <span className="sm:hidden">{currentLangMeta.flag}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40"
              style={{ background: "#14101c", border: "1px solid rgba(147,73,204,0.25)" }}
            >
              <DropdownMenuLabel style={{ color: "#a89cc0" }}>
                {t("nav.language")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator style={{ background: "rgba(147,73,204,0.15)" }} />
              {SUPPORTED_LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={cn(
                    "cursor-pointer",
                    currentLang === lang.code
                      ? "text-[#9349CC] focus:text-[#b06de0]"
                      : "text-[#c8bee0]",
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

          <div className="h-4 w-px" style={{ background: "rgba(147,73,204,0.2)" }} />

          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="gap-1.5 hover:bg-red-950/30"
            style={{ color: "#8e8a9a" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color = "#f87171")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color = "#8e8a9a")
            }
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t("nav.logout")}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
