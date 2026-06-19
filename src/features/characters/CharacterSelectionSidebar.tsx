import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUpDown, Check, ChevronDown, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CharacterCard, CharacterCardSkeleton } from './CharacterCard';
import { useCharacters } from '@/hooks/useCharacters';
import { storage } from '@/services/storage';
import { getProfessionMeta } from '@/utils/professions';
import { cn } from '@/utils/cn';
import type { Character } from '@/types/gw2-api';

type SortKey = 'playtime' | 'profession' | 'alphabetical';

function sortCharacters(chars: Character[], key: SortKey): Character[] {
  return chars.slice().sort((a, b) => {
    switch (key) {
      case 'playtime':
        return b.age - a.age;
      case 'profession':
        return a.profession.localeCompare(b.profession) || b.age - a.age;
      case 'alphabetical':
        return a.name.localeCompare(b.name);
    }
  });
}

interface CharacterSelectionSidebarProps {
  apiKey: string;
  onSelectionChange: (characters: Character[]) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export function CharacterSelectionSidebar({
  apiKey,
  onSelectionChange,
  onLoadingChange,
}: Readonly<CharacterSelectionSidebarProps>) {
  const { t } = useTranslation();

  const charactersQuery = useCharacters(apiKey);

  const [sortKey, setSortKey] = useState<SortKey>('playtime');
  const characters = useMemo(
    () => sortCharacters(charactersQuery.data ?? [], sortKey),
    [charactersQuery.data, sortKey]
  );

  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(storage.getSelectedCharacters())
  );

  useEffect(() => {
    storage.setSelectedCharacters([...selected]);
  }, [selected]);

  useEffect(() => {
    if (characters.length > 0 && storage.getSelectedCharacters().length === 0) {
      if (characters.length < 20) {
        setSelected(new Set(characters.map((c) => c.name)));
      }
    }
  }, [characters]);

  const selectedCharacters = useMemo(
    () => characters.filter((c) => selected.has(c.name)),
    [characters, selected]
  );

  useEffect(() => {
    onSelectionChange(selectedCharacters);
  }, [selectedCharacters, onSelectionChange]);

