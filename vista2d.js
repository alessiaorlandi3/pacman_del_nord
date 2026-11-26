// Il disegno 2D. Legge lo stato del gioco e lo mostra: non cambia mai nulla.
// (Più avanti la vista 3D prenderà il suo posto e questa diventerà la minimappa.)
//
// Colori per regno, ispirati alle casate (verificati su fonti; Dorne non confermato):
// sfondo, muri, cibo e i tre fantasmi (insegue, anticipa, casuale).
// Il giocatore ha lo STESSO colore in tutti i livelli: un verde brillante scelto
// misurando la distanza dai colori di muri, cibo e fantasmi di tutti i temi.
const COLORE_GIOCATORE = [38, 255, 38];
const COLORE_ORO = [212, 175, 55];   // titoli, cornici e cuori delle schermate
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

const CHIARO = [222, 222, 222];   // colore del testo delle schermate

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
    this.hud(g, true);
    this.pannelloVite(g);
  }

  // Riquadro in alto a sinistra (come la mappa a destra): livello, nome del regno e vite a forma di cuore.
  pannelloVite(g) {
    const pr = g.parametri;
    const x = MARGINE_MINIMAPPA, y = ALTEZZA_HUD + MARGINE_MINIMAPPA;
    this.pannello(x, y, 210, 92, [255, 255, 255], 190);
    this.scrivi('LIVELLO ' + g.livello + ' / ' + NUMERO_LIVELLI, x + 14, y + 20, { dim: 13, peso: 500, sp: 2, col: [225, 225, 225], al: LEFT });
    this.scrivi(pr.regno, x + 14, y + 42, { titolo: true, dim: 14, col: [200, 200, 200], al: LEFT });
    push(); noStroke();
    const totale = Math.max(VITE_INIZIALI, g.vite);
    for (let i = 0; i < totale; i++) this.cuore(x + 26 + i * 30, y + 68, 22, i < g.vite);
    pop();
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

  // soloCentroDestra = true nella vista 3D: vite e livello stanno già nel riquadro in alto a sinistra.
  hud(g, soloCentroDestra) {
    if (g.prova) { fill(255, 150, 40); noStroke(); textSize(12); textAlign(CENTER, TOP); text('MODALITÀ PROVA - invincibile - E: apri il Trono / passa al livello dopo', width / 2, 2); }
    fill(230); noStroke(); textSize(20); textAlign(LEFT, CENTER);
    if (!soloCentroDestra) text('Vite: ' + g.vite + '   Livello: ' + g.livello + '/' + NUMERO_LIVELLI, 12, ALTEZZA_HUD / 2);
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

  // ---------------------------------------------------------------------------------------------
  // Schermate: menu iniziale, inizio livello (intermedia), vittoria e sconfitta.
  // Sono disegnate sopra il gioco con pochi elementi riutilizzabili (cornice, filetto, scudo, tasto...).
  schermate(g) {
    if (g.inPausa) { this.schermataPausa(g); return; }
    if (g.stato === 'gioco' && g.inAttesaInizio) { this.invito('Premi una freccia per partire', height - 44, CHIARO); return; }   // il cavaliere aspetta
    if (g.stato === 'menu') this.schermataMenu(g);
    else if (g.stato === 'pronto') { if (!g.dopoVita) this.schermataLivello(g); }   // dopo una vita persa si riparte senza schermata
    else if (g.stato === 'completato') this.schermataCompletato(g);
    else if (g.stato === 'vittoria') this.schermataFine(g, true);
    else if (g.stato === 'sconfitta') this.schermataFine(g, false);
  }

  // Velo scuro su tutta la finestra.
  sipario(colore, alfa) { noStroke(); fill(...colore, alfa); rect(0, 0, width, height); }

  rombo(x, y, r) { quad(x, y - r, x + r, y, x, y + r, x - r, y); }

  // Cornice a doppio filetto con un rombo in ogni angolo.
  cornice(colore) {
    noFill(); stroke(...colore, 210); strokeWeight(3); rect(22, 22, width - 44, height - 44, 14);
    stroke(...colore, 110); strokeWeight(1); rect(31, 31, width - 62, height - 62, 8);
    noStroke(); fill(...colore);
    for (const [x, y] of [[22, 22], [width - 22, 22], [22, height - 22], [width - 22, height - 22]]) this.rombo(x, y, 9);
  }

  // Linea decorativa con un rombo al centro.
  filetto(cx, y, larghezza, colore) {
    stroke(...colore, 200); strokeWeight(1.5);
    line(cx - larghezza / 2, y, cx - 14, y); line(cx + 14, y, cx + larghezza / 2, y);
    noStroke(); fill(...colore); this.rombo(cx, y, 6);
  }

  // Riquadro scuro con bordo colorato.
  pannello(x, y, w, h, accento, alfa) {
    fill(10, 10, 16, alfa); stroke(...accento, 170); strokeWeight(2); rect(x, y, w, h, 10);
  }

  cuore(cx, cy, s, pieno) {
    noStroke();
    if (pieno) fill(214, 40, 56); else fill(70, 70, 80);
    circle(cx - s * 0.24, cy - s * 0.12, s * 0.56); circle(cx + s * 0.24, cy - s * 0.12, s * 0.56);
    triangle(cx - s * 0.5, cy - s * 0.02, cx + s * 0.5, cy - s * 0.02, cx, cy + s * 0.5);
    if (pieno) { fill(255, 255, 255, 110); circle(cx - s * 0.3, cy - s * 0.2, s * 0.14); }
  }

  // Scudo rotondo con un numero (i regni).
  scudo(x, y, r, testo, riempimento, bordo, dimTesto) {
    fill(...riempimento); stroke(...bordo); strokeWeight(2); circle(x, y, r * 2);
    noStroke(); fill(255); textAlign(CENTER, CENTER); textSize(dimTesto); text(testo, x, y + 1);
  }

  // Scrive un testo con il carattere scelto e, volendo, le lettere spaziate (come nei titoli dei film).
  // opz: peso (es. 300 = leggero; usa il canvas direttamente), titolo (true = font dei titoli, false = font dei testi), dim, stile, col [r,g,b], alfa, sp (spaziatura), al (allineamento), ombra
  scrivi(t, x, y, o) {
    const cv = typeof drawingContext !== 'undefined' ? drawingContext : null;
    if (o.peso && cv && 'letterSpacing' in cv) {   // peso del carattere scelto a mano (p5 conosce solo normale/grassetto)
      const sp = o.sp || 0, al = o.al || CENTER;
      cv.save();
      cv.font = (o.stile === 'italic' ? 'italic ' : '') + o.peso + ' ' + (o.dim || 16) + 'px ' + (o.titolo ? FONT_TITOLI : FONT_TESTO);
      cv.letterSpacing = sp + 'px'; cv.textBaseline = 'middle';
      cv.textAlign = al === CENTER ? 'center' : al === RIGHT ? 'right' : 'left';
      cv.fillStyle = 'rgba(' + (o.col || [235, 235, 235]).join(',') + ',' + (o.alfa === undefined ? 1 : o.alfa / 255) + ')';
      cv.fillText(t, x + (al === CENTER ? sp / 2 : 0), y);
      cv.restore();
      return;
    }
    push();
    noStroke(); textFont(o.titolo ? FONT_TITOLI : FONT_TESTO); textStyle(o.stile || 'normal'); textSize(o.dim || 16);
    textAlign(o.al || CENTER, CENTER);
    const sp = o.sp || 0;
    const ctx = typeof drawingContext !== 'undefined' ? drawingContext : null;
    const puoSpaziare = sp && ctx && 'letterSpacing' in ctx;
    if (puoSpaziare) ctx.letterSpacing = sp + 'px';
    const dx = puoSpaziare && (o.al || CENTER) === CENTER ? sp / 2 : 0;   // la spaziatura aggiunge uno spazio anche dopo l'ultima lettera
    if (o.ombra) { fill(0, 0, 0, 170); text(t, x + dx + 2, y + 3); }
    fill(...(o.col || [235, 235, 235]), o.alfa === undefined ? 255 : o.alfa);
    text(t, x + dx, y);
    if (puoSpaziare) ctx.letterSpacing = '0px';
    pop();
  }

  // Un tasto della tastiera disegnato: 'su', 'giu', 'sinistra', 'destra' diventano frecce, il resto è testo.
  // Stile semplice: fondo appena chiaro e bordo sottile chiaro, come il riquadro del menu.
  tasto(x, y, etichetta, w) {
    const h = 26;
    fill(255, 255, 255, 18); stroke(220, 220, 220, 200); strokeWeight(1); rect(x, y, w, h, 6);
    const frecce = { su: -Math.PI / 2, giu: Math.PI / 2, sinistra: Math.PI, destra: 0 };
    if (etichetta in frecce) {
      push(); noStroke(); fill(230); translate(x + w / 2, y + h / 2); rotate(frecce[etichetta]);
      triangle(5, 0, -4, -5, -4, 5);
      pop();
    } else {
      this.scrivi(etichetta, x + w / 2, y + h / 2 + 1, { dim: 13, peso: 500, sp: 0.5, col: [232, 232, 232] });
    }
  }

  // Una riga della legenda dei comandi: uno o più tasti e, accanto, cosa fanno.
  comando(x, y, tasti, descrizione) {
    let cx = x;
    for (const t of tasti) {
      const w = ['su', 'giu', 'sinistra', 'destra'].includes(t) ? 28 : Math.max(28, 14 + t.length * 9);
      this.tasto(cx, y, t, w); cx += w + 5;
    }
    this.scrivi(descrizione, x + 98, y + 13, { dim: 16, peso: 400, col: [226, 224, 220], al: LEFT });
  }

  // Larghezza di una riga di comandi (tasti + descrizione), per centrarla.
  larghezzaComando(tasti, descrizione) {
    let w = 0;
    for (const t of tasti) w += (['su', 'giu', 'sinistra', 'destra'].includes(t) ? 28 : Math.max(28, 14 + t.length * 9)) + 5;
    push(); textFont(FONT_TESTO); textStyle('normal'); textSize(16);
    const d = textWidth(descrizione); pop();
    return { tasti: w - 5, desc: d };
  }

  // Un gruppo di righe, centrato in orizzontale intorno a cx: i tasti incolonnati a sinistra, le descrizioni allineate.
  elencoComandi(cx, y, righe, passo) {
    const m = righe.map(([t, d]) => this.larghezzaComando(t, d));
    const colTasti = Math.max(...m.map(a => a.tasti)), colDesc = Math.max(...m.map(a => a.desc)), spazio = 22;
    const x0 = cx - (colTasti + spazio + colDesc) / 2;
    righe.forEach(([tasti, d], i) => {
      let x = x0;
      for (const t of tasti) {
        const w = ['su', 'giu', 'sinistra', 'destra'].includes(t) ? 28 : Math.max(28, 14 + t.length * 9);
        this.tasto(x, y + i * passo, t, w); x += w + 5;
      }
      this.scrivi(d, x0 + colTasti + spazio, y + i * passo + 13, { dim: 16, peso: 400, col: [226, 224, 220], al: LEFT });
    });
  }

  // Testo che pulsa piano piano ("Premi INVIO...").
  invito(testo, y, colore) {
    this.scrivi(testo, width / 2, y, { dim: 22, peso: 300, sp: 1, col: colore, alfa: 150 + 105 * Math.sin(millis() / 330) });
  }

  // Sfondo del menu: al centro nero, poi un rosso scuro, ai bordi quasi nero.
  sfondoMenu(anello) {
    anello = anello || [84, 22, 10];
    const cv = typeof drawingContext !== 'undefined' ? drawingContext : null;
    if (cv && cv.createRadialGradient) {
      const r = Math.hypot(width / 2, height / 2);
      const gr = cv.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, r);
      gr.addColorStop(0, 'rgb(4,2,2)'); gr.addColorStop(0.55, 'rgb(' + anello.join(',') + ')'); gr.addColorStop(1, 'rgb(16,8,8)');
      cv.save(); cv.fillStyle = gr; cv.fillRect(0, 0, width, height); cv.restore();
    } else this.sipario([40, 12, 8], 255);
  }

  // Ingranaggio delle impostazioni (in basso a destra nel menu).
  ingranaggio(x, y, col) {
    push(); noFill(); stroke(...col); strokeCap(SQUARE);
    strokeWeight(2.5); circle(x, y, 22);
    strokeWeight(5);
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; line(x + Math.cos(a) * 12, y + Math.sin(a) * 12, x + Math.cos(a) * 16, y + Math.sin(a) * 16); }
    strokeWeight(2); circle(x, y, 9);
    pop();
  }

  schermataMenu(g) {
    const cx = width / 2, chiaro = [222, 222, 222];
    this.sfondoMenu();

    // titolo
    this.scrivi('PAC-MAN DEL NORD', cx, 102, { titolo: true, dim: 64, stile: 'bold', col: chiaro });
    this.scrivi('7 regni - un solo trono', cx, 166, { dim: 32, peso: 300, col: chiaro });

    // gli otto regni: un segmento del colore del labirinto, col numero sotto
    for (let n = 1; n <= NUMERO_LIVELLI; n++) {
      const x = cx + (n - 4.5) * 46;
      noStroke(); fill(...TEMI[REGNI[n - 1].tema].muro); rect(x - 18, 222, 36, 5, 2);
      this.scrivi(String(n), x, 244, { dim: 15, peso: 400, col: [205, 205, 205] });
    }

    // i comandi importanti
    const w = 400, h = 196, x0 = cx - w / 2, y0 = 284;
    fill(0, 0, 0, 70); stroke(215, 215, 215, 210); strokeWeight(1); rect(x0, y0, w, h, 30);
    const righe = CONTROLLI_RELATIVI
      ? [[['su'], 'Avanti'], [['sinistra', 'destra'], 'Gira'], [['giu'], 'Inverti marcia'], [['SPAZIO'], 'Pausa'], [['INVIO'], 'Avvia / conferma']]
      : [[['su', 'giu'], 'Su / giù'], [['sinistra', 'destra'], 'Sinistra / destra'], [['SPAZIO'], 'Pausa'], [['INVIO'], 'Avvia / conferma']];
    const passo = 30, yr = y0 + (h - righe.length * passo) / 2 - 1;
    this.elencoComandi(cx, yr, righe, passo);

    // record, subito sotto i comandi
    this.scrivi('Record: ' + g.record, cx, y0 + h + 30, { dim: 19, peso: 400, col: chiaro, sp: 1 });
    this.invito('Premi INVIO per iniziare', 580, CHIARO);

    // impostazioni
    this.scrivi('Impostazioni (I)', POS_INGRANAGGIO.x - 30, POS_INGRANAGGIO.y, { dim: 14, peso: 400, col: [190, 190, 190], al: RIGHT });
    this.ingranaggio(POS_INGRANAGGIO.x, POS_INGRANAGGIO.y, chiaro);
    if (this.impostazioni) this.schermataImpostazioni(g);
  }

  // Impostazioni: gli altri tasti del gioco.
  schermataImpostazioni(g) {
    const cx = width / 2, chiaro = [222, 222, 222];
    const righe = [[['1-8'], 'Scegli il regno'], [['V'], 'Vista 3D / 2D'], [['N'], 'Mappa intera'], [['P'], 'Modalità prova'], [['M'], 'Audio']];
    if (g.inPausa) righe.push([['R'], 'Ricomincia la partita']);     // si può ricominciare solo se una partita è in corso (in pausa)
    this.sipario([0, 0, 0], 200);
    const w = 460, h = 350, x0 = cx - w / 2, y0 = 140;
    fill(14, 6, 5, 245); stroke(215, 215, 215, 210); strokeWeight(1); rect(x0, y0, w, h, 30);
    this.scrivi('IMPOSTAZIONI', cx, y0 + 40, { titolo: true, dim: 22, stile: 'bold', col: chiaro, sp: 3 });
    this.elencoComandi(cx, y0 + 76, righe, 36);
    if (g.riavvioChiesto) this.scrivi('Premi di nuovo R per ricominciare da capo', cx, y0 + h - 30, { dim: 15, peso: 500, col: [255, 200, 70] });
    else this.scrivi('Premi I o ESC per chiudere', cx, y0 + h - 30, { dim: 15, peso: 300, col: [190, 190, 190], sp: 1 });
  }

  // Riquadro dai bordi arrotondati e filo chiaro (lo stesso del menu).
  riquadro(x, y, w, h, alfa) {
    fill(0, 0, 0, alfa); stroke(215, 215, 215, 210); strokeWeight(1); rect(x, y, w, h, 30);
  }

  // Piccola scritta in maiuscolo con le lettere spaziate (etichette: LIVELLO, PUNTEGGIO...).
  etichetta(t, x, y, col) { this.scrivi(t, x, y, { dim: 14, peso: 500, sp: 3, col: col || [205, 205, 205] }); }

  // Colore del regno schiarito, per scritte sullo sfondo scuro.
  chiaroRegno(tema) { return TEMI[tema].muro.map(c => Math.min(255, c + 80)); }

  // Il cammino degli otto regni: un segmento per regno, col numero sotto. Superati = colorati, attuale = colorato e
  // sottolineato, mancanti = spenti, caduto = solo contorno rosso.
  percorso(cx, y, superati, attuale, caduto) {
    for (let n = 1; n <= NUMERO_LIVELLI; n++) {
      const x = cx + (n - 4.5) * 46, corrente = n === attuale;
      if (n <= superati || corrente) { noStroke(); fill(...TEMI[REGNI[n - 1].tema].muro); }
      else if (n === caduto) { noFill(); stroke(226, 70, 70); strokeWeight(1.5); }
      else { noStroke(); fill(60, 60, 66); }
      rect(x - 18, y, 36, corrente ? 7 : 5, 2);
      if (corrente) { noFill(); stroke(235, 235, 235, 220); strokeWeight(1); rect(x - 21, y - 4, 42, 15, 4); }
      this.scrivi(String(n), x, y + 26, { dim: 15, peso: corrente ? 600 : 400, col: corrente ? [250, 250, 250] : n <= superati ? [205, 205, 205] : [120, 120, 126] });
    }
  }

  // Schermata intermedia: compare all'inizio di ogni livello.
  schermataLivello(g) {
    const pr = g.parametri, cx = width / 2, cy = height / 2 + 10;
    this.sipario([0, 0, 0], 150);
    this.riquadro(cx - 310, cy - 170, 620, 340, 200);
    this.etichetta('LIVELLO ' + pr.numero + ' DI ' + NUMERO_LIVELLI, cx, cy - 128);
    this.scrivi(pr.regno, cx, cy - 78, { titolo: true, stile: 'bold', dim: pr.regno.length > 18 ? 40 : 48, col: [240, 240, 240] });
    this.scrivi('Casata ' + pr.casata, cx, cy - 32, { dim: 22, peso: 300, col: this.chiaroRegno(pr.tema) });
    this.percorso(cx, cy + 8, pr.numero - 1, pr.numero, -1);

    const frase = pr.speciale ? 'LIVELLO SPECIALE  ·  tempo limite ' + pr.tempoLimite + ' secondi' : 'Mangia tutto il cibo e sfuggi ai fantasmi';
    const ycol = cy + 98;
    this.scrivi(frase, cx, ycol, { dim: 16, peso: 400, col: pr.speciale ? [255, 200, 70] : [205, 205, 205] });
    if (pr.speciale) {                                          // orologio accanto alla scritta
      push(); textFont(FONT_TESTO); textSize(16); const ox = cx - textWidth(frase) / 2 - 18; pop();
      push(); noFill(); stroke(255, 200, 70); strokeWeight(2); circle(ox, ycol, 16); line(ox, ycol, ox, ycol - 6); line(ox, ycol, ox + 4, ycol + 2); pop();
    }
    if (pr.numero === NUMERO_LIVELLI) this.scrivi('Quando il cibo è finito, raggiungi il Trono', cx, ycol + 26, { dim: 16, peso: 400, col: [205, 205, 205] });
  }

  // Livello superato: stesso riquadro dell'inizio livello, con il cammino aggiornato e il punteggio.
  schermataCompletato(g) {
    const pr = g.parametri, cx = width / 2;
    const prossimo = REGNI[g.livello];                         // il regno dopo (nell'ultimo livello non esiste: lì si va alla vittoria)
    this.sipario([0, 0, 0], 150);
    this.riquadro(cx - 310, 150, 620, 384, 205);
    this.etichetta('LIVELLO ' + pr.numero + ' COMPLETATO', cx, 194);
    this.scrivi(pr.regno, cx, 242, { titolo: true, stile: 'bold', dim: pr.regno.length > 18 ? 42 : 50, col: [240, 240, 240] });
    this.scrivi('Casata ' + pr.casata, cx, 288, { dim: 22, peso: 300, col: this.chiaroRegno(pr.tema) });
    this.percorso(cx, 326, g.livello, 0, -1);
    this.etichetta('PUNTEGGIO', cx, 400);
    this.scrivi(String(g.punti), cx, 442, { titolo: true, stile: 'bold', dim: 46, col: [245, 245, 245] });
    this.scrivi((g.viteRinnovate ? 'Vite rinnovate: ' : 'Vite: ') + g.vite + (prossimo ? '    ·    Prossimo: ' + prossimo.nome : ''), cx, 494, { dim: 16, peso: 400, col: [190, 190, 190] });
    this.invito('Premi INVIO per continuare', 576, CHIARO);
  }

  // Pausa (SPAZIO): riquadro al centro con i comandi utili per riprendere o regolare la vista e l'audio.
  schermataPausa(g) {
    const pr = g.parametri, cx = width / 2;
    this.sipario([0, 0, 0], 170);
    this.riquadro(cx - 270, 152, 540, 350, 215);
    this.scrivi('PAUSA', cx, 212, { titolo: true, stile: 'bold', dim: 54, col: [240, 240, 240], sp: 6 });
    this.scrivi('Livello ' + pr.numero + ' di ' + NUMERO_LIVELLI + '  ·  ' + pr.regno, cx, 262, { dim: 18, peso: 300, col: this.chiaroRegno(pr.tema) });
    this.elencoComandi(cx, 296, [[['SPAZIO'], 'Riprendi'], [['R'], 'Ricomincia la partita'], [['V'], 'Vista 3D / 2D'], [['N'], 'Mappa intera'], [['M'], 'Audio']], 33);
    if (g.riavvioChiesto) this.scrivi('Premi di nuovo R per ricominciare da capo (un altro tasto annulla)', cx, 478, { dim: 15, peso: 500, col: [255, 200, 70] });
    this.invito('Premi SPAZIO per riprendere', 580, CHIARO);
    this.scrivi('Impostazioni (I)', POS_INGRANAGGIO.x - 30, POS_INGRANAGGIO.y, { dim: 14, peso: 400, col: [190, 190, 190], al: RIGHT });
    this.ingranaggio(POS_INGRANAGGIO.x, POS_INGRANAGGIO.y, CHIARO);
    if (this.impostazioni) this.schermataImpostazioni(g);
  }

  // Vittoria o sconfitta: sfondo radiale come il menu (oro scuro o rosso cupo), titolo, cammino dei regni e punteggio.
  schermataFine(g, vittoria) {
    const cx = width / 2;
    const titolo = vittoria ? 'HAI CONQUISTATO IL TRONO' : 'HAI PERSO';
    const superati = vittoria ? NUMERO_LIVELLI : g.livello - 1;
    this.sfondoMenu(vittoria ? [70, 52, 10] : [96, 12, 18]);
    this.scrivi('PAC-MAN DEL NORD', cx, 92, { dim: 15, peso: 500, sp: 4, col: [200, 200, 200] });
    this.scrivi(titolo, cx, 156, { titolo: true, stile: 'bold', dim: vittoria ? 52 : 64, col: [242, 242, 242] });
    this.scrivi(vittoria ? 'Hai superato tutti e otto i livelli' : 'Sei arrivato al livello ' + g.livello + ': ' + g.parametri.regno, cx, 214, { dim: 24, peso: 300, col: [225, 225, 225] });
    this.percorso(cx, 270, superati, 0, vittoria ? -1 : g.livello);
    this.etichetta('PUNTEGGIO', cx, 380);
    this.scrivi(String(g.punti), cx, 428, { titolo: true, stile: 'bold', dim: 52, col: [245, 245, 245] });
    if (g.nuovoRecord) this.scrivi('NUOVO RECORD', cx, 482, { dim: 18, peso: 600, sp: 3, col: [245, 245, 245], alfa: 170 + 85 * Math.sin(millis() / 250) });
    else this.scrivi('Record: ' + g.record, cx, 482, { dim: 19, peso: 400, sp: 1, col: [205, 205, 205] });
    this.invito(vittoria ? 'Premi INVIO per rigiocare' : 'Premi INVIO per riprovare', 570, CHIARO);
  }
}
