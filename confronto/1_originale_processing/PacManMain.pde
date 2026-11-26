import processing.sound.*; //<>//
import java.io.File;

// Costanti per il labirinto
int colonne = 21;
int righe = 13;
int dimensioneCella = 30;

// Musica e suoni
SoundFile musicaSfondo;
SoundFile suonoMovimento;
SoundFile suonoCatturaCibo;
SoundFile suonoFruttoSpeciale;
SoundFile suonoCollisione;
SoundFile suonoFineGioco;

// Immagini
PImage immagineMuro = null;
PImage immagineSfondo = null;
PImage immagineGameOver = null;

boolean fineGiocoAvviata = false;
boolean vittoriaAvviata = false;

int vite = 3;
int punteggio = 0;
int punteggioMassimo = 680;

// Labirinto (0 = vuoto, 1 = muro, 2 = cibo, 3 = blocco)
int[][] labirinto = {
  {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
  {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
  {1, 0, 1, 0, 0, 2, 2, 1, 1, 1, 1, 2, 2, 2, 2, 0, 0, 0, 1, 1, 1},
  {1, 0, 0, 0, 1, 1, 0, 0, 0, 2, 1, 1, 1, 0, 1, 1, 1, 2, 0, 0, 1},
  {1, 2, 1, 3, 3, 3, 0, 1, 1, 3, 3, 3, 0, 0, 3, 3, 3, 3, 3, 0, 1},
  {1, 2, 3, 1, 1, 2, 0, 0, 3, 2, 2, 2, 3, 0, 0, 0, 3, 1, 2, 0, 1},
  {1, 2, 3, 1, 2, 0, 1, 0, 3, 0, 1, 0, 3, 1, 1, 0, 3, 2, 2, 1, 1},
  {1, 0, 3, 1, 0, 3, 3, 0, 3, 0, 1, 0, 3, 0, 0, 0, 3, 1, 0, 0, 1},
  {1, 0, 3, 2, 2, 2, 3, 0, 3, 0, 2, 0, 3, 2, 1, 1, 3, 1, 1, 2, 1},
  {1, 0, 0, 3, 3, 3, 0, 0, 0, 3, 2, 3, 0, 0, 2, 0, 3, 1, 0, 2, 1},
  {1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 0, 1, 1},
  {1, 1, 0, 0, 2, 2, 2, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 2, 1, 1, 1},
  {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1}
};

PacMan pacman;
Fantasma fantasma;

void settings() {
  size(colonne * dimensioneCella, righe * dimensioneCella);
}

void setup() {
  pacman = new PacMan(1, 2);
  fantasma = new Fantasma(13, 8, 12); // velocità controllata del fantasma

  if (caricaImmaginiLabirinto()) {
    immagineMuro = caricaImmagineSicura("ghiaccio1.jpg");
    immagineSfondo = caricaImmagineSicura("sfondo.jpg");
  }

  // Caricamento foto Game Over del Re della Notte
  immagineGameOver = caricaImmagineSicura("gameover.png");

  musicaSfondo = caricaSuono("got.mp3");
  suonoMovimento = caricaSuono("movimento.wav");
  suonoCatturaCibo = caricaSuono("prova2.mp3");
  suonoFruttoSpeciale = caricaSuono("frutto.wav");
  suonoCollisione = caricaSuono("collisione.wav");
  suonoFineGioco = caricaSuono("musicaperdita.mp3");

  if (personalizzaMusicaSfondo() && musicaSfondo != null) {
    musicaSfondo.loop();
  }
}

void draw() {
  // 1. STATO: SCONFITTA (FOTO DEL RE DELLA NOTTE)
  if (vite <= 0) {
    if (!fineGiocoAvviata) {
      if (musicaSfondo != null) musicaSfondo.stop();
      onEndGame();
      fineGiocoAvviata = true;
    }

    if (immagineGameOver != null) {
      image(immagineGameOver, 0, 0, width, height);
    } else {
      background(10, 15, 25);
      fill(#77C2E0);
      textAlign(CENTER, CENTER);
      textSize(28);
      text("WINTER IS HERE", width / 2, height / 2);
    }
    return;
  }

  // 2. STATO: VITTORIA (SCRITTA GRAFICA)
  if (punteggio >= punteggioMassimo) {
    if (!vittoriaAvviata) {
      if (musicaSfondo != null) musicaSfondo.stop();
      vittoriaAvviata = true;
    }
    
    background(10, 20, 35);
    livelloSuperato();
    return;
  }

  // 3. GIOCO IN ESECUZIONE
  if (immagineSfondo != null) {
    image(immagineSfondo, 0, 0, width, height);
  } else {
    background(0);
  }

  disegnaLabirinto();

  pacman.mostra();
  fantasma.mostra();
  fantasma.muovi();

  verificaCollisione();

  visualizzaVite();
  visualizzaPunteggio();
}

void verificaCollisione() {
  if (pacman.colonna == fantasma.colonna && pacman.riga == fantasma.riga) {
    vite--;
    if (vite <= 0) {
      if (!onEndGame()) {
        noLoop();
      }
    } else {
      onCollisione();
      pacman.reset();
    }
  }

  if (labirinto[pacman.riga][pacman.colonna] == 2) {
    labirinto[pacman.riga][pacman.colonna] = 0;
    onCatturaCibo();
  }
}

void disegnaLabirinto() {
  for (int riga = 0; riga < righe; riga++) {
    for (int colonna = 0; colonna < colonne; colonna++) {
      if (labirinto[riga][colonna] == 1) {
        if (immagineMuro != null) {
          image(immagineMuro, colonna * dimensioneCella, riga * dimensioneCella, dimensioneCella, dimensioneCella);
        } else {
          fill(#86B0B7);
          stroke(0);
          rect(colonna * dimensioneCella, riga * dimensioneCella, dimensioneCella, dimensioneCella, 5);
        }
      } else if (labirinto[riga][colonna] == 2) {
        fill(255);
        stroke(0, 255, 255);
        ellipse(colonna * dimensioneCella + dimensioneCella / 2, riga * dimensioneCella + dimensioneCella / 2, dimensioneCella * 0.3, dimensioneCella * 0.3);
      } else if (labirinto[riga][colonna] == 3) {
        fill(255);
        stroke(0);
        rect(colonna * dimensioneCella, riga * dimensioneCella, dimensioneCella, dimensioneCella, 5);
      }
    }
  }
}

PImage caricaImmagineSicura(String nomeFile) {
  File f = new File(sketchPath("data/" + nomeFile));
  if (f.exists()) {
    return loadImage(nomeFile);
  } else {
    File fRoot = new File(sketchPath(nomeFile));
    if (fRoot.exists()) {
      return loadImage(nomeFile);
    }
  }
  return null;
}

SoundFile caricaSuono(String nomeFile) {
  File file = new File(sketchPath("data/" + nomeFile));
  if (!file.exists()) {
    file = new File(sketchPath(nomeFile));
  }
  if (file.exists()) {
    return new SoundFile(this, nomeFile);
  } else {
    return null;
  }
}

void suonaSuono(SoundFile suono) {
  if (suono != null) {
    suono.play();
  }
}

void keyPressed() {
  if (keyCode == UP) pacman.muovi(0, -1);
  if (keyCode == DOWN) pacman.muovi(0, 1);
  if (keyCode == LEFT) pacman.muovi(-1, 0);
  if (keyCode == RIGHT) pacman.muovi(1, 0);
}

boolean caricaImmaginiLabirinto() {
  return false;
}

void visualizzaVite() {
  fill(255);
  textSize(20);
  text("Vite: " + vite, 10, 20);
}

void visualizzaPunteggio() {
  fill(255);
  textSize(20);
  text("Punteggio: " + punteggio, 450, 20);
}

void onCollisione() {
  suonaSuono(suonoCollisione);
}

void onCatturaCibo() {
  suonaSuono(suonoCatturaCibo);
  punteggio += 20;
}

void livelloSuperato() {
  textAlign(CENTER, CENTER);
  
  // Ombra del testo
  fill(0, 220);
  textSize(32);
  text("WELL DONE,", width / 2 + 2, height / 2 - 22);
  text("YOU LEVELED UP!", width / 2 + 2, height / 2 + 22);

  // Testo celeste
  fill(#77C2E0);
  textSize(32);
  text("WELL DONE,", width / 2, height / 2 - 20);
  text("YOU LEVELED UP!", width / 2, height / 2 + 20);
}

boolean onEndGame() {
  if (suonoFineGioco != null) {
    suonoFineGioco.play();
  }
  return true;
}

boolean personalizzaMusicaSfondo() {
  return true;
}
