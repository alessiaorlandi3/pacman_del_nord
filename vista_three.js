// Vista 3D con Three.js (più realistica della vista p5): luci, nebbia, personaggi con modelli veri.
// Come le altre viste, LEGGE lo stato del gioco e non lo cambia mai.
//
// Il mondo 3D usa 1 unità = 1 cella: colonna -> asse X, riga -> asse Z, altezza -> asse Y (verso l'alto).
// La scena viene disegnata da Three.js in un suo canvas e poi incollata nella finestra di p5,
// sotto la barra in alto e sotto le minimappe.
//
// Se Three.js non si carica o qualcosa va storto, lo sketch ripiega da solo sulla vista p5 (vista3d.js).

// Come mostrare ogni modello (i modelli sono in modelli.js, generato da tools/bake.py):
//   fronte  = angolo (nel piano X/Z del modello) verso cui "guarda" il modello com'è stato disegnato
//   altezza = altezza voluta in celle;  larghezza = ingombro massimo in celle (i corridoi sono larghi 1)
//   quota   = a che altezza da terra sta (i pipistrelli volano)
const CONFIGURAZIONE_MODELLI = {
  scheletro:   { fronte: Math.PI / 2, altezza: 0.95, larghezza: 0.95, quota: 0 },
  pipistrello: { fronte: Math.PI / 2, altezza: 0.8,  larghezza: 1.0,  quota: 0.28, volo: true },
  drago:       { fronte: Math.PI / 2, altezza: 1.0,  larghezza: 1.0,  quota: 0.15 },
  slime:       { fronte: 0,           altezza: 0.6,  larghezza: 0.85, quota: 0, gelatina: true },
  cavaliere:   { fronte: Math.PI / 2, altezza: 0.95, larghezza: 0.9,  quota: 0 }
};

// Quale modello usa ogni comportamento (nell'ultimo livello l'inseguitore è il drago).
function modelloPerFantasma(comportamento, tema) {
  if (comportamento === 'insegue') return tema === 'trono' ? 'drago' : 'scheletro';
  if (comportamento === 'anticipa') return 'pipistrello';
  return 'slime';
}

