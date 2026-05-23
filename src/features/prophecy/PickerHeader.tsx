import { useTranslation } from 'react-i18next';
import { PURPLE } from './prophecyTypes';

interface PickerHeaderProps {
  onClose: () => void;
}

export function PickerHeader({ onClose }: Readonly<PickerHeaderProps>) {
  const { t } = useTranslation();

  return (
    <div
      style={{
        padding: '20px 24px',
        borderBottom: '1px solid rgba(147,73,204,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <div>
        <div style={{ fontSize: 10, letterSpacing: 3, color: PURPLE, fontWeight: 600 }}>
          {t('picker.eyebrow')}
        </div>
        <div
          style={{
            fontFamily: '"Cinzel", serif',
            fontSize: 22,
            fontWeight: 600,
            marginTop: 4,
            color: '#e8e4f0',
          }}
        >
          {t('picker.title')}
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <button
        onClick={onClose}
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          cursor: 'pointer',
          background: 'transparent',
          border: '1px solid rgba(147,73,204,0.3)',
          color: '#8e8a9a',
          fontSize: 18,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        ×
      </button>
    </div>
  );
}
