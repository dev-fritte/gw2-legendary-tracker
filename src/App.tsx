import { useEffect, useState } from 'react';
import { ApiKeyForm } from '@/features/auth/ApiKeyForm';
import { CharacterSelectionPage } from '@/features/characters/CharacterSelectionPage';
import { TrackerPage } from '@/features/tracker/TrackerPage';
import { OverviewPage } from '@/features/overview/OverviewPage';
import { StarterKitsPage } from '@/features/starterkits/StarterKitsPage';
import { useApiKey } from '@/hooks/useApiKey';
import type { NavSection } from '@/components/Navbar';
import type { Character } from '@/types/gw2-api';

type View = 'selection' | 'tracker';

function getSectionFromHash(): NavSection {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (hash === 'zommoros') return 'zommoros';
  if (hash === 'starterkits') return 'starterkits';
  return 'overview';
}

export default function App() {
  const { apiKey, setApiKey, clearApiKey, isAuthenticated } = useApiKey();
  const [section, setSection] = useState<NavSection>(getSectionFromHash);
  const [view, setView] = useState<View>('selection');
  const [analyzedCharacters, setAnalyzedCharacters] = useState<Character[]>([]);

  // Sync state when user navigates with back/forward buttons
  useEffect(() => {
    const handler = () => {
      setSection(getSectionFromHash());
      setView('selection');
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const handleNavigate = (target: NavSection) => {
    window.location.hash = target;
    setSection(target);
    setView('selection');
  };

  if (!isAuthenticated || !apiKey) {
    return <ApiKeyForm onSuccess={setApiKey} />;
  }

  if (section === 'overview') {
    return <OverviewPage apiKey={apiKey} onLogout={clearApiKey} onNavigate={handleNavigate} />;
  }

  if (section === 'starterkits') {
    return <StarterKitsPage apiKey={apiKey} onLogout={clearApiKey} onNavigate={handleNavigate} />;
  }

  if (view === 'tracker') {
    return (
      <TrackerPage
        apiKey={apiKey}
        characters={analyzedCharacters}
        onBack={() => setView('selection')}
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
        setView('tracker');
      }}
    />
  );
}
