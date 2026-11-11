// Tutti i numeri fissi del gioco, con un nome (requisito RNF4).
const CELLA = 30;               // lato di una cella in pixel
const COLONNE = 21;
const RIGHE = 13;
const ALTEZZA_HUD = 40;         // fascia in alto con vite e punteggio

const VITE_INIZIALI = 3;
const PUNTI_CIBO = 10;
const PUNTI_POTENZIAMENTO = 50;
const PUNTI_FANTASMA = 200;

// Potenziamento (le 4 sfere negli angoli): i fantasmi diventano vulnerabili.
const DURATA_POTENZA = 6.0;      // secondi
const FATTORE_SPAVENTATO = 0.6;  // i fantasmi spaventati vanno più piano
const AVVISO_FINE_POTENZA = 2.0; // negli ultimi secondi i fantasmi lampeggiano

// Fantasmi: ognuno ha un comportamento e parte con un po' di ritardo.
const COMPORTAMENTI = ['insegue', 'anticipa', 'casuale'];
const RITARDI_FANTASMI = [3, 8, 12]; // secondi di attesa all'inizio

// I fantasmi alternano due fasi, come nel Pac-Man classico: nella dispersione
// vanno ognuno verso il proprio angolo (si respira), nella caccia attaccano.
const DURATA_DISPERSIONE = 7.0;     // secondi
const DURATA_CACCIA = 20.0;         // secondi
const DISTANZA_MINIMA_PARTENZA = 12; // celle tra giocatore e fantasmi all'inizio
const PAUSA_RIENTRO = 3.0;           // attesa di un fantasma mangiato prima di ripartire
const PASSI_ANTICIPO = 4;            // "anticipa" mira a 4 celle davanti al giocatore

const VELOCITA_GIOCATORE = 3.5; // celle al secondo (una corsa, vista da dietro)
const VELOCITA_FANTASMA = 2.4;  // celle al secondo (più lento del giocatore)
const FATTORE_TUNNEL = 0.6;     // nel passaggio laterale si va più piano
const DISTANZA_CONTATTO = 0.6;  // sotto questa distanza (in celle) c'è contatto
const PAUSA_INIZIO = 1.5;       // secondi di attesa dopo aver perso una vita
const PAUSA_LIVELLO = 2.5;      // secondi di attesa all'inizio di ogni livello
const DT_MASSIMO = 0.05;        // se un frame dura di più, il tempo viene limitato

// Comandi: false = frecce "assolute" (su = verso l'alto dello schermo), adatte alla vista
// dall'alto. true = comandi "relativi" (su = avanti, sinistra/destra = gira), adatti alla
// telecamera dietro al personaggio. Con la vista 3D passeremo a true.
const TEMPO_SVOLTA_PRENOTATA = 1.0;   // secondi: una svolta prenotata senza strada libera scade (comandi relativi)
let CONTROLLI_RELATIVI = false;   // lo imposta lo sketch: true nella vista 3D (comandi dal punto di vista del personaggio)

// Livelli: uno per regno (7) più il Trono. La difficoltà cresce a ogni livello;
// ogni 4 c'è un livello speciale (il 4 e l'8), con tempo limite.
const NUMERO_LIVELLI = 8;
const OGNI_QUANTI_SPECIALE = 4;
const INCREMENTO_VELOCITA = 0.1;       // i fantasmi guadagnano questo a ogni livello...
const VELOCITA_MASSIMA_FANTASMA = 3.2;  // ...fino a questo massimo
const BONUS_VELOCITA_SPECIALE = 0.2;    // i fantasmi speciali sono un po' più veloci
const RIDUZIONE_RITARDO = 0.5;          // ogni livello i fantasmi escono 0,5 s prima
const RITARDO_MINIMO = 1.0;
const DURATA_POTENZA_MINIMA = 3.0;      // il potere dura 1 s in meno a ogni livello, fino a 3 s
// Percorso ideale per mangiare tutto: circa 55 s senza fantasmi. Il tempo limite
// lascia circa il triplo per scappare dai fantasmi.
const TEMPO_LIMITE_SPECIALE = 150;      // secondi, primo livello speciale
const RIDUZIONE_TEMPO_SPECIALE = 10;    // ogni livello speciale successivo: 10 s in meno
const TEMPO_MINIMO_SPECIALE = 120;

const CHIAVE_RECORD = 'pacman_del_nord_record';  // nome con cui il browser salva il record

// Finestra del gioco: in alto la barra, sotto la scena 3D, in basso a destra la minimappa 2D.
const LARGHEZZA_FINESTRA = 960;
const ALTEZZA_FINESTRA = 640;
const DIAMETRO_MINIMAPPA = 230;   // la minimappa è un cerchio centrato sul personaggio e ruota con la camera
const SCALA_MINIMAPPA_INTERA = 0.38;  // mappa intera ferma (in alto a destra; tasto N la nasconde)
const SCALA_MINIMAPPA = 0.55;     // ingrandimento della mappa 2D dentro il cerchio
const MARGINE_MINIMAPPA = 10;
// Telecamera in terza persona (misure in celle).
const DISTANZA_CAMERA = 2.8;      // quanto sta dietro al personaggio
const ALTEZZA_CAMERA = 2.2;       // quanto sta in alto
const PUNTO_MIRA_AVANTI = 1.6;    // guarda un po' davanti al personaggio
const VELOCITA_ROTAZIONE = 4;     // quanto in fretta la camera segue la direzione (più alto = più veloce)
const ALTEZZA_MURI = 1.3;
const VELOCITA_PASSO = 13;        // quanto in fretta il cavaliere muove gambe e braccia (radianti al secondo)
const RISOLUZIONE_3D = 1;         // 1 = veloce; 2 = più nitida sugli schermi retina (ma più pesante)
const RAGGIO_DISEGNO = 9;         // oltre questa distanza (in celle) muri e cibo non vengono disegnati
// Nella vista 3D si vede meno (niente sguardo dall'alto, nessuna visione dietro di sé): i fantasmi vanno più piano.
const FATTORE_FANTASMI_3D = 0.75;
let fattoreFantasmiVista = 1;     // lo imposta lo sketch (1 in 2D, FATTORE_FANTASMI_3D in 3D)
const MISURA_FPS = true;        // scrive gli FPS in console una volta al secondo

// Direzioni: 0 = su, 1 = destra, 2 = giù, 3 = sinistra (in senso orario).
const DIREZIONI = [
  { dc: 0, dr: -1 },
  { dc: 1, dr: 0 },
  { dc: 0, dr: 1 },
  { dc: -1, dr: 0 }
];
