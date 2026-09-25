(()=>{
  const lang=document.documentElement.lang||'en';
  const current=location.pathname.replace(/^\/(en|ru|uz)(?=\/|$)/,'').replace(/^\//,'')||'index.html';
  const local=href=>`/${lang}/${href==='index.html'?'':href}`;
  const safeHref=href=>/^[a-z0-9][a-z0-9-]*\.html$/.test(href)?local(href):null;
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
})();
