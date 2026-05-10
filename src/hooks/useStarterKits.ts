import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApiClient } from "@/services/apiClient";
import { STARTER_KIT_IDS, buildStarterKitMap } from "@/utils/starterKits";
import type { Character, WeaponType } from "@/types/gw2-api";

function useAccountBank(apiKey: string) {
  return useQuery({
    queryKey: ["accountBank", apiKey],
    queryFn: () => getApiClient(apiKey).getAccountBank(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useStarterKits(apiKey: string, characters: Character[]) {
  const bankQuery = useAccountBank(apiKey);

  const kitMap = useMemo((): Map<WeaponType, number> => {
    const found: number[] = [];

    // Account bank
    if (bankQuery.data) {
      for (const slot of bankQuery.data) {
        if (slot && STARTER_KIT_IDS.has(slot.id)) found.push(slot.id);
      }
    }

    // Character bags (already loaded as part of character data)
    for (const char of characters) {
      if (!char.bags) continue;
      for (const bag of char.bags) {
        if (!bag) continue;
        for (const item of bag.inventory) {
          if (item && STARTER_KIT_IDS.has(item.id)) found.push(item.id);
        }
      }
    }

    return buildStarterKitMap(found);
  }, [bankQuery.data, characters]);

  return {
    kitMap,
    isLoading: bankQuery.isPending,
  };
}
