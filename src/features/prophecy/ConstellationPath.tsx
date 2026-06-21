import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { LegendaryPickerItem } from './useAllLegendaryItems';
import { GENERATION_TINT } from './useAllLegendaryItems';
import { ROMAN } from './prophecyCatalog';
import { stepStatus } from './prophecyHelpers';
import { GOLD, PURPLE, STEP_W } from './prophecyTypes';
import type { Step } from './prophecyTypes';
import { ProphecyOrb } from './ProphecyOrb';
import { LegendaryItemPopover } from '@/components/ui/LegendaryItemPopover';

interface PathProps {
  steps: Step[];
  itemsById: Map<number, LegendaryPickerItem>;
  onSlotClick: (id: number) => void;
  onToggle: (id: number) => void;
  onScrollSync: (sx: number) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
}

const H = 400;

export function ConstellationPath({
  steps,
  itemsById,
  onSlotClick,
  onToggle,
  onScrollSync,
  scrollRef,
}: PathProps) {
  const { t } = useTranslation();
  const innerW = Math.max(steps.length, 1) * STEP_W;
  const [scrollX, setScrollX] = useState(0);

  // Drag-to-scroll — only initiated from the background layer, not from orbs.
  // Global window listeners keep the drag alive even when the pointer moves over an orb.
  const handleBgMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      const startX = e.clientX;
      const startScrollLeft = scrollRef.current?.scrollLeft ?? 0;

      const onMove = (ev: MouseEvent) => {
        const next = startScrollLeft + (startX - ev.clientX);
        if (scrollRef.current) {
          scrollRef.current.scrollLeft = next;
          setScrollX(next);
          onScrollSync(next);
        }
      };

      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [onScrollSync, scrollRef],
  );

  const positions = steps.map((_, i) => {
    const t = steps.length <= 1 ? 0.5 : i / (steps.length - 1);
    return {
      x: i * STEP_W + STEP_W / 2,
      y: H / 2 + Math.sin(t * Math.PI * 2.0) * (H * 0.28),
    };
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const sx = e.currentTarget.scrollLeft;
    setScrollX(sx);
    onScrollSync(sx);
  };

  const doneCount = steps.filter((s) => s.done).length;
  const gradientStop = `${(doneCount / Math.max(1, steps.length - 1)) * 100}%`;

  const pathD = positions.reduce((d, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = positions[i - 1];
    const cx = prev.x + (p.x - prev.x) * 0.5;
    return `${d} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
  }, '');

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: H,
        overflow: 'hidden',
        background: 'rgba(11,8,20,0.6)',
        border: '1px solid rgba(147,73,204,0.2)',
        borderRadius: 14,
      }}
    >
      {/* Fixed star field */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {Array.from({ length: 130 }, (_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${(i * 53) % 100}%`,
              top: `${(i * 37) % 100}%`,
              width: (((i * 7) % 3) + 1) * 0.6,
              height: (((i * 7) % 3) + 1) * 0.6,
              background: '#fff',
              opacity: ((i * 13) % 9) / 22,
              borderRadius: '50%',
            }}
          />
        ))}
      </div>

      {/* Parallax nebula (25 % of scroll speed) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          width: '200%',
          transform: `translateX(${-scrollX * 0.25}px)`,
          background: [
            `radial-gradient(ellipse 400px 280px at 200px 280px, ${PURPLE}26 0%, transparent 60%)`,
            `radial-gradient(ellipse 500px 320px at 900px 80px, ${PURPLE}1c 0%, transparent 60%)`,
            `radial-gradient(ellipse 450px 300px at 1600px 240px, ${GOLD}10 0%, transparent 60%)`,
            `radial-gradient(ellipse 400px 280px at 2300px 100px, ${PURPLE}18 0%, transparent 60%)`,
          ].join(', '),
        }}
      />

      {/* Scrollable path + orbs */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="prophecy-pathscroll"
        style={{ position: 'absolute', inset: 0, overflowX: 'auto', overflowY: 'hidden' }}
      >
        <div style={{ width: innerW, height: H, position: 'relative' }}>
          {/* Transparent drag layer — first in DOM so orbs (later in DOM) sit on top and
              receive their own click events without interference. */}
          <div
            className="prophecy-drag-bg"
            onMouseDown={handleBgMouseDown}
            style={{ position: 'absolute', inset: 0 }}
          />

          {/* Decorative constellation line — pointerEvents: none so clicks fall through
              to the drag layer in empty areas */}
          <svg
            viewBox={`0 0 ${innerW} ${H}`}
            preserveAspectRatio="none"
            style={{
              position: 'absolute',
              inset: 0,
              width: innerW,
              height: H,
              pointerEvents: 'none',
            }}
          >
            <defs>
              <linearGradient id="prophecy-line" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={GOLD} stopOpacity="0.7" />
                <stop offset={gradientStop} stopColor={GOLD} stopOpacity="0.7" />
                <stop offset={gradientStop} stopColor={PURPLE} stopOpacity="0.6" />
                <stop offset="100%" stopColor={PURPLE} stopOpacity="0.25" />
              </linearGradient>
            </defs>
            {steps.length > 1 && (
              <path
                d={pathD}
                stroke="url(#prophecy-line)"
                strokeWidth="1.5"
                fill="none"
                strokeDasharray="2 6"
              />
            )}
          </svg>

          {steps.map((step, i) => {
            const pos = positions[i];
            const status = stepStatus(step, steps);
            const pickerIt = step.item ? itemsById.get(step.item) : undefined;
            const tint = pickerIt ? GENERATION_TINT[pickerIt.generation] : GENERATION_TINT.other;
            const orbSize = status === 'active' ? 92 : 76;

            return (
              <LegendaryItemPopover
                key={step.id}
                name={pickerIt?.name}
                icon={pickerIt?.icon}
                description={pickerIt?.description}
                itemType={pickerIt?.itemType}
                detailType={pickerIt?.detailType}
                weightClass={pickerIt?.weightClass}
              >
              <div
                onClick={() => (step.item ? onToggle(step.id) : onSlotClick(step.id))}
                style={{
                  position: 'absolute',
                  left: pos.x,
                  top: pos.y,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                }}
              >
                <ProphecyOrb status={status} tint={tint} size={orbSize} icon={pickerIt?.icon} />

                {/* Roman numeral */}
                <div
                  style={{
                    position: 'absolute',
                    top: -22,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontFamily: '"Cinzel", serif',
                    fontSize: 11,
                    fontWeight: 600,
                    color: status === 'done' ? GOLD : status === 'active' ? '#fff' : '#8e8a9a',
                    letterSpacing: 2,
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                  }}
                >
                  {ROMAN[i + 1] ?? i + 1}
                </div>

                {/* Item name + type */}
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    style={{
                      fontFamily: '"Cinzel", serif',
                      fontSize: 12,
                      fontWeight: 600,
                      color: status === 'done' ? GOLD : '#fff',
                    }}
                  >
                    {pickerIt?.name ?? (
                      <span style={{ color: '#5a5468', fontStyle: 'italic' }}>{t('prophecy.empty')}</span>
                    )}
                  </div>
                  {pickerIt && (
                    <div style={{ fontSize: 10, color: '#6a6478', marginTop: 2 }}>
                      {pickerIt.detailType ?? pickerIt.itemType}
                    </div>
                  )}
                </div>
              </div>
              </LegendaryItemPopover>
            );
          })}
        </div>
      </div>

      {/* Edge vignettes */}
      {(['left', 'right'] as const).map((side) => (
        <div
          key={side}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            [side]: 0,
            width: 80,
            background:
              side === 'left'
                ? 'linear-gradient(90deg, rgba(11,8,20,0.85) 0%, transparent 100%)'
                : 'linear-gradient(-90deg, rgba(11,8,20,0.85) 0%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
      ))}
    </div>
  );
}
