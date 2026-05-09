import { useState } from "react";
import { ApiKeyForm } from "@/features/auth/ApiKeyForm";
import { CharacterSelectionPage } from "@/features/characters/CharacterSelectionPage";
import { TrackerPage } from "@/features/tracker/TrackerPage";
import { OverviewPage } from "@/features/overview/OverviewPage";
import { useApiKey } from "@/hooks/useApiKey";
import type { NavSection } from "@/components/Navbar";
import type { Character } from "@/types/gw2-api";

type View = "selection" | "tracker";

export default function App() {
  const { apiKey, setApiKey, clearApiKey, isAuthenticated } = useApiKey();
  const [section, setSection] = useState<NavSection>("zommoros");
  const [view, setView] = useState<View>("selection");
  const [analyzedCharacters, setAnalyzedCharacters] = useState<Character[]>([]);

  const handleNavigate = (target: NavSection) => {
    setSection(target);
    setView("selection");
  };

  if (!isAuthenticated || !apiKey) {
    return <ApiKeyForm onSuccess={setApiKey} />;
  }

  if (section === "overview") {
    return <OverviewPage apiKey={apiKey} onLogout={clearApiKey} onNavigate={handleNavigate} />;
  }

  if (view === "tracker") {
    return (
      <TrackerPage
        apiKey={apiKey}
        characters={analyzedCharacters}
        onBack={() => setView("selection")}
        onLogout={clearApiKey}
        onNavigate={handleNavigate}
      />
    );
  }

  return (
    <CharacterSelectionPage
      apiKey={apiKey}
      onLogout={clearApiKey}
      onNavigate={handleNavigate}
      onAnalyze={(chars) => {
        setAnalyzedCharacters(chars);
        setView("tracker");
      }}
    />
  );
}
