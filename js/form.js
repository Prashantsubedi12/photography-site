/* ============================================
   PRASHANT CAPTURES — form.js
   Formspree async submission for contact + booking forms
   ============================================ */

document.querySelectorAll('form[data-formspree]').forEach((form) => {
  const submitBtn   = form.querySelector('[type="submit"]');
  const statusEl    = form.querySelector('.form-status');
  const originalLabel = submitBtn ? submitBtn.textContent : '';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const lang = localStorage.getItem('lang') || 'en';

    if (submitBtn) {
      submitBtn.disabled    = true;
      submitBtn.textContent = lang === 'en' ? 'Sending…' : '送信中…';
    }
    if (statusEl) {
      statusEl.textContent = '';
      statusEl.className   = 'form-status';
    }

    try {
      const res = await fetch(form.action, {
        method:  'POST',
        body:    new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        if (statusEl) {
          statusEl.textContent = lang === 'en'
            ? '✓ Sent! I\'ll reply within 24 hours.'
            : '✓ 送信しました！24時間以内にご返信します。';
          statusEl.className = 'form-status success';
        }
        form.reset();
        applyLanguage(lang);
      } else {
        throw new Error('server');
      }
    } catch {
      if (statusEl) {
        statusEl.textContent = lang === 'en'
          ? 'Something went wrong. Email me: prashant.captures.photo@gmail.com'
          : '送信に失敗しました。直接メールをお送りください: prashant.captures.photo@gmail.com';
        statusEl.className = 'form-status error';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled    = false;
        submitBtn.textContent = originalLabel;
      }
    }
  });
});
