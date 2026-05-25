import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PURPLE } from '@/features/prophecy/prophecyTypes';
import { useTransferEntries } from './useTransferEntries';
import { TransferBodyContent } from './TransferBodyContent';
import type { ImportMode, TransferToProphecyModalProps } from './transferTypes';

export function TransferToProphecyModal({
  apiKey,
  recommendations,
  onClose,
  onTransferred,
}: Readonly<TransferToProphecyModalProps>) {
  const { t } = useTranslation();

  const {
    entries,
    importMode,
    setImportMode,
    existingPlannedCount,
    isLoading,
    sensors,
    handleDragEnd,
    deleteEntry,
    setSelected,
    handleTransfer,
  } = useTransferEntries(apiKey, recommendations, onTransferred);

  // Lock body scroll while the modal is open so the page behind doesn't scroll.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const transferCount = entries.length;
  const canTransfer = transferCount > 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(11,8,20,0.75)',
        backdropFilter: 'blur(6px)',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 640,
          maxHeight: '90vh',
          background: '#14101c',
          border: '1px solid rgba(147,73,204,0.35)',
          borderRadius: 14,
          boxShadow: '0 20px 80px rgba(147,73,204,0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <ModalHeader
          isLoading={isLoading}
          transferCount={transferCount}
          onClose={onClose}
          t={t}
        />

        <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', padding: '12px 24px' }}>
          <TransferBodyContent
            isLoading={isLoading}
            entries={entries}
            sensors={sensors}
            onDragEnd={handleDragEnd}
            onDelete={deleteEntry}
            onSelect={setSelected}
            t={t}
          />
        </div>

        {!isLoading && existingPlannedCount > 0 && canTransfer && (
          <ConflictNotice
            existingPlannedCount={existingPlannedCount}
            importMode={importMode}
            onModeChange={setImportMode}
            t={t}
          />
        )}

        <ModalFooter
          isLoading={isLoading}
          canTransfer={canTransfer}
          transferCount={transferCount}
          onClose={onClose}
          onTransfer={handleTransfer}
          t={t}
        />
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type TFn = (key: string, opts?: Record<string, unknown>) => string;

function ModalHeader({
  isLoading,
  transferCount,
  onClose,
  t,
}: Readonly<{ isLoading: boolean; transferCount: number; onClose: () => void; t: TFn }>) {
  return (
    <div
      style={{
        padding: '20px 24px 16px',
        borderBottom: '1px solid rgba(147,73,204,0.15)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}
    >
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 10, letterSpacing: 3, color: PURPLE, fontWeight: 600, margin: 0 }}>
          {t('transfer.eyebrow')}
        </p>
        <h2
          style={{
            fontFamily: '"Cinzel", serif',
            fontSize: 20,
            fontWeight: 600,
            color: '#e8e4f0',
            margin: '4px 0 0',
          }}
        >
          {t('transfer.title')}
        </h2>
        {!isLoading && (
          <p style={{ fontSize: 12, color: '#6a6478', margin: '4px 0 0' }}>
            {t('transfer.subtitle', { count: transferCount })}
          </p>
        )}
      </div>
      <button
        onClick={onClose}
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          cursor: 'pointer',
          background: 'transparent',
          border: '1px solid rgba(147,73,204,0.25)',
          color: '#8e8a9a',
          fontSize: 16,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}

function ConflictNotice({
  existingPlannedCount,
  importMode,
  onModeChange,
  t,
}: Readonly<{
  existingPlannedCount: number;
  importMode: ImportMode;
  onModeChange: (mode: ImportMode) => void;
  t: TFn;
}>) {
  return (
    <div
      style={{
        padding: '12px 24px',
        borderTop: '1px solid rgba(147,73,204,0.1)',
        background: 'rgba(147,73,204,0.04)',
      }}
    >
      <p style={{ fontSize: 12, color: '#a89cc0', margin: '0 0 8px' }}>
        {t('transfer.conflict', { count: existingPlannedCount })}
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        {(['append', 'overwrite'] as ImportMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => onModeChange(mode)}
            style={{
              padding: '5px 12px',
              fontSize: 11,
              fontWeight: 600,
              borderRadius: 6,
              cursor: 'pointer',
              border: `1px solid ${importMode === mode ? `${PURPLE}66` : 'rgba(147,73,204,0.2)'}`,
              background: importMode === mode ? `${PURPLE}22` : 'transparent',
              color: importMode === mode ? '#d4c8e8' : '#6a6478',
              transition: 'all 0.15s',
            }}
          >
            {t(`transfer.${mode}`)}
          </button>
        ))}
      </div>
    </div>
  );
}

function ModalFooter({
  isLoading,
  canTransfer,
  transferCount,
  onClose,
  onTransfer,
  t,
}: Readonly<{
  isLoading: boolean;
  canTransfer: boolean;
  transferCount: number;
  onClose: () => void;
  onTransfer: () => void;
  t: TFn;
}>) {
  return (
    <div
      style={{
        padding: '14px 24px',
        borderTop: '1px solid rgba(147,73,204,0.15)',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 8,
      }}
    >
      <Button variant="ghost" size="sm" onClick={onClose} style={{ color: '#6a6478' }}>
        {t('transfer.cancel')}
      </Button>
      <Button
        size="sm"
        disabled={!canTransfer || isLoading}
        onClick={onTransfer}
        style={{
          background: canTransfer ? `linear-gradient(135deg, ${PURPLE}, #7a3aaa)` : undefined,
          color: '#fff',
          border: 'none',
          gap: 6,
        }}
      >
        <ArrowRight style={{ width: 13, height: 13 }} />
        {t('transfer.confirm', { count: transferCount })}
      </Button>
    </div>
  );
}
