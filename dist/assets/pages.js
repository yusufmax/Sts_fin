(()=>{
  const originals=new Map([...document.querySelectorAll('[data-ru]')].map(el=>[el,el.innerHTML]));
  let lang='en';
  const setLang=next=>{
    lang=next;
    document.documentElement.lang=next;
    originals.forEach((en,el)=>{el.innerHTML=next==='ru'?el.dataset.ru:en});
    document.querySelectorAll('[data-lang]').forEach(btn=>{const active=btn.dataset.lang===next;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active))});
    document.title=(next==='ru'?document.body.dataset.titleRu:document.body.dataset.titleEn)+' | Strategic Security Systems';
    localStorage.setItem('s3-language',next);
  };
  document.querySelectorAll('[data-lang]').forEach(btn=>btn.addEventListener('click',()=>setLang(btn.dataset.lang)));
  const menu=document.querySelector('.mobile-menu'),button=document.querySelector('.menu-button');
  const closeMenu=()=>{document.body.classList.remove('menu-open');menu.setAttribute('aria-hidden','true');button.setAttribute('aria-expanded','false')};
  button.addEventListener('click',()=>{const open=document.body.classList.toggle('menu-open');menu.setAttribute('aria-hidden',String(!open));button.setAttribute('aria-expanded',String(open))});
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
  setLang(localStorage.getItem('s3-language')==='ru'?'ru':'en');
  const form=document.querySelector('#enquiry');
  if(form){
    const requested=new URLSearchParams(location.search).get('interest');
    if(requested){const select=form.elements.interest;if([...select.options].some(o=>o.value===requested))select.value=requested}
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const data=new FormData(form);
      const interest=form.elements.interest.selectedOptions[0]?.textContent||'';
      const labels=lang==='ru'?['Имя','Организация','Рабочая почта','Телефон','Тема','Задача']:['Name','Organization','Work email','Phone','Interest','Requirement'];
      const values=[data.get('name'),data.get('organization'),data.get('email'),data.get('phone')||'—',interest,data.get('message')];
      const body=labels.map((label,i)=>label+': '+values[i]).join('\n');
      location.href='mailto:info@stsec.uz?subject='+encodeURIComponent(lang==='ru'?'Запрос с сайта S3':'S3 website enquiry')+'&body='+encodeURIComponent(body);
    });
  }
})();
