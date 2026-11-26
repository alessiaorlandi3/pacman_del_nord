// Collegamento con p5.js: crea la finestra, chiama il gioco, il disegno e i suoni.
let gioco;
let vista;
let suoni;
let vista3d = null;       // la scena 3D (null se il browser non la supporta)
let mappaIntera = true;   // mappa intera e ferma (in alto a destra), oltre al cerchio che ruota; tasto N: la nasconde
let modo3D = true;        // true = terza persona + minimappa, false = vista 2D classica

function setup() {
  // Carica i caratteri delle schermate (se la rete manca, restano i caratteri di riserva).
  if (typeof document !== 'undefined' && document.fonts && document.fonts.load) {
    for (const f of ['700 24px "Libre Baskerville"', '400 24px "Libre Baskerville"', '300 24px Montserrat', '400 18px Montserrat', '500 18px Montserrat', '600 18px Montserrat']) {
      try { document.fonts.load(f); } catch (e) { /* niente */ }
    }
  }
  createCanvas(LARGHEZZA_FINESTRA, ALTEZZA_FINESTRA);
  // Il record si salva nel browser (localStorage); se non è disponibile, si perde alla chiusura.
  gioco = new Gioco({
    leggi: chiave => localStorage.getItem(chiave),
    scrivi: (chiave, valore) => localStorage.setItem(chiave, valore)
  });
  vista = new Vista2D();
  vista3d = creaVista3D();
  impostaModo(vista3d !== null);
  suoni = new Suoni();   // l'audio parte al primo tasto premuto (regola dei browser)
}

// Il tempo tra un fotogramma e l'altro oscilla di qualche millisecondo anche a 60 FPS: usarlo così com'è fa tremare un po' il
// movimento. Piccole oscillazioni vengono smussate con una media; un fotogramma davvero lento passa invariato.
let dtLiscio = 1 / 60, dtFotogramma = 1 / 60;
function tempoFotogramma() {
  const reale = Math.min(deltaTime / 1000, 0.25);
  if (Math.abs(reale - dtLiscio) > 0.03) dtLiscio = reale;
  else dtLiscio += (reale - dtLiscio) * 0.2;
  return dtLiscio;
}

function draw() {
  dtFotogramma = tempoFotogramma();
  gioco.aggiorna(dtFotogramma);
  disegnaScena();
  aggiornaSuoni();
  if (MISURA_FPS && frameCount % 60 === 0) console.log(frameRate());
}

// Prova la vista Three.js (la più realistica); se non c'è o dà errore, la vista 3D di p5; se neanche quella, null (2D).
function creaVista3D(escludiThree = false) {
  const altezza = height - ALTEZZA_HUD;
  if (!escludiThree) {
    try { return new VistaThree(width, altezza); }
    catch (errore) { console.warn('Vista Three.js non disponibile, provo la vista p5:', errore); }
  }
  try { return new Vista3D(width, altezza); }
  catch (errore) { console.error('Vista 3D non disponibile, uso la vista 2D:', errore); return null; }
}

// 3D = comandi relativi (dal punto di vista del personaggio); 2D = frecce come sulla mappa.
function impostaModo(tre) {
  modo3D = tre;
  CONTROLLI_RELATIVI = tre;
  fattoreFantasmiVista = tre ? FATTORE_FANTASMI_3D : 1;
  if (gioco.giocatore) gioco.giocatore.richiesta = null;   // una svolta già prenotata non ha più senso con l'altro tipo di comandi
}

function disegnaScena() {
  if (modo3D) {
    try {
      background(0);
      vista3d.disegna(gioco, Math.min(dtFotogramma, DT_MASSIMO));
      vista3d.mostra(0, ALTEZZA_HUD);
      vista.disegnaBarraEMessaggi(gioco);
      vista.minimappa(gioco, vista3d.angolo);
      if (mappaIntera) vista.minimappaIntera(gioco);
      vista.guidaSvolte(gioco);
      vista.schermate(gioco);
      return;
    } catch (errore) {
      console.error('Errore nella vista 3D:', errore);
      if (typeof VistaThree !== "undefined" && vista3d instanceof VistaThree) {
        vista3d = creaVista3D(true);          // Three.js non va: ripiego sulla vista 3D di p5 (o sulla 2D se non c'è)
        if (!vista3d) impostaModo(false);
      } else {
        vista3d = null;                       // anche la vista p5 non va: vista 2D
        impostaModo(false);
      }
    }
  }
  vista.disegna(gioco);
}

// I suoni leggono lo stato del gioco, senza modificarlo.
function aggiornaSuoni() {
  for (const evento of gioco.eventi.splice(0)) suoni.effetto(evento);
  if ((gioco.stato === 'pronto' || gioco.stato === 'gioco') && !gioco.inPausa) suoni.musica(gioco.parametri.tema);
  else suoni.fermaMusica();
  // 2 = potere o Trono aperto, 1 = caccia (entrano i tamburi), 0 = dispersione
  suoni.intensita = (gioco.potenza > 0 || gioco.troneAperto) ? 2 : (gioco.stato === 'gioco' && gioco.modo === 'caccia' ? 1 : 0);
}

function keyPressed() {
  suoni.avvia();
  // Le impostazioni si aprono dal menu e dalla pausa (tasto I o clic sull'ingranaggio).
  if (vista.impostazioni && (key === 'Escape' || key === 'Enter' || key === ' ' || key === 'i' || key === 'I')) { vista.impostazioni = false; return false; }
  if (impostazioniDisponibili() && (key === 'i' || key === 'I')) { vista.impostazioni = true; return false; }
  if (vista.impostazioni && /^[1-8]$/.test(key)) return false;   // dalle impostazioni non si parte
  if (key === 'r' || key === 'R') {                                // ricomincia la partita (solo in pausa, con conferma)
    gioco.tasto('ricomincia');
    if (!gioco.inPausa) vista.impostazioni = false;
    return false;
  }
  if (key === 'm' || key === 'M') { suoni.alternaMuto(); return false; }
  if (key === 'p' || key === 'P') { gioco.tasto('prova'); return false; }
  if (key === 'e' || key === 'E') { gioco.tasto('completa'); return false; }
  if (key === 'n' || key === 'N') { mappaIntera = !mappaIntera; return false; }
  if ((key === 'v' || key === 'V') && vista3d) { impostaModo(!modo3D); return false; }
  const tasti = {
    ArrowUp: 'su', ArrowDown: 'giu', ArrowLeft: 'sinistra', ArrowRight: 'destra',
    Enter: 'invio', ' ': 'spazio', Escape: 'pausa',
    1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8'   // scelta del livello dal menu
  };
  if (tasti[key]) {
    gioco.tasto(tasti[key]);
    return false;   // evita che le frecce facciano scorrere la pagina
  }
}

// Clic sull'ingranaggio (in basso a destra nel menu): apre e chiude le impostazioni.
function impostazioniDisponibili() { return gioco.stato === 'menu' || gioco.inPausa; }

function mousePressed() {
  if (impostazioniDisponibili() && Math.hypot(mouseX - POS_INGRANAGGIO.x, mouseY - POS_INGRANAGGIO.y) < 24) vista.impostazioni = !vista.impostazioni;
}
