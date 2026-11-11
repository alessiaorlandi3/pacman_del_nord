// Prove automatiche sulla logica del gioco (fase 4: verifica).
// Si lanciano con: node verifica.js   (comandi assoluti)  e  node verifica.js relativi
const fs = require('fs');
const vm = require('vm');
const file = ['costanti', 'labirinti', 'labirinto', 'livelli', 'suoni', 'entita', 'giocatore', 'fantasma', 'gioco', 'vista3d', 'modelli', 'ambiente'];
const codice = file.map(f => fs.readFileSync(__dirname + '/' + f + '.js', 'utf8')).join('\n');
const REL = process.argv[2] === 'relativi';
const ctx = vm.createContext({ console, Math });
vm.runInContext(codice.replace('CONTROLLI_RELATIVI = false','CONTROLLI_RELATIVI = ' + REL) + '\nthis.API = { Labirinto, Giocatore, Fantasma, Gioco, LABIRINTI, COLONNE, RIGHE, DIREZIONI, DISTANZA_CONTATTO, DT_MASSIMO, DURATA_POTENZA, PUNTI_FANTASMA, PAUSA_RIENTRO, RITARDI_FANTASMI, DISTANZA_MINIMA_PARTENZA, DURATA_DISPERSIONE, DURATA_CACCIA, parametriLivello, NUMERO_LIVELLI, VELOCITA_MASSIMA_FANTASMA, RITARDO_MINIMO, DURATA_POTENZA_MINIMA, TEMPO_MINIMO_SPECIALE, TEMPO_LIMITE_SPECIALE, PAUSA_LIVELLO, CHIAVE_RECORD, VITE_INIZIALI, ANGOLI, REGNI, MUSICHE, SCALE, semitoni, frequenza, Suoni, EFFETTI_ATTIVI, MODELLI, AMBIENTI, posizioniTorce, Vista3D, DISTANZA_CAMERA, ALTEZZA_CAMERA, CELLA };', ctx);
const A = ctx.API;

let esiti = [], falliti = 0;
function prova(nome, ok, dettaglio) {
  esiti.push((ok ? 'OK       ' : 'FALLITO  ') + nome + (dettaglio ? ' -> ' + dettaglio : ''));
  if (!ok) falliti++;
}
function nuovo(nome) { return new A.Labirinto(A.LABIRINTI[nome]); }

// RF2: nessun vicolo cieco; tutto raggiungibile; RF3: tunnel presenti
for (const nome of Object.keys(A.LABIRINTI)) {
  const lab = nuovo(nome);
  const celle = [];
  for (let r = 0; r < A.RIGHE; r++) for (let c = 0; c < A.COLONNE; c++) if (lab.aperto(c, r)) celle.push({ c, r });
  const vicoli = celle.filter(x => lab.vicini(x.c, x.r).length < 2);
  prova('RF2 ' + nome + ': nessun vicolo cieco', vicoli.length === 0, vicoli.length + ' vicoli');
  const d = lab.distanze(celle[0].c, celle[0].r);
  const irraggiungibili = celle.filter(x => d[x.r][x.c] === Infinity);
  prova('RF2 ' + nome + ': tutte le celle raggiungibili', irraggiungibili.length === 0);
  const okTunnel = lab.tunnel.every(r => lab.aperto(0, r) && lab.aperto(A.COLONNE - 1, r));
  prova('RF3 ' + nome + ': bordi aperti sulle righe del tunnel', okTunnel);
  const g = lab.inizioGiocatore, f = lab.inizioFantasmi[0];
  prova('Partenze ' + nome + ': giocatore e fantasma su celle libere', lab.aperto(g.c, g.r) && lab.aperto(f.c, f.r));
}

// RNF2: la velocità non dipende dai frame (stesso percorso con dt diversi)
function posizioneDopo(dt, secondi) {
  const lab = nuovo('nord'), p = new A.Giocatore(lab);
  for (let t = 0; t < secondi - 1e-9; t += dt) p.aggiorna(dt);
  return { x: p.x, y: p.y };
}
const a = posizioneDopo(1 / 120, 2), b = posizioneDopo(1 / 60, 2), c = posizioneDopo(1 / 20, 2);
const dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
prova('RNF2 stessa posizione dopo 2 s con 120, 60 e 20 FPS', dist(a, b) < 0.05 && dist(a, c) < 0.05,
  JSON.stringify([a, b, c].map(p => [+p.x.toFixed(2), +p.y.toFixed(2)])));

// RF3: passaggio laterale
{
  const lab = nuovo('nord'), p = new A.Giocatore(lab), r = lab.tunnel[0];
  p.col = 3; p.row = r; p.dir = 3; p.prossima = { c: 3, r }; p.fermo = true; p.prog = 0;
  // cammina a sinistra lungo la riga del tunnel fino al bordo e oltre
  let uscito = false, rientrato = false, xMax = 0;
  for (let i = 0; i < 600; i++) {
    p.aggiorna(1 / 60);
    if (p.x < 0) uscito = true;
    if (uscito && p.x > A.COLONNE - 2) rientrato = true;
    if (rientrato) break;
  }
  prova('RF3 chi esce a sinistra rientra a destra sulla stessa riga', uscito && rientrato && p.row === r);
}

