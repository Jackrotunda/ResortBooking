(function () {
  var form = document.getElementById('bookingForm');
  var checkin = document.getElementById('checkin');
  var checkout = document.getElementById('checkout');
  var modal = document.getElementById('successModal');

  function iso(d) { return d.toISOString().slice(0, 10); }
  function addDays(str, n) {
    var d = new Date(str + 'T00:00:00');
    d.setDate(d.getDate() + n);
    return iso(d);
  }
  var today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  var todayStr = iso(today);
  checkin.min = todayStr;
  checkout.min = addDays(todayStr, 1);
  checkin.addEventListener('change', function () {
    if (!checkin.value) return;
    var minOut = addDays(checkin.value, 1);
    checkout.min = minOut;
    if (!checkout.value || checkout.value < minOut) checkout.value = minOut;
  });
  document.querySelectorAll('[data-room]').forEach(function (a) {
    a.addEventListener('click', function () {
      document.getElementById('room').value = a.dataset.room;
    });
  });

  function setError(id, msg) {
    var input = document.getElementById(id);
    document.getElementById(id + '-err').textContent = msg;
    input.closest('.field').classList.toggle('invalid', !!msg);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  }

  function validate() {
    var v = function (id) { return document.getElementById(id).value.trim(); };
    var ok = true, first = null;
    function check(id, msg) { if (!setError(id, msg)) { ok = false; if (!first) first = id; } }

    check('name', v('name') ? '' : 'Enter your full name.');
    check('email', !v('email') ? 'Enter your email address.' :
      (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email')) ? '' : 'Enter a valid email, like name@example.com.'));
    check('phone', !v('phone') ? 'Enter your phone number.' :
      (/^[+\d][\d\s\-()]{6,}$/.test(v('phone')) ? '' : 'Enter a valid phone number.'));
    check('checkin', !v('checkin') ? 'Choose a check-in date.' :
      (v('checkin') < todayStr ? 'Check-in cannot be in the past.' : ''));
    check('checkout', !v('checkout') ? 'Choose a check-out date.' :
      (v('checkin') && v('checkout') < addDays(v('checkin'), 1) ? 'Check-out must be at least one day after check-in.' : ''));
    check('room', v('room') ? '' : 'Choose a room.');

    if (first) document.getElementById(first).focus();
    return ok;
  }
  form.querySelectorAll('input,select').forEach(function (el) {
    el.addEventListener('input', function () { if (el.id) setError(el.id, ''); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;
    var btn = form.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'Sending...';
    var data = new FormData(form);
    fetch(form.action, { method: 'POST', body: data })
      .catch(function () {})
      .then(function () {
        document.getElementById('modalMsg').textContent =
          'Thanks, ' + data.get('name').split(' ')[0] + '. We will email ' + data.get('email') +
          ' to confirm the ' + data.get('room') + ' from ' + data.get('checkin') + ' to ' + data.get('checkout') + '.';
        modal.hidden = false;
        document.getElementById('closeModal').focus();
        form.reset();
        checkout.min = addDays(todayStr, 1);
        btn.disabled = false; btn.textContent = 'Check Availability';
      });
  });

  function close() { modal.hidden = true; }
  document.getElementById('closeModal').addEventListener('click', close);
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
})();
