import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight, Sparkles, Users } from 'lucide-react';
import { ProfessionIcon } from '@/components/ProfessionIcon';
import { getProfessionMeta } from '@/utils/professions';
import { cn } from '@/utils/cn';
import type { LegendaryArmorRecommendation } from '@/types/gw2-api';
import type { ArmorMode } from '@/utils/armorProperties';

const MODE_COLORS: Record<ArmorMode, { bg: string; border: string; text: string }> = {
  pve:  { bg: 'rgba(147,73,204,0.15)', border: 'rgba(147,73,204,0.4)', text: '#c8a0f0' },
  raid: { bg: 'rgba(233,198,107,0.12)', border: 'rgba(233,198,107,0.35)', text: '#e9c66b' },
  wvw:  { bg: 'rgba(80,160,80,0.12)', border: 'rgba(80,160,80,0.35)', text: '#7ec87e' },
  pvp:  { bg: 'rgba(220,80,80,0.12)', border: 'rgba(220,80,80,0.35)', text: '#e08080' },
};

const WEIGHT_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  Heavy:  { text: '#c8a0f0', bg: 'rgba(147,73,204,0.18)', border: 'rgba(147,73,204,0.4)' },
  Medium: { text: '#b0c870', bg: 'rgba(120,160,60,0.15)', border: 'rgba(120,160,60,0.35)' },
  Light:  { text: '#80c8e0', bg: 'rgba(60,140,180,0.15)', border: 'rgba(60,140,180,0.35)' },
};

interface ArmorRecommendationCardProps {
  recommendation: LegendaryArmorRecommendation;
  rank: number;
  isCovered?: boolean;
  professionIcons: Map<string, string>;
}

export function ArmorRecommendationCard({
  recommendation,
  rank,
  isCovered = false,
  professionIcons,
}: ArmorRecommendationCardProps) {
  const { t } = useTranslation();
  const { slot, weight, impact, affectedCharacters, existingLegendaryCount, hasEquippedLegendary, coveredModes, icon } = recommendation;

  const [charsExpanded, setCharsExpanded] = useState(false);
  const uniqueChars = [...new Map(affectedCharacters.map((c) => [c.name, c])).values()];
  const wc = WEIGHT_COLORS[weight] ?? WEIGHT_COLORS.Heavy;

  const slotLabel = t(`armorSlots.${slot}`, { defaultValue: slot });
  const weightLabel = t(`armorTypes.${weight}Armor`, { defaultValue: weight });

  return (
    <div
      className="rounded-lg transition-colors"
      style={{
        border: isCovered ? '1px solid rgba(147,73,204,0.12)' : '1px solid rgba(147,73,204,0.25)',
        background: 'rgba(20,16,28,0.7)',
        opacity: isCovered ? 0.65 : 1,
      }}
      onMouseEnter={(e) => {
        if (!isCovered) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(147,73,204,0.45)';
      }}
      onMouseLeave={(e) => {
        if (!isCovered) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(147,73,204,0.25)';
      }}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Rank + icon */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            {!isCovered && (
              <span className="text-xs font-bold w-5 text-center" style={{ color: '#e9c66b', fontFamily: '"Cinzel", serif' }}>
                #{rank}
              </span>
            )}
            <img
              src={icon}
              alt={slotLabel}
              className="w-12 h-12 rounded-md object-cover"
              style={{ border: '1px solid rgba(147,73,204,0.3)', background: '#14101c' }}
              loading="lazy"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1.5">
                {/* Title row: weight badge + slot name */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-xs font-semibold px-1.5 py-0.5 rounded"
                    style={{ background: wc.bg, border: `1px solid ${wc.border}`, color: wc.text }}
                  >
                    {weightLabel}
                  </span>
                  <h3 className="font-semibold leading-tight" style={{ color: '#e8e4f0' }}>
                    {slotLabel}
                  </h3>
                </div>

                {/* Status row */}
                <div className="flex flex-wrap gap-2">
                  {existingLegendaryCount > 0 && (
                    <p className="text-xs flex items-center gap-1" style={{ color: '#e9c66b' }}>
                      <Sparkles className="w-3 h-3" />
                      {t('tracker.armoryCount', { count: existingLegendaryCount })}
                    </p>
                  )}
                  {hasEquippedLegendary && existingLegendaryCount === 0 && (
                    <p className="text-xs flex items-center gap-1" style={{ color: 'rgba(233,198,107,0.7)' }}>
                      <Sparkles className="w-3 h-3" />
                      {t('tracker.weaponAlreadyLegendary')}
                    </p>
                  )}

                  {/* Mode badges */}
                  {coveredModes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {coveredModes.map((mode) => {
                        const mc = MODE_COLORS[mode];
                        return (
                          <span
                            key={mode}
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{ background: mc.bg, border: `1px solid ${mc.border}`, color: mc.text }}
                          >
                            {t(`armorModes.${mode}`, { defaultValue: mode.toUpperCase() })}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Impact badge */}
              {!isCovered && impact > 0 && (
                <div className="shrink-0">
                  <div
                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1"
                    style={{ background: 'rgba(147,73,204,0.15)', border: '1px solid rgba(147,73,204,0.35)' }}
                  >
                    <Users className="w-3.5 h-3.5" style={{ color: '#b06de0' }} />
                    <span className="text-sm font-bold" style={{ color: '#c8a0f0', fontFamily: '"Cinzel", serif' }}>
                      {t('tracker.impactLabel', { count: impact })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Characters */}
            {uniqueChars.length > 0 && (
              <div className="space-y-1.5">
                <button
                  onClick={(e) => { e.stopPropagation(); setCharsExpanded((v) => !v); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                >
                  {charsExpanded
                    ? <ChevronDown className="w-3 h-3" style={{ color: '#5a5468' }} />
                    : <ChevronRight className="w-3 h-3" style={{ color: '#5a5468' }} />}
                  <Users className="w-3 h-3" style={{ color: '#5a5468' }} />
                  <span style={{ fontSize: 11, color: '#8e8a9a' }}>
                    {uniqueChars.length} {t('tracker.affectedCharacters').toLowerCase()}
                  </span>
                  <span style={{ fontSize: 11, color: '#4a4458' }}>·</span>
                  <span style={{ fontSize: 11, color: '#5a5468' }}>
                    {t('tracker.impactLabel', { count: affectedCharacters.length })}
                  </span>
                </button>

                {charsExpanded && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {uniqueChars.map((char) => {
                      const meta = getProfessionMeta(char.profession);
                      const slotsForChar = affectedCharacters.filter((c) => c.name === char.name);
                      const nonLegendary = slotsForChar.filter((c) => !c.isLegendary).length;
                      const legendary = slotsForChar.filter((c) => c.isLegendary).length;
                      return (
                        <div
                          key={char.name}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs',
                            char.isLegendary ? 'border-zinc-700 bg-zinc-800/60' : cn(meta.bgColor, meta.borderColor),
                          )}
                        >
                          <ProfessionIcon
                            icon={professionIcons.get(char.profession)}
                            profession={char.profession}
                            className="w-3.5 h-3.5 shrink-0"
                          />
                          <span className="truncate max-w-[120px]" style={{ color: char.isLegendary ? '#6a6478' : '#c8bee0' }}>
                            {char.name}
                          </span>
                          {nonLegendary > 1 && <span style={{ color: '#6a6478' }}>×{nonLegendary}</span>}
                          {legendary > 0 && <Sparkles className="w-2.5 h-2.5" style={{ color: 'rgba(233,198,107,0.6)' }} />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
