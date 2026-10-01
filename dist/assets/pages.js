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
    const text={
      required:{en:'Please fill in this field.',ru:'Заполните это поле.',uz:'Iltimos, ushbu maydonni to‘ldiring.'},
      choose:{en:'Please choose a topic.',ru:'Выберите тему обращения.',uz:'Iltimos, murojaat mavzusini tanlang.'},
      email:{en:'Enter a valid email address.',ru:'Введите корректный адрес электронной почты.',uz:'To‘g‘ri elektron pochta manzilini kiriting.'},
      short:{en:'Please enter at least {n} characters.',ru:'Введите не менее {n} символов.',uz:'Kamida {n} ta belgi kiriting.'},
      fix:{en:'Please complete or correct the highlighted fields.',ru:'Заполните или исправьте отмеченные поля.',uz:'Iltimos, belgilangan maydonlarni to‘ldiring yoki to‘g‘rilang.'},
      sending:{en:'Sending your message…',ru:'Отправляем сообщение…',uz:'Xabar yuborilmoqda…'},
      sent:{en:'Thank you for contacting S3. Your message has been sent successfully.',ru:'Спасибо за обращение в S3. Ваше сообщение успешно отправлено.',uz:'S3 ga murojaat qilganingiz uchun rahmat. Xabaringiz muvaffaqiyatli yuborildi.'},
      rate:{en:'Too many messages were sent from this connection. Please try again in a few minutes.',ru:'С этого подключения отправлено слишком много сообщений. Попробуйте ещё раз через несколько минут.',uz:'Bu ulanishdan juda ko‘p xabar yuborildi. Bir necha daqiqadan so‘ng qayta urinib ko‘ring.'},
      failed:{en:'Your message could not be sent. Please try again or email info@stsec.uz.',ru:'Не удалось отправить сообщение. Попробуйте ещё раз или напишите на info@stsec.uz.',uz:'Xabar yuborilmadi. Qayta urinib ko‘ring yoki info@stsec.uz manziliga yozing.'},
    };
    const say=key=>text[key][lang]||text[key].en;
    const requested=new URLSearchParams(location.search).get('interest');
    if(requested){const select=form.elements.interest;if([...select.options].some(o=>o.value===requested))select.value=requested}
    // Messages are shown next to each field instead of the browser's single tooltip.
    form.noValidate=true;
    const fields=[...form.querySelectorAll('.form-field input,.form-field select,.form-field textarea')];
    const status=form.querySelector('.form-status');
    const setStatus=(message,kind)=>{status.textContent=message;status.className=`form-status${kind?` is-${kind}`:''}`};
    const problem=field=>{
      const value=field.value.trim(),validity=field.validity;
      if(field.required&&!value)return field.tagName==='SELECT'?say('choose'):say('required');
      if(validity.typeMismatch)return say('email');
      if(field.minLength>0&&value&&value.length<field.minLength)return say('short').replace('{n}',field.minLength);
      return '';
    };
    const showError=(field,message)=>{
      const label=field.closest('.form-field');
      let note=label.querySelector('.field-error');
      label.classList.toggle('is-invalid',Boolean(message));
      if(!message){field.removeAttribute('aria-invalid');note?.remove();return}
      field.setAttribute('aria-invalid','true');
      if(!note){note=document.createElement('span');note.className='field-error';note.id=`${field.name}-error`;label.append(note);field.setAttribute('aria-describedby',note.id)}
      note.textContent=message;
    };
    fields.forEach(field=>field.addEventListener(field.tagName==='SELECT'?'change':'input',()=>{if(field.closest('.is-invalid'))showError(field,problem(field))}));
    form.addEventListener('submit',async e=>{
      e.preventDefault();
      const invalid=fields.filter(field=>{const message=problem(field);showError(field,message);return message});
      if(invalid.length){setStatus(say('fix'),'error');invalid[0].focus();return}
      const button=form.querySelector('button[type="submit"]');
      button.disabled=true;
      setStatus(say('sending'));
      const payload=Object.fromEntries(new FormData(form).entries());
      payload.locale=lang;
      try{
        const response=await fetch('/api/contact',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
        const result=await response.json().catch(()=>({}));
        if(response.status===400&&result.fields){
          const rejected=Object.entries(result.fields).map(([name,code])=>{const field=form.elements[name];if(field)showError(field,code==='invalid'&&name==='email'?say('email'):field.tagName==='SELECT'?say('choose'):say('required'));return field}).filter(Boolean);
          setStatus(say('fix'),'error');rejected[0]?.focus();return;
        }
        if(response.status===429){setStatus(say('rate'),'error');return}
        if(!response.ok)throw new Error(result.error||'delivery_failed');
        form.reset();
        fields.forEach(field=>showError(field,''));
        setStatus(say('sent'),'success');
      }catch{
        setStatus(say('failed'),'error');
      }finally{button.disabled=false}
    });
  }
})();
