(()=>{'use strict';
const d=document,root=d.documentElement,$=(s,c=d)=>c.querySelector(s),$$=(s,c=d)=>[...c.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches,FINE=matchMedia('(hover:hover) and (pointer:fine)').matches;
const WA='94774192370',MAIL='info@pttsrilanka.travel';
const wa=t=>'https://wa.me/'+WA+'?text='+encodeURIComponent(t);
const mailto=(s,b)=>'mailto:'+MAIL+'?subject='+encodeURIComponent(s)+'&body='+encodeURIComponent(b);
const ss={get:k=>{try{return sessionStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{sessionStorage.setItem(k,v)}catch(e){}},del:k=>{try{sessionStorage.removeItem(k)}catch(e){}}};
const ls={get:(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch(e){return f}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
/* ---------- preloader ---------- */
function ready(){root.classList.add('ready');d.body.classList.add('ready')}
const pre=$('#pre');
function endPre(){if(!pre||pre.dataset.end)return;pre.dataset.end=1;ss.set('pt_seen','1');pre.classList.add('done');ready();setTimeout(()=>{pre.classList.add('gone');setTimeout(()=>pre.remove(),600)},RM?50:950)}
if(pre&&!root.classList.contains('seen')){
  const n=$('#pre-n'),t0=performance.now(),DUR=RM?200:1700;
  (function tick(t){const p=Math.min(1,(t-t0)/DUR),e=1-Math.pow(1-p,3);n.textContent=Math.round(e*100);if(p<1&&!pre.dataset.end)requestAnimationFrame(tick);else setTimeout(endPre,120)})(t0);
  $('.pre-skip',pre).addEventListener('click',endPre);setTimeout(endPre,2200);
}else{pre&&pre.remove();requestAnimationFrame(ready)}
/* ---------- page transitions ---------- */
const ptc=$('#ptc');
function arrive(){if(root.classList.contains('arrive')){ss.del('pt_nav');requestAnimationFrame(()=>root.classList.add('arrived'));setTimeout(()=>root.classList.remove('arrive','arrived'),900)}}
arrive();
addEventListener('pageshow',e=>{if(e.persisted){ptc.classList.remove('in');root.classList.remove('arrive','arrived')}});
d.addEventListener('click',e=>{const a=e.target.closest('a');if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;
  const h=a.getAttribute('href');if(!h||a.target||a.hasAttribute('download')||h.startsWith('#')||/^(mailto|tel|https?|javascript):/i.test(h))return;
  const u=new URL(a.href,location.href);if(u.origin!==location.origin)return;
  if(u.pathname===location.pathname&&u.hash){return}
  if(RM)return;e.preventDefault();ss.set('pt_nav','1');ptc.classList.add('in');setTimeout(()=>{location.href=a.href},430)});
/* ---------- smooth scroll ---------- */
let lenis=null;
if(!RM&&FINE&&window.Lenis){try{lenis=new Lenis({lerp:.11,smoothWheel:true});const raf=t=>{lenis.raf(t);requestAnimationFrame(raf)};requestAnimationFrame(raf)}catch(e){lenis=null}}
/* ---------- header ---------- */
const hdr=$('#hdr');let lastY=0;
function onScroll(){const y=scrollY;hdr.classList.toggle('hide',y>lastY&&y>320&&!d.body.classList.contains('menu-open'));lastY=y}
addEventListener('scroll',onScroll,{passive:true});
const burger=$('.burger'),menu=$('#menu');
function setMenu(o){burger.setAttribute('aria-expanded',o);d.body.classList.toggle('menu-open',o);if(o){menu.hidden=false;requestAnimationFrame(()=>menu.classList.add('open'));lenis&&lenis.stop()}else{menu.classList.remove('open');setTimeout(()=>{if(!menu.classList.contains('open'))menu.hidden=true},400);lenis&&lenis.start()}
  $$('li a',menu).forEach((a,i)=>a.style.transitionDelay=o?(i*35)+'ms':'0ms')}
burger.addEventListener('click',()=>setMenu(burger.getAttribute('aria-expanded')!=='true'));
d.addEventListener('keydown',e=>{if(e.key==='Escape'){setMenu(false);closeDrawer()}});
/* ---------- split text ---------- */
$$('[data-split]').forEach(el=>{let i=0;const walk=n=>{[...n.childNodes].forEach(c=>{if(c.nodeType===3){const f=d.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(w=>{if(!w)return;if(/^\s+$/.test(w)){f.append(w);return}const s=d.createElement('span');s.className='w';const inn=d.createElement('span');inn.textContent=w;inn.style.setProperty('--i',i++);s.append(inn);f.append(s)});c.replaceWith(f)}else if(c.nodeType===1)walk(c)})};walk(el)});
$$('[data-words]').forEach(el=>{el.innerHTML=el.textContent.trim().split(/\s+/).map(w=>'<span class="wd">'+w+'</span>').join(' ')});
/* ---------- reveal ---------- */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px',threshold:.08});
$$('[data-reveal],[data-split],.steps,.ss,.route-card,.wordmark,.bw').forEach((el,i)=>{const sib=el.parentElement?[...el.parentElement.children].indexOf(el):0;if(el.hasAttribute('data-reveal'))el.style.setProperty('--d',Math.min(sib,6)*0.07+'s');io.observe(el)});
/* scroll-lit words */
const wordsEls=$$('[data-words]');
/* ---------- rAF loop: parallax, hscroll, words ---------- */
const par=$$('[data-parallax]'),hs=$('[data-hscroll]'),hsT=hs&&$('[data-hs-track]',hs),hsB=hs&&$('[data-hs-bar]',hs);
let mx=0,my=0,tx=0,ty=0;
addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5},{passive:true});
const lens=$('[data-lens]'),lens3=lens&&$('.lens-3d',lens),depthEls=$$('[data-depth]');
let lensVis=true;if(lens){new IntersectionObserver(([e])=>{lensVis=e.isIntersecting}).observe(lens)}
function frame(){
  const vh=innerHeight;
  if(!RM){tx+=(mx-tx)*.07;ty+=(my-ty)*.07;
    if(lens3&&lensVis){lens3.style.transform=`rotateY(${tx*10}deg) rotateX(${-ty*8}deg)`}
    depthEls.forEach(el=>{const r=el.getBoundingClientRect();if(r.bottom<0||r.top>vh)return;const k=+el.dataset.depth;el.style.translate=`${tx*k}px ${ty*k}px`});
    par.forEach(el=>{const r=el.parentElement.getBoundingClientRect();if(r.bottom<0||r.top>vh)return;el.style.transform=`translate3d(0,${(-r.top)*(+el.dataset.parallax)}px,0)`});}
  if(hs&&innerWidth>1000){const r=hs.getBoundingClientRect(),max=hsT.scrollWidth-innerWidth+80,p=Math.min(1,Math.max(0,-r.top/(r.height-vh)));hsT.style.transform=`translate3d(${-p*Math.max(0,max)}px,0,0)`;hsB.style.width=(p*100)+'%'}
  wordsEls.forEach(el=>{const r=el.getBoundingClientRect();if(r.bottom<0||r.top>vh)return;const ws=el.children,p=Math.min(1,Math.max(0,(vh*.85-r.top)/(r.height+vh*.25)));const n=Math.round(p*ws.length);for(let i=0;i<ws.length;i++)ws[i].classList.toggle('lit',i<n)});
  requestAnimationFrame(frame)}
requestAnimationFrame(frame);
/* ---------- hero lens ---------- */
if(lens){const ph=$$('.isl-ph',lens),cap=$('[data-lens-cap]',lens),caps=JSON.parse($('[data-lens-caps]').textContent),bar=$('.lc-bar i',lens);let i=0;
  const run=()=>{bar.classList.remove('run');void bar.offsetWidth;bar.classList.add('run')};run();
  if(!RM)setInterval(()=>{if(!lensVis||d.hidden)return;ph[i].classList.remove('on');i=(i+1)%ph.length;ph[i].classList.add('on');cap.textContent=caps[i];run()},4000)}
/* ---------- cursor + magnet + tilt ---------- */
if(FINE&&!RM){const cur=$('.cursor'),dot=$('.cur-dot'),ring=$('.cur-ring');let cx=-100,cy=-100,rx=-100,ry=-100;
  addEventListener('pointermove',e=>{cx=e.clientX;cy=e.clientY;dot.style.transform=`translate3d(${cx}px,${cy}px,0)`},{passive:true});
  (function lp(){rx+=(cx-rx)*.18;ry+=(cy-ry)*.18;ring.style.transform=`translate3d(${rx}px,${ry}px,0)`;requestAnimationFrame(lp)})();
  d.addEventListener('pointerover',e=>cur.classList.toggle('big',!!e.target.closest('a,button,[data-tilt-card],label')));
  $$('.magnet').forEach(b=>{b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.22}px,${(e.clientY-r.top-r.height/2)*.3}px)`});b.addEventListener('pointerleave',()=>b.style.transform='')});
  $$('[data-tilt-card]').forEach(c=>{c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;c.style.setProperty('--mx',x*100+'%');c.style.setProperty('--my',y*100+'%');c.style.transform=`perspective(900px) rotateX(${(.5-y)*5}deg) rotateY(${(x-.5)*6}deg)`});c.addEventListener('pointerleave',()=>c.style.transform='')})}
/* ---------- map hotspots ---------- */
$$('[data-map-data]').forEach(js=>{const sec=js.closest('section'),data=JSON.parse(js.textContent),card=$('[data-map-card]',sec),hots=$$('.hot',sec);
  const show=k=>{const v=data[k];if(!v)return;hots.forEach(h=>h.classList.toggle('on',h.dataset.hot===k));
    card.innerHTML=(v.img?`<img src="img/p/${v.img}-800.webp" alt="" width="800" height="533">`:'')+`<div class="mc-b"><small>${v.r}</small><h3>${v.n}</h3><p>${v.t}</p>${v.w.length?`<p class="mc-w">On: ${v.w.join(' · ')}</p>`:''}<a href="destinations.html#${k}">Explore ${v.n.split(' &')[0]} →</a></div>`};
  hots.forEach(h=>{h.addEventListener('click',()=>show(h.dataset.hot));h.addEventListener('mouseenter',()=>FINE&&show(h.dataset.hot))});show(hots[0].dataset.hot);
  let auto=0;const tm=setInterval(()=>{if(sec.matches(':hover')||d.hidden)return;auto=(auto+1)%hots.length;show(hots[auto].dataset.hot)},4500);sec.addEventListener('click',()=>clearInterval(tm),{once:true})});
/* ---------- currents canvas ---------- */
$$('[data-currents]').forEach(cv=>{if(RM)return;const ctx=cv.getContext('2d');if(!ctx)return;let w,h,vis=false,t=0;const DPR=Math.min(devicePixelRatio||1,1.5);
  const size=()=>{w=cv.clientWidth;h=cv.clientHeight;cv.width=w*DPR;cv.height=h*DPR;ctx.setTransform(DPR,0,0,DPR,0,0)};size();addEventListener('resize',size);
  new IntersectionObserver(([e])=>{vis=e.isIntersecting;if(vis)requestAnimationFrame(draw)}).observe(cv);
  function draw(){if(!vis||d.hidden)return;t+=.004;ctx.clearRect(0,0,w,h);ctx.lineWidth=1;
    for(let j=0;j<14;j++){ctx.beginPath();const y0=h*(j/14);for(let x=0;x<=w;x+=16){const y=y0+Math.sin(x*.004+t*2+j)*26+Math.sin(x*.011-t*3+j*.7)*10;x?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.strokeStyle=`rgba(${j%2?'1,174,239':'95,140,255'},${.08+.05*Math.sin(t+j)})`;ctx.stroke()}
    requestAnimationFrame(draw)}
  d.addEventListener('visibilitychange',()=>{if(!d.hidden&&vis)requestAnimationFrame(draw)})});
/* ---------- wordmark lift ---------- */
const wm=$('.wordmark');if(wm&&FINE&&!RM){const sp=$$('span',wm);wm.addEventListener('pointermove',e=>sp.forEach(s=>{const r=s.getBoundingClientRect(),dx=Math.abs(e.clientX-(r.left+r.width/2));s.style.setProperty('--lift',(-Math.max(0,1-dx/220)*28)+'px');s.style.transitionDelay='0s'}));wm.addEventListener('pointerleave',()=>sp.forEach(s=>s.style.setProperty('--lift','0px')))}
$$('[data-year]').forEach(y=>y.textContent=new Date().getFullYear());
/* ---------- wishlist ---------- */
const drawer=$('#wishlist');let wish=ls.get('pt_wish',[]);
function renderWish(){$$('[data-wish-count]').forEach(n=>{n.textContent=wish.length;n.toggleAttribute('data-zero',!wish.length)});
  $$('[data-wish]').forEach(b=>b.setAttribute('aria-pressed',wish.some(w=>w.id===b.dataset.wish)));
  const ul=$('[data-wish-list]');ul.innerHTML=wish.length?wish.map(w=>`<li><img src="img/p/${w.img}-800.webp" alt="" width="64" height="48"><a href="${w.url}">${w.name}</a><button type="button" data-unwish="${w.id}" aria-label="Remove ${w.name}">✕</button></li>`).join(''):'<li class="empty">Nothing saved yet — tap a ♡ to start.</li>';
  $('[data-wish-wa]').href=wa('Hello Panoramic Tour & Travels, I would like to plan a trip including:\n'+(wish.length?wish.map(w=>'• '+w.name).join('\n'):'(my wishlist is empty)'));
  const pw=$('[data-pl-wish]');if(pw){pw.hidden=!wish.length;$('[data-pl-wish-list]').innerHTML=wish.map(w=>'<li>'+w.name+'</li>').join('')}}
d.addEventListener('click',e=>{const b=e.target.closest('[data-wish]');if(b){e.preventDefault();const id=b.dataset.wish;if(wish.some(w=>w.id===id))wish=wish.filter(w=>w.id!==id);else wish.push({id,name:b.dataset.wishName,url:b.dataset.wishUrl,img:b.dataset.wishImg});ls.set('pt_wish',wish);b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop');renderWish();return}
  const u=e.target.closest('[data-unwish]');if(u){wish=wish.filter(w=>w.id!==u.dataset.unwish);ls.set('pt_wish',wish);renderWish()}});
function openDrawer(){drawer.hidden=false;requestAnimationFrame(()=>drawer.classList.add('open'));lenis&&lenis.stop();$('.drawer-x').focus()}
function closeDrawer(){if(drawer.hidden)return;drawer.classList.remove('open');setTimeout(()=>drawer.hidden=true,450);lenis&&lenis.start()}
$('.wish-open').addEventListener('click',openDrawer);$('.drawer-x').addEventListener('click',closeDrawer);drawer.addEventListener('click',e=>{if(e.target===drawer)closeDrawer()});
renderWish();
/* ---------- filters ---------- */
$$('[data-filter]').forEach(f=>{const grid=$(f.dataset.filter),items=$$(':scope>[data-tags]',grid),chips=$$('.chip-f',f),dsel=$('[data-f-days]',f),ssel=$('[data-f-sort]',f),cnt=$('[data-f-count]');let cur='all';
  const orig=items.slice();
  const apply=()=>{let n=0;items.forEach(it=>{const tg=it.dataset.tags.split(' ');let ok=cur==='all'||tg.includes(cur);if(dsel&&dsel.value!=='all'){const dd=+it.dataset.days;ok=ok&&(dsel.value==='short'?dd<=10:dd>10)}it.classList.toggle('is-hidden',!ok);if(ok)n++});
    if(ssel){const s=ssel.value;const arr=s==='rec'?orig:orig.slice().sort((a,b)=>(+a.dataset[s==='price'?'price':'days'])-(+b.dataset[s==='price'?'price':'days']));arr.forEach(a=>grid.append(a))}
    if(cnt)cnt.textContent=n+(n===1?' journey':' journeys')+' found'};
  chips.forEach(c=>c.addEventListener('click',()=>{cur=c.dataset.f;chips.forEach(x=>x.classList.toggle('on',x===c));apply()}));dsel&&dsel.addEventListener('change',apply);ssel&&ssel.addEventListener('change',apply);apply()});
/* ---------- itinerary expand ---------- */
$$('[data-expand-all]').forEach(b=>b.addEventListener('click',()=>{const ds=$$('.day'),open=!ds.every(x=>x.open);ds.forEach(x=>x.open=open);b.textContent=open?'Collapse all days':'Expand all days'}));
/* ---------- planner ---------- */
const pl=$('[data-planner]');
if(pl){const steps=$$('.pl-step',pl),dots=$$('[data-pl-dot]',pl),prev=$('[data-pl-prev]',pl),next=$('[data-pl-next]',pl),bar=$('[data-pl-bar]',pl),lbl=$('[data-pl-n]',pl);let s=0;
  const saved=ls.get('pt_plan',null);
  if(saved){Object.entries(saved).forEach(([k,v])=>{const els=$$(`[name="${k}"]`,pl);els.forEach(el=>{if(el.type==='checkbox')el.checked=[].concat(v).includes(el.value);else if(el.type==='radio')el.checked=el.value===v;else el.value=v})})}
  const q=new URLSearchParams(location.search).get('tour');if(q){const r=$(`input[data-slug="${q}"]`,pl);if(r)r.checked=true}
  const val=()=>{const o={};new FormData(pl).forEach((v,k)=>{if(k==='interests'){(o[k]=o[k]||[]).push(v)}else o[k]=v});return o};
  const nOut=$('[data-out="nights"]',pl),rng=$('[name="nights"]',pl);const syncN=()=>nOut.textContent=rng.value;rng.addEventListener('input',syncN);syncN();
  $$('[data-inc],[data-dec]',pl).forEach(b=>b.addEventListener('click',()=>{const inp=$(`[name="${b.dataset.inc||b.dataset.dec}"]`,pl);inp.value=Math.max(+inp.min,Math.min(+inp.max,(+inp.value||0)+(b.dataset.inc?1:-1)));pl.dispatchEvent(new Event('input'))}));
  const msg=()=>{const v=val();return['Hello Panoramic Tour & Travels, I would like to plan a trip to Sri Lanka.','',
    'Name: '+(v.name||'-'),'Email: '+(v.email||'-'),'Country: '+(v.country||'-'),'Phone/WhatsApp: '+(v.phone||'-'),
    'Arrival: '+(v.arrival||'not fixed')+' ('+v.flex+')','Nights: '+v.nights,'Travellers: '+v.adults+' adults, '+v.children+' children'+(v.occasion?' · '+v.occasion:''),
    'Interests: '+((v.interests||[]).join(', ')||'-'),'Hotels: '+v.hotel+' · Pace: '+v.pace+(v.budget?' · Budget pp: '+v.budget:''),
    'Starting point: '+(v.base||'Fully custom'),wish.length?'Wishlist: '+wish.map(w=>w.name).join(', '):'','Notes: '+(v.notes||'-')].filter(Boolean).join('\n')};
  const upd=()=>{const v=val();ls.set('pt_plan',v);if(s===5){const m=msg();$('[data-summary]',pl).textContent=m;$('[data-send-wa]',pl).href=wa(m);$('[data-send-mail]',pl).href=mailto('Trip plan: '+(v.name||'Sri Lanka journey'),m)}};
  const go=(n,sc)=>{s=Math.max(0,Math.min(5,n||0));steps.forEach((x,i)=>x.classList.toggle('on',i===s));dots.forEach((x,i)=>{x.classList.toggle('on',i===s);x.classList.toggle('done',i<s)});bar.style.width=((s+1)/6*100)+'%';lbl.textContent='Step '+(s+1)+' of 6';prev.style.visibility=s?'visible':'hidden';next.style.display=s===5?'none':'';upd();if(sc&&pl.getBoundingClientRect().top<0)pl.scrollIntoView({behavior:RM?'auto':'smooth'})};
  prev.addEventListener('click',()=>go(s-1,1));next.addEventListener('click',()=>go(s+1,1));pl.addEventListener('input',upd);pl.addEventListener('change',upd);
  dots.forEach((x,i)=>{x.style.cursor='pointer';x.addEventListener('click',()=>go(i,1))});
  $('[data-send-wa]',pl).addEventListener('click',e=>{const nm=$('[name=name]',pl);if(!nm.value.trim()){e.preventDefault();nm.focus();nm.setAttribute('aria-invalid','true')}});
  $('[data-send-mail]',pl).addEventListener('click',e=>{const nm=$('[name=name]',pl);if(!nm.value.trim()){e.preventDefault();nm.focus();nm.setAttribute('aria-invalid','true')}});
  pl.addEventListener('submit',e=>e.preventDefault());go(0);}
/* ---------- manage ---------- */
const mg=$('[data-manage]');
if(mg){const tr=$('[data-tracker]');mg.addEventListener('submit',e=>{e.preventDefault();const ref=mg.ref.value.trim()||'DEMO',last=mg.last.value.trim();
  $('[data-tr-ref]',tr).textContent='Showing a demo for reference “'+ref+'”. This is an example only — not your real booking status.';
  $$('[data-tr]',tr).forEach((li,i)=>{li.classList.remove('done','cur');setTimeout(()=>{li.classList.toggle('done',i<2);li.classList.toggle('cur',i===2)},i*180)});
  const m='Hello Panoramic Tour & Travels, could you confirm the status of my booking?\nReference: '+ref+(last?'\nLast name: '+last:'');
  $('[data-tr-acts]',tr).hidden=false;$('[data-tr-wa]',tr).href=wa(m);$('[data-tr-mail]',tr).href=mailto('Booking status: '+ref,m)})}
const calc=$('[data-calc]');
if(calc){const inp=calc.arr,out=$('[data-calc-out]',calc);const t=new Date();t.setHours(0,0,0,0);inp.min=t.toISOString().slice(0,10);
  const fmt=x=>x.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'long',year:'numeric'});
  inp.addEventListener('input',()=>{if(!inp.value)return;const a=new Date(inp.value+'T00:00:00'),bal=new Date(a);bal.setDate(bal.getDate()-30);const days=Math.round((a-t)/864e5);
    const band=days>30?'More than 30 days out: a 15% cancellation fee would apply if you cancelled today.':days>=0?'Within 30 days of arrival: the booking would be 100% non-refundable if cancelled today.':'This date is in the past.';
    out.innerHTML=`<dl><dt>Arrival</dt><dd>${fmt(a)}</dd><dt>Balance due</dt><dd>${fmt(bal)}${bal<t&&days>=0?' (already due)':''}</dd><dt>Days to go</dt><dd>${days}</dd><dt>Cancelling today</dt><dd>${band}</dd></dl><p class="muted small" style="margin:.8rem 0 0">Guide only — your confirmation sets the exact terms.</p>`})}
const rq=$('[data-req-wa]');
if(rq){const up=()=>{const ref=$('[data-req-ref]').value.trim()||'-',ty=$('[data-req-type]').value,ms=$('[data-req-msg]').value.trim()||'-';const m='Hello Panoramic Tour & Travels,\nRequest: '+ty+'\nBooking reference: '+ref+'\nDetails: '+ms;rq.href=wa(m);$('[data-req-mail]').href=mailto(ty+' — '+ref,m)};$$('[data-req-ref],[data-req-type],[data-req-msg]').forEach(x=>x.addEventListener('input',up));up()}
/* ---------- contact ---------- */
const cf=$('[data-contact]');
if(cf){const m=()=>'Name: '+cf.name.value+'\nEmail: '+cf.email.value+'\n\n'+cf.msg.value;
  cf.addEventListener('submit',e=>{e.preventDefault();if(!cf.reportValidity())return;location.href=mailto(cf.subject.value,m())});
  $('[data-contact-wa]').addEventListener('click',()=>{if(!cf.reportValidity())return;window.open(wa('Hello Panoramic Tour & Travels,\n'+cf.subject.value+'\n'+m()),'_blank','noopener')})}
})();
