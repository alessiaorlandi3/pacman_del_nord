// Classe Fantasma
PImage nightking;
class Fantasma {
  int colonna, riga;   // Posizione attuale in celle
  int px, py;          // Posizione attuale in pixel
  int colonnaPrecedente, rigaPrecedente; // Posizione precedente
  int velocita;        // Velocità del movimento
  int contatoreMovimento; // Contatore per la velocità
  color colore;        // Colore del fantasma

  Fantasma(int colonna, int riga, int velocita) {
    this.colonna = colonna;
    this.riga = riga;
    this.px = colonna * dimensioneCella;
    this.py = riga * dimensioneCella;
    this.colonnaPrecedente = colonna;
    this.rigaPrecedente = riga;
    this.velocita = velocita;
    this.contatoreMovimento = 0;
    this.colore = color(255, 0, 0); // Colore predefinito: rosso
  }

  // Metodo per impostare il colore
  void setColor(color nuovoColore) {
    this.colore = nuovoColore;
  }

  void mostra() {
    if (!personalizzaFantasma(this)) {
      // Disegno predefinito: cerchio del colore impostato
      fill(this.colore);
      ellipse(px + dimensioneCella / 2, py + dimensioneCella / 2, dimensioneCella * 0.8, dimensioneCella * 0.8);
    }
  }

  void muovi() {
    contatoreMovimento++;
    if (contatoreMovimento < velocita) {
      return;
    }
    contatoreMovimento = 2;

    int[][] direzioni = {{0, -1}, {0, 1}, {-1, 0}, {1, 0}};
    ArrayList<int[]> mosseValide = new ArrayList<int[]>();

    for (int[] dir : direzioni) {
      int nuovaColonna = colonna + dir[0];
      int nuovaRiga = riga + dir[1];
      if (cellaValida(nuovaColonna, nuovaRiga) && (nuovaColonna != colonnaPrecedente || nuovaRiga != rigaPrecedente)) {
        mosseValide.add(new int[] {nuovaColonna, nuovaRiga});
      }
    }

   // Se ci sono mosse valide diverse dalla posizione precedente
    if (mosseValide.size() > 0) {
      int[] mossa = mosseValide.get((int)random(mosseValide.size()));
      colonnaPrecedente = colonna;
      rigaPrecedente = riga;
      colonna = mossa[0];
      riga = mossa[1];
      px = colonna * dimensioneCella;
      py = riga * dimensioneCella;
    } else {
      // Altrimenti, torna nella posizione precedente
      int nuovaColonna = colonnaPrecedente;
      int nuovaRiga = rigaPrecedente;
      colonnaPrecedente = colonna;
      rigaPrecedente = riga;
      colonna = nuovaColonna;
      riga = nuovaRiga;
      px = colonna * dimensioneCella;
      py = riga * dimensioneCella;
    }
  }

  boolean cellaValida(int colonna, int riga) {
    return colonna >= 0 && colonna < labirinto[0].length && riga >= 0 && 
    riga < labirinto.length && labirinto[riga][colonna] != 1 &&
    labirinto[riga][colonna] != 3;
  }

// Funzione per personalizzare il fantasma
  boolean personalizzaFantasma(Fantasma f) {
   nightking = loadImage("nightking.png");
    image(nightking,px + 3, py - 2 + 5, 25, 27);
    return true; // Gli studenti possono impostare a true e personalizzare
  }
}
