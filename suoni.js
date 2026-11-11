// Suoni e musica generati dal browser con la Web Audio API: nessun file audio,
// quindi nessuna licenza da citare. Le melodie sono composizioni originali:
// non riprendono nessun tema della serie. Ogni regno ha la sua musica (modo,
// ritmo e strumenti diversi); gli effetti imitano campane, corni, tamburi e gong.
// Questo file non conosce le regole del gioco: riceve solo nomi di eventi.

function frequenza(notaMidi) { return 440 * Math.pow(2, (notaMidi - 69) / 12); }

const SCALE = {
  minore:            [0, 2, 3, 5, 7, 8, 10],
  dorica:            [0, 2, 3, 5, 7, 9, 10],
  misolidia:         [0, 2, 4, 5, 7, 9, 10],
  lidia:             [0, 2, 4, 6, 7, 9, 11],
  frigia:            [0, 1, 3, 5, 7, 8, 10],
  minoreArmonica:    [0, 2, 3, 5, 7, 8, 11],
  frigiaDominante:   [0, 1, 4, 5, 7, 8, 10]
};

// Grado della scala (anche oltre l'ottava o sotto lo zero) -> semitoni dalla tonica.
function semitoni(scala, grado) {
  const s = SCALE[scala];
  return s[((grado % 7) + 7) % 7] + 12 * Math.floor(grado / 7);
}

