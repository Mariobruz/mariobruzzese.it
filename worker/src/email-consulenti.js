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
