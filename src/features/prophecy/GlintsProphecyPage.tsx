import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { NavSection } from '@/components/Navbar';
import { Navbar } from '@/components/Navbar';
import { GENERATION_ORDER, type LegendaryGeneration } from '@/utils/legendaryGenerations';
import type { LegendaryPickerItem } from './useAllLegendaryItems';
import { GENERATION_TINT, GENERATION_TO_TAB, useAllLegendaryItems } from './useAllLegendaryItems';
import { ROMAN } from './prophecyCatalog';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const PURPLE = '#9349CC';
const PURPLE_DEEP = '#5a2a7e';
const GOLD = '#e9c66b';
const STEP_W = 240;
const ROADMAP_KEY = 'lmf.roadmap.v1';

/** All picker tabs, in display order */
const PICKER_TABS = ['Waffen', 'Rüstung', 'Schmuck', 'Rückenteil', 'Runen & Sigille'] as const;
type PickerTab = (typeof PICKER_TABS)[number] | 'Sonstige';

/** The generations that belong to each picker tab, in the order they appear */
const TAB_GENERATIONS: Record<string, LegendaryGeneration[]> = {
  Waffen: ['gen1', 'gen2', 'gen3', 'standalone'],
  Rüstung: ['armor_pve', 'armor_raids', 'armor_pvp', 'armor_wvw'],
  Schmuck: ['trinket'],
  Rückenteil: ['back'],
  'Runen & Sigille': ['upgrade'],
  Sonstige: ['other'],
};

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Step {
  id: number;
  item: string | null;
  done: boolean;
  doneAt?: string;
}

type StepStatus = 'done' | 'active' | 'planned' | 'empty';

const DEMO_ROADMAP: Step[] = [
  { id: 1, item: 'Bolt', done: true, doneAt: '14. März 2026' },
  { id: 2, item: 'Aurora', done: true, doneAt: '02. Mai 2026' },
  { id: 3, item: 'Frostfang', done: false },
  { id: 4, item: 'Ad Infinitum', done: false },
  { id: 5, item: 'Twilight', done: false },
  { id: 6, item: null, done: false },
];

// ─────────────────────────────────────────────────────────────────────────────
// Roadmap state hook
// ─────────────────────────────────────────────────────────────────────────────
function useRoadmap() {
  const [steps, setSteps] = useState<Step[]>(() => {
    try {
      const raw = localStorage.getItem(ROADMAP_KEY);
      if (raw) return JSON.parse(raw) as Step[];
    } catch (e) {
      void e;
    }
    return DEMO_ROADMAP;
  });

  const persist = useCallback((next: Step[]) => {
    setSteps(next);
    try {
      localStorage.setItem(ROADMAP_KEY, JSON.stringify(next));
    } catch (e) {
      void e;
    }
  }, []);

  return {
    steps,
    setItem: (id: number, item: string) =>
      persist(steps.map((s) => (s.id === id ? { ...s, item } : s))),
    toggleDone: (id: number) =>
      persist(
        steps.map((s) => {
          if (s.id !== id) return s;
          const nowDone = !s.done;
          return {
            ...s,
            done: nowDone,
            doneAt: nowDone
              ? new Date().toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })
              : undefined,
          };
        })
      ),
    addStep: () =>
      persist([
        ...steps,
        { id: Math.max(0, ...steps.map((s) => s.id)) + 1, item: null, done: false },
      ]),
    removeStep: (id: number) => persist(steps.filter((s) => s.id !== id)),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function stepStatus(step: Step, steps: Step[]): StepStatus {
  if (step.done) return 'done';
  if (!step.item) return 'empty';
  const firstActive = steps.find((s) => !s.done && s.item);
  return firstActive?.id === step.id ? 'active' : 'planned';
}

function orbColor(status: StepStatus) {
  if (status === 'done') return { color: GOLD, deep: '#7a5b1a' };
  if (status === 'empty') return { color: '#3a2a4a', deep: '#1a1224' };
  if (status === 'active') return { color: PURPLE, deep: PURPLE_DEEP };
  return { color: '#6a4d8a', deep: '#3a2050' };
}

// ─────────────────────────────────────────────────────────────────────────────
// ProphecyOrb — visual atom, reused for all sizes
// ─────────────────────────────────────────────────────────────────────────────
interface OrbProps {
  status: StepStatus;
  tint: string;
  size?: number;
  icon?: string;
}

