import React, { useEffect, useState } from 'react';

/**
 * Indirizzo email composto solo nel browser, dopo il caricamento:
 * nel codice della pagina non compare per intero, così i programmi che
 * raccolgono indirizzi per lo spam non lo trovano. Per chi visita è un
 * normale link cliccabile.
 */
const DOMINIO = ['mariobruzzese', 'it'];

export default function EmailProtetta({ utente, className = '' }) {
  const [indirizzo, setIndirizzo] = useState('');
  useEffect(() => { setIndirizzo(`${utente}@${DOMINIO.join('.')}`); }, [utente]);
  if (!indirizzo) return <span className={className}>{utente} [at] {DOMINIO.join('.')}</span>;
  return <a href={`mailto:${indirizzo}`} className={className}>{indirizzo}</a>;
}
