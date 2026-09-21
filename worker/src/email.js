import { province } from './province';
/**
 * email.js — invio tramite Brevo (api.brevo.com, dati in UE).
 *
 * Tre messaggi in tutto:
 *  - al cliente che ha pagato con carta: conferma;
 *  - al cliente che paga con bonifico: estremi e riferimento da mettere in causale;
 *  - a MB Consulting: notifica dell'ordine con allegato il CSV pronto per la piattaforma.
 */

/** base64 di una stringa UTF-8, senza appoggiarsi a funzioni deprecate. */
function base64(testo) {
  const byte = new TextEncoder().encode(testo);
  let binaria = '';
  for (let i = 0; i < byte.length; i += 1) binaria += String.fromCharCode(byte[i]);
  return btoa(binaria);
}

const stile = `font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.6;color:#111`;

async function invia(env, { a, oggetto, html, allegati }) {
  const destinatari = (Array.isArray(a) ? a : [a]).map((email) => ({ email }));
  const risposta = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': env.BREVO_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: env.NOME_MITTENTE, email: env.EMAIL_MITTENTE },
      to: destinatari,
      replyTo: { email: env.EMAIL_AMMINISTRATORE },
      subject: oggetto,
      htmlContent: html,
      attachment: allegati,
    }),
  });
  if (!risposta.ok) {
    const testo = await risposta.text();
    throw new Error(`Brevo ${risposta.status}: ${testo.slice(0, 300)}`);
  }
  return risposta.json();
}

const elencoPartecipanti = (partecipanti) =>
  partecipanti
    .map((p) => `<li>${p.nome} ${p.cognome} — <strong>${p.email}</strong></li>`)
    .join('');

const avvisoConferma = `
  <p style="background:#f5f5f5;padding:14px;border-radius:8px">
    <strong>Passaggio necessario:</strong> ogni partecipante riceverà dalla piattaforma un’email
    per confermare il proprio account. Finché non la conferma, il corso non può essergli abbinato.
    Se non arriva entro poche ore, va controllata anche la posta indesiderata.
  </p>`;

export function emailClienteCarta(env, { ordine, partecipanti, riferimento }) {
  return {
    a: ordine.fatturazione.email,
    oggetto: `Iscrizione confermata — ${ordine.corso.titolo} (${riferimento})`,
    html: `<div style="${stile}">
      <h2>Iscrizione confermata</h2>
      <p>Abbiamo ricevuto il pagamento per <strong>${ordine.corso.titolo}</strong>
      (${ordine.corso.ore} ore) — riferimento <strong>${riferimento}</strong>.</p>
      <p>Partecipanti iscritti:</p>
      <ul>${elencoPartecipanti(partecipanti)}</ul>
      <p>Entro 24 ore registriamo i partecipanti sulla piattaforma.</p>
      ${avvisoConferma}
      <p>Superato il test finale, l’attestato — rilasciato da EFEI, con l’indicazione dell’Ateneo delle Professioni – Università AUGE, Dipartimento Salute e Sicurezza sul Lavoro — si scarica direttamente dalla piattaforma.</p>
      <p style="color:#666;font-size:13px">MB Consulting di Mario Bruzzese — mandataria per la promozione
      e la vendita dei prodotti formativi EFEI, Unità Operativa codice 2403.</p>
    </div>`,
  };
}

