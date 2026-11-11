// Il disegno 2D. Legge lo stato del gioco e lo mostra: non cambia mai nulla.
// (Più avanti la vista 3D prenderà il suo posto e questa diventerà la minimappa.)
//
// Colori per regno, ispirati alle casate (verificati su fonti; Dorne non confermato):
// sfondo, muri, cibo e i tre fantasmi (insegue, anticipa, casuale).
// Il giocatore ha lo STESSO colore in tutti i livelli: un verde brillante scelto
// misurando la distanza dai colori di muri, cibo e fantasmi di tutti i temi.
const COLORE_GIOCATORE = [38, 255, 38];
const TEMI = {
  nord:        { sfondo: [8, 12, 20],  muro: [105, 115, 128], cibo: [230, 236, 246],
                 fantasmi: { insegue: [245, 248, 255], anticipa: [140, 190, 235], casuale: [190, 200, 215] } },
  isole_fiumi: { sfondo: [6, 8, 16],   muro: [50, 90, 170],   cibo: [210, 215, 230],
                 fantasmi: { insegue: [240, 195, 60], anticipa: [215, 70, 60], casuale: [250, 230, 150] } },
  valle:       { sfondo: [6, 12, 24],  muro: [80, 150, 215],  cibo: [250, 252, 255],
                 fantasmi: { insegue: [250, 252, 255], anticipa: [170, 215, 245], casuale: [205, 210, 225] } },
  roccia:      { sfondo: [20, 6, 8],   muro: [140, 25, 40],   cibo: [240, 200, 90],
                 fantasmi: { insegue: [245, 205, 80], anticipa: [255, 235, 170], casuale: [225, 150, 45] } },
  altopiano:   { sfondo: [6, 16, 10],  muro: [40, 120, 60],   cibo: [235, 205, 90],
                 fantasmi: { insegue: [240, 200, 70], anticipa: [255, 235, 150], casuale: [215, 160, 50] } },
  tempesta:    { sfondo: [22, 20, 18], muro: [125, 80, 35], contorno: [210, 170, 30], cibo: [255, 215, 70],
                 fantasmi: { insegue: [245, 245, 245], anticipa: [190, 190, 195], casuale: [130, 130, 138] } },
  dorne:       { sfondo: [24, 10, 4],  muro: [205, 95, 30],   cibo: [255, 215, 150],
                 fantasmi: { insegue: [225, 45, 40], anticipa: [255, 120, 90], casuale: [150, 30, 30] } },
  trono:       { sfondo: [8, 8, 10],   muro: [85, 88, 96],    cibo: [215, 45, 45],
                 fantasmi: { insegue: [255, 150, 40], anticipa: [235, 235, 240], casuale: [160, 110, 220] } }
};

class Vista2D {
  // Vista 2D a tutta finestra (si può scegliere con il tasto V).
  disegna(g) {
    const tema = TEMI[g.parametri.tema];
    background(...tema.sfondo);
    this.hud(g);
    const scala = Math.min(width / (COLONNE * CELLA), (height - ALTEZZA_HUD) / (RIGHE * CELLA));
    push();
    translate((width - COLONNE * CELLA * scala) / 2, ALTEZZA_HUD + ((height - ALTEZZA_HUD) - RIGHE * CELLA * scala) / 2);
    scale(scala);
    this.labirinto(g.lab, tema);
    this.trono(g);
    this.personaggi(g, tema);
    pop();
    this.schermate(g);
  }

  // Solo barra in alto e messaggi: serve alla vista 3D, che disegna il resto per conto suo.
  disegnaBarraEMessaggi(g) {
    const tema = TEMI[g.parametri.tema];
    noStroke(); fill(...tema.sfondo);
    rect(0, 0, width, ALTEZZA_HUD);
    this.hud(g);
  }

  // Minimappa: un cerchio centrato sul personaggio. Ruota insieme alla camera, così "su" sulla mappa
  // è sempre "avanti" nella vista 3D e i comandi (avanti, sinistra, destra) valgono anche per la mappa.
  minimappa(g, angoloCamera) {
    const tema = TEMI[g.parametri.tema];
    const raggio = DIAMETRO_MINIMAPPA / 2;
    const cx = width - raggio - MARGINE_MINIMAPPA, cy = height - raggio - MARGINE_MINIMAPPA;
    const p = g.giocatore;
    const a = angoloCamera !== null && angoloCamera !== undefined ? angoloCamera : Math.atan2(DIREZIONI[p.dir].dr, DIREZIONI[p.dir].dc);
    push();
    translate(cx, cy);
    fill(0, 0, 0, 190); stroke(255, 255, 255, 140); strokeWeight(2);
    circle(0, 0, DIAMETRO_MINIMAPPA);
    drawingContext.save();                       // tutto ciò che segue viene tagliato dentro il cerchio
    drawingContext.beginPath();
    drawingContext.arc(0, 0, raggio - 1, 0, Math.PI * 2);
    drawingContext.clip();
    rotate(-Math.PI / 2 - a);                    // la direzione di marcia punta verso l'alto
    scale(SCALA_MINIMAPPA);
    translate(-(p.x * CELLA + CELLA / 2), -(p.y * CELLA + CELLA / 2));
    this.labirinto(g.lab, tema);
    this.trono(g);
    this.personaggi(g, tema);
    drawingContext.restore();
    pop();
    // Freccia fissa al centro: indica "avanti".
    push();
    translate(cx, cy);
    fill(255); stroke(20); strokeWeight(1);
    triangle(0, -15, -7, -3, 7, -3);
    pop();
  }

