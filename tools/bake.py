# Trasforma i modelli OBJ+MTL (Quaternius, CC0) in un file JavaScript con i soli numeri che servono:
# posizioni dei vertici (3 per ogni angolo di triangolo) e colori per vertice (dai materiali).
# Così il gioco non deve leggere file esterni: funziona anche aprendo index.html con un doppio clic.
import json, sys, math
import glob, os
# Uso:  python3 tools/bake.py modelli.js  cartella_con_i_file_OBJ_e_MTL
# (i modelli sono quelli Quaternius CC0: Skeleton, Bat, Dragon, Slime, KnightCharacter, Helmet1, ShoulderPads, Sword)
CARTELLA=sys.argv[2] if len(sys.argv)>2 else '.'
class _D(str):
    def __add__(self,nome):          # trova il file anche se ha un prefisso (es. "ab12cd34-Skeleton.obj")
        trovati=glob.glob(os.path.join(CARTELLA,'*'+nome))
        if not trovati: raise SystemExit('File mancante: '+nome+' in '+CARTELLA)
        return sorted(trovati,key=len)[0]
D=_D('')
FILES={'scheletro':('Skeleton.obj','Skeleton.mtl'),
       'pipistrello':('Bat.obj','Bat.mtl'),
       'drago':('Dragon.obj','Dragon.mtl'),
       'slime':('Slime.obj','Slime.mtl')}
def srgb(x): return 12.92*x if x<=0.0031308 else 1.055*(x**(1/2.4))-0.055   # i valori Kd di Blender sono lineari
def leggi_mtl(p):
    m={};cur=None
    for r in open(p):
        t=r.split()
        if not t: continue
        if t[0]=='newmtl': cur=t[1]
        elif t[0]=='Kd': m[cur]=[srgb(float(x)) for x in t[1:4]]
    return m
def leggi_obj(p,mtl):
    v=[];tri=[];col=[];cur=[.5,.5,.5];centro_occhi=[]
    for r in open(p):
        t=r.split()
        if not t: continue
        if t[0]=='v': v.append([float(x) for x in t[1:4]])
        elif t[0]=='usemtl': cur=mtl.get(t[1],[.5,.5,.5]); nome=t[1]
        elif t[0]=='f':
            idx=[int(a.split('/')[0])-1 for a in t[1:]]
            for k in range(1,len(idx)-1):
                for i in (idx[0],idx[k],idx[k+1]):
                    tri.append(v[i]); col.append(cur)
            if nome=='Eyes': centro_occhi.append([sum(v[i][j] for i in idx)/len(idx) for j in range(3)])
    return tri,col,centro_occhi
# Il cavaliere è un pezzo unico con tre accessori, montati sui punti del corpo (misurati sui vertici):
#   elmo sulla testa (centro testa), spalline alle spalle, spada nella mano destra del modello (lato +x).
COMPOSTI={'cavaliere':[('KnightCharacter.obj','KnightCharacter.mtl',(0,0,0),{'Armor':[0.12,0.78,0.16]}),   # tunica verde: è il colore del giocatore
                       ('Helmet1.obj','Helmet1.mtl',(0.0,4.82,-0.05)),
                       ('ShoulderPads.obj','ShoulderPads.mtl',(0.0,3.72,0.0)),
                       ('Sword.obj','Sword.mtl',(0.91,1.53,-0.07))]}
out={};info={}
def elenco():
    for nome,(o,m) in FILES.items(): yield nome,[(o,m,(0,0,0))]
    for nome,parti in COMPOSTI.items(): yield nome,parti
