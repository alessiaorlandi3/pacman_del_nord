class PacMan {
  int colonna, riga;
  int px, py;
  int colonnaIniziale, rigaIniziale;
  PImage spriteJonSnow;

  PacMan(int colonna, int riga) {
    this.colonna = colonna;
    this.riga = riga;
    this.px = colonna * dimensioneCella;
    this.py = riga * dimensioneCella;
    this.colonnaIniziale = colonna;
    this.rigaIniziale = riga;
    // Caricata solo all'avvio
    this.spriteJonSnow = loadImage("jonsnow.png");
  }

  void mostra() {
    if (spriteJonSnow != null) {
      image(spriteJonSnow, px + 1, py + 1, 27, 27);
    } else {
      fill(255, 255, 0);
      ellipse(px + dimensioneCella / 2, py + dimensioneCella / 2, dimensioneCella * 0.8, dimensioneCella * 0.8);
    }
  }

  void muovi(int dx, int dy) {
    int nuovaColonna = colonna + dx;
    int nuovaRiga = riga + dy;

    if (nuovaColonna >= 0 && nuovaColonna < colonne && nuovaRiga >= 0 && nuovaRiga < righe) {
      if (labirinto[nuovaRiga][nuovaColonna] != 1 && labirinto[nuovaRiga][nuovaColonna] != 3) {
        colonna = nuovaColonna;
        riga = nuovaRiga;
        px = colonna * dimensioneCella;
        py = riga * dimensioneCella;

        if (labirinto[riga][colonna] == 2) {
          labirinto[riga][colonna] = 0;
          onCatturaCibo();
        }
      }
    }
  }

  void reset() {
    colonna = colonnaIniziale;
    riga = rigaIniziale;
    px = colonna * dimensioneCella;
    py = riga * dimensioneCella;
  }
}
