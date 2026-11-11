// La vista 3D in terza persona. Come la vista 2D, LEGGE lo stato del gioco e non lo cambia mai.
//
// Il mondo 3D usa le stesse coordinate del labirinto: colonna -> asse X, riga -> asse Z,
// l'altezza è l'asse Y (in p5 verso il basso, quindi "in alto" = valori negativi).
// 1 cella = CELLA unità. La scena è disegnata in un "foglio" separato (createGraphics WEBGL)
// che lo sketch poi incolla nella finestra, sotto la barra e sotto la minimappa.
class Vista3D {
  constructor(larghezza, altezza) {
    this.pg = createGraphics(larghezza, altezza, WEBGL);
    this.pg.pixelDensity(1);          // niente raddoppio dei pixel sugli schermi retina: più veloce
    this.angolo = null;               // direzione in cui guarda la camera (radianti)
  }

  // Posizione nel mondo del centro di una cella (x e y sono in celle, anche con decimali).
  static mondoX(x) { return (x + 0.5) * CELLA; }
  static mondoZ(y) { return (y + 0.5) * CELLA; }

  // Angolo di una direzione del gioco (0 = su, 1 = destra, 2 = giù, 3 = sinistra).
  static angoloDirezione(dir) {
    const d = DIREZIONI[dir];
    return Math.atan2(d.dr, d.dc);
  }

  // Differenza tra due angoli, scelta nel verso più breve (tra -PI e +PI).
  static differenzaAngoli(da, a) {
    let d = (a - da) % (2 * Math.PI);
    if (d > Math.PI) d -= 2 * Math.PI;
    if (d < -Math.PI) d += 2 * Math.PI;
    return d;
  }

  // La camera ruota dolcemente verso la direzione del personaggio.
  aggiornaAngolo(g, dt) {
    const bersaglio = Vista3D.angoloDirezione(g.giocatore.dir);
    if (this.angolo === null || g.stato !== 'gioco') {
      this.angolo = bersaglio;        // all'inizio di un livello niente giri
      return;
    }
    const passo = Math.min(1, dt * VELOCITA_ROTAZIONE);
    this.angolo += Vista3D.differenzaAngoli(this.angolo, bersaglio) * passo;
  }

  // Dove si trova la camera e dove guarda, dati personaggio e angolo. (Separato per poterlo provare.)
  static posizioneCamera(px, pz, angolo) {
    const avanti = { x: Math.cos(angolo), z: Math.sin(angolo) };
    return {
      occhio: { x: px - avanti.x * DISTANZA_CAMERA * CELLA, y: -ALTEZZA_CAMERA * CELLA, z: pz - avanti.z * DISTANZA_CAMERA * CELLA },
      mira: { x: px + avanti.x * PUNTO_MIRA_AVANTI * CELLA, y: -0.1 * CELLA, z: pz + avanti.z * PUNTO_MIRA_AVANTI * CELLA }
    };
  }

  disegna(g, dt) {
    const pg = this.pg;
    const tema = TEMI[g.parametri.tema];
    const p = g.giocatore;
    const px = Vista3D.mondoX(p.x), pz = Vista3D.mondoZ(p.y);
    this.aggiornaAngolo(g, dt);

    pg.push();
    pg.background(...tema.sfondo);
    pg.noStroke();
    pg.perspective(Math.PI / 3, pg.width / pg.height, 0.1 * CELLA, 60 * CELLA);
    const cam = Vista3D.posizioneCamera(px, pz, this.angolo);
    pg.camera(cam.occhio.x, cam.occhio.y, cam.occhio.z, cam.mira.x, cam.mira.y, cam.mira.z, 0, 1, 0);

    // Luci: una diffusa e una dall'alto (così le facce dei muri hanno sfumature diverse).
    pg.ambientLight(120, 120, 130);
    pg.directionalLight(200, 200, 205, 0.25, 1, 0.45);

    this.pavimento(tema);
    this.muri(g.lab, tema, p);
    this.trono(g);
    this.personaggi(g, tema);

    // Cibo e potenziamenti senza luci: restano ben visibili anche nei punti in ombra.
    pg.noLights();
    this.cibo(g.lab, tema, p);
    pg.pop();
  }

  // Incolla la scena nella finestra principale.
  mostra(x, y) { image(this.pg, x, y); }

  vicino(c, r, p) {
    const dc = c - p.x, dr = r - p.y;
    return dc * dc + dr * dr <= RAGGIO_DISEGNO * RAGGIO_DISEGNO;
  }

  pavimento(tema) {
    const pg = this.pg;
    pg.push();
    pg.fill(tema.sfondo[0] * 2 + 10, tema.sfondo[1] * 2 + 10, tema.sfondo[2] * 2 + 10);
    pg.translate(COLONNE * CELLA / 2, 1, RIGHE * CELLA / 2);
    pg.box((COLONNE + 12) * CELLA, 2, (RIGHE + 12) * CELLA);
    pg.pop();
  }

