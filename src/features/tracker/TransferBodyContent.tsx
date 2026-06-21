import { Loader2 } from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSensors } from '@dnd-kit/core';
import { SortableEntryCard } from './SortableEntryCard';
import type { TransferEntry } from './transferTypes';

interface TransferBodyContentProps {
  isLoading: boolean;
  entries: TransferEntry[];
  sensors: ReturnType<typeof useSensors>;
  onDragEnd: (event: DragEndEvent) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string, itemId: number) => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}

export function TransferBodyContent({
  isLoading,
  entries,
  sensors,
  onDragEnd,
  onDelete,
  onSelect,
  t,
}: Readonly<TransferBodyContentProps>) {
  if (isLoading) {
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
        {t('transfer.loading')}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <p style={{ color: '#5a5468', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>
        {t('transfer.empty')}
      </p>
    );
  }

  return (
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

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={entries.map((e) => e.id)} strategy={verticalListSortingStrategy}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {entries.map((entry, i) => (
              <SortableEntryCard
                key={entry.id}
                entry={entry}
                index={i}
                onDelete={() => onDelete(entry.id)}
                onSelect={(itemId) => onSelect(entry.id, itemId)}
                t={t}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </>
  );
}
