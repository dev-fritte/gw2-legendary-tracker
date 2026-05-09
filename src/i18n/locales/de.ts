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
      timeout:
        "Verbindung unterbrochen. Bitte überprüfe deine Internetverbindung.",
      unexpected: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.",
    },
  },
  tracker: {
    authenticated: "Authentifiziert — Charakterauswahl & Tracker folgt.",
    logout: "Abmelden",
  },
} as const;