export function emailClienteBonifico(env, { ordine, partecipanti, riferimento, totale }) {
  return {
    a: ordine.fatturazione.email,
    oggetto: `Istruzioni per il pagamento — ${ordine.corso.titolo} (${riferimento})`,
    html: `<div style="${stile}">
      <h2>Iscrizione registrata</h2>
      <p>Per completarla, effettua un bonifico di <strong>${totale}&nbsp;€ (IVA compresa)</strong>
      con questi dati:</p>
      <table style="border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:6px 16px 6px 0;color:#666">Intestatario</td><td><strong>${env.INTESTATARIO_CONTO}</strong></td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#666">IBAN</td><td><strong>${env.IBAN}</strong></td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#666">Causale</td><td><strong>${riferimento}</strong></td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#666">Importo</td><td><strong>${totale}&nbsp;€</strong></td></tr>
      </table>
      <p>Indica il riferimento <strong>${riferimento}</strong> nella causale: serve ad abbinare il
      pagamento alla tua iscrizione senza scambi di email.</p>
      <p>Corso: <strong>${ordine.corso.titolo}</strong> (${ordine.corso.ore} ore), per:</p>
      <ul>${elencoPartecipanti(partecipanti)}</ul>
      <p>Ricevuto il bonifico, entro 24 ore registriamo i partecipanti sulla piattaforma.</p>
      ${avvisoConferma}
      <p style="color:#666;font-size:13px">MB Consulting di Mario Bruzzese — mandataria per la promozione
      e la vendita dei prodotti formativi EFEI, Unità Operativa codice 2403.</p>
    </div>`,
  };
}

const esc = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const nomeProvincia = (sigla) => (province.find((p) => p.sigla === (sigla || '').toUpperCase()) || {}).nome || sigla || '';
const dataIt = (iso) => {
  const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso || '';
};

/** Tabella a due colonne: etichetta | valore, pronta da copiare campo per campo. */
function tabella(titolo, righe, nota) {
  const td = 'padding:6px 12px;border:1px solid #ddd;vertical-align:top';
  return `<h3 style="margin:28px 0 8px">${titolo}</h3>
    ${nota ? `<p style="color:#666;font-size:13px;margin:0 0 8px">${nota}</p>` : ''}
    <table style="border-collapse:collapse;font-size:14px">
      ${righe
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => `<tr><td style="${td};color:#666;white-space:nowrap">${k}</td><td style="${td}"><strong>${esc(v) || '—'}</strong></td></tr>`)
        .join('')}
    </table>`;
}

