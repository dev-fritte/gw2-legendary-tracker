import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { wikiUrl } from '@/features/starterkits/starterKitUtils';

interface LegendaryItemPopoverProps {
  /** Item name — also used for the wiki link. Tooltip is suppressed when falsy. */
  name?: string;
  icon?: string;
  description?: string;
  /** GW2 item type, e.g. 'Weapon' | 'Armor' */
  itemType?: string;
  /** Weapon type for weapons, armor slot for armor — from GW2 item details */
  detailType?: string;
  /** Armor weight class (Heavy/Medium/Light/Clothing) */
  weightClass?: string;
  children: React.ReactNode;
}

/** Strip GW2 markup tags such as <br>, <c=@abilitytype>, etc. */
function stripMarkup(text: string): string {
  return text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Wraps any element with a 500 ms hover tooltip showing the legendary item's
 * icon, name, description and a wiki link.
 *
 * Requires `TooltipProvider` higher in the tree (already in `main.tsx`).
 * Pass `name={undefined}` / no name to render children without a tooltip.
 */
export function LegendaryItemPopover({
  name,
  icon,
  description,
  itemType,
  detailType,
  weightClass,
  children,
}: LegendaryItemPopoverProps) {
  const { i18n, t } = useTranslation();

  // No tooltip during loading or when item info is unavailable
  if (!name) return <>{children}</>;

  const cleanDesc = description ? stripMarkup(description) : '';

  const typeLabel =
    itemType === 'Weapon' && detailType
      ? String(t(`weapons.${detailType}`, { defaultValue: detailType }))
      : itemType === 'Armor' && (detailType || weightClass)
        ? [
            detailType && String(t(`armorSlots.${detailType}`, { defaultValue: detailType })),
            weightClass &&
              String(t(`weightClasses.${weightClass}`, { defaultValue: weightClass })),
          ]
            .filter(Boolean)
            .join(' · ')
        : '';

  return (
    <TooltipPrimitive.Root delayDuration={500}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>

      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side="right"
          align="start"
          sideOffset={4}
          collisionPadding={12}
          style={{
            background: '#1a1428',
            border: '1px solid rgba(147,73,204,0.4)',
            borderRadius: 10,
            padding: 12,
            width: 230,
            boxShadow: '0 8px 32px rgba(0,0,0,0.75)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {/* Icon + name */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            {icon && (
              <img
                src={icon}
                alt=""
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 6,
                  objectFit: 'cover',
                  border: '1px solid rgba(147,73,204,0.45)',
                  flexShrink: 0,
                }}
              />
            )}
            <span
              style={{
                fontFamily: '"Cinzel", serif',
                fontSize: 13,
                fontWeight: 600,
                color: '#e9c66b',
                lineHeight: 1.35,
                paddingTop: icon ? 2 : 0,
              }}
            >
              {name}
            </span>
          </div>

          {/* Type label */}
          {typeLabel && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: '#9349CC',
              }}
            >
              {typeLabel}
            </span>
          )}

          {/* Description */}
          {cleanDesc && (
            <p
              style={{
                fontSize: 11,
                color: '#a89cc0',
                margin: 0,
                lineHeight: 1.55,
              }}
            >
              {cleanDesc}
            </p>
          )}

          {/* Wiki link */}
          <a
            href={wikiUrl(name, i18n.language)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              color: '#9349CC',
              textDecoration: 'none',
            }}
          >
            <ExternalLink style={{ width: 11, height: 11 }} />
            {t('starterKits.openWiki')}
          </a>

          <TooltipPrimitive.Arrow style={{ fill: '#1a1428' }} />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
