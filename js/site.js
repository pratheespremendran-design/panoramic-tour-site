(function(){
"use strict";
var d=document, root=d.documentElement;
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
var FINE=matchMedia('(hover: hover) and (pointer: fine)').matches;
var HAS=!!(window.gsap&&window.ScrollTrigger);
var $=function(s,c){return (c||d).querySelector(s)}, $$=function(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))};

/* ---------- split text into masked words ---------- */
function split(el){
  function walk(node,grad){
    var kids=Array.prototype.slice.call(node.childNodes);
    kids.forEach(function(k){
      if(k.nodeType===3){
        var parts=k.textContent.split(/(\s+)/);var frag=d.createDocumentFragment();
        parts.forEach(function(p){
          if(!p)return;
          if(/^\s+$/.test(p)){frag.appendChild(d.createTextNode(' '));return}
          var w=d.createElement('span');w.className='w';var i=d.createElement('span');i.className='wi'+(grad?' grad':'');i.textContent=p;w.appendChild(i);frag.appendChild(w);
        });
        node.replaceChild(frag,k);
      }else if(k.nodeType===1){
        var g=grad||k.classList.contains('grad');
        if(k.classList.contains('grad'))k.classList.remove('grad');
        walk(k,g);
      }
    });
  }
  walk(el,false);
}

/* ---------- ripple (touch + mouse) ---------- */
d.addEventListener('pointerdown',function(e){
  var t=e.target.closest('.btn,.card,.xp,.clist a,.dock a');if(!t)return;
  var r=t.getBoundingClientRect(),s=Math.max(r.width,r.height)*2.2,sp=d.createElement('span');
  sp.className='ripple';sp.style.width=sp.style.height=s+'px';sp.style.left=(e.clientX-r.left-s/2)+'px';sp.style.top=(e.clientY-r.top-s/2)+'px';
  if(getComputedStyle(t).position==='static')t.style.position='relative';
  t.appendChild(sp);setTimeout(function(){sp.remove()},800);
},{passive:true});

/* ---------- header, progress, dock ---------- */
var hdr=$('#hdr'),prog=$('#progress'),dock=$('#dock'),lastY=0;
function onScroll(){
  var y=window.scrollY,h=root.scrollHeight-innerHeight;
  hdr.classList.toggle('scrolled',y>20);
  if(FINE){hdr.classList.toggle('hide',y>lastY&&y>400)}
  prog.style.transform='scaleX('+(h>0?y/h:0)+')';
  lastY=y;
}
addEventListener('scroll',onScroll,{passive:true});onScroll();
var secs=['journeys','destinations','reviews','contact'].map(function(id){return d.getElementById(id)});
if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){$$('.dock a').forEach(function(a){a.classList.toggle('on',a.dataset.sec===e.target.id)});$$('.nav a').forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id)})}})},{rootMargin:'-45% 0px -50% 0px'});
  $$('main section[id]').forEach(function(s){io.observe(s)});
}

/* ---------- form: compose WhatsApp / email ---------- */
var form=$('#enq');
form.addEventListener('submit',function(e){
  e.preventDefault();
  var via=(e.submitter&&e.submitter.dataset.via)||'wa',f=form.elements;
  if(!f.name.value.trim()){f.name.focus();f.name.reportValidity&&f.name.setCustomValidity('Please add your name');f.name.reportValidity();f.name.setCustomValidity('');return}
  var acc=(form.querySelector('input[name=acc]:checked')||{}).value||'';
  var lines=['Hello Panoramic Tour, I would like a quote for a Sri Lanka journey.','','Name: '+f.name.value.trim()];
  if(f.email.value.trim())lines.push('Email: '+f.email.value.trim());
  if(f.date.value)lines.push('Departure date: '+f.date.value);
  if(f.pax.value)lines.push('Travellers: '+f.pax.value);
  if(acc)lines.push('Accommodation style: '+acc);
  if(f.msg.value.trim())lines.push('','Travel dreams: '+f.msg.value.trim());
  var text=lines.join('\n');
  if(via==='wa'){window.open('https://wa.me/94774192370?text='+encodeURIComponent(text),'_blank','noopener')}
  else{location.href='mailto:info@pttsrilanka.travel?subject='+encodeURIComponent('Request for a quote — '+f.name.value.trim())+'&body='+encodeURIComponent(text)}
});

