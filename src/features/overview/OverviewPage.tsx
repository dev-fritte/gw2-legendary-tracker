import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/Navbar";
import type { NavSection } from "@/components/Navbar";

interface OverviewPageProps {
  onLogout: () => void;
  onNavigate: (section: NavSection) => void;
}

export function OverviewPage({ onLogout, onNavigate }: OverviewPageProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col" style={{ color: "#e8e4f0" }}>
      <Navbar onLogout={onLogout} activeSection="overview" onNavigate={onNavigate} />

      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-8">
        <div
          className="rounded-lg py-20 text-center space-y-4"
          style={{ border: "1px solid rgba(147,73,204,0.15)", background: "rgba(20,16,28,0.6)" }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(147,73,204,0.2) 0%, transparent 70%)",
              border: "1px solid rgba(147,73,204,0.25)",
              display: "grid",
              placeItems: "center",
              margin: "0 auto",
              fontSize: 22,
              color: "rgba(147,73,204,0.5)",
              fontFamily: '"Cinzel", serif',
            }}
          >
            ◆
          </div>
          <p className="text-sm" style={{ color: "#6a6478" }}>
            {t("nav.overview")} — coming soon
          </p>
        </div>
      </main>
    </div>
  );
}
