(()=>{
  const $=selector=>document.querySelector(selector);
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const plain=html=>{const node=document.createElement('div');node.innerHTML=html||'';return node.textContent||''};
  const state={bootstrap:null,page:null,slug:null,tab:'overview',lang:'en',media:[],settings:null};
  const api=async(path,options={})=>{
    const response=await fetch(path,{credentials:'same-origin',...options});
    if(response.status===401){location.assign('/admin/login');throw new Error('Session expired')}
    const data=await response.json().catch(()=>({error:'Unexpected server response'}));
    if(!response.ok)throw new Error(data.error||'Request failed');
    return data;
  };
  const jsonOptions=(method,body)=>({method,headers:{'content-type':'application/json'},body:JSON.stringify(body)});
  const notice=(message,error=false)=>{const box=$('#notice');box.textContent=message;box.className=`show${error?' error':''}`;clearTimeout(notice.timer);notice.timer=setTimeout(()=>box.className='',5000)};
  function switchView(name){
    document.querySelectorAll('.sidebar nav button').forEach(button=>button.classList.toggle('active',button.dataset.view===name));
    document.querySelectorAll('.view').forEach(view=>view.classList.toggle('active',view.id===`view-${name}`));
    $('#view-title').textContent={pages:'Pages',navigation:'Navigation & contact',media:'Media library',submissions:'Contact enquiries'}[name];
    if(name==='media')loadMedia();if(name==='submissions')loadSubmissions();
  }
  document.querySelectorAll('.sidebar nav button').forEach(button=>button.addEventListener('click',()=>switchView(button.dataset.view)));
  async function loadBootstrap(){
    const data=await api('/api/admin/bootstrap');state.bootstrap=data;state.settings=structuredClone(data.settings);
    $('#mail-status').textContent=data.emailConfigured?'Automatic mail configured':'Mail delivery needs setup';
    renderPageList();renderSettings();
  }
  function renderPageList(){
    $('#page-list').innerHTML=state.bootstrap.pages.map(page=>`<button data-slug="${esc(page.slug)}" class="${page.slug===state.slug?'active':''}"><strong>${esc(page.title)}</strong><small>${esc(page.slug)} · ${page.status==='draft'?'Draft':'Published'}</small></button>`).join('');
    $('#page-list').querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>openPage(button.dataset.slug)));
  }
  function blankData(){return{translations:Object.fromEntries(['en','ru','uz'].map(lang=>[lang,{title:'',description:'',ogTitle:'',ogDescription:'',ogImage:''}])),fields:{},images:{},hiddenSections:[],blocks:[]}}
  async function openPage(slug){
    try{const page=await api(`/api/admin/page/${encodeURIComponent(slug)}`);state.page={...page,page:page.page||blankData()};state.slug=slug;state.tab='overview';state.lang='en';renderPageList();renderEditor()}
    catch(error){notice(error.message,true)}
  }
  const tabLabels={overview:'Page & SEO',copy:'Page text',images:'Images & alt text',sections:'Sections'};
  function renderEditor(){
    const page=state.page;if(!page)return;
    const title=page.page.translations?.en?.title||page.manifest?.title||page.slug;
    $('#page-editor').innerHTML=`<div class="editor-head"><div><span class="pill">${page.builtin?'Existing page':'Custom page'}</span><h2>${esc(title)}</h2><p>/${esc(page.slug)} · Edit all three language versions</p></div><div class="editor-controls"><a class="quiet-button" href="/en/${page.slug==='index.html'?'':esc(page.slug)}" target="_blank" rel="noopener">Preview ↗</a></div></div><div class="tabbar">${Object.entries(tabLabels).map(([key,label])=>`<button data-tab="${key}" class="${key===state.tab?'active':''}">${label}</button>`).join('')}</div><div id="editor-body"></div><div class="top-actions"><button id="delete-page" class="danger-button">${page.builtin?'Unpublish page':'Delete page'}</button><button id="save-page" class="action-button">Save changes</button></div>`;
    $('#page-editor').querySelectorAll('[data-tab]').forEach(button=>button.addEventListener('click',()=>{state.tab=button.dataset.tab;renderEditor()}));
    $('#save-page').addEventListener('click',savePage);
    $('#delete-page').addEventListener('click',deletePage);
    renderEditorBody();
  }
  function languageTabs(){return `<div class="language-tabs">${[['en','English'],['ru','Русский'],['uz','O‘zbekcha']].map(([code,label])=>`<button data-locale="${code}" class="${code===state.lang?'active':''}">${label}</button>`).join('')}</div>`}
  function bindLanguageTabs(){document.querySelectorAll('#editor-body [data-locale]').forEach(button=>button.addEventListener('click',()=>{state.lang=button.dataset.locale;renderEditorBody()}))}
  function renderEditorBody(){
    const container=$('#editor-body'),page=state.page,lang=state.lang,data=page.page;
    if(state.tab==='overview'){
      const defaults=page.manifest||{};const meta=data.translations?.[lang]||{};
      const title=meta.title||defaults.titles?.[lang]||defaults.title||'';
      const description=meta.description||defaults.description||'';
      container.innerHTML=`${languageTabs()}<p class="help">Titles and descriptions are shown in search results. Open Graph text is used when a page is shared.</p><label class="field">Page title<input data-meta="title" value="${esc(title)}" maxlength="180"></label><label class="field">Meta description<textarea data-meta="description" maxlength="400">${esc(description)}</textarea></label><div class="two-col"><label class="field">Open Graph title<input data-meta="ogTitle" value="${esc(meta.ogTitle||title)}" maxlength="180"></label><label class="field">Open Graph description<textarea data-meta="ogDescription" maxlength="400">${esc(meta.ogDescription||description)}</textarea></label></div><label class="field">Open Graph image<select data-meta="ogImage"><option value="">Default image</option>${state.media.filter(item=>item.mime.startsWith('image/')).map(item=>`<option value="/media/${esc(item.id)}">${esc(item.filename)}</option>`).join('')}</select></label><label class="field">URL / Slug<input id="page-slug" value="${esc(page.slug)}" ${page.builtin?'readonly':''} aria-label="Page URL"></label><div class="status-row"><strong>Publication</strong><select id="page-status" class="small-select"><option value="published" ${page.status==='published'?'selected':''}>Published</option><option value="draft" ${page.status==='draft'?'selected':''}>Draft</option></select></div>`;
      container.querySelector('[data-meta="ogImage"]').value=meta.ogImage||'';
      container.querySelectorAll('[data-meta]').forEach(input=>input.addEventListener('input',()=>{data.translations[lang]??={};data.translations[lang][input.dataset.meta]=input.value}));
      $('#page-slug').addEventListener('input',event=>page.newSlug=event.target.value.trim().toLowerCase());
      $('#page-status').addEventListener('change',event=>page.status=event.target.value);
      bindLanguageTabs();return;
    }
    if(state.tab==='copy'){
      if(!page.manifest){container.innerHTML='<p class="help">Add sections in the Sections tab. Their text is managed there.</p>';return}
      const query=`<div class="search-row"><input id="field-search" placeholder="Search text on this page" aria-label="Search page text"></div>`;
      const groups=new Map();for(const field of page.manifest.fields){const name=field.section||'Page';if(!groups.has(name))groups.set(name,[]);groups.get(name).push(field)}
      container.innerHTML=languageTabs()+`<p class="help">Edit the wording directly. Formatting is handled by the website; no HTML is needed.</p>${query}<div id="copy-groups">${[...groups].map(([name,fields])=>`<details class="section-group"><summary>${esc(name)} · ${fields.length} text fields</summary><div class="group-content">${fields.map(field=>{const value=data.fields?.[field.id]?.[lang]??plain(field[lang]||field.en);return `<div class="copy-field" data-search="${esc((plain(field.en)+' '+field.section).toLowerCase())}"><small>${esc(plain(field.en).slice(0,100)||field.key||'Text')}</small><label class="field">${lang.toUpperCase()} text<textarea data-field="${field.id}">${esc(value)}</textarea></label></div>`}).join('')}</div></details>`).join('')}</div>`;
      container.querySelectorAll('[data-field]').forEach(input=>input.addEventListener('input',()=>{data.fields[input.dataset.field]??={};data.fields[input.dataset.field][lang]=input.value}));
      $('#field-search').addEventListener('input',event=>{const q=event.target.value.toLowerCase();container.querySelectorAll('.copy-field').forEach(row=>{row.hidden=!row.dataset.search.includes(q)});container.querySelectorAll('.section-group').forEach(group=>group.open=!!q)});
      bindLanguageTabs();return;
    }
    if(state.tab==='images'){
      if(!page.manifest){container.innerHTML='<p class="help">Add images to custom sections in the Sections tab.</p>';return}
      const mediaOptions=state.media.filter(item=>item.mime.startsWith('image/')).map(item=>`<option value="/media/${esc(item.id)}">${esc(item.filename)}</option>`).join('');
      container.innerHTML=languageTabs()+`<p class="help">Choose an uploaded image and describe it for the selected language. Upload new images in the Media library.</p>${page.manifest.images.map(image=>{const override=data.images?.[image.id]||{};const src=override.src||'/'+image.src;const alt=override.alt?.[lang]||image.alt||'';return `<div class="image-slot"><img src="${esc(src)}" alt=""><div><small class="muted">${esc(image.section)} · image ${Number(image.id)+1}</small><label class="field">Image<select data-image="${image.id}"><option value="">Original image</option>${mediaOptions}</select></label><label class="field">Alt text (${lang.toUpperCase()})<input data-alt="${image.id}" value="${esc(alt)}"></label></div></div>`}).join('')}`;
      container.querySelectorAll('[data-image]').forEach(select=>{select.value=data.images?.[select.dataset.image]?.src||'';select.addEventListener('change',()=>{data.images[select.dataset.image]??={alt:{}};data.images[select.dataset.image].src=select.value;select.closest('.image-slot').querySelector('img').src=select.value||'/'+page.manifest.images[Number(select.dataset.image)].src})});
      container.querySelectorAll('[data-alt]').forEach(input=>input.addEventListener('input',()=>{data.images[input.dataset.alt]??={src:'',alt:{}};data.images[input.dataset.alt].alt??={};data.images[input.dataset.alt].alt[lang]=input.value}));
      bindLanguageTabs();return;
    }
    if(state.tab==='sections'){
      const base=page.manifest?.sections||[];
      container.innerHTML=`${languageTabs()}<p class="help">Existing sections can be shown or hidden. New sections can be added, edited and removed without writing HTML.</p>${base.length?`<h3>Existing sections</h3>${base.map(item=>`<label class="toggle-row"><span>${esc(item.title)}</span><input type="checkbox" data-section="${item.id}" ${data.hiddenSections.includes(item.id)?'':'checked'}></label>`).join('')}`:''}<div class="section-line"><h3>Added sections</h3><button id="add-block" class="quiet-button">＋ Add section</button></div><div id="block-list">${data.blocks.map((block,index)=>`<article class="block-card" data-block="${index}"><div class="section-line"><h4>Section ${index+1}</h4><button data-remove-block="${index}" class="danger-button">Remove</button></div><label class="field">Heading (${lang.toUpperCase()})<input data-block-field="title" data-index="${index}" value="${esc(block.title?.[lang]||'')}"></label><label class="field">Body (${lang.toUpperCase()})<textarea data-block-field="body" data-index="${index}">${esc(block.body?.[lang]||'')}</textarea></label><label class="field">Image<select data-block-field="image" data-index="${index}"><option value="">No image</option>${state.media.filter(item=>item.mime.startsWith('image/')).map(item=>`<option value="/media/${esc(item.id)}">${esc(item.filename)}</option>`).join('')}</select></label><label class="field">Image alt text (${lang.toUpperCase()})<input data-block-field="alt" data-index="${index}" value="${esc(block.alt?.[lang]||'')}"></label></article>`).join('')}</div>`;
      container.querySelectorAll('[data-section]').forEach(input=>input.addEventListener('change',()=>{data.hiddenSections=input.checked?data.hiddenSections.filter(id=>id!==input.dataset.section):[...new Set([...data.hiddenSections,input.dataset.section])]}));
      container.querySelectorAll('[data-block-field]').forEach(input=>{const block=data.blocks[Number(input.dataset.index)];if(input.dataset.blockField==='image')input.value=block.image||'';input.addEventListener('input',()=>{const key=input.dataset.blockField;if(key==='image')block.image=input.value;else{block[key]??={};block[key][lang]=input.value}})});
      container.querySelectorAll('[data-remove-block]').forEach(button=>button.addEventListener('click',()=>{if(confirm('Remove this section?')){data.blocks.splice(Number(button.dataset.removeBlock),1);renderEditorBody()}}));
      $('#add-block').addEventListener('click',()=>{data.blocks.push({id:crypto.randomUUID(),title:{en:'',ru:'',uz:''},body:{en:'',ru:'',uz:''},image:'',alt:{en:'',ru:'',uz:''}});renderEditorBody()});
      bindLanguageTabs();return;
    }
  }
  async function savePage(){
    try{const result=await api(`/api/admin/page/${encodeURIComponent(state.slug)}`,jsonOptions('PUT',{data:state.page.page,status:state.page.status,newSlug:state.page.newSlug||state.slug}));notice('Page saved. Published content is live.');state.page.status=result.status;state.slug=result.slug;await loadBootstrap();await openPage(result.slug)}
    catch(error){notice(error.message,true)}
  }
  async function deletePage(){
    if(state.slug==='index.html'){notice('The homepage cannot be deleted.',true);return}
    if(!confirm(state.page.builtin?'Unpublish this page?':'Permanently delete this page?'))return;
    try{await api(`/api/admin/page/${encodeURIComponent(state.slug)}`,{method:'DELETE'});notice(state.page.builtin?'Page unpublished.':'Page deleted.');state.page=null;state.slug=null;$('#page-editor').innerHTML='<div class="empty-state">Select a page to edit.</div>';await loadBootstrap()}
    catch(error){notice(error.message,true)}
  }
  $('#new-page').addEventListener('click',async()=>{
    const name=prompt('New page URL slug (letters, numbers and hyphens), e.g. company-updates');
    if(!name)return;const slug=`${name.trim().toLowerCase().replace(/\.html$/,'')}.html`;
    if(!/^[a-z0-9][a-z0-9-]{0,59}\.html$/.test(slug)){notice('Use only letters, numbers and hyphens.',true);return}
    if(state.bootstrap.pages.some(page=>page.slug===slug)){notice('This page already exists.',true);return}
    const data=blankData();data.translations.en.title=name.trim().replace(/-/g,' ');
    try{await api(`/api/admin/page/${slug}`,jsonOptions('PUT',{data,status:'draft'}));await loadBootstrap();await openPage(slug);notice('Draft page created. Add sections and publish when ready.')}
    catch(error){notice(error.message,true)}
  });
  function renderSettings(){
    $('#contact-email').value=state.settings.contactEmail;
    $('#google-verification').value=state.settings.googleVerification||'';
    $('#bing-verification').value=state.settings.bingVerification||'';
    $('#yandex-verification').value=state.settings.yandexVerification||'';
    $('#nav-rows').innerHTML=state.settings.nav.map((item,index)=>`<div class="nav-row" data-nav="${index}"><div class="three-col"><label class="field">English<input data-nav-key="en" value="${esc(item.en)}"></label><label class="field">Русский<input data-nav-key="ru" value="${esc(item.ru)}"></label><label class="field">O‘zbekcha<input data-nav-key="uz" value="${esc(item.uz)}"></label></div><div class="two-col"><label class="field">Page<select data-nav-key="href">${state.bootstrap.pages.map(page=>`<option value="${esc(page.slug)}" ${page.slug===item.href?'selected':''}>${esc(page.slug)}</option>`).join('')}</select></label><div><button class="danger-button" data-remove-nav="${index}">Remove</button></div></div></div>`).join('');
    $('#nav-rows').querySelectorAll('[data-nav-key]').forEach(input=>input.addEventListener('input',()=>{const index=Number(input.closest('[data-nav]').dataset.nav);state.settings.nav[index][input.dataset.navKey]=input.value}));
    $('#nav-rows').querySelectorAll('[data-remove-nav]').forEach(button=>button.addEventListener('click',()=>{state.settings.nav.splice(Number(button.dataset.removeNav),1);renderSettings()}));
  }
  $('#add-nav').addEventListener('click',()=>{state.settings.nav.push({en:'New item',ru:'Новый пункт',uz:'Yangi band',href:'index.html'});renderSettings()});
  $('#save-settings').addEventListener('click',async()=>{state.settings.contactEmail=$('#contact-email').value.trim();state.settings.googleVerification=$('#google-verification').value.trim();state.settings.bingVerification=$('#bing-verification').value.trim();state.settings.yandexVerification=$('#yandex-verification').value.trim();try{const result=await api('/api/admin/settings',jsonOptions('PUT',state.settings));state.settings=result.settings;notice('Navigation, contact and search settings saved.')}catch(error){notice(error.message,true)}});
  async function loadMedia(){
    try{state.media=await api('/api/admin/media');renderMedia();if(state.page&&state.tab==='images')renderEditorBody()}
    catch(error){notice(error.message,true)}
  }
  function renderMedia(){
    $('#media-grid').innerHTML=state.media.length?state.media.map(item=>`<div class="media-card">${item.mime.startsWith('image/')?`<img src="/media/${esc(item.id)}" alt="${esc(item.filename)}">`:'<div class="empty-state" style="min-height:125px">PDF</div>'}<strong title="${esc(item.filename)}">${esc(item.filename)}</strong><small>${Math.ceil(item.bytes/1024)} KB · ${esc(item.uploaded_at?.slice(0,10)||'')}</small><button class="danger-button" data-delete-media="${esc(item.id)}">Delete</button></div>`).join(''):'<p class="muted">No uploaded files yet.</p>';
    $('#media-grid').querySelectorAll('[data-delete-media]').forEach(button=>button.addEventListener('click',async()=>{if(!confirm('Delete this file from the library?'))return;try{await api(`/api/admin/media/${button.dataset.deleteMedia}`,{method:'DELETE'});await loadMedia();notice('File deleted.')}catch(error){notice(error.message,true)}}));
  }
  $('#media-file').addEventListener('change',async event=>{const file=event.target.files?.[0];if(!file)return;const data=new FormData();data.append('file',file);try{const result=await api('/api/admin/media',{method:'POST',body:data});await loadMedia();notice(`${result.filename} uploaded.`)}catch(error){notice(error.message,true)}event.target.value=''});
  async function loadSubmissions(){
    try{const rows=await api('/api/admin/submissions');$('#submission-list').innerHTML=rows.length?rows.map(item=>`<details class="submission"><summary><span>${esc(item.name)} · ${esc(item.organization)}</span><span class="status-${item.delivery_status==='sent'?'sent':'failed'}">${esc(item.delivery_status)} · ${esc(item.created_at.slice(0,16).replace('T',' '))}</span></summary><dl><dt>Email</dt><dd><a href="mailto:${esc(item.email)}">${esc(item.email)}</a></dd><dt>Phone</dt><dd>${esc(item.phone||'—')}</dd><dt>Interest</dt><dd>${esc(item.interest)}</dd><dt>Message</dt><dd>${esc(item.message)}</dd><dt>Language</dt><dd>${esc(item.locale.toUpperCase())}</dd></dl>${item.delivery_status==='sent'?'':`<button class="quiet-button" data-retry="${esc(item.id)}">Retry email delivery</button>`}</details>`).join(''):'<p class="muted">No enquiries yet.</p>';$('#submission-list').querySelectorAll('[data-retry]').forEach(button=>button.addEventListener('click',async()=>{try{await api(`/api/admin/submissions/${button.dataset.retry}/retry`,{method:'POST'});notice('Email sent.');await loadSubmissions()}catch(error){notice(error.message,true)}}))}
    catch(error){notice(error.message,true)}
  }
  $('#refresh-submissions').addEventListener('click',loadSubmissions);
  $('#sign-out').addEventListener('click',async()=>{try{await fetch('/api/admin/logout',{method:'POST',credentials:'same-origin'})}finally{location.assign('/admin/login')}});
  loadBootstrap().then(loadMedia).catch(error=>notice(`Unable to load the content studio: ${error.message}`,true));
})();
