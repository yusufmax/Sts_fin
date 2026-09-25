(()=>{
  const originals=new Map([...document.querySelectorAll('[data-ru]')].map(el=>[el,el.innerHTML]));
  const server=document.documentElement.dataset.serverLocalized==='true';
  const routeLang=location.pathname.match(/^\/(en|ru|uz)(?:\/|$)/)?.[1];
  let lang=server?(routeLang||'en'):('en');
  const setLang=next=>{
    if(server){
      const path=location.pathname.replace(/^\/(?:en|ru|uz)(?=\/|$)/,'');
      location.href='/'+next+(path||'/')+location.search+location.hash;
      return;
    }
    lang=next;
    document.documentElement.lang=next;
    originals.forEach((en,el)=>{el.innerHTML=next==='ru'?el.dataset.ru:next==='uz'?el.dataset.uz:en});
    document.querySelectorAll('[data-lang]').forEach(btn=>{const active=btn.dataset.lang===next;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active))});
    document.title=(document.body.dataset[`title${next.charAt(0).toUpperCase()+next.slice(1)}`]||document.body.dataset.titleEn)+' | Strategic Security Systems';
    document.querySelector('meta[name="description"]').content=document.querySelector('.subhero-lead')?.textContent||'';
    button.setAttribute('aria-label',next==='ru'?'Открыть меню':next==='uz'?'Menyuni ochish':'Open menu');
    localStorage.setItem('s3-language',next);
  };
  document.querySelectorAll('[data-lang]').forEach(btn=>btn.addEventListener('click',()=>setLang(btn.dataset.lang)));
  const menu=document.querySelector('.mobile-menu'),button=document.querySelector('.menu-button');
  const closeMenu=()=>{document.body.classList.remove('menu-open');menu.setAttribute('aria-hidden','true');button.setAttribute('aria-expanded','false')};
  button.addEventListener('click',()=>{const open=document.body.classList.toggle('menu-open');menu.setAttribute('aria-hidden',String(!open));button.setAttribute('aria-expanded',String(open))});
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
  if(server){
    document.querySelectorAll('[data-lang]').forEach(btn=>{const active=btn.dataset.lang===lang;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active))});
  }else setLang(['en','ru','uz'].includes(localStorage.getItem('s3-language'))?localStorage.getItem('s3-language'):'en');
  const form=document.querySelector('#enquiry');
  if(form){
    const requested=new URLSearchParams(location.search).get('interest');
    if(requested){const select=form.elements.interest;if([...select.options].some(o=>o.value===requested))select.value=requested}
    form.addEventListener('submit',async e=>{
      e.preventDefault();
      if(!form.reportValidity())return;
      const button=form.querySelector('button[type="submit"]');
      const status=form.querySelector('.form-status');
      button.disabled=true;
      status.textContent=lang==='ru'?'Отправляем запрос…':lang==='uz'?'Murojaat yuborilmoqda…':'Sending your enquiry…';
      const payload=Object.fromEntries(new FormData(form).entries());
      payload.locale=lang;
      try{
        const response=await fetch('/api/contact',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
        const result=await response.json();
        if(!response.ok)throw new Error(result.error||'delivery_failed');
        status.textContent=lang==='ru'?'Запрос получен. Наша команда свяжется с вами.':lang==='uz'?'Murojaat qabul qilindi. Jamoamiz siz bilan bog‘lanadi.':'Enquiry received. Our team will be in touch.';
        form.reset();
      }catch{
        status.textContent=lang==='ru'?'Не удалось отправить запрос. Попробуйте ещё раз или напишите на info@stsec.uz.':lang==='uz'?'Murojaat yuborilmadi. Qayta urinib ko‘ring yoki info@stsec.uz manziliga yozing.':'Could not send your enquiry. Please retry or email info@stsec.uz.';
      }finally{button.disabled=false}
    });
  }
})();
