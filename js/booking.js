/* ============================================
   PRASHANT CAPTURES — booking.js
   Multi-step booking flow + Formspree submission
   ============================================ */

(function () {
  const flow = document.getElementById('bookingSteps');
  if (!flow) return;

  const FORM_ENDPOINT = 'https://formspree.io/f/mzdnpaqr';
  const TOTAL_STEPS = 6;

  const steps       = Array.from(flow.querySelectorAll('.booking-step'));
  const progressLbl = document.getElementById('progressLabel');
  const progressName= document.getElementById('progressStepName');
  const progressFill= document.getElementById('progressFill');
  const progressBox = document.getElementById('bookingFlow');
  const successEl   = document.getElementById('bookingSuccess');

  const getLang = () => localStorage.getItem('lang') || 'en';

  const STEP_NAMES = {
    en: ['Choose Your Session', 'Pick a Date', 'Pick a Time', 'Choose Location', 'Your Details', 'Confirmation'],
    jp: ['セッションを選択', '日程を選択', '時間を選択', '撮影場所を選択', 'お客様情報', '確認'],
  };
  const MONTHS = {
    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    jp: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
  };
  const DOW = {
    en: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    jp: ['日','月','火','水','木','金','土'],
  };
  const WD_FULL = {
    en: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    jp: ['日','月','火','水','木','金','土'],
  };

  // ---- Booking state ----
  const state = {
    step: 1,
    service: null,   // { name, nameJp, price }
    date: null,      // Date
    time: null,      // { name, nameJp, range }
    location: null,  // { name, nameJp }
  };

  /* ============ STEP NAVIGATION ============ */
  function showStep(n) {
    state.step = n;
    steps.forEach(s => s.classList.toggle('is-active', Number(s.dataset.step) === n));
    const lang = getLang();
    progressLbl.textContent  = lang === 'en' ? `Step ${n} of ${TOTAL_STEPS}` : `ステップ ${n} / ${TOTAL_STEPS}`;
    progressName.textContent = STEP_NAMES[lang][n - 1];
    progressFill.style.width = `${(n / TOTAL_STEPS) * 100}%`;
    if (n === 6) buildSummary();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  flow.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.step === 5 && !validateDetails()) return;
      if (state.step < TOTAL_STEPS) showStep(state.step + 1);
    });
  });
  flow.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.step > 1) showStep(state.step - 1);
    });
  });

  function setNextEnabled(stepEl, enabled) {
    const nextBtn = stepEl.querySelector('[data-next]');
    if (nextBtn) nextBtn.disabled = !enabled;
  }

  /* ============ GENERIC CARD SELECTION ============ */
  function wireCardGroup(selector, onSelect) {
    const cards = flow.querySelectorAll(selector);
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('is-selected'));
        card.classList.add('is-selected');
        onSelect(card);
        setNextEnabled(card.closest('.booking-step'), true);
      });
    });
  }

  // STEP 1 — service
  wireCardGroup('.service-card', card => {
    state.service = {
      name:   card.dataset.service,
      nameJp: card.dataset.serviceJp,
      price:  card.dataset.price,
    };
  });

  // STEP 3 — time
  wireCardGroup('.time-card', card => {
    state.time = {
      name:   card.dataset.time,
      nameJp: card.dataset.timeJp,
      range:  card.dataset.range,
    };
  });

  // STEP 4 — location
  wireCardGroup('.location-card', card => {
    state.location = {
      name:   card.dataset.loc,
      nameJp: card.dataset.locJp,
    };
  });

  /* ============ STEP 2 — CALENDAR ============ */
  const calMonthEl = document.getElementById('calMonth');
  const calDowEl   = document.getElementById('calDow');
  const calDaysEl  = document.getElementById('calDays');
  const calSelEl   = document.getElementById('calSelected');
  const calPrev    = document.getElementById('calPrev');
  const calNext    = document.getElementById('calNext');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let viewYear  = today.getFullYear();
  let viewMonth = today.getMonth();

  function isUnavailable(date) {
    const dow = date.getDay();          // 0 Sun, 1 Mon
    if (dow === 0 || dow === 1) return true;
    if (date < today) return true;
    return false;
  }

  function renderCalendar() {
    const lang = getLang();
    calMonthEl.textContent = `${MONTHS[lang][viewMonth]} ${viewYear}`;

    // Day-of-week headers
    calDowEl.innerHTML = '';
    DOW[lang].forEach(d => {
      const el = document.createElement('div');
      el.className = 'calendar-dow';
      el.textContent = d;
      calDowEl.appendChild(el);
    });

    // Days
    calDaysEl.innerHTML = '';
    const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      const blank = document.createElement('div');
      blank.className = 'calendar-day is-empty';
      calDaysEl.appendChild(blank);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewYear, viewMonth, day);
      date.setHours(0, 0, 0, 0);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'calendar-day';
      btn.textContent = day;
      if (isUnavailable(date)) {
        btn.disabled = true;
      } else {
        btn.addEventListener('click', () => {
          state.date = date;
          renderCalendar();
          updateSelectedLabel();
          setNextEnabled(steps[1], true);
        });
      }
      if (state.date && date.getTime() === state.date.getTime()) {
        btn.classList.add('is-selected');
      }
      calDaysEl.appendChild(btn);
    }

    // Prev disabled if we're at the current month
    calPrev.disabled = (viewYear === today.getFullYear() && viewMonth === today.getMonth());
  }

  function formatDate(date, lang) {
    if (!date) return '';
    if (lang === 'jp') {
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 (${WD_FULL.jp[date.getDay()]})`;
    }
    return `${WD_FULL.en[date.getDay()]}, ${MONTHS.en[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  function updateSelectedLabel() {
    const lang = getLang();
    if (!state.date) { calSelEl.textContent = ''; return; }
    const prefix = lang === 'en' ? 'Selected: ' : '選択中: ';
    calSelEl.textContent = prefix + formatDate(state.date, lang);
  }

  calPrev.addEventListener('click', () => {
    if (calPrev.disabled) return;
    viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar();
  });
  calNext.addEventListener('click', () => {
    viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar();
  });

  /* ============ STEP 5 — VALIDATION ============ */
  const nameInput  = document.getElementById('b-name');
  const emailInput = document.getElementById('b-email');

  function toggleError(input, key, show) {
    input.classList.toggle('is-invalid', show);
    const err = flow.querySelector(`[data-err="${key}"]`);
    if (err) err.classList.toggle('is-shown', show);
  }

  function validateDetails() {
    let ok = true;
    const nameOk = nameInput.value.trim().length > 0;
    toggleError(nameInput, 'name', !nameOk);
    if (!nameOk) ok = false;

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim());
    toggleError(emailInput, 'email', !emailOk);
    if (!emailOk) ok = false;

    return ok;
  }

  [nameInput, emailInput].forEach(inp => {
    inp.addEventListener('input', () => {
      if (inp.classList.contains('is-invalid')) validateDetails();
    });
  });

  /* ============ STEP 6 — SUMMARY ============ */
  function getDetails() {
    return {
      name:     document.getElementById('b-name').value.trim(),
      email:    document.getElementById('b-email').value.trim(),
      phone:    document.getElementById('b-phone').value.trim(),
      people:   document.getElementById('b-people').value.trim() || '1',
      langpref: (document.querySelector('input[name="langpref"]:checked') || {}).value || 'English',
      requests: document.getElementById('b-requests').value.trim(),
    };
  }

  function buildSummary() {
    const lang = getLang();
    const d = getDetails();
    const s = state;
    const L = lang === 'en'
      ? { service:'Service', datetime:'Date & Time', location:'Location', name:'Name', email:'Email', people:'People' }
      : { service:'サービス', datetime:'日時', location:'撮影場所', name:'お名前', email:'メール', people:'人数' };

    const serviceTxt = s.service ? `${lang === 'en' ? s.service.name : s.service.nameJp} · <strong>${s.service.price}</strong>` : '—';
    const timeTxt    = s.time ? `${lang === 'en' ? s.time.name : s.time.nameJp} (${s.time.range})` : '—';
    const dateTxt    = s.date ? formatDate(s.date, lang) : '—';
    const locTxt     = s.location ? `${s.location.name} / ${s.location.nameJp}` : '—';

    const rows = [
      [L.service,  serviceTxt],
      [L.datetime, `${dateTxt}<br>${timeTxt}`],
      [L.location, locTxt],
      [L.name,     d.name || '—'],
      [L.email,    d.email || '—'],
      [L.people,   d.people],
    ];

    document.getElementById('summaryCard').innerHTML = rows.map(([k, v]) =>
      `<div class="summary-row"><span class="summary-label">${k}</span><span class="summary-value">${v}</span></div>`
    ).join('');
  }

  /* ============ SUBMISSION ============ */
  const submitBtn = document.getElementById('submitBooking');
  const errorEl   = document.getElementById('bookingError');
  const successText = document.getElementById('successText');

  submitBtn.addEventListener('click', async () => {
    const lang = getLang();
    const d = getDetails();
    errorEl.textContent = '';

    const payload = {
      _subject: `New Booking Request — ${state.service ? state.service.name : ''} (${d.name})`,
      'Service':          state.service ? `${state.service.name} / ${state.service.nameJp}` : '',
      'Price':            state.service ? state.service.price : '',
      'Date':             state.date ? formatDate(state.date, 'en') : '',
      'Time':             state.time ? `${state.time.name} (${state.time.range})` : '',
      'Location':         state.location ? `${state.location.name} / ${state.location.nameJp}` : '',
      'Name':             d.name,
      'Email':            d.email,
      'Phone':            d.phone || '(not provided)',
      'Number of People': d.people,
      'Language Pref':    d.langpref,
      'Special Requests': d.requests || '(none)',
      email:              d.email, // Formspree reply-to
    };

    submitBtn.disabled = true;
    submitBtn.textContent = lang === 'en' ? 'Sending…' : '送信中…';

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok && json.ok !== false) {
        showSuccess(d);
      } else {
        throw new Error('Submission failed');
      }
    } catch {
      errorEl.textContent = lang === 'en'
        ? 'Something went wrong. Please try again or email me directly.'
        : 'エラーが発生しました。もう一度お試しいただくか、直接メールをお送りください。';
      submitBtn.disabled = false;
      submitBtn.textContent = lang === 'en' ? 'Send Booking Request →' : '予約リクエストを送信 →';
    }
  });

  function showSuccess(d) {
    flow.style.display = 'none';
    progressBox.style.display = 'none';
    document.querySelector('.booking-head').style.display = 'none';
    successEl.classList.add('is-active');
    updateSuccessText(d);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateSuccessText(d) {
    const lang = getLang();
    successText.dataset.name = d.name;
    successText.dataset.email = d.email;
    successText.textContent = lang === 'en'
      ? `Thank you ${d.name}! I'll reply to ${d.email} within 24 hours to confirm your session. Looking forward to shooting with you in Osaka.`
      : `${d.name}様、ありがとうございます！24時間以内に ${d.email} 宛にご返信し、セッションを確定いたします。大阪での撮影を楽しみにしています。`;
  }

  /* ============ LANGUAGE RE-RENDER ============ */
  function refreshDynamic() {
    // main.js already swapped [data-en] text; refresh JS-generated content
    const n = state.step;
    const lang = getLang();
    progressLbl.textContent  = lang === 'en' ? `Step ${n} of ${TOTAL_STEPS}` : `ステップ ${n} / ${TOTAL_STEPS}`;
    progressName.textContent = STEP_NAMES[lang][n - 1];
    renderCalendar();
    updateSelectedLabel();
    if (n === 6) buildSummary();
    if (successEl.classList.contains('is-active') && successText.dataset.name) {
      updateSuccessText({ name: successText.dataset.name, email: successText.dataset.email });
    }
  }
  ['langToggle', 'langFloat'].forEach(id => {
    const b = document.getElementById(id);
    if (b) b.addEventListener('click', () => setTimeout(refreshDynamic, 0));
  });

  /* ============ INIT ============ */
  renderCalendar();
  showStep(1);
})();
