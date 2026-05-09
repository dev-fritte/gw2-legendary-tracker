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
      timeout: "Connection timed out. Please check your internet connection.",
      unexpected: "An unexpected error occurred. Please try again.",
    },
  },
  characters: {
    title: "Select Characters",
    description:
      "Choose which characters to include in the legendary weapon analysis.",
    loadingCharacters: "Loading characters…",
    loadingDetails: "Loading character details…",
    selectAll: "Select all",
    deselectAll: "Deselect all",
    selected: "{{count}} of {{total}} selected",
    analyzeButton: "Analyze ({{count}})",
    analyzeButtonDisabled: "Select at least one character",
    level: "Level {{level}}",
    errorTitle: "Failed to load characters",
    errorRetry: "Retry",
    noCharacters: "No characters found on this account.",
    fetchingCharacter: "Loading {{name}}…",
    partialError: "{{count}} character(s) could not be loaded and were skipped.",
    sortBy: "Sort by",
    sortPlaytime: "Playtime",
    sortProfession: "Profession",
    sortAlphabetical: "Alphabetical",
  },
  tracker: {
    backToSelection: "Back to selection",
  },
} as const;