  // Minimappa intera e ferma (nord in alto): si vede tutto il labirinto, il cibo rimasto e i fantasmi.
  minimappaIntera(g) {
    const tema = TEMI[g.parametri.tema];
    const w = COLONNE * CELLA * SCALA_MINIMAPPA_INTERA, h = RIGHE * CELLA * SCALA_MINIMAPPA_INTERA;
    push();
    translate(width - w - MARGINE_MINIMAPPA, ALTEZZA_HUD + MARGINE_MINIMAPPA);
    fill(0, 0, 0, 190); stroke(255, 255, 255, 140); strokeWeight(2);
    rect(-4, -4, w + 8, h + 8, 6);
    scale(SCALA_MINIMAPPA_INTERA);
    this.labirinto(g.lab, tema);
    this.trono(g);
    this.personaggi(g, tema);
    pop();
  }

  // Guida alle svolte (solo con i comandi relativi): tre frecce, accese se in quella direzione
  // c'è una strada al prossimo incrocio. Arancione = svolta già prenotata.
  guidaSvolte(g) {
    if (!CONTROLLI_RELATIVI || g.stato !== 'gioco') return;
    const u = g.giocatore.uscite();
    const richiesta = g.giocatore.richiesta;
    const y = height - 46, x = width / 2 - 60;
    const frecce = [
      { x: x - 48, angolo: -Math.PI / 2, aperta: u.sinistra, prenotata: richiesta === -1 },
      { x: x, angolo: 0, aperta: u.avanti, prenotata: false },
      { x: x + 48, angolo: Math.PI / 2, aperta: u.destra, prenotata: richiesta === 1 }
    ];
    for (const f of frecce) {
      push();
      translate(f.x, y);
      rotate(f.angolo);
      if (f.prenotata) { fill(255, 170, 40); stroke(255); strokeWeight(2); }
      else if (f.aperta) { fill(255, 255, 255, 235); stroke(20); strokeWeight(1); }
      else { fill(255, 255, 255, 40); noStroke(); }
      triangle(0, -17, -13, 11, 13, 11);
      pop();
    }
  }

  hud(g) {
    if (g.prova) { fill(255, 150, 40); noStroke(); textSize(12); textAlign(CENTER, TOP); text('MODALITÀ PROVA - invincibile - E: apri il Trono / passa al livello dopo', width / 2, 2); }
    fill(230); noStroke(); textSize(20); textAlign(LEFT, CENTER);
    text('Vite: ' + g.vite + '   Livello: ' + g.livello + '/' + NUMERO_LIVELLI, 12, ALTEZZA_HUD / 2);
    textAlign(RIGHT, CENTER);
    text('Punteggio: ' + g.punti, width - 12, ALTEZZA_HUD / 2);
    textAlign(CENTER, CENTER); textSize(16);
    if (g.stato !== 'gioco') return;
    if (g.potenza > 0) {
      fill(255, 200, 60); text('Potere: ' + g.potenza.toFixed(1), width / 2, ALTEZZA_HUD / 2);
    } else if (g.troneAperto) {
      fill(255, 200, 60); text('Raggiungi il Trono!', width / 2, ALTEZZA_HUD / 2);
    } else {
      fill(g.modo === 'caccia' ? 230 : 130, g.modo === 'caccia' ? 110 : 200, g.modo === 'caccia' ? 110 : 140);
      let etichetta = g.modo === 'caccia' ? 'Caccia!' : 'Dispersione';
      if (g.tempoRimasto !== null) etichetta = 'Tempo ' + Math.ceil(g.tempoRimasto) + ' - ' + etichetta;
      text(etichetta, width / 2, ALTEZZA_HUD / 2);
    }
  }

  labirinto(lab, tema) {
    for (let r = 0; r < RIGHE; r++) {
      for (let c = 0; c < COLONNE; c++) {
        if (lab.righe[r][c] === '#') {
          fill(...tema.muro);
          if (tema.contorno) { stroke(...tema.contorno); strokeWeight(2); } else noStroke();
          rect(c * CELLA + 2, r * CELLA + 2, CELLA - 4, CELLA - 4, 6);
          noStroke();
        }
      }
    }
    noStroke();
    for (const chiave of lab.cibo) {
      const [c, r] = chiave.split(',').map(Number);
      if (lab.potenziamenti.has(chiave)) { fill(255, 200, 60); circle(c * CELLA + CELLA / 2, r * CELLA + CELLA / 2, 16); }
      else { fill(...tema.cibo); circle(c * CELLA + CELLA / 2, r * CELLA + CELLA / 2, 6); }
    }
  }

