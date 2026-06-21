import { useTranslation } from 'react-i18next';
import type { LegendaryPickerItem } from './useAllLegendaryItems';
import { GENERATION_TINT } from './useAllLegendaryItems';
import { ROMAN } from './prophecyCatalog';
import { getSubLabel, stepStatus } from './prophecyHelpers';
import { GOLD, PURPLE, STEP_W } from './prophecyTypes';
import type { Step } from './prophecyTypes';
import { ProphecyOrb } from './ProphecyOrb';
import { LegendaryItemPopover } from '@/components/ui/LegendaryItemPopover';

interface CardProps {
  step: Step;
  index: number;
  steps: Step[];
  itemsById: Map<number, LegendaryPickerItem>;
  onSlotClick: (id: number) => void;
  onToggle: (id: number) => void;
  onRemove: (id: number) => void;
}

export function ChronicleCard({
  step,
  index,
  steps,
  itemsById,
  onSlotClick,
  onToggle,
  onRemove,
}: CardProps) {
  const { t } = useTranslation();
  const status = stepStatus(step, steps);
  const pickerIt = step.item ? itemsById.get(step.item) : undefined;
  const tint = pickerIt ? GENERATION_TINT[pickerIt.generation] : GENERATION_TINT.other;
  const subLabel = pickerIt ? getSubLabel(pickerIt, t) : '';

  const statusMeta = {
    done: { label: t('prophecy.status.done'), color: GOLD },
    active: { label: t('prophecy.status.active'), color: PURPLE },
    planned: { label: t('prophecy.status.planned'), color: '#8e8a9a' },
    empty: { label: t('prophecy.status.empty'), color: '#5a5468' },
  } as const;
  const { label: statusLabel, color: statusColor } = statusMeta[status];

  return (
    <div style={{ width: STEP_W, flexShrink: 0, padding: '0 8px', boxSizing: 'border-box' }}>
      <div
        style={{
          height: 192,
          padding: 14,
          boxSizing: 'border-box',
          background: status === 'done' ? 'rgba(233,198,107,0.06)' : 'rgba(20,16,28,0.7)',
          border: `1px solid ${
            status === 'done'
              ? 'rgba(233,198,107,0.3)'
              : status === 'active'
                ? `${PURPLE}66`
                : 'rgba(147,73,204,0.18)'
          }`,
          borderRadius: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          boxShadow: status === 'active' ? `0 0 18px ${PURPLE}33` : 'none',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              fontFamily: '"Cinzel", serif',
              fontSize: 13,
              letterSpacing: 1.5,
              fontWeight: 600,
              color: status === 'done' ? GOLD : PURPLE,
            }}
          >
            {ROMAN[index + 1] ?? index + 1}
          </span>
          <span
            style={{
              fontSize: 9,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              fontFamily: '"Cinzel", serif',
              fontWeight: 600,
              color: statusColor,
              padding: '3px 8px',
              background: `${statusColor}1a`,
              border: `1px solid ${statusColor}44`,
              borderRadius: 99,
            }}
          >
            {statusLabel}
          </span>
        </div>

        {/* Body */}
        <LegendaryItemPopover
          name={pickerIt?.name}
          icon={pickerIt?.icon}
          description={pickerIt?.description}
          itemType={pickerIt?.itemType}
          detailType={pickerIt?.detailType}
          weightClass={pickerIt?.weightClass}
        >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1, minHeight: 0 }}>
          <ProphecyOrb status={status} tint={tint} size={44} icon={pickerIt?.icon} />
          <div style={{ minWidth: 0, flex: 1 }}>
            {step.item ? (
              <>
                <div
                  style={{
                    fontFamily: '"Cinzel", serif',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#fff',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {pickerIt?.name}
                </div>
                {subLabel && (
                  <div
                    style={{
                      fontSize: 10,
                      color: '#8e8a9a',
                      marginTop: 3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {subLabel}
                  </div>
                )}
                {step.done && step.doneAt && (
                  <div style={{ fontSize: 10, color: GOLD, marginTop: 3 }}>✓ {step.doneAt}</div>
                )}
              </>
            ) : (
              <button
                onClick={() => onSlotClick(step.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  fontSize: 12,
                  color: PURPLE,
                  fontFamily: '"Cinzel", serif',
                  letterSpacing: 1,
                }}
              >
                {t('prophecy.cta.choose')}
              </button>
            )}
          </div>
        </div>
        </LegendaryItemPopover>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6 }}>
          {step.item && (
            <button
              onClick={() => onToggle(step.id)}
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: 6,
                cursor: 'pointer',
                background: step.done ? `${GOLD}22` : 'transparent',
                border: `1px solid ${step.done ? `${GOLD}66` : 'rgba(147,73,204,0.3)'}`,
                color: step.done ? GOLD : '#c8bee0',
                fontSize: 11,
                fontFamily: '"Cinzel", serif',
                letterSpacing: 0.5,
              }}
            >
              {step.done ? t('prophecy.cta.completed') : t('prophecy.cta.ignite')}
            </button>
          )}
          {step.item && (
            <button
              onClick={() => onSlotClick(step.id)}
              title={t('prophecy.action.swap')}
              style={{
                width: 30,
                padding: '6px 0',
                borderRadius: 6,
                cursor: 'pointer',
                background: 'transparent',
                border: '1px solid rgba(147,73,204,0.3)',
                color: '#8e8a9a',
                fontSize: 12,
              }}
            >
              ↻
            </button>
          )}
          <button
            onClick={() => onRemove(step.id)}
            title={t('prophecy.action.remove')}
            style={{
              width: 30,
              padding: '6px 0',
              borderRadius: 6,
              cursor: 'pointer',
              background: 'transparent',
              border: '1px solid rgba(147,73,204,0.12)',
              color: '#5a5468',
              fontSize: 12,
            }}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
