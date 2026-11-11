// I fantasmi. Hanno tre comportamenti (requisito RF4):
//   insegue  = va verso la cella del giocatore, con il percorso più breve
//   anticipa = va verso la cella che il giocatore raggiungerà tra qualche passo
//   casuale  = a ogni incrocio sceglie una direzione a caso
// Quando il giocatore ha il potenziamento, i fantasmi scappano e si possono mangiare.
// Angolo preferito di ogni fantasma durante la dispersione.
const ANGOLI = {
  insegue: { c: COLONNE - 2, r: 1 },
  anticipa: { c: 1, r: 1 }
};

class Fantasma extends Entita {
  constructor(lab, inizio, giocatore, comportamento, ritardo, velocita) {
    super(lab, inizio, 3, velocita);
    this.giocatore = giocatore;
    this.comportamento = comportamento;
    this.ritardo = ritardo;
    this.modo = 'caccia';   // 'caccia' o 'dispersione' (lo imposta il gioco)
    this.ricomincia();
  }

  // Torna alla partenza e aspetta il proprio turno.
  ricomincia() {
    this.riporta();
    this.attesa = this.ritardo;
    this.spaventato = false;
    this.mangiato = false;
  }

  aggiorna(dt) {
    if (this.attesa > 0) { this.attesa -= dt; return; }
    super.aggiorna(dt);
  }

  get velocitaAttuale() {
    return super.velocitaAttuale * (this.spaventato ? FATTORE_SPAVENTATO : 1) * fattoreFantasmiVista;
  }

  // Cella verso cui il fantasma vuole andare.
  bersaglio() {
    if (this.modo === 'dispersione' && ANGOLI[this.comportamento]) return ANGOLI[this.comportamento];
    const p = this.giocatore;
    let { c, r } = p.cellaReale;
    if (this.comportamento === 'anticipa') {
      for (let i = 0; i < PASSI_ANTICIPO; i++) {
        if (!this.lab.liberoVerso(c, r, p.dir)) break;
        const nc = c + DIREZIONI[p.dir].dc;
        if (nc < 0 || nc >= COLONNE) break;
        c = nc; r += DIREZIONI[p.dir].dr;
      }
    }
    return { c, r };
  }

  scegliDirezione() {
    let opzioni = this.lab.vicini(this.col, this.row);
    // Non torna indietro, a meno che non abbia altra scelta.
    const senzaRetro = opzioni.filter(o => o.dir !== (this.dir + 2) % 4);
    if (senzaRetro.length > 0) opzioni = senzaRetro;
    if (opzioni.length === 0) return -1;

    if (this.spaventato) {                       // scappa dal giocatore
      const p = this.giocatore.cellaReale;
      const dist = this.lab.distanze(p.c, p.r);
      return this.sceglieTra(opzioni, o => -dist[o.r][o.c]);
    }
    if (this.comportamento === 'casuale') {
      return opzioni[Math.floor(Math.random() * opzioni.length)].dir;
    }
    const b = this.bersaglio();
    const dist = this.lab.distanze(b.c, b.r);
    return this.sceglieTra(opzioni, o => dist[o.r][o.c]);
  }

  // Sceglie l'opzione con il valore più basso (a parità, a caso).
  sceglieTra(opzioni, valore) {
    const migliore = Math.min(...opzioni.map(valore));
    const pari = opzioni.filter(o => valore(o) === migliore);
    return pari[Math.floor(Math.random() * pari.length)].dir;
  }
}
