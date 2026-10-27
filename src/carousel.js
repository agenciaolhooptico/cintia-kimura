;
(()=>{
 const region=document.querySelector('.procedure-carousel'),viewport=region.querySelector('.carousel-window'),track=region.querySelector('.services'),pause=region.querySelector('.carousel-pause');
 const originals=[...track.children].map(el=>el.outerHTML),reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let pool=originals.slice(),cycle=0,looping=false,manualPause=reduce.matches,hover=false,focus=false,inView=false,pointer=null,dragged=false,resumeAt=0,last=0,travel=0;
 function paint(){track.style.transform='none';track.style.transition='none';track.innerHTML=pool.join('');const first=track.firstElementChild;if(!first)return;const gap=parseFloat(getComputedStyle(track).gap)||0;cycle=pool.length*(first.getBoundingClientRect().width+gap);looping=cycle-gap>viewport.clientWidth;region.classList.toggle('is-static',!looping);
  if(looping){const clone=()=>pool.map(html=>{const el=document.createElement('div');el.innerHTML=html;const card=el.firstElementChild;card.setAttribute('aria-hidden','true');card.querySelectorAll('a,button').forEach(x=>x.tabIndex=-1);return card.outerHTML}).join('');track.innerHTML=clone()+pool.join('')+clone();viewport.scrollLeft=cycle}else viewport.scrollLeft=0;
  syncPause();
 }
 function normalize(){if(!looping)return;if(viewport.scrollLeft<cycle)viewport.scrollLeft+=cycle;else if(viewport.scrollLeft>=cycle*2)viewport.scrollLeft-=cycle}
 function syncPause(){pause.setAttribute('aria-pressed',String(manualPause));pause.textContent=manualPause?'Continuar':'Pausar';pause.setAttribute('aria-label',manualPause?'Continuar movimento automático':'Pausar movimento automático');pause.hidden=!looping;region.querySelector('.carousel-navigation>span').textContent=looping?'Arraste para explorar os cuidados':'Cuidados selecionados'}
 pause.onclick=()=>{manualPause=!manualPause;syncPause()};
 viewport.addEventListener('mouseenter',()=>hover=true);viewport.addEventListener('mouseleave',()=>hover=false);
 viewport.addEventListener('focusin',e=>focus=e.target.matches(':focus-visible'));viewport.addEventListener('focusout',e=>{if(!viewport.contains(e.relatedTarget))focus=false});
 viewport.addEventListener('scroll',normalize,{passive:true});
 viewport.addEventListener('pointerdown',e=>{if(e.button!==0||!looping)return;pointer={id:e.pointerId,x:e.clientX,y:e.clientY,last:e.clientX};dragged=false});
 viewport.addEventListener('pointermove',e=>{if(!pointer||pointer.id!==e.pointerId)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;if(!dragged&&Math.abs(dx)>6&&Math.abs(dx)>Math.abs(dy)){dragged=true;viewport.setPointerCapture(e.pointerId);region.classList.add('is-dragging')}if(dragged){viewport.scrollLeft-=e.clientX-pointer.last;normalize();e.preventDefault()}pointer.last=e.clientX});
 function finish(){if(!pointer)return;const id=pointer.id;pointer=null;if(viewport.hasPointerCapture(id))viewport.releasePointerCapture(id);region.classList.remove('is-dragging');resumeAt=performance.now()+1600}
 viewport.addEventListener('pointerup',finish);viewport.addEventListener('pointercancel',finish);viewport.addEventListener('lostpointercapture',finish);
 viewport.addEventListener('click',e=>{if(dragged){e.preventDefault();e.stopPropagation();dragged=false}},true);
 viewport.addEventListener('dragstart',e=>e.preventDefault());
 viewport.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();viewport.scrollLeft+=(e.key==='ArrowRight'?1:-1)*(track.firstElementChild.getBoundingClientRect().width+14);normalize();resumeAt=performance.now()+1800}});
 document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',x===b));pool=originals.filter(html=>{const el=document.createElement('div');el.innerHTML=html;return b.dataset.filter==='Todos'||el.firstElementChild.dataset.category===b.dataset.filter});paint();region.querySelector('.carousel-status').textContent=b.dataset.filter==='Todos'?'Todos os procedimentos':b.dataset.filter;resumeAt=performance.now()+1000});
 new ResizeObserver(paint).observe(viewport);new IntersectionObserver(es=>{inView=es[0].isIntersecting},{threshold:.05}).observe(region);
 reduce.addEventListener('change',()=>{manualPause=reduce.matches;syncPause()});
 function tick(now){const dt=Math.min(now-last,60);last=now;if(looping&&inView&&!manualPause&&!hover&&!focus&&!pointer&&!document.hidden&&!document.querySelector('dialog[open]')&&now>resumeAt){travel+=dt*.022;const pixels=Math.floor(travel);if(pixels){viewport.scrollLeft+=pixels;travel-=pixels;normalize()}}requestAnimationFrame(tick)}
 paint();requestAnimationFrame(tick);
})();
