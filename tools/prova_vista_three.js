// Prova della vista Three.js con una libreria "finta" (qui non posso scaricare Three.js): controlla che il codice
// giri su tutti i livelli senza errori, che i numeri passati siano validi e che i modelli giusti siano assegnati.
const fs=require('fs'),vm=require('vm');
const dir=process.argv[2];
const calls={}; let nan=null;
function controlla(nome,args){ for(const a of args) if(typeof a==='number'&&!isFinite(a)) nan=nome+' '+a; }
function finto(nome){
  const store={};
  return new Proxy(function(){},{
    get:(t,k)=>{ if(k in store) return store[k]; if(typeof k==='symbol'||k==='then') return undefined; return store[k]=finto(nome+'.'+k); },
    set:(t,k,v)=>{ if(typeof v==='number'&&!isFinite(v)) nan=nome+'.'+String(k)+'='+v; store[k]=v; return true; },
    apply:(t,th,args)=>{ controlla(nome,args); calls[nome]=(calls[nome]||0)+1; return finto(nome+'()'); },
    construct:(t,args)=>{ controlla('new '+nome,args); calls['new '+nome]=(calls['new '+nome]||0)+1; return finto(nome+'#'); }
  });
}
const pgStub=new Proxy({width:960,height:600},{get:(t,k)=>(k in t)?t[k]:(()=>{})});
const names=['rotate','background','fill','noStroke','textSize','textAlign','text','push','pop','translate','rect','circle','createCanvas','triangle','stroke','strokeWeight','strokeCap','scale','image','textFont','textStyle','line','quad','noFill','beginShape','vertex','endShape'];
const ctx={textWidth:()=>100,millis:()=>1234,document:{createElement:()=>finto('canvas')},THREE:finto('THREE'),drawingContext:{drawImage:()=>{calls.drawImage=(calls.drawImage||0)+1;},save(){},restore(){},beginPath(){},arc(){},clip(){}},console,Math,Float32Array,setTimeout,millis:()=>1234,width:960,height:640,frameCount:0,deltaTime:16.7,frameRate:()=>60,SQUARE:'s',LEFT:'l',RIGHT:'r',CENTER:'c',key:'ArrowUp',WEBGL:'webgl',createGraphics:()=>pgStub};
for(const n of names) ctx[n]=()=>{};
vm.createContext(ctx);
const files=['costanti','labirinti','labirinto','livelli','suoni','entita','giocatore','fantasma','gioco','vista2d','vista3d','modelli','ambiente','vista_three','sketch'];
vm.runInContext(files.map(f=>fs.readFileSync(dir+'/'+f+'.js','utf8')).join('\n')+'\nthis.R={setup,draw,keyPressed,g:()=>gioco,v3:()=>vista3d,VistaThree,modo:()=>modo3D}',ctx);
let errori=0; ctx.console={...console,error:(...a)=>{errori++;console.log('ERRORE:',...a);},warn:(...a)=>{errori++;console.log('AVVISO:',...a);}};
ctx.R.setup();
if(!(ctx.R.v3() instanceof ctx.R.VistaThree)) throw new Error('non usa VistaThree');
const usati={};
for(let n=1;n<=8;n++){
  ctx.R.g().nuovaPartita(n);
  for(let i=0;i<240;i++){ ctx.frameCount=i; ctx.key=['ArrowUp','ArrowLeft','ArrowRight','ArrowDown'][i%4]; if(i>20) ctx.R.g().stato='gioco'; if(i%7===0) ctx.R.keyPressed(); ctx.R.draw(); }
  const v=ctx.R.v3(); if(!(v instanceof ctx.R.VistaThree)) throw new Error('ripiego inatteso al livello '+n);
  const comp=ctx.R.g().fantasmi.map(f=>f.comportamento);
  const modelli=v.oggettiFantasmi.map(o=>Object.keys(vm.runInContext('CONFIGURAZIONE_MODELLI',ctx)).find(k=>vm.runInContext('CONFIGURAZIONE_MODELLI',ctx)[k]===o.conf));
  usati[n]=modelli.join(',');
}
for(const n in usati){ const m=usati[n].split(',').sort().join(','); if(m!=='drago,pipistrello,scheletro') throw new Error('in ogni livello i fantasmi devono essere drago, pipistrello e scheletro: livello '+n+' -> '+usati[n]); }
console.log('OK errori:',errori,'NaN:',nan,'render:',calls['THREE#.render()']||calls['THREE#.render'],'drawImage:',calls.drawImage);
console.log('modelli per livello:',JSON.stringify(usati));
