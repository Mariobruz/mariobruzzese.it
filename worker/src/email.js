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
      <p>Superato il test finale, l’attestato si scarica direttamente dalla piattaforma.</p>
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

export function emailAmministratore(env, { ordine, partecipanti, riferimento, totale, stato, csv, nomeFile }) {
  const f = ordine.fatturazione;
  const intestatario = f.tipo === 'azienda' ? f.ragioneSociale : `${f.nome} ${f.cognome}`;
  const etichetta = stato === 'pagato' ? 'PAGATO' : 'IN ATTESA DI BONIFICO';
  return {
    a: env.EMAIL_AMMINISTRATORE,
    oggetto: `[${etichetta}] ${riferimento} — ${partecipanti.length} partecipante${partecipanti.length > 1 ? 'i' : ''} — ${ordine.corso.titolo}`,
    html: `<div style="${stile}">
      <h2>${etichetta} · ${riferimento}</h2>
      <p><strong>${ordine.corso.titolo}</strong> (${ordine.corso.ore} ore) — SKU <code>${ordine.corso.sku}</code><br>
      ${partecipanti.length} × ${ordine.corso.prezzo}&nbsp;€ = <strong>${totale}&nbsp;€</strong></p>
      <h3>Intestatario</h3>
      <p>${intestatario}<br>
      ${f.tipo === 'azienda' ? `P.IVA ${f.partitaIva}<br>` : `C.F. ${f.codiceFiscale}<br>`}
      ${f.indirizzo}, ${f.cap} ${f.citta} (${f.provincia}) — ${f.regione}<br>
      ${f.email} · ${f.telefono}${f.sdi ? `<br>SDI ${f.sdi}` : ''}${f.pec ? `<br>PEC ${f.pec}` : ''}</p>
      <h3>Partecipanti</h3>
      <ul>${elencoPartecipanti(partecipanti)}</ul>
      <p><strong>In allegato il CSV pronto per "Importa utenti"</strong> sulla piattaforma.
      ${stato === 'pagato'
        ? 'L’ordine è pagato: puoi caricarlo subito.'
        : 'Attendi l’accredito del bonifico prima di caricarlo.'}</p>
      <p style="color:#666;font-size:13px">Ricorda: se l’azienda non è ancora presente in piattaforma,
      va creata prima del caricamento.</p>
    </div>`,
    allegati: csv
      ? [{ name: nomeFile, content: base64(csv) }]
      : undefined,
  };
}

export async function inviaEmail(env, messaggio) {
  return invia(env, messaggio);
}