/* ---------- journeys rail: drag, arrows, progress ---------- */
var rail=$('#rail'),bar=$('#railbar');
function railUpdate(){var m=rail.scrollWidth-rail.clientWidth;var vis=rail.clientWidth/rail.scrollWidth;var p=m>0?rail.scrollLeft/m:1;bar.style.transform='translateX('+(p*(1-vis)*100/vis)+'%) scaleX(1)';bar.style.width=(vis*100)+'%'}
rail.addEventListener('scroll',railUpdate,{passive:true});addEventListener('resize',railUpdate);railUpdate();
function step(dir){var c=rail.querySelector('.card');var w=c?c.getBoundingClientRect().width+20:400;rail.scrollBy({left:dir*w,behavior:RM?'auto':'smooth'})}
$('#jprev').addEventListener('click',function(){step(-1)});$('#jnext').addEventListener('click',function(){step(1)});
if(FINE){
  var down=false,sx=0,sl=0,moved=0,vx=0,lx=0,raf;
  rail.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||e.button!==0)return;down=true;moved=0;sx=lx=e.clientX;sl=rail.scrollLeft;cancelAnimationFrame(raf)});
  addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx;moved=Math.max(moved,Math.abs(dx));if(moved>4)rail.classList.add('drag');vx=e.clientX-lx;lx=e.clientX;rail.scrollLeft=sl-dx});
  addEventListener('pointerup',function(){if(!down)return;down=false;
    (function glide(){vx*=.94;rail.scrollLeft-=vx;if(Math.abs(vx)>.5){raf=requestAnimationFrame(glide)}else{rail.classList.remove('drag')}})();
  });
  rail.addEventListener('click',function(e){if(moved>6){e.preventDefault();e.stopPropagation()}},true);
}

/* ---------- tilt + glare ---------- */
if(FINE&&!RM){
  $$('[data-tilt]').forEach(function(el){
    var g=el.querySelector('.glare');
    el.addEventListener('pointermove',function(e){
      if(rail.classList.contains('drag'))return;
      var r=el.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;
      el.style.transition='transform .15s ease-out,box-shadow .5s';
      el.style.transform='perspective(1000px) rotateX('+((.5-py)*8).toFixed(2)+'deg) rotateY('+((px-.5)*10).toFixed(2)+'deg) translateZ(0)';
      if(g){el.style.setProperty('--gx',px*100+'%');el.style.setProperty('--gy',py*100+'%')}
    });
    el.addEventListener('pointerleave',function(){el.style.transition='transform .9s cubic-bezier(.22,1,.36,1),box-shadow .5s';el.style.transform=''});
  });
}
/* spotlight */
$$('.xp').forEach(function(el){el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect();el.style.setProperty('--mx',(e.clientX-r.left)+'px');el.style.setProperty('--my',(e.clientY-r.top)+'px')})});

/* checks fallback (no gsap) */
var checks=$('#checks');
if(!HAS||RM){checks.classList.add('in');$('#giant').classList.add('in')}
else{root.classList.add('js')}

if(!HAS||RM)return;

/* ================= GSAP ================= */
gsap.registerPlugin(ScrollTrigger);
var lenis=null;
if(FINE&&window.Lenis){
  lenis=new Lenis({lerp:.1,smoothWheel:true});
  lenis.on('scroll',ScrollTrigger.update);
  gsap.ticker.add(function(t){lenis.raf(t*1000)});gsap.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){var id=a.getAttribute('href');if(id.length<2&&id!=='#top')return;var t=id==='#top'?0:d.querySelector(id);if(t!==null){e.preventDefault();lenis.scrollTo(t,{offset:-70,duration:1.4})}})});
}

/* split headings */
$$('[data-split]').forEach(split);

/* hero intro */
var tl=gsap.timeline({defaults:{ease:'expo.out'}});
tl.from('.hero .h1 .wi',{yPercent:115,rotate:4,duration:1.25,stagger:.07},.1)
  .from('.hero [data-in]',{y:26,opacity:0,duration:1.1,stagger:.08},.35)
  .from('.stage .lay .in',{y:90,scale:.86,opacity:0,duration:1.5,stagger:.09},.2)
  .from('.orbit ellipse',{opacity:0,scale:.9,transformOrigin:'50% 50%',duration:1.8,stagger:.15},.4);
gsap.to('.orbit .o3',{rotation:360,transformOrigin:'50% 50%',duration:60,repeat:-1,ease:'none'});
gsap.to('.orbit .o1',{strokeDashoffset:-160,duration:20,repeat:-1,ease:'none'});

