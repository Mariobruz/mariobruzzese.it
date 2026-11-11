/**
 * email-consulenti.js — email ai consulenti: link di accesso all'area riservata
 * e avviso di nuovo ordine fatto con il loro codice. Invio tramite Brevo.
 */
const esc = (v) => String(v == null ? '' : v)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const stile = 'font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.6;color:#111';
const euro = (n) => Number(n || 0).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });

export function emailAccessoConsulente({ consulente, link }) {
  return {
    a: consulente.email,
    oggetto: 'Il tuo link di accesso — Area consulenti MB Consulting',
    html: `<div style="${stile}">
      <p>Ciao ${esc(consulente.nome)},</p>
      <p>ecco il link per entrare nella tua area riservata. Vale <strong>15 minuti</strong> e si può usare una sola volta:</p>
      <p><a href="${esc(link)}" style="display:inline-block;background:#111;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Entra nell'area consulenti</a></p>
      <p style="color:#666;font-size:13px">Se non hai chiesto tu l'accesso, ignora questa email: senza il link nessuno può entrare.</p>
    </div>`,
  };
}

export function emailNuovoOrdineConsulente({ consulente, ordine, partecipanti, compenso, pct, areaUrl }) {
  let f = {};
  try { f = typeof ordine.fatturazione === 'string' ? JSON.parse(ordine.fatturazione) : (ordine.fatturazione || {}); } catch (e) { /* vuoto */ }
  const cliente = f.tipo === 'azienda' ? f.ragioneSociale : `${f.nome || ''} ${f.cognome || ''}`.trim();
  const righe = partecipanti.map((p) => `<li>${esc(p.nome)} ${esc(p.cognome)} — ${esc((p.corso && p.corso.titolo) || '')}</li>`).join('');
  return {
    a: consulente.email,
    oggetto: `Nuovo ordine con il tuo codice ${ordine.codice_sconto} — ${ordine.riferimento}`,
    html: `<div style="${stile}">
      <p>Ciao ${esc(consulente.nome)},</p>
      <p><strong>${esc(cliente)}</strong> ha completato un ordine con il tuo codice <strong>${esc(ordine.codice_sconto)}</strong>
      (riferimento ${esc(ordine.riferimento)}).</p>
      <ul>${righe}</ul>
      <p>Incassato: <strong>${euro(ordine.totale)}</strong> · il tuo compenso (${esc(pct)}%): <strong>${euro(compenso)}</strong>.</p>
      ${areaUrl ? `<p>Tutti i dettagli sono nella tua <a href="${esc(areaUrl)}">area consulenti</a>.</p>` : ''}
    </div>`,
  };
}

/** Al consulente che si è appena registrato da solo: conferma + link per entrare subito. */
export function emailRegistrazioneConsulente({ consulente, link }) {
  return {
    a: consulente.email,
    oggetto: 'Registrazione ricevuta — Area consulenti MB Consulting',
    html: `<div style="${stile}">
      <p>Ciao ${esc(consulente.nome)},</p>
      <p>grazie per esserti registrato all'area consulenti di MB Consulting.</p>
      <p>Ti contatteremo a breve per l'accordo di collaborazione. Appena è completato attiviamo il tuo
      <strong>codice sconto</strong> e ti avvisiamo con un'email.</p>
      <p>Intanto puoi già entrare nella tua area riservata. Il link vale <strong>15 minuti</strong> e si usa una sola volta;
      dopo potrai sempre chiederne uno nuovo dalla pagina di accesso.</p>
      <p><a href="${esc(link)}" style="display:inline-block;background:#111;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Entra nell'area consulenti</a></p>
      <p style="color:#666;font-size:13px">Se non ti sei registrato tu, ignora questa email.</p>
    </div>`,
  };
}

/** A MB Consulting: un consulente si è registrato dal modulo pubblico. */
export function emailNuovoConsulenteAdmin({ consulente, a }) {
  const riga = (k, v) => (v ? `<tr><td style="color:#666;padding-right:12px">${esc(k)}</td><td>${esc(v)}</td></tr>` : '');
  return {
    a,
    oggetto: `Nuovo consulente registrato: ${consulente.cognome} ${consulente.nome}`,
    html: `<div style="${stile}">
      <p>Un consulente si è registrato dal modulo dell'area consulenti. È <strong>in attesa di contratto</strong>:
      il suo codice sconto non funziona finché non lo metti "Attivo" nel pannello (scheda "Consulenti e codici").</p>
      <table>${riga('Nome', `${consulente.nome} ${consulente.cognome}`)}${riga('Studio', consulente.ragioneSociale)}
      ${riga('P. IVA / CF', consulente.pivaCf)}${riga('Email', consulente.email)}${riga('PEC', consulente.pec)}
      ${riga('Telefono', consulente.telefono)}${riga('Codice assegnato', consulente.codice)}</table>
    </div>`,
  };
}

/** Al consulente quando lo metti "Attivo": il suo codice ora funziona. */
export function emailConsulenteAttivato({ consulente, codici, areaUrl, sito }) {
  const base = sito || 'https://www.mariobruzzese.it';
  const elenco = codici.map((k) => {
    const link = `${base}/corsi-sicurezza?codice=${encodeURIComponent(k.codice)}`;
    return `<li><strong>${esc(k.codice)}</strong> — sconto ${esc(k.scontoPct)}% per i tuoi clienti<br>
      link da condividere: <a href="${esc(link)}">${esc(link)}</a></li>`;
  }).join('');
  return {
    a: consulente.email,
    oggetto: 'Il tuo codice sconto è attivo — MB Consulting',
    html: `<div style="${stile}">
      <p>Ciao ${esc(consulente.nome)},</p>
      <p>la collaborazione è attiva: da adesso i tuoi clienti possono usare il tuo codice sui corsi di
      <a href="${esc(base)}/corsi-sicurezza">${esc(base.replace(/^https?:\/\//, ''))}</a>.</p>
      <ul>${elenco}</ul>
      <p>Ordini, clienti e compensi li trovi nella tua
      <a href="${esc(areaUrl)}">area consulenti</a>: inserisci la tua email e ricevi il link per entrare.</p>
    </div>`,
  };
}
