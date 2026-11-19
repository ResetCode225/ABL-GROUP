/* ABL-Group : comportements du site (sans dépendance). */
(function(){
  var d=document,root=d.documentElement;
  root.classList.add('abl-js');
  var $=function(s,c){return (c||d).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))};
  var ARROW_L='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',ARROW_R='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';
  function btn(cls,html,label){var b=d.createElement('button');b.type='button';b.className=cls;b.innerHTML=html;b.setAttribute('aria-label',label);return b}

  /* En-tête */
  var header=$('.abl-header');
  if(header){
    var onScroll=function(){header.classList.toggle('is-solid',window.scrollY>40)};
    onScroll();window.addEventListener('scroll',onScroll,{passive:true});
    var burger=$('.abl-burger',header);
    if(burger){burger.addEventListener('click',function(){
      var o=header.classList.toggle('nav-open');d.body.classList.toggle('abl-lock',o);burger.setAttribute('aria-expanded',o?'true':'false')})}
    $$('.abl-nav a',header).forEach(function(a){a.addEventListener('click',function(){header.classList.remove('nav-open');d.body.classList.remove('abl-lock')})});
    var links=$$('.abl-nav a[href*="#"]',header),secs=[];
    links.forEach(function(a){var id=(a.getAttribute('href').split('#')[1]||'');var s=id&&d.getElementById(id);if(s)secs.push([a,s])});
    if('IntersectionObserver' in window&&secs.length){
      var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){secs.forEach(function(p){p[0].classList.toggle('is-active',p[1]===e.target)})}})},{rootMargin:'-45% 0px -50% 0px'});
      secs.forEach(function(p){io.observe(p[1])});
    }
  }

  /* Slider hero */
  $$('.abl-hero').forEach(function(hero){
    var slides=$$('.abl-slide',hero);if(slides.length<2)return;
    var DUR=7000,cur=0,timer=null;hero.style.setProperty('--abl-dur',DUR+'ms');
    var ctl=d.createElement('div');ctl.className='abl-hctl';
    ctl.innerHTML='<div class="abl-in"><div class="abl-count" aria-live="polite"><b>01</b> / '+('0'+slides.length).slice(-2)+'</div><div class="abl-dots" role="tablist"></div><div class="abl-arrows"></div></div>';
    hero.appendChild(ctl);
    var dots=$('.abl-dots',ctl),arrows=$('.abl-arrows',ctl),count=$('.abl-count b',ctl);
    var prev=btn('abl-arrow',ARROW_L,'Diapositive précédente'),next=btn('abl-arrow',ARROW_R,'Diapositive suivante');arrows.appendChild(prev);arrows.appendChild(next);
    var dotEls=slides.map(function(_,i){var b=btn('abl-dot','<i></i>','Aller à la diapositive '+(i+1));b.setAttribute('role','tab');b.addEventListener('click',function(){go(i,true)});dots.appendChild(b);return b});
    function go(i,user){
      cur=(i+slides.length)%slides.length;
      slides.forEach(function(s,k){s.classList.toggle('is-active',k===cur);s.setAttribute('aria-hidden',k===cur?'false':'true')});
      dotEls.forEach(function(b,k){b.classList.remove('is-active','is-done');if(k<cur)b.classList.add('is-done');if(k===cur){void b.offsetWidth;b.classList.add('is-active')}});
      count.textContent=('0'+(cur+1)).slice(-2);
      clearTimeout(timer);if(!hero.classList.contains('is-paused'))timer=setTimeout(function(){go(cur+1)},DUR);
    }
    prev.addEventListener('click',function(){go(cur-1,true)});next.addEventListener('click',function(){go(cur+1,true)});
    hero.addEventListener('mouseenter',function(){hero.classList.add('is-paused');clearTimeout(timer)});
    hero.addEventListener('mouseleave',function(){hero.classList.remove('is-paused');go(cur)});
    var sx=null;hero.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});
    hero.addEventListener('touchend',function(e){if(sx===null)return;var dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>50)go(cur+(dx<0?1:-1),true);sx=null},{passive:true});
    d.addEventListener('keydown',function(e){if(e.key==='ArrowRight')go(cur+1,true);if(e.key==='ArrowLeft')go(cur-1,true)});
    var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce)hero.classList.add('is-paused');
    go(0);
  });

  /* Carrousels */
  $$('.abl-carousel').forEach(function(c){
    var tr=$('.abl-track',c);if(!tr)return;
    var ctl=d.createElement('div');ctl.className='abl-ctl';
    var bar=d.createElement('div');bar.className='abl-bar-p';bar.innerHTML='<i></i>';
    var p=btn('abl-arrow',ARROW_L,'Précédent'),n=btn('abl-arrow',ARROW_R,'Suivant');
    ctl.appendChild(bar);ctl.appendChild(p);ctl.appendChild(n);c.appendChild(ctl);
    var fill=$('i',bar);
    function step(){var k=tr.children[0];return k?k.getBoundingClientRect().width+22:300}
    function upd(){var max=tr.scrollWidth-tr.clientWidth;c.classList.toggle('no-scroll',max<=4);var w=max>0?Math.max(14,tr.clientWidth/tr.scrollWidth*100):100;fill.style.width=w+'%';fill.style.left=(max>0?(tr.scrollLeft/max)*(100-w):0)+'%';p.disabled=tr.scrollLeft<4;n.disabled=tr.scrollLeft>max-4;p.style.opacity=p.disabled?.4:1;n.style.opacity=n.disabled?.4:1}
    p.addEventListener('click',function(){tr.scrollBy({left:-step(),behavior:'smooth'})});
    n.addEventListener('click',function(){tr.scrollBy({left:step(),behavior:'smooth'})});
    tr.addEventListener('scroll',upd,{passive:true});window.addEventListener('resize',upd);upd();
    c._upd=upd;
  });

  /* Filtres des prestations */
  $$('.abl-filters').forEach(function(f){
    var scope=f.parentNode,cards=$$('.abl-card',scope);
    $$('.abl-chip',f).forEach(function(ch){ch.addEventListener('click',function(){
      $$('.abl-chip',f).forEach(function(x){x.classList.toggle('is-on',x===ch)});
      var k=ch.getAttribute('data-k');
      cards.forEach(function(cd){cd.classList.toggle('is-hidden',k!=='all'&&!cd.classList.contains('abl-k-'+k))});
      var c=$('.abl-carousel',scope);if(c){var tr=$('.abl-track',c);tr.scrollTo({left:0});setTimeout(c._upd,60)}
    })});
  });

  /* Onglets du parcours */
  $$('.abl-tabs').forEach(function(t){
    var panels=$$('.abl-panel',t),list=$('.abl-tablist',t);if(!list||!panels.length)return;
    var tabs=panels.map(function(p,i){
      var h=$('h3',p),label=h?h.textContent:('Étape '+(i+1));
      var b=d.createElement('button');b.type='button';b.className='abl-tab';b.setAttribute('role','tab');
      b.innerHTML='<small>'+('0'+(i+1)).slice(-2)+'</small><span></span>';$('span',b).textContent=label;
      b.addEventListener('click',function(){sel(i)});list.appendChild(b);return b});
    function sel(i){panels.forEach(function(p,k){p.classList.toggle('is-on',k===i)});tabs.forEach(function(b,k){b.classList.toggle('is-on',k===i);b.setAttribute('aria-selected',k===i?'true':'false')})}
    sel(0);
  });

  /* Apparition au défilement */
  var rv=$$('.abl-rv');
  if('IntersectionObserver' in window){
    var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-in');o.unobserve(e.target)}})},{threshold:.08});
    rv.forEach(function(el){o.observe(el)});
  }else rv.forEach(function(el){el.classList.add('is-in')});
  setTimeout(function(){rv.forEach(function(el){el.classList.add('is-in')})},2500);

  /* Formulaire (aperçu) : si le formulaire ne pointe pas vers WordPress, on simule l'envoi */
  $$('form.abl-form[data-demo]').forEach(function(f){
    f.addEventListener('submit',function(e){e.preventDefault();var m=$('.abl-msg',f);if(m)m.hidden=false;f.reset()});
  });
})();
