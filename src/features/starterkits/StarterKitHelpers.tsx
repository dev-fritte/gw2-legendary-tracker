import { useTranslation } from 'react-i18next';
import type { FilterMode } from './starterKitTypes';

// ─── StatPill ─────────────────────────────────────────────────────────────────

export function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#5a5468',
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 22, fontWeight: 700, color: '#e8e4f0', lineHeight: 1 }}>
        {value}
      </span>
    </div>
  );
}

// ─── FilterToggle ─────────────────────────────────────────────────────────────

export function FilterToggle({
  value,
  onChange,
  allCount,
  ownedCount,
}: {
  value: FilterMode;
  onChange: (v: FilterMode) => void;
  allCount: number;
  ownedCount: number;
}) {
  const { t } = useTranslation();
  return (
    <div
      style={{
        display: 'flex',
        border: '1px solid rgba(147,73,204,0.25)',
        borderRadius: 6,
        overflow: 'hidden',
      }}
    >
      {(['all', 'owned'] as const).map((mode) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          style={{
            padding: '4px 12px',
            fontSize: 12,
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s',
            background:
              value === mode ? 'linear-gradient(135deg, #9349CC, #7a3aaa)' : 'transparent',
            color: value === mode ? '#fff' : '#8e8a9a',
          }}
        >
          {mode === 'all'
            ? t('starterKits.filterAll', { count: allCount })
            : t('starterKits.filterOwned', { count: ownedCount })}
        </button>
      ))}
    </div>
  );
}

// ─── AccountLoadingIndicator ──────────────────────────────────────────────────

export function AccountLoadingIndicator({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        style={{ flexShrink: 0, animation: 'spin 1s linear infinite' }}
      >
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <circle cx="7" cy="7" r="5.5" fill="none" stroke="rgba(147,73,204,0.25)" strokeWidth="1.5" />
        <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" fill="none" stroke="#9349CC" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span style={{ fontSize: 13, color: '#8e8a9a', fontWeight: 500 }}>{label}</span>
    </div>
  );
}
