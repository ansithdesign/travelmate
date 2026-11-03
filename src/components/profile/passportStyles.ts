/* Passport looks: ten styles, ten colourways, six stamp shapes, five emblems. All inline-styled markup so each look is one small function. */
export interface Pal { n: string; a: string; b: string; f: string; t: string; s: string }
export interface Info { name: string; email: string; ini: string; stats: string; stamps: { place: string; when: string }[] }
export interface PassportLook { sty: number; pal: number; stp: number; emb: number }

export const DEFAULT_LOOK: PassportLook = { sty: 0, pal: 8, stp: 5, emb: 0 }
export const STYLE_NAMES = ['Classic book', 'Boarding pass', 'Luggage tag', 'ID card', 'Field notebook', 'Ticket stub', 'Postcard', 'Polaroid', 'Enamel badge', 'Map fold']
export const STAMP_NAMES = ['Round dashed', 'Rectangle', 'Double oval', 'Postmark', 'Hexagon', 'Ticket']
export const EMBLEM_NAMES = ['Globe', 'Compass', 'Plane', 'Peak', 'Wave']
/** Landscape styles sit above the stamps instead of beside them */
export const WIDE = [1, 3, 5, 6, 9]
export const PAL:Pal[]=[
{n:'Midnight gold',a:'#2a2072',b:'#130c3a',f:'#e8c97a',t:'#fff',s:'#e8c97a'},
{n:'Oxblood brass',a:'#7a1f2e',b:'#3d0f19',f:'#e9c48a',t:'#fff',s:'#f1d9ad'},
{n:'Bottle green',a:'#1f4d3c',b:'#0e2a21',f:'#e6d3a3',t:'#fff',s:'#e6d3a3'},
{n:'Teal copper',a:'#0f4c5c',b:'#08262f',f:'#f0a878',t:'#fff',s:'#f6c19b'},
{n:'Ink coral',a:'#1b2a49',b:'#0d1526',f:'#ff9b85',t:'#fff',s:'#ffb4a3'},
{n:'Aubergine rose',a:'#4a1d4f',b:'#230c27',f:'#f2b8c6',t:'#fff',s:'#f7cdd7'},
{n:'Terracotta cream',a:'#b4532f',b:'#6b2a14',f:'#fbe9d0',t:'#fff',s:'#fbe9d0'},
{n:'Cobalt white',a:'#2455e0',b:'#10308a',f:'#ffffff',t:'#fff',s:'#ffffff'},
{n:'Sage forest',a:'#dbe3d3',b:'#aebda8',f:'#243a2b',t:'#1c2e22',s:'#f3f7ee'},
{n:'Saffron ink',a:'#f2b134',b:'#d98a14',f:'#2a1a05',t:'#2a1a05',s:'#fff3d0'}];

function emb(k:number,c:string,sz:number):string{var s='fill="none" stroke="'+c+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';var d:Record<number,string>={
0:'<circle cx="30" cy="30" r="22" '+s+'/><path d="M8 30h44M30 8c-9 8-9 36 0 44M30 8c9 8 9 36 0 44" '+s+'/>',
1:'<circle cx="30" cy="30" r="22" '+s+'/><path d="M30 10l6 20-6 20-6-20z" '+s+'/><path d="M10 30h40" '+s+'/>',
2:'<circle cx="30" cy="30" r="22" '+s+'/><path d="M16 34l28-12-6 18-8-4-4 6-2-8z" '+s+'/>',
3:'<circle cx="30" cy="30" r="22" '+s+'/><path d="M12 42l12-18 7 10 5-7 12 15z" '+s+'/>',
4:'<circle cx="30" cy="30" r="22" '+s+'/><path d="M10 30c5-6 10-6 15 0s10 6 15 0 7-4 10-2M10 40c5-6 10-6 15 0s10 6 15 0 7-4 10-2" '+s+'/>'}[k] ?? '';
return '<svg viewBox="0 0 60 60" width="'+sz+'" height="'+sz+'" aria-hidden="true">'+d+'</svg>'}

function stamp(i:number,P:Pal,shape:number,I:Info):string{var c=P.s,rot=[8,-7,5][i],pl=(I.stamps[i]?.place??'').toUpperCase().slice(0,12),dt=I.stamps[i]?.when??'';
var base='color:'+c+';transform:rotate('+rot+'deg);';var inner=pl+'<b>'+dt+'</b>';
var css:Record<number,string>={
0:'border:2.5px '+(i==0?'dashed':'solid')+' '+c+';border-radius:50%;',
1:'width:92px;height:52px;border:2.5px solid '+c+';border-radius:6px;',
2:'width:86px;height:58px;border-radius:50%;border:2px solid '+c+';box-shadow:inset 0 0 0 4px transparent,inset 0 0 0 5.5px '+c+';',
3:'width:78px;height:62px;border:2px solid '+c+';border-radius:4px;background:repeating-linear-gradient(180deg,transparent 0 7px,'+c+'33 7px 8px);',
4:'clip-path:polygon(25% 3%,75% 3%,100% 50%,75% 97%,25% 97%,0 50%);background:'+c+'26;width:76px;height:68px;',
5:'width:92px;height:50px;border:2px solid '+c+';border-radius:8px;-webkit-mask:radial-gradient(circle 6px at 0 50%,transparent 98%,#000) left/51% 100% no-repeat,radial-gradient(circle 6px at 100% 50%,transparent 98%,#000) right/51% 100% no-repeat;mask:radial-gradient(circle 6px at 0 50%,transparent 98%,#000) left/51% 100% no-repeat,radial-gradient(circle 6px at 100% 50%,transparent 98%,#000) right/51% 100% no-repeat;'}[shape] ?? '';
return '<div class="stp" style="'+base+css+'">'+inner+'</div>'}

