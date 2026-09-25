(() => {
  const form = document.querySelector('#login-form');
  const error = document.querySelector('#login-error');
  const button = form.querySelector('button');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    error.hidden = true;
    button.disabled = true;
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username: form.elements.namedItem('username').value.trim(), password: form.elements.namedItem('password').value }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not sign in');
      location.replace('/admin');
    } catch (cause) {
      error.textContent = cause.message || 'Could not sign in';
      error.hidden = false;
      button.disabled = false;
      form.elements.namedItem('password').focus();
    }
  });
})();