// Una musica per regno. "battute" = pulsazioni in ogni battuta. Le battute sono liste di [grado, durata in pulsazioni]; null = pausa.
// accordi: grado della nota di basso di ogni battuta. ritmo: un carattere per mezza
// pulsazione ('x' = tamburo grave, 'o' = tamburo piccolo, '.' = niente).
const MUSICHE = {
  nord: { tonica: 50, scala: 'minore', bpm: 60, battute: 4, ottava: 0, voce: 'campana', basso: 'drone', vento: true,
    accordi: [0, 5, 3, 4, 0, 5, 6, 0], ritmo: 'x.......',
    melodia: [[[7, 3], [9, 1]], [[8, 2], [6, 2]], [[5, 4]], [[4, 2], [null, 2]],
              [[7, 2], [11, 2]], [[10, 3], [9, 1]], [[8, 2], [6, 2]], [[7, 4]]] },
  isole_fiumi: { tonica: 57, scala: 'minore', bpm: 96, battute: 6, ottava: -1, voce: 'archi', basso: 'drone', vento: false,
    accordi: [0, 6, 3, 0, 0, 6, 4, 0], ritmo: 'x.....x.....',
    melodia: [[[7, 1], [8, 1], [9, 1], [11, 2], [9, 1]], [[8, 1], [9, 1], [10, 1], [9, 2], [8, 1]],
              [[9, 1], [10, 1], [11, 1], [13, 2], [11, 1]], [[10, 2], [9, 1], [8, 1], [7, 2]],
              [[7, 1], [8, 1], [9, 1], [11, 2], [13, 1]], [[12, 1], [11, 1], [10, 1], [9, 2], [8, 1]],
              [[11, 2], [10, 1], [9, 1], [8, 2]], [[7, 6]]] },
  valle: { tonica: 52, scala: 'dorica', bpm: 54, battute: 4, ottava: -1, voce: 'archi', basso: 'drone', vento: true,
    accordi: [0, 3, 0, 6, 0, 3, 6, 0], ritmo: 'x.......',
    melodia: [[[9, 2], [11, 2]], [[10, 3], [9, 1]], [[11, 2], [13, 2]], [[12, 4]],
              [[9, 2], [11, 2]], [[10, 2], [8, 2]], [[9, 3], [7, 1]], [[7, 4]]] },
  roccia: { tonica: 55, scala: 'minoreArmonica', bpm: 84, battute: 4, ottava: -1, voce: 'corno', basso: 'drone', vento: false,
    accordi: [0, 5, 3, 4, 0, 5, 4, 0], ritmo: 'x...x.o.',
    melodia: [[[7, 1], [7, 0.5], [9, 0.5], [10, 2]], [[9, 1], [9, 0.5], [11, 0.5], [12, 2]],
              [[10, 1], [10, 0.5], [12, 0.5], [13, 2]], [[11, 2], [10, 1], [9, 1]],
              [[7, 1], [7, 0.5], [9, 0.5], [10, 2]], [[9, 1], [9, 0.5], [11, 0.5], [14, 2]],
              [[13, 1], [12, 1], [11, 1], [10, 1]], [[7, 4]]] },
  altopiano: { tonica: 53, scala: 'dorica', bpm: 66, battute: 4, ottava: -1, voce: 'archi', basso: 'drone', vento: false,
    accordi: [0, 4, 5, 2, 0, 4, 1, 0], ritmo: 'o...o...',
    melodia: [[[7, 1], [9, 1], [11, 1], [9, 1]], [[8, 1], [10, 1], [12, 1], [10, 1]],
              [[9, 1], [11, 1], [13, 1], [11, 1]], [[10, 2], [9, 1], [8, 1]],
              [[7, 1], [9, 1], [11, 1], [14, 1]], [[13, 1], [12, 1], [11, 1], [9, 1]],
              [[8, 2], [10, 1], [8, 1]], [[7, 4]]] },
  tempesta: { tonica: 48, scala: 'frigia', bpm: 88, battute: 4, ottava: 0, voce: 'corno', basso: 'drone', vento: true,
    accordi: [0, 1, 0, 6, 0, 1, 5, 0], ritmo: 'x.o.x.x.',
    melodia: [[[7, 1.5], [null, 0.5], [7, 0.5], [8, 1.5]], [[10, 1], [9, 1], [8, 2]],
              [[7, 1.5], [null, 0.5], [7, 0.5], [9, 1.5]], [[8, 2], [6, 2]],
              [[11, 1.5], [null, 0.5], [11, 0.5], [12, 1.5]], [[13, 1], [12, 1], [11, 2]],
              [[10, 2], [9, 1], [8, 1]], [[7, 4]]] },
  dorne: { tonica: 57, scala: 'frigiaDominante', bpm: 84, battute: 4, ottava: -1, voce: 'liuto', basso: 'drone', vento: false,
    accordi: [0, 1, 0, 0, 0, 6, 1, 0], ritmo: 'x..ox...',
    melodia: [[[7, 0.5], [8, 0.5], [9, 0.5], [8, 0.5], [7, 1], [null, 1]], [[9, 0.5], [10, 0.5], [11, 0.5], [10, 0.5], [9, 2]],
              [[8, 0.5], [9, 0.5], [10, 0.5], [9, 0.5], [8, 1], [7, 1]], [[7, 2], [null, 2]],
              [[11, 0.5], [12, 0.5], [13, 0.5], [12, 0.5], [11, 1], [null, 1]], [[10, 0.5], [9, 0.5], [8, 0.5], [9, 0.5], [10, 1], [9, 1]],
              [[9, 1], [8, 1], [7, 2]], [[7, 3], [null, 1]]] },
  trono: { tonica: 50, scala: 'minore', bpm: 76, battute: 4, ottava: 0, voce: 'corno', basso: 'drone', vento: false,
    accordi: [0, 5, 3, 4, 0, 6, 5, 4], ritmo: 'x...o.x.',
    melodia: [[[7, 2], [11, 1], [9, 1]], [[8, 2], [7, 1], [6, 1]], [[9, 2], [10, 1], [9, 1]], [[11, 3], [10, 1]],
              [[7, 1], [11, 1], [14, 2]], [[13, 1], [12, 1], [11, 1], [10, 1]], [[12, 2], [11, 1], [9, 1]], [[11, 3], [null, 1]]] }
};

