/* ============================================
   PRASHANT CAPTURES — booking.js
   6-step booking flow embedded in contact.html
   Submits via Formspree (same endpoint as the
   previous contact form) to prashant.captures.photo@gmail.com
   ============================================ */

(function () {
  const flow = document.getElementById('bookingSteps');
  if (!flow) return;

  const FORM_ENDPOINT = 'https://formspree.io/f/mzdnpaqr';
  const TOTAL_STEPS = 6;

  const steps        = Array.from(flow.querySelectorAll('.booking-step'));
  const progressLbl  = document.getElementById('progressLabel');
  const progressName = document.getElementById('progressStepName');
  const progressFill = document.getElementById('progressFill');
  const progressBox  = document.querySelector('.booking-flow .booking-progress');
  const successEl    = document.getElementById('bookingSuccess');

  const getLang = () => localStorage.getItem('lang') || 'en';

  const STEP_NAMES = {
    en: ['Choose Your Session', 'Pick a Date', 'Pick a Time', 'Where shall we shoot?', 'A little about you', 'Review Your Booking'],
    jp: ['セッションを選択', '日程を選択', '時間帯を選択', '撮影場所を選択', 'お客様情報', '予約内容の確認'],
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
  const TBD = { en: 'To be discussed', jp: '後ほど相談' };

  // ---- Booking state ----
  const state = {
    step: 1,
    service: null,   // { name, nameJp, price }
    date: null,      // Date | null
    time: null,      // { name, nameJp, range } | null
    timeCustom: '',
    location: null,  // { name, nameJp } | null
    locationCustom: '',
  };

  const ftTime = document.getElementById('ft-time');
  const ftLoc  = document.getElementById('ft-location');

  /* ============ STEP NAVIGATION ============ */
  function showStep(n) {
    state.step = n;
    steps.forEach(s => s.classList.toggle('is-active', Number(s.dataset.step) === n));
    const lang = getLang();
    progressLbl.textContent  = lang === 'en' ? `Step ${n} of ${TOTAL_STEPS}` : `ステップ ${n} / ${TOTAL_STEPS}`;
    progressName.textContent = STEP_NAMES[lang][n - 1];
    progressFill.style.width = `${(n / TOTAL_STEPS) * 100}%`;
    if (n === 6) buildSummary();
  }

  function showError(key, show) {
    const el = flow.querySelector(`.flow-error[data-err="${key}"]`);
    if (el) el.classList.toggle('is-shown', show);
  }

  flow.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!validateStep(state.step)) return;
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

  /* ============ VALIDATION ============ */
  function validateStep(step) {
    switch (step) {
      case 1:
        return !!state.service; // Next is gated/disabled, always true when reachable
      case 2:
        return !!state.date;
      case 3: {
        const ok = !!state.time || ftTime.value.trim().length > 0;
        showError('time', !ok);
        return ok;
      }
      case 4: {
        const ok = !!state.location || ftLoc.value.trim().length > 0;
        showError('location', !ok);
        return ok;
      }
      case 5:
        return validateDetails();
      default:
        return true;
    }
  }

  /* ============ GENERIC CARD SELECTION ============ */
  function wireCardGroup(selector, onSelect) {
    const cards = flow.querySelectorAll(selector);
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('is-selected'));
        card.classList.add('is-selected');
        onSelect(card);
      });
    });
  }

  // STEP 1 — service (gates the Next button)
  wireCardGroup('.service-card', card => {
    state.service = { name: card.dataset.service, nameJp: card.dataset.serviceJp, price: card.dataset.price };
    setNextEnabled(steps[0], true);
    showError('service', false);
  });

  // STEP 3 — time
  wireCardGroup('.time-card', card => {
    state.time = { name: card.dataset.time, nameJp: card.dataset.timeJp, range: card.dataset.range };
    showError('time', false);
  });
  ftTime.addEventListener('input', () => { if (ftTime.value.trim()) showError('time', false); });

  // STEP 4 — location
  wireCardGroup('.location-card', card => {
    state.location = { name: card.dataset.loc, nameJp: card.dataset.locJp };
    showError('location', false);
  });
  ftLoc.addEventListener('input', () => { if (ftLoc.value.trim()) showError('location', false); });

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
    const dow = date.getDay();      // 0 Sun, 1 Mon
    if (dow === 0 || dow === 1) return true;
    if (date < today) return true;
    return false;
  }

  function renderCalendar() {
    const lang = getLang();
    calMonthEl.textContent = `${MONTHS[lang][viewMonth]} ${viewYear}`;

    calDowEl.innerHTML = '';
    DOW[lang].forEach(d => {
      const el = document.createElement('div');
      el.className = 'calendar-dow';
      el.textContent = d;
      calDowEl.appendChild(el);
    });

    calDaysEl.innerHTML = '';
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
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

  /* ============ STEP 5 — DETAILS VALIDATION ============ */
  const nameInput   = document.getElementById('b-name');
  const emailInput  = document.getElementById('b-email');
  const peopleInput = document.getElementById('b-people');

  function toggleFieldError(input, key, show) {
    input.classList.toggle('is-invalid', show);
    const err = flow.querySelector(`.field-error[data-err="${key}"]`);
    if (err) err.classList.toggle('is-shown', show);
  }

  function validateDetails() {
    let ok = true;
    const nameOk = nameInput.value.trim().length > 0;
    toggleFieldError(nameInput, 'name', !nameOk);
    if (!nameOk) ok = false;

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim());
    toggleFieldError(emailInput, 'email', !emailOk);
    if (!emailOk) ok = false;

    const peopleOk = parseInt(peopleInput.value, 10) >= 1;
    toggleFieldError(peopleInput, 'people', !peopleOk);
    if (!peopleOk) ok = false;

    return ok;
  }

  [nameInput, emailInput, peopleInput].forEach(inp => {
    inp.addEventListener('input', () => {
      if (inp.classList.contains('is-invalid')) validateDetails();
    });
  });

  /* ============ DERIVED VALUES ============ */
  function getDetails() {
    return {
      name:     nameInput.value.trim(),
      email:    emailInput.value.trim(),
      phone:    document.getElementById('b-phone').value.trim(),
      people:   peopleInput.value.trim() || '1',
      langpref: (document.querySelector('input[name="langpref"]:checked') || {}).value || 'English',
      requests: document.getElementById('b-requests').value.trim(),
    };
  }

  function timeText(lang) {
    if (state.time) return `${lang === 'en' ? state.time.name : state.time.nameJp} (${state.time.range})`;
    if (ftTime.value.trim()) return ftTime.value.trim();
    return TBD[lang];
  }
  function locationText(lang) {
    if (state.location) return `${state.location.name} / ${state.location.nameJp}`;
    if (ftLoc.value.trim()) return ftLoc.value.trim();
    return TBD[lang];
  }
  function dateText(lang) {
    return state.date ? formatDate(state.date, lang) : TBD[lang];
  }

  /* ============ STEP 6 — SUMMARY ============ */
  function buildSummary() {
    const lang = getLang();
    const d = getDetails();
    const L = lang === 'en'
      ? { service:'Session', date:'Date', time:'Time', location:'Location', name:'Name', email:'Email', people:'People', langpref:'Language', requests:'Requests' }
      : { service:'セッション', date:'日程', time:'時間', location:'撮影場所', name:'お名前', email:'メール', people:'人数', langpref:'言語', requests:'ご要望' };

    const serviceTxt = state.service ? `${lang === 'en' ? state.service.name : state.service.nameJp} · <strong>${state.service.price}</strong>` : '—';
    const langTxt = d.langpref === '日本語' ? '日本語' : (lang === 'en' ? 'English' : '英語');

    const rows = [
      [L.service,  serviceTxt],
      [L.date,     dateText(lang)],
      [L.time,     timeText(lang)],
      [L.location, locationText(lang)],
      [L.name,     d.name || '—'],
      [L.email,    d.email || '—'],
      [L.people,   d.people],
      [L.langpref, langTxt],
    ];
    if (d.requests) rows.push([L.requests, d.requests]);

    document.getElementById('summaryCard').innerHTML = rows.map(([k, v]) =>
      `<div class="summary-row"><span class="summary-label">${k}</span><span class="summary-value">${v}</span></div>`
    ).join('');
  }

  /* ============ SUBMISSION ============ */
  const submitBtn   = document.getElementById('submitBooking');
  const errorEl     = document.getElementById('bookingError');
  const successText = document.getElementById('successText');

  submitBtn.addEventListener('click', async () => {
    const lang = getLang();
    const d = getDetails();
    errorEl.classList.remove('is-shown');
    errorEl.textContent = '';

    const payload = {
      _subject: `New Booking Request — ${state.service ? state.service.name : ''} (${d.name})`,
      'Session':          state.service ? `${state.service.name} — ${state.service.price}` : '',
      'Date':             dateText('en'),
      'Time':             state.time ? `${state.time.name} (${state.time.range})` : (ftTime.value.trim() || TBD.en),
      'Location':         state.location ? `${state.location.name} / ${state.location.nameJp}` : (ftLoc.value.trim() || TBD.en),
      'Name':             d.name,
      'Email':            d.email,
      'Phone':            d.phone || 'Not provided',
      'People':           d.people,
      'Language':         d.langpref === '日本語' ? 'Japanese' : 'English',
      'Special Requests': d.requests || 'None',
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
      errorEl.classList.add('is-shown');
      submitBtn.disabled = false;
      submitBtn.textContent = lang === 'en' ? 'Send Booking Request →' : '予約リクエストを送信 →';
    }
  });

  function showSuccess(d) {
    flow.style.display = 'none';
    if (progressBox) progressBox.style.display = 'none';
    successEl.classList.add('is-active');
    successText.dataset.name = d.name;
    successText.dataset.email = d.email;
    updateSuccessText();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateSuccessText() {
    if (!successText.dataset.name) return;
    const lang = getLang();
    const name = successText.dataset.name;
    const email = successText.dataset.email;
    successText.textContent = lang === 'en'
      ? `Thank you ${name}! I'll reply to ${email} within 24 hours to confirm your session.`
      : `${name} 様、ありがとうございます！${email} 宛に24時間以内にご連絡いたします。`;
  }

  /* ============ LANGUAGE RE-RENDER ============ */
  function refreshDynamic() {
    const n = state.step;
    const lang = getLang();
    progressLbl.textContent  = lang === 'en' ? `Step ${n} of ${TOTAL_STEPS}` : `ステップ ${n} / ${TOTAL_STEPS}`;
    progressName.textContent = STEP_NAMES[lang][n - 1];
    renderCalendar();
    updateSelectedLabel();
    if (n === 6) buildSummary();
    if (successEl.classList.contains('is-active')) updateSuccessText();
  }
  ['langToggle', 'langFloat'].forEach(id => {
    const b = document.getElementById(id);
    if (b) b.addEventListener('click', () => setTimeout(refreshDynamic, 0));
  });

  /* ============ INIT ============ */
  renderCalendar();
  showStep(1);
})();
