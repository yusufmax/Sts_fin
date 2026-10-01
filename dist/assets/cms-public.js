(()=>{
  const lang=document.documentElement.lang||'en';
  const current=location.pathname.replace(/^\/(en|ru|uz)(?=\/|$)/,'').replace(/^\//,'')||'index.html';
  const local=href=>`/${lang}/${href==='index.html'?'':href}`;
  const safeHref=href=>/^[a-z0-9][a-z0-9-]*\.html$/.test(href)?local(href):null;
  for(const section of document.querySelectorAll('section[data-cms-section]')){
    for(const [selector,attribute] of [['article[data-cms-card]','data-cms-card-order'],['a[data-cms-link]','data-cms-button-order']]){
      const order=(section.getAttribute(attribute)||'').split(',').filter(Boolean);
      if(!order.length)continue;
      const groups=new Map();
      for(const item of section.querySelectorAll(selector)){const parent=item.parentElement;if(!groups.has(parent))groups.set(parent,[]);groups.get(parent).push(item)}
      for(const [parent,items] of groups){const key=selector.startsWith('article')?'cmsCard':'cmsLink';items.sort((a,b)=>{const ai=order.indexOf(a.dataset[key]),bi=order.indexOf(b.dataset[key]);return (ai<0?10000:ai)-(bi<0?10000:bi)});for(const item of items)parent.append(item)}
    }
    const requested=section.getAttribute('data-cms-card-mode');
    if(requested)for(const parent of new Set([...section.querySelectorAll('article[data-cms-card]')].map(card=>card.parentElement))){
      const count=[...parent.children].filter(item=>item.matches?.('article[data-cms-card]:not(.cms-hidden-card)')).length;
      if(count<2)continue;
      const mode=requested==='auto'?(count>3?'ribbon':'tiles'):requested;
      parent.classList.add(`cms-card-group--${mode}`);
    }
  }
  fetch('/api/site-settings').then(response=>response.json()).then(settings=>{
    const nav=document.querySelector('.nav-links');
    const mobile=document.querySelector('.mobile-menu');
    if(nav&&mobile&&Array.isArray(settings.nav)){
      nav.replaceChildren();mobile.replaceChildren();
      for(const item of settings.nav){
        const href=safeHref(item.href);if(!href)continue;
        const label=item[lang]||item.en;if(!label)continue;
        const mobileLink=document.createElement('a');mobileLink.href=href;mobileLink.textContent=label;mobile.append(mobileLink);
        if(item.href!=='contact.html'){
          const link=mobileLink.cloneNode(true);
          if(current===item.href)link.classList.add('active');
          nav.append(link);
        }else{
          const contact=document.querySelector('.nav-contact');
          if(contact){const text=contact.querySelector('[data-i18n],[data-ru]');if(text)text.textContent=label;else contact.firstChild.textContent=label+' ';contact.href=href}
        }
      }
      const menu=document.querySelector('.menu-button');
      menu?.addEventListener('click',()=>mobile.setAttribute('aria-hidden',String(!document.body.classList.contains('menu-open'))));
    }
    if(settings.contactEmail&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.contactEmail)){
      document.querySelectorAll('a[href^="mailto:"]').forEach(link=>{link.href='mailto:'+settings.contactEmail;link.textContent=link.textContent.replace(/info@stsec\.uz/g,settings.contactEmail)});
    }
  }).catch(()=>{});
  document.querySelectorAll('.cms-block-media--slider').forEach(media=>{
    const track=media.querySelector('.cms-block-media-track');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    for(const [selector,direction] of [['[data-slider-prev]',-1],['[data-slider-next]',1]]){
      media.querySelector(selector)?.addEventListener('click',()=>track.scrollBy({left:direction*track.clientWidth,behavior:reduced?'instant':'smooth'}));
    }
  });
  let preview=false;
  try{preview=new URLSearchParams(location.search).has('cms-preview')&&parent!==window&&parent.location.origin===location.origin}catch{}
  if(preview){
    document.documentElement.classList.add('cms-preview-mode');
    let selected=null;
    document.addEventListener('click',event=>{
      const element=event.target.closest?.('[data-cms-field],[data-cms-copy],[data-cms-image],[data-cms-link],[data-cms-card],[data-cms-section],[data-cms-block]');
      if(!element)return;
      event.preventDefault();event.stopPropagation();
      selected?.classList.remove('cms-preview-selected');selected=element;selected.classList.add('cms-preview-selected');
      const section=element.closest('[data-cms-section],[data-cms-block]');
      const detail={type:'s3-preview-select',sectionToken:section?.hasAttribute('data-cms-block')?`b:${section.getAttribute('data-cms-block')}`:section?.hasAttribute('data-cms-section')?`s:${section.getAttribute('data-cms-section')}`:'global',fieldId:element.getAttribute('data-cms-field'),copyId:element.getAttribute('data-cms-copy'),imageId:element.closest('[data-cms-image]')?.getAttribute('data-cms-image')||null,linkId:element.closest('[data-cms-link]')?.getAttribute('data-cms-link')||null,cardId:element.closest('[data-cms-card]')?.getAttribute('data-cms-card')||null};
      parent.postMessage(detail,location.origin);
      if(detail.fieldId!==null||detail.copyId!==null){element.contentEditable='true';element.focus()}
    },true);
    document.addEventListener('dblclick',event=>{
      const element=event.target.closest?.('[data-cms-field],[data-cms-copy]');
      if(!element)return;
      event.preventDefault();event.stopPropagation();element.contentEditable='true';element.focus();
    },true);
    document.addEventListener('input',event=>{
      const element=event.target;
      if(element.contentEditable!=='true')return;
      parent.postMessage({type:'s3-preview-edit',fieldId:element.getAttribute('data-cms-field'),copyId:element.getAttribute('data-cms-copy'),html:element.innerHTML,text:element.textContent||''},location.origin);
    },true);
  }
})();
