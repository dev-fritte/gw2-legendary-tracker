import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'lucide-react';
import type { WeaponCardInfo } from '@/hooks/useGen1WeaponCards.ts';
import type { WeaponType } from '@/types/gw2-api';
import { CARD_STYLES, getCardVariant } from './starterKitStyles';
import { wikiUrl } from './starterKitUtils';

interface WeaponCardProps {
  weaponType: WeaponType;
  cardInfo: WeaponCardInfo | undefined;
  isSelected: boolean;
  isItemOwned: boolean;
  isPartiallyCovered: boolean;
  isTypeCovered: boolean;
  onSelect: () => void;
}

export function WeaponCard({
  weaponType,
  cardInfo,
  isSelected,
  isItemOwned,
  isPartiallyCovered,
  isTypeCovered,
  onSelect,
}: WeaponCardProps) {
  const { t, i18n } = useTranslation();
  const variant = getCardVariant(isSelected, isItemOwned, isPartiallyCovered, isTypeCovered);
  const styles = CARD_STYLES[variant];

  return (
    <div
      onClick={onSelect}
      style={{
        flex: '1 1 0',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: 8,
        borderRadius: 8,
        cursor: 'pointer',
        border: `1.5px solid ${styles.borderColor}`,
        background: styles.bgColor,
        transition: 'all 0.15s',
        boxShadow: styles.boxShadow,
      }}
      onMouseEnter={(e) => {
        if (!isSelected)
          (e.currentTarget as HTMLDivElement).style.borderColor = styles.hoverBorderColor;
      }}
      onMouseLeave={(e) => {
        if (!isSelected)
          (e.currentTarget as HTMLDivElement).style.borderColor = styles.borderColor;
      }}
    >
      {/* Icon with status badge + wiki link */}
      <div style={{ position: 'relative', aspectRatio: '1', width: '100%' }}>
        {cardInfo ? (
          <>
            <img
              src={cardInfo.icon}
              alt={cardInfo.name}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 5,
                objectFit: 'cover',
                display: 'block',
                filter: styles.imgFilter,
                transition: 'filter 0.15s',
              }}
            />

            {/* Armory status badge — top-left */}
            {(isItemOwned || isPartiallyCovered || isTypeCovered) && (
              <div
                title={
                  isItemOwned
                    ? t('starterKits.ownedInArmory')
                    : isPartiallyCovered
                      ? t('starterKits.partiallyOwned')
                      : t('starterKits.typeCovered')
                }
                style={{
                  position: 'absolute',
                  top: 3,
                  left: 3,
                  width: 16,
                  height: 16,
                  borderRadius: 3,
                  background: isItemOwned
                    ? 'rgba(22,163,74,0.85)'
                    : isPartiallyCovered
                      ? 'rgba(14,165,233,0.85)'
                      : 'rgba(180,130,0,0.85)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#fff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
                }}
              >
                {isItemOwned ? '✓' : isPartiallyCovered ? '½' : '~'}
              </div>
            )}

            {/* Wiki link — bottom-right */}
            <a
              href={wikiUrl(cardInfo.name, i18n.language)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title={t('starterKits.openWiki')}
              style={{
                position: 'absolute',
                bottom: 3,
                right: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 22,
                height: 22,
                borderRadius: 4,
                background: 'rgba(0,0,0,0.65)',
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
              }}
            >
              <ExternalLink style={{ width: 12, height: 12 }} />
            </a>
          </>
        ) : (
          <div
            className="animate-pulse"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 5,
              background: 'rgba(147,73,204,0.08)',
            }}
          />
        )}
      </div>

      {/* Text */}
      <div>
        <p
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: styles.nameColor,
            margin: 0,
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={cardInfo?.name}
        >
          {cardInfo ? cardInfo.name : '…'}
        </p>
        <p
          style={{
            fontSize: 9,
            color: styles.typeColor,
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontWeight: 700,
          }}
        >
          {t(`weapons.${weaponType}`)}
        </p>
      </div>
    </div>
  );
}
