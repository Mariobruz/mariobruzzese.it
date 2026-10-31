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

/** Tutto ciò che scrive il cliente passa di qui prima di finire in un'email HTML. */
const esc = (v) => String(v == null ? '' : v)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const stile = `font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.6;color:#111`;

/** Versione in testo semplice dell'email HTML. */
function soloTesto(html) {
  return html
    .replace(/<(br|\/p|\/h[1-6]|\/tr|\/li|\/div)[^>]*>/gi, '\n')
    .replace(/<\/td>\s*<td[^>]*>/gi, ': ')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

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
      // versione solo testo: Outlook/Hotmail scarta o rallenta le email solo HTML
      textContent: soloTesto(html),
      attachment: allegati,
    }),
  });
  if (!risposta.ok) {
    const testo = await risposta.text();
    throw new Error(`Brevo ${risposta.status}: ${testo.slice(0, 300)}`);
  }
  return risposta.json();
}

/** Corso del singolo partecipante (ordini con più corsi); se manca, quello dell'ordine. */
const corsoDi = (p, ordine) => p.corso
  || (p.corsoTitolo ? { titolo: p.corsoTitolo, prezzo: p.prezzo } : ordine.corso);
const corsoLeggibile = (c) => `${c.titolo}${c.ore ? ` (${c.ore} ore)` : ''}`;

const elencoPartecipanti = (partecipanti, ordine) =>
  partecipanti
    .map((p) => `<li>${esc(p.nome)} ${esc(p.cognome)} — <strong>${esc(p.email)}</strong> — ${esc(corsoLeggibile(corsoDi(p, ordine)))}</li>`)
    .join('');

const avvisoConferma = `
  <p style="background:#f5f5f5;padding:14px;border-radius:8px">
    Ogni partecipante riceverà dalla piattaforma O.P.N. Italia Lavoro (non da questo indirizzo) un’email con il link di accesso, nome utente e password.
    Al primo accesso completerà i suoi dati e potrà iniziare il corso.
    <strong>L’email può finire nello spam o nella posta indesiderata: controllate anche lì.</strong>
  </p>`;

export function emailClienteCarta(env, { ordine, partecipanti, riferimento }) {
  return {
    a: ordine.fatturazione.email,
    oggetto: `Iscrizione confermata — ${ordine.corso.titolo} (${riferimento})`,
    html: `<div style="${stile}">
      <h2>Iscrizione confermata</h2>
      <p>Abbiamo ricevuto il pagamento per <strong>${esc(corsoLeggibile(ordine.corso))}</strong>
      — riferimento <strong>${riferimento}</strong>.</p>
      <p>Partecipanti iscritti:</p>
      <ul>${elencoPartecipanti(partecipanti, ordine)}</ul>
      <p>Entro 24 ore lavorative iscriviamo i partecipanti sulla piattaforma e-learning.</p>
      ${avvisoConferma}
      <p>Superato il test finale si riceve l’attestato (soggetto formatore: O.P.N. Italia Lavoro – CNL – EBAFoS), verificabile tramite QR code sul sito opnitalialavoro.it.</p>
      <p style="color:#666;font-size:13px">MB Consulting di Mario Bruzzese — soggetto attuatore in convenzione
      con O.P.N. Italia Lavoro (Convenzione n. CFAL.1866).</p>
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
      pagamento alla tua iscrizione.</p>
      <div style="background:#f3f4f6;border-left:4px solid #111;padding:12px 16px;margin:16px 0">
        <strong>Appena fatto il bonifico, invia la contabile</strong> a
        <a href="mailto:${env.EMAIL_AMMINISTRATORE}?subject=Contabile%20${riferimento}">${env.EMAIL_AMMINISTRATORE}</a>
        indicando il riferimento <strong>${riferimento}</strong>: così acceleriamo la pratica di iscrizione.
      </div>
      <p>Corso: <strong>${esc(corsoLeggibile(ordine.corso))}</strong>, per:</p>
      <ul>${elencoPartecipanti(partecipanti, ordine)}</ul>
      <p>Ricevuto il bonifico, entro 24 ore lavorative iscriviamo i partecipanti sulla piattaforma e-learning.</p>
      ${avvisoConferma}
      <p style="color:#666;font-size:13px">MB Consulting di Mario Bruzzese — soggetto attuatore in convenzione
      con O.P.N. Italia Lavoro (Convenzione n. CFAL.1866).</p>
    </div>`,
  };
}

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

