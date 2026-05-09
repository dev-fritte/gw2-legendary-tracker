import { useTranslation } from "react-i18next";
import { LayoutDashboard } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import type { NavSection } from "@/components/Navbar";

interface OverviewPageProps {
  onLogout: () => void;
  onNavigate: (section: NavSection) => void;
}

export function OverviewPage({ onLogout, onNavigate }: OverviewPageProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar onLogout={onLogout} activeSection="overview" onNavigate={onNavigate} />

      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-8">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 py-20 text-center space-y-4">
          <LayoutDashboard className="w-10 h-10 mx-auto text-zinc-600" />
          <p className="text-sm text-zinc-500">{t("nav.overview")} — coming soon</p>
        </div>
      </main>
    </div>
  );
}
