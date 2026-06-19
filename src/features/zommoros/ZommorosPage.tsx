import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MousePointerClick } from 'lucide-react';
import type { NavSection } from '@/components/Navbar';
import { Navbar } from '@/components/Navbar';
import { CharacterSelectionSidebar } from '@/features/characters/CharacterSelectionSidebar';
import { TrackerPage } from '@/features/tracker/TrackerPage';
import type { Character } from '@/types/gw2-api';

interface ZommorosPageProps {
  apiKey: string;
  onLogout: () => void;
  onNavigate: (section: NavSection) => void;
}

export function ZommorosPage({ apiKey, onLogout, onNavigate }: Readonly<ZommorosPageProps>) {
  const { t } = useTranslation();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(true);

  const handleSelectionChange = useCallback((chars: Character[]) => {
    setCharacters(chars);
  }, []);

  const handleLoadingChange = useCallback((loading: boolean) => {
    setIsLoadingCharacters(loading);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ color: '#e8e4f0' }}>
      <Navbar onLogout={onLogout} activeSection="zommoros" onNavigate={onNavigate} />

      <div
        className="flex-1 flex gap-6 mx-auto w-full px-4 py-6"
        style={{ maxWidth: 1280 }}
      >
        {/* Left sidebar: character selection */}
        <aside style={{ width: 320, flexShrink: 0 }}>
          <div
            className="overflow-y-auto"
            style={{ position: 'sticky', top: 24, maxHeight: 'calc(100vh - 88px)' }}
          >
            <CharacterSelectionSidebar
              apiKey={apiKey}
              onSelectionChange={handleSelectionChange}
              onLoadingChange={handleLoadingChange}
            />
          </div>
        </aside>

        {/* Right panel: tracker results */}
        <div
          className="flex-1 min-w-0 py-2"
          style={{ borderLeft: '1px solid rgba(147,73,204,0.12)', paddingLeft: 24 }}
        >
          {isLoadingCharacters ? (
            <RightPanelLoading />
          ) : characters.length === 0 ? (
            <RightPanelEmpty t={t} />
          ) : (
            <TrackerPage apiKey={apiKey} characters={characters} onNavigate={onNavigate} />
          )}
        </div>
      </div>
    </div>
  );
}

function RightPanelLoading() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <div
        className="w-8 h-8 rounded-full border-2 animate-spin"
        style={{ borderColor: 'rgba(147,73,204,0.2)', borderTopColor: '#9349CC' }}
      />
      <p className="text-sm" style={{ color: '#5a5468' }}>
        {t('characters.loadingCharacters')}
      </p>
    </div>
  );
}

function RightPanelEmpty({ t }: { t: (key: string) => string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24">
      <MousePointerClick className="w-8 h-8" style={{ color: 'rgba(147,73,204,0.3)' }} />
      <p className="text-sm" style={{ color: '#3a3448' }}>
        {t('characters.selectToAnalyze')}
      </p>
    </div>
  );
}