// Comandi
if (REL) {
  {
    const lab = nuovo('nord'), p = new A.Giocatore(lab);
    p.col = 1; p.row = 1; p.dir = 1; p.prossima = { c: 1, r: 1 }; p.fermo = true; p.prog = 0;
    p.tasto('destra');   // andando verso est, "destra" = sud
    p.aggiorna(0.01);
    prova('Relativi: andando a est, "destra" gira verso sud', p.dir === 2, 'direzione ' + p.dir);
  }
  {
    const lab = nuovo('nord'), p = new A.Giocatore(lab);
    p.col = 1; p.row = 1; p.dir = 1; p.prossima = { c: 1, r: 1 }; p.fermo = true; p.prog = 0;
    p.tasto('sinistra'); // verso nord c'è il bordo: la svolta resta in attesa
    p.aggiorna(0.01);
    prova('Relativi: svolta impossibile = resta in attesa, si continua dritto', p.dir === 1 && p.richiesta === -1);
  }
} else {
  {
    const lab = nuovo('nord'), p = new A.Giocatore(lab);
    p.col = 1; p.row = 1; p.dir = 1; p.prossima = { c: 1, r: 1 }; p.fermo = true; p.prog = 0;
    p.tasto('giu');      // frecce assolute: giù = verso il basso dello schermo
    p.aggiorna(0.01);
    prova('Assoluti: "giù" porta verso il basso (2) da una cella con sbocco', p.dir === 2, 'direzione ' + p.dir);
  }
  {
    const lab = nuovo('nord'), p = new A.Giocatore(lab);
    p.col = 1; p.row = 1; p.dir = 1; p.prossima = { c: 1, r: 1 }; p.fermo = true; p.prog = 0;
    p.tasto('su');       // verso l'alto c'è il bordo: resta in attesa, si continua dritto
    p.aggiorna(0.01);
    prova('Assoluti: svolta impossibile = in attesa, si continua dritto', p.dir === 1 && p.richiesta === 0);
  }
  {
    const lab = nuovo('nord'), p = new A.Giocatore(lab);
    p.col = 3; p.row = 1; p.dir = 1; p.prossima = { c: 3, r: 1 }; p.fermo = true; p.prog = 0;
    p.aggiorna(0.01);
    p.tasto('sinistra'); // direzione opposta: inversione immediata
    prova('Assoluti: la freccia opposta inverte subito la marcia', p.dir === 3, 'direzione ' + p.dir);
  }
}
// Inversione anche quando il personaggio è fermo contro un muro (errore trovato nella prova v1)
{
  const lab = nuovo('nord'), p = new A.Giocatore(lab);
  p.col = 3; p.row = 1; p.dir = 1; p.prossima = { c: 3, r: 1 }; p.fermo = true; p.prog = 0;
  p.aggiorna(1.5);   // va a destra fino al muro (colonna 3) e si ferma
  p.tasto(REL ? 'giu' : 'sinistra');
  p.aggiorna(0.2);
  prova('Giocatore bloccato contro un muro: il comando opposto lo fa tornare indietro', p.dir === 3 && p.x < 3.9, 'x ' + p.x.toFixed(2) + ' dir ' + p.dir);
}

// RF5: due personaggi che si incrociano si toccano comunque (niente scambio "fantasma")
{
  const g = new A.Gioco(); g.nuovaPartita(); g.stato = 'gioco';
  const lab = g.lab, p = g.giocatore, f = g.fantasmi[0];
  f.attesa = 0; g.tempoFase = A.DURATA_DISPERSIONE + 1;   // fase di caccia
  p.col = 2; p.row = 11; p.dir = 1; p.prossima = { c: 2, r: 11 }; p.fermo = true; p.prog = 0;
  f.col = 3; f.row = 11; f.dir = 3; f.prossima = { c: 3, r: 11 }; f.fermo = true; f.prog = 0;
  const viteInizio = g.vite;
  for (let i = 0; i < 20 && g.vite === viteInizio; i++) g.aggiorna(1 / 60);
  prova('RF5 incrocio frontale in corridoio: contatto rilevato', g.vite === viteInizio - 1);
}

// RF4 (primo fantasma): insegue con il percorso più breve e raggiunge il giocatore fermo
{
  const g = new A.Gioco(); g.nuovaPartita(); g.stato = 'gioco';
  g.giocatore.velocita = 0;
  const viteInizio = g.vite;
  let t = 0;
  for (; t < 30 && g.vite === viteInizio; t += 1 / 60) g.aggiorna(1 / 60);
  prova('Fantasma raggiunge un giocatore fermo entro 30 s', g.vite < viteInizio, t.toFixed(1) + ' s');
}

// Cibo e vittoria
{
  const g = new A.Gioco(); g.nuovaPartita();
  const totale = g.lab.cibo.size;
  prova('Cibo contato dal labirinto (nessun numero scritto a mano)', totale > 0, totale + ' pezzi');
}

// Sconfitta e riavvio
{
  const g = new A.Gioco(); g.nuovaPartita(); g.stato = 'gioco'; g.vite = 1;
  const p = g.giocatore, f = g.fantasmi[0];
  f.attesa = 0;
  f.col = p.col; f.row = p.row; f.prossima = { c: p.col, r: p.row }; f.prog = 0; f.fermo = true;
  g.aggiorna(1 / 60);
  const perso = g.stato === 'sconfitta';
  g.tasto('invio');
  prova('Sconfitta a 0 vite e riavvio con INVIO', perso && g.stato === 'pronto' && g.vite === 3);
}

