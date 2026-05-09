export default {
  nav: {
    logout: "Log out",
    language: "Language",
  },
  auth: {
    title: "Legendary Tracker",
    subtitle: "Guild Wars 2 — Legendary Progress Analyzer",
    cardTitle: "Connect your Account",
    cardDescription:
      "Enter your GW2 API key to analyze your legendary weapon opportunities.",
    apiKeyLabel: "API Key",
    apiKeyPlaceholder: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX-XXXX-…",
    connectButton: "Connect Account",
    validating: "Validating…",
    permissionsTitle: "Required API Key Permissions",
    generateKey: "Generate API Key on Arena.net",
    privacyNote:
      "Your API key is stored locally in your browser and never sent to any third-party server.",
    errors: {
      invalidKey:
        "Invalid API key. Make sure it has account & characters permissions.",
      timeout:
        "Connection timed out. Please check your internet connection.",
      unexpected: "An unexpected error occurred. Please try again.",
    },
  },
  tracker: {
    authenticated: "Authenticated — Character selection & tracker coming next.",
    logout: "Log out",
  },
} as const;