// Quali effetti suonare (false = silenzio). Gli effetti molto frequenti (il cibo, ogni
// pochi decimi di secondo) coprono la musica: per questo sono spenti. Si riaccendono qui.
const EFFETTI_ATTIVI = {
  cibo: false, caccia: false,
  inizioLivello: false, tick: true, potenziamento: true, fantasmaMangiato: true,
  vitaPersa: true, livelloCompletato: true, troneAperto: true, vittoria: true, sconfitta: true
};

// Mentre suona un effetto importante la musica si abbassa per questi secondi,
// così gli effetti non si accavallano alla musica.
const ABBASSAMENTO_MUSICA = {
  inizioLivello: 1.0, potenziamento: 0.6, fantasmaMangiato: 1.0, vitaPersa: 1.8,
  livelloCompletato: 2.0, troneAperto: 2.6, vittoria: 4.5, sconfitta: 4.5
};
const VOLUME_MUSICA = 0.4, VOLUME_MUSICA_ABBASSATA = 0.14;

class Suoni {
  // Nel gioco si usa new Suoni(); per le prove si può passare un contesto audio "offline".
  constructor(contestoEsterno) {
    this.ctx = contestoEsterno || null;
    this.esterno = !!contestoEsterno;
    this.muto = false;
    this.intensita = 0;      // 0 = dispersione, 1 = caccia (entrano i tamburi), 2 = potere
    this.tema = null;
    this.timer = null;
    this.contaCibo = 0;
    if (this.ctx) this.prepara();
  }

  // Il browser permette di far partire l'audio solo dopo un gesto dell'utente (un tasto).
  avvia() {
    if (!this.ctx) {
      try {
        const Contesto = window.AudioContext || window.webkitAudioContext;
        if (!Contesto) return;
        this.ctx = new Contesto();
        this.prepara();
      } catch (e) { this.ctx = null; return; }
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  prepara() {
    const c = this.ctx;
    this.master = c.createGain();
    this.master.gain.value = this.muto ? 0 : 0.7;
    const compressore = c.createDynamicsCompressor();   // evita distorsioni quando i suoni si sommano
    compressore.threshold.value = -20; compressore.ratio.value = 4;
    this.master.connect(compressore); compressore.connect(c.destination);
    this.gEffetti = c.createGain(); this.gEffetti.gain.value = 0.5; this.gEffetti.connect(this.master);
    this.gMusica = c.createGain(); this.gMusica.gain.value = VOLUME_MUSICA; this.gMusica.connect(this.master);
    // Rumore bianco di 2 secondi: serve per vento, tuono e colpi di tamburo.
    const n = c.sampleRate * 2, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    let seme = 12345;
    for (let i = 0; i < n; i++) { seme = (seme * 1103515245 + 12345) & 0x7fffffff; d[i] = (seme / 0x7fffffff) * 2 - 1; }
    this.bufferRumore = b;
  }

  alternaMuto() {
    this.muto = !this.muto;
    if (this.master) this.master.gain.value = this.muto ? 0 : 0.7;
    return this.muto;
  }

  // ---------- strumenti di base ----------
  now() { return this.ctx.currentTime; }

  // Una nota: oscillatore + inviluppo (attacco, tenuta, rilascio) + filtro facoltativo.
  nota(tipo, freq, t, dur, vol, opz = {}) {
    const c = this.ctx, dest = opz.dest || this.gEffetti;
    const att = opz.att === undefined ? 0.01 : opz.att, rel = opz.rel === undefined ? 0.2 : opz.rel;
    const o = c.createOscillator(); o.type = tipo; o.frequency.setValueAtTime(freq, t);
    if (opz.detune) o.detune.value = opz.detune;
    if (opz.vibrato) {
      const lfo = c.createOscillator(), gl = c.createGain();
      lfo.frequency.value = 5.2; gl.gain.value = freq * 0.006;
      lfo.connect(gl); gl.connect(o.frequency); lfo.start(t); lfo.stop(t + dur + rel + 0.05);
    }
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + att);
    g.gain.setValueAtTime(vol, t + Math.max(att, dur));
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(att, dur) + rel);
    let uscita = o;
    if (opz.filtro) {
      const f = c.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 0.7;
      f.frequency.setValueAtTime(opz.filtroInizio || opz.filtro, t);
      if (opz.filtroInizio) f.frequency.exponentialRampToValueAtTime(opz.filtro, t + (opz.filtroTempo || 0.2));
      o.connect(f); uscita = f;
    }
    uscita.connect(g); g.connect(dest);
    o.start(t); o.stop(t + Math.max(att, dur) + rel + 0.05);
  }