// RF6: potenziamenti
for (const nome of Object.keys(A.LABIRINTI)) {
  const lab = nuovo(nome);
  prova('RF6 ' + nome + ': 4 sfere di potenziamento sul percorso', lab.potenziamenti.size === 4 && [...lab.potenziamenti].every(k => lab.cibo.has(k)));
}
function posiziona(e, c, r, dir) { e.col = c; e.row = r; e.dir = dir; e.prossima = { c, r }; e.prog = 0; e.fermo = true; }
{
  const g = new A.Gioco(); g.nuovaPartita(); g.stato = 'gioco';
  const p = g.giocatore, f = g.fantasmi[0];
  g.fantasmi.forEach(x => { x.attesa = 0; });
  posiziona(p, 1, 2, 0);                 // (1,1) è una sfera: ci arriva salendo
  posiziona(f, 19, 11, 3);
  for (let i = 0; i < 30; i++) g.aggiorna(1 / 60);
  prova('RF6 raccogliere la sfera attiva il potere e spaventa i fantasmi', g.potenza > A.DURATA_POTENZA - 0.5 && g.fantasmi.every(x => x.spaventato), 'potere ' + g.potenza.toFixed(1));
  const punti = g.giocatore.punti, vite = g.vite;
  posiziona(f, p.col, p.row, 0); f.attesa = 0;
  g.aggiorna(1 / 60);
  prova('RF6 con il potere, toccare un fantasma lo mangia (+200) senza perdere vite',
    g.vite === vite && g.giocatore.punti === punti + A.PUNTI_FANTASMA && f.attesa === A.PAUSA_RIENTRO, 'punti ' + (g.giocatore.punti - punti));
  g.potenza = 0.01; g.aggiorna(0.05);
  prova('RF6 finito il potere i fantasmi tornano pericolosi', g.fantasmi.every(x => !x.spaventato));
}
// Fantasma spaventato: si allontana
{
  const g = new A.Gioco(); g.nuovaPartita(); g.stato = 'gioco';
  const p = g.giocatore, f = g.fantasmi[0];
  f.attesa = 0;
  p.velocita = 0; posiziona(p, 3, 1, 1); posiziona(f, 7, 1, 1);
  g.potenza = 5;
  const d0 = g.lab.distanze(3, 1)[f.cellaReale.r][f.cellaReale.c];
  for (let i = 0; i < 120; i++) { g.potenza = 5; g.aggiorna(1 / 60); }
  const fc = f.cellaReale, d1 = g.lab.distanze(3, 1)[fc.r][fc.c];
  prova('RF6 un fantasma spaventato si allontana dal giocatore', d1 > d0, d0 + ' -> ' + d1 + ' celle');
}
// RF4: comportamenti diversi
{
  const g = new A.Gioco(); g.nuovaPartita();
  const p = g.giocatore, [fi, fa, fc] = g.fantasmi;
  posiziona(p, 1, 1, 1);
  const bi = fi.bersaglio(), ba = fa.bersaglio();
  prova('RF4 "insegue" punta alla cella del giocatore', bi.c === 1 && bi.r === 1);
  prova('RF4 "anticipa" punta più avanti, lungo la direzione del giocatore', ba.r === 1 && ba.c > 1, 'cella (' + ba.c + ',' + ba.r + ')');
  prova('RF4 i tre fantasmi hanno comportamenti diversi', new Set(g.fantasmi.map(x => x.comportamento)).size === 3);
  // "casuale" non torna indietro se può andare avanti
  let tornaIndietro = 0, prove = 0;
  for (let i = 0; i < 500; i++) {
    posiziona(fc, 10, 5, 3);             // arriva da destra: dietro di lui è a destra
    const d = fc.scegliDirezione(); prove++;
    if (d === (fc.dir + 2) % 4) tornaIndietro++;
  }
  prova('RF4 "casuale" non fa inversioni inutili', tornaIndietro === 0, tornaIndietro + ' su ' + prove);
  // partenza scaglionata
  const g2 = new A.Gioco(); g2.nuovaPartita(); g2.stato = 'gioco';
  const [, f2] = g2.fantasmi, x0 = f2.x, y0 = f2.y;
  for (let i = 0; i < 180; i++) g2.aggiorna(1 / 60);   // 3 secondi: il secondo parte a 4 s
  prova('Il secondo fantasma resta a casa per ' + A.RITARDI_FANTASMI[1] + ' s', f2.x === x0 && f2.y === y0);
}
// Un fantasma ancora a casa non fa danni
{
  const g = new A.Gioco(); g.nuovaPartita(); g.stato = 'gioco';
  const p = g.giocatore, f = g.fantasmi[2];
  g.fantasmi.forEach(x => { x.attesa = 0; }); posiziona(g.fantasmi[0], 1, 11, 1); posiziona(g.fantasmi[1], 19, 11, 3);
  f.attesa = 5; posiziona(f, p.col, p.row, 1); p.velocita = 0;
  const vite = g.vite; g.aggiorna(1 / 60);
  prova('Un fantasma ancora a casa non toglie vite', g.vite === vite);
}

