import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, CreditCard, Landmark, Loader2, Lock, Minus, Plus, Send, User } from 'lucide-react';
import { Button } from './ui/button';
import {
  validaCap,
  validaCodiceFiscale,
  validaDataNascita,
  validaEmail,
  validaFatturazioneElettronica,
  validaObbligatorio,
  validaPartitaIva,
  validaTelefono,
  datiDaCodiceFiscale,
} from '../lib/validazione';
import { province, regioneDiProvincia } from '../data/province';

const ENDPOINT = process.env.REACT_APP_ISCRIZIONI_URL;

const PASSI = ['Partecipanti', 'Intestazione', 'Anagrafiche', 'Riepilogo'];

const partecipanteVuoto = () => ({
  nome: '', cognome: '', codiceFiscale: '', dataNascita: '',
  comuneNascita: '', provinciaNascita: '', email: '', telefono: '', qualifica: '',
});

const fatturazioneVuota = {
  tipo: 'azienda',
  ragioneSociale: '', partitaIva: '', indirizzo: '', cap: '', citta: '', provincia: '',
  sdi: '', pec: '', referente: '', email: '', telefono: '',
  nome: '', cognome: '', codiceFiscale: '',
};

function Campo({ label, value, onChange, errore, tipo = 'text', placeholder, maiuscolo, larghezza = '' }) {
  return (
    <div className={larghezza}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        type={tipo}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(maiuscolo ? e.target.value.toUpperCase() : e.target.value)}
        className={`w-full px-4 py-2.5 rounded-lg border-2 bg-white transition-colors outline-none ${
          errore ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-black'
        }`}
      />
      {errore && <p className="text-sm text-red-600 mt-1">{errore}</p>}
    </div>
  );
}

