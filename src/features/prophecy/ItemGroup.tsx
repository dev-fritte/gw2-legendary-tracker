import type { TFunction } from 'i18next';
import { GENERATION_TINT } from './useAllLegendaryItems';
import type { LegendaryPickerItem } from './useAllLegendaryItems';
import { getSubLabel } from './prophecyHelpers';
import { GOLD, PURPLE, PURPLE_DEEP } from './prophecyTypes';
import type { RoadmapUsage } from './ProphecyPicker';
import { Tooltip } from '@/components/ui/tooltip';
import { LegendaryItemPopover } from '@/components/ui/LegendaryItemPopover';

interface ItemGroupProps {
  items: LegendaryPickerItem[];
  currentItem: number | null;
  onPick: (id: number) => void;
  t: TFunction;
  kitChosenWeaponTypes: Set<string>;
  usedInRoadmap: RoadmapUsage;
  unlockedItemIds: Set<number>;
  showGenLabel?: boolean;
}

export function ItemGroup({
  items,
  currentItem,
  onPick,
  t,
  kitChosenWeaponTypes,
  usedInRoadmap,
  unlockedItemIds,
  showGenLabel,
}: Readonly<ItemGroupProps>) {
  if (items.length === 0) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
      {items.map((it) => {
        const isCurrent = currentItem === it.id;
        const isOwned = unlockedItemIds.has(it.id);
        const tint = GENERATION_TINT[it.generation];
        const subLabel = getSubLabel(it, t);

        // Only mark Gen1 weapons the user has explicitly chosen in their starter kits
        const isStarterKit =
          it.generation === 'gen1' && !!it.detailType && kitChosenWeaponTypes.has(it.detailType);

        const isRoadmapDone = usedInRoadmap.done.has(it.id);
        const isRoadmapPlanned = !isRoadmapDone && usedInRoadmap.planned.has(it.id);

        return (
          <LegendaryItemPopover
            key={it.id}
            name={it.name}
            icon={it.icon}
            description={it.description}
            itemType={it.itemType}
            detailType={it.detailType}
            weightClass={it.weightClass}
          >
          <button
            onClick={() => onPick(it.id)}
            style={{
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
              transition: 'border-color 0.15s, background 0.15s, opacity 0.15s',
              minWidth: 0,
              opacity: isOwned && !isCurrent ? 0.45 : 1,
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
            {/* Icon — wrapped in relative container so the kit badge sits outside
                the overflow:hidden box */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 6,
                  background: it.icon
                    ? '#0b0814'
                    : `radial-gradient(circle at 30% 30%, ${tint}90, ${PURPLE_DEEP})`,
                  border: isStarterKit ? `1px solid ${GOLD}99` : `1px solid ${tint}66`,
                  boxShadow: isStarterKit ? `0 0 10px ${GOLD}55` : `0 0 8px ${tint}33`,
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

              {/* Gold pip — only for Starter Kit weapons */}
              {isStarterKit && (
                <Tooltip content={t('picker.starterKitHint')} side="top">
                  <div
                    style={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      width: 15,
                      height: 15,
                      borderRadius: '50%',
                      background: GOLD,
                      border: '1.5px solid #0b0814',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 8,
                      lineHeight: 1,
                      color: '#1a1000',
                      fontWeight: 900,
                      cursor: 'default',
                    }}
                  >
                    ⚒
                  </div>
                </Tooltip>
              )}

              {/* Roadmap badge — top-left; green = done, purple = planned */}
              {(isRoadmapDone || isRoadmapPlanned) && (
                <Tooltip
                  content={isRoadmapDone ? t('picker.roadmapDone') : t('picker.roadmapPlanned')}
                  side="top"
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: -5,
                      left: -5,
                      width: 15,
                      height: 15,
                      borderRadius: '50%',
                      background: isRoadmapDone ? '#16a34a' : PURPLE,
                      border: '1.5px solid #0b0814',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 8,
                      lineHeight: 1,
                      color: '#fff',
                      fontWeight: 900,
                      cursor: 'default',
                    }}
                  >
                    {isRoadmapDone ? '✓' : '◆'}
                  </div>
                </Tooltip>
              )}
            </div>

            {/* Text */}
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
                  ? `${String(t(`overview.${it.generation}`))} · ${subLabel || it.itemType}`
                  : subLabel || it.itemType}
              </div>
            </div>

            {isCurrent && <span style={{ color: PURPLE, fontSize: 16, flexShrink: 0 }}>✓</span>}
          </button>
          </LegendaryItemPopover>
        );
      })}
    </div>
  );
}
