import { useTranslation } from 'react-i18next';
import { GOLD } from './prophecyTypes';

interface StarterKitLegendProps {
  visible: boolean;
}

export function StarterKitLegend({ visible }: Readonly<StarterKitLegendProps>) {
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <div
      style={{
        padding: '5px 24px',
        borderBottom: '1px solid rgba(147,73,204,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <div
        style={{
          width: 13,
          height: 13,
          borderRadius: '50%',
          background: GOLD,
          border: '1.5px solid #0b0814',
          display: 'grid',
          placeItems: 'center',
          fontSize: 7,
          color: '#1a1000',
          fontWeight: 900,
          flexShrink: 0,
        }}
      >
        ⚒
      </div>
      <span style={{ fontSize: 10, color: '#6a6478', letterSpacing: 0.3 }}>
        {t('picker.starterKitHint')}
      </span>
    </div>
  );
}
