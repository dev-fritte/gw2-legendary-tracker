import { useTranslation } from "react-i18next";
import { ApiKeyForm } from "@/features/auth/ApiKeyForm";
import { Navbar } from "@/components/Navbar";
import { useApiKey } from "@/hooks/useApiKey";

// Placeholder — will be replaced with the full tracker view
function TrackerPlaceholder({ onLogout }: { onLogout: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar onLogout={onLogout} />
      <div className="flex flex-1 items-center justify-center">
        <p className="text-zinc-400">{t("tracker.authenticated")}</p>
      </div>
    </div>
  );
}

export default function App() {
  const { apiKey, setApiKey, clearApiKey, isAuthenticated } = useApiKey();

  if (!isAuthenticated || !apiKey) {
    return <ApiKeyForm onSuccess={setApiKey} />;
  }

  return <TrackerPlaceholder onLogout={clearApiKey} />;
}
