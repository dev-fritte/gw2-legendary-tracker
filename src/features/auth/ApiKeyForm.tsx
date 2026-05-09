import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Loader2, ExternalLink } from "lucide-react";
import { getApiClient, InvalidApiKeyError, ApiTimeoutError } from "@/services/apiClient";
import { Navbar } from "@/components/Navbar";

function RuneRing({ size = 120 }: { size?: number }) {
  const dots = [0, 60, 120, 180, 240, 300].map((a) => ({
    x: 32 + 28 * Math.cos((a * Math.PI) / 180),
    y: 32 + 28 * Math.sin((a * Math.PI) / 180),
  }));
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        position: "relative",
        display: "grid",
        placeItems: "center",
        background: "radial-gradient(circle, rgba(147,73,204,0.13) 0%, transparent 70%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -8,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(147,73,204,0.27) 0%, transparent 60%)",
          filter: "blur(8px)",
          pointerEvents: "none",
        }}
      />
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        style={{ position: "absolute", inset: 0 }}
      >
        <circle cx="32" cy="32" r="28" fill="none" stroke="#9349CC" strokeWidth="0.5" opacity="0.6" />
        <circle cx="32" cy="32" r="22" fill="none" stroke="#9349CC" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.5" />
        <circle cx="32" cy="32" r="14" fill="none" stroke="#e9c66b" strokeWidth="0.6" opacity="0.7" />
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r="1.4" fill="#9349CC" />
        ))}
      </svg>
      <div
        style={{
          width: size * 0.42,
          height: size * 0.42,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #9349CC, #5a2a7e)",
          boxShadow: "0 0 20px rgba(147,73,204,0.53), inset 0 0 8px rgba(255,255,255,0.2)",
          display: "grid",
          placeItems: "center",
          fontSize: size * 0.18,
          color: "#fff",
          fontFamily: '"Cinzel", serif',
          fontWeight: 700,
        }}
      >
        ✦
      </div>
    </div>
  );
}

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

  const canSubmit = !!inputKey.trim() && !validateMutation.isPending;

  return (
    <div style={{ minHeight: "100vh", color: "#e8e4f0", position: "relative", overflow: "hidden" }}>
      {/* Top glow */}
      <div
        style={{
          position: "absolute",
          top: -200,
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 800,
          background: "radial-gradient(circle, rgba(147,73,204,0.18) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {isAuthenticated && onLogout && <Navbar onLogout={onLogout} />}

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: isAuthenticated ? "calc(100vh - 56px)" : "100vh",
          padding: 16,
        }}
      >
        <div style={{ width: "100%", maxWidth: 480, textAlign: "center" }}>
          {/* RuneRing */}
          <div style={{ display: "grid", placeItems: "center", marginBottom: 24 }}>
            <RuneRing size={120} />
          </div>

          {/* Eyebrow */}
          <div
            style={{
              fontSize: 11,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#9349CC",
              marginBottom: 10,
              fontWeight: 500,
            }}
          >
            ✦ Tyrias Schmiedebuch ✦
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: '"Cinzel", serif',
              fontSize: 40,
              fontWeight: 600,
              margin: 0,
              letterSpacing: 1,
              background: "linear-gradient(180deg, #fff 0%, #9349CC 140%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {t("auth.title")}
          </h1>
          <p
            style={{
              color: "#8e8a9a",
              fontSize: 15,
              margin: "14px 0 36px",
              lineHeight: 1.6,
            }}
          >
            {t("auth.subtitle")}
          </p>

          {/* Form card */}
          <form
            onSubmit={handleSubmit}
            style={{
              background: "rgba(20,16,28,0.8)",
              border: "1px solid rgba(147,73,204,0.25)",
              borderRadius: 12,
              padding: 24,
              textAlign: "left",
              boxShadow: "0 0 40px rgba(147,73,204,0.08)",
            }}
          >
            <label
              style={{
                fontSize: 11,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "#a89cc0",
                fontWeight: 600,
                display: "block",
                marginBottom: 10,
              }}
            >
              {t("auth.apiKeyLabel")}
            </label>

            {/* Input row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#0b0814",
                border: "1px solid rgba(147,73,204,0.2)",
                borderRadius: 8,
                padding: "12px 14px",
                marginBottom: errorMessage ? 12 : 16,
              }}
            >
              <span style={{ color: "#9349CC", fontSize: 16, lineHeight: 1 }}>⚿</span>
              <input
                type="password"
                placeholder={t("auth.apiKeyPlaceholder")}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                disabled={validateMutation.isPending}
                autoComplete="off"
                spellCheck={false}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#e8e4f0",
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 13,
                }}
              />
            </div>

            {/* Error */}
            {errorMessage && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  borderRadius: 8,
                  border: "1px solid rgba(220,60,60,0.3)",
                  background: "rgba(220,60,60,0.08)",
                  padding: "10px 14px",
                  fontSize: 13,
                  color: "#f87171",
                  marginBottom: 16,
                }}
              >
                <span>⚠</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                width: "100%",
                padding: "14px 16px",
                border: "none",
                borderRadius: 8,
                background: canSubmit
                  ? "linear-gradient(180deg, #9349CC 0%, #5a2a7e 100%)"
                  : "rgba(147,73,204,0.25)",
                color: "#fff",
                fontFamily: '"Cinzel", serif',
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: 1,
                textTransform: "uppercase",
                cursor: canSubmit ? "pointer" : "not-allowed",
                boxShadow: canSubmit
                  ? "0 0 20px rgba(147,73,204,0.35), inset 0 1px 0 rgba(255,255,255,0.15)"
                  : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.2s",
              }}
            >
              {validateMutation.isPending ? (
                <>
                  <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
                  {t("auth.validating")}
                </>
              ) : (
                <>✦ {t("auth.connectButton")}</>
              )}
            </button>
          </form>

          {/* Permissions */}
          <div
            style={{
              marginTop: 20,
              display: "flex",
              justifyContent: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            {["account", "characters", "inventories", "builds"].map((p) => (
              <span
                key={p}
                style={{
                  fontSize: 11,
                  color: "#6a6478",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 4,
                    height: 4,
                    background: "#9349CC",
                    borderRadius: 99,
                    display: "block",
                    flexShrink: 0,
                  }}
                />
                {p}
              </span>
            ))}
          </div>

          {/* Arena.net link */}
          <div style={{ marginTop: 14 }}>
            <a
              href="https://account.arena.net/applications"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 12,
                color: "#6a6478",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color = "#9349CC")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.color = "#6a6478")
              }
            >
              {t("auth.generateKey")}
              <ExternalLink style={{ width: 12, height: 12 }} />
            </a>
          </div>

          {/* Privacy */}
          <p
            style={{
              marginTop: 24,
              fontSize: 11,
              color: "#5a5468",
              textAlign: "center",
            }}
          >
            🔒 {t("auth.privacyNote")}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
