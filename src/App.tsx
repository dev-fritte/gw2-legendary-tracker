import { useState } from "react";
import { ApiKeyForm } from "@/features/auth/ApiKeyForm";
import { CharacterSelectionPage } from "@/features/characters/CharacterSelectionPage";
import { TrackerPage } from "@/features/tracker/TrackerPage";
import { useApiKey } from "@/hooks/useApiKey";
import type { Character } from "@/types/gw2-api";

type View = "selection" | "tracker";

export default function App() {
  const { apiKey, setApiKey, clearApiKey, isAuthenticated } = useApiKey();
  const [view, setView] = useState<View>("selection");
  const [analyzedCharacters, setAnalyzedCharacters] = useState<Character[]>([]);

  if (!isAuthenticated || !apiKey) {
    return <ApiKeyForm onSuccess={setApiKey} />;
  }

  if (view === "tracker") {
    return (
      <TrackerPage
        apiKey={apiKey}
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
