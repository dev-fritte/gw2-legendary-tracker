import { useQuery } from "@tanstack/react-query";
import { getApiClient } from "@/services/apiClient";
import type { Character } from "@/types/gw2-api";

// Step 1: fetch the list of character names
export function useCharacterNames(apiKey: string) {
  return useQuery({
    queryKey: ["characterNames", apiKey],
    queryFn: () => getApiClient(apiKey).getCharacterNames(),
    staleTime: 5 * 60 * 1000,
  });
}

// Step 2: fetch full details for all characters in parallel
// Enabled only once we have the names list.
export function useCharacterDetails(apiKey: string, names: string[], enabled: boolean) {
  return useQuery({
    queryKey: ["characterDetails", apiKey, names],
    queryFn: () => getApiClient(apiKey).getCharacters(names),
    enabled: enabled && names.length > 0,
    staleTime: 5 * 60 * 1000,
    // Keep previous data while re-fetching so the UI doesn't flash
    placeholderData: (prev: Character[] | undefined) => prev,
  });
}
