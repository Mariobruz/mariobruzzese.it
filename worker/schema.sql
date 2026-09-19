-- Struttura del database D1 per le iscrizioni ai corsi sicurezza.
-- Si applica una volta sola:  wrangler d1 execute iscrizioni-corsi --file=schema.sql --remote

CREATE TABLE IF NOT EXISTS ordini (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  riferimento       TEXT,           -- MB-2026-0007, quello che il cliente mette in causale
  corso_id          TEXT NOT NULL,
  corso_titolo      TEXT NOT NULL,
  corso_sku         TEXT NOT NULL,  -- serve nel CSV per abbinare il corso in piattaforma
  corso_ore         INTEGER,
  prezzo_unitario   INTEGER NOT NULL,
  partecipanti_n    INTEGER NOT NULL,
  totale            INTEGER NOT NULL,
  metodo_pagamento  TEXT NOT NULL,  -- carta | bonifico
  stato             TEXT NOT NULL,  -- in_attesa_pagamento | in_attesa_bonifico | pagato | errore_pagamento | annullato
  fatturazione      TEXT NOT NULL,  -- JSON
  consensi          TEXT NOT NULL,  -- JSON: prova di cosa è stato accettato e quando
  stripe_session_id TEXT,
  creato_il         TEXT NOT NULL,
  pagato_il         TEXT,
  caricato_il       TEXT            -- quando il CSV è stato caricato in piattaforma
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ordini_riferimento ON ordini (riferimento);
CREATE INDEX IF NOT EXISTS idx_ordini_stato ON ordini (stato);

CREATE TABLE IF NOT EXISTS partecipanti (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  ordine_id         INTEGER NOT NULL REFERENCES ordini(id),
  nome              TEXT NOT NULL,
  cognome           TEXT NOT NULL,
  email             TEXT NOT NULL,
  codice_fiscale    TEXT NOT NULL,
  data_nascita      TEXT NOT NULL,
  comune_nascita    TEXT NOT NULL,
  provincia_nascita TEXT NOT NULL,
  regione_nascita   TEXT,
  sesso             TEXT,
  telefono          TEXT,
  qualifica         TEXT NOT NULL,
  account_confermato INTEGER DEFAULT 0   -- da aggiornare a mano: la piattaforma non ce lo dice
);

CREATE INDEX IF NOT EXISTS idx_partecipanti_ordine ON partecipanti (ordine_id);
