import { useEffect, useState } from 'react';
import { ApiKeyForm } from '@/features/auth/ApiKeyForm';
import { ZommorosPage } from '@/features/zommoros/ZommorosPage';
import { OverviewPage } from '@/features/overview/OverviewPage';
import { StarterKitsPage } from '@/features/starterkits/StarterKitsPage';
import { GlintsProphecyPage } from '@/features/prophecy/GlintsProphecyPage';
import { useApiKey } from '@/hooks/useApiKey';
import type { NavSection } from '@/components/Navbar';

function getSectionFromHash(): NavSection {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (hash === 'zommoros') return 'zommoros';
  if (hash === 'starterkits') return 'starterkits';
  if (hash === 'prophecy') return 'prophecy';
  return 'overview';
}

export default function App() {
  const { apiKey, setApiKey, clearApiKey, isAuthenticated } = useApiKey();
  const [section, setSection] = useState<NavSection>(getSectionFromHash);

  useEffect(() => {
    const handler = () => setSection(getSectionFromHash());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const handleNavigate = (target: NavSection) => {
    window.location.hash = target;
    setSection(target);
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

  if (section === 'prophecy') {
    return (
      <GlintsProphecyPage apiKey={apiKey} onLogout={clearApiKey} onNavigate={handleNavigate} />
    );
  }

  return (
    <ZommorosPage apiKey={apiKey} onLogout={clearApiKey} onNavigate={handleNavigate} />
  );
}
