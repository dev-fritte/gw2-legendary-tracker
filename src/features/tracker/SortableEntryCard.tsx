import { GripVertical, X } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Tooltip } from '@/components/ui/tooltip';
import { PURPLE, GOLD } from '@/features/prophecy/prophecyTypes';
import type { TransferEntry } from './transferTypes';

interface SortableEntryCardProps {
  entry: TransferEntry;
  index: number;
  onDelete: () => void;
  onSelect: (itemId: number) => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}

export function SortableEntryCard({
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
          style={{ color: '#5a5468', paddingTop: 2, flexShrink: 0, cursor: 'grab', touchAction: 'none' }}
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
            <img src={entry.recIcon} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: 16 }}>✦</span>
          )}
        </div>

        {/* Weapon name + impact + legendary chips */}
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
            {entry.availableOptions.map((opt) => {
              const isSelected = entry.selectedId === opt.id;
              return (
                <Tooltip key={opt.id} content={opt.name} side="top" delayDuration={500}>
                  <button
                    onClick={() => onSelect(opt.id)}
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
                    {opt.name}
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
