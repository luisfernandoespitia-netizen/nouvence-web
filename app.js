document.getElementById('year').textContent = new Date().getFullYear();

const CFG = window.NOUVELLE_WEB_CONFIG || {};
let db = null;

function setText(id, value) {
  const el = document.getElementById(id);
  if (el && value !== null && value !== undefined && String(value).trim() !== '') {
    el.textContent = value;
  }
}

function setLink(id, label, url) {
  const el = document.getElementById(id);
  if (!el) return;
  if (label && String(label).trim()) el.textContent = label;
  if (url && String(url).trim()) el.href = url;
}

function applyImage(slot, url) {
  if (!slot || !url || !String(url).trim()) return;
  slot.style.backgroundImage =
    `linear-gradient(rgba(28,26,24,.05),rgba(28,26,24,.05)), url("${String(url).replace(/"/g, '%22')}")`;
  slot.style.backgroundSize = 'cover';
  slot.style.backgroundPosition = 'center';
  slot.querySelectorAll('span,small').forEach(el => el.style.display = 'none');
}

function renderEditorialTitle(text) {
  const el = document.getElementById('editorialTitle');
  if (!el || !text || !String(text).trim()) return;
  const t = String(text).trim();
  const idx = t.indexOf('.');
  if (idx > 0 && idx < t.length - 1) {
    el.innerHTML = `${t.slice(0, idx + 1)}<br>${t.slice(idx + 1).trim()}`;
  } else {
    el.textContent = t;
  }
}

function renderHeroTitle(text) {
  const el = document.getElementById('heroTitle');
  if (!el || !text || !String(text).trim()) return;
  const t = String(text).trim();
  const comma = t.indexOf(',');
  if (comma > 0 && comma < t.length - 1) {
    el.innerHTML = `${t.slice(0, comma + 1)}<br><em>${t.slice(comma + 1).trim()}</em>`;
  } else {
    el.textContent = t;
  }
}

function applySettings(s) {
  if (!s) return;

  setText('heroEyebrow', s.hero_eyebrow);
  renderHeroTitle(s.hero_title);
  setText('heroBody', s.hero_body);

  setLink('heroCta', s.hero_cta_label, s.hero_cta_url || '#contacto');
  setLink('headerCta', s.hero_cta_label, s.hero_cta_url || '#contacto');

  applyImage(document.getElementById('heroImageSlot'), s.hero_image_url);

  renderEditorialTitle(s.editorial_title);
  setText('editorialBody', s.editorial_body);
  applyImage(document.getElementById('editorialImageSlot'), s.editorial_image_url);

  setText('contactWhatsapp', s.whatsapp || 'Por configurar');
  setText('contactAddress', s.address || 'Por configurar');
  setText('contactHours', s.hours || 'Por configurar');

  const instagram = document.getElementById('contactInstagram');
  if (instagram) {
    if (s.instagram_url) {
      instagram.innerHTML = `<a href="${s.instagram_url}" target="_blank" rel="noopener">Instagram ↗</a>`;
    } else {
      instagram.textContent = 'Por configurar';
    }
  }
}

function applyService(card, service) {
  if (!card || !service) return;

  const title = card.querySelector('h3');
  const desc = card.querySelector('.service-copy p');
  const image = card.querySelector('.image-slot');
  const link = card.querySelector('.service-copy a');

  if (title && service.title) title.textContent = service.title;

  if (desc) {
    const parts = [];
    if (service.short_description) parts.push(service.short_description);
    if (service.price_text) parts.push(service.price_text);
    if (parts.length) desc.textContent = parts.join(' · ');
  }

  applyImage(image, service.image_url);

  if (link && service.slug) {
    link.href = `#contacto`;
    link.dataset.service = service.slug;
  }

  card.style.display = service.is_active === false ? 'none' : '';
}

async function loadPublicContent() {
  if (!window.supabase || !CFG.SUPABASE_URL || !CFG.SUPABASE_PUBLISHABLE_KEY) {
    console.warn('NOUVĒNCE Web: Supabase no está configurado; se muestra el contenido base.');
    return;
  }

  db = window.supabase.createClient(
    CFG.SUPABASE_URL,
    CFG.SUPABASE_PUBLISHABLE_KEY
  );

  try {
    const [settingsRes, servicesRes] = await Promise.all([
      db.from('web_settings').select('*').eq('id', 1).maybeSingle(),
      db.from('web_services').select('*').order('position', { ascending: true })
    ]);

    if (settingsRes.error) throw settingsRes.error;
    if (servicesRes.error) throw servicesRes.error;

    applySettings(settingsRes.data);

    const services = servicesRes.data || [];
    services.forEach(service => {
      const card = document.querySelector(
        `[data-service-slug="${CSS.escape(service.slug)}"]`
      );
      applyService(card, service);
    });

    document.documentElement.dataset.contentSource = 'supabase';
  } catch (error) {
    console.error('NOUVĒNCE Web: no se pudo cargar Supabase.', error);
    document.documentElement.dataset.contentSource = 'fallback';
  }
}

loadPublicContent();
