/* Preeti Henna Artist — progressive enhancements. Every page works without this file. */
(function () {
  'use strict';

  var PRODUCTION_HOST = 'preetihennaartist.in';
  var WHATSAPP_NUMBER = '919354621909';
  var PHONE_DISPLAY = '+91 93546 21909';

  /* 1. Keep copies on any other host (previews, forks, local servers) out of search indexes.
     Canonical links already point to the production domain; this is a second safeguard. */
  if (location.hostname !== PRODUCTION_HOST) {
    var robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }
    robots.content = 'noindex, nofollow';
  }

  /* 2. WhatsApp enquiry builder */
  function waLink(text) {
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
  }

  function formatDate(value) {
    var parts = value.split('-');
    if (parts.length !== 3) return '';
    var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  }

  function todayISO() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function buildMessage(form) {
    var get = function (name) {
      var el = form.elements[name];
      return el ? String(el.value || '').trim() : '';
    };
    var serviceEl = form.elements.service;
    var service = serviceEl.options[serviceEl.selectedIndex].text;
    var lines = ['Hello Preeti Henna Artist, I would like a quote.', ''];
    lines.push('Service: ' + service);
    var date = get('date') ? formatDate(get('date')) : '';
    lines.push('Date: ' + (date || 'not fixed yet'));
    if (get('place')) lines.push('Place: ' + get('place'));
    var people = parseInt(get('people'), 10);
    if (people > 0) lines.push('People needing mehndi: ' + people);
    if (get('coverage')) lines.push('Coverage: ' + get('coverage'));
    if (get('ideas')) lines.push('Design ideas: ' + get('ideas'));
    if (form.elements.photos && form.elements.photos.checked) lines.push('I will share reference photos in this chat.');
    if (get('name')) lines.push('Name: ' + get('name'));
    lines.push('');
    lines.push('Please let me know the price and availability.');
    return lines.join('\n');
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-enquiry]'), function (form) {
    var preview = form.querySelector('[data-preview]');
    var send = form.querySelector('[data-send]');
    var copy = form.querySelector('[data-copy]');
    var status = form.querySelector('[data-status]');
    var fallback = document.querySelector('[data-enquiry-fallback="' + form.id + '"]');

    var params = new URLSearchParams(location.search);
    var wanted = params.get('service') || form.getAttribute('data-default-service');
    if (wanted && form.elements.service.querySelector('option[value="' + wanted.replace(/[^a-z-]/g, '') + '"]')) {
      form.elements.service.value = wanted;
    }
    if (form.elements.date) form.elements.date.min = todayISO();

    function update() {
      var text = buildMessage(form);
      preview.textContent = text;
      send.href = waLink(text);
    }

    form.addEventListener('input', update);
    form.addEventListener('change', update);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      send.click();
    });

    if (copy && navigator.clipboard) {
      copy.hidden = false;
      copy.addEventListener('click', function () {
        navigator.clipboard.writeText(buildMessage(form)).then(function () {
          status.textContent = 'Message copied. Paste it into WhatsApp to ' + PHONE_DISPLAY + '.';
        }, function () {
          status.textContent = 'Copying did not work here; select the message text above instead.';
        });
      });
    }

    update();
    form.hidden = false;
    if (fallback) fallback.hidden = true;
  });

  /* 3. Gallery: style filters and lightbox */
  var gallery = document.querySelector('[data-gallery]');
  if (gallery) {
    var items = Array.prototype.slice.call(gallery.querySelectorAll('.gallery-item'));
    var filters = document.querySelector('[data-filters]');
    var count = document.querySelector('[data-gallery-count]');
    var dialog = document.querySelector('[data-lightbox]');
    var stage = dialog.querySelector('[data-lightbox-stage]');
    var caption = dialog.querySelector('[data-lightbox-caption]');
    var position = dialog.querySelector('[data-lightbox-count]');
    var current = 0;
    var opener = null;

    var visibleItems = function () {
      return items.filter(function (item) { return !item.hidden; });
    };

    var describe = function (n, label) {
      return n === items.length ? 'Showing all ' + n + ' items' : 'Showing ' + n + ' of ' + items.length + ' items: ' + label;
    };

    if (filters) {
      filters.hidden = false;
      filters.addEventListener('click', function (e) {
        var btn = e.target.closest('button[data-filter]');
        if (!btn) return;
        var value = btn.getAttribute('data-filter');
        Array.prototype.forEach.call(filters.querySelectorAll('button[data-filter]'), function (b) {
          b.setAttribute('aria-pressed', String(b === btn));
        });
        items.forEach(function (item) {
          var styles = (item.getAttribute('data-style') || '').split(' ');
          item.hidden = value !== 'all' && styles.indexOf(value) === -1;
        });
        count.textContent = describe(visibleItems().length, btn.textContent.trim());
      });
    }

    function show(index) {
      var list = visibleItems();
      if (!list.length) return;
      current = (index + list.length) % list.length;
      var item = list[current];
      var trigger = item.querySelector('.gallery-open');
      stage.textContent = '';
      var full = trigger.getAttribute('href');
      var img = trigger.querySelector('img');
      if (img) {
        var big = document.createElement('img');
        big.src = full || img.currentSrc || img.src;
        big.alt = img.alt;
        stage.appendChild(big);
      } else {
        var visual = trigger.querySelector('.placeholder');
        if (visual) stage.appendChild(visual.cloneNode(true));
      }
      var cap = item.querySelector('.gallery-caption');
      caption.textContent = cap ? cap.textContent.replace(/\s+/g, ' ').trim() : '';
      position.textContent = (current + 1) + ' of ' + list.length;
    }

    gallery.addEventListener('click', function (e) {
      var trigger = e.target.closest('.gallery-open');
      if (!trigger) return;
      e.preventDefault();
      opener = trigger;
      show(visibleItems().indexOf(trigger.closest('.gallery-item')));
      dialog.showModal();
    });

    dialog.querySelector('[data-prev]').addEventListener('click', function () { show(current - 1); });
    dialog.querySelector('[data-next]').addEventListener('click', function () { show(current + 1); });
    dialog.querySelector('[data-close]').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
    });
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', function () {
      if (opener) opener.focus();
    });
  }
})();