// Difficoltà all'inizio (problema emerso dalla prova di gioco con la v2)
for (const nome of Object.keys(A.LABIRINTI)) {
  const lab = nuovo(nome), f = lab.inizioFantasmi[0], d = lab.distanze(f.c, f.r), s = lab.inizioGiocatore;
  prova('Partenza ' + nome + ': giocatore a ' + A.DISTANZA_MINIMA_PARTENZA + '+ celle dai fantasmi', d[s.r][s.c] >= A.DISTANZA_MINIMA_PARTENZA, d[s.r][s.c] + ' celle');
  const p = new A.Giocatore(lab), v = lab.vicini(s.c, s.r);
  const scelto = v.find(x => x.dir === p.dir), maxd = Math.max(...v.map(x => d[x.r][x.c]));
  prova('Partenza ' + nome + ': il giocatore parte allontanandosi dai fantasmi', scelto && d[scelto.r][scelto.c] === maxd);
}
{
  const g = new A.Gioco(); g.nuovaPartita(); g.stato = 'gioco';
  prova('Fasi: si parte dalla dispersione', g.modo === 'dispersione');
  g.tempoFase = A.DURATA_DISPERSIONE + 0.1;
  prova('Fasi: dopo la dispersione c\'è la caccia', g.modo === 'caccia');
  g.tempoFase = A.DURATA_DISPERSIONE + A.DURATA_CACCIA + 0.1;
  prova('Fasi: poi si ricomincia dalla dispersione', g.modo === 'dispersione');
  const [fi, fa] = g.fantasmi;
  fi.modo = 'dispersione'; fa.modo = 'dispersione';
  const bi = fi.bersaglio(), ba = fa.bersaglio();
  prova('Fasi: in dispersione ogni fantasma va al proprio angolo', bi.c !== ba.c && bi.r === 1 && ba.r === 1);
  fi.modo = 'caccia';
  const pc = g.giocatore.cellaReale, bc = fi.bersaglio();
  prova('Fasi: in caccia "insegue" torna sul giocatore', bc.c === pc.c && bc.r === pc.r);
}

// RF7 e RF8: livelli e regni
{
  const P = A.parametriLivello, L = Array.from({ length: A.NUMERO_LIVELLI }, (_, i) => P(i + 1));
  const speciali = L.filter(l => l.speciale);
  prova('RF12 ci sono 8 livelli: uno per regno più il Trono', A.NUMERO_LIVELLI === 8 && A.REGNI.length === 8);
  prova('RF12 ogni livello ha un labirinto diverso dagli altri',
    L.every(l => A.LABIRINTI[l.labirinto]) && new Set(L.map(l => A.LABIRINTI[l.labirinto].righe.join(''))).size === 8);
  prova('RF7 il livello 1 è il Nord, senza tempo limite', L[0].labirinto === 'nord' && !L[0].speciale && L[0].tempoLimite === null);
  prova('RF8 sono speciali solo il livello 4 e l\'8, e solo loro hanno il tempo limite',
    speciali.map(l => l.numero).join() === '4,8' && L.every(l => (l.tempoLimite !== null) === l.speciale));
  prova('RF7 nei livelli normali i fantasmi diventano più veloci',
    L.filter(l => !l.speciale).every((l, i, a) => i === 0 || l.velocitaFantasma > a[i - 1].velocitaFantasma),
    L.map(l => l.velocitaFantasma.toFixed(2)).join(' '));
  prova('RF8 il secondo livello speciale è più difficile del primo (più veloce, meno tempo)',
    P(8).velocitaFantasma > P(4).velocitaFantasma && P(8).tempoLimite < P(4).tempoLimite && P(8).tempoLimite >= A.TEMPO_MINIMO_SPECIALE,
    P(4).velocitaFantasma.toFixed(2) + ' -> ' + P(8).velocitaFantasma.toFixed(2) + ', ' + P(4).tempoLimite + ' s -> ' + P(8).tempoLimite + ' s');
  prova('La velocità dei fantasmi non supera mai il massimo', L.every(l => l.velocitaFantasma <= A.VELOCITA_MASSIMA_FANTASMA));
  prova('RF7 ritardi dei fantasmi e potere: mai sotto i minimi', L.every(l => l.ritardi.every(r => r >= A.RITARDO_MINIMO) && l.durataPotenza >= A.DURATA_POTENZA_MINIMA));
  prova('Solo l\'ultimo labirinto ha il Trono', L.every(l => !!A.LABIRINTI[l.labirinto].trono === (l.numero === 8)));
  const ang = Object.values(A.ANGOLI);
  prova('Gli angoli della dispersione sono celle libere in tutti i labirinti',
    Object.keys(A.LABIRINTI).every(n => ang.every(a => nuovo(n).aperto(a.c, a.r))));
}
{
  const g = new A.Gioco(); g.nuovaPartita(); g.stato = 'gioco';
  g.giocatore.punti = 700; g.vite = 2; g.lab.cibo.clear(); g.aggiorna(1 / 60);
  prova('RF7 finito il cibo si passa al livello 2, con punti e vite conservati',
    g.livello === 2 && g.stato === 'pronto' && g.punti === 700 && g.vite === 2 && g.lab.cibo.size > 0);
  g.caricaLivello(4); g.stato = 'gioco';
  prova('RF8 il livello 4 ha due tunnel e il tempo limite', g.lab.tunnel.length === 2 && g.tempoRimasto === A.parametriLivello(4).tempoLimite);
  g.tempoRimasto = 0.01; const v = g.vite;
  g.fantasmi.forEach(f => { f.attesa = 99; });
  g.aggiorna(0.05);
  prova('RF8 tempo scaduto = si perde una vita e il tempo riparte', g.vite === v - 1 && g.tempoRimasto === A.parametriLivello(4).tempoLimite && g.stato === 'pronto');
}
// Il Trono (livello 8)
{
  const g = new A.Gioco(); g.nuovaPartita(8); g.stato = 'gioco';
  g.fantasmi.forEach(f => { f.attesa = 99; });
  const t = g.lab.trono, p = g.giocatore;
  prova('Trono: la cella è libera e senza cibo', g.lab.aperto(t.c, t.r) && !g.lab.cibo.has(t.c + ',' + t.r));
  p.velocita = 0;
  posiziona(p, t.c, t.r, 1); g.aggiorna(1 / 60);
  prova('Trono chiuso: finché c\'è cibo, raggiungerlo non fa vincere', g.stato === 'gioco' && !g.troneAperto);
  const s = g.lab.inizioGiocatore; posiziona(p, s.c, s.r, 1);
  g.lab.cibo.clear(); g.aggiorna(1 / 60);
  prova('Trono: finito il cibo si apre, la partita continua e i fantasmi si disperdono',
    g.troneAperto && g.stato === 'gioco' && g.modo === 'dispersione');
  posiziona(p, t.c, t.r, 1); g.aggiorna(1 / 60);
  prova('Trono aperto: raggiungerlo fa vincere la partita', g.stato === 'vittoria');
}
{
  const g = new A.Gioco();
  g.tasto('5');
  prova('Dal menu i tasti 1-8 fanno partire dal livello scelto', g.livello === 5 && g.stato === 'pronto');
  g.tasto('2'); prova('I tasti numerici non fanno nulla durante la partita', g.livello === 5);
}

