// Le regole del gioco: stati, livelli, vite, punti, contatti, record.
// Non usa p5.js e non disegna: per questo si può provare anche senza browser.
class Gioco {
  // "archivio" (facoltativo) è dove salvare il record: ha leggi(chiave) e scrivi(chiave, valore).
  constructor(archivio) {
    this.archivio = archivio || null;
    this.eventi = [];       // nomi di cose accadute (cibo mangiato, vita persa...): li usano i suoni
    this.record = this.leggiRecord();
    this.nuovoRecord = false;
    this.prova = false;          // modalità prova: non si perdono vite e si può aprire subito il Trono
    this.provaUsata = false;     // se è stata usata in questa partita, il record non conta
    this.nuovaPartita();
    this.stato = 'menu';
  }

  leggiRecord() {
    try {
      const v = Number(this.archivio ? this.archivio.leggi(CHIAVE_RECORD) : 0);
      return isFinite(v) && v > 0 ? v : 0;
    } catch (e) { return 0; }
  }

  // Il record conta solo se si parte dal primo livello (partire più avanti serve per le prove).
  salvaRecord() {
    if (this.livelloPartenza === 1 && !this.provaUsata && this.punti > this.record) {
      this.record = this.punti;
      this.nuovoRecord = true;
      try { if (this.archivio) this.archivio.scrivi(CHIAVE_RECORD, String(this.record)); } catch (e) { /* senza archivio il record dura solo finché la pagina è aperta */ }
    }
  }

  emetti(evento) {
    this.eventi.push(evento);
    if (this.eventi.length > 50) this.eventi.shift();   // se nessuno li legge, non crescono all'infinito
  }

  nuovaPartita(livello = 1) {
    this.vite = VITE_INIZIALI;
    this.nuovoRecord = false;
    this.provaUsata = this.prova;
    this.giocatore = null;
    this.livelloPartenza = livello;
    this.caricaLivello(livello);
  }

  // Prepara il livello n: i punti si portano dietro dal livello prima.
  caricaLivello(n) {
    const punti = this.giocatore ? this.giocatore.punti : 0;
    this.livello = n;
    this.parametri = parametriLivello(n);
    this.lab = new Labirinto(LABIRINTI[this.parametri.labirinto]);
    this.giocatore = new Giocatore(this.lab);
    this.giocatore.punti = punti;
    this.fantasmi = this.lab.inizioFantasmi.map((p, i) => new Fantasma(
      this.lab, p, this.giocatore,
      COMPORTAMENTI[i % COMPORTAMENTI.length],
      this.parametri.ritardi[i % this.parametri.ritardi.length],
      this.parametri.velocitaFantasma));
    this.potenza = 0;                          // secondi rimasti di potenziamento
    this.tempoFase = 0;                        // per alternare dispersione e caccia
    this.tempoRimasto = this.parametri.tempoLimite;   // null se il livello non ha limite
    this.troneAperto = false;                  // si apre quando il cibo è finito (ultimo livello)
    this.modoPrecedente = 'dispersione';
    this.attesa = PAUSA_LIVELLO;
    this.emetti('inizioLivello');
    this.stato = 'pronto';                     // menu, pronto, gioco, vittoria, sconfitta
  }

  get punti() { return this.giocatore.punti; }

  // Fase attuale dei fantasmi: dispersione all'inizio, poi caccia, poi di nuovo.
  get modo() {
    const t = this.tempoFase % (DURATA_DISPERSIONE + DURATA_CACCIA);
    return t < DURATA_DISPERSIONE ? 'dispersione' : 'caccia';
  }

  // Modalità prova (tasto P): niente vite perse né tempo limite, E apre il Trono (o completa il livello).
  // Serve per vedere i livelli e per le dimostrazioni; con la prova attiva il record non conta.
  alternaProva() {
    this.prova = !this.prova;
    if (this.prova) this.provaUsata = true;
  }

  tasto(t) {
    if (t === 'prova') {
      this.alternaProva();
    } else if (t === 'completa') {
      if (this.prova && this.stato === 'gioco') this.lab.cibo.clear();   // finito il cibo: si apre il Trono o si passa al livello dopo
    } else if (t === 'invio') {
      if (this.stato !== 'gioco' && this.stato !== 'pronto') this.nuovaPartita();
    } else if (this.stato === 'menu' && /^[1-8]$/.test(t)) {
      this.nuovaPartita(Number(t));            // dal menu: tasti 1-8 per partire da un livello
    } else if (this.stato === 'gioco' || this.stato === 'pronto') {
      this.giocatore.tasto(t);
    }
  }

