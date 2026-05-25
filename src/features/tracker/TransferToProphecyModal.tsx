import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { GripVertical, X, ArrowRight, Loader2 } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import type { LegendaryWeaponRecommendation } from '@/types/gw2-api';
import { useAllLegendaryItems } from '@/features/prophecy/useAllLegendaryItems';
import { storage } from '@/services/storage';
import { PURPLE, GOLD } from '@/features/prophecy/prophecyTypes';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TransferEntry {
  /** Unique stable key — used as dnd-kit id */
  id: string;
  weaponType: string;
  impact: number;
  recIcon: string | undefined;
  availableNames: string[];
  selectedName: string;
}

type ImportMode = 'append' | 'overwrite';

interface Props {
  apiKey: string;
  recommendations: LegendaryWeaponRecommendation[];
  onClose: () => void;
  onTransferred: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildEntries(
  recommendations: LegendaryWeaponRecommendation[],
  allItems: ReturnType<typeof useAllLegendaryItems>['items'],
): TransferEntry[] {
  return recommendations.flatMap((rec): TransferEntry[] => {
    const matching = allItems
      .filter((it) => it.itemType === 'Weapon' && it.detailType === rec.weaponType)
      .map((it) => it.name)
      .sort((a, b) => a.localeCompare(b));
    if (matching.length === 0) return [];
    return [
      {
        id: rec.weaponType,
        weaponType: rec.weaponType,
        impact: rec.impact,
        recIcon: rec.icon,
        availableNames: matching,
        selectedName: matching[0],
      },
    ];
  });
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function TransferToProphecyModal({
  apiKey,
  recommendations,
  onClose,
  onTransferred,
}: Readonly<Props>) {
  const { t } = useTranslation();
  const { items: allItems, isLoading } = useAllLegendaryItems(apiKey);

  const [entries, setEntries] = useState<TransferEntry[]>([]);
  const [importMode, setImportMode] = useState<ImportMode>('append');

  // Lock body scroll while the modal is open so the page behind doesn't scroll.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Guard: initialise entries exactly once after items have loaded.
  // allItems gets a NEW array reference on every render (inline .map() in the
  // hook), so depending on it directly would reset the order after every drag.
  const initialized = useRef(false);
  useEffect(() => {
    if (!isLoading && allItems.length > 0 && !initialized.current) {
      initialized.current = true;
      setEntries(buildEntries(recommendations, allItems));
    }
  }, [isLoading, allItems, recommendations]);

  const existingPlannedCount = useMemo(
    () => storage.getRoadmap().filter((s) => s.item !== null && !s.done).length,
    [],
  );

  // dnd-kit sensors — pointer for mouse/touch, keyboard for a11y
  // The distance constraint ensures a real drag gesture (≥8 px) is required,
  // so clicking chip buttons inside the card never accidentally starts a drag.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setEntries((prev) => {
      const oldIndex = prev.findIndex((e) => e.id === active.id);
      const newIndex = prev.findIndex((e) => e.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  function deleteEntry(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function setSelected(id: string, name: string) {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, selectedName: name } : e)));
  }

