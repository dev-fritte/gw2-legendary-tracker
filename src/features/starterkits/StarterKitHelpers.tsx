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

// ─── KitListSkeleton ──────────────────────────────────────────────────────────

export function KitListSkeleton() {
  return (
    <div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse"
          style={{
            height: 46,
            borderBottom: i < 5 ? '1px solid rgba(147,73,204,0.1)' : undefined,
            background: 'rgba(147,73,204,0.03)',
          }}
        />
      ))}
    </div>
  );
}
