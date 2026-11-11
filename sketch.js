// Collegamento con p5.js: crea la finestra, chiama il gioco, il disegno e i suoni.
let gioco;
let vista;
let suoni;
let vista3d = null;       // la scena 3D (null se il browser non la supporta)
let mappaIntera = true;   // mappa intera e ferma (in alto a destra), oltre al cerchio che ruota; tasto N: la nasconde
let modo3D = true;        // true = terza persona + minimappa, false = vista 2D classica

function setup() {
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

function draw() {
  gioco.aggiorna(deltaTime / 1000);
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
      vista3d.disegna(gioco, Math.min(deltaTime / 1000, DT_MASSIMO));
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
  if (gioco.stato === 'pronto' || gioco.stato === 'gioco') suoni.musica(gioco.parametri.tema);
  else suoni.fermaMusica();
  // 2 = potere o Trono aperto, 1 = caccia (entrano i tamburi), 0 = dispersione
  suoni.intensita = (gioco.potenza > 0 || gioco.troneAperto) ? 2 : (gioco.stato === 'gioco' && gioco.modo === 'caccia' ? 1 : 0);
}

function keyPressed() {
  suoni.avvia();
  if (key === 'm' || key === 'M') { suoni.alternaMuto(); return false; }
  if (key === 'p' || key === 'P') { gioco.tasto('prova'); return false; }
  if (key === 'e' || key === 'E') { gioco.tasto('completa'); return false; }
  if (key === 'n' || key === 'N') { mappaIntera = !mappaIntera; return false; }
  if ((key === 'v' || key === 'V') && vista3d) { impostaModo(!modo3D); return false; }
  const tasti = {
    ArrowUp: 'su', ArrowDown: 'giu', ArrowLeft: 'sinistra', ArrowRight: 'destra',
    Enter: 'invio', ' ': 'invio',
    1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8'   // scelta del livello dal menu
  };
  if (tasti[key]) {
    gioco.tasto(tasti[key]);
    return false;   // evita che le frecce facciano scorrere la pagina
  }
}