  function handleTransfer() {
    const toAdd = entries.filter((e) => e.selectedName);
    if (toAdd.length === 0) return;
    const existing = storage.getRoadmap();
    const base = importMode === 'overwrite' ? existing.filter((s) => s.done) : existing;
    const maxId = base.length > 0 ? Math.max(...base.map((s) => s.id)) : 0;
    storage.setRoadmap([
      ...base,
      ...toAdd.map((e, i) => ({ id: maxId + i + 1, item: e.selectedName, done: false })),
    ]);
    onTransferred();
  }

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
        {/* Header */}
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

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', padding: '12px 24px' }}>
          {isLoading ? (
            <LoadingState label={t('transfer.loading')} />
          ) : entries.length === 0 ? (
            <p style={{ color: '#5a5468', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>
              {t('transfer.empty')}
            </p>
          ) : (
            <>
              <p
                style={{
                  fontSize: 10,
                  color: '#4a4458',
                  margin: '0 0 8px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                {t('transfer.dragHint')}
              </p>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={entries.map((e) => e.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {entries.map((entry, i) => (
                      <SortableEntryCard
                        key={entry.id}
                        entry={entry}
                        index={i}
                        onDelete={() => deleteEntry(entry.id)}
                        onSelect={(name) => setSelected(entry.id, name)}
                        t={t}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </>
          )}
        </div>

        {/* Conflict notice */}
        {!isLoading && existingPlannedCount > 0 && canTransfer && (
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
                  onClick={() => setImportMode(mode)}
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
        )}

        {/* Footer */}
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
            onClick={handleTransfer}
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
      </div>
    </div>
  );
}

// ─── Sortable entry card ──────────────────────────────────────────────────────

interface SortableEntryCardProps {
  entry: TransferEntry;
  index: number;
  onDelete: () => void;
  onSelect: (name: string) => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}

function SortableEntryCard({
  entry,
  index,
  onDelete,
  onSelect,
  t,
}: Readonly<SortableEntryCardProps>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: entry.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 10 : undefined,
      }}
    >
      <div
        style={{
          background: isDragging ? 'rgba(147,73,204,0.14)' : 'rgba(20,16,28,0.7)',
          border: `1px solid ${isDragging ? 'rgba(147,73,204,0.5)' : 'rgba(147,73,204,0.15)'}`,
          borderRadius: 8,
          padding: '10px 10px 10px 6px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          transition: 'border-color 0.15s, background 0.15s',
          userSelect: 'none',
        }}
      >
        {/* Drag handle — only this element activates the drag */}
        <div
          {...attributes}
          {...listeners}
          style={{
            color: '#5a5468',
            paddingTop: 2,
            flexShrink: 0,
            cursor: 'grab',
            touchAction: 'none',
          }}
        >
          <GripVertical style={{ width: 14, height: 14 }} />
        </div>

        {/* Rank */}
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#4a4458',
            width: 16,
            textAlign: 'right',
            flexShrink: 0,
            paddingTop: 2,
          }}
        >
          {index + 1}
        </span>

        {/* Icon */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 6,
            overflow: 'hidden',
            flexShrink: 0,
            background: 'rgba(147,73,204,0.1)',
            border: '1px solid rgba(147,73,204,0.2)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {entry.recIcon ? (
            <img
              src={entry.recIcon}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ fontSize: 16 }}>✦</span>
          )}
        </div>

        {/* Text + legendary chips */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#c8bee0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {t(`weapons.${entry.weaponType}`, { defaultValue: entry.weaponType })}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: GOLD,
                background: `${GOLD}18`,
                border: `1px solid ${GOLD}44`,
                borderRadius: 10,
                padding: '1px 6px',
                flexShrink: 0,
              }}
            >
              ×{entry.impact}
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {entry.availableNames.map((name) => {
              const isSelected = entry.selectedName === name;
              return (
                <Tooltip key={name} content={name} side="top" delayDuration={500}>
                  <button
                    onClick={() => onSelect(name)}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: isSelected ? 600 : 400,
                      border: `1px solid ${isSelected ? `${PURPLE}88` : 'rgba(147,73,204,0.18)'}`,
                      background: isSelected ? `${PURPLE}22` : 'transparent',
                      color: isSelected ? '#d4c8e8' : '#5a5468',
                      cursor: 'pointer',
                      transition: 'all 0.12s',
                      whiteSpace: 'nowrap',
                      maxWidth: 120,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {name}
                  </button>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* Delete */}
        <button
          onClick={onDelete}
          style={{
            width: 24,
            height: 24,
            borderRadius: 4,
            cursor: 'pointer',
            background: 'transparent',
            border: '1px solid rgba(239,68,68,0.2)',
            color: 'rgba(239,68,68,0.5)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            transition: 'all 0.12s',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = 'rgba(239,68,68,0.1)';
            el.style.color = '#f87171';
            el.style.borderColor = 'rgba(239,68,68,0.4)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = 'transparent';
            el.style.color = 'rgba(239,68,68,0.5)';
            el.style.borderColor = 'rgba(239,68,68,0.2)';
          }}
        >
          <X style={{ width: 11, height: 11 }} />
        </button>
      </div>
    </div>
  );
}

// ─── Loading state ────────────────────────────────────────────────────────────

function LoadingState({ label }: { label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        justifyContent: 'center',
        padding: '32px 0',
        color: '#5a5468',
        fontSize: 13,
      }}
    >
      <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
      {label}
    </div>
  );
}
