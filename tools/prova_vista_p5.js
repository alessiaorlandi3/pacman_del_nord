// Prova della vista 3D con un p5 "finto": controlla che non ci siano errori e che i numeri della camera abbiano senso.
const fs=require('fs'),vm=require('vm');
const dir=process.argv[2];
const calls={}, pgCalls={}; let ultimaCamera=null, nanTrovato=false;
function conta(o,n,a){o[n]=(o[n]||0)+1; for(const x of a) if(typeof x==='number'&&!isFinite(x)) nanTrovato=n;}
const pg=new Proxy({width:960,height:600},{get:(t,k)=>{ if(k in t) return t[k]; return (...a)=>{conta(pgCalls,k,a); if(k==='camera') ultimaCamera=a;}; }});
const names=['rotate','background','fill','noStroke','textSize','textAlign','text','push','pop','translate','rect','circle','createCanvas','triangle','stroke','strokeWeight','scale','image'];
const ctx={drawingContext:new Proxy({},{get:()=>()=>{}}),console,Math,setTimeout,millis:()=>1234,width:960,height:640,frameCount:0,deltaTime:16.7,frameRate:()=>60,LEFT:'l',RIGHT:'r',CENTER:'c',key:'ArrowUp',WEBGL:'webgl',createGraphics:()=>pg};
for(const n of names) ctx[n]=(...a)=>conta(calls,n,a);
vm.createContext(ctx);
const files=['costanti','labirinti','labirinto','livelli','suoni','entita','giocatore','fantasma','gioco','vista2d','vista3d','sketch'];
vm.runInContext(files.map(f=>fs.readFileSync(dir+'/'+f+'.js','utf8')).join('\n')+'\nthis.R={setup,draw,keyPressed,g:()=>gioco,m:()=>modo3D,v3:()=>vista3d}',ctx);
ctx.R.setup();
let err=0;
const origErr=ctx.console.error; ctx.console={...console,error:(...a)=>{err++; console.log('ERRORE:',...a);}};
if(!ctx.R.m()) throw new Error('modo 3D non attivo all\'avvio');
if(!vm.runInContext('CONTROLLI_RELATIVI',ctx)) throw new Error('comandi non relativi in 3D');
for(let n=1;n<=8;n++){ ctx.R.g().nuovaPartita(n); for(let i=0;i<240;i++){ctx.frameCount=i; ctx.key=['ArrowUp','ArrowLeft','ArrowRight','ArrowDown'][i%4]; if(i>20){ctx.R.g().stato='gioco';} if(i%7===0) ctx.R.keyPressed(); ctx.R.draw();}
  // la camera sta dietro al personaggio: la distanza orizzontale deve valere DISTANZA_CAMERA celle
  const g=ctx.R.g(), c=ultimaCamera, K=30;
  const px=(g.giocatore.x+0.5)*K, pz=(g.giocatore.y+0.5)*K;
  const d=Math.hypot(c[0]-px,c[2]-pz)/K;
  if(Math.abs(d-2.8)>1e-6) throw new Error('distanza camera '+d);
  if(c[1]>=0) throw new Error('camera sotto il pavimento');
}
// V passa alla vista 2D e torna
ctx.key='v'; ctx.R.keyPressed(); if(ctx.R.m()||vm.runInContext('CONTROLLI_RELATIVI',ctx)) throw new Error('V non passa a 2D');
ctx.R.draw(); ctx.key='V'; ctx.R.keyPressed(); if(!ctx.R.m()) throw new Error('V non torna a 3D');
// se la 3D si rompe si passa alla 2D senza fermarsi
pg.sphere=undefined; ctx.R.v3().pg={...pg, get box(){throw new Error('prova errore');}, width:960,height:600,push(){},pop(){},background(){},noStroke(){},perspective(){},camera(){},ambientLight(){},directionalLight(){},fill(){},translate(){},noLights(){}};
ctx.R.draw(); if(ctx.R.m()) throw new Error('nessun ripiego sulla 2D');
console.log('OK errori:',err-1,'NaN:',nanTrovato,'chiamate pg:',Object.entries(pgCalls).map(([k,v])=>k+':'+v).join(' '));