  muri(lab, tema, p) {
    const pg = this.pg;
    const h = ALTEZZA_MURI * CELLA;
    pg.fill(...tema.muro);
    for (let r = 0; r < RIGHE; r++) {
      for (let c = 0; c < COLONNE; c++) {
        if (lab.righe[r][c] !== '#' || !this.vicino(c, r, p)) continue;
        pg.push();
        pg.translate(Vista3D.mondoX(c), -h / 2, Vista3D.mondoZ(r));
        pg.box(CELLA * 0.98, h, CELLA * 0.98);
        pg.pop();
      }
    }
  }

  cibo(lab, tema, p) {
    const pg = this.pg;
    const t = millis() / 1000;
    for (const chiave of lab.cibo) {
      const [c, r] = chiave.split(',').map(Number);
      if (!this.vicino(c, r, p)) continue;
      pg.push();
      if (lab.potenziamenti.has(chiave)) {
        pg.fill(255, 200, 60);
        pg.translate(Vista3D.mondoX(c), -CELLA * (0.45 + 0.08 * Math.sin(t * 4 + c)), Vista3D.mondoZ(r));
        pg.sphere(CELLA * 0.2, 12, 8);
      } else {
        pg.fill(...tema.cibo);
        pg.translate(Vista3D.mondoX(c), -CELLA * 0.3, Vista3D.mondoZ(r));
        pg.sphere(CELLA * 0.09, 6, 4);
      }
      pg.pop();
    }
  }

  // Il Trono: grigio finché c'è cibo, dorato e pulsante quando si può raggiungere.
  trono(g) {
    const t = g.lab.trono;
    if (!t) return;
    const pg = this.pg;
    const K = CELLA;
    if (g.troneAperto) {
      const l = 205 + 50 * Math.sin(millis() / 150);
      pg.fill(l, l * 0.78, 40);
    } else {
      pg.fill(95, 95, 100);
    }
    const parte = (dx, dy, dz, lx, ly, lz) => {      // un blocco, con posizione e misure in celle
      pg.push();
      pg.translate(Vista3D.mondoX(t.c) + dx * K, -dy * K, Vista3D.mondoZ(t.r) + dz * K);
      pg.box(lx * K, ly * K, lz * K);
      pg.pop();
    };
    parte(0, 0.08, 0, 0.9, 0.16, 0.9);               // pedana
    parte(0, 0.35, 0.05, 0.6, 0.3, 0.5);             // seduta
    parte(0, 0.85, -0.3, 0.6, 0.9, 0.12);            // schienale
    parte(-0.34, 0.5, 0.05, 0.1, 0.25, 0.5);         // braccioli
    parte(0.34, 0.5, 0.05, 0.1, 0.25, 0.5);
    // Spade dietro lo schienale (come i troni di spade)
    const altezze = [0.7, 1.0, 1.3, 1.0, 0.7];
    altezze.forEach((a, i) => parte((i - 2) * 0.13, 1.3 + a / 2, -0.32 - Math.abs(i - 2) * 0.01, 0.06, a, 0.05));
  }

  personaggi(g, tema) {
    const p = g.giocatore;
    this.giocatore(p);
    for (const f of g.fantasmi) {
      let colore;
      if (f.spaventato) {
        const lampeggia = g.potenza < AVVISO_FINE_POTENZA && Math.floor(g.potenza * 6) % 2 === 0;
        colore = lampeggia ? [255, 255, 255] : [60, 90, 220];
      } else {
        colore = tema.fantasmi[f.comportamento];
      }
      this.fantasma(f, colore);
    }
  }

  // Occhi: due palline sul davanti del personaggio (davanti = direzione di marcia).
  occhi(x, y, z, angolo, raggio, quota, colore, pupilla) {
    const pg = this.pg;
    const av = { x: Math.cos(angolo), z: Math.sin(angolo) };
    const lato = { x: -av.z, z: av.x };
    for (const s of [-1, 1]) {
      pg.push();
      pg.translate(x + av.x * raggio * 0.75 + lato.x * s * raggio * 0.38, y - quota, z + av.z * raggio * 0.75 + lato.z * s * raggio * 0.38);
      pg.fill(...colore);
      pg.sphere(raggio * 0.22, 8, 6);
      pg.fill(...pupilla);
      pg.translate(av.x * raggio * 0.14, 0, av.z * raggio * 0.14);
      pg.sphere(raggio * 0.11, 6, 4);
      pg.pop();
    }
  }