for nome,parti in elenco():
    tri=[];col=[];occhi=[];conta_tri=[]
    for parte in parti:
        o,m,(dx,dy,dz)=parte[:3]; cambia=parte[3] if len(parte)>3 else {}
        mt=leggi_mtl(D+m); mt.update(cambia)
        t,c,e=leggi_obj(D+o,mt)
        tri+=[[p[0]+dx,p[1]+dy,p[2]+dz] for p in t]; col+=c; occhi+=e; conta_tri.append(len(t)//3)
    xs=[p[0] for p in tri];ys=[p[1] for p in tri];zs=[p[2] for p in tri]
    bb=dict(x=(min(xs),max(xs)),y=(min(ys),max(ys)),z=(min(zs),max(zs)))
    cx=(bb['x'][0]+bb['x'][1])/2; cz=(bb['z'][0]+bb['z'][1])/2
    # Sposta: centro su x,z e piedi (y minima) a zero. Altezza e raggio restano in unità originali.
    pos=[];
    for p in tri: pos+= [round(p[0]-cx,3),round(p[1]-bb['y'][0],3),round(p[2]-cz,3)]
    cols=[round(c,3) for c3 in col for c in c3]
    alt=bb['y'][1]-bb['y'][0]
    parti_mobili=None
    if nome=='cavaliere':
        # Triangoli suddivisi in parti: corpo, braccia (con la spada a destra), gambe. Ogni parte è espressa
        # rispetto al suo punto di rotazione (spalla o anca), così il gioco la può far oscillare.
        PERNI={'bracciaD':(0.8,3.3,-0.05),'bracciaS':(-0.8,3.3,-0.05),'gambaD':(0.33,1.0,0.0),'gambaS':(-0.33,1.0,0.0),'corpo':(0,0,0)}
        gruppi={k:([],[]) for k in PERNI}
        n_corpo=len(parti[0]) and 0
        # indici dei triangoli: il primo file è il cavaliere, poi elmo, spalline, spada
        n_cav=conta_tri[0]; n_sword=conta_tri[-1]
        for i in range(len(tri)//3):
            P=tri[3*i:3*i+3]; C=col[3*i:3*i+3]
            q=[sum(p[k] for p in P)/3 for k in range(3)]   # centro del triangolo (coordinate originali)
            if i<n_cav:
                mat_pelle = abs(C[0][0]-0.598720)<0.3 and C[0][0]>0.5 and C[0][1]>0.4   # pelle (colore chiaro)
                if q[1]<1.0: k='gambaD' if q[0]>0 else 'gambaS'
                elif q[1]<3.6 and (abs(q[0])>0.62 or (mat_pelle and q[1]<3.0)): k='bracciaD' if q[0]>0 else 'bracciaS'
                else: k='corpo'
            elif i>=len(tri)//3-n_sword: k='bracciaD'
            else: k='corpo'
            gruppi[k][0].extend(P); gruppi[k][1].extend(C)
        parti_mobili={}
        for k,(P,C) in gruppi.items():
            px,py,pz=PERNI[k]
            parti_mobili[k]={'perno':[round(px-cx,3),round(py-bb['y'][0],3),round(pz-cz,3)],
              'pos':[round(p[a]-[px,py,pz][a]+0.0,3) for p in P for a in range(3)],
              'col':[round(c,3) for c3 in C for c in c3]}
        print('parti cavaliere (triangoli):',{k:len(v['pos'])//9 for k,v in parti_mobili.items()})
    ocx=(sum(o[0] for o in occhi)/len(occhi)-cx) if occhi else None
    ocz=(sum(o[2] for o in occhi)/len(occhi)-cz) if occhi else None
    out[nome]={'altezza':round(alt,3),'larghezza':round(max(bb['x'][1]-bb['x'][0],bb['z'][1]-bb['z'][0]),3),'pos':pos,'col':cols}
    if parti_mobili: out[nome]['parti']=parti_mobili
    info[nome]=dict(triangoli=len(tri)//3,altezza=round(alt,2),bbox={k:(round(a,2),round(b,2)) for k,(a,b) in bb.items()},occhi_x_z=(None if ocx is None else (round(ocx,2),round(ocz,2))),nan=any(not math.isfinite(x) for x in pos))
print(json.dumps(info,indent=1))
js='// Modelli 3D dei mostri: "Animated Monsters" di Quaternius, licenza CC0 (pubblico dominio).\n// File generato da tools/bake.py a partire dai file OBJ+MTL: contiene solo posizioni e colori.\nconst MODELLI = '+json.dumps(out,separators=(',',':'))+';\n'
open(sys.argv[1],'w').write(js)
print('dimensione file:',len(js)//1024,'KB')
