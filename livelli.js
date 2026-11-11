// I regni: uno per livello. L'ordine va da nord a sud, fino ad Approdo del Re.
// "tema" indica i colori (vedi vista2d.js); "labirinto" è il nome in labirinti.js.
const REGNI = [
  { nome: 'Il Nord',              casata: 'Stark',           labirinto: 'nord',        tema: 'nord' },
  { nome: 'Isole e Fiumi',        casata: 'Greyjoy e Tully', labirinto: 'isole_fiumi', tema: 'isole_fiumi' },
  { nome: 'Montagna e Valle',     casata: 'Arryn',           labirinto: 'valle',       tema: 'valle' },
  { nome: 'La Roccia',            casata: 'Lannister',       labirinto: 'roccia',      tema: 'roccia' },
  { nome: "L'Altopiano",          casata: 'Tyrell',          labirinto: 'altopiano',   tema: 'altopiano' },
  { nome: 'Terre della Tempesta', casata: 'Baratheon',       labirinto: 'tempesta',    tema: 'tempesta' },
  { nome: 'Dorne',                casata: 'Martell',         labirinto: 'dorne',       tema: 'dorne' },
  { nome: 'Approdo del Re',       casata: 'Targaryen',       labirinto: 'trono',       tema: 'trono' }
];

// Tabella dei livelli (requisiti RF7 e RF8): dato il numero del livello,
// dice quale labirinto usare e quanto sono difficili i fantasmi.
function parametriLivello(n) {
  const regno = REGNI[n - 1];
  const speciale = n % OGNI_QUANTI_SPECIALE === 0;
  const ordineSpeciale = Math.floor(n / OGNI_QUANTI_SPECIALE);   // 1 = primo speciale, 2 = secondo...
  const velocita = Math.min(
    VELOCITA_MASSIMA_FANTASMA,
    VELOCITA_FANTASMA + INCREMENTO_VELOCITA * (n - 1) + (speciale ? BONUS_VELOCITA_SPECIALE : 0));
  return {
    numero: n,
    regno: regno.nome,
    casata: regno.casata,
    tema: regno.tema,
    labirinto: regno.labirinto,
    speciale,
    velocitaFantasma: velocita,
    ritardi: RITARDI_FANTASMI.map(r => Math.max(RITARDO_MINIMO, r - RIDUZIONE_RITARDO * (n - 1))),
    durataPotenza: Math.max(DURATA_POTENZA_MINIMA, DURATA_POTENZA - (n - 1)),
    tempoLimite: speciale
      ? Math.max(TEMPO_MINIMO_SPECIALE, TEMPO_LIMITE_SPECIALE - RIDUZIONE_TEMPO_SPECIALE * (ordineSpeciale - 1))
      : null
  };
}
