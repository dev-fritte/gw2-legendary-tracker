import { useState, useMemo, useEffect, useRef } from 'react';
import {
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import type { LegendaryWeaponRecommendation } from '@/types/gw2-api';
import { useAllLegendaryItems } from '@/features/prophecy/useAllLegendaryItems';
import { storage } from '@/services/storage';
import { buildEntries } from './transferUtils';
import type { TransferEntry, ImportMode } from './transferTypes';

interface UseTransferEntriesResult {
  entries: TransferEntry[];
  importMode: ImportMode;
  setImportMode: (mode: ImportMode) => void;
  existingPlannedCount: number;
  isLoading: boolean;
  sensors: ReturnType<typeof useSensors>;
  handleDragEnd: (event: DragEndEvent) => void;
  deleteEntry: (id: string) => void;
  setSelected: (id: string, name: string) => void;
  handleTransfer: () => void;
}

export function useTransferEntries(
  apiKey: string,
  recommendations: LegendaryWeaponRecommendation[],
  onTransferred: () => void,
): UseTransferEntriesResult {
  const { items: allItems, isLoading } = useAllLegendaryItems(apiKey);

  const [entries, setEntries] = useState<TransferEntry[]>([]);
  const [importMode, setImportMode] = useState<ImportMode>('append');

  // Guard: initialise entries exactly once after items have loaded.
  // allItems gets a NEW array reference on every render (inline .map() in the
  // hook), so depending on it directly would reset the order after every drag.
  const initialized = useRef(false);
  useEffect(() => {
    if (!isLoading && allItems.length > 0 && !initialized.current) {
      initialized.current = true;
      setEntries(buildEntries(recommendations, allItems));
    }
  }, [isLoading, allItems, recommendations]);

  const existingPlannedCount = useMemo(
    () => storage.getRoadmap().filter((s) => s.item !== null && !s.done).length,
    [],
  );

  // Pointer: distance constraint ensures a real drag gesture (≥8 px) is
  // required, so clicking chip buttons inside the card never starts a drag.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setEntries((prev) => {
      const oldIndex = prev.findIndex((e) => e.id === active.id);
      const newIndex = prev.findIndex((e) => e.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  function deleteEntry(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function setSelected(id: string, name: string) {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, selectedName: name } : e)));
  }

  function handleTransfer() {
    const toAdd = entries.filter((e) => e.selectedName);
    if (toAdd.length === 0) return;
    const existing = storage.getRoadmap();
    const base = importMode === 'overwrite' ? existing.filter((s) => s.done) : existing;
    const maxId = base.length > 0 ? Math.max(...base.map((s) => s.id)) : 0;
    storage.setRoadmap([
      ...base,
      ...toAdd.map((e, i) => ({ id: maxId + i + 1, item: e.selectedName, done: false })),
    ]);
    onTransferred();
  }

  return {
    entries,
    importMode,
    setImportMode,
    existingPlannedCount,
    isLoading,
    sensors,
    handleDragEnd,
    deleteEntry,
    setSelected,
    handleTransfer,
  };
}
