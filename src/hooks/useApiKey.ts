import { useState, useCallback } from "react";
import { storage } from "@/services/storage";

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState<string | null>(() => storage.getApiKey());

  const setApiKey = useCallback((key: string) => {
    storage.setApiKey(key);
    setApiKeyState(key);
  }, []);

  const clearApiKey = useCallback(() => {
    storage.clearApiKey();
    setApiKeyState(null);
  }, []);

  return { apiKey, setApiKey, clearApiKey, isAuthenticated: apiKey !== null };
}
