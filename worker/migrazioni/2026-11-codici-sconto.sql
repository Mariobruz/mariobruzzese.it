-- Migrazione: consulenti e codici sconto. Si esegue UNA volta sola:
--   npx wrangler d1 execute iscrizioni-corsi --remote --file=migrazioni/2026-11-codici-sconto.sql

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

-- colonne degli ordini per i codici sconto
ALTER TABLE ordini ADD COLUMN codice_sconto TEXT;
ALTER TABLE ordini ADD COLUMN sconto_pct REAL;
ALTER TABLE ordini ADD COLUMN totale_listino REAL;
ALTER TABLE ordini ADD COLUMN consulente_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_ordini_consulente ON ordini (consulente_id);
CREATE INDEX IF NOT EXISTS idx_ordini_codice ON ordini (codice_sconto);