  colpoRumore(t, dur, vol, freqFiltro, tipoFiltro, dest) {
    const c = this.ctx, s = c.createBufferSource(); s.buffer = this.bufferRumore;
    const f = c.createBiquadFilter(); f.type = tipoFiltro || 'bandpass'; f.frequency.value = freqFiltro || 1500;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest || this.gEffetti);
    s.start(t); s.stop(t + dur + 0.05);
  }

  tamburo(t, vol, grave, dest) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    const f0 = grave ? 150 : 220, f1 = grave ? 48 : 90, dur = grave ? 0.45 : 0.2;
    o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + 0.14);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || this.gEffetti); o.start(t); o.stop(t + dur + 0.05);
    this.colpoRumore(t, 0.04, vol * 0.4, 900, 'highpass', dest);
  }

  campana(freq, t, vol, dest) {
    const parziali = [[1, 1, 2.6], [2.76, 0.35, 1.8], [5.4, 0.12, 1.1]];   // poche note acute: suono meno "cristallino"
    for (const [r, v, d] of parziali) this.nota('sine', freq * r, t, 0.005, vol * v, { att: 0.003, rel: d, dest });
  }

  corno(freq, t, dur, vol, dest) {
    this.nota('sawtooth', freq, t, dur, vol, { att: 0.07, rel: 0.25, filtro: 1000, filtroInizio: 300, filtroTempo: 0.2, dest });
    this.nota('sawtooth', freq, t, dur, vol * 0.6, { att: 0.07, rel: 0.25, filtro: 850, filtroInizio: 250, filtroTempo: 0.18, detune: 7, dest });
  }

  pizzico(freq, t, vol, tipo, dest) {
    this.nota(tipo || 'triangle', freq, t, 0.02, vol, { att: 0.004, rel: 0.4, filtro: 300, filtroInizio: 1600, filtroTempo: 0.3, dest });
  }

  // Archi (violoncelli): due onde a dente di sega leggermente stonate, attacco lento, suono scuro.
  archi(freq, t, dur, vol, dest) {
    for (const det of [-7, 7]) this.nota('sawtooth', freq, t, dur, vol, { att: 0.25, rel: 0.45, filtro: 900, detune: det, vibrato: true, dest });
  }

  flauto(freq, t, dur, vol, dest) {
    this.nota('sine', freq, t, dur, vol, { att: 0.12, rel: 0.3, vibrato: true, dest });
    this.nota('triangle', freq * 2, t, dur, vol * 0.18, { att: 0.12, rel: 0.3, dest });
  }

  drone(freq, t, dur, vol, dest) {
    for (const [r, v, det] of [[1, 1, -6], [1, 1, 6], [1.5, 0.55, 0]]) {
      this.nota('sawtooth', freq * r, t, dur, vol * v, { att: 0.5, rel: 0.7, filtro: 420, detune: det, dest });
    }
  }

  gong(t, vol) {
    for (const [f, v, d] of [[98, 1, 3.5], [147, 0.7, 3.2], [233, 0.5, 2.6], [331, 0.35, 2.0], [521, 0.2, 1.4]]) {
      this.nota('sine', f, t, 0.01, vol * v, { att: 0.005, rel: d });
    }
    this.colpoRumore(t, 0.5, vol * 0.3, 2500, 'bandpass');
  }

  // ---------- musica ----------
  // Chiamata a ogni frame dal gioco: se il tema è già in corso non fa nulla.
  musica(tema) {
    if (!this.ctx || !MUSICHE[tema] || this.tema === tema) return;
    this.fermaMusica();
    this.tema = tema;
    this.barra = 0;
    this.proxima = this.now() + 0.2;
    this.busMusica = this.ctx.createGain();
    this.busMusica.gain.setValueAtTime(0.0001, this.now());
    this.busMusica.gain.linearRampToValueAtTime(1, this.now() + 0.6);
    this.busMusica.connect(this.gMusica);
    this.pianifica(this.now() + 1.5);
    if (!this.esterno) this.timer = setInterval(() => this.pianifica(this.now() + 1.5), 100);
  }

  fermaMusica() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    if (this.busMusica) {
      const bus = this.busMusica, t = this.now();
      bus.gain.cancelScheduledValues(t);
      bus.gain.setValueAtTime(bus.gain.value, t);
      bus.gain.linearRampToValueAtTime(0.0001, t + 0.4);
      setTimeout(() => { try { bus.disconnect(); } catch (e) { /* già scollegato */ } }, 1000);
      this.busMusica = null;
    }
    this.tema = null;
  }

  // Programma le battute che iniziano prima di "fino": si richiama spesso e non ripete.
  pianifica(fino) {
    if (!this.tema || !this.busMusica) return;
    const m = MUSICHE[this.tema], pulsazione = 60 / m.bpm;
    while (this.proxima < fino) {
      this.battuta(m, this.barra, this.proxima, pulsazione);
      this.proxima += pulsazione * m.battute;
      this.barra++;
    }
  }

  battuta(m, indice, t, pulsazione) {
    const dest = this.busMusica, b = indice % m.melodia.length, durata = pulsazione * m.battute;
    const radice = m.tonica - 12 + semitoni(m.scala, m.accordi[b]);
    if (m.basso === 'drone') {
      this.drone(frequenza(radice), t, durata - 0.2, 0.07, dest);
    } else {
      for (let i = 0; i < m.battute; i += 2) this.pizzico(frequenza(radice), t + i * pulsazione, 0.22, 'triangle', dest);
    }
    let tt = t;
    for (const [grado, dur] of m.melodia[b]) {
      if (grado !== null) {
        const f = frequenza(m.tonica + 12 * m.ottava + semitoni(m.scala, grado));
        if (m.voce === 'campana') this.campana(f, tt, 0.16, dest);
        else if (m.voce === 'flauto') this.flauto(f, tt, dur * pulsazione * 0.95, 0.12, dest);
        else if (m.voce === 'archi') this.archi(f, tt, dur * pulsazione * 0.95, 0.07, dest);
        else if (m.voce === 'liuto') this.pizzico(f, tt, 0.16, 'triangle', dest);
        else if (m.voce === 'pizzico') this.pizzico(f, tt, 0.2, 'sawtooth', dest);
        else this.corno(f, tt, dur * pulsazione * 0.9, 0.1, dest);
      }
      tt += dur * pulsazione;
    }
    if (m.vento) this.colpoRumore(t, durata, 0.05, 500 + 200 * (b % 3), 'bandpass', dest);
    if (this.intensita >= 1 && m.ritmo) {
      const passo = pulsazione / 2;
      for (let i = 0; i < m.ritmo.length; i++) {
        const c = m.ritmo[i], tp = t + i * passo;
        if (c === 'x') this.tamburo(tp, 0.5, true, dest);
        else if (c === 'o') this.tamburo(tp, 0.22, false, dest);
        else if (this.intensita >= 2) this.tamburo(tp, 0.1, false, dest);   // potere: ritmo più fitto
      }
    }
  }

  // ---------- effetti ----------
  abbassaMusica(t, durata) {
    const g = this.gMusica.gain;
    g.cancelScheduledValues(t);
    g.setTargetAtTime(VOLUME_MUSICA_ABBASSATA, t, 0.05);
    g.setTargetAtTime(VOLUME_MUSICA, t + durata, 0.3);
  }

  effetto(nome, quando) {
    if (!this.ctx || this.muto || !EFFETTI_ATTIVI[nome]) return;
    const t = quando === undefined ? this.now() : quando, f = frequenza;
    if (ABBASSAMENTO_MUSICA[nome]) this.abbassaMusica(t, ABBASSAMENTO_MUSICA[nome]);
    switch (nome) {
      case 'cibo': {                                   // spento di default (vedi EFFETTI_ATTIVI)
        const note = [64, 67, 69, 67, 71, 67];
        this.pizzico(f(note[this.contaCibo++ % note.length]), t, 0.2, 'triangle');
        break;
      }
      case 'potenziamento':                            // corno grave che sale + tamburo
        this.corno(f(45), t, 0.22, 0.1); this.corno(f(52), t + 0.12, 0.2, 0.1);   // breve: circa mezzo secondo
        this.tamburo(t, 0.4, true);
        break;
      case 'fantasmaMangiato':
        this.tamburo(t, 0.5, true); this.campana(f(55), t + 0.05, 0.12);
        break;
      case 'vitaPersa':                                // tre note discendenti di corno grave
        this.corno(f(50), t, 0.3, 0.14); this.corno(f(46), t + 0.4, 0.3, 0.14); this.corno(f(38), t + 0.8, 0.9, 0.14);
        this.tamburo(t + 0.8, 0.55, true);
        break;
      case 'inizioLivello':
        this.campana(f(62), t, 0.12);
        break;
      case 'caccia':                                   // corno basso: i fantasmi attaccano
        this.corno(f(38), t, 0.7, 0.1); this.tamburo(t + 0.1, 0.35, true);
        break;
      case 'tick':                                     // un colpo sordo, come un legno
        this.nota('triangle', 520, t, 0.02, 0.12, { att: 0.002, rel: 0.06 });
        break;
      case 'troneAperto':                              // gong e accordo grave che si apre
        this.gong(t, 0.3);
        for (const n of [38, 45, 50, 53]) this.nota('sawtooth', f(n), t + 0.1, 1.8, 0.05, { att: 0.9, rel: 1.3, filtro: 700 });
        break;
      case 'livelloCompletato':                        // breve fanfara in tre note, grave
        this.corno(f(43), t, 0.3, 0.12); this.corno(f(50), t + 0.34, 0.3, 0.12); this.corno(f(55), t + 0.68, 1.0, 0.14);
        this.campana(f(67), t + 0.7, 0.1);
        break;
      case 'vittoria': {                               // fanfara lunga in tonalità grave
        const accordi = [[38, 45, 54], [43, 50, 59], [45, 52, 61], [50, 57, 66]];
        accordi.forEach((a, i) => a.forEach(n => this.corno(f(n), t + i * 0.6, i === 3 ? 2.6 : 0.55, 0.09)));
        for (let i = 0; i < 6; i++) this.tamburo(t + i * 0.2, 0.25, false);
        [62, 66, 69, 74].forEach((n, i) => this.campana(f(n), t + 1.8 + i * 0.3, 0.09));
        this.gong(t + 1.85, 0.22);
        break;
      }
      case 'sconfitta':                                // rintocchi lenti e corno basso
        for (let i = 0; i < 3; i++) { this.campana(f(48 - i * 2), t + i * 1.2, 0.16); this.tamburo(t + i * 1.2, 0.4, true); }
        this.corno(f(36), t + 0.2, 3.2, 0.1);
        break;
    }
  }
}