/* hero pointer parallax (mouse + touch) */
var stage=$('#stage'),lays=$$('.stage .lay').map(function(l){return {el:l,d:parseFloat(l.dataset.depth)||1}});
var tx=0,ty=0,cx=0,cy=0;
function aim(x,y){tx=Math.max(-1,Math.min(1,x));ty=Math.max(-1,Math.min(1,y))}
addEventListener('pointermove',function(e){if(e.pointerType==='mouse')aim(e.clientX/innerWidth*2-1,e.clientY/innerHeight*2-1)},{passive:true});
stage.addEventListener('touchmove',function(e){var t=e.touches[0],r=stage.getBoundingClientRect();aim((t.clientX-r.left)/r.width*2-1,(t.clientY-r.top)/r.height*2-1)},{passive:true});
stage.addEventListener('touchend',function(){aim(0,0)},{passive:true});
addEventListener('deviceorientation',function(e){if(e.gamma==null)return;aim(e.gamma/25,(e.beta-45)/25)},{passive:true});
var amp=FINE?26:14, idle=0;
gsap.ticker.add(function(){
  if(!FINE){idle+=.012;if(Math.abs(tx)<.001&&Math.abs(ty)<.001){} }
  var ix=FINE?0:Math.sin(idle)*.35, iy=FINE?0:Math.cos(idle*.8)*.25;
  cx+=((tx+ix)-cx)*.06;cy+=((ty+iy)-cy)*.06;
  for(var i=0;i<lays.length;i++){var L=lays[i];L.el.style.transform='translate3d('+(cx*L.d*amp).toFixed(2)+'px,'+(cy*L.d*amp).toFixed(2)+'px,0)'}
  stage.style.transform='rotateY('+(cx*5).toFixed(2)+'deg) rotateX('+(-cy*4).toFixed(2)+'deg)';
});
/* scroll parallax on hero */
gsap.to('#stageWrap',{yPercent:-10,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
gsap.to('.hero-copy',{yPercent:8,opacity:.2,ease:'none',scrollTrigger:{trigger:'.hero',start:'center top',end:'bottom top',scrub:true}});

/* marquee — speed & direction follow scroll */
var mq=$('#marq');mq.innerHTML+=mq.innerHTML;
var mx=0,dir=-1,boost=0,half=0;
function mqm(){half=mq.scrollWidth/2}mqm();addEventListener('resize',mqm);
ScrollTrigger.create({start:0,end:'max',onUpdate:function(s){dir=s.direction>0?-1:1;boost=Math.min(Math.abs(s.getVelocity())/180,14)}});
gsap.ticker.add(function(){boost*=.92;mx+=dir*(.6+boost);if(mx<=-half)mx+=half;if(mx>0)mx-=half;mq.style.transform='translate3d('+mx.toFixed(2)+'px,0,0)'});

/* word reveals for section headings */
$$('[data-split]').forEach(function(h){if(h.closest('.hero'))return;
  gsap.from(h.querySelectorAll('.wi'),{yPercent:110,rotate:3,duration:1.1,ease:'expo.out',stagger:.045,scrollTrigger:{trigger:h,start:'top 88%',once:true}});
});
/* batch reveals */
gsap.set('[data-r]',{y:44,opacity:0});
ScrollTrigger.batch('[data-r]',{start:'top 92%',once:true,onEnter:function(b){gsap.to(b,{y:0,opacity:1,duration:1.1,ease:'expo.out',stagger:.08,overwrite:true,clearProps:'transform'})}});

/* counters */
$$('[data-count]').forEach(function(el){var end=+el.dataset.count,o={v:0};
  ScrollTrigger.create({trigger:el,start:'top 92%',once:true,onEnter:function(){gsap.to(o,{v:end,duration:1.8,ease:'power3.out',onUpdate:function(){el.textContent=Math.round(o.v)}})}});
});

/* steps line (scroll-linked) */
var stepsEl=$('#steps'),stepEls=$$('.step',stepsEl);
stepEls.forEach(function(s){s.classList.remove('on')});stepsEl.style.setProperty('--p',0);
ScrollTrigger.create({trigger:stepsEl,start:'top 72%',end:'bottom 60%',scrub:.6,onUpdate:function(s){var p=s.progress;stepsEl.style.setProperty('--p',p.toFixed(3));stepEls.forEach(function(el,i){el.classList.toggle('on',p>=i/(stepEls.length-1)-.04)})}});
gsap.from('.step',{y:40,opacity:0,duration:1,ease:'expo.out',stagger:.12,scrollTrigger:{trigger:stepsEl,start:'top 85%',once:true}});

/* interlude: expanding image */
var inter=$('#inter');
gsap.fromTo(inter,{clipPath:'inset(6% 5% 6% 5% round 36px)'},{clipPath:'inset(0% 0% 0% 0% round 0px)',ease:'none',scrollTrigger:{trigger:inter,start:'top 90%',end:'top 15%',scrub:true}});
gsap.fromTo('#inter img',{yPercent:-6,scale:1.15},{yPercent:6,scale:1,ease:'none',scrollTrigger:{trigger:inter,start:'top bottom',end:'bottom top',scrub:true}});

/* image masks */
$$('[data-mask]').forEach(function(m,i){var img=m.querySelector('img');
  gsap.fromTo(m,{clipPath:'inset(14% 14% 14% 14% round 28px)'},{clipPath:'inset(0% 0% 0% 0% round 28px)',duration:1.6,ease:'expo.out',delay:i*.15,scrollTrigger:{trigger:m,start:'top 88%',once:true}});
  gsap.fromTo(img,{scale:1.3},{scale:1,duration:1.8,ease:'expo.out',delay:i*.15,scrollTrigger:{trigger:m,start:'top 88%',once:true}});
});
gsap.to('.am2',{yPercent:-14,ease:'none',scrollTrigger:{trigger:'.about-media',start:'top bottom',end:'bottom top',scrub:true}});

/* checks draw + giant wordmark */
ScrollTrigger.create({trigger:checks,start:'top 85%',once:true,onEnter:function(){checks.classList.add('in')}});
ScrollTrigger.create({trigger:'#giant',start:'top 95%',once:true,onEnter:function(){$('#giant').classList.add('in')}});

/* dock hide in hero (mobile) */
ScrollTrigger.create({trigger:'.hero',start:'top top',end:'60% top',onLeave:function(){dock.classList.remove('off')},onEnterBack:function(){dock.classList.add('off')}});
if(scrollY<innerHeight*.4)dock.classList.add('off');

/* magnetic buttons */
if(FINE){
  $$('[data-magnetic]').forEach(function(b){
    var xTo=gsap.quickTo(b,'x',{duration:.6,ease:'elastic.out(1,.4)'}),yTo=gsap.quickTo(b,'y',{duration:.6,ease:'elastic.out(1,.4)'});
    var lbl=b.querySelector('.lbl'),lx=lbl&&gsap.quickTo(lbl,'x',{duration:.6,ease:'power3.out'}),ly=lbl&&gsap.quickTo(lbl,'y',{duration:.6,ease:'power3.out'});
    b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;xTo(x*.35);yTo(y*.45);if(lx){lx(x*.12);ly(y*.15)}});
    b.addEventListener('pointerleave',function(){xTo(0);yTo(0);if(lx){lx(0);ly(0)}});
  });
  /* custom cursor */
  root.classList.add('has-cursor');
  var c1=$('.cur'),c2=$('.cur-r'),lbl=c2.querySelector('span');
  var x1=gsap.quickTo(c1,'x',{duration:.12,ease:'power3'}),y1=gsap.quickTo(c1,'y',{duration:.12,ease:'power3'});
  var x2=gsap.quickTo(c2,'x',{duration:.5,ease:'power3'}),y2=gsap.quickTo(c2,'y',{duration:.5,ease:'power3'});
  addEventListener('pointermove',function(e){if(e.pointerType!=='mouse')return;x1(e.clientX);y1(e.clientY);x2(e.clientX);y2(e.clientY)});
  d.addEventListener('pointerover',function(e){
    var lab=e.target.closest('[data-cursor]'),hov=e.target.closest('a,button,label,[data-tilt],.xp');
    var cardLink=e.target.closest('.card,.dp');
    if(lab&&(cardLink||lab.classList.contains('rail'))){lbl.textContent=e.target.closest('.dp')?'Open':'Drag';c2.classList.add('lbl');c2.classList.remove('hov');c1.classList.add('hide')}
    else if(hov){c2.classList.add('hov');c2.classList.remove('lbl');c1.classList.remove('hide')}
    else{c2.classList.remove('hov','lbl');c1.classList.remove('hide')}
  });
  d.addEventListener('pointerleave',function(){gsap.to([c1,c2],{opacity:0,duration:.3})});
  d.addEventListener('pointerenter',function(){gsap.to([c1,c2],{opacity:1,duration:.3})});
}
addEventListener('load',function(){ScrollTrigger.refresh();railUpdate()});
})();