function ProphecyOrb({ status, tint, size = 84, icon }: OrbProps) {
  const { color, deep } = orbColor(status);
  const isEmpty = status === 'empty';
  const isDone = status === 'done';
  // For active/planned, blend the item-specific tint into the radial fill
  const fillTint = !isDone && !isEmpty ? tint : null;

  return (
    <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
      {/* Outer glow */}
      {!isEmpty && (
        <div
          style={{
            position: 'absolute',
            inset: -size * 0.3,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${color}55 0%, transparent 60%)`,
            filter: 'blur(8px)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Rune ring */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 84 84"
        style={{ position: 'absolute', inset: 0 }}
      >
        <circle
          cx="42"
          cy="42"
          r="38"
          fill="none"
          stroke={color}
          strokeOpacity={isEmpty ? 0.4 : 0.7}
          strokeWidth="0.6"
          strokeDasharray={isEmpty ? '3 3' : '0'}
        />
        <circle
          cx="42"
          cy="42"
          r="30"
          fill="none"
          stroke={color}
          strokeOpacity={isEmpty ? 0.25 : 0.5}
          strokeWidth="0.5"
          strokeDasharray="2 4"
        />
        {!isEmpty &&
          [0, 60, 120, 180, 240, 300].map((a) => (
            <circle
              key={a}
              r="1.4"
              fill={color}
              opacity="0.9"
              cx={42 + 38 * Math.cos((a * Math.PI) / 180)}
              cy={42 + 38 * Math.sin((a * Math.PI) / 180)}
            />
          ))}
      </svg>

      {/* Core */}
      <div
        style={{
          position: 'absolute',
          inset: size * 0.22,
          borderRadius: '50%',
          background: isEmpty
            ? 'transparent'
            : `radial-gradient(circle at 30% 30%, ${fillTint ? fillTint + '80' : color}, ${deep})`,
          border: isEmpty ? `1.5px dashed ${color}99` : `1px solid ${color}aa`,
          boxShadow: isEmpty
            ? 'none'
            : `0 0 ${size * 0.4}px ${color}88, inset 0 0 ${size * 0.2}px rgba(255,255,255,0.25)`,
          display: 'grid',
          placeItems: 'center',
          overflow: 'hidden',
        }}
      >
        {isDone ? (
          <span
            style={{
              fontFamily: '"Cinzel", serif',
              fontSize: size * 0.3,
              fontWeight: 700,
              color: '#fff',
              textShadow: `0 0 8px ${color}`,
            }}
          >
            ✓
          </span>
        ) : icon && !isEmpty ? (
          <img src={icon} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span
            style={{
              fontFamily: '"Cinzel", serif',
              fontSize: size * (isEmpty ? 0.5 : 0.36),
              fontWeight: 700,
              color: isEmpty ? `${color}bb` : '#fff',
              textShadow: isEmpty ? 'none' : `0 0 8px ${color}`,
            }}
          >
            {isEmpty ? '+' : '✦'}
          </span>
        )}
      </div>

      {/* Active pulse ring */}
      {status === 'active' && (
        <div
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: '50%',
            border: `1px solid ${color}88`,
            opacity: 0.6,
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ConstellationPath
// ─────────────────────────────────────────────────────────────────────────────
interface PathProps {
  steps: Step[];
  itemsByName: Map<string, LegendaryPickerItem>;
  onSlotClick: (id: number) => void;
  onToggle: (id: number) => void;
  onScrollSync: (sx: number) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

function ConstellationPath({
  steps,
  itemsByName,
  onSlotClick,
  onToggle,
  onScrollSync,
  scrollRef,
}: PathProps) {
  const H = 400;
  const innerW = Math.max(steps.length, 1) * STEP_W;
  const [scrollX, setScrollX] = useState(0);

  // Drag-to-scroll — only initiated from the background layer, not from orbs
  const handleBgMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      const startX = e.clientX;
      const startScrollLeft = scrollRef.current?.scrollLeft ?? 0;

      const onMove = (ev: MouseEvent) => {
        const walk = startX - ev.clientX;
        const next = startScrollLeft + walk;
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
          {/* Transparent drag layer — sits below orbs in DOM order so orbs still receive clicks */}
          <div
            className="prophecy-drag-bg"
            onMouseDown={handleBgMouseDown}
            style={{ position: 'absolute', inset: 0, zIndex: 0 }}
          />

          <svg
            viewBox={`0 0 ${innerW} ${H}`}
            preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, width: innerW, height: H, pointerEvents: 'none' }}
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
            const pickerIt = step.item ? itemsByName.get(step.item) : undefined;
            const tint = pickerIt ? GENERATION_TINT[pickerIt.generation] : GENERATION_TINT.other;
            const orbSize = status === 'active' ? 92 : 76;

            return (
              <div
                key={step.id}
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
                    {step.item ?? (
                      <span style={{ color: '#5a5468', fontStyle: 'italic' }}>— leer —</span>
                    )}
                  </div>
                  {pickerIt && (
                    <div style={{ fontSize: 10, color: '#6a6478', marginTop: 2 }}>
                      {pickerIt.detailType ?? pickerIt.itemType}
                    </div>
                  )}
                </div>
              </div>
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

// ─────────────────────────────────────────────────────────────────────────────
// ChronicleCard
// ─────────────────────────────────────────────────────────────────────────────
interface CardProps {
  step: Step;
  index: number;
  steps: Step[];
  itemsByName: Map<string, LegendaryPickerItem>;
  onSlotClick: (id: number) => void;
  onToggle: (id: number) => void;
  onRemove: (id: number) => void;
}

function ChronicleCard({
  step,
  index,
  steps,
  itemsByName,
  onSlotClick,
  onToggle,
  onRemove,
}: CardProps) {
  const { t } = useTranslation();
  const status = stepStatus(step, steps);
  const pickerIt = step.item ? itemsByName.get(step.item) : undefined;
  const tint = pickerIt ? GENERATION_TINT[pickerIt.generation] : GENERATION_TINT.other;
  const subLabel = pickerIt ? getSubLabel(pickerIt, t) : '';

  const statusMeta: Record<StepStatus, { label: string; color: string }> = {
    done: { label: t('prophecy.status.done'), color: GOLD },
    active: { label: t('prophecy.status.active'), color: PURPLE },
    planned: { label: t('prophecy.status.planned'), color: '#8e8a9a' },
    empty: { label: t('prophecy.status.empty'), color: '#5a5468' },
  };
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
                  {step.item}
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

// Helper outside component so it doesn't trigger re-renders
function getSubLabel(item: LegendaryPickerItem, t: (k: string, o?: object) => string): string {
  const dt = item.detailType;
  if (!dt) return '';
  switch (item.itemType) {
    case 'Weapon':
      return t(`weapons.${dt}`, { defaultValue: dt });
    case 'Armor': {
      const weight = t(`armorTypes.${dt}`, { defaultValue: dt });
      const mode =
        item.generation === 'armor_pve'
          ? 'Open World'
          : item.generation === 'armor_raids'
            ? 'Raids'
            : item.generation === 'armor_pvp'
              ? 'PvP'
              : item.generation === 'armor_wvw'
                ? 'WvW'
                : '';
      return mode ? `${weight} · ${mode}` : weight;
    }
    case 'Trinket':
      return t(`trinketTypes.${dt}`, { defaultValue: dt });
    case 'UpgradeComponent':
      return t(`upgradeTypes.${dt}`, { defaultValue: dt });
    default:
      return dt;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ProphecyPicker — modal overlay with dynamic API-backed catalog
// ─────────────────────────────────────────────────────────────────────────────
interface PickerProps {
  allItems: LegendaryPickerItem[];
  currentItem: string | null;
  onPick: (name: string) => void;
  onClose: () => void;
}

function ProphecyPicker({ allItems, currentItem, onPick, onClose }: PickerProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<PickerTab>('Waffen');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Build tab → generation → items map
  const tabMap = new Map<string, Map<LegendaryGeneration, LegendaryPickerItem[]>>();
  for (const item of allItems) {
    const tab = GENERATION_TO_TAB[item.generation] ?? 'Sonstige';
    if (!tabMap.has(tab)) tabMap.set(tab, new Map());
    const genMap = tabMap.get(tab)!;
    if (!genMap.has(item.generation)) genMap.set(item.generation, []);
    genMap.get(item.generation)!.push(item);
  }

  // Count items per tab for the tab label
  const tabCounts = new Map<string, number>();
  for (const [tab, genMap] of tabMap) {
    let n = 0;
    for (const items of genMap.values()) n += items.length;
    tabCounts.set(tab, n);
  }

  // Filtered view (query overrides tab)
  const isSearching = query.trim().length > 0;
  const searchResults = isSearching
    ? allItems.filter(
        (it) =>
          it.name.toLowerCase().includes(query.toLowerCase()) ||
          (it.detailType ?? '').toLowerCase().includes(query.toLowerCase())
      )
    : [];

  // Items grouped by generation for the active tab
  const activeGenMap =
    tabMap.get(activeTab) ?? new Map<LegendaryGeneration, LegendaryPickerItem[]>();
  const genOrder = (TAB_GENERATIONS[activeTab] ?? GENERATION_ORDER).filter((g) =>
    activeGenMap.has(g)
  );

  const allVisibleTabs = [
    ...PICKER_TABS,
    ...(tabMap.has('Sonstige') ? ['Sonstige' as const] : []),
  ] as PickerTab[];

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
        padding: 40,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 900,
          maxHeight: '90vh',
          background: '#14101c',
          border: '1px solid rgba(147,73,204,0.35)',
          borderRadius: 14,
          boxShadow: '0 20px 80px rgba(147,73,204,0.25), 0 0 0 1px rgba(147,73,204,0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
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

        {/* Tabs + search */}
        <div
          style={{
            padding: '14px 24px',
            borderBottom: '1px solid rgba(147,73,204,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1 }}>
            {allVisibleTabs.map((tab) => {
              const active = activeTab === tab && !isSearching;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setQuery('');
                  }}
                  style={{
                    padding: '7px 12px',
                    fontSize: 12,
                    fontFamily: '"Cinzel", serif',
                    letterSpacing: 0.5,
                    fontWeight: 600,
                    background: active ? `${PURPLE}26` : 'transparent',
                    color: active ? '#fff' : '#8e8a9a',
                    border: `1px solid ${active ? `${PURPLE}66` : 'rgba(147,73,204,0.15)'}`,
                    borderRadius: 6,
                    cursor: 'pointer',
                  }}
                >
                  {t(`picker.tabs.${tab}`, { defaultValue: tab })}
                  <span style={{ opacity: 0.5, marginLeft: 4, fontSize: 11 }}>
                    {tabCounts.get(tab) ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('picker.search')}
            style={{
              width: 180,
              padding: '7px 12px',
              fontSize: 12,
              background: 'rgba(11,8,20,0.8)',
              color: '#e8e4f0',
              border: '1px solid rgba(147,73,204,0.2)',
              borderRadius: 6,
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
        </div>

        {/* Item grid — grouped by generation within the active tab */}
        <div style={{ padding: '16px 24px 24px', overflowY: 'auto', flex: 1 }}>
          {isSearching ? (
            <ItemGroup
              items={searchResults}
              currentItem={currentItem}
              onPick={onPick}
              t={t}
              showGenLabel
            />
          ) : genOrder.length === 0 ? (
            <p style={{ color: '#5a5468', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
              {t('picker.noResults')}
            </p>
          ) : (
            genOrder.map((gen) => (
              <div key={gen} style={{ marginBottom: 24 }}>
                {/* Generation heading */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: PURPLE,
                    }}
                  >
                    {t(`overview.${gen}`)}
                  </span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(147,73,204,0.15)' }} />
                  <span style={{ fontSize: 11, color: '#5a5468' }}>
                    {activeGenMap.get(gen)?.length ?? 0}
                  </span>
                </div>
                <ItemGroup
                  items={activeGenMap.get(gen) ?? []}
                  currentItem={currentItem}
                  onPick={onPick}
                  t={t}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-component for the 3-column item grid within one generation group
function ItemGroup({
  items,
  currentItem,
  onPick,
  t,
  showGenLabel,
}: {
  items: LegendaryPickerItem[];
  currentItem: string | null;
  onPick: (name: string) => void;
  t: (k: string, o?: object) => string;
  showGenLabel?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8,
      }}
    >
      {items.map((it) => {
        const isCurrent = currentItem === it.name;
        const tint = GENERATION_TINT[it.generation];
        const subLabel = getSubLabel(it, t);

        return (
          <button
            key={it.id}
            onClick={() => onPick(it.name)}
            style={{
              /* Fixed height so every card is the same size regardless of name length */
              height: 72,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '0 12px',
              textAlign: 'left',
              cursor: 'pointer',
              background: isCurrent ? `${PURPLE}1f` : 'rgba(11,8,20,0.6)',
              border: `1px solid ${isCurrent ? `${PURPLE}88` : 'rgba(147,73,204,0.15)'}`,
              borderRadius: 8,
              color: '#e8e4f0',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s, background 0.15s',
              minWidth: 0,
            }}
            onMouseEnter={(e) => {
              if (!isCurrent)
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(147,73,204,0.4)';
            }}
            onMouseLeave={(e) => {
              if (!isCurrent)
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(147,73,204,0.15)';
            }}
          >
            {/* Icon — fixed square, never shrinks */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 6,
                flexShrink: 0,
                background: it.icon
                  ? '#0b0814'
                  : `radial-gradient(circle at 30% 30%, ${tint}90, ${PURPLE_DEEP})`,
                border: `1px solid ${tint}66`,
                boxShadow: `0 0 8px ${tint}33`,
                overflow: 'hidden',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              {it.icon ? (
                <img
                  src={it.icon}
                  alt={it.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: 18, color: '#fff' }}>✦</span>
              )}
            </div>

            {/* Text — clipped, never wraps */}
            <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
              <div
                style={{
                  fontFamily: '"Cinzel", serif',
                  fontSize: 12,
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {it.name}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: '#8e8a9a',
                  marginTop: 2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {showGenLabel
                  ? `${t(`overview.${it.generation}`)} · ${subLabel || it.itemType}`
                  : subLabel || it.itemType}
              </div>
            </div>

            {isCurrent && <span style={{ color: PURPLE, fontSize: 16, flexShrink: 0 }}>✓</span>}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page component
// ─────────────────────────────────────────────────────────────────────────────
interface PageProps {
  apiKey: string;
  onLogout: () => void;
  onNavigate: (section: NavSection) => void;
}

export function GlintsProphecyPage({ apiKey, onLogout, onNavigate }: PageProps) {
  const { t } = useTranslation();
  const { steps, setItem, toggleDone, addStep, removeStep } = useRoadmap();
  const { items: allItems, itemsByName } = useAllLegendaryItems(apiKey);
  const [pickerFor, setPickerFor] = useState<number | null>(null);

  // Scroll sync
  const pathScrollRef = useRef<HTMLDivElement>(null);
  const chronScrollRef = useRef<HTMLDivElement>(null);
  const syncLock = useRef(false);

  const syncTo = useCallback((ref: React.RefObject<HTMLDivElement | null>, sx: number) => {
    if (syncLock.current) return;
    const el = ref.current;
    if (!el || Math.abs(el.scrollLeft - sx) < 0.5) return;
    syncLock.current = true;
    el.scrollLeft = sx;
    requestAnimationFrame(() => {
      syncLock.current = false;
    });
  }, []);

  // Mount scroll to last completed (or first active) step
  useLayoutEffect(() => {
    let idx = -1;
    for (let i = steps.length - 1; i >= 0; i--) {
      if (steps[i].done) {
        idx = i;
        break;
      }
    }
    if (idx === -1)
      idx = Math.max(
        0,
        steps.findIndex((s) => !s.done && s.item)
      );
    const sx = Math.max(0, idx * STEP_W);
    syncLock.current = true;
    if (pathScrollRef.current) pathScrollRef.current.scrollLeft = sx;
    if (chronScrollRef.current) chronScrollRef.current.scrollLeft = sx;
    requestAnimationFrame(() => {
      syncLock.current = false;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doneCount = steps.filter((s) => s.done).length;
  const plannedCount = steps.filter((s) => !s.done && s.item).length;
  const nextStep = steps.find((s) => !s.done && s.item);
  const pickerStep = pickerFor != null ? steps.find((s) => s.id === pickerFor) : null;

  return (
    <div style={{ minHeight: '100vh', color: '#e8e4f0', position: 'relative' }}>
      <style>{`
        .prophecy-pathscroll::-webkit-scrollbar,
        .prophecy-chronscroll::-webkit-scrollbar { height: 3px; }
        .prophecy-pathscroll::-webkit-scrollbar-track,
        .prophecy-chronscroll::-webkit-scrollbar-track { background: transparent; }
        .prophecy-pathscroll::-webkit-scrollbar-thumb,
        .prophecy-chronscroll::-webkit-scrollbar-thumb {
          background: rgba(147,73,204,0.25); border-radius: 2px;
        }
        .prophecy-pathscroll::-webkit-scrollbar-thumb:hover,
        .prophecy-chronscroll::-webkit-scrollbar-thumb:hover {
          background: rgba(147,73,204,0.45);
        }
        .prophecy-drag-bg { cursor: grab; }
        .prophecy-drag-bg:active { cursor: grabbing; }
      `}</style>

      <Navbar onLogout={onLogout} activeSection="prophecy" onNavigate={onNavigate} />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 48px' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 24,
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: 3,
                color: PURPLE,
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              {t('prophecy.eyebrow')}
            </div>
            <h1
              style={{
                fontFamily: '"Cinzel", serif',
                fontSize: 34,
                fontWeight: 600,
                margin: 0,
                letterSpacing: 0.5,
                color: '#fff',
              }}
            >
              {t('prophecy.title')}
            </h1>
            <p
              style={{
                color: '#a89cc0',
                fontSize: 13,
                margin: '8px 0 0',
                maxWidth: 640,
                lineHeight: 1.6,
              }}
            >
              {t('prophecy.subtitle')}
            </p>
          </div>
          <button
            onClick={addStep}
            style={{
              padding: '10px 18px',
              fontFamily: '"Cinzel", serif',
              fontSize: 11,
              letterSpacing: 2,
              textTransform: 'uppercase',
              fontWeight: 600,
              background: PURPLE,
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: `0 0 16px ${PURPLE}55`,
            }}
          >
            {t('prophecy.addStep')}
          </button>
        </div>

        {/* Stats strip */}
        <div
          style={{
            marginBottom: 24,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
          }}
        >
          {(
            [
              {
                label: t('prophecy.stats.done'),
                value: doneCount,
                glyph: '✓',
                color: GOLD,
                isText: false,
              },
              {
                label: t('prophecy.stats.planned'),
                value: plannedCount,
                glyph: '◆',
                color: PURPLE,
                isText: false,
              },
              {
                label: t('prophecy.stats.next'),
                value: nextStep?.item ?? '—',
                glyph: '✦',
                color: PURPLE,
                isText: true,
              },
            ] as const
          ).map((stat) => (
            <div
              key={stat.label}
              style={{
                padding: 14,
                background: 'rgba(20,16,28,0.7)',
                border: `1px solid ${stat.color}33`,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: `${stat.color}1f`,
                  border: `1px solid ${stat.color}44`,
                  display: 'grid',
                  placeItems: 'center',
                  color: stat.color,
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {stat.glyph}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    color: '#8e8a9a',
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontFamily: '"Cinzel", serif',
                    fontSize: stat.isText ? 16 : 22,
                    fontWeight: 600,
                    color: '#fff',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Constellation path */}
        <div style={{ marginBottom: 8 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: 10, letterSpacing: 2.5, color: '#6a6478', fontWeight: 600 }}>
              {t('prophecy.section.path')}
            </span>
          </div>
          <ConstellationPath
            scrollRef={pathScrollRef}
            steps={steps}
            itemsByName={itemsByName}
            onSlotClick={(id) => setPickerFor(id)}
            onToggle={(id) => toggleDone(id)}
            onScrollSync={(sx) => syncTo(chronScrollRef, sx)}
          />
        </div>

        {/* Chronicle */}
        <div style={{ marginTop: 24 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 10, letterSpacing: 2.5, color: '#6a6478', fontWeight: 600 }}>
              {t('prophecy.section.chronicle')}
            </span>
            <span style={{ fontSize: 11, color: '#6a6478' }}>{t('prophecy.chronicle.hint')}</span>
          </div>
          <div
            ref={chronScrollRef}
            onScroll={(e) => syncTo(pathScrollRef, e.currentTarget.scrollLeft)}
            className="prophecy-chronscroll"
            style={{ display: 'flex', overflowX: 'auto', overflowY: 'hidden', paddingBottom: 8 }}
          >
            {steps.map((step, i) => (
              <ChronicleCard
                key={step.id}
                step={step}
                index={i}
                steps={steps}
                itemsByName={itemsByName}
                onSlotClick={(id) => setPickerFor(id)}
                onToggle={(id) => toggleDone(id)}
                onRemove={(id) => removeStep(id)}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Picker modal */}
      {pickerStep != null && (
        <ProphecyPicker
          allItems={allItems}
          currentItem={pickerStep.item}
          onPick={(name) => {
            setItem(pickerStep.id, name);
            setPickerFor(null);
          }}
          onClose={() => setPickerFor(null)}
        />
      )}
    </div>
  );
}
