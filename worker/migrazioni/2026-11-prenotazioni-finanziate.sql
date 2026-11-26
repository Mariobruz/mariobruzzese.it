-- Richieste di adesione ai corsi di formazione finanziata (nessun pagamento)
CREATE TABLE IF NOT EXISTS prenotazioni_finanziate (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  riferimento       TEXT UNIQUE,                 -- PF-AAAA-NNNN
  creato_il         TEXT NOT NULL,
  stato             TEXT NOT NULL DEFAULT 'nuova', -- nuova | contattata | adesione_verificata | nel_piano | non_idonea | annullata
  ragione_sociale   TEXT NOT NULL,
  partita_iva       TEXT NOT NULL,
  email             TEXT NOT NULL,
  azienda           TEXT NOT NULL,               -- JSON con tutti i dati aziendali
  corsi             TEXT NOT NULL,               -- JSON [{id, titolo, ore, tema, partecipanti}]
  partecipanti_tot  INTEGER NOT NULL,
  campagna          TEXT,
  note_admin        TEXT
);
CREATE INDEX IF NOT EXISTS idx_prenotazioni_stato ON prenotazioni_finanziate (stato);
CREATE INDEX IF NOT EXISTS idx_prenotazioni_piva ON prenotazioni_finanziate (partita_iva);
