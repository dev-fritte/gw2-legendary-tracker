import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { NavSection } from '@/components/Navbar';
import { Navbar } from '@/components/Navbar';
import { useAllLegendaryItems } from './useAllLegendaryItems';
import { useRoadmap } from './useRoadmap';
import { ConstellationPath } from './ConstellationPath';
import { ChronicleCard } from './ChronicleCard';
import { ProphecyPicker } from './ProphecyPicker';
import { GOLD, PURPLE, STEP_W } from './prophecyTypes';

// ─────────────────────────────────────────────────────────────────────────────
// Page
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

  // Scroll sync between ConstellationPath and Chronicle
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

  // On mount, scroll to the last completed (or first active) step
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
        steps.findIndex((s) => !s.done && s.item),
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
        {/* ── Header ── */}
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
              style={{ fontSize: 10, letterSpacing: 3, color: PURPLE, fontWeight: 600, marginBottom: 6 }}
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
            <p style={{ color: '#a89cc0', fontSize: 13, margin: '8px 0 0', maxWidth: 640, lineHeight: 1.6 }}>
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

        {/* ── Stats strip ── */}
        <div
          style={{ marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}
        >
          {(
            [
              { label: t('prophecy.stats.done'),    value: doneCount,             glyph: '✓', color: GOLD,   isText: false },
              { label: t('prophecy.stats.planned'),  value: plannedCount,          glyph: '◆', color: PURPLE, isText: false },
              { label: t('prophecy.stats.next'),     value: nextStep?.item ?? '—', glyph: '✦', color: PURPLE, isText: true  },
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
                  style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: '#8e8a9a' }}
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

        {/* ── Constellation path ── */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ marginBottom: 10 }}>
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

        {/* ── Chronicle ── */}
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

      {/* ── Picker modal ── */}
      {pickerStep != null && (
        <ProphecyPicker
          allItems={allItems}
          currentItem={pickerStep.item}
          usedInRoadmap={{
            done: new Set(
              steps
                .filter((s) => s.id !== pickerStep.id && s.done && s.item)
                .map((s) => s.item as string),
            ),
            planned: new Set(
              steps
                .filter((s) => s.id !== pickerStep.id && !s.done && s.item)
                .map((s) => s.item as string),
            ),
          }}
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
