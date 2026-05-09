import { useQuery } from "@tanstack/react-query";
import { getApiClient } from "@/services/apiClient";

export function useProfessions(apiKey: string) {
  return useQuery({
    queryKey: ["professions"],
    queryFn: () => getApiClient(apiKey).getProfessions(),
    // Profession data never changes — cache indefinitely for the session
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

/** Convenience: returns a map of profession id → icon URL */
export function useProfessionIconMap(apiKey: string): Map<string, string> {
  const { data } = useProfessions(apiKey);
  if (!data) return new Map();
  return new Map(data.map((p) => [p.id, p.icon]));
}