export function emailAmministratore(env, { ordine, partecipanti, riferimento, totale, stato, csv, nomeFile }) {
  const f = ordine.fatturazione;
  const azienda = f.tipo === 'azienda';
  const intestatario = azienda ? f.ragioneSociale : `${f.nome} ${f.cognome}`;
  const etichetta = stato === 'pagato' ? 'PAGATO' : 'IN ATTESA DI BONIFICO';
  const n = partecipanti.length;

  const fattura = tabella('1 · Dati per la fattura', [
    ['Intestatario', intestatario],
    [azienda ? 'Partita IVA' : 'Codice fiscale', azienda ? f.partitaIva : f.codiceFiscale],
    ['Indirizzo', f.indirizzo],
    ['CAP · Comune · Provincia', `${f.cap} ${f.citta} (${(f.provincia || '').toUpperCase()})`],
    ['Codice SDI', azienda ? f.sdi : undefined],
    ['PEC', azienda ? f.pec : undefined],
    ['Email', f.email],
    ['Descrizione', `${ordine.corso.titolo} — corso e-learning ${ordine.corso.ore} ore — rif. ${riferimento}`],
    ['Quantità × prezzo', `${n} × ${ordine.corso.prezzo} €`],
    ['Totale', `${totale} € — operazione in regime forfettario, non soggetta a IVA (art. 1, cc. 54-89, L. 190/2014)`],
    ['Pagamento', stato === 'pagato' ? 'Carta (Stripe) — incassato' : 'Bonifico — in attesa'],
  ], azienda ? '' : 'Cliente privato: fattura elettronica al codice fiscale, codice destinatario 0000000.');

  const piattaforma = !azienda
    ? `<h3 style="margin:28px 0 8px">2 · Piattaforma EFEI</h3>
      <p><strong>Cliente privato: nessuna azienda da creare.</strong> Importa direttamente il CSV allegato:
      l’utente viene creato senza azienda (la colonna AZIENDA è vuota).</p>`
    : tabella('2 · Piattaforma EFEI → Anagrafiche → Crea azienda', [
    ['Tipologia', azienda ? 'Azienda' : 'Privato'],
    ['Codice', '(progressivo della piattaforma)'],
    ['Ragione sociale', intestatario],
    ['Email', f.email],
    ['Email PEC', f.pec || ''],
    ['Telefono', f.telefono],
    ['Indirizzo', f.indirizzo],
    ['Nazione', 'Italia'],
    ['Regione', f.regione || (province.find((x) => x.sigla === (f.provincia || '').toUpperCase()) || {}).regione],
    ['Provincia', nomeProvincia(f.provincia)],
    ['Comune', f.citta],
    ['CAP', f.cap],
    ['Partita IVA', azienda ? f.partitaIva : '— (privato)'],
    ['Codice fiscale', azienda ? '' : f.codiceFiscale],
    ['SDI', f.sdi || ''],
    ['Codici ATECO', f.ateco],
    ['Referente', azienda ? f.referente : undefined],
  ], 'Crea l’azienda prima di importare il CSV: il CSV la collega ai partecipanti tramite la partita IVA.');

  const partecipantiHtml = partecipanti
    .map((p, i) =>
      tabella(`3 · Partecipante ${i + 1} di ${n}`, [
        ['Nome', p.nome],
        ['Cognome', p.cognome],
        ['Email (username)', p.email],
        ['Codice fiscale', (p.codiceFiscale || '').toUpperCase()],
        ['Sesso', p.sesso],
        ['Data di nascita', dataIt(p.dataNascita)],
        ['Comune di nascita', p.comuneNascita],
        ['Provincia di nascita', nomeProvincia(p.provinciaNascita)],
        ['Regione di nascita', p.regioneNascita],
        ['Nazione di nascita', 'Italia'],
        ['Telefono', p.telefono],
        ['Qualifica', p.qualifica],
        ['Corso (SKU)', ordine.corso.sku],
      ])
    )
    .join('');

  return {
    a: env.EMAIL_AMMINISTRATORE,
    oggetto: `[${etichetta}] ${riferimento} — ${n} partecipant${n > 1 ? 'i' : 'e'} — ${ordine.corso.titolo}`,
    html: `<div style="${stile}">
      <h2 style="margin-bottom:4px">${etichetta} · ${riferimento}</h2>
      <p style="margin-top:0"><strong>${esc(ordine.corso.titolo)}</strong> (${ordine.corso.ore} ore) — SKU <code>${esc(ordine.corso.sku)}</code>
      — ${n} × ${ordine.corso.prezzo}&nbsp;€ = <strong>${totale}&nbsp;€</strong></p>
      <p style="background:#f5f5f5;padding:12px;border-radius:8px">
        ${stato === 'pagato'
          ? (azienda
            ? '<strong>Pagato.</strong> Entro 24 ore: crea l’azienda (sezione 2), importa il CSV allegato con «Importa utenti», abbina il corso dopo la conferma dell’account.'
            : '<strong>Pagato.</strong> Entro 24 ore: importa il CSV allegato con «Importa utenti» (privato, nessuna azienda da creare), abbina il corso dopo la conferma dell’account.')
          : '<strong>In attesa del bonifico</strong> con causale ' + riferimento + '. Non caricare nulla in piattaforma prima dell’accredito.'}
      </p>
      ${fattura}
      ${piattaforma}
      ${partecipantiHtml}
      <p style="margin-top:28px"><strong>Allegato:</strong> ${esc(nomeFile)} — CSV pronto per «Importa utenti».</p>
    </div>`,
    allegati: csv ? [{ name: nomeFile, content: base64(csv) }] : undefined,
  };
}

export async function inviaEmail(env, messaggio) {
  return invia(env, messaggio);
}
