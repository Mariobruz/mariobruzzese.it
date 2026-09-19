/**
 * stripe.js — due sole cose: creare la sessione di pagamento e verificare
 * che il webhook arrivi davvero da Stripe.
 *
 * Niente SDK: sui Worker basta fetch, e una dipendenza in meno è una cosa
 * in meno che si rompe.
 */

function formEncode(oggetto, prefisso = '', accumulatore = []) {
  for (const [chiave, valore] of Object.entries(oggetto)) {
    const nome = prefisso ? `${prefisso}[${chiave}]` : chiave;
    if (valore === null || valore === undefined) continue;
    if (typeof valore === 'object') formEncode(valore, nome, accumulatore);
    else accumulatore.push(`${encodeURIComponent(nome)}=${encodeURIComponent(valore)}`);
  }
  return accumulatore;
}

export async function creaSessionePagamento(env, { ordine, partecipanti, riferimento }) {
  const corpo = formEncode({
    mode: 'payment',
    locale: 'it',
    client_reference_id: riferimento,
    customer_email: ordine.fatturazione.email,
    success_url: `${env.SITO_URL}/corsi-sicurezza?iscrizione=ok&rif=${riferimento}`,
    cancel_url: `${env.SITO_URL}/corsi-sicurezza?iscrizione=annullata`,
    metadata: { riferimento, corso: ordine.corso.id, partecipanti: String(partecipanti.length) },
    line_items: {
      0: {
        quantity: partecipanti.length,
        price_data: {
          currency: 'eur',
          unit_amount: Math.round(ordine.corso.prezzo * 100),
          product_data: {
            name: `${ordine.corso.titolo} — ${ordine.corso.ore} ore`,
            description: 'Corso e-learning asincrono · IVA compresa',
          },
        },
      },
    },
  }).join('&');

  const risposta = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: corpo,
  });

  const dati = await risposta.json();
  if (!risposta.ok) {
    throw new Error(`Stripe: ${(dati.error && dati.error.message) || risposta.status}`);
  }
  return dati;
}

/** Confronto a tempo costante: evita di far trapelare la firma un byte alla volta. */
function confrontoSicuro(a, b) {
  if (a.length !== b.length) return false;
  let differenza = 0;
  for (let i = 0; i < a.length; i += 1) differenza |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return differenza === 0;
}

/**
 * Verifica la firma del webhook. Senza questo controllo chiunque potrebbe
 * chiamare il nostro endpoint e far risultare pagato un ordine.
 */
export async function verificaWebhook(env, corpoGrezzo, intestazioneFirma) {
  if (!intestazioneFirma) return false;
  const parti = Object.fromEntries(
    intestazioneFirma.split(',').map((p) => p.split('=').map((x) => x.trim()))
  );
  const { t, v1 } = parti;
  if (!t || !v1) return false;

  // rifiuta i messaggi vecchi: una firma valida ma riusata resta un attacco
  const eta = Math.abs(Math.floor(Date.now() / 1000) - Number(t));
  if (!Number.isFinite(eta) || eta > 300) return false;

  const chiave = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.STRIPE_WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const firma = await crypto.subtle.sign('HMAC', chiave, new TextEncoder().encode(`${t}.${corpoGrezzo}`));
  const atteso = [...new Uint8Array(firma)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return confrontoSicuro(atteso, v1);
}
