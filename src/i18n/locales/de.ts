export default {
  nav: {
    logout: "Abmelden",
    language: "Sprache",
  },
  auth: {
    title: "Legendary Tracker",
    subtitle: "Guild Wars 2 — Legendärer Fortschritts-Analyzer",
    cardTitle: "Konto verbinden",
    cardDescription:
      "Gib deinen GW2-API-Schlüssel ein, um deine legendären Waffenmöglichkeiten zu analysieren.",
    apiKeyLabel: "API-Schlüssel",
    apiKeyPlaceholder: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX-XXXX-…",
    connectButton: "Konto verbinden",
    validating: "Wird überprüft…",
    permissionsTitle: "Benötigte API-Schlüssel-Berechtigungen",
    generateKey: "API-Schlüssel auf Arena.net generieren",
    privacyNote:
      "Dein API-Schlüssel wird lokal in deinem Browser gespeichert und nie an Dritte übermittelt.",
    errors: {
      invalidKey:
        "Ungültiger API-Schlüssel. Stelle sicher, dass er die Berechtigungen 'account' und 'characters' besitzt.",
      timeout: "Verbindung unterbrochen. Bitte überprüfe deine Internetverbindung.",
      unexpected: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.",
    },
  },
  characters: {
    title: "Charaktere auswählen",
    description:
      "Wähle aus, welche Charaktere in die Analyse der legendären Waffen einbezogen werden sollen.",
    loadingCharacters: "Charaktere werden geladen…",
    loadingDetails: "Charakterdetails werden geladen…",
    selectAll: "Alle auswählen",
    deselectAll: "Alle abwählen",
    selected: "{{count}} von {{total}} ausgewählt",
    analyzeButton: "Analysieren ({{count}})",
    analyzeButtonDisabled: "Mindestens einen Charakter auswählen",
    level: "Stufe {{level}}",
    errorTitle: "Charaktere konnten nicht geladen werden",
    errorRetry: "Erneut versuchen",
    noCharacters: "Keine Charaktere auf diesem Konto gefunden.",
    fetchingCharacter: "{{name}} wird geladen…",
    partialError: "{{count}} Charakter(e) konnten nicht geladen werden und wurden übersprungen.",
    sortBy: "Sortieren nach",
    sortPlaytime: "Spielzeit",
    sortProfession: "Klasse",
    sortAlphabetical: "Alphabetisch",
  },
  tracker: {
    backToSelection: "Zurück zur Auswahl",
  },
} as const;