// RF9: record
{
  const salvati = { [A.CHIAVE_RECORD]: '500' };
  const archivio = { leggi: k => salvati[k], scrivi: (k, v) => { salvati[k] = v; } };
  let g = new A.Gioco(archivio);
  prova('RF9 il record salvato viene letto all\'avvio', g.record === 500);
  g.nuovaPartita(); g.stato = 'gioco'; g.giocatore.punti = 300; g.vite = 1; g.perdiVita();
  prova('RF9 un punteggio più basso non cambia il record', g.record === 500 && salvati[A.CHIAVE_RECORD] === '500' && !g.nuovoRecord);
  g.nuovaPartita(); g.stato = 'gioco'; g.giocatore.punti = 900; g.vite = 1; g.perdiVita();
  prova('RF9 un punteggio più alto diventa il nuovo record e viene salvato', g.record === 900 && salvati[A.CHIAVE_RECORD] === '900' && g.nuovoRecord);
  const g2 = new A.Gioco(archivio);
  prova('RF9 il record resta anche dopo aver ricaricato la pagina', g2.record === 900);
  const g4 = new A.Gioco(archivio);
  g4.nuovaPartita(4); g4.stato = 'gioco'; g4.giocatore.punti = 5000; g4.vite = 1; g4.perdiVita();
  prova('RF9 partendo da un livello avanzato il record non cambia', g4.record === 900 && !g4.nuovoRecord);
  const g3 = new A.Gioco({ leggi: () => { throw new Error('non disponibile'); }, scrivi: () => { throw new Error('non disponibile'); } });
  g3.nuovaPartita(); g3.giocatore.punti = 50; g3.vite = 1; g3.perdiVita();
  prova('RF9 se il browser non può salvare, il gioco funziona lo stesso', g3.stato === 'sconfitta' && g3.record === 50);
}

