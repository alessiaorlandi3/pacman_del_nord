// L'ambientazione di ogni regno nella vista Three.js: texture dei muri, nebbia, luci, particelle
// (neve, pioggia, braci...) e torce sui muri. Tutto generato dal codice: nessuna immagine esterna.
//
// Ogni regno ha la sua "scheda" in AMBIENTI. Per cambiare l'atmosfera di un livello basta ritoccare quella scheda.
//   nebbia     = colore e distanza (vicino, lontano) oltre la quale tutto sfuma
//   cielo      = luce d'ambiente dall'alto e dal basso (colore e forza)
//   sole       = luce direzionale (colore e forza)
//   texture    = aspetto dei muri: 'pietra' (blocchi), 'roccia' (grezza), 'sabbia' (blocchi lisci), 'siepe' (foglie e fiori)
//   cima       = colore della parte alta dei muri (neve, sabbia, pietra scura...)
//   particelle = cosa cade o fluttua nell'aria: quantità, colore, dimensione, velocità (celle/secondo), opacità
//   decor      = decorazioni speciali: 'leone' (stendardi), 'deserto' (giare, palme, dune), 'castello' (sala con colonne e finestre), 'nord' (abeti e mucchi di neve), 'isole' (barili, casse, scogli, alberi di nave), 'valle' (pini, guglie di roccia, fiori), 'tempesta' (stendardi strappati, alberi spogli, guglie, pozzanghere)
//   fregio     = colore della fascia decorativa in cima ai muri (facoltativa)
//   baseMuro / pavimento / variazioneAltezza = (facoltativi) colore diverso per la texture dei muri, viottoli di 'ghiaia', muri di altezza irregolare
//   torce      = ogni quanti muri (circa) c'è una torcia; 0 = nessuna
//   lampi      = true: ogni tanto un lampo illumina la scena (tempesta)
const AMBIENTI = {
  // Il Nord (Grande Inverno): pietra scura coperta di neve, pavimento innevato, abeti e mucchi di neve.
  nord:        { nebbia: [[38, 48, 68], 5, 13],   cielo: [0xb8c8ff, 0x1a2030, 0.85], sole: [0xcfe0ff, 0.45], texture: 'pietraneve', luminosita: 1.0, cima: [238, 244, 255],
                 suolo: [196, 208, 228], baseMuro: [92, 98, 114], pavimento: 'neve', pavimentoColore: [222, 230, 246], decor: 'nord',
                 particelle: { conta: 260, colore: 0xffffff, dim: 0.075, vel: [0.15, -0.9, 0.05], opacita: 0.9 }, torce: 9 },
  // Isole e Fiumi (Isole di Ferro): roccia nera bagnata, molo di assi, barili, casse, scogli e il mare attorno.
  isole_fiumi: { nebbia: [[10, 22, 44], 5, 13],   cielo: [0x8aa4e0, 0x10182a, 0.8],  sole: [0xb8c8ff, 0.4],  texture: 'rocciabagnata', luminosita: 1.0, cima: [58, 68, 84],
                 suolo: [14, 40, 72], baseMuro: [58, 66, 80], pavimento: 'assi', pavimentoColore: [118, 86, 56], decor: 'isole',
                 particelle: { conta: 240, colore: 0x9ab8ff, dim: 0.045, vel: [0.35, -5.0, 0.2], opacita: 0.55 }, torce: 8 },
  // La Valle (stile Dolomiti): pareti di roccia chiara e rosata, prato alpino, pini e guglie lontane. Giornata limpida, niente torce.
  valle:       { nebbia: [[128, 148, 180], 7, 20], cielo: [0xd8e2f4, 0x3a4838, 0.82], sole: [0xffeed0, 0.55], texture: 'dolomia', luminosita: 0.88, cima: [200, 190, 184],
                 suolo: [84, 116, 62], baseMuro: [206, 172, 160], pavimento: 'prato', pavimentoColore: [92, 128, 66], decor: 'valle',
                 particelle: { conta: 110, colore: 0xfff2c0, dim: 0.06, vel: [0.05, 0.04, 0.02], opacita: 0.85, vagare: true }, torce: 0 },
  // La Roccia (Lannister): marmo cremisi, fregi d'oro, stendardi, pavimento a scacchi oro e nero. Regale ed elegante.
  roccia:      { nebbia: [[40, 8, 12], 5, 13],    cielo: [0xffb090, 0x200808, 0.75], sole: [0xffc080, 0.5],  texture: 'marmo', luminosita: 1.0, cima: [170, 130, 45],
                 suolo: [34, 10, 14], baseMuro: [120, 22, 34], pavimento: 'scacchi', pavimentoColore: [120, 96, 38], fregio: [212, 175, 55], fregioBase: true, decor: 'leone',
                 particelle: { conta: 90, colore: 0xffd060, dim: 0.05, vel: [0.03, 0.35, 0.0], opacita: 0.9, vagare: true }, torce: 7 },
  altopiano:   { nebbia: [[36, 48, 32], 6, 15],   cielo: [0xfff0d0, 0x1c2414, 0.9],  sole: [0xffe8b8, 0.6],  texture: 'siepe', luminosita: 1.0, cima: [40, 84, 44],
                 suolo: [58, 84, 40], baseMuro: [40, 86, 42], pavimento: 'ghiaia', variazioneAltezza: 0.12,
                 particelle: { conta: 70, colore: 0xf0e070, dim: 0.08, vel: [0.04, 0.03, 0.04], opacita: 0.95, vagare: true }, torce: 0 },
  // La Tempesta (Terre della Tempesta): roccia scura a strati, lastre bagnate, stendardi gialli e neri strappati, alberi spogli, guglie sul mare.
  tempesta:    { nebbia: [[46, 38, 32], 5, 12],   cielo: [0xc0b0a0, 0x181410, 0.7],  sole: [0xd0c0b0, 0.35], texture: 'rocciastrati', luminosita: 1.0, cima: [80, 66, 56],
                 suolo: [30, 28, 28], baseMuro: [92, 78, 68], pavimento: 'lastre', pavimentoColore: [86, 80, 78], decor: 'tempesta',
                 particelle: { conta: 320, colore: 0xb0c0d8, dim: 0.05, vel: [0.9, -6.0, 0.3], opacita: 0.6 }, torce: 8, lampi: true },
  // Dorne: deserto. Muri di arenaria con una fascia rossa, viottoli di sabbia a onde, giare, palme e cactus.
  dorne:       { nebbia: [[150, 104, 62], 7, 18], cielo: [0xffe0b0, 0x402810, 1.0],  sole: [0xffd9a0, 0.85], texture: 'sabbia', luminosita: 1.0, cima: [238, 200, 135],
                 suolo: [206, 172, 118], baseMuro: [216, 172, 112], pavimento: 'duna', pavimentoColore: [216, 186, 132], fregio: [190, 70, 32], decor: 'deserto',
                 particelle: { conta: 200, colore: 0xf0c080, dim: 0.05, vel: [1.3, 0.05, 0.3], opacita: 0.7 }, torce: 0 },
  // Il Trono: l'interno di un castello. Una grande sala con muri alti, finestre accese, colonne e stendardi, pavimento a scacchi.
  trono:       { nebbia: [[12, 10, 14], 6, 16],   cielo: [0xa8a8c0, 0x14141c, 0.75], sole: [0xd0c8c0, 0.3],  texture: 'pietra', luminosita: 1.05, cima: [92, 94, 106],
                 suolo: [26, 24, 30], baseMuro: [118, 120, 134], pavimento: 'scacchi', pavimentoColore: [150, 150, 164], fregio: [150, 150, 160], decor: 'castello',
                 particelle: { conta: 120, colore: 0xffe0a0, dim: 0.04, vel: [0.02, -0.02, 0.01], opacita: 0.55, vagare: true }, torce: 5 }
};