  // Il Trono: grigio finché c'è cibo, dorato (e pulsante) quando si può raggiungere.
  trono(g) {
    const t = g.lab.trono;
    if (!t) return;
    const x = t.c * CELLA, y = t.r * CELLA;
    noStroke();
    if (g.troneAperto) {
      const l = 200 + 55 * Math.sin(millis() / 150);
      fill(l, l * 0.78, 40);
    } else {
      fill(95, 95, 100);
    }
    rect(x + 6, y + 10, CELLA - 12, CELLA - 14, 3);        // seduta
    rect(x + 6, y + 3, CELLA - 12, 8, 2);                  // schienale alto
    triangle(x + 6, y + 3, x + 11, y - 2, x + 15, y + 3);  // punte dello schienale
    triangle(x + 15, y + 3, x + 15, y - 3, x + 19, y + 3);
    triangle(x + 19, y + 3, x + 24, y - 2, x + CELLA - 6, y + 3);
  }

  // Il giocatore è un cerchio verde con il bordo bianco; i fantasmi hanno la forma
  // classica (testa tonda e piedi a punta): si distinguono anche senza guardare i colori.
  personaggi(g, tema) {
    const p = g.giocatore;
    const px = p.x * CELLA + CELLA / 2, py = p.y * CELLA + CELLA / 2;
    fill(...COLORE_GIOCATORE); stroke(255); strokeWeight(2);
    circle(px, py, CELLA * 0.66);
    noStroke();
    // Un puntino indica la direzione in cui guarda.
    fill(20);
    const d = DIREZIONI[p.dir];
    circle(px + d.dc * CELLA * 0.2, py + d.dr * CELLA * 0.2, 5);
    for (const f of g.fantasmi) {
      if (f.spaventato) {
        const lampeggia = g.potenza < AVVISO_FINE_POTENZA && Math.floor(g.potenza * 6) % 2 === 0;
        fill(lampeggia ? 255 : 60, lampeggia ? 255 : 90, lampeggia ? 255 : 220);
      } else {
        fill(...tema.fantasmi[f.comportamento]);
      }
      this.fantasma(f.x * CELLA + CELLA / 2, f.y * CELLA + CELLA / 2);
    }
  }

  fantasma(x, y) {
    const r = CELLA * 0.36;
    circle(x, y - 2, r * 2);                       // testa
    rect(x - r, y - 2, r * 2, r);                  // corpo
    for (let i = 0; i < 3; i++) {                  // tre punte in basso
      const x0 = x - r + i * (2 * r / 3);
      triangle(x0, y + r - 2, x0 + 2 * r / 3, y + r - 2, x0 + r / 3, y + r + 4);
    }
    fill(10, 30, 90);                              // occhi
    circle(x - 4, y - 3, 4);
    circle(x + 4, y - 3, 4);
  }

  schermate(g) {
    const pr = g.parametri;
    const record = 'Record: ' + g.record;
    const comandi = CONTROLLI_RELATIVI ? 'Su: avanti  -  Sinistra/Destra: gira  -  Giù: inverti' : 'Frecce: muovi';
    if (g.stato === 'menu') this.messaggio('PAC-MAN DEL NORD', 'Premi INVIO per iniziare   -   ' + record, comandi + '   -   1-8: livello   -   V: vista   -   N: mappa   -   P: prova   -   M: audio');
    if (g.stato === 'pronto') this.messaggio(pr.regno, 'Livello ' + pr.numero + ' di ' + NUMERO_LIVELLI + '  -  Casata ' + pr.casata, pr.speciale ? 'LIVELLO SPECIALE: tempo limite ' + pr.tempoLimite + ' secondi' : '');
    if (g.stato === 'vittoria') this.messaggio('HAI CONQUISTATO IL TRONO!', 'Punteggio: ' + g.punti, (g.nuovoRecord ? 'Nuovo record! ' : record + '   ') + 'INVIO per rigiocare');
    if (g.stato === 'sconfitta') this.messaggio('HAI PERSO', 'Punteggio: ' + g.punti, (g.nuovoRecord ? 'Nuovo record! ' : record + '   ') + 'INVIO per riprovare');
  }

  messaggio(titolo, riga2, riga3) {
    fill(0, 0, 0, 170); noStroke();
    rect(0, ALTEZZA_HUD, width, height - ALTEZZA_HUD);
    fill(255); textAlign(CENTER, CENTER);
    textSize(titolo.length > 18 ? 32 : 40); text(titolo, width / 2, height / 2 - 40);
    textSize(22); text(riga2, width / 2, height / 2 + 10);
    textSize(16); text(riga3, width / 2, height / 2 + 45);
  }
}