// Musica e suoni (RF13): i dati musicali sono corretti
{
  const temi = A.REGNI.map(r => r.tema);
  prova('RF13 ogni regno ha la sua musica', temi.every(x => A.MUSICHE[x]) && new Set(temi).size === 8);
  const problemi = [];
  for (const [nome, m] of Object.entries(A.MUSICHE)) {
    if (!A.SCALE[m.scala]) problemi.push(nome + ': scala sconosciuta');
    if (m.accordi.length !== m.melodia.length) problemi.push(nome + ': accordi e battute diversi');
    if (m.ritmo.length !== m.battute * 2) problemi.push(nome + ': ritmo di lunghezza sbagliata');
    m.melodia.forEach((b, i) => {
      const somma = b.reduce((s, n) => s + n[1], 0);
      if (Math.abs(somma - m.battute) > 1e-9) problemi.push(nome + ' battuta ' + (i + 1) + ': durata ' + somma + ' invece di ' + m.battute);
      b.forEach(([g]) => {
        if (g === null) return;
        const midi = m.tonica + 12 * m.ottava + A.semitoni(m.scala, g);
        if (midi < 43 || midi > 90) problemi.push(nome + ': nota fuori registro (' + midi + ')');
      });
    });
    const basso = m.tonica - 12 + A.semitoni(m.scala, Math.min(...m.accordi));
    if (basso < 28) problemi.push(nome + ': basso troppo grave');
  }
  prova('RF13 melodie: durate giuste, note nella scala e nel registro, ritmi coerenti', problemi.length === 0, problemi.join('; '));
  const firme = Object.values(A.MUSICHE).map(m => [m.scala, m.bpm, m.voce, m.tonica].join('|'));
  prova('RF13 le musiche dei regni si distinguono (scala, tempo, strumento)', new Set(firme).size === 8);
  prova('Formula delle note: il La4 è a 440 Hz e un\'ottava sopra è il doppio', Math.abs(A.frequenza(69) - 440) < 1e-9 && Math.abs(A.frequenza(81) - 880) < 1e-6);
}
// Gli effetti: quelli frequenti sono spenti, quelli importanti abbassano la musica
{
  const contaSuoni = { oscillatori: 0, abbassamenti: 0 };
  const param = () => ({ value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}, cancelScheduledValues() {}, setTargetAtTime() { contaSuoni.abbassamenti++; } });
  const nodo = () => ({ connect() {}, disconnect() {}, start() {}, stop() {}, gain: param(), frequency: param(), detune: param(), Q: param(), threshold: param(), ratio: param(), type: '' });
  const finto = {
    currentTime: 0, sampleRate: 8000, state: 'running', destination: nodo(),
    createGain: nodo, createBiquadFilter: nodo, createDynamicsCompressor: nodo, createBufferSource: nodo,
    createOscillator() { contaSuoni.oscillatori++; return nodo(); },
    createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) })
  };
  const s = new A.Suoni(finto);
  s.effetto('cibo');
  prova('Effetti: il "tic" del cibo è spento, per non coprire la musica', contaSuoni.oscillatori === 0 && A.EFFETTI_ATTIVI.cibo === false);
  s.effetto('caccia');
  prova('Effetti: anche il corno della caccia è spento (i tamburi bastano)', contaSuoni.oscillatori === 0);
  s.effetto('vitaPersa');
  prova('Effetti importanti: suonano e abbassano la musica', contaSuoni.oscillatori > 0 && contaSuoni.abbassamenti >= 2);
  const prima = contaSuoni.oscillatori; s.alternaMuto(); s.effetto('vitaPersa');
  prova('Con l\'audio spento nessun effetto viene programmato', contaSuoni.oscillatori === prima);
}
// Gli eventi che i suoni ascoltano
{
  const g = new A.Gioco(); g.nuovaPartita(); g.stato = 'gioco';
  const ev = () => g.eventi.splice(0);
  prova('Evento "inizioLivello" all\'avvio di un livello', g.eventi.includes('inizioLivello')); ev();
  const p = g.giocatore, f = g.fantasmi[0]; g.fantasmi.forEach(x => { x.attesa = 99; });
  posiziona(p, 1, 9, 0); for (let i = 0; i < 40; i++) g.aggiorna(1 / 60);
  prova('Evento "cibo" quando si mangia', ev().includes('cibo'));
  posiziona(p, 1, 2, 0); for (let i = 0; i < 30; i++) g.aggiorna(1 / 60);
  prova('Evento "potenziamento" quando si prende la sfera', ev().includes('potenziamento'));
  g.fantasmi.forEach(x => { x.attesa = 0; });
  posiziona(f, p.col, p.row, 0); f.attesa = 0; g.aggiorna(1 / 60);
  prova('Evento "fantasmaMangiato"', ev().includes('fantasmaMangiato'));
  g.potenza = 0; g.fantasmi.forEach(x => { x.attesa = 0; x.spaventato = false; x.mangiato = false; });
  posiziona(f, p.col, p.row, 0); g.aggiorna(1 / 60);
  prova('Evento "vitaPersa" al contatto con un fantasma', ev().includes('vitaPersa'));
  g.stato = 'gioco'; g.vite = 1; g.fantasmi.forEach(x => { x.attesa = 0; }); posiziona(g.fantasmi[0], g.giocatore.col, g.giocatore.row, 0);
  g.aggiorna(1 / 60);
  prova('Evento "sconfitta" quando finiscono le vite', ev().includes('sconfitta'));
}
{
  const g = new A.Gioco(); g.nuovaPartita(); g.stato = 'gioco'; g.fantasmi.forEach(x => { x.attesa = 99; }); g.eventi.length = 0;
  g.lab.cibo.clear(); g.aggiorna(1 / 60);
  prova('Evento "livelloCompletato" e poi "inizioLivello" del successivo', g.eventi.join() === 'livelloCompletato,inizioLivello', g.eventi.join());
  const h = new A.Gioco(); h.nuovaPartita(8); h.stato = 'gioco'; h.fantasmi.forEach(x => { x.attesa = 99; }); h.eventi.length = 0;
  h.giocatore.velocita = 0; h.lab.cibo.clear(); h.aggiorna(1 / 60);
  const t = h.lab.trono; posiziona(h.giocatore, t.c, t.r, 1); h.aggiorna(1 / 60);
  prova('Eventi "troneAperto" e poi "vittoria"', h.eventi.join() === 'troneAperto,vittoria', h.eventi.join());
}
{
  const g = new A.Gioco(); g.nuovaPartita(); g.stato = 'gioco'; g.fantasmi.forEach(x => { x.attesa = 99; }); g.eventi.length = 0;
  g.giocatore.velocita = 0; g.tempoFase = A.DURATA_DISPERSIONE - 0.02;
  for (let i = 0; i < 6; i++) g.aggiorna(1 / 60);
  prova('Evento "caccia" quando comincia la fase di caccia', g.eventi.includes('caccia'));
}
{
  const g = new A.Gioco(); g.nuovaPartita(4); g.stato = 'gioco'; g.fantasmi.forEach(x => { x.attesa = 99; }); g.eventi.length = 0;
  g.giocatore.velocita = 0; g.tempoRimasto = 10.5;
  for (let i = 0; i < 60 * 11; i++) g.aggiorna(1 / 60);
  const tick = g.eventi.filter(e => e === 'tick').length;
  prova('Livello speciale: un "tick" al secondo negli ultimi 10 secondi', tick >= 9 && tick <= 11, tick + ' tick');
  const h = new A.Gioco(); for (let i = 0; i < 200; i++) h.emetti('cibo');
  prova('Gli eventi non letti non si accumulano all\'infinito', h.eventi.length <= 50);
}