class VistaThree {
  constructor(larghezza, altezza) {
    if (typeof THREE === 'undefined') throw new Error('Three.js non caricato');
    this.larghezza = larghezza;
    this.altezza = altezza;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(RISOLUZIONE_3D);
    this.renderer.setSize(larghezza, altezza);
    this.scena = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, larghezza / altezza, 0.1, 60);
    this.angolo = null;                 // direzione della camera (radianti)
    this.chiave = null;                 // livello per cui è costruita la scena
    this.statico = null;                // muri, pavimento, trono
    this.fantasmiRif = null;            // l'elenco di fantasmi per cui sono costruiti gli oggetti 3D
    this.oggettiFantasmi = [];
    this.giocatore = this.creaGiocatore();
    this.scena.add(this.giocatore.gruppo);
    this.luceCielo = new THREE.HemisphereLight(0xb8c4ff, 0x20202a, 0.85);
    this.luceSole = new THREE.DirectionalLight(0xffffff, 0.55);
    this.luceSole.position.set(-3, 8, 4);
    this.torcia = new THREE.PointLight(0xffc880, 1.3, 7, 2);   // la lanterna del viandante
    this.scena.add(this.luceCielo, this.luceSole, this.torcia);
    // Due luci delle torce a muro: sempre le stesse due luci, spostate sulle torce più vicine (così la scena non va ricompilata).
    this.luciTorce = [0, 1].map(() => { const l = new THREE.PointLight(0xff9a40, 0, 5, 2); this.scena.add(l); return l; });
    this.particelle = null;
    this.torce = [];
    this.lampo = 0; this.prossimoLampo = 5;
    this.luceBase = 0.85;
    this.d = new THREE.Object3D();      // di servizio, per calcolare le matrici delle istanze
  }

  static colore(c, fattore = 1) {
    return new THREE.Color(Math.min(1, c[0] * fattore / 255), Math.min(1, c[1] * fattore / 255), Math.min(1, c[2] * fattore / 255));
  }

  // ---- costruzione di ciò che non cambia durante un livello ----
  costruisci(g) {
    const tema = TEMI[g.parametri.tema];
    if (this.statico) {
      this.scena.remove(this.statico);
      this.statico.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    }
    const gruppo = new THREE.Group();
    const lab = g.lab;
    const muri = [], aperte = [];
    for (let r = 0; r < RIGHE; r++) for (let c = 0; c < COLONNE; c++) (lab.righe[r][c] === '#' ? muri : aperte).push({ c, r });

    const H = ALTEZZA_MURI;
    const amb = AMBIENTI[g.parametri.tema];
    const seme = g.livello * 101;
    const muro = new THREE.InstancedMesh(new THREE.BoxGeometry(0.98, H, 0.98), new THREE.MeshStandardMaterial({ map: creaTexturaMuro(amb.texture, amb.baseMuro || tema.muro, amb.luminosita, seme), roughness: 0.95 }), muri.length);
    const cima = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.06, 1), new THREE.MeshStandardMaterial({ color: VistaThree.colore(amb.cima), roughness: 0.9 }), muri.length);
    const fregio = amb.fregio ? new THREE.InstancedMesh(new THREE.BoxGeometry(1.01, 0.1, 1.01), new THREE.MeshStandardMaterial({ color: VistaThree.colore(amb.fregio), roughness: 0.4, metalness: 0.25, emissive: VistaThree.colore(amb.fregio, 0.1) }), muri.length * (amb.fregioBase ? 2 : 1)) : null;
    muri.forEach((m, i) => {
      // Altezza irregolare (siepi): un numero fisso per ogni muro, così non cambia mai.
      const h = H * (1 + ((m.c * 37 + m.r * 59) % 100 / 100 - 0.5) * 2 * (amb.variazioneAltezza || 0));
      this.d.scale.set(1, h / H, 1);
      this.d.position.set(m.c + 0.5, h / 2, m.r + 0.5); this.d.updateMatrix(); muro.setMatrixAt(i, this.d.matrix);
      this.d.scale.set(1, 1, 1);
      this.d.position.set(m.c + 0.5, h, m.r + 0.5); this.d.updateMatrix(); cima.setMatrixAt(i, this.d.matrix);
      if (fregio) {
        this.d.position.set(m.c + 0.5, h - 0.2, m.r + 0.5); this.d.updateMatrix(); fregio.setMatrixAt(i, this.d.matrix);
        if (amb.fregioBase) { this.d.position.set(m.c + 0.5, 0.07, m.r + 0.5); this.d.updateMatrix(); fregio.setMatrixAt(muri.length + i, this.d.matrix); }
      }
    });
    if (fregio) { fregio.frustumCulled = false; gruppo.add(fregio); }
    const piastrelle = new THREE.InstancedMesh(new THREE.BoxGeometry(0.96, 0.02, 0.96), new THREE.MeshStandardMaterial({ map: amb.pavimento ? creaTexturaMuro(amb.pavimento, amb.pavimentoColore || [150, 128, 96], 0.9, seme + 7) : creaTexturaMuro('pietra', tema.sfondo.map(x => x * 3 + 25), 0.9, seme + 7), roughness: 0.9 }), aperte.length);
    aperte.forEach((m, i) => { this.d.position.set(m.c + 0.5, 0.01, m.r + 0.5); this.d.updateMatrix(); piastrelle.setMatrixAt(i, this.d.matrix); });
    const pavimento = new THREE.Mesh(new THREE.PlaneGeometry(COLONNE + 16, RIGHE + 16), new THREE.MeshStandardMaterial({ color: amb.suolo ? VistaThree.colore(amb.suolo) : VistaThree.colore(tema.sfondo, 1.6), roughness: 1 }));
    pavimento.rotation.x = -Math.PI / 2;
    pavimento.position.set(COLONNE / 2, 0, RIGHE / 2);
    for (const m of [muro, cima, piastrelle]) m.frustumCulled = false;   // le istanze non hanno un riquadro proprio in questa versione
    gruppo.add(pavimento, piastrelle, muro, cima);

    // Cibo e potenziamenti: istanze che si aggiornano a ogni fotogramma (si mangiano).
    this.cibo = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshBasicMaterial({ color: VistaThree.colore(tema.cibo) }), lab.cibo.size + 4);
    this.potenziamenti = new THREE.InstancedMesh(new THREE.SphereGeometry(0.2, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.78, 0.24) }), 8);
    this.cibo.frustumCulled = false; this.potenziamenti.frustumCulled = false;
    gruppo.add(this.cibo, this.potenziamenti);

    this.materialeTrono = null;
    if (lab.trono) gruppo.add(this.creaTrono(lab.trono));

    this.decora(gruppo, lab, amb);

    // Torce sui muri: un sostegno scuro e una fiammella (le due più vicine al giocatore illuminano davvero).
    this.torce = posizioniTorce(lab, amb.torce);
    const sostegno = new THREE.BoxGeometry(0.07, 0.2, 0.07), fiamma = new THREE.SphereGeometry(0.075, 8, 6);
    const matSostegno = new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 1 }), matFiamma = new THREE.MeshBasicMaterial({ color: 0xffa83c });
    for (const t of this.torce) {
      const x = t.c + 0.5 + t.dc * 0.52, z = t.r + 0.5 + t.dr * 0.52;
      const s = new THREE.Mesh(sostegno, matSostegno); s.position.set(x, 0.72, z);
      t.fiamma = new THREE.Mesh(fiamma, matFiamma); t.fiamma.position.set(x, 0.88, z);
      t.x = x; t.z = z;
      gruppo.add(s, t.fiamma);
    }

    this.statico = gruppo;
    this.scena.add(gruppo);
    // Atmosfera del regno: nebbia, luci, aria animata.
    const [coloreNebbia, vicino, lontano] = amb.nebbia;
    this.scena.background = VistaThree.colore(coloreNebbia);
    this.scena.fog = new THREE.Fog(VistaThree.colore(coloreNebbia), vicino, lontano);
    this.luceCielo.color.setHex(amb.cielo[0]); this.luceCielo.groundColor.setHex(amb.cielo[1]);
    this.luceBase = amb.cielo[2]; this.luceCielo.intensity = this.luceBase;
    this.luceSole.color.setHex(amb.sole[0]); this.luceSole.intensity = amb.sole[1];
    if (this.particelle) this.particelle.elimina(this.scena);
    this.particelle = new Particelle(this.scena, amb.particelle);
    this.ambiente = amb;
  }

  // Decorazioni speciali di alcuni regni (vedi 'decor' in AMBIENTI).
  decora(gruppo, lab, amb) {
    if (!amb.decor) return;
    const rnd = casualeConSeme(99);
    const mat = (colore, extra = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: VistaThree.colore(colore), roughness: 0.8 }, extra));
    const mesh = (geometria, materiale, x, y, z) => { const m = new THREE.Mesh(geometria, materiale); m.position.set(x, y, z); gruppo.add(m); return m; };

    if (amb.decor === 'leone') {
      // Stendardi cremisi con un disco d'oro, appesi ai muri che affacciano sui corridoi.
      const stendardo = mat([138, 16, 32], { emissive: VistaThree.colore([138, 16, 32], 0.12) });
      const oro = mat([212, 175, 55], { metalness: 0.3, roughness: 0.4, emissive: VistaThree.colore([212, 175, 55], 0.12) });
      const geo = new THREE.SphereGeometry(0.1, 10, 8);
      for (const t of posizioniTorce(lab, 7, 3)) {
        const sx = t.dc !== 0, x = t.c + 0.5 + t.dc * 0.52, z = t.r + 0.5 + t.dr * 0.52;
        mesh(new THREE.BoxGeometry(sx ? 0.03 : 0.42, 0.75, sx ? 0.42 : 0.03), stendardo, x, 0.72, z);
        const disco = mesh(geo, oro, x + t.dc * 0.02, 0.8, z + t.dr * 0.02);
        disco.scale.set(sx ? 0.25 : 1, 1, sx ? 1 : 0.25);
      }
    } else if (amb.decor === 'deserto') {
      const argilla = mat([181, 83, 46]), sabbia = mat(amb.suolo), tronco = mat([110, 78, 44]), verde = mat([70, 120, 50]);
      const giara = new THREE.CylinderGeometry(0.1, 0.13, 0.28, 10), collo = new THREE.SphereGeometry(0.075, 8, 6);
      for (const t of posizioniTorce(lab, 6, 2)) {               // giare di terracotta ai piedi dei muri
        const x = t.c + 0.5 + t.dc * 0.36, z = t.r + 0.5 + t.dr * 0.36;
        mesh(giara, argilla, x, 0.15, z); mesh(collo, argilla, x, 0.33, z);
      }
      for (let i = 0; i < 9; i++) {                              // palme e cactus fuori dalle mura
        const a = i / 9 * Math.PI * 2 + rnd() * 0.4;
        const x = COLONNE / 2 + Math.cos(a) * (COLONNE / 2 + 2.5 + rnd() * 2), z = RIGHE / 2 + Math.sin(a) * (RIGHE / 2 + 2.5 + rnd() * 2);
        if (i % 3 === 2) {                                       // cactus
          mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.8, 8), verde, x, 0.4, z);
          mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 6), verde, x + 0.16, 0.55, z);
          mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 6), verde, x - 0.16, 0.45, z);
        } else {                                                 // palma
          mesh(new THREE.CylinderGeometry(0.07, 0.11, 2.2, 8), tronco, x, 1.1, z);
          for (let k = 0; k < 6; k++) {
            const foglia = mesh(new THREE.SphereGeometry(0.5, 6, 4), verde, x + Math.cos(k) * 0.4, 2.2, z + Math.sin(k) * 0.4);
            foglia.scale.set(1, 0.12, 0.3); foglia.rotation.y = -k; foglia.rotation.z = -0.3;
          }
        }
      }
    } else if (amb.decor === 'castello') {
      // La grande sala: quattro muri alti attorno al labirinto, con colonne, finestre accese e stendardi.
      const alto = 4.5, margine = 3.5;
      const lati = [
        { x: COLONNE / 2, z: -margine, lx: COLONNE + 8, lz: 1, nz: 1 },            // nord (guarda a sud)
        { x: COLONNE / 2, z: RIGHE + margine, lx: COLONNE + 8, lz: 1, nz: -1 },     // sud
        { x: -margine, z: RIGHE / 2, lx: 1, lz: RIGHE + 8, nx: 1 },                 // ovest
        { x: COLONNE + margine, z: RIGHE / 2, lx: 1, lz: RIGHE + 8, nx: -1 }        // est
      ];
      const finestra = new THREE.MeshBasicMaterial({ color: 0xffdca0 });
      const colonna = mat([160, 160, 172]), stendardo = mat([120, 14, 28], { emissive: VistaThree.colore([120, 14, 28], 0.12) });
      for (const l of lati) {
        const t = creaTexturaMuro('pietra', amb.baseMuro, 0.9, 11);
        t.repeat.set(Math.max(l.lx, l.lz) / 2, alto / 2);
        mesh(new THREE.BoxGeometry(l.lx, alto, l.lz), new THREE.MeshStandardMaterial({ map: t, roughness: 0.95 }), l.x, alto / 2, l.z);
        const lungo = l.nz !== undefined;                                // muro nord/sud (lungo X) oppure ovest/est (lungo Z)
        const faccia = lungo ? l.z + l.nz * 0.5 : l.x + l.nx * 0.5;     // dove si trova la faccia rivolta verso il labirinto
        const verso = lungo ? l.nz : l.nx;                              // da che parte è "dentro"
        const lunghezza = lungo ? COLONNE : RIGHE;
        const xz = (lungo_, attraverso) => lungo ? [lungo_, attraverso] : [attraverso, lungo_];
        for (let lungoPos = 1.5; lungoPos < lunghezza; lungoPos += 3) {
          const [fx, fz] = xz(lungoPos, faccia + verso * 0.02);
          const dispari = Math.round((lungoPos - 1.5) / 3) % 2 === 1;                         // alternati: finestra, stendardo, finestra...
          if (!dispari) {
            const f = mesh(new THREE.PlaneGeometry(0.9, 1.9), finestra, fx, 2.6, fz);        // finestra accesa
            f.rotation.y = lungo ? (verso > 0 ? 0 : Math.PI) : (verso > 0 ? Math.PI / 2 : -Math.PI / 2);
          }
          const [cx, cz] = xz(lungoPos + 1.5, faccia + verso * 0.34);
          if (lungoPos + 1.5 < lunghezza + 1) mesh(new THREE.CylinderGeometry(0.28, 0.34, alto, 12), colonna, cx, alto / 2, cz);   // colonna
          if (dispari) {                                                                      // stendardo rosso
            const [sx, sz] = xz(lungoPos, faccia + verso * 0.05);
            mesh(new THREE.BoxGeometry(lungo ? 0.8 : 0.05, 2.6, lungo ? 0.05 : 0.8), stendardo, sx, 2.3, sz);
          }
        }
      }
      const tappeto = mesh(new THREE.PlaneGeometry(1.0, 2.0), mat([120, 14, 28]), (lab.trono ? lab.trono.c : 10) + 0.5, 0.025, (lab.trono ? lab.trono.r : 1) + 1.0);   // tappeto che porta al Trono
      tappeto.rotation.x = -Math.PI / 2;
    }
  }

  creaTrono(t) {
    const gruppo = new THREE.Group();
    this.materialeTrono = new THREE.MeshStandardMaterial({ color: new THREE.Color(0.37, 0.37, 0.39), roughness: 0.6, metalness: 0.3 });
    const parte = (dx, dy, dz, lx, ly, lz) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(lx, ly, lz), this.materialeTrono);
      m.position.set(t.c + 0.5 + dx, dy, t.r + 0.5 + dz);
      gruppo.add(m);
    };
    parte(0, 0.08, 0, 0.9, 0.16, 0.9);              // pedana
    parte(0, 0.35, 0.05, 0.6, 0.3, 0.5);            // seduta
    parte(0, 0.85, -0.3, 0.6, 0.9, 0.12);           // schienale
    parte(-0.34, 0.5, 0.05, 0.1, 0.25, 0.5);        // braccioli
    parte(0.34, 0.5, 0.05, 0.1, 0.25, 0.5);
    [0.7, 1.0, 1.3, 1.0, 0.7].forEach((a, i) => parte((i - 2) * 0.13, 1.3 + a / 2, -0.32, 0.06, a, 0.05));   // spade
    return gruppo;
  }

  // ---- personaggi ----
  // Crea la mesh di un modello (da modelli.js) già scalata per entrare in un corridoio.
  creaMesh(nome) {
    const conf = CONFIGURAZIONE_MODELLI[nome];
    const dati = MODELLI[nome];
    const materiale = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.85, metalness: 0 });
    const costruisci = (pos, col) => {
      const geometria = new THREE.BufferGeometry();
      geometria.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
      geometria.setAttribute('color', new THREE.BufferAttribute(new Float32Array(col), 3));
      geometria.computeVertexNormals();
      return new THREE.Mesh(geometria, materiale);
    };
    let modello, parti = null;
    if (dati.parti) {
      // Modello in pezzi (corpo, braccia, gambe): ogni pezzo ruota attorno al suo perno (spalla o anca).
      modello = new THREE.Group();
      parti = {};
      for (const [chiave, p] of Object.entries(dati.parti)) {
        const m = costruisci(p.pos, p.col);
        m.position.set(p.perno[0], p.perno[1], p.perno[2]);
        modello.add(m);
        parti[chiave] = m;
      }
    } else {
      modello = costruisci(dati.pos, dati.col);
    }
    const scala = Math.min(conf.altezza / dati.altezza, conf.larghezza / dati.larghezza);
    modello.scale.set(scala, scala, scala);
    modello.position.y = conf.quota;
    return { modello, materiale, scala, conf, parti };
  }

  // Il giocatore: il CAVALIERE (Quaternius, CC0) con la tunica verde (colore cambiato nei dati, vedi tools/bake.py),
  // più anello e cristallo verdi: il verde brillante è lo stesso della mappa 2D e lo rende riconoscibile.
  // Se il modello non c'è, ripiega su un viandante disegnato con forme semplici.
  creaGiocatore() {
    const gruppo = new THREE.Group();
    const interno = new THREE.Group();            // gira verso la direzione di marcia
    const verde = new THREE.MeshStandardMaterial({ color: VistaThree.colore(COLORE_GIOCATORE), roughness: 0.6, emissive: VistaThree.colore(COLORE_GIOCATORE, 0.12) });
    const scuro = new THREE.MeshStandardMaterial({ color: VistaThree.colore(COLORE_GIOCATORE, 0.5), roughness: 0.8, emissive: VistaThree.colore(COLORE_GIOCATORE, 0.06) });
    const disco = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.04, 22), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    disco.position.y = 0.02;
    const anello = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 22), new THREE.MeshBasicMaterial({ color: VistaThree.colore(COLORE_GIOCATORE) }));
    anello.position.y = 0.03;
    gruppo.add(disco, anello);
    const aggiungi = (geometria, materiale, x, y, z, sx = 1, sy = 1, sz = 1) => {
      const m = new THREE.Mesh(geometria, materiale);
      m.position.set(x, y, z); m.scale.set(sx, sy, sz); interno.add(m); return m;
    };
    let modello = null, parti = null, altezzaTesta = 0.95;
    if (typeof MODELLI !== 'undefined' && MODELLI.cavaliere) {
      const m = this.creaMesh('cavaliere');
      interno.add(m.modello);
      modello = m.modello; parti = m.parti;
      altezzaTesta = CONFIGURAZIONE_MODELLI.cavaliere.altezza;
    } else {
      aggiungi(new THREE.CylinderGeometry(0.22, 0.26, 0.45, 14), verde, 0, 0.3, 0);                // corpo
      aggiungi(new THREE.SphereGeometry(0.2, 14, 10), verde, 0, 0.66, 0);                          // testa
      aggiungi(new THREE.SphereGeometry(0.26, 12, 8), scuro, 0, 0.5, -0.14, 1, 1.5, 0.9);          // mantello
      aggiungi(new THREE.SphereGeometry(0.04, 6, 4), new THREE.MeshBasicMaterial({ color: 0x111111 }), -0.08, 0.7, 0.18);
      aggiungi(new THREE.SphereGeometry(0.04, 6, 4), new THREE.MeshBasicMaterial({ color: 0x111111 }), 0.08, 0.7, 0.18);
    }
    gruppo.add(interno);
    // Cristallo verde che fluttua sopra la testa: si vede anche da dietro e da lontano.
    const cristallo = new THREE.Mesh(new THREE.OctahedronGeometry(0.09), new THREE.MeshBasicMaterial({ color: VistaThree.colore(COLORE_GIOCATORE) }));
    cristallo.position.y = altezzaTesta + 0.28;
    gruppo.add(cristallo);
    return { gruppo, interno, modello, parti, cristallo, altezzaTesta, fronte: Math.PI / 2, angolo: 0, fase: 0, ampiezza: 0 };
  }

  // Un fantasma: modello 3D dei mostri + un anello colorato ai piedi (colore del regno, stesso della mappa 2D).
  creaFantasma(f, tema) {
    const nome = modelloPerFantasma(f.comportamento, tema);
    const { modello, materiale, scala, conf } = this.creaMesh(nome);
    const interno = new THREE.Group();
    interno.add(modello);
    const anello = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.03, 20), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    anello.position.y = 0.015;
    const gruppo = new THREE.Group();
    gruppo.add(anello, interno);
    this.scena.add(gruppo);
    return { gruppo, interno, modello, materiale, anello, conf, scala, fronte: conf.fronte, angolo: 0, fase: f.inizio.c * 0.7 + f.inizio.r };
  }

  // ---- ogni fotogramma ----
  aggiornaAngolo(g, dt) {
    const bersaglio = Vista3D.angoloDirezione(g.giocatore.dir);
    if (this.angolo === null || g.stato !== 'gioco') { this.angolo = bersaglio; return; }
    this.angolo += Vista3D.differenzaAngoli(this.angolo, bersaglio) * Math.min(1, dt * VELOCITA_ROTAZIONE);
  }

  // Camminata del giocatore: braccia e gambe oscillano in opposizione mentre si muove, poi tornano ferme.
  camminata(o, inMovimento, dt) {
    o.ampiezza += ((inMovimento ? 1 : 0) - o.ampiezza) * Math.min(1, dt * 12);
    if (inMovimento) o.fase += dt * VELOCITA_PASSO;
    const s = Math.sin(o.fase) * o.ampiezza;
    if (o.parti) {
      o.parti.gambaD.rotation.x = s * 0.7;  o.parti.gambaS.rotation.x = -s * 0.7;     // gambe in opposizione
      o.parti.bracciaD.rotation.x = -s * 0.55; o.parti.bracciaS.rotation.x = s * 0.55;  // braccia opposte alle gambe
    }
    o.interno.position.y = 0.03 * Math.abs(Math.cos(o.fase)) * o.ampiezza;            // piccolo rimbalzo a ogni passo
    o.interno.rotation.z = 0.03 * Math.sin(o.fase) * o.ampiezza;
  }

  // Gira un personaggio verso la direzione di marcia (con un po' di dolcezza). Il modello "guarda" verso `fronte`.
  gira(o, dir, dt, subito) {
    const bersaglio = Vista3D.angoloDirezione(dir);
    o.angolo = subito ? bersaglio : o.angolo + Vista3D.differenzaAngoli(o.angolo, bersaglio) * Math.min(1, dt * 12);
    o.interno.rotation.y = o.fronte - o.angolo;
  }

  disegna(g, dt) {
    const chiave = g.livello + ':' + g.parametri.tema;
    if (this.chiave !== chiave) { this.chiave = chiave; this.costruisci(g); }
    if (this.fantasmiRif !== g.fantasmi) {          // nuovo livello: nuovi fantasmi
      for (const o of this.oggettiFantasmi) { this.scena.remove(o.gruppo); o.modello.geometry.dispose(); o.materiale.dispose(); }
      this.oggettiFantasmi = g.fantasmi.map(f => this.creaFantasma(f, g.parametri.tema));
      this.fantasmiRif = g.fantasmi;
    }
    const tema = TEMI[g.parametri.tema];
    const t = millis() / 1000;
    const p = g.giocatore;
    const inGioco = g.stato === 'gioco';
    this.aggiornaAngolo(g, dt);

    // Camera dietro e sopra il personaggio.
    const avanti = { x: Math.cos(this.angolo), z: Math.sin(this.angolo) };
    const px = p.x + 0.5, pz = p.y + 0.5;
    this.camera.position.set(px - avanti.x * DISTANZA_CAMERA, ALTEZZA_CAMERA, pz - avanti.z * DISTANZA_CAMERA);
    this.camera.lookAt(px + avanti.x * PUNTO_MIRA_AVANTI, 0.1, pz + avanti.z * PUNTO_MIRA_AVANTI);

    // Viandante e lanterna.
    this.giocatore.gruppo.position.set(px, 0, pz);
    this.gira(this.giocatore, p.dir, dt, !inGioco);
    this.camminata(this.giocatore, inGioco && !p.fermo, dt);
    this.giocatore.cristallo.rotation.y = t * 2;
    this.giocatore.cristallo.position.y = this.giocatore.altezzaTesta + 0.28 + 0.04 * Math.sin(t * 3);
    this.torcia.position.set(px + Math.cos(this.angolo + 1.2) * 0.3, 1.1, pz + Math.sin(this.angolo + 1.2) * 0.3);

    // Fantasmi.
    g.fantasmi.forEach((f, i) => {
      const o = this.oggettiFantasmi[i];
      o.gruppo.position.set(f.x + 0.5, 0, f.y + 0.5);
      this.gira(o, f.dir, dt, !inGioco);
      const colore = f.spaventato
        ? ((g.potenza < AVVISO_FINE_POTENZA && Math.floor(g.potenza * 6) % 2 === 0) ? [255, 255, 255] : [60, 90, 220])
        : tema.fantasmi[f.comportamento];
      o.anello.material.color.copy(VistaThree.colore(colore));
      if (f.spaventato) o.materiale.emissive.setRGB(colore[0] / 255 * 0.55, colore[1] / 255 * 0.55, colore[2] / 255 * 0.55);
      else o.materiale.emissive.setRGB(0, 0, 0);
      // Piccole animazioni: il corpo ondeggia, il pipistrello batte, lo slime si schiaccia.
      const fase = t * (o.conf.volo ? 9 : 6) + o.fase;
      o.modello.position.y = o.conf.quota + (o.conf.volo ? 0.08 : 0.025) * Math.sin(fase);
      o.modello.rotation.z = (o.conf.volo ? 0.12 : 0.05) * Math.sin(fase);
      if (o.conf.gelatina) o.modello.scale.set(o.scala * (1 - 0.05 * Math.sin(fase)), o.scala * (1 + 0.09 * Math.sin(fase)), o.scala * (1 - 0.05 * Math.sin(fase)));
    });

    // Cibo e potenziamenti.
    let nCibo = 0, nPot = 0;
    for (const chiave2 of g.lab.cibo) {
      const [c, r] = chiave2.split(',').map(Number);
      if (g.lab.potenziamenti.has(chiave2)) {
        this.d.position.set(c + 0.5, 0.42 + 0.07 * Math.sin(t * 4 + c), r + 0.5); this.d.updateMatrix();
        this.potenziamenti.setMatrixAt(nPot++, this.d.matrix);
      } else {
        this.d.position.set(c + 0.5, 0.32, r + 0.5); this.d.updateMatrix();
        this.cibo.setMatrixAt(nCibo++, this.d.matrix);
      }
    }
    this.cibo.count = nCibo; this.potenziamenti.count = nPot;
    this.cibo.instanceMatrix.needsUpdate = true; this.potenziamenti.instanceMatrix.needsUpdate = true;

    // Atmosfera: aria animata, torce che tremolano, lampi.
    this.particelle.aggiorna(dt, px, pz, t);
    this.torce.forEach((tr, i) => tr.fiamma.scale.setScalar(0.85 + 0.25 * Math.sin(t * 11 + i * 1.7)));
    const vicine = this.torce.map(tr => ({ tr, d: Math.hypot(tr.x - px, tr.z - pz) })).sort((a, b) => a.d - b.d).slice(0, 2);
    this.luciTorce.forEach((luce, i) => {
      const n = vicine[i];
      if (n && n.d < 6) { luce.position.set(n.tr.x - n.tr.dc * 0.3, 0.9, n.tr.z - n.tr.dr * 0.3); luce.intensity = 0.9 + 0.35 * Math.sin(t * 9 + i * 2.3); }
      else luce.intensity = 0;
    });
    if (this.ambiente.lampi) {
      if (t > this.prossimoLampo) { this.lampo = 1; this.prossimoLampo = t + 4 + Math.random() * 6; }
      this.lampo = Math.max(0, this.lampo - dt * 4);
      this.luceCielo.intensity = this.luceBase + this.lampo * 1.8;
    }

    // Il Trono: grigio finché c'è cibo, dorato e pulsante quando si può raggiungere.
    if (this.materialeTrono) {
      if (g.troneAperto) {
        const l = 0.8 + 0.2 * Math.sin(millis() / 150);
        this.materialeTrono.color.setRGB(l, l * 0.78, 0.16);
        this.materialeTrono.emissive.setRGB(l * 0.35, l * 0.27, 0.04);
      } else {
        this.materialeTrono.color.setRGB(0.37, 0.37, 0.39);
        this.materialeTrono.emissive.setRGB(0, 0, 0);
      }
    }
    this.renderer.render(this.scena, this.camera);
  }

  // Incolla la scena nella finestra di p5 (subito dopo il disegno: il contenuto è ancora valido).
  mostra(x, y) {
    drawingContext.drawImage(this.renderer.domElement, x, y, this.larghezza, this.altezza);
  }
}