function Selezione({ label, value, onChange, errore, opzioni, vuoto = '— seleziona —', larghezza = '' }) {
  return (
    <div className={larghezza}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2.5 rounded-lg border-2 bg-white transition-colors outline-none ${
          errore ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-black'
        }`}
      >
        <option value="">{vuoto}</option>
        {opzioni.map((o) => (
          <option key={o.valore} value={o.valore}>{o.testo}</option>
        ))}
      </select>
      {errore && <p className="text-sm text-red-600 mt-1">{errore}</p>}
    </div>
  );
}

const OPZIONI_PROVINCE = province.map((p) => ({ valore: p.sigla, testo: `${p.nome} (${p.sigla})` }));

export default function IscrizioneCorso({ corso, onIndietro }) {
  const [passo, setPasso] = useState(0);
  const [partecipanti, setPartecipanti] = useState([partecipanteVuoto()]);
  const [fatturazione, setFatturazione] = useState(fatturazioneVuota);
  const [consensi, setConsensi] = useState({ privacy: false, condizioni: false, attivazione: false, marketing: false });
  const [errori, setErrori] = useState({});
  const [invio, setInvio] = useState(false);
  const [erroreInvio, setErroreInvio] = useState(null);
  const [metodoPagamento, setMetodoPagamento] = useState('carta');
  const [esito, setEsito] = useState(null);

  const totale = useMemo(() => corso.prezzo * partecipanti.length, [corso.prezzo, partecipanti.length]);

  const aggiornaPartecipante = (indice, campo, valore) => {
    setPartecipanti((prec) => prec.map((p, i) => (i === indice ? { ...p, [campo]: valore } : p)));
    setErrori((prec) => ({ ...prec, [`p${indice}_${campo}`]: undefined }));
  };

  const aggiornaFatturazione = (campo, valore) => {
    setFatturazione((prec) => ({ ...prec, [campo]: valore }));
    setErrori((prec) => ({ ...prec, [`f_${campo}`]: undefined }));
  };

  const cambiaNumero = (delta) => {
    setPartecipanti((prec) => {
      const nuovo = Math.min(50, Math.max(1, prec.length + delta));
      if (nuovo > prec.length) return [...prec, ...Array.from({ length: nuovo - prec.length }, partecipanteVuoto)];
      return prec.slice(0, nuovo);
    });
  };

  const validaIntestazione = () => {
    const e = {};
    if (fatturazione.tipo === 'azienda') {
      e.f_ragioneSociale = validaObbligatorio(fatturazione.ragioneSociale, 'La ragione sociale');
      e.f_partitaIva = validaPartitaIva(fatturazione.partitaIva);
      e.f_referente = validaObbligatorio(fatturazione.referente, 'Il referente');
      const fe = validaFatturazioneElettronica(fatturazione.sdi, fatturazione.pec);
      if (fe) e.f_sdi = fe;
    } else {
      e.f_nome = validaObbligatorio(fatturazione.nome, 'Il nome');
      e.f_cognome = validaObbligatorio(fatturazione.cognome, 'Il cognome');
      e.f_codiceFiscale = validaCodiceFiscale(fatturazione.codiceFiscale);
    }
    e.f_indirizzo = validaObbligatorio(fatturazione.indirizzo, "L'indirizzo");
    e.f_cap = validaCap(fatturazione.cap);
    e.f_citta = validaObbligatorio(fatturazione.citta, 'La città');
    e.f_provincia = validaObbligatorio(fatturazione.provincia, 'La provincia');
    e.f_email = validaEmail(fatturazione.email);
    e.f_telefono = validaTelefono(fatturazione.telefono);
    return e;
  };

  const validaAnagrafiche = () => {
    const e = {};
    const visti = new Set();
    partecipanti.forEach((p, i) => {
      e[`p${i}_nome`] = validaObbligatorio(p.nome, 'Il nome');
      e[`p${i}_cognome`] = validaObbligatorio(p.cognome, 'Il cognome');
      e[`p${i}_codiceFiscale`] = validaCodiceFiscale(p.codiceFiscale);
      e[`p${i}_dataNascita`] = validaDataNascita(p.dataNascita);
      e[`p${i}_comuneNascita`] = validaObbligatorio(p.comuneNascita, 'Il comune di nascita');
      e[`p${i}_provinciaNascita`] = validaObbligatorio(p.provinciaNascita, 'La provincia di nascita');
      e[`p${i}_qualifica`] = validaObbligatorio(p.qualifica, 'La qualifica');
      e[`p${i}_email`] = validaEmail(p.email);

      const cf = (p.codiceFiscale || '').toUpperCase();
      if (!e[`p${i}_codiceFiscale`] && visti.has(cf)) {
        e[`p${i}_codiceFiscale`] = 'Questo codice fiscale è già stato inserito per un altro partecipante';
      }
      visti.add(cf);

      // Riscontro fra codice fiscale e data digitata: intercetta i refusi.
      const dedotti = datiDaCodiceFiscale(p.codiceFiscale);
      if (dedotti && p.dataNascita && !e[`p${i}_dataNascita`]) {
        const d = new Date(p.dataNascita);
        const stessoGiorno = d.getDate() === dedotti.giorno && d.getMonth() + 1 === dedotti.mese;
        const stessoAnno = d.getFullYear() % 100 === dedotti.annoNascita % 100;
        if (!stessoGiorno || !stessoAnno) {
          e[`p${i}_dataNascita`] = 'La data non corrisponde al codice fiscale inserito';
        }
      }
    });
    return e;
  };

  const puliti = (oggetto) => Object.fromEntries(Object.entries(oggetto).filter(([, v]) => v));

  const avanti = () => {
    let e = {};
    if (passo === 1) e = puliti(validaIntestazione());
    if (passo === 2) e = puliti(validaAnagrafiche());
    if (Object.keys(e).length) {
      setErrori(e);
      return;
    }
    setErrori({});
    setPasso((p) => Math.min(PASSI.length - 1, p + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const indietro = () => {
    if (passo === 0) return onIndietro();
    setPasso((p) => p - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const inviaEPaga = async () => {
    if (!consensi.privacy || !consensi.condizioni || !consensi.attivazione) {
      setErroreInvio('Per proseguire devi accettare le condizioni, l’informativa privacy e la richiesta di attivazione immediata.');
      return;
    }
    if (!ENDPOINT) {
      setErroreInvio('Iscrizioni non ancora attive: riprova più tardi o scrivici.');
      return;
    }
    setInvio(true);
    setErroreInvio(null);
    try {
      const risposta = await fetch(`${ENDPOINT}/iscrizioni`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          corso: { id: corso.id, titolo: corso.titolo, ore: corso.ore, prezzo: corso.prezzo },
          fatturazione: {
            ...fatturazione,
            nazione: 'Italia',
            regione: regioneDiProvincia(fatturazione.provincia),
          },
          partecipanti: partecipanti.map((p) => ({
            ...p,
            // sesso e regione non li chiediamo: stanno nel codice fiscale e nella provincia
            sesso: (datiDaCodiceFiscale(p.codiceFiscale) || {}).sesso || '',
            nazioneNascita: 'Italia',
            regioneNascita: regioneDiProvincia(p.provinciaNascita),
          })),
          consensi,
          metodoPagamento,
          totale,
        }),
      });
      if (!risposta.ok) throw new Error('richiesta rifiutata');
      const dati = await risposta.json();
      if (metodoPagamento === 'carta') {
        if (!dati.checkoutUrl) throw new Error('risposta senza link di pagamento');
        window.location.href = dati.checkoutUrl;
        return;
      }
      setEsito({ riferimento: dati.riferimento || '', email: fatturazione.email });
    } catch (err) {
      setErroreInvio(
        metodoPagamento === 'carta'
          ? 'Non siamo riusciti ad avviare il pagamento. Riprova fra poco: i dati inseriti restano qui.'
          : "Non siamo riusciti a registrare l'iscrizione. Riprova fra poco: i dati inseriti restano qui."
      );
      setInvio(false);
    }
  };

  if (esito) {
    return (
      <div className="max-w-2xl mx-auto px-6 text-center">
        <CheckCircle2 className="w-14 h-14 mx-auto mb-6 text-gray-900" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Iscrizione registrata</h1>
        <p className="text-gray-600 leading-relaxed mb-6">
          Abbiamo inviato a <strong>{esito.email}</strong> gli estremi per il bonifico
          {esito.riferimento ? <> e il riferimento <strong>{esito.riferimento}</strong></> : null}.
          Indica il riferimento nella causale: serve ad abbinare il pagamento alla tua iscrizione senza scambi di email.
        </p>
        <p className="text-gray-600 leading-relaxed mb-10">
          Ricevuto il bonifico registriamo i partecipanti sulla piattaforma entro 24 ore. A ciascuno arriverà un’email
          per confermare il proprio account: va confermata, altrimenti il corso non può essergli abbinato.
        </p>
        <Button onClick={onIndietro} size="lg" className="bg-black text-white hover:bg-gray-800 px-8">
          Torna al catalogo
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6">
      <button onClick={indietro} className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        {passo === 0 ? 'Torna al catalogo' : 'Torna indietro'}
      </button>

      <div className="mb-10">
        <p className="text-sm font-medium text-gray-500 mb-2">Iscrizione al corso</p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{corso.titolo}</h1>
        <p className="text-gray-600">
          {corso.ore} ore · e-learning asincrono · {corso.prezzo}&nbsp;€ a partecipante, IVA compresa
        </p>
      </div>

      <div className="flex items-center gap-2 mb-10">
        {PASSI.map((nome, i) => (
          <div key={nome} className="flex-1">
            <div className={`h-1.5 rounded-full mb-2 transition-colors ${i <= passo ? 'bg-black' : 'bg-gray-200'}`} />
            <span className={`text-xs ${i === passo ? 'text-black font-semibold' : 'text-gray-400'}`}>{nome}</span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={passo}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {passo === 0 && (
            <section className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Quante persone devi iscrivere?</h2>
                <p className="text-gray-600 mb-5 text-sm">I dati di ciascun partecipante servono all’ente per intestare l’attestato.</p>
                <div className="flex items-center gap-5">
                  <button onClick={() => cambiaNumero(-1)} className="w-11 h-11 rounded-full border-2 border-gray-200 hover:border-black flex items-center justify-center transition-colors" aria-label="Togli un partecipante">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-3xl font-bold w-12 text-center">{partecipanti.length}</span>
                  <button onClick={() => cambiaNumero(1)} className="w-11 h-11 rounded-full border-2 border-gray-200 hover:border-black flex items-center justify-center transition-colors" aria-label="Aggiungi un partecipante">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">A chi intestiamo la fattura?</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { id: 'azienda', titolo: 'Azienda o professionista', nota: 'Con partita IVA' },
                    { id: 'privato', titolo: 'Privato', nota: 'Con codice fiscale' },
                  ].map((opzione) => (
                    <button
                      key={opzione.id}
                      onClick={() => aggiornaFatturazione('tipo', opzione.id)}
                      className={`text-left p-5 rounded-xl border-2 transition-all ${
                        fatturazione.tipo === opzione.id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="block font-semibold text-gray-900">{opzione.titolo}</span>
                      <span className="block text-sm text-gray-500 mt-0.5">{opzione.nota}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 flex items-center justify-between">
                <span className="text-gray-600">
                  {partecipanti.length} × {corso.prezzo}&nbsp;€
                </span>
                <span className="text-right">
                  <span className="block text-2xl font-bold leading-none">{totale}&nbsp;€</span>
                  <span className="block text-xs text-gray-500 mt-1">IVA compresa</span>
                </span>
              </div>
            </section>
          )}

          {passo === 1 && (
            <section className="space-y-5">
              <h2 className="text-xl font-bold text-gray-900">Dati per la fattura</h2>
              {fatturazione.tipo === 'azienda' ? (
                <div className="grid sm:grid-cols-2 gap-5">
                  <Campo label="Ragione sociale" value={fatturazione.ragioneSociale} onChange={(v) => aggiornaFatturazione('ragioneSociale', v)} errore={errori.f_ragioneSociale} larghezza="sm:col-span-2" />
                  <Campo label="Partita IVA" value={fatturazione.partitaIva} onChange={(v) => aggiornaFatturazione('partitaIva', v)} errore={errori.f_partitaIva} />
                  <Campo label="Referente" value={fatturazione.referente} onChange={(v) => aggiornaFatturazione('referente', v)} errore={errori.f_referente} />
                  <Campo label="Codice destinatario SDI" value={fatturazione.sdi} onChange={(v) => aggiornaFatturazione('sdi', v)} errore={errori.f_sdi} maiuscolo placeholder="7 caratteri" />
                  <Campo label="PEC (in alternativa allo SDI)" value={fatturazione.pec} onChange={(v) => aggiornaFatturazione('pec', v)} />
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-5">
                  <Campo label="Nome" value={fatturazione.nome} onChange={(v) => aggiornaFatturazione('nome', v)} errore={errori.f_nome} />
                  <Campo label="Cognome" value={fatturazione.cognome} onChange={(v) => aggiornaFatturazione('cognome', v)} errore={errori.f_cognome} />
                  <Campo label="Codice fiscale" value={fatturazione.codiceFiscale} onChange={(v) => aggiornaFatturazione('codiceFiscale', v)} errore={errori.f_codiceFiscale} maiuscolo larghezza="sm:col-span-2" />
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-5">
                <Campo label="Indirizzo" value={fatturazione.indirizzo} onChange={(v) => aggiornaFatturazione('indirizzo', v)} errore={errori.f_indirizzo} larghezza="sm:col-span-2" />
                <Campo label="CAP" value={fatturazione.cap} onChange={(v) => aggiornaFatturazione('cap', v)} errore={errori.f_cap} />
                <Campo label="Città" value={fatturazione.citta} onChange={(v) => aggiornaFatturazione('citta', v)} errore={errori.f_citta} />
                <Selezione label="Provincia" value={fatturazione.provincia} onChange={(v) => aggiornaFatturazione('provincia', v)} errore={errori.f_provincia} opzioni={OPZIONI_PROVINCE} />
                <Campo label="Email" tipo="email" value={fatturazione.email} onChange={(v) => aggiornaFatturazione('email', v)} errore={errori.f_email} />
                <Campo label="Telefono" tipo="tel" value={fatturazione.telefono} onChange={(v) => aggiornaFatturazione('telefono', v)} errore={errori.f_telefono} larghezza="sm:col-span-2" />
              </div>
            </section>
          )}

          {passo === 2 && (
            <section className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Dati dei partecipanti</h2>
                <p className="text-gray-600 text-sm">
                  Servono all’ente per creare l’accesso alla piattaforma e intestare l’attestato: controlla che siano esatti. L’email di ciascuno diventerà il suo nome utente e riceverà lì la richiesta di conferma dell’account: dev’essere una casella a cui il partecipante accede davvero.
                </p>
              </div>

              {partecipanti.map((p, i) => (
                <div key={i} className="border-2 border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-900">Partecipante {i + 1}</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Campo label="Nome" value={p.nome} onChange={(v) => aggiornaPartecipante(i, 'nome', v)} errore={errori[`p${i}_nome`]} />
                    <Campo label="Cognome" value={p.cognome} onChange={(v) => aggiornaPartecipante(i, 'cognome', v)} errore={errori[`p${i}_cognome`]} />
                    <div className="sm:col-span-2">
                      <Campo label="Codice fiscale" value={p.codiceFiscale} onChange={(v) => aggiornaPartecipante(i, 'codiceFiscale', v)} errore={errori[`p${i}_codiceFiscale`]} maiuscolo />
                      {!errori[`p${i}_codiceFiscale`] && datiDaCodiceFiscale(p.codiceFiscale) && (
                        <p className="text-sm text-gray-500 mt-1">
                          Riconosciuto: nato{datiDaCodiceFiscale(p.codiceFiscale).sesso === 'F' ? 'a' : ''} il{' '}
                          {String(datiDaCodiceFiscale(p.codiceFiscale).giorno).padStart(2, '0')}/
                          {String(datiDaCodiceFiscale(p.codiceFiscale).mese).padStart(2, '0')}/
                          {datiDaCodiceFiscale(p.codiceFiscale).annoNascita}
                        </p>
                      )}
                    </div>
                    <Campo label="Data di nascita" tipo="date" value={p.dataNascita} onChange={(v) => aggiornaPartecipante(i, 'dataNascita', v)} errore={errori[`p${i}_dataNascita`]} />
                    <Campo label="Comune di nascita" value={p.comuneNascita} onChange={(v) => aggiornaPartecipante(i, 'comuneNascita', v)} errore={errori[`p${i}_comuneNascita`]} />
                    <Selezione label="Provincia di nascita" value={p.provinciaNascita} onChange={(v) => aggiornaPartecipante(i, 'provinciaNascita', v)} errore={errori[`p${i}_provinciaNascita`]} opzioni={OPZIONI_PROVINCE} />
                    <Campo label="Qualifica" value={p.qualifica} onChange={(v) => aggiornaPartecipante(i, 'qualifica', v)} errore={errori[`p${i}_qualifica`]} placeholder="Es. operaio, impiegato, responsabile" />
                    <Campo label="Email del partecipante" tipo="email" value={p.email} onChange={(v) => aggiornaPartecipante(i, 'email', v)} errore={errori[`p${i}_email`]} placeholder="Sarà anche il suo nome utente sulla piattaforma" larghezza="sm:col-span-2" />
                  </div>
                </div>
              ))}
            </section>
          )}

          {passo === 3 && (
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Controlla e conferma</h2>

              <div className="border-2 border-gray-200 rounded-xl divide-y divide-gray-100">
                <div className="p-5 flex justify-between gap-4">
                  <span className="text-gray-600">Corso</span>
                  <span className="font-medium text-right">{corso.titolo} · {corso.ore} ore</span>
                </div>
                <div className="p-5 flex justify-between gap-4">
                  <span className="text-gray-600">Intestatario</span>
                  <span className="font-medium text-right">
                    {fatturazione.tipo === 'azienda' ? fatturazione.ragioneSociale : `${fatturazione.nome} ${fatturazione.cognome}`}
                  </span>
                </div>
                <div className="p-5">
                  <span className="text-gray-600 block mb-2">Partecipanti</span>
                  <ul className="space-y-1">
                    {partecipanti.map((p, i) => (
                      <li key={i} className="font-medium">{p.nome} {p.cognome} <span className="text-gray-400 font-normal">· {p.codiceFiscale}</span></li>
                    ))}
                  </ul>
                </div>
                <div className="p-5 flex justify-between items-center bg-gray-50">
                  <span className="text-gray-600">Totale</span>
                  <span className="text-right">
                    <span className="block text-2xl font-bold leading-none">{totale}&nbsp;€</span>
                    <span className="block text-xs text-gray-500 mt-1">IVA compresa</span>
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3">Come preferisci pagare?</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { id: 'carta', icona: CreditCard, titolo: 'Carta di credito', nota: 'Paghi adesso, l’iscrizione parte subito' },
                    { id: 'bonifico', icona: Landmark, titolo: 'Bonifico bancario', nota: 'Ti inviamo gli estremi via email' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMetodoPagamento(m.id)}
                      className={`text-left p-5 rounded-xl border-2 transition-all ${
                        metodoPagamento === m.id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <m.icona className="w-5 h-5 mb-2" />
                      <span className="block font-semibold text-gray-900">{m.titolo}</span>
                      <span className="block text-sm text-gray-500 mt-0.5">{m.nota}</span>
                    </button>
                  ))}
                </div>
                {metodoPagamento === 'bonifico' && (
                  <p className="text-sm text-gray-500 mt-3">
                    L’iscrizione viene registrata subito, ma i partecipanti vengono inseriti sulla piattaforma solo dopo
                    l’accredito del bonifico.
                  </p>
                )}
              </div>

              <div className="space-y-3 text-sm">
                {[
                  {
                    id: 'condizioni',
                    obbligatorio: true,
                    testo: (
                      <>
                        Ho letto e accetto le{' '}
                        <a href="/condizioni-vendita" target="_blank" rel="noopener noreferrer" className="underline hover:text-black">
                          condizioni di vendita
                        </a>
                        .
                      </>
                    ),
                  },
                  {
                    id: 'privacy',
                    obbligatorio: true,
                    testo: (
                      <>
                        Ho letto l’
                        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-black">
                          informativa privacy
                        </a>{' '}
                        e acconsento al trattamento dei dati, anche dei partecipanti che ho inserito, per l’iscrizione
                        al corso.
                      </>
                    ),
                  },
                  {
                    id: 'attivazione',
                    obbligatorio: true,
                    testo: (
                      <>
                        Chiedo che il corso sia attivato subito, senza attendere i 14 giorni di ripensamento. Se
                        acquisto come consumatore, prendo atto che perdo il diritto di recesso nel momento in cui il
                        corso viene reso disponibile sulla piattaforma.
                      </>
                    ),
                  },
                  {
                    id: 'marketing',
                    obbligatorio: false,
                    testo: <>Acconsento a ricevere comunicazioni su scadenze formative e nuovi corsi.</>,
                  },
                ].map((c) => (
                  <label key={c.id} className="flex gap-3 items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consensi[c.id]}
                      onChange={(e) => setConsensi((prec) => ({ ...prec, [c.id]: e.target.checked }))}
                      className="mt-1 w-4 h-4 accent-black"
                    />
                    <span className="text-gray-700">
                      {c.testo} {c.obbligatorio && <span className="text-red-500">*</span>}
                    </span>
                  </label>
                ))}
              </div>

              <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-600">
                <p className="mb-2">
                  Il corso è erogato da <strong>EFEI — Organismo Paritetico Salute e Sicurezza nei Luoghi di Lavoro</strong>
                  tramite l’Unità Operativa codice 2403. Dopo il pagamento l’iscrizione viene trasmessa per l’autorizzazione;
                  a conferma, ogni partecipante riceve le credenziali all’indirizzo indicato:
                  <strong>l’email del partecipante è anche il suo nome utente</strong>.
                </p>
                <p className="mb-2">
                  <strong>Attenzione al passaggio successivo:</strong> ogni partecipante riceverà dalla piattaforma
                  un’email per confermare il proprio account. Finché non la conferma, il corso non può essergli
                  abbinato. Se non arriva, va controllata anche la posta indesiderata.
                </p>
                <p>
                  Al superamento del test finale l’attestato — rilasciato da EFEI, con l’indicazione dell’Ateneo delle Professioni – Università AUGE, Dipartimento Salute e Sicurezza sul Lavoro — è scaricabile direttamente dalla piattaforma, in qualsiasi momento.
                </p>
              </div>

              {erroreInvio && (
                <div className="border-2 border-red-200 bg-red-50 text-red-700 rounded-xl p-4 text-sm">{erroreInvio}</div>
              )}
            </section>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between gap-4 mt-10 pt-8 border-t border-gray-100">
        <button onClick={indietro} className="text-gray-600 hover:text-black transition-colors">Indietro</button>
        {passo < PASSI.length - 1 ? (
          <Button onClick={avanti} size="lg" className="bg-black text-white hover:bg-gray-800 px-8">
            Continua <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={inviaEPaga} disabled={invio} size="lg" className="bg-black text-white hover:bg-gray-800 px-8">
            {invio ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Attendi…</>
            ) : metodoPagamento === 'carta' ? (
              <><Lock className="w-4 h-4 mr-2" /> Vai al pagamento</>
            ) : (
              <><Send className="w-4 h-4 mr-2" /> Invia l’iscrizione</>
            )}
          </Button>
        )}
      </div>

      {Object.keys(errori).length > 0 && (
        <p className="text-sm text-red-600 mt-4 text-right">Controlla i campi evidenziati prima di continuare.</p>
      )}

      {metodoPagamento === 'carta' && (
        <p className="flex items-center justify-end gap-1.5 text-xs text-gray-400 mt-6">
          <Check className="w-3 h-3" /> Pagamento gestito da Stripe · i dati della carta non passano da questo sito
        </p>
      )}
    </div>
  );
}