// Prova a caso: 5 minuti di gioco simulato con comandi casuali, nessun errore
{
  const g = new A.Gioco(); g.nuovaPartita();
  const tasti = ['su', 'giu', 'sinistra', 'destra'];
  let ok = true, partite = 0;
  for (let i = 0; i < 18000; i++) {
    if (Math.random() < 0.05) g.tasto(tasti[Math.floor(Math.random() * 4)]);
    g.aggiorna(1 / 60 + (Math.random() < 0.02 ? 0.2 : 0)); // ogni tanto un frame molto lungo
    for (const e of [g.giocatore, ...g.fantasmi]) {
      const c = Math.round(e.x), r = Math.round(e.y);
      if (!isFinite(e.x) || !isFinite(e.y) || !g.lab.aperto(c, r)) ok = false;
    }
    if (g.stato === 'sconfitta' || g.stato === 'vittoria') { partite++; g.tasto('invio'); }
  }
  prova('Simulazione casuale di 5 minuti: sempre su celle libere, nessun errore', ok, partite + ' partite finite');
}

// RF19: ogni regno ha la sua atmosfera; le torce stanno su muri che affacciano su un corridoio
{
  let ok = true, dettaglio = [];
  for (let n = 1; n <= A.NUMERO_LIVELLI; n++) {
    const tema = A.parametriLivello(n).tema, s = A.AMBIENTI[tema];
    if (s && s.decor && !['leone', 'deserto', 'castello'].includes(s.decor)) ok = false;
    if (!s || !s.nebbia || !s.particelle || s.particelle.conta <= 0 || s.nebbia[1] >= s.nebbia[2] || !s.cima || !s.texture) ok = false;
    const lab = nuovo(A.parametriLivello(n).labirinto);
    const torce = A.posizioniTorce(lab, s ? s.torce : 0);
    for (const t of torce) if (lab.righe[t.r][t.c] !== '#' || !lab.aperto(t.c + t.dc, t.r + t.dr)) ok = false;
    dettaglio.push(tema + ':' + torce.length);
  }
  prova('RF19 atmosfera per regno (nebbia, aria, texture) e torce su muri affacciati ai corridoi', ok, 'torce per livello ' + dettaglio.join(' '));
}

// RF17: i modelli 3D (mostri) sono dati validi: triangoli completi, colori per ogni vertice, numeri finiti
{
  let ok = true, dettaglio = [];
  for (const [nome, m] of Object.entries(A.MODELLI)) {
    const validi = m.pos.length % 9 === 0 && m.pos.length === m.col.length && m.pos.length > 0 &&
      m.pos.every(Number.isFinite) && m.col.every(c => Number.isFinite(c) && c >= 0 && c <= 1) &&
      m.altezza > 0 && m.larghezza > 0;
    if (!validi) ok = false;
    dettaglio.push(nome + ' ' + m.pos.length / 9 + ' triangoli');
  }
  prova('RF17 modelli 3D: dati completi e validi (' + Object.keys(A.MODELLI).length + ' modelli)', ok && Object.keys(A.MODELLI).length >= 5 && !!A.MODELLI.cavaliere && ['corpo','bracciaD','bracciaS','gambaD','gambaS'].every(k => A.MODELLI.cavaliere.parti[k] && A.MODELLI.cavaliere.parti[k].pos.length % 9 === 0 && A.MODELLI.cavaliere.parti[k].pos.length > 0), dettaglio.join(', '));
}

// RF18: una svolta prenotata senza strada libera scade (il personaggio non gira da solo più avanti)
{
  const lab = nuovo('nord'), g = new A.Giocatore(lab);
  // Un corridoio lungo e dritto con i muri ai lati, ma qui basta controllare il meccanismo della scadenza.
  g.richiesta = 1; g.scadenzaRichiesta = 1.0;
  const rel = vm.runInContext('CONTROLLI_RELATIVI', ctx);
  for (let i = 0; i < 40; i++) g.aggiorna(0.05);           // 2 secondi
  prova('RF18 svolta prenotata scade dopo 1 s (solo comandi relativi)', rel ? g.richiesta === null : true, rel ? 'comandi relativi' : 'saltata (comandi assoluti)');
}

