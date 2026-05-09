import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { KeyRound, Loader2, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getApiClient, InvalidApiKeyError, ApiTimeoutError } from "@/services/apiClient";
import { Navbar } from "@/components/Navbar";

interface ApiKeyFormProps {
  onSuccess: (apiKey: string) => void;
  onLogout?: () => void;
  isAuthenticated?: boolean;
}

export function ApiKeyForm({ onSuccess, onLogout, isAuthenticated = false }: ApiKeyFormProps) {
  const { t } = useTranslation();
  const [inputKey, setInputKey] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateMutation = useMutation({
    mutationFn: async (key: string) => {
      const client = getApiClient(key);
      return client.validateApiKey();
    },
    onSuccess: () => {
      setErrorMessage(null);
      onSuccess(inputKey.trim());
    },
    onError: (error: unknown) => {
      if (error instanceof InvalidApiKeyError) {
        setErrorMessage(t("auth.errors.invalidKey"));
      } else if (error instanceof ApiTimeoutError) {
        setErrorMessage(t("auth.errors.timeout"));
      } else {
        setErrorMessage(t("auth.errors.unexpected"));
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputKey.trim();
    if (!trimmed) return;
    setErrorMessage(null);
    validateMutation.mutate(trimmed);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {isAuthenticated && onLogout && <Navbar onLogout={onLogout} />}

      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-amber-600/20 flex items-center justify-center border border-amber-600/30">
                  <KeyRound className="w-8 h-8 text-amber-400" />
                </div>
                <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-xl" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
              {t("auth.title")}
            </h1>
            <p className="text-zinc-400 text-sm">{t("auth.subtitle")}</p>
          </div>

          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("auth.cardTitle")}</CardTitle>
              <CardDescription>{t("auth.cardDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">{t("auth.apiKeyLabel")}</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder={t("auth.apiKeyPlaceholder")}
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    disabled={validateMutation.isPending}
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>

                {errorMessage && (
                  <div className="flex items-start gap-2 rounded-md border border-red-800/50 bg-red-950/30 px-3 py-2.5 text-sm text-red-400">
                    <span className="mt-0.5">⚠</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!inputKey.trim() || validateMutation.isPending}
                >
                  {validateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("auth.validating")}
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      {t("auth.connectButton")}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Help section */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
              {t("auth.permissionsTitle")}
            </p>
            <ul className="text-sm text-zinc-500 space-y-1">
              {["account", "characters", "inventories", "builds"].map((perm) => (
                <li key={perm} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                  {perm}
                </li>
              ))}
            </ul>
            <a
              href="https://account.arena.net/applications"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors mt-2"
            >
              {t("auth.generateKey")}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <p className="text-center text-xs text-zinc-600">{t("auth.privacyNote")}</p>
        </div>
      </div>
    </div>
  );
}