/** "2 × Corso A (99 €) + 1 × Corso B (29 €)": righe per la fattura. */
function righeFattura(partecipanti, ordine) {
  const perCorso = new Map();
  partecipanti.forEach((p) => {
    const c = corsoDi(p, ordine);
    const voce = perCorso.get(c.titolo) || { c, n: 0 };
    voce.n += 1;
    perCorso.set(c.titolo, voce);
  });
  return [...perCorso.values()].map(({ c, n }) => `${n} × ${c.titolo} (${c.prezzo} €)`).join(' + ');
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
    ['Descrizione', `${corsoLeggibile(ordine.corso)} — corsi e-learning — rif. ${riferimento}`],
    ['Righe', righeFattura(partecipanti, ordine)],
    ['Totale', `${totale} € — operazione in regime forfettario, non soggetta a IVA (art. 1, cc. 54-89, L. 190/2014)`],
    ['Pagamento', stato === 'pagato' ? 'Carta (Stripe) — incassato' : 'Bonifico — in attesa'],
  ], azienda ? '' : 'Cliente privato: fattura elettronica al codice fiscale, codice destinatario 0000000.');

  const partecipantiHtml = partecipanti
    .map((p, i) =>
      tabella(`2 · Partecipante ${i + 1} di ${n}`, [
        ['Nome', p.nome],
        ['Cognome', p.cognome],
        ['Codice fiscale', (p.codiceFiscale || '').toUpperCase()],
        ['Email', p.email],
        ['Corso', corsoLeggibile(corsoDi(p, ordine))],
        ['Prezzo', `${corsoDi(p, ordine).prezzo} €`],
      ])
    )
    .join('');

  // destinatari della notifica d'ordine: EMAIL_NOTIFICHE (separati da virgola), altrimenti l'amministratore
  const destinatari = String(env.EMAIL_NOTIFICHE || env.EMAIL_AMMINISTRATORE || '')
    .split(',').map((e) => e.trim()).filter(Boolean);

  return {
    a: destinatari,
    oggetto: `[${etichetta}] ${riferimento} — ${n} partecipant${n > 1 ? 'i' : 'e'} — ${ordine.corso.titolo}`,
    html: `<div style="${stile}">
      <h2 style="margin-bottom:4px">${etichetta} · ${riferimento}</h2>
      <p style="margin-top:0"><strong>${esc(corsoLeggibile(ordine.corso))}</strong>
      — ${esc(righeFattura(partecipanti, ordine))} = <strong>${totale}&nbsp;€</strong></p>
      <p style="background:#f5f5f5;padding:12px;border-radius:8px">
        ${stato === 'pagato'
          ? (azienda
            ? '<strong>Pagato.</strong> Entro 24 ore: iscrivi i partecipanti sulla piattaforma (nome, cognome, codice fiscale, email — sezione 2 o CSV allegato).'
            : '<strong>Pagato.</strong> Entro 24 ore: iscrivi i partecipanti sulla piattaforma (nome, cognome, codice fiscale, email — sezione 2 o CSV allegato).')
          : '<strong>In attesa del bonifico</strong> con causale ' + riferimento + '. Non caricare nulla in piattaforma prima dell’accredito.'}
      </p>
      ${fattura}
      ${partecipantiHtml}
      <p style="margin-top:28px"><strong>Allegato:</strong> ${esc(nomeFile)} — elenco partecipanti (nome, cognome, codice fiscale, email, corso).</p>
    </div>`,
    allegati: csv ? [{ name: nomeFile, content: base64(csv) }] : undefined,
  };
}

export async function inviaEmail(env, messaggio) {
  return invia(env, messaggio);
}
