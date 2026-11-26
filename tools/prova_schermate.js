// Disegna ogni schermata (relativi e assoluti, record nuovo e no) con funzioni p5 finte e segnala errori o numeri non validi.
const fs=require('fs'),vm=require('vm');
const dir=process.argv[2]; let nan=null, n=0;
const ctx={console,Math,millis:()=>1234,textWidth:()=>100,width:960,height:640,frameCount:0,deltaTime:16.7,SQUARE:'s',LEFT:'l',RIGHT:'r',CENTER:'c',key:'x',TOP:'t',frameRate:()=>60};
for(const f of ['background','fill','noStroke','noFill','textSize','textAlign','text','push','pop','translate','rect','circle','triangle','stroke','strokeWeight','textFont','textStyle','line','quad','rotate','beginShape','vertex','endShape','scale','createCanvas','strokeCap'])
  ctx[f]=(...a)=>{n++; for(const v of a) if(typeof v==='number'&&!isFinite(v)) nan=f+' '+a;};
vm.createContext(ctx);
const files=['costanti','labirinti','labirinto','livelli','suoni','entita','giocatore','fantasma','gioco','vista2d','sketch'];
vm.runInContext(files.map(f=>fs.readFileSync(dir+'/'+f+'.js','utf8')).join('\n')+'\nthis.R={setup,get g(){return gioco},get v(){return vista},set rel(x){CONTROLLI_RELATIVI=x}}',ctx);
ctx.R.setup(); const g=ctx.R.g, v=ctx.R.v;
for(const rel of [true,false]) { ctx.R.rel=rel;
  for(const lv of [1,4,8]) { g.nuovaPartita(lv);
    for(const st of ['menu','pronto','gioco','completato','vittoria','sconfitta']) for(const rec of [false,true]) { g.stato=st; g.nuovoRecord=rec; g.inPausa=false; g.dopoVita=false; g.vite=lv===1?3:1; g.punti=12345; v.disegnaBarraEMessaggi(g); v.schermate(g); if(st==='gioco'||st==='pronto'){ g.inPausa=true; v.schermate(g); g.inPausa=false; g.dopoVita=true; v.schermate(g); } } } }
console.log(nan===null?'OK':'NaN '+nan,'chiamate',n);
