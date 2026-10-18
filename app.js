document.getElementById('year').textContent = new Date().getFullYear();

const CFG = window.NOUVELLE_WEB_CONFIG || {};
let db = null;

function setText(id, value) {
  const el = document.getElementById(id);
  if (el && value !== null && value !== undefined) {
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

// Build formatted titles with DOM nodes, never with user supplied innerHTML.
function appendText(el, text) {
  el.appendChild(document.createTextNode(text));
}

function renderEditorialTitle(text) {
  const el = document.getElementById('editorialTitle');
  if (!el || text === undefined || text === null) return;
  const t = String(text).trim();
  const idx = t.indexOf('.');
  el.replaceChildren();
  if (idx > 0 && idx < t.length - 1) {
    appendText(el, t.slice(0, idx + 1));
    el.appendChild(document.createElement('br'));
    appendText(el, t.slice(idx + 1).trim());
  } else appendText(el, t);
}

function renderHeroTitle(text) {
  const el = document.getElementById('heroTitle');
  if (!el || text === undefined || text === null) return;
  const t = String(text).trim();
  const comma = t.indexOf(',');
  el.replaceChildren();
  if (comma > 0 && comma < t.length - 1) {
    appendText(el, t.slice(0, comma + 1));
    el.appendChild(document.createElement('br'));
    const em = document.createElement('em');
    em.textContent = t.slice(comma + 1).trim();
    el.appendChild(em);
  } else appendText(el, t);
}

// Each group maps to literal HTML ids, never arbitrary selectors or HTML.
const SITE_COPY_IDS = {
  manifestoEyebrow: 'manifestoEyebrow',
  manifestoTitle: 'manifestoTitle',
  manifestoBody: 'manifestoBody',
  manifestoNote: 'manifestoNote',
  servicesEyebrow: 'servicesEyebrow',
  servicesTitle: 'servicesTitle',
  servicesIntro: 'servicesIntro',
  featuredEyebrow: 'featuredEyebrow',
  featuredLink: 'featuredLink',
  pointsEyebrow: 'pointsEyebrow',
  pointsTitle: 'pointsTitle',
  pointsBody: 'pointsBody',
  pointsButtonLabel: 'pointsButtonLabel',
  contactEyebrow: 'contactEyebrow',
  contactTitle: 'contactTitle',
  contactIntro: 'contactIntro',
  aboutEyebrow: 'aboutEyebrow',
  aboutTitle: 'aboutTitle',
  aboutBody: 'aboutBody',
  missionTitle: 'missionTitle',
  missionBody: 'missionBody',
  visionTitle: 'visionTitle',
  visionBody: 'visionBody',
  valuesTitle: 'valuesTitle',
  valuesBody: 'valuesBody',
  productsEyebrow: 'productsEyebrow',
  productsTitle: 'productsTitle',
  productsIntro: 'productsIntro',
  faqEyebrow: 'faqEyebrow',
  faqTitle: 'faqTitle',
  faqIntro: 'faqIntro',
  faqQuestion1: 'faqQuestion1',
  faqAnswer1: 'faqAnswer1',
  faqQuestion2: 'faqQuestion2',
  faqAnswer2: 'faqAnswer2',
  faqQuestion3: 'faqQuestion3',
  faqAnswer3: 'faqAnswer3'
};

function applySiteCopy(copy) {
  if (!copy || typeof copy !== 'object') return;
  for (const [field, id] of Object.entries(SITE_COPY_IDS)) {
    setText(id, copy[field]);
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

  applySiteCopy(s.site_copy);
  renderProducts(s.site_copy && s.site_copy.products, s.whatsapp);
  renderPrivacyLink(s.site_copy && s.site_copy.privacyUrl);
  applyImage(document.getElementById('editorialImageSlot'), s.editorial_image_url);

  currentPublicWhatsapp = s.whatsapp || '';
  currentTreatmentCatalog = (s.site_copy && typeof s.site_copy.treatmentCatalog === 'object' && !Array.isArray(s.site_copy.treatmentCatalog)) ? s.site_copy.treatmentCatalog : {};
  setText('contactWhatsapp', s.whatsapp || 'Por configurar');
  const whatsappCta = document.getElementById('contactWhatsAppCta');
  const whatsappDigits = normalizedWhatsapp(s.whatsapp);
  if (whatsappCta) {
    if (whatsappDigits) {
      whatsappCta.href = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent('Hola, me gustaría agendar una cita en NOUVĒNCE.')}`;
      whatsappCta.target = '_blank';
      whatsappCta.rel = 'noopener noreferrer';
      whatsappCta.hidden = false;
    } else whatsappCta.hidden = true;
  }
  setText('contactAddress', s.address || 'Por configurar');
  setText('contactHours', s.hours || 'Por configurar');

  const instagram = document.getElementById('contactInstagram');
  if (instagram) {
    if (s.instagram_url) {
      try {
        const url = new URL(s.instagram_url, location.origin);
        if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Liga inválida');
        const a = document.createElement('a');
        a.href = url.href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = 'Instagram ↗';
        instagram.replaceChildren(a);
      } catch (e) {
        instagram.textContent = 'Instagram';
      }
    } else {
      instagram.textContent = 'Por configurar';
    }
  }
}

// The product catalogue lives inside web_settings.site_copy. No new table,
// policies, or permissions are required: existing authenticated updates are reused.
function normalizedWhatsapp(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 10) return `52${digits}`;
  if (digits.length >= 11 && digits.length <= 15) return digits;
  return '';
}

function safeImageUrl(value) {
  if (!value || typeof value !== 'string') return '';
  try {
    const url = new URL(value, window.location.href);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch (_) {
    return '';
  }
}

function renderPrivacyLink(value) {
  const link = document.getElementById('privacyLink');
  if (!link) return;
  const url = safeImageUrl(value);
  if (url) {
    link.href = url;
    link.hidden = false;
  } else link.hidden = true;
}

function appendProductText(parent, tag, className, value) {
  if (!value || !String(value).trim()) return null;
  const el = document.createElement(tag);
  el.className = className;
  el.textContent = String(value).trim();
  parent.appendChild(el);
  return el;
}

function renderProducts(items, whatsapp) {
  const grid = document.getElementById('productGrid');
  const empty = document.getElementById('productsEmpty');
  if (!grid || !empty) return;
  const active = Array.isArray(items) ? items.filter(p => p && p.is_active === true && String(p.name || '').trim()) : [];
  grid.replaceChildren();
  empty.hidden = active.length > 0;
  const wa = normalizedWhatsapp(whatsapp);
  for (const product of active) {
    const card = document.createElement('article');
    card.className = 'product-card';
    const photo = document.createElement('div');
    photo.className = 'product-photo';
    const imageUrl = safeImageUrl(product.image_url);
    if (imageUrl) {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = `Producto: ${product.name}`;
      img.loading = 'lazy';
      photo.appendChild(img);
    } else {
      photo.classList.add('no-image');
      const placeholder = document.createElement('span');
      placeholder.textContent = 'NOUVĒNCE';
      photo.appendChild(placeholder);
    }
    card.appendChild(photo);
    const copy = document.createElement('div');
    copy.className = 'product-copy';
    appendProductText(copy, 'span', 'product-category', product.category);
    appendProductText(copy, 'h3', '', product.name);
    appendProductText(copy, 'p', 'product-brand', product.brand);
    appendProductText(copy, 'p', 'product-size', product.size);
    appendProductText(copy, 'p', 'product-description', product.description);
    appendProductText(copy, 'p', 'product-price', product.price || 'Consultar precio');
    const cta = document.createElement('a');
    cta.className = 'button button-dark';
    cta.textContent = 'Consultar producto ↗';
    if (wa) {
      cta.href = `https://wa.me/${wa}?text=${encodeURIComponent(`Hola, me interesa ${product.name} de NOUVĒNCE. ¿Me confirman precio y disponibilidad?`)}`;
      cta.target = '_blank';
      cta.rel = 'noopener noreferrer';
    } else cta.href = '#contacto';
    copy.appendChild(cta);
    card.appendChild(copy);
    grid.appendChild(card);
  }
}

// Catálogo interactivo. Se construye con las categorías reales de web_services,
// para no depender de nombres/"slugs" antiguos escritos en el HTML.
const FALLBACK_SERVICES = [
  {id:'respaldo-1',position:1,title:'Medicina Estética',short_description:'Una atención estética individualizada, centrada en la armonía y el cuidado consciente.',is_active:true},
  {id:'respaldo-2',position:2,title:'Spa & Beauty',short_description:'Un momento de cuidado personal para reconectar contigo y renovar tu bienestar.',is_active:true},
  {id:'respaldo-3',position:3,title:'Metabolic',short_description:'Un enfoque de bienestar que comienza por conocer las necesidades de cada persona.',is_active:true},
  {id:'respaldo-4',position:4,title:'Regenerative',short_description:'Conoce un enfoque responsable y personalizado del cuidado estético.',is_active:true}
];
let currentPublicServices = FALLBACK_SERVICES;
let currentTreatmentCatalog = {};
let currentPublicWhatsapp = '';
let currentDetailTrigger = null;

function createTextNode(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = String(text ?? '');
  return node;
}

function renderServiceCards(services) {
  const grid = document.getElementById('serviceGrid');
  if (!grid) return;
  currentPublicServices = Array.isArray(services) ? services : FALLBACK_SERVICES;
  grid.replaceChildren();
  const visible = currentPublicServices.filter(s => s && s.is_active !== false);
  if (!visible.length) {
    grid.appendChild(createTextNode('p','services-empty','Próximamente compartiremos nuestras experiencias. Contáctanos para recibir información.'));
    return;
  }
  visible.forEach((service, index) => {
    const card = document.createElement('article');
    card.className = 'service-card';
    if (visible.length >= 3 && index === 0) card.classList.add('service-card-large');
    if (visible.length >= 4 && index === visible.length - 1) card.classList.add('service-card-wide');

    const image = document.createElement('div');
    image.className = 'image-slot';
    image.appendChild(createTextNode('span', '', 'NOUVĒNCE · ' + (service.title || 'Bienestar')));
    applyImage(image, safeImageUrl(service.image_url));
    card.appendChild(image);

    const content = document.createElement('div');
    content.className = 'service-copy';
    content.appendChild(createTextNode('span','',String(index+1).padStart(2,'0')));
    content.appendChild(createTextNode('h3','', service.title || 'Experiencia NOUVĒNCE'));
    content.appendChild(createTextNode('p','',service.short_description || 'Descubre nuestras opciones de atención y bienestar.'));
    if (service.price_text) content.appendChild(createTextNode('p','service-preview-price',service.price_text));
    const button = createTextNode('button','service-explore','Ver tratamientos ↗');
    button.type = 'button';
    button.addEventListener('click', () => openServiceDialog(service, button, index+1));
    content.appendChild(button);
    card.appendChild(content);
    grid.appendChild(card);
  });
}

function openServiceDialog(service, trigger, number) {
  const dialog = document.getElementById('serviceDialog');
  if (!dialog) return;
  currentDetailTrigger = trigger || null;
  setText('serviceDialogNumber','EXPERIENCIA ' + String(number||1).padStart(2,'0') + ' · NOUVĒNCE');
  setText('serviceDialogTitle',service.title || 'Experiencia NOUVĒNCE');
  setText('serviceDialogIntro',service.short_description || 'Conoce nuestras opciones de atención y bienestar.');
  const price = document.getElementById('serviceDialogPrice');
  price.hidden = !service.price_text;
  price.textContent = service.price_text || '';
  const container = document.getElementById('serviceDialogTreatments');
  container.replaceChildren();
  const all = currentTreatmentCatalog && currentTreatmentCatalog[String(service.id)];
  const treatments = Array.isArray(all) ? all.filter(t => t && t.is_active === true && String(t.name||'').trim()) : [];
  if (treatments.length) {
    container.appendChild(createTextNode('p','eyebrow','TRATAMIENTOS DISPONIBLES'));
    treatments.forEach(treatment => {
      const item = document.createElement('article');
      item.className = 'service-treatment';
      const url = safeImageUrl(treatment.image_url);
      if (url) {
        const image = document.createElement('img');
        image.src = url;
        image.loading = 'lazy';
        image.alt = 'Tratamiento ' + treatment.name;
        image.className = 'service-treatment-image';
        item.appendChild(image);
      }
      const body = document.createElement('div');
      body.className = 'service-treatment-body';
      body.appendChild(createTextNode('h3','',treatment.name));
      if (treatment.description) body.appendChild(createTextNode('p','',treatment.description));
      const meta = document.createElement('div');
      meta.className = 'service-treatment-meta';
      if(treatment.duration) meta.appendChild(createTextNode('span','',treatment.duration));
      if(treatment.price) meta.appendChild(createTextNode('span','',treatment.price));
      if (meta.childNodes.length) body.appendChild(meta);
      item.appendChild(body);
      container.appendChild(item);
    });
  } else {
    container.appendChild(createTextNode('p','service-treatment-pending',
      'Estamos preparando el detalle de nuestras opciones. Escríbenos para conocer los tratamientos disponibles y recibir orientación personalizada.'));
  }
  const cta = document.getElementById('serviceDialogCta');
  const digits = normalizedWhatsapp(currentPublicWhatsapp);
  if (digits) {
    cta.href = 'https://wa.me/' + digits + '?text=' + encodeURIComponent('Hola, quiero conocer las opciones y disponibilidad de ' + (service.title || 'NOUVĒNCE') + '.');
    cta.target = '_blank';
    cta.rel = 'noopener noreferrer';
    cta.textContent = 'Consultar por WhatsApp ↗';
  } else {
    cta.href = '#contacto';
    cta.removeAttribute('target');
    cta.removeAttribute('rel');
    cta.textContent = 'Ver información de contacto ↗';
  }
  if (dialog.open) dialog.close();
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open','');
}

function initServiceDialog() {
  const dialog = document.getElementById('serviceDialog');
  if (!dialog) return;
  document.getElementById('serviceDialogClose').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click', e => { if(e.target === dialog) dialog.close(); });
  dialog.addEventListener('close',()=>{ if(currentDetailTrigger?.isConnected) currentDetailTrigger.focus(); });
  document.getElementById('serviceDialogCta').addEventListener('click',()=>dialog.close());
}

initServiceDialog();
renderServiceCards(FALLBACK_SERVICES);

async function loadPublicContent() {
  if (!window.supabase || !CFG.SUPABASE_URL || !CFG.SUPABASE_PUBLISHABLE_KEY) {
    console.warn('NOUVĒNCE Web: falta configuración de Supabase; se muestra el contenido base.');
    document.documentElement.dataset.contentSource = 'fallback';
    return;
  }
  try {
    db = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_PUBLISHABLE_KEY);
  } catch (error) {
    console.error('NOUVĒNCE Web: error al iniciar Supabase.', error);
    document.documentElement.dataset.contentSource = 'fallback';
    return;
  }

  // A failure to read the services must not prevent the texts from loading.
  const [settingsRes, servicesRes] = await Promise.allSettled([
    db.from('web_settings').select('*').eq('id', 1).maybeSingle(),
    db.from('web_services').select('*').order('position', { ascending: true })
  ]);

  let settingsOk = false;
  let servicesOk = false;
  if (settingsRes.status === 'fulfilled' && !settingsRes.value.error && settingsRes.value.data) {
    applySettings(settingsRes.value.data);
    settingsOk = true;
  } else {
    console.warn('NOUVĒNCE Web: no se pudieron cargar los textos.', settingsRes.status === 'rejected' ? settingsRes.reason : settingsRes.value?.error || 'No existe web_settings.id=1');
  }

  if (servicesRes.status === 'fulfilled' && !servicesRes.value.error) {
    renderServiceCards(servicesRes.value.data || []);
    servicesOk = true;
  } else {
    console.warn('NOUVĒNCE Web: no se pudieron cargar los servicios.', servicesRes.status === 'rejected' ? servicesRes.reason : servicesRes.value?.error);
  }
  document.documentElement.dataset.contentSource = settingsOk ? 'supabase' : 'fallback';
  document.documentElement.dataset.servicesSource = servicesOk ? 'supabase' : 'fallback';
}

loadPublicContent();