// Generatore di numeri casuali con "seme": stessa texture a ogni avvio (e nelle prove).
function casualeConSeme(seme) {
  let a = seme >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Disegna in un canvas la texture di un muro. base = colore [r,g,b].
function creaTexturaMuro(tipo, base, luminosita, seme) {
  const L = 128, canvas = document.createElement('canvas');
  canvas.width = L; canvas.height = L;
  const c = canvas.getContext('2d');
  const rnd = casualeConSeme(seme);
  const col = (f, a = 1) => `rgba(${Math.min(255, Math.round(base[0] * f * luminosita))},${Math.min(255, Math.round(base[1] * f * luminosita))},${Math.min(255, Math.round(base[2] * f * luminosita))},${a})`;
  c.fillStyle = col(0.75); c.fillRect(0, 0, L, L);
  if (tipo === 'marmo') {                                    // marmo con venature chiare
    c.fillStyle = col(0.8); c.fillRect(0, 0, L, L);
    for (let i = 0; i < 40; i++) { c.fillStyle = col(0.6 + rnd() * 0.7, 0.25); c.beginPath(); c.ellipse(rnd() * L, rnd() * L, 8 + rnd() * 22, 4 + rnd() * 10, rnd() * 3, 0, Math.PI * 2); c.fill(); }
    for (let i = 0; i < 6; i++) {
      c.strokeStyle = col(1.9, 0.55); c.lineWidth = 0.8 + rnd(); c.beginPath();
      let x = rnd() * L, y = 0; c.moveTo(x, y);
      for (let k = 0; k < 8; k++) { x += (rnd() - 0.5) * 26; y += L / 8; c.lineTo(x, y); }
      c.stroke();
    }
    c.fillStyle = col(0.35, 0.9);                            // giunti tra le lastre
    c.fillRect(0, 0, L, 2.5); c.fillRect(0, L / 2 - 1, L, 2.5); c.fillRect(L / 2 - 1, 0, 2.5, L / 2); c.fillRect(0, 0, 2.5, L);
  } else if (tipo === 'scacchi') {                           // pavimento a scacchi (2 x 2 per piastrella)
    for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) {
      c.fillStyle = (x + y) % 2 === 0 ? col(1.0) : col(0.3); c.fillRect(x * L / 2, y * L / 2, L / 2, L / 2);
    }
    for (let i = 0; i < 150; i++) { c.fillStyle = col(0.3 + rnd() * 1.4, 0.12); c.fillRect(rnd() * L, rnd() * L, 1 + rnd() * 3, 1 + rnd() * 3); }
    c.fillStyle = col(0.2, 0.8); c.fillRect(L / 2 - 1, 0, 2, L); c.fillRect(0, L / 2 - 1, L, 2); c.fillRect(0, 0, L, 2); c.fillRect(0, 0, 2, L);
  } else if (tipo === 'duna') {                              // sabbia a onde, come lasciata dal vento
    c.fillStyle = col(0.95); c.fillRect(0, 0, L, L);
    for (let i = 0; i < 9; i++) {
      c.strokeStyle = col(0.7 + rnd() * 0.5, 0.5); c.lineWidth = 1.2; c.beginPath();
      const y0 = (i + 0.5) * L / 9; c.moveTo(0, y0);
      for (let x = 0; x <= L; x += 8) c.lineTo(x, y0 + Math.sin(x / 11 + i) * 3);
      c.stroke();
    }
  } else if (tipo === 'siepe') {                                    // siepe fitta: tante foglie di verdi diversi e qualche fiore
    c.fillStyle = col(0.35); c.fillRect(0, 0, L, L);
    for (let i = 0; i < 420; i++) {
      const f = 0.45 + rnd() * 0.95, giallo = rnd() < 0.25;
      c.fillStyle = `rgba(${Math.min(255, Math.round(base[0] * f * luminosita * (giallo ? 1.5 : 1)))},${Math.min(255, Math.round(base[1] * f * luminosita))},${Math.min(255, Math.round(base[2] * f * luminosita * 0.9))},0.85)`;
      c.beginPath(); c.ellipse(rnd() * L, rnd() * L, 2.5 + rnd() * 5, 1.5 + rnd() * 3, rnd() * 3.14, 0, Math.PI * 2); c.fill();
    }
    const fiori = [[210, 50, 70], [240, 230, 220], [235, 190, 60]];      // rose rosse, bianche e gialle
    for (let i = 0; i < 9; i++) {
      const [r, g2, b] = fiori[Math.floor(rnd() * fiori.length)], x = rnd() * L, y = rnd() * L;
      c.fillStyle = `rgba(${r},${g2},${b},1)`; c.beginPath(); c.arc(x, y, 3 + rnd() * 2, 0, Math.PI * 2); c.fill();
      c.fillStyle = `rgba(${r * 0.6},${g2 * 0.6},${b * 0.6},1)`; c.beginPath(); c.arc(x, y, 1.4, 0, Math.PI * 2); c.fill();
    }
  } else if (tipo === 'neve') {                              // pavimento innevato: neve soffice con qualche sasso e orma
    c.fillStyle = col(1.0); c.fillRect(0, 0, L, L);
    for (let i = 0; i < 34; i++) { c.fillStyle = col(0.82 + rnd() * 0.3, 0.45); c.beginPath(); c.ellipse(rnd() * L, rnd() * L, 8 + rnd() * 20, 5 + rnd() * 11, rnd() * 3, 0, Math.PI * 2); c.fill(); }
    for (let i = 0; i < 5; i++) { c.fillStyle = `rgba(70,76,92,${0.55 + rnd() * 0.3})`; c.beginPath(); c.ellipse(rnd() * L, rnd() * L, 2 + rnd() * 3, 1.5 + rnd() * 2, rnd() * 3, 0, Math.PI * 2); c.fill(); }
    for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(255,255,255,0.85)'; c.fillRect(rnd() * L, rnd() * L, 1.5, 1.5); }   // cristalli che brillano
  } else if (tipo === 'dolomia') {                           // roccia dolomitica: strati orizzontali chiari e rosati, striature verticali, licheni
    const strati = 7, h = L / strati;
    for (let i = 0; i < strati; i++) { c.fillStyle = col(0.82 + rnd() * 0.35, 0.9); c.fillRect(0, i * h, L, h); }
    for (let i = 0; i < 26; i++) {                           // striature verticali (acqua e ruggine)
      const x = rnd() * L; c.strokeStyle = rnd() < 0.5 ? col(0.55, 0.35) : col(1.35, 0.3); c.lineWidth = 1 + rnd() * 2.5;
      c.beginPath(); c.moveTo(x, rnd() * L * 0.3); c.lineTo(x + (rnd() - 0.5) * 8, L * (0.6 + rnd() * 0.4)); c.stroke();
    }
    c.strokeStyle = col(0.35, 0.8); c.lineWidth = 1.3;       // fessure
    for (let i = 0; i < 5; i++) { c.beginPath(); let x = rnd() * L, y = rnd() * L * 0.4; c.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (rnd() - 0.5) * 14; y += 12 + rnd() * 14; c.lineTo(x, y); } c.stroke(); }
    for (let i = 0; i < 18; i++) { c.fillStyle = `rgba(150,160,90,${0.25 + rnd() * 0.25})`; c.beginPath(); c.ellipse(rnd() * L, rnd() * L, 2 + rnd() * 4, 1.5 + rnd() * 2.5, 0, 0, Math.PI * 2); c.fill(); }   // licheni
  } else if (tipo === 'rocciastrati') {                      // roccia scura a strati orizzontali, spaccata e battuta dalla pioggia
    const strati = 5, h = L / strati;
    for (let i = 0; i < strati; i++) {
      c.fillStyle = col(0.65 + rnd() * 0.6); c.fillRect(0, i * h, L, h);
      c.fillStyle = col(0.25, 0.9); c.fillRect(0, i * h, L, 2);
      for (let k = 0; k < 3; k++) { c.fillStyle = col(0.4 + rnd() * 0.9, 0.35); c.fillRect(rnd() * L, i * h + rnd() * h, 10 + rnd() * 24, 1 + rnd() * 2); }
    }
    c.strokeStyle = col(0.2, 0.9); c.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) { c.beginPath(); let x = rnd() * L, y = rnd() * L * 0.5; c.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (rnd() - 0.5) * 16; y += 10 + rnd() * 18; c.lineTo(x, y); } c.stroke(); }
    c.strokeStyle = 'rgba(170,190,215,0.28)'; c.lineWidth = 1;   // acqua che cola
    for (let i = 0; i < 14; i++) { const x = rnd() * L, y = rnd() * L * 0.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (rnd() - 0.5) * 3, y + 20 + rnd() * 40); c.stroke(); }
  } else if (tipo === 'lastre') {                            // lastre di pietra bagnate, con pozzanghere che riflettono il cielo
    for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { c.fillStyle = col(0.75 + rnd() * 0.45); c.fillRect(x * L / 2 + 1.5, y * L / 2 + 1.5, L / 2 - 3, L / 2 - 3); }
    c.fillStyle = col(0.2, 0.9); c.fillRect(L / 2 - 1.5, 0, 3, L); c.fillRect(0, L / 2 - 1.5, L, 3);
    for (let i = 0; i < 5; i++) { c.fillStyle = `rgba(150,176,210,${0.3 + rnd() * 0.25})`; c.beginPath(); c.ellipse(rnd() * L, rnd() * L, 8 + rnd() * 16, 3 + rnd() * 7, rnd() * 3, 0, Math.PI * 2); c.fill(); }
    for (let i = 0; i < 30; i++) { c.fillStyle = 'rgba(200,215,235,0.55)'; c.fillRect(rnd() * L, rnd() * L, 1.5, 1.5); }   // gocce
  } else if (tipo === 'prato') {                             // prato alpino: erba corta, qualche fiore e sassolini
    c.fillStyle = col(0.9); c.fillRect(0, 0, L, L);
    for (let i = 0; i < 520; i++) {
      const f = 0.6 + rnd() * 0.8, x = rnd() * L, y = rnd() * L;
      c.strokeStyle = `rgba(${Math.round(base[0] * f * luminosita)},${Math.min(255, Math.round(base[1] * f * luminosita))},${Math.round(base[2] * f * luminosita)},0.8)`;
      c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (rnd() - 0.5) * 3, y - 3 - rnd() * 4); c.stroke();
    }
    const fiori = [[245, 245, 238], [150, 110, 200], [240, 210, 70], [230, 90, 110]];
    for (let i = 0; i < 12; i++) { const [r, g2, b] = fiori[Math.floor(rnd() * fiori.length)]; c.fillStyle = `rgb(${r},${g2},${b})`; c.beginPath(); c.arc(rnd() * L, rnd() * L, 1.6 + rnd() * 1.4, 0, Math.PI * 2); c.fill(); }
    for (let i = 0; i < 9; i++) { c.fillStyle = `rgba(150,146,138,${0.6 + rnd() * 0.3})`; c.beginPath(); c.ellipse(rnd() * L, rnd() * L, 2 + rnd() * 3, 1.5 + rnd() * 2, rnd() * 3, 0, Math.PI * 2); c.fill(); }
  } else if (tipo === 'assi') {                              // assi di legno di un molo, con venature, fessure e chiodi
    const n = 5, h = L / n;
    for (let i = 0; i < n; i++) {
      c.fillStyle = col(0.7 + rnd() * 0.5); c.fillRect(0, i * h + 1, L, h - 2);
      c.strokeStyle = col(0.45, 0.5); c.lineWidth = 0.8;
      for (let k = 0; k < 4; k++) { const y = i * h + 3 + rnd() * (h - 6); c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= L; x += 16) c.lineTo(x, y + (rnd() - 0.5) * 2); c.stroke(); }
      c.fillStyle = col(0.3, 0.9); c.fillRect(8, i * h + h / 2 - 1, 2, 2); c.fillRect(L - 10, i * h + h / 2 - 1, 2, 2);
    }
    c.fillStyle = col(0.2, 0.95); for (let i = 0; i <= n; i++) c.fillRect(0, i * h - 1, L, 2);
    for (let i = 0; i < 24; i++) { c.fillStyle = 'rgba(120,170,200,0.18)'; c.beginPath(); c.ellipse(rnd() * L, rnd() * L, 5 + rnd() * 10, 2 + rnd() * 3, 0, 0, Math.PI * 2); c.fill(); }   // pozzanghere e umidità
  } else if (tipo === 'ghiaia') {                            // viottolo di ghiaia
    c.fillStyle = col(0.9); c.fillRect(0, 0, L, L);
    for (let i = 0; i < 300; i++) { c.fillStyle = col(0.5 + rnd() * 1.0, 0.8); c.beginPath(); c.arc(rnd() * L, rnd() * L, 1 + rnd() * 2.2, 0, Math.PI * 2); c.fill(); }
  } else if (tipo === 'roccia' || tipo === 'rocciabagnata') {
    for (let i = 0; i < 90; i++) {                           // chiazze di roccia
      c.fillStyle = col(0.45 + rnd() * 0.8, 0.5);
      const x = rnd() * L, y = rnd() * L, r = 6 + rnd() * 18;
      c.beginPath(); c.ellipse(x, y, r, r * (0.5 + rnd() * 0.6), rnd() * 3, 0, Math.PI * 2); c.fill();
    }
    c.strokeStyle = col(0.3, 0.8); c.lineWidth = 1.5;        // crepe
    for (let i = 0; i < 7; i++) {
      c.beginPath(); let x = rnd() * L, y = rnd() * L; c.moveTo(x, y);
      for (let k = 0; k < 5; k++) { x += (rnd() - 0.5) * 30; y += 8 + rnd() * 16; c.lineTo(x, y); }
      c.stroke();
    }
    if (tipo === 'rocciabagnata') {                          // roccia bagnata dal mare: alghe in basso, colature e riflessi chiari
      const alga = c.createLinearGradient(0, L * 0.62, 0, L);
      alga.addColorStop(0, 'rgba(24,70,56,0)'); alga.addColorStop(1, 'rgba(24,70,56,0.75)');
      c.fillStyle = alga; c.fillRect(0, L * 0.62, L, L * 0.38);
      c.strokeStyle = 'rgba(150,190,230,0.35)'; c.lineWidth = 1.2;
      for (let i = 0; i < 12; i++) { const x = rnd() * L, y = rnd() * L * 0.6; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (rnd() - 0.5) * 4, y + 18 + rnd() * 30); c.stroke(); }
      for (let i = 0; i < 14; i++) { c.fillStyle = 'rgba(190,215,240,0.28)'; c.beginPath(); c.ellipse(rnd() * L, rnd() * L, 1.5 + rnd() * 3, 1 + rnd() * 1.5, 0, 0, Math.PI * 2); c.fill(); }
    }
  } else {                                                   // pietra o sabbia: file di blocchi
    const righe = tipo === 'sabbia' ? 4 : 6, h = L / righe;
    for (let r = 0; r < righe; r++) {
      const larg = tipo === 'sabbia' ? 64 : 42 + (r % 2) * 6, sfasa = (r % 2) * larg / 2;
      for (let x = -sfasa; x < L; x += larg) {
        c.fillStyle = col(0.7 + rnd() * 0.5);
        c.fillRect(x + 1.5, r * h + 1.5, larg - 3, h - 3);
        if (tipo !== 'sabbia') {                             // un po' di grana su ogni blocco
          for (let k = 0; k < 14; k++) { c.fillStyle = col(0.5 + rnd(), 0.35); c.fillRect(x + rnd() * larg, r * h + rnd() * h, 2, 2); }
        }
      }
    }
    c.fillStyle = col(0.3, 0.9);                             // malta tra i blocchi
    for (let r = 0; r <= righe; r++) c.fillRect(0, r * h - 1, L, 2.5);
    if (tipo === 'pietraneve') {                             // neve accumulata in cima al muro, con qualche colatura e mucchietti sui bordi dei blocchi
      c.fillStyle = 'rgba(238,244,255,0.96)';
      c.beginPath(); c.moveTo(0, 0);
      for (let x = 0; x <= L; x += 8) c.lineTo(x, 14 + rnd() * 12);
      c.lineTo(L, 0); c.closePath(); c.fill();
      for (let i = 0; i < 9; i++) { c.beginPath(); c.ellipse(rnd() * L, 18 + rnd() * 8, 2 + rnd() * 2.5, 6 + rnd() * 10, 0, 0, Math.PI * 2); c.fill(); }
      c.fillStyle = 'rgba(238,244,255,0.75)';
      for (let i = 0; i < 16; i++) { const rr = 1 + Math.floor(rnd() * 5); c.beginPath(); c.ellipse(rnd() * L, rr * h, 3 + rnd() * 5, 1.5 + rnd() * 1.5, 0, 0, Math.PI * 2); c.fill(); }
    }
  }
  for (let i = 0; i < 260; i++) { c.fillStyle = col(0.4 + rnd() * 1.2, 0.18); c.fillRect(rnd() * L, rnd() * L, 1 + rnd() * 2, 1 + rnd() * 2); }   // granelli
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.RepeatWrapping;
  return t;
}

