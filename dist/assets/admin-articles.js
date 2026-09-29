(() => {
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const locales = [['en', 'English'], ['ru', 'Русский'], ['uz', 'O‘zbekcha']];
  const state = { list: [], media: [], current: null, lang: 'en', savedRange: null, preview: false };
  const request = async (url, options = {}) => {
    const response = await fetch(url, { credentials: 'same-origin', ...options });
    if (response.status === 401) { location.assign('/admin/login'); throw new Error('Sign in required'); }
    const data = await response.json().catch(() => ({ error: 'Unexpected server response' }));
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
  };
  const fresh = () => ({
    id: null, slug: '', status: 'draft', data: {
      date: new Date().toISOString().slice(0, 10), image: '',
      translations: Object.fromEntries(locales.map(([lang]) => [lang, { title: '', summary: '', category: '', alt: '', bodyHtml: '<p><br></p>' }])),
    },
  });
  const options = () => state.media.filter(item => item.mime.startsWith('image/')).map(item => `<option value="${esc(item.url)}">${esc(item.filename)}${item.source === 'site' ? ' · site image' : ''}</option>`).join('');
  const show = (message, error = false) => {
    const target = $('#article-message');
    if (!target) return;
    target.textContent = message;
    target.className = `article-message${error ? ' error' : ''}`;
  };
  async function load() {
    try {
      [state.list, state.media] = await Promise.all([request('/api/admin/articles'), request('/api/admin/media')]);
      renderList();
      if (state.current) renderEditor();
    } catch (error) { $('#article-list').innerHTML = `<p class="muted article-list-error">${esc(error.message)}</p>`; }
  }
  function renderList() {
    $('#article-list').innerHTML = state.list.length ? state.list.map(item => `<button type="button" data-article-id="${esc(item.id)}" class="${state.current?.id === item.id ? 'active' : ''}"><strong>${esc(item.title)}</strong><small>${esc(item.date)} · ${item.status === 'published' ? 'Published' : 'Draft'}</small></button>`).join('') : '<p class="muted article-list-error">No articles yet. Create the first draft.</p>';
    $('#article-list').querySelectorAll('[data-article-id]').forEach(button => button.addEventListener('click', () => open(button.dataset.articleId)));
  }
  async function open(id) {
    try { state.current = await request(`/api/admin/articles/${id}`); state.lang = 'en'; state.preview = false; renderList(); renderEditor(); }
    catch (error) { show(error.message, true); }
  }
  function syncEditor() {
    if (state.current && !state.preview && $('#rich-editor')) state.current.data.translations[state.lang].bodyHtml = $('#rich-editor').innerHTML;
  }
  function renderEditor() {
    const article = state.current;
    if (!article) return;
    const data = article.data;
    data.translations ??= {};
    for (const [lang] of locales) data.translations[lang] ??= { title: '', summary: '', category: '', alt: '', bodyHtml: '<p><br></p>' };
    const localized = data.translations[state.lang];
    const url = article.id ? `/en/news/${article.slug}` : '';
    $('#article-editor').innerHTML = `
      <div class="editor-head"><div><span class="pill">${article.id ? 'Article' : 'New article'}</span><h2>${esc(data.translations.en.title || 'Untitled article')}</h2><p>${article.id ? esc(article.slug) : 'Start with a title and save a draft'}</p></div><div class="editor-controls">${article.status === 'published' ? `<a class="quiet-button" href="${url}" target="_blank" rel="noopener">View article ↗</a>` : ''}<button id="article-preview-toggle" class="quiet-button" type="button">${state.preview ? 'Back to editor' : 'Preview'}</button></div></div>
      <div id="article-message" class="article-message" role="status" aria-live="polite"></div>
      <div class="article-meta-grid"><label class="field">URL slug<input id="article-slug" value="${esc(article.slug)}" ${article.id ? 'readonly' : ''} placeholder="article-title" maxlength="80"></label><label class="field">Article date<input id="article-date" type="date" value="${esc(data.date)}"></label></div>
      <div class="article-meta-grid"><label class="field">Cover image<select id="article-cover"><option value="">No cover image</option>${options()}</select></label><label class="field">Publication status<select id="article-status"><option value="draft">Draft</option><option value="published">Published</option></select></label></div><label class="article-cover-upload">＋ Upload a cover image<input id="article-cover-upload" type="file" accept="image/png,image/jpeg,image/webp,image/gif"></label>
      <div class="article-cover-preview">${data.image ? `<img src="${esc(data.image)}" alt="">` : '<span>No cover image selected</span>'}</div>
      <div class="language-tabs article-language-tabs">${locales.map(([lang, label]) => `<button type="button" data-article-lang="${lang}" class="${state.lang === lang ? 'active' : ''}">${label}</button>`).join('')}</div>
      <label class="field">Headline (${state.lang.toUpperCase()})<input id="article-title" value="${esc(localized.title)}" maxlength="180" placeholder="A clear, factual headline"></label>
      <div class="article-meta-grid"><label class="field">Category (${state.lang.toUpperCase()})<input id="article-category" value="${esc(localized.category)}" maxlength="60" placeholder="News, publication or technology note"></label><label class="field">Image description (${state.lang.toUpperCase()})<input id="article-alt" value="${esc(localized.alt)}" maxlength="240" placeholder="Describe the cover for accessibility"></label></div>
      <label class="field">Summary (${state.lang.toUpperCase()})<textarea id="article-summary" maxlength="550" placeholder="Two or three sentences for the article card and search results">${esc(localized.summary)}</textarea></label>
      <div class="article-body-head"><label id="body-label">Article body (${state.lang.toUpperCase()})</label><span>Visual editor</span></div>
      <div id="article-write" ${state.preview ? 'hidden' : ''}><div class="rich-toolbar" role="toolbar" aria-label="Article formatting"><button type="button" data-format="p" title="Paragraph">P</button><button type="button" data-format="h2" title="Heading">H2</button><button type="button" data-format="h3" title="Subheading">H3</button><span class="tool-separator"></span><button type="button" data-command="bold" title="Bold"><strong>B</strong></button><button type="button" data-command="italic" title="Italic"><em>I</em></button><button type="button" data-command="insertUnorderedList" title="Bulleted list">• List</button><button type="button" data-command="insertOrderedList" title="Numbered list">1. List</button><button type="button" data-command="formatBlock:blockquote" title="Quote">“ ”</button><span class="tool-separator"></span><button type="button" id="article-link" title="Insert link">Link</button><button type="button" id="article-inline-image" title="Insert image">Image</button><button type="button" data-command="undo" title="Undo">↶</button><button type="button" data-command="redo" title="Redo">↷</button></div><div id="rich-editor" class="rich-editor" contenteditable="true" role="textbox" aria-multiline="true" aria-labelledby="body-label" data-placeholder="Write the article here…">${localized.bodyHtml || '<p><br></p>'}</div></div>
      <div id="article-preview" class="article-preview" ${state.preview ? '' : 'hidden'}></div>
      <div class="article-editor-footer"><p>Publishing makes this article visible in News & Publications and on the homepage. Empty translations use English.</p><div class="article-footer-actions">${article.id ? '<button id="article-delete" class="danger-button" type="button">Delete</button>' : ''}<button id="article-save" class="action-button" type="button">${article.id ? 'Save article' : 'Create article'}</button></div></div>
      <dialog id="article-media-dialog" class="article-media-dialog"><div class="media-dialog-head"><div><h3>Choose an image</h3><p>Site images and uploaded files</p></div><button type="button" id="article-media-close" aria-label="Close image picker">×</button></div><div class="article-media-grid">${state.media.filter(item => item.mime.startsWith('image/')).map(item => `<button type="button" data-insert-image="${esc(item.url)}"><img src="${esc(item.url)}" alt=""><span>${esc(item.filename)}</span></button>`).join('')}</div><label class="upload-box">＋ Upload an image<input id="article-media-upload" type="file" accept="image/png,image/jpeg,image/webp,image/gif"></label></dialog>`;
    $('#article-cover').value = data.image || '';
    $('#article-status').value = article.status;
    $('#article-cover').addEventListener('change', event => { data.image = event.target.value; renderCover(); });
    $('#article-cover-upload').addEventListener('change', async event => {
      const file = event.target.files?.[0]; if (!file) return;
      const body = new FormData(); body.append('file', file);
      try {
        const uploaded = await request('/api/admin/media', { method: 'POST', body });
        state.media.unshift({ ...uploaded, source: 'upload' });
        data.image = uploaded.url;
        $('#article-cover').innerHTML = `<option value="">No cover image</option>${options()}`;
        $('#article-cover').value = uploaded.url;
        renderCover(); show(`${file.name} uploaded and selected as cover.`);
      } catch (error) { show(error.message, true); }
    });
    $('#article-date').addEventListener('input', event => { data.date = event.target.value; });
    $('#article-status').addEventListener('change', event => { article.status = event.target.value; });
    $('#article-slug').addEventListener('input', event => { article.slug = event.target.value.trim().toLowerCase(); });
    for (const [field, key] of [['title', 'title'], ['category', 'category'], ['summary', 'summary'], ['alt', 'alt']]) $('#article-' + field).addEventListener('input', event => {
      localized[key] = event.target.value;
      if (field === 'title' && state.lang === 'en' && !article.id && !$('#article-slug').dataset.touched) {
        article.slug = event.target.value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
        $('#article-slug').value = article.slug;
      }
    });
    $('#article-slug').addEventListener('change', event => { event.target.dataset.touched = 'true'; });
    $('#rich-editor')?.addEventListener('input', event => { localized.bodyHtml = event.target.innerHTML; });
    $('#rich-editor')?.addEventListener('paste', event => { event.preventDefault(); document.execCommand('insertText', false, event.clipboardData.getData('text/plain')); });
    $('#article-preview-toggle').addEventListener('click', () => { syncEditor(); state.preview = !state.preview; renderEditor(); });
    $('#article-save').addEventListener('click', save);
    $('#article-delete')?.addEventListener('click', remove);
    document.querySelectorAll('[data-article-lang]').forEach(button => button.addEventListener('click', () => { syncEditor(); state.lang = button.dataset.articleLang; state.preview = false; renderEditor(); }));
    bindToolbar();
    bindMediaDialog();
    if (state.preview) renderPreview();
  }
  function renderCover() {
    const image = state.current.data.image;
    $('.article-cover-preview').innerHTML = image ? `<img src="${esc(image)}" alt="">` : '<span>No cover image selected</span>';
  }
  function renderPreview() {
    const article = state.current, text = article.data.translations[state.lang];
    $('#article-preview').innerHTML = `<div class="preview-kicker">${esc(text.category || 'News')} · ${esc(article.data.date)}</div><h1>${esc(text.title || 'Untitled article')}</h1><p class="preview-summary">${esc(text.summary)}</p>${article.data.image ? `<img class="preview-cover" src="${esc(article.data.image)}" alt="${esc(text.alt)}">` : ''}<div class="preview-body">${text.bodyHtml || ''}</div>`;
  }
  function bindToolbar() {
    const editor = $('#rich-editor');
    if (!editor) return;
    document.querySelectorAll('.rich-toolbar button').forEach(button => button.addEventListener('mousedown', event => event.preventDefault()));
    document.querySelectorAll('[data-format]').forEach(button => button.addEventListener('click', () => { editor.focus(); document.execCommand('formatBlock', false, button.dataset.format); syncEditor(); }));
    document.querySelectorAll('[data-command]').forEach(button => button.addEventListener('click', () => {
      editor.focus();
      const command = button.dataset.command;
      if (command.startsWith('formatBlock:')) document.execCommand('formatBlock', false, command.split(':')[1]);
      else document.execCommand(command, false);
      syncEditor();
    }));
    $('#article-link').addEventListener('click', () => {
      const url = prompt('Link URL (https:// or a site path)');
      if (!url) return;
      if (!/^https?:\/\/[^\s]+$/.test(url) && !/^\/(en|ru|uz)\/[a-zA-Z0-9/_-]+$/.test(url)) { show('Use an HTTPS link or a site page path.', true); return; }
      editor.focus(); document.execCommand('createLink', false, url); syncEditor();
    });
    $('#article-inline-image').addEventListener('click', () => {
      const selection = window.getSelection();
      state.savedRange = selection.rangeCount && editor.contains(selection.anchorNode) ? selection.getRangeAt(0).cloneRange() : null;
      $('#article-media-dialog').showModal();
    });
  }
  function bindMediaDialog() {
    const dialog = $('#article-media-dialog');
    $('#article-media-close').addEventListener('click', () => dialog.close());
    dialog.querySelectorAll('[data-insert-image]').forEach(button => button.addEventListener('click', () => {
      dialog.close();
      const editor = $('#rich-editor'); editor.focus();
      if (state.savedRange) { const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(state.savedRange); }
      document.execCommand('insertHTML', false, `<figure><img src="${esc(button.dataset.insertImage)}" alt=""></figure><p><br></p>`);
      syncEditor();
    }));
    $('#article-media-upload').addEventListener('change', async event => {
      const file = event.target.files?.[0]; if (!file) return;
      const body = new FormData(); body.append('file', file);
      try {
        const uploaded = await request('/api/admin/media', { method: 'POST', body });
        state.media.unshift({ ...uploaded, source: 'upload' });
        dialog.close();
        const editor = $('#rich-editor'); editor.focus();
        if (state.savedRange) { const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(state.savedRange); }
        document.execCommand('insertHTML', false, `<figure><img src="${esc(uploaded.url)}" alt=""></figure><p><br></p>`);
        syncEditor(); show(`${file.name} uploaded and inserted.`);
      } catch (error) { show(error.message, true); }
    });
  }
  async function save() {
    syncEditor();
    const article = state.current;
    const path = article.id ? `/api/admin/articles/${article.id}` : '/api/admin/articles';
    try {
      const result = await request(path, { method: article.id ? 'PUT' : 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ slug: article.slug, status: article.status, data: article.data }) });
      await load();
      state.current = await request(`/api/admin/articles/${result.id}`);
      renderList(); renderEditor(); show(article.status === 'published' ? 'Article published and visible on the website.' : 'Draft saved.');
    } catch (error) { show(error.message, true); }
  }
  async function remove() {
    const article = state.current;
    if (!article?.id || !confirm(`Permanently delete “${article.data.translations.en.title || article.slug}”?`)) return;
    try {
      await request(`/api/admin/articles/${article.id}`, { method: 'DELETE' });
      state.current = null;
      $('#article-editor').innerHTML = '<div class="empty-state">Article deleted. Select another article or create a new one.</div>';
      await load();
    } catch (error) { show(error.message, true); }
  }
  $('#new-article').addEventListener('click', () => { state.current = fresh(); state.lang = 'en'; state.preview = false; renderList(); renderEditor(); $('#article-title').focus(); });
  document.querySelector('[data-view="articles"]').addEventListener('click', load);
})();
