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
  caricato_il       TEXT,           -- quando il CSV è stato caricato in piattaforma
  provenienza       TEXT,           -- etichetta della visita: google_ads, utm_source... (null = diretta/organica)
  codice_sconto     TEXT,           -- codice sconto usato (null = nessuno)
  sconto_pct        REAL,
  totale_listino    REAL,           -- totale prima dello sconto
  consulente_id     INTEGER         -- consulente a cui spetta il compenso
);

-- Database già esistente? Aggiungere la colonna una volta sola con:
--   wrangler d1 execute iscrizioni-corsi --remote --command="ALTER TABLE ordini ADD COLUMN provenienza TEXT"


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
  account_confermato INTEGER DEFAULT 0,  -- da aggiornare a mano: la piattaforma non ce lo dice
  corso_id          TEXT,               -- ordini aziendali: ogni partecipante può avere un corso diverso
  corso_titolo      TEXT,
  corso_ore         INTEGER,
  prezzo            INTEGER
);

-- Database già esistente? Aggiungere le colonne del corso per partecipante una volta sola con:
--   wrangler d1 execute iscrizioni-corsi --remote --command="ALTER TABLE partecipanti ADD COLUMN corso_id TEXT"
--   wrangler d1 execute iscrizioni-corsi --remote --command="ALTER TABLE partecipanti ADD COLUMN corso_titolo TEXT"
--   wrangler d1 execute iscrizioni-corsi --remote --command="ALTER TABLE partecipanti ADD COLUMN corso_ore INTEGER"
--   wrangler d1 execute iscrizioni-corsi --remote --command="ALTER TABLE partecipanti ADD COLUMN prezzo INTEGER"

CREATE INDEX IF NOT EXISTS idx_partecipanti_ordine ON partecipanti (ordine_id);

-- IP bloccati temporaneamente dopo troppi eventi sospetti (vedi src/sicurezza.js).
-- Database già esistente? Crearla una volta sola con:
--   npx wrangler d1 execute iscrizioni-corsi --remote --command="CREATE TABLE IF NOT EXISTS ip_bloccati (ip TEXT PRIMARY KEY, fino_a TEXT NOT NULL, motivo TEXT, creato_il TEXT)"
CREATE TABLE IF NOT EXISTS ip_bloccati (
  ip        TEXT PRIMARY KEY,
  fino_a    TEXT NOT NULL,
  motivo    TEXT,
  creato_il TEXT
);

-- Consulenti, codici sconto e compensi (vedi src/consulenti-dati.js).
CREATE TABLE IF NOT EXISTS consulenti (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  nome            TEXT NOT NULL,
  cognome         TEXT NOT NULL,
  ragione_sociale TEXT,
  piva_cf         TEXT,
  pec             TEXT,
  email           TEXT NOT NULL UNIQUE,
  telefono        TEXT,
  compenso_pct    REAL NOT NULL DEFAULT 40,
  stato           TEXT NOT NULL DEFAULT 'in_attesa_contratto',  -- in_attesa_contratto | attivo | sospeso
  note            TEXT,
  creato_il       TEXT NOT NULL
);

-- codici sconto: di un consulente (danno il compenso) o generici (solo sconto)
CREATE TABLE IF NOT EXISTS codici_sconto (
  codice        TEXT PRIMARY KEY,               -- maiuscolo, es. ROSSI-7K3
  sconto_pct    REAL NOT NULL DEFAULT 20,
  consulente_id INTEGER REFERENCES consulenti(id),
  attivo        INTEGER NOT NULL DEFAULT 1,
  descrizione   TEXT,
  creato_il     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_codici_consulente ON codici_sconto (consulente_id);

-- click sul link del consulente: solo contatori per codice e giorno, nessun dato personale
CREATE TABLE IF NOT EXISTS codici_click (
  codice TEXT NOT NULL,
  giorno TEXT NOT NULL,
  click  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (codice, giorno)
);

CREATE TABLE IF NOT EXISTS pagamenti_consulenti (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  consulente_id INTEGER NOT NULL REFERENCES consulenti(id),
  importo       REAL NOT NULL,
  pagato_il     TEXT NOT NULL,
  riferimento   TEXT,            -- es. numero della fattura del consulente
  note          TEXT,
  creato_il     TEXT NOT NULL
);

-- un compenso per ordine pagato con il codice di un consulente
CREATE TABLE IF NOT EXISTS compensi (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  ordine_id     INTEGER NOT NULL UNIQUE REFERENCES ordini(id),
  consulente_id INTEGER NOT NULL REFERENCES consulenti(id),
  codice        TEXT NOT NULL,
  incassato     REAL NOT NULL,
  compenso_pct  REAL NOT NULL,
  compenso      REAL NOT NULL,
  stato         TEXT NOT NULL DEFAULT 'maturato',  -- maturato | pagato
  maturato_il   TEXT NOT NULL,
  pagamento_id  INTEGER REFERENCES pagamenti_consulenti(id)
);
CREATE INDEX IF NOT EXISTS idx_compensi_consulente ON compensi (consulente_id, stato);

-- link di accesso all'area consulenti: si salva solo l'impronta del token
CREATE TABLE IF NOT EXISTS accessi_consulenti (
  token_hash    TEXT PRIMARY KEY,
  consulente_id INTEGER NOT NULL REFERENCES consulenti(id),
  scade_il      TEXT NOT NULL,
  usato_il      TEXT
);

-- Colonne degli ordini per i codici sconto: su un database esistente vedi migrazioni/2026-11-codici-sconto.sql
