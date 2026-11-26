const fs=require('fs'),vm=require('vm');
const dir=process.argv[2];
const calls={};
const stub=new Proxy({},{get:(t,k)=>k});
const names=['background','fill','noStroke','textSize','textAlign','text','push','pop','translate','rect','circle','createCanvas','triangle','stroke','strokeWeight','strokeCap','textFont','textStyle','line','quad','rotate','noFill','beginShape','vertex','endShape','scale'];
const ctx={console,Math,setInterval,clearInterval,setTimeout,millis:()=>1234,textWidth:()=>100,width:630,height:430,frameCount:0,deltaTime:16.7,frameRate:()=>60,SQUARE:'s',LEFT:'l',RIGHT:'r',CENTER:'c',key:'ArrowUp'};
for(const n of names) ctx[n]=(...a)=>{calls[n]=(calls[n]||0)+1;};
vm.createContext(ctx);
const files=['costanti','labirinti','labirinto','livelli','suoni','entita','giocatore','fantasma','gioco','vista2d','sketch'];
vm.runInContext(files.map(f=>fs.readFileSync(dir+'/'+f+'.js','utf8')).join('\n')+'\nthis.R={setup,draw,keyPressed,get g(){return gioco}}',ctx);
ctx.R.setup();
for(let i=0;i<300;i++){ctx.frameCount=i; if(i===5) ctx.key='Enter'; ctx.R.keyPressed(); ctx.R.draw();}
for(let n=1;n<=8;n++){ ctx.R.g.nuovaPartita(n); for(let i=0;i<200;i++){ctx.frameCount=i; ctx.R.g.stato=i<30?ctx.R.g.stato:'gioco'; ctx.R.draw();}
  if(n===8){ ctx.R.g.lab.cibo.clear(); for(let i=0;i<30;i++) ctx.R.draw(); ctx.R.g.stato='vittoria'; ctx.R.draw(); }
}
console.log('stato finale',ctx.R.g.stato,'punti',ctx.R.g.punti,calls);
