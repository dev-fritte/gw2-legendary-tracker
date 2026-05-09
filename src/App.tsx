import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiKeyForm } from "@/features/auth/ApiKeyForm";
import { CharacterSelectionPage } from "@/features/characters/CharacterSelectionPage";
import { Navbar } from "@/components/Navbar";
import { useApiKey } from "@/hooks/useApiKey";
import type { Character } from "@/types/gw2-api";

type View = "selection" | "tracker";

// Placeholder until the Calculation Engine + Tracker UI is built
function TrackerPlaceholder({
  characters,
  onBack,
  onLogout,
}: {
  characters: Character[];
  onBack: () => void;
  onLogout: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar onLogout={onLogout} />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-zinc-400">
        <p className="text-sm">
          Analyzing {characters.length} character(s) — Tracker coming next.
        </p>
        <button
          onClick={onBack}
          className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2"
        >
          {t("tracker.backToSelection")}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const { apiKey, setApiKey, clearApiKey, isAuthenticated } = useApiKey();
  const [view, setView] = useState<View>("selection");
  const [analyzedCharacters, setAnalyzedCharacters] = useState<Character[]>([]);

  if (!isAuthenticated || !apiKey) {
    return <ApiKeyForm onSuccess={setApiKey} />;
  }

  if (view === "tracker") {
    return (
      <TrackerPlaceholder
        characters={analyzedCharacters}
        onBack={() => setView("selection")}
        onLogout={clearApiKey}
      />
    );
  }

  return (
    <CharacterSelectionPage
      apiKey={apiKey}
      onLogout={clearApiKey}
      onAnalyze={(chars) => {
        setAnalyzedCharacters(chars);
        setView("tracker");
      }}
    />
  );
}