  const toggle = useCallback((name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const allSelected = characters.length > 0 && characters.every((c) => selected.has(c.name));
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(characters.map((c) => c.name)));

  // ── Quick-select panel ─────────────────────────────────────────
  const [quickSelectOpen, setQuickSelectOpen] = useState(false);

  const [minHours, setMinHours] = useState<number>(() => storage.getMinPlaytimeHours());
  const sliderRef = useRef<HTMLInputElement>(null);
  const sliderDisplayRef = useRef<HTMLSpanElement>(null);
  const [topNInput, setTopNInput] = useState<string>('');

  const sliderMax = useMemo(() => {
    if (characters.length === 0) return 500;
    const maxH = Math.max(...characters.map((c) => c.age / 3600));
    return Math.max(100, Math.ceil(maxH / 50) * 50);
  }, [characters]);

  useEffect(() => {
    if (!sliderRef.current) return;
    const clamped = Math.min(minHours, sliderMax);
    sliderRef.current.value = String(clamped);
    const pct = (clamped / sliderMax) * 100;
    sliderRef.current.style.background = `linear-gradient(to right, rgba(147,73,204,0.7) ${pct}%, rgba(147,73,204,0.2) ${pct}%)`;
    if (sliderDisplayRef.current) sliderDisplayRef.current.textContent = `${clamped} h`;
  }, [sliderMax]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSliderInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    const pct = (val / sliderMax) * 100;
    e.target.style.background = `linear-gradient(to right, rgba(147,73,204,0.7) ${pct}%, rgba(147,73,204,0.2) ${pct}%)`;
    if (sliderDisplayRef.current) sliderDisplayRef.current.textContent = `${val} h`;
  };

  const handleSliderPointerUp = () => {
    if (!sliderRef.current) return;
    setMinHours(Number(sliderRef.current.value));
  };

  const applyPlaytimeFilter = () => {
    const val = sliderRef.current ? Number(sliderRef.current.value) : minHours;
    storage.setMinPlaytimeHours(val);
    const minSeconds = val * 3600;
    setSelected(new Set(characters.filter((c) => c.age >= minSeconds).map((c) => c.name)));
  };

  const applyTopN = () => {
    const n = parseInt(topNInput);
    if (isNaN(n) || n <= 0) return;
    const sorted = [...characters].sort((a, b) => b.age - a.age);
    setSelected(new Set(sorted.slice(0, n).map((c) => c.name)));
  };

  const applyLevel80Only = () => {
    setSelected(new Set(characters.filter((c) => c.level === 80).map((c) => c.name)));
  };

  const quickSelectButtonStyle: React.CSSProperties = {
    padding: '3px 10px',
    borderRadius: 4,
    border: '1px solid rgba(147,73,204,0.35)',
    background: 'rgba(147,73,204,0.15)',
    color: '#c8a0f0',
    fontSize: 11,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  };

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'playtime', label: t('characters.sortPlaytime') },
    { key: 'profession', label: t('characters.sortProfession') },
    { key: 'alphabetical', label: t('characters.sortAlphabetical') },
  ];

  const isLoading = charactersQuery.isPending;

  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  return (
    <div className="flex flex-col gap-3">
      {/* Section header */}
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#5a5468',
        }}
      >
        {t('characters.pageTitle')}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <CharacterCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Toolbar + list */}
      {!isLoading && characters.length > 0 && (
        <>
          {/* Toolbar */}
          <div
            style={{
              border: '1px solid rgba(147,73,204,0.18)',
              background: 'rgba(20,16,28,0.8)',
              borderRadius: 8,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleAll}
                disabled={characters.length === 0}
              />
              <span className="text-xs select-none" style={{ color: '#a89cc0' }}>
                <span style={{ color: '#e8e4f0', fontWeight: 600 }}>{selectedCharacters.length}</span>
                {' / '}
                {characters.length}
              </span>
            </label>

            <div className="flex items-center gap-1.5">
              {/* Quick-select toggle */}
              <button
                onClick={() => setQuickSelectOpen((v) => !v)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 8px',
                  borderRadius: 4,
                  border: quickSelectOpen
                    ? '1px solid rgba(147,73,204,0.55)'
                    : '1px solid rgba(147,73,204,0.28)',
                  background: quickSelectOpen
                    ? 'rgba(147,73,204,0.18)'
                    : 'rgba(147,73,204,0.08)',
                  color: quickSelectOpen ? '#c8a0f0' : '#9d93b0',
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                <Zap className="w-3 h-3" />
                <ChevronDown
                  className="w-3 h-3"
                  style={{
                    transition: 'transform 0.2s',
                    transform: quickSelectOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>

              {/* Sort dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 gap-1 text-xs px-2">
                    <ArrowUpDown className="w-3 h-3" />
                    {SORT_OPTIONS.find((o) => o.key === sortKey)?.label}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuLabel>{t('characters.sortBy')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {SORT_OPTIONS.map(({ key, label }) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => setSortKey(key)}
                      className={cn(
                        'cursor-pointer',
                        sortKey === key && 'text-[#9349CC] focus:text-[#b06de0]'
                      )}
                    >
                      {label}
                      {sortKey === key && <Check className="ml-auto w-3.5 h-3.5" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Quick-select panel */}
          {quickSelectOpen && (
            <div
              style={{
                border: '1px solid rgba(147,73,204,0.22)',
                background: 'rgba(15,11,22,0.85)',
                borderRadius: 8,
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#5a5468',
                }}
              >
                {t('characters.quickSelect')}
              </span>

              {/* Level 80 only */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs" style={{ color: '#c8bee0', fontWeight: 500 }}>
                    {t('characters.onlyMaxLevel')}
                  </p>
                  <p style={{ fontSize: 10, color: '#5a5468' }}>
                    {t('characters.onlyMaxLevelHint')}
                  </p>
                </div>
                <button onClick={applyLevel80Only} style={quickSelectButtonStyle}>
                  {t('characters.topNApply')}
                </button>
              </div>

              <div style={{ height: 1, background: 'rgba(147,73,204,0.1)' }} />

              {/* Top N */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs" style={{ color: '#c8bee0', fontWeight: 500 }}>
                    {t('characters.topN')}
                  </p>
                  <p style={{ fontSize: 10, color: '#5a5468' }}>{t('characters.topNHint')}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={topNInput}
                    onChange={(e) => setTopNInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyTopN()}
                    placeholder="5"
                    style={{
                      width: 48,
                      padding: '2px 4px',
                      background: 'rgba(147,73,204,0.08)',
                      border: '1px solid rgba(147,73,204,0.25)',
                      borderRadius: 4,
                      color: '#e8e4f0',
                      fontSize: 12,
                      textAlign: 'center',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={applyTopN}
                    disabled={topNInput === '' || isNaN(parseInt(topNInput)) || parseInt(topNInput) <= 0}
                    style={{
                      ...quickSelectButtonStyle,
                      opacity:
                        topNInput !== '' && !isNaN(parseInt(topNInput)) && parseInt(topNInput) > 0
                          ? 1
                          : 0.4,
                      cursor:
                        topNInput !== '' && !isNaN(parseInt(topNInput)) && parseInt(topNInput) > 0
                          ? 'pointer'
                          : 'not-allowed',
                    }}
                  >
                    {t('characters.topNApply')}
                  </button>
                </div>
              </div>

              <div style={{ height: 1, background: 'rgba(147,73,204,0.1)' }} />

              {/* Min playtime */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs" style={{ color: '#c8bee0', fontWeight: 500 }}>
                      {t('characters.minPlaytimeLabel')}
                    </p>
                    <p style={{ fontSize: 10, color: '#5a5468' }}>
                      {t('characters.minPlaytimeHint', { hours: minHours })}
                    </p>
                  </div>
                  <button onClick={applyPlaytimeFilter} style={quickSelectButtonStyle}>
                    {t('characters.minPlaytimeApply')}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={sliderRef}
                    type="range"
                    min={0}
                    max={sliderMax}
                    step={1}
                    defaultValue={Math.min(minHours, sliderMax)}
                    onChange={handleSliderInput}
                    onPointerUp={handleSliderPointerUp}
                    className="playtime-slider"
                    style={{
                      background: `linear-gradient(to right, rgba(147,73,204,0.7) ${(Math.min(minHours, sliderMax) / sliderMax) * 100}%, rgba(147,73,204,0.2) ${(Math.min(minHours, sliderMax) / sliderMax) * 100}%)`,
                    }}
                  />
                  <span
                    ref={sliderDisplayRef}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#c8a0f0',
                      minWidth: 44,
                      textAlign: 'right',
                      flexShrink: 0,
                    }}
                  >
                    {Math.min(minHours, sliderMax)} h
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Character list */}
          {sortKey === 'profession' ? (
            <ProfessionGroupedList characters={characters} selected={selected} onToggle={toggle} />
          ) : (
            <div className="space-y-2">
              {characters.map((char) => (
                <CharacterCard
                  key={char.name}
                  character={char}
                  selected={selected.has(char.name)}
                  onToggle={toggle}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!isLoading && charactersQuery.isSuccess && characters.length === 0 && (
        <div className="text-center py-8" style={{ color: '#5a5468' }}>
          <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-xs">{t('characters.noCharacters')}</p>
        </div>
      )}
    </div>
  );
}

function ProfessionGroupedList({
  characters,
  selected,
  onToggle,
}: Readonly<{
  characters: Character[];
  selected: Set<string>;
  onToggle: (name: string) => void;
}>) {
  const groups = characters.reduce<Map<string, Character[]>>((acc, char) => {
    const list = acc.get(char.profession) ?? [];
    list.push(char);
    acc.set(char.profession, list);
    return acc;
  }, new Map());

  return (
    <div className="space-y-4">
      {[...groups.entries()].map(([profession, chars]) => {
        const meta = getProfessionMeta(profession);
        return (
          <div key={profession} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={cn('text-xs font-semibold uppercase tracking-wider', meta.color)}>
                {meta.label}
              </span>
              <span className="text-xs" style={{ color: '#5a5468' }}>
                ({chars.length})
              </span>
              <div className="flex-1 h-px" style={{ background: 'rgba(147,73,204,0.12)' }} />
            </div>
            {chars.map((char) => (
              <CharacterCard
                key={char.name}
                character={char}
                selected={selected.has(char.name)}
                onToggle={onToggle}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