  // Il giocatore: un VIANDANTE col mantello e la lanterna (personaggio originale).
  // Verde brillante come nella vista 2D, con il disco bianco ai piedi: si riconosce sempre.
  giocatore(p) {
    const pg = this.pg, K = CELLA;
    const x = Vista3D.mondoX(p.x), z = Vista3D.mondoZ(p.y);
    const angolo = Vista3D.angoloDirezione(p.dir);
    const av = { x: Math.cos(angolo), z: Math.sin(angolo) };
    const lato = { x: -av.z, z: av.x };
    const verde = COLORE_GIOCATORE, scuro = verde.map(c => c * 0.45);
    pg.push();
    pg.fill(255);                                       // disco bianco ai piedi
    pg.translate(x, -K * 0.03, z);
    pg.cylinder(K * 0.36, K * 0.06, 16, 1);
    pg.pop();
    pg.push();
    pg.fill(...verde);
    pg.translate(x, -K * 0.28, z);
    pg.cylinder(K * 0.24, K * 0.42, 14, 1);             // corpo
    pg.translate(0, -K * 0.38, 0);
    pg.sphere(K * 0.2, 14, 10);                         // testa
    pg.pop();
    pg.push();                                          // cappuccio e mantello (più scuri, dietro le spalle)
    pg.fill(...scuro);
    pg.translate(x - av.x * K * 0.16, -K * 0.5, z - av.z * K * 0.16);
    pg.ellipsoid(K * 0.26, K * 0.4, K * 0.26, 12, 8);
    pg.pop();
    pg.push();                                          // lanterna in mano (sul fianco)
    pg.fill(255, 190, 60);
    pg.translate(x + lato.x * K * 0.34 + av.x * K * 0.12, -K * 0.28, z + lato.z * K * 0.34 + av.z * K * 0.12);
    pg.sphere(K * 0.08, 8, 6);
    pg.pop();
    this.occhi(x, 0, z, angolo, K * 0.2, K * 0.66, [255, 255, 255], [10, 10, 10]);
  }

  // Le tre creature (personaggi originali, riconoscibili dalla forma):
  //   insegue  = LUPO SPETTRALE   (orecchie a punta e muso)
  //   anticipa = CORVO D'OMBRA    (becco e ali)
  //   casuale  = FUOCO FATUO      (fluttua e lascia una scia)
  fantasma(f, colore) {
    const pg = this.pg, K = CELLA;
    const x = Vista3D.mondoX(f.x), z = Vista3D.mondoZ(f.y);
    const angolo = Vista3D.angoloDirezione(f.dir);
    const av = { x: Math.cos(angolo), z: Math.sin(angolo) };
    const lato = { x: -av.z, z: av.x };
    const fuoco = f.comportamento === 'casuale';
    const quota = fuoco ? 0.12 * K : 0;                              // il fuoco fatuo fluttua più in alto
    const ondeggia = (fuoco ? 0.06 : 0.03) * K * Math.sin(millis() / 180 + f.inizio.c) + quota;
    const sfera = (dx, dy, dz, r, col) => {                           // piccola sfera, posizione relativa al fantasma
      pg.push(); pg.fill(...col);
      pg.translate(x + dx, -dy - ondeggia, z + dz);
      pg.sphere(r, 8, 6); pg.pop();
    };
    pg.push();
    pg.fill(...colore);
    pg.translate(x, -K * 0.3 - ondeggia, z);
    if (!fuoco) pg.cylinder(K * 0.3, K * 0.4, 14, 1);
    pg.translate(0, -K * 0.2, 0);
    pg.sphere(K * 0.3, 14, 10);                                      // testa tonda
    pg.pop();
    const chiaro = colore.map(c => Math.min(255, c * 0.7 + 60)), scuro = colore.map(c => c * 0.5);
    if (f.comportamento === 'insegue') {
      for (const s of [-1, 1]) {                                     // orecchie a punta
        pg.push(); pg.fill(...scuro);
        pg.translate(x + lato.x * s * K * 0.17, -K * 0.78 - ondeggia, z + lato.z * s * K * 0.17);
        pg.ellipsoid(K * 0.07, K * 0.15, K * 0.07, 6, 6); pg.pop();
      }
      sfera(av.x * K * 0.3, K * 0.42, av.z * K * 0.3, K * 0.13, chiaro);   // muso
      sfera(av.x * K * 0.42, K * 0.42, av.z * K * 0.42, K * 0.04, [20, 20, 20]);   // naso
    } else if (f.comportamento === 'anticipa') {
      for (const s of [-1, 1]) {                                     // ali ai lati
        pg.push(); pg.fill(...scuro);
        pg.translate(x + lato.x * s * K * 0.34, -K * 0.4 - ondeggia, z + lato.z * s * K * 0.34);
        pg.ellipsoid(K * 0.1, K * 0.2, K * 0.2, 8, 6); pg.pop();
      }
      sfera(av.x * K * 0.36, K * 0.5, av.z * K * 0.36, K * 0.08, [255, 190, 40]);   // becco
    } else {
      for (let i = 1; i <= 3; i++)                                   // scia di fiammelle dietro
        sfera(-av.x * K * 0.2 * i, K * (0.5 - 0.1 * i), -av.z * K * 0.2 * i, K * (0.22 - 0.05 * i), chiaro);
    }
    if (!fuoco) {
      for (let i = 0; i < 4; i++) {                                  // piedini
        const a = i * Math.PI / 2 + Math.PI / 4;
        sfera(Math.cos(a) * K * 0.22, K * 0.06, Math.sin(a) * K * 0.22, K * 0.1, colore);
      }
    }
    this.occhi(x, 0, z, angolo, K * 0.3, K * 0.55 + ondeggia, [255, 255, 255], f.spaventato ? [200, 30, 30] : [10, 30, 90]);
  }
}