// RF20: modalità prova: nessuna vita persa, tempo fermo, E apre il Trono; il record non conta
{
  const g = new A.Gioco({ leggi: () => null, scrivi: () => {} });
  g.tasto('prova');
  g.nuovaPartita(8); g.stato = 'gioco';
  const tempo = g.tempoRimasto, vite = g.vite;
  g.fantasmi.forEach(f => { f.attesa = 0; f.col = g.giocatore.col; f.row = g.giocatore.row; f.prossima = { c: f.col, r: f.row }; f.spaventato = false; });
  for (let i = 0; i < 40; i++) g.aggiorna(0.05);
  const okVite = g.vite === vite && g.stato === 'gioco', okTempo = g.tempoRimasto === tempo;
  g.tasto('completa'); g.aggiorna(0.05);
  prova('RF20 prova: nessuna vita persa nemmeno col contatto, tempo fermo, E apre il Trono', okVite && okTempo && g.troneAperto, 'vite ' + g.vite + ', Trono aperto ' + g.troneAperto);
  g.giocatore.punti = 999999; g.salvaRecord();
  prova('RF20 prova: il record non si salva', g.record === 0);
  g.tasto('prova'); g.nuovaPartita(1); g.stato = 'gioco'; g.fantasmi.forEach(f => { f.attesa = 0; f.col = g.giocatore.col; f.row = g.giocatore.row; f.prossima = { c: f.col, r: f.row }; f.spaventato = false; });
  g.aggiorna(0.05);
  prova('RF20 senza prova il contatto fa perdere una vita', g.vite < vite);
}

// RF16: guida alle svolte: sinistra + avanti + destra + indietro = numero di strade della cella
{
  let ok = true, n = 0;
  for (const nome of Object.keys(A.LABIRINTI)) {
    const lab = nuovo(nome), g = new A.Giocatore(lab);
    for (let r = 0; r < A.RIGHE; r++) for (let c = 0; c < A.COLONNE; c++) {
      if (!lab.aperto(c, r) || c === 0 || c === A.COLONNE - 1) continue;
      for (let d = 0; d < 4; d++) {
        g.col = c; g.row = r; g.prossima = { c, r }; g.fermo = true; g.dir = d;
        const u = g.uscite(), dietro = lab.liberoVerso(c, r, (d + 2) % 4);
        const somma = (u.sinistra ? 1 : 0) + (u.avanti ? 1 : 0) + (u.destra ? 1 : 0) + (dietro ? 1 : 0);
        if (somma !== lab.vicini(c, r).length) ok = false;
        n++;
      }
    }
  }
  prova('RF16 guida svolte: sinistra+avanti+destra+indietro = strade della cella (' + n + ' casi)', ok);
}

// RF15: in 3D i fantasmi sono più lenti, in 2D no
{
  const g = new A.Gioco({ leggi: () => null, scrivi: () => {} });
  g.nuovaPartita(1);
  const f = g.fantasmi[0];
  const v2d = f.velocitaAttuale;
  vm.runInContext('fattoreFantasmiVista = FATTORE_FANTASMI_3D', ctx);
  const v3d = f.velocitaAttuale;
  vm.runInContext('fattoreFantasmiVista = 1', ctx);
  prova('RF15 fantasmi più lenti nella vista 3D e invariati in 2D', Math.abs(v3d / v2d - 0.75) < 1e-9 && Math.abs(v2d - f.velocita) < 1e-9, v2d.toFixed(2) + ' -> ' + v3d.toFixed(2) + ' celle/s');
}

// RF14: vista 3D in terza persona (la parte geometrica, senza disegnare)
{
  const V = A.Vista3D, K = A.CELLA;
  // la camera sta dietro al personaggio rispetto alla direzione di marcia, per tutte e 4 le direzioni
  let ok = true;
  for (let d = 0; d < 4; d++) {
    const ang = V.angoloDirezione(d), dir = A.DIREZIONI[d];
    const cam = V.posizioneCamera(300, 200, ang);
    const dx = (300 - cam.occhio.x) / K, dz = (200 - cam.occhio.z) / K;       // dalla camera al personaggio
    if (Math.abs(dx - dir.dc * A.DISTANZA_CAMERA) > 1e-6 || Math.abs(dz - dir.dr * A.DISTANZA_CAMERA) > 1e-6) ok = false;
    if (cam.occhio.y >= 0 || cam.mira.y >= 0) ok = false;                      // in alto (y negativo)
  }
  prova('RF14 camera 3D: dietro al personaggio per ogni direzione, sopra il pavimento', ok);
  // rotazione: sempre il verso più breve, mai oltre mezzo giro
  let okRot = true;
  for (let a = -6; a <= 6; a += 0.37) for (let b = -6; b <= 6; b += 0.41) {
    const d = V.differenzaAngoli(a, b);
    if (Math.abs(d) > Math.PI + 1e-9) okRot = false;
    if (Math.abs(Math.cos(a + d) - Math.cos(b)) > 1e-9 || Math.abs(Math.sin(a + d) - Math.sin(b)) > 1e-9) okRot = false;
  }
  prova('RF14 rotazione camera: verso più breve e arriva all\'angolo giusto', okRot);
  // mondo 3D = mappa 2D: la cella (c,r) sta in x=(c+0.5)K, z=(r+0.5)K (stessa disposizione della minimappa)
  prova('RF14 coordinate 3D coerenti con la mappa', V.mondoX(3) === 3.5 * K && V.mondoZ(2) === 2.5 * K);
}

console.log(esiti.join('\n'));
console.log('\n' + (falliti === 0 ? 'Tutte le prove superate.' : falliti + ' prova/e fallita/e.'));
process.exit(falliti === 0 ? 0 : 1);