function cover(sty:number,P:Pal,e:number,I:Info):string{var g='linear-gradient(160deg,'+P.a+','+P.b+')',f=P.f,t=P.t;
var h='';
if(sty==0)h='<div class="p" style="width:170px;min-height:224px;padding:20px 14px;border-radius:10px 22px 22px 10px;background:'+g+';color:'+f+';text-align:center;display:flex;flex-direction:column;align-items:center;box-shadow:0 18px 30px -12px rgba(8,6,40,.6),inset 6px 0 10px rgba(0,0,0,.25)"><p class="lbl">TRAVEL LOG</p><div style="margin-top:14px">'+emb(e,f,58)+'</div><p class="nm" style="font-size:18px;margin-top:14px;color:'+t+'">'+I.name+'</p><p class="em">'+I.email+'</p><p class="ft" style="margin-top:auto;padding-top:9px;width:100%;border-top:1px solid '+f+'55">'+I.stats+'</p></div>';
if(sty==1)h='<div class="p" style="width:100%;height:150px;border-radius:18px;background:'+g+';color:'+f+';display:flex;overflow:hidden;box-shadow:0 16px 28px -14px rgba(8,6,40,.6)"><div style="flex:1;padding:16px 18px;display:flex;flex-direction:column;justify-content:space-between"><p class="lbl">BOARDING PASS · TRIPMATE</p><div><p class="nm" style="font-size:20px;color:'+t+'">'+I.name+'</p><p class="em">BLR → SXR → GOI</p></div><p class="ft">'+I.stats+'</p></div><div style="width:84px;border-left:2px dashed '+f+'66;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px">'+emb(e,f,42)+'<div style="width:50px;height:26px;background:repeating-linear-gradient(90deg,'+f+' 0 2px,transparent 2px 4px)"></div></div></div>';
if(sty==2)h='<div class="p" style="width:132px;height:236px;border-radius:16px 16px 22px 22px;background:'+g+';color:'+f+';display:flex;flex-direction:column;align-items:center;padding:18px 12px;text-align:center;box-shadow:0 18px 28px -12px rgba(8,6,40,.6)"><span style="width:22px;height:22px;border-radius:50%;background:var(--hole,#3a74a8);box-shadow:inset 0 0 0 3px '+f+'"></span><div style="margin-top:14px">'+emb(e,f,50)+'</div><p class="nm" style="font-size:16px;margin-top:12px;color:'+t+'">'+I.name+'</p><p class="em">BAG TAG · 0007</p><p class="ft" style="margin-top:auto">3 TRIPS<br>7 DAYS</p></div>';
if(sty==3)h='<div class="p" style="width:100%;height:158px;border-radius:14px;background:'+g+';color:'+f+';padding:14px 16px;box-shadow:0 16px 28px -14px rgba(8,6,40,.6)"><p class="lbl">TRIPMATE · TRAVELLER ID</p><div style="display:flex;gap:14px;margin-top:12px"><div style="width:62px;height:74px;border-radius:8px;background:'+f+'22;box-shadow:inset 0 0 0 1.5px '+f+'88;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:22px">'+I.ini+'</div><div><p class="nm" style="font-size:18px;color:'+t+'">'+I.name+'</p><p class="em">'+I.email+'</p><p class="ft" style="margin-top:8px">'+I.stats+'</p></div></div><p style="font:600 9px ui-monospace,monospace;letter-spacing:.14em;margin:12px 0 0;opacity:.75">P&lt;IND&lt;KUMAR&lt;&lt;ANSITH&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p></div>';
if(sty==4)h='<div class="p" style="width:166px;min-height:226px;padding:20px 14px;border-radius:6px 16px 16px 6px;background:'+g+';color:'+f+';text-align:center;display:flex;flex-direction:column;align-items:center;box-shadow:0 18px 28px -12px rgba(8,6,40,.6)"><span style="position:absolute;right:16px;top:0;bottom:0;width:7px;background:'+f+'55"></span><span style="position:absolute;inset:7px;border:1.5px dashed '+f+'66;border-radius:3px 12px 12px 3px;pointer-events:none"></span><p class="lbl" style="margin-top:6px">FIELD NOTES</p><div style="margin-top:14px">'+emb(e,f,52)+'</div><p class="nm" style="font-size:17px;margin-top:12px;color:'+t+'">'+I.name+'</p><p class="ft" style="margin-top:auto">VOL. 3 · 7 DAYS</p></div>';
if(sty==5)h='<div class="p" style="width:100%;height:120px;background:'+g+';color:'+f+';display:flex;align-items:center;padding:0 20px;gap:16px;-webkit-mask:radial-gradient(circle 11px at 0 50%,transparent 98%,#000),radial-gradient(circle 11px at 100% 50%,transparent 98%,#000);-webkit-mask-composite:source-in;mask:radial-gradient(circle 11px at 0 50%,transparent 98%,#000),radial-gradient(circle 11px at 100% 50%,transparent 98%,#000);mask-composite:intersect;border-radius:14px"><div style="flex:1"><p class="lbl">ADMIT ONE</p><p class="nm" style="font-size:20px;margin-top:6px;color:'+t+'">'+I.name+'</p><p class="ft" style="margin-top:6px">'+I.stats+'</p></div><div style="border-left:2px dashed '+f+'66;padding-left:16px">'+emb(e,f,44)+'</div></div>';
if(sty==6)h='<div class="p" style="width:100%;height:170px;border-radius:6px;background:#fbf7ee;color:#2b2a35;padding:14px 16px;display:flex;gap:14px;box-shadow:0 14px 26px -14px rgba(8,6,40,.6)"><div style="flex:1;display:flex;flex-direction:column;justify-content:space-between"><p class="lbl" style="color:'+P.a+'">GREETINGS FROM</p><div><p class="nm" style="font-size:20px">'+I.name+'</p><div style="height:1px;background:#2b2a3533;margin:10px 0"></div><div style="height:1px;background:#2b2a3533"></div></div><p class="ft" style="color:'+P.a+'">'+I.stats+'</p></div><div style="width:58px;height:70px;border:2px dashed '+P.a+';padding:5px;display:flex;align-items:center;justify-content:center;background:'+P.a+'18">'+emb(e,P.a,40)+'</div></div>';
if(sty==7)h='<div class="p" style="width:168px;padding:10px 10px 38px;background:#fbfaf6;border-radius:6px;transform:rotate(-2deg);box-shadow:0 18px 28px -12px rgba(8,6,40,.6);color:#222"><div style="height:150px;border-radius:3px;background:'+g+';display:flex;align-items:center;justify-content:center">'+emb(e,f,70)+'</div><p class="nm" style="font-size:16px;margin-top:10px;text-align:center">'+I.name+'</p><p class="ft" style="text-align:center;margin-top:3px;color:#666">'+I.stats+'</p></div>';
if(sty==8)h='<div class="p" style="width:164px;display:flex;flex-direction:column;align-items:center;color:'+f+'"><div style="width:150px;height:150px;border-radius:50%;background:'+g+';box-shadow:0 0 0 5px '+f+',0 0 0 8px '+P.b+',0 18px 28px -10px rgba(8,6,40,.6);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px"><p class="lbl" style="font-size:8px">TRAVEL LOG</p>'+emb(e,f,54)+'<p class="nm" style="font-size:14px;color:'+t+'">'+I.name+'</p></div><p class="ft" style="margin-top:16px;color:#fff">'+I.stats+'</p></div>';
if(sty==9)h='<div class="p" style="width:100%;height:150px;border-radius:10px;overflow:hidden;display:flex;box-shadow:0 16px 28px -14px rgba(8,6,40,.6)"><div style="flex:1;background:'+g+';color:'+f+';padding:14px;display:flex;flex-direction:column;justify-content:space-between"><p class="lbl">TRIPMATE ATLAS</p><p class="nm" style="font-size:19px;color:'+t+'">'+I.name+'</p><p class="ft">'+I.stats+'</p></div><div style="flex:1.25;background:'+P.b+';position:relative"><svg viewBox="0 0 100 150" width="100%" height="100%" preserveAspectRatio="none"><path d="M10 130 C30 90 20 70 50 60 S80 40 90 14" fill="none" stroke="'+f+'" stroke-width="2.4" stroke-dasharray="3 5" stroke-linecap="round"/><circle cx="10" cy="130" r="5" fill="'+f+'"/><circle cx="90" cy="14" r="5" fill="none" stroke="'+f+'" stroke-width="2.4"/></svg></div></div>';
return h}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)

export function passportHtml(look: PassportLook, info: Info) {
  const I = { ...info, name: esc(info.name), email: esc(info.email), ini: esc(info.ini), stamps: info.stamps.map((s) => ({ place: esc(s.place), when: esc(s.when) })) }
  const P = PAL[look.pal]
  return { card: cover(look.sty, P, look.emb, I), stamps: [0, 1, 2].filter((i) => I.stamps[i]).map((i) => stamp(i, P, look.stp, I)) }
}
