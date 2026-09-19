# Worker iscrizioni — corsi sicurezza

Riceve le iscrizioni dalla pagina `/corsi-sicurezza`, incassa con Stripe o registra
l'attesa del bonifico, e manda le email — con allegato il **CSV già pronto** per
"Importa utenti" sulla piattaforma EFEI.

Il prezzo non viene mai preso da quello che arriva dal browser: si legge da
`src/catalogo.js`, generato dal catalogo del sito.

## Cosa serve prima

- un account **Cloudflare** (piano gratuito sufficiente)
- un account **Stripe** con l'attività verificata
- un account **Brevo** con il dominio `mariobruzzese.it` verificato (record DNS per SPF e DKIM);
  Brevo tiene i dati in UE, il che semplifica il capitolo privacy

## Messa in funzione

```bash
cd worker
npm install
npx wrangler login

# 1. database
npm run db:crea          # copia l'id che stampa dentro wrangler.toml
npm run db:struttura     # crea le tabelle

# 2. valori riservati (non finiscono nel codice né su GitHub)
npx wrangler secret put STRIPE_SECRET_KEY       # sk_live_... dalla dashboard Stripe
npx wrangler secret put STRIPE_WEBHOOK_SECRET   # whsec_... (punto 4)
npx wrangler secret put BREVO_API_KEY           # xkeysib-... (Brevo → SMTP & API → API Keys)
npx wrangler secret put IBAN                    # l'IBAN su cui ricevere i bonifici

# 3. pubblicazione
npm run deploy
```

Poi, in `wrangler.toml`, compila `EMAIL_AMMINISTRATORE` (dove vuoi ricevere gli ordini)
e, se usi un sottodominio dedicato, togli il commento alla riga `routes`.

**4. Webhook Stripe.** Nella dashboard Stripe → Sviluppatori → Webhook → aggiungi
un endpoint all'indirizzo `https://<indirizzo-del-worker>/stripe/webhook`, evento
`checkout.session.completed`. Stripe mostra un `whsec_...`: è il valore del punto 2.

Senza questo passaggio i pagamenti con carta funzionano ma tu non ricevi l'email
col CSV, perché è il webhook a dire al Worker che l'incasso è andato a buon fine.

**5. Collega il sito.** In `frontend/.env`:

```
REACT_APP_ISCRIZIONI_URL=https://<indirizzo-del-worker>
```

## Verifica prima di aprire al pubblico

1. Stripe in **modalità test**, ordine con la carta `4242 4242 4242 4242`.
2. Controlla di ricevere l'email con il CSV allegato.
3. Carica quel CSV in piattaforma con **un solo partecipante** e un'azienda già
   presente: serve a confermare che le colonne sono accettate.
4. Ripeti con un'azienda **non** presente, per sapere se l'import la crea da solo
   o se va creata prima.
5. Solo allora passa alle chiavi `sk_live_`.

## Comandi utili

```bash
npm run ordini                       # ultimi 20 ordini
npx wrangler tail                    # log in diretta
```

## Cosa resta manuale

- **Segnare i bonifici incassati.** Nessuno avvisa il Worker quando arriva un
  accredito: l'ordine resta `in_attesa_bonifico` finché non lo aggiorni tu.
- **Creare l'azienda** in piattaforma la prima volta che un cliente compra.
- **Verificare le conferme account.** La piattaforma non espone chi ha confermato:
  la colonna `account_confermato` è lì per quando vorrai tenerne traccia.