// Aria animata: neve, pioggia, braci, lucciole, sabbia. Le particelle restano in una scatola attorno al giocatore.
class Particelle {
  constructor(scena, scheda) {
    this.scheda = scheda;
    this.L = 14;                // larghezza della scatola (celle)
    this.H = 6;                 // altezza
    const n = scheda.conta;
    const rnd = casualeConSeme(7);
    this.posizioni = new Float32Array(n * 3);
    this.fasi = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      this.posizioni[i * 3] = (rnd() - 0.5) * this.L;
      this.posizioni[i * 3 + 1] = rnd() * this.H;
      this.posizioni[i * 3 + 2] = (rnd() - 0.5) * this.L;
      this.fasi[i] = rnd() * 6.28;
    }
    const geometria = new THREE.BufferGeometry();
    this.attributo = new THREE.BufferAttribute(new Float32Array(n * 3), 3);
    geometria.setAttribute('position', this.attributo);
    const materiale = new THREE.PointsMaterial({ color: scheda.colore, size: scheda.dim, transparent: true, opacity: scheda.opacita, depthWrite: false, sizeAttenuation: true });
    this.punti = new THREE.Points(geometria, materiale);
    this.punti.frustumCulled = false;
    scena.add(this.punti);
  }

  // cx, cz = centro (il giocatore); t = tempo in secondi
  aggiorna(dt, cx, cz, t) {
    const s = this.scheda, p = this.posizioni, L = this.L, H = this.H, n = s.conta;
    const out = this.attributo.array;
    for (let i = 0; i < n; i++) {
      const k = i * 3;
      p[k] += s.vel[0] * dt; p[k + 1] += s.vel[1] * dt; p[k + 2] += s.vel[2] * dt;
      if (s.vagare) { p[k] += Math.sin(t * 0.9 + this.fasi[i]) * dt * 0.5; p[k + 2] += Math.cos(t * 0.7 + this.fasi[i]) * dt * 0.5; p[k + 1] += Math.sin(t * 1.3 + this.fasi[i]) * dt * 0.3; }
      if (p[k + 1] < 0) p[k + 1] += H; else if (p[k + 1] > H) p[k + 1] -= H;
      if (p[k] < -L / 2) p[k] += L; else if (p[k] > L / 2) p[k] -= L;
      if (p[k + 2] < -L / 2) p[k + 2] += L; else if (p[k + 2] > L / 2) p[k + 2] -= L;
      out[k] = cx + p[k]; out[k + 1] = p[k + 1]; out[k + 2] = cz + p[k + 2];
    }
    this.attributo.needsUpdate = true;
  }

  elimina(scena) {
    scena.remove(this.punti);
    this.punti.geometry.dispose(); this.punti.material.dispose();
  }
}

// Posizioni delle torce: alcuni muri che affacciano su un corridoio, scelti in modo ripetibile.
function posizioniTorce(lab, ogniQuanti, sale = 0) {
  const torce = [];
  if (!ogniQuanti) return torce;
  for (let r = 1; r < RIGHE - 1; r++) {
    for (let c = 1; c < COLONNE - 1; c++) {
      if (lab.righe[r][c] !== '#') continue;
      if (((c * 31 + r * 17 + c * r + sale) % ogniQuanti) !== 0) continue;
      for (const d of DIREZIONI) {
        if (lab.aperto(c + d.dc, r + d.dr)) { torce.push({ c, r, dc: d.dc, dr: d.dr }); break; }
      }
    }
  }
  return torce;
}