  aggiorna(dtSecondi) {
    const dt = Math.min(dtSecondi, DT_MASSIMO);
    if (this.stato === 'pronto') {
      this.attesa -= dt;
      if (this.attesa <= 0) this.stato = 'gioco';
    } else if (this.stato === 'gioco') {
      this.giocatore.aggiorna(dt);
      while (this.giocatore.eventi.length > 0) this.emetti(this.giocatore.eventi.shift());
      if (this.giocatore.potenziamentoPreso) {
        this.giocatore.potenziamentoPreso = false;
        this.potenza = this.parametri.durataPotenza;
        this.fantasmi.forEach(f => { f.mangiato = false; });
      }
      this.potenza = Math.max(0, this.potenza - dt);
      this.tempoFase += dt;
      if (this.modo !== this.modoPrecedente) {
        if (this.modo === 'caccia') this.emetti('caccia');
        this.modoPrecedente = this.modo;
      }
      for (const f of this.fantasmi) {
        f.modo = this.modo;
        f.spaventato = this.potenza > 0 && !f.mangiato;
        f.aggiorna(dt);
      }
      this.controllaContatti();
      if (this.stato === 'gioco' && this.tempoRimasto !== null) {
        const secondiPrima = Math.ceil(this.tempoRimasto);
        if (!this.prova) this.tempoRimasto -= dt;
        if (this.tempoRimasto <= 0) this.perdiVita();      // tempo scaduto
        else if (this.tempoRimasto <= 10 && Math.ceil(this.tempoRimasto) < secondiPrima) this.emetti('tick');
      }
      if (this.stato === 'gioco' && this.lab.cibo.size === 0) this.ciboFinito();
      if (this.stato === 'gioco' && this.troneAperto && this.sulTrono()) this.livelloCompletato();
    }
  }

  // Cibo finito: di solito si passa al livello dopo; nel livello del Trono, invece,
  // il Trono si apre e i fantasmi si disperdono per qualche secondo (per dare una chance).
  ciboFinito() {
    if (!this.lab.trono) { this.livelloCompletato(); return; }
    if (!this.troneAperto) {
      this.troneAperto = true;
      this.tempoFase = 0;
      this.modoPrecedente = 'dispersione';
      this.emetti('troneAperto');
    }
  }

  sulTrono() {
    const t = this.lab.trono;
    return Math.hypot(this.giocatore.x - t.c, this.giocatore.y - t.r) < 0.3;
  }

  livelloCompletato() {
    if (this.livello >= NUMERO_LIVELLI) {
      this.stato = 'vittoria';
      this.salvaRecord();
      this.emetti('vittoria');
    } else {
      this.emetti('livelloCompletato');
      this.caricaLivello(this.livello + 1);
    }
  }

  // Si perde una vita: contatto con un fantasma oppure tempo scaduto.
  perdiVita() {
    this.vite--;
    if (this.vite <= 0) { this.stato = 'sconfitta'; this.salvaRecord(); this.emetti('sconfitta'); return; }
    this.emetti('vitaPersa');
    this.giocatore.riporta();
    this.fantasmi.forEach(f => f.ricomincia());
    this.potenza = 0;
    this.tempoFase = 0;
    this.modoPrecedente = 'dispersione';
    this.tempoRimasto = this.parametri.tempoLimite;
    this.attesa = PAUSA_INIZIO;
    this.stato = 'pronto';
  }

  // Il contatto si controlla sulle posizioni con i decimali: due personaggi
  // che si incrociano in un corridoio si toccano comunque.
  controllaContatti() {
    for (const f of this.fantasmi) {
      if (f.attesa > 0) continue;              // ancora a casa: innocuo
      const d = Math.hypot(f.x - this.giocatore.x, f.y - this.giocatore.y);
      if (d >= DISTANZA_CONTATTO) continue;
      if (f.spaventato) {                      // con il potenziamento si mangia
        this.giocatore.punti += PUNTI_FANTASMA;
        this.emetti('fantasmaMangiato');
        f.riporta();
        f.attesa = PAUSA_RIENTRO;
        f.spaventato = false;
        f.mangiato = true;
      } else if (!this.prova) {
        this.perdiVita();
        return;
      }
    }
  }
}
