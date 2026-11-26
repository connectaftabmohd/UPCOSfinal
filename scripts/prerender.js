/**
 * Full-Site Static HTML Prerenderer & Sitemap Generator for UPCOS
 * - Reads live records from data/db.json (news, orders, departments, faqs)
 * - Syncs public/sitemap.xml and dist/sitemap.xml with zero broken/404 URLs
 * - Generates static SEO HTML (title, description, canonical, OpenGraph, Twitter, JSON-LD, semantic body)
 *   for every hub, article, government order, department, and policy page.
 */

import fs from 'fs';
import path from 'path';

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const BASE_HTML = path.join(DIST_DIR, 'index.html');
const DB_PATH = path.resolve(process.cwd(), 'data', 'db.json');
const DOMAIN = 'https://upcos.netlify.app';

if (!fs.existsSync(BASE_HTML)) {
  console.log('Skipping prerender: dist/index.html does not exist yet.');
  process.exit(0);
}

const template = fs.readFileSync(BASE_HTML, 'utf-8');

const escapeHtmlAttr = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const escapeHtmlText = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const resolveAbsoluteImageUrl = (img = '') => {
  const trimmed = String(img || '').trim();
  if (!trimmed) return `${DOMAIN}/og-banner.jpg`;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${DOMAIN}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
};

const renderInlineFormatting = (text = '') =>
  escapeHtmlText(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

const renderFullContentHtml = (lines = []) => {
  if (!Array.isArray(lines) || lines.length === 0) return '';
  const chunks = [];
  let i = 0;

  while (i < lines.length) {
    const raw = String(lines[i] || '').trim();
    if (!raw) {
      i++;
      continue;
    }

    if (raw.startsWith('#### ')) {
      chunks.push(`<h4>${renderInlineFormatting(raw.slice(5))}</h4>`);
      i++;
    } else if (raw.startsWith('### ')) {
      chunks.push(`<h3>${renderInlineFormatting(raw.slice(4))}</h3>`);
      i++;
    } else if (raw.startsWith('## ')) {
      chunks.push(`<h2>${renderInlineFormatting(raw.slice(3))}</h2>`);
      i++;
    } else if (raw.startsWith('# ')) {
      chunks.push(`<h2>${renderInlineFormatting(raw.slice(2))}</h2>`);
      i++;
    } else if (raw.startsWith('|')) {
      const tableRows = [];
      while (i < lines.length && String(lines[i] || '').trim().startsWith('|')) {
        const rowStr = String(lines[i]).trim();
        const isSeparator = /^\|[\s\-:|]+\|$/.test(rowStr);
        if (!isSeparator) {
          const cells = rowStr
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim());
          tableRows.push(cells);
        }
        i++;
      }
      if (tableRows.length > 0) {
        const [header, ...bodyRows] = tableRows;
        const thead = `<thead><tr>${header.map((h) => `<th>${renderInlineFormatting(h)}</th>`).join('')}</tr></thead>`;
        const tbody =
          bodyRows.length > 0
            ? `<tbody>${bodyRows.map((row) => `<tr>${row.map((c) => `<td>${renderInlineFormatting(c)}</td>`).join('')}</tr>`).join('')}</tbody>`
            : '';
        chunks.push(`<table>${thead}${tbody}</table>`);
      }
    } else if (raw.startsWith('- ') || raw.startsWith('* ') || raw.startsWith('• ')) {
      const listItems = [];
      while (i < lines.length) {
        const cur = String(lines[i] || '').trim();
        if (cur.startsWith('- ') || cur.startsWith('* ') || cur.startsWith('• ')) {
          listItems.push(`<li>${renderInlineFormatting(cur.slice(2))}</li>`);
          i++;
        } else {
          break;
        }
      }
      chunks.push(`<ul>${listItems.join('')}</ul>`);
    } else {
      chunks.push(`<p>${renderInlineFormatting(raw)}</p>`);
      i++;
    }
  }

  return chunks.join('\n');
};

let dbData = { news: [], orders: [], departments: [], faqs: [] };
if (fs.existsSync(DB_PATH)) {
  try {
    dbData = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch (err) {
    console.warn('Warning: Could not parse data/db.json:', err.message);
  }
}

const newsList = Array.isArray(dbData.news) ? dbData.news : [];
const ordersList = Array.isArray(dbData.orders) ? dbData.orders : [];
const departmentsList = Array.isArray(dbData.departments) ? dbData.departments : [];
const faqsList = Array.isArray(dbData.faqs) ? dbData.faqs : [];

const latestDate = newsList[0]?.publicationDate || '2026-11-26';

const SITE_HEADER = `
  <header role="banner" style="background:#ffffff;border-bottom:1px solid #e2e8f0;padding:12px 16px;">
    <div style="max-width:1100px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;">
      <a href="/" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:#0f172a;font-weight:800;">
        <img src="/logo.png" alt="UPCOS – UP Outsource Seva Nigam Official Logo" width="48" height="48" style="border-radius:9999px;object-fit:cover;" />
        <span>UP Outsource Seva Nigam (UPCOS) — News &amp; Information</span>
      </a>
      <nav aria-label="Primary Navigation" style="display:flex;flex-wrap:wrap;gap:12px;font-size:0.9rem;font-weight:600;">
        <a href="/">मुख्य पृष्ठ (Home)</a>
        <a href="/news">ताज़ा खबरें (News)</a>
        <a href="/shasanadesh">शासनादेश (Gov Orders)</a>
        <a href="/departments">विभाग (Departments)</a>
        <a href="/employee-hub">कर्मचारी हब (Employee Hub)</a>
        <a href="/employee-community">कर्मचारी संवाद (Community)</a>
        <a href="/about-us">हमारे बारे में (About Us)</a>
        <a href="/contact-us">संपर्क करें (Contact)</a>
      </nav>
    </div>
  </header>
`;

const NAV_LINKS = `
  <nav aria-label="Primary Portal Navigation" style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid #e2e8f0;font-size:0.9rem;">
    <a href="/">मुख्य पृष्ठ (Home)</a> |
    <a href="/news">ताज़ा खबरें (News)</a> |
    <a href="/shasanadesh">शासनादेश (Orders)</a> |
    <a href="/departments">विभाग (Departments)</a> |
    <a href="/employee-hub">कर्मचारी हब (Employee Hub)</a> |
    <a href="/employee-community">कर्मचारी संवाद (Community)</a> |
    <a href="/about-us">हमारे बारे में (About Us)</a> |
    <a href="/contact-us">संपर्क करें (Contact)</a> |
    <a href="/privacy-policy">गोपनीयता नीति (Privacy Policy)</a> |
    <a href="/disclaimer">अस्वीकरण (Disclaimer)</a> |
    <a href="/terms-and-conditions">नियम एवं शर्तें (Terms)</a> |
    <a href="/sitemap">साइटमैप (Sitemap)</a>
  </nav>
`;

const SITE_FOOTER = `
  <footer role="contentinfo" style="background:#0f172a;color:#cbd5e1;padding:2rem 1rem;margin-top:2rem;border-top:1px solid #1e293b;font-family:sans-serif;font-size:0.9rem;line-height:1.7;">
    <div style="max-width:1100px;margin:0 auto;">
      <p><strong>UP Outsource Seva Nigam News &amp; Information (UPCOS)</strong> — उत्तर प्रदेश आउटसोर्स एवं संविदा कर्मचारियों के लिए स्वतंत्र समाचार, शासनादेश एवं सेवा सूचना मंच।</p>
      <p>
        <strong>सोशल मीडिया पर जुड़ें (Follow Us):</strong>
        <a href="https://www.facebook.com/people/UP-outsource-Seva-Nigam-News-and-Information/61580301641301/" target="_blank" rel="noopener noreferrer me" style="color:#93c5fd;">Facebook</a> |
        <a href="https://x.com/UPOutsource" target="_blank" rel="noopener noreferrer me" style="color:#93c5fd;">X (Twitter)</a> |
        <a href="https://t.me/UPOutsource" target="_blank" rel="noopener noreferrer me" style="color:#93c5fd;">Telegram</a> |
        <a href="https://www.youtube.com/@UPOutsource" target="_blank" rel="noopener noreferrer me" style="color:#93c5fd;">YouTube</a> |
        <a href="https://www.instagram.com/upoutsource" target="_blank" rel="noopener noreferrer me" style="color:#93c5fd;">Instagram</a> |
        <a href="https://whatsapp.com/channel/0029VaUPOutsource" target="_blank" rel="noopener noreferrer me" style="color:#93c5fd;">WhatsApp</a>
      </p>
      <p>
        <strong>नीति एवं वैधानिक पृष्ठ:</strong>
        <a href="/about-us" style="color:#fde68a;">About Us</a> |
        <a href="/contact-us" style="color:#fde68a;">Contact Us</a> |
        <a href="/privacy-policy" style="color:#fde68a;">Privacy Policy</a> |
        <a href="/disclaimer" style="color:#fde68a;">Disclaimer</a> |
        <a href="/terms-and-conditions" style="color:#fde68a;">Terms &amp; Conditions</a> |
        <a href="/editorial-policy" style="color:#fde68a;">Editorial Policy</a> |
        <a href="/fact-checking-policy" style="color:#fde68a;">Fact-Checking</a> |
        <a href="/correction-policy" style="color:#fde68a;">Corrections</a> |
        <a href="/copyright-policy" style="color:#fde68a;">Copyright</a> |
        <a href="/advertise" style="color:#fde68a;">Advertise</a> |
        <a href="/sitemap" style="color:#fde68a;">Sitemap</a>
      </p>
      <p>संपर्क ईमेल: <a href="mailto:contact@uposn.in" style="color:#93c5fd;">contact@uposn.in</a> | स्थान: लखनऊ, उत्तर प्रदेश</p>
      <p>© 2026 UP Outsource Seva Nigam News &amp; Information. All Rights Reserved. यह उत्तर प्रदेश सरकार की आधिकारिक वेबसाइट नहीं है।</p>
    </div>
  </footer>
`;

const makeBreadcrumbList = (crumbs) => ({
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    name: c.name,
    item: c.url
  }))
});

const homeBodySnippet = `
  ${SITE_HEADER}
  <main style="max-width:960px;margin:2rem auto;padding:1.5rem;font-family:sans-serif;line-height:1.7;">
    <h1>UPCOS – उत्तर प्रदेश आउटसोर्स सेवा एवं कर्मचारी सूचना पोर्टल</h1>
    <p style="font-size:0.9rem;color:#475569;">
      प्रकाशक: <strong>UPCOS Editorial Team</strong> |
      अद्यतन तिथि: <time datetime="${escapeHtmlAttr(latestDate)}T09:30:00+05:30">${escapeHtmlText(latestDate)}</time>
    </p>
    <figure style="margin:1rem 0;">
      <img src="/og-banner.jpg" alt="UPCOS – उत्तर प्रदेश आउटसोर्स सेवा एवं कर्मचारी सूचना पोर्टल मुख्य बैनर" width="1376" height="768" style="max-width:100%;height:auto;border-radius:12px;" />
    </figure>
    <p><strong>UP Outsource Seva Nigam News &amp; Information</strong> उत्तर प्रदेश के सरकारी विभागों एवं निगमों में कार्यरत आउटसोर्सिंग एवं संविदा कर्मचारियों के लिए समर्पित एक स्वतंत्र समाचार एवं सूचना मंच है।</p>
    <section>
      <h2>नवीनतम समाचार एवं भर्ती अपडेट</h2>
      <ul>
        ${newsList
          .slice(0, 8)
          .map(
            (n) =>
              `<li style="margin-bottom:1rem;">
                <a href="/news/${escapeHtmlAttr(n.slug)}">
                  <img src="${escapeHtmlAttr(n.featuredImage || '/og-banner.jpg')}" alt="${escapeHtmlAttr(n.title)}" width="320" height="180" style="max-width:320px;height:auto;border-radius:8px;display:block;margin-bottom:0.4rem;" />
                  <strong>${escapeHtmlText(n.title)}</strong>
                </a>
                — <time datetime="${escapeHtmlAttr(n.publicationDate || latestDate)}">${escapeHtmlText(n.publicationDate || latestDate)}</time>
              </li>`
          )
          .join('\n        ')}
      </ul>
    </section>
    <section>
      <h2>प्रमुख शासनादेश (UP Government Orders)</h2>
      <ul>
        ${ordersList
          .slice(0, 5)
          .map(
            (o) =>
              `<li><a href="/shasanadesh/${escapeHtmlAttr(o.slug)}">${escapeHtmlText(o.orderNumber)}: ${escapeHtmlText(o.title)}</a> (<time datetime="${escapeHtmlAttr(o.date || latestDate)}">${escapeHtmlText(o.date || latestDate)}</time>)</li>`
          )
          .join('\n        ')}
      </ul>
    </section>
    <section>
      <h2>विभागीय सूचना केंद्र</h2>
      <ul>
        ${departmentsList
          .map(
            (d) =>
              `<li><a href="/departments/${escapeHtmlAttr(d.id)}">${escapeHtmlText(d.name)} (${escapeHtmlText(d.englishName)})</a></li>`
          )
          .join('\n        ')}
      </ul>
    </section>
    <section>
      <h2>कर्मचारी सूचना हब – अक्सर पूछे जाने वाले प्रश्न (FAQ)</h2>
      ${faqsList
        .map(
          (f) => `<div><h3>${escapeHtmlText(f.question)}</h3><p>${escapeHtmlText(f.answer)}</p></div>`
        )
        .join('\n      ')}
    </section>
    <section>
      <h2>स्वतंत्र सूचना अस्वीकरण</h2>
      <p>यह एक स्वतंत्र सूचना और जन-जागरूकता पोर्टल है और उत्तर प्रदेश सरकार या किसी सरकारी विभाग की आधिकारिक वेबसाइट नहीं है। आधिकारिक सत्यापन हेतु सदैव shasanadesh.up.gov.in एवं sewayojan.up.nic.in का उपयोग करें।</p>
    </section>
    ${NAV_LINKS}
  </main>
  ${SITE_FOOTER}
`;

const staticRoutes = [
  {
    path: 'news',
    title: 'ताज़ा खबरें एवं विभागीय समाचार – UPCOS',
    description:
      'उत्तर प्रदेश आउटसोर्सिंग एवं संविदा कर्मचारियों से जुड़े नवीनतम समाचार, मानदेय वृद्धि एवं सेवायोजन भर्ती सूचनाएं।',
    changefreq: 'daily',
    priority: '0.9',
    lastmod: latestDate,
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          name: 'ताज़ा खबरें एवं विभागीय समाचार – UPCOS',
          url: `${DOMAIN}/news`,
          inLanguage: 'hi-IN'
        },
        makeBreadcrumbList([
          { name: 'Home', url: `${DOMAIN}/` },
          { name: 'News', url: `${DOMAIN}/news` }
        ])
      ]
    },
    bodySnippet: `
      <main style="max-width:850px;margin:2rem auto;padding:1rem;font-family:sans-serif;line-height:1.7;">
        <h1>ताज़ा खबरें एवं विभागीय समाचार (Latest UP Outsource News)</h1>
        <p>उत्तर प्रदेश के विभिन्न विभागों में कार्यरत आउटसोर्स कर्मियों के वेतन, ईपीएफ, ईएसआई और सेवायोजन भर्ती से जुड़े नवीनतम अपडेट।</p>
        <ul>
          ${newsList
            .map(
              (n) =>
                `<li><a href="/news/${escapeHtmlAttr(n.slug)}">${escapeHtmlText(n.title)}</a></li>`
            )
            .join('\n          ')}
        </ul>
        ${NAV_LINKS}
      </main>
    `
  },
  {
    path: 'shasanadesh',
    title: 'शासनादेश एवं विधिक परिपत्र (Shasanadesh) – UPCOS',
    description:
      'उत्तर प्रदेश शासन के कार्मिक, वित्त एवं अन्य विभागों द्वारा जारी आउटसोर्सिंग संबंधी आधिकारिक शासनादेश।',
    changefreq: 'daily',
    priority: '0.9',
    lastmod: ordersList[0]?.date || latestDate,
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          name: 'उत्तर प्रदेश आउटसोर्सिंग शासनादेश संग्रह',
          url: `${DOMAIN}/shasanadesh`,
          inLanguage: 'hi-IN'
        },
        makeBreadcrumbList([
          { name: 'Home', url: `${DOMAIN}/` },
          { name: 'Shasanadesh', url: `${DOMAIN}/shasanadesh` }
        ])
      ]
    },
    bodySnippet: `
      <main style="max-width:850px;margin:2rem auto;padding:1rem;font-family:sans-serif;line-height:1.7;">
        <h1>उत्तर प्रदेश आउटसोर्सिंग शासनादेश संग्रह (Government Orders)</h1>
        <p>शासकीय विभागों एवं सचिवालय प्रशासन द्वारा जारी आउटसोर्स कर्मचारियों से संबंधित महत्वपूर्ण आदेश व परिपत्र।</p>
        <ul>
          ${ordersList
            .map(
              (o) =>
                `<li><a href="/shasanadesh/${escapeHtmlAttr(o.slug)}">${escapeHtmlText(o.orderNumber)} – ${escapeHtmlText(o.title)}</a></li>`
            )
            .join('\n          ')}
        </ul>
        ${NAV_LINKS}
      </main>
    `
  },
  {
    path: 'departments',
    title: 'विभागीय मार्गदर्शिका एवं सूचना – UPCOS',
    description:
      'स्वास्थ्य, शिक्षा, पंचायती राज, ऊर्जा समेत उ.प्र. के सभी प्रमुख सरकारी विभागों के आउटसोर्स कर्मचारी आदेश।',
    changefreq: 'weekly',
    priority: '0.85',
    lastmod: latestDate,
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          name: 'उत्तर प्रदेश विभागीय आउटसोर्स सूचना केंद्र',
          url: `${DOMAIN}/departments`,
          inLanguage: 'hi-IN'
        },
        makeBreadcrumbList([
          { name: 'Home', url: `${DOMAIN}/` },
          { name: 'Departments', url: `${DOMAIN}/departments` }
        ])
      ]
    },
    bodySnippet: `
      <main style="max-width:850px;margin:2rem auto;padding:1rem;font-family:sans-serif;line-height:1.7;">
        <h1>उत्तर प्रदेश विभागीय आउटसोर्स सूचना केंद्र</h1>
        <p>उ.प्र. के सभी प्रमुख सरकारी विभागों के आउटसोर्स कर्मचारियों से जुड़े समाचार व शासनादेश।</p>
        <ul>
          ${departmentsList
            .map(
              (d) =>
                `<li><a href="/departments/${escapeHtmlAttr(d.id)}">${escapeHtmlText(d.name)} (${escapeHtmlText(d.englishName)})</a> – ${escapeHtmlText(d.description)}</li>`
            )
            .join('\n          ')}
        </ul>
        ${NAV_LINKS}
      </main>
    `
  },
  {
    path: 'employee-hub',
    title: 'कर्मचारी सूचना हब एवं वेतन कैलकुलेटर – UPCOS',
    description:
      'वेतन श्रेणियां, ईपीएफ-ईएसआई कैलकुलेटर, अवकाश नियम और कर्मचारी अधिकार संबंधी विस्तृत जानकारी।',
    changefreq: 'weekly',
    priority: '0.85',
    lastmod: latestDate,
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'FAQPage',
          mainEntity: faqsList.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer }
          }))
        },
        makeBreadcrumbList([
          { name: 'Home', url: `${DOMAIN}/` },
          { name: 'Employee Hub', url: `${DOMAIN}/employee-hub` }
        ])
      ]
    },
    bodySnippet: `
      <main style="max-width:850px;margin:2rem auto;padding:1rem;font-family:sans-serif;line-height:1.7;">
        <h1>कर्मचारी सूचना हब एवं वेतन कैलकुलेटर (Employee Hub)</h1>
        <p>आउटसोर्सिंग कर्मियों के लिए श्रेणीवार इन-हैंड वेतन गणना, EPF (12%) तथा ESI (0.75% / 3.25%) अंशदान व सामान्य प्रश्न उत्तर।</p>
        ${faqsList
          .map(
            (f) => `<section><h2>${escapeHtmlText(f.question)}</h2><p>${escapeHtmlText(f.answer)}</p></section>`
          )
          .join('\n        ')}
        ${NAV_LINKS}
      </main>
    `
  },
  {
    path: 'employee-community',
    title: 'कर्मचारी संवाद एवं विचार मंच – UPCOS',
    description:
      'उत्तर प्रदेश के 75 जनपदों के आउटसोर्स कर्मचारियों का स्वतंत्र संवाद, समस्या साझा एवं सहायता मंच।',
    changefreq: 'daily',
    priority: '0.8',
    lastmod: latestDate,
    schema: {
      '@context': 'https://schema.org',
      ...makeBreadcrumbList([
        { name: 'Home', url: `${DOMAIN}/` },
        { name: 'Employee Community', url: `${DOMAIN}/employee-community` }
      ])
    },
    bodySnippet: `
      <main style="max-width:800px;margin:2rem auto;padding:1rem;font-family:sans-serif;">
        <h1>उत्तर प्रदेश आउटसोर्स कर्मचारी संवाद मंच (Community Forum)</h1>
        <p>जनपदवार आउटसोर्स कर्मचारी अनुभव साझा करें, वेतन/पीएफ समस्याओं पर मार्गदर्शन पाएं और अन्य साथियों से जुड़ें।</p>
        ${NAV_LINKS}
      </main>
    `
  },
  {
    path: 'about-us',
    title: 'हमारे बारे में (About Us) – UPCOS',
    description:
      'UPCOS का परिचय, उद्देश्य, स्वतंत्र पहचान और उत्तर प्रदेश आउटसोर्सिंग कर्मचारियों के सशक्तिकरण का मिशन।',
    changefreq: 'monthly',
    priority: '0.8',
    lastmod: '2026-11-08',
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'AboutPage', name: 'About UPCOS', url: `${DOMAIN}/about-us`, inLanguage: 'hi-IN' },
        makeBreadcrumbList([
          { name: 'Home', url: `${DOMAIN}/` },
          { name: 'About Us', url: `${DOMAIN}/about-us` }
        ])
      ]
    },
    bodySnippet: `
      <article style="max-width:800px;margin:2rem auto;padding:1rem;font-family:sans-serif;">
        <h1>हमारे बारे में (About UPCOS Portal)</h1>
        <p><strong>UP Outsource Seva Nigam</strong> उत्तर प्रदेश राज्य के विभिन्न सरकारी विभागों एवं निगमों में कार्यरत लाखों आउटसोर्स, संविदा एवं दैनिक वेतनभोगी कर्मचारियों को समर्पित एक स्वतंत्र एवं निष्पक्ष सूचना व जागरूकता पोर्टल है।</p>
        <p>इस पोर्टल का उद्देश्य कर्मचारियों को उनके विधिक अधिकारों, न्यूनतम मानदेय शासनादेशों, ईपीएफ, ईएसआई एवं सेवायोजन भर्ती प्रक्रियाओं से संबंधित सटीक व प्रामाणिक जानकारी उपलब्ध कराना है।</p>
        ${NAV_LINKS}
      </article>
    `
  },
  {
    path: 'contact-us',
    title: 'संपर्क सूत्र एवं संपादकीय डेस्क (Contact Us) – UPCOS',
    description:
      'संपादकीय टीम से संपर्क, शिकायत निवारण, सूचना सत्यापन एवं सुझाव प्रेषण प्रपत्र।',
    changefreq: 'monthly',
    priority: '0.8',
    lastmod: '2026-11-08',
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'ContactPage', name: 'Contact UPCOS', url: `${DOMAIN}/contact-us`, inLanguage: 'hi-IN' },
        makeBreadcrumbList([
          { name: 'Home', url: `${DOMAIN}/` },
          { name: 'Contact Us', url: `${DOMAIN}/contact-us` }
        ])
      ]
    },
    bodySnippet: `
      <article style="max-width:800px;margin:2rem auto;padding:1rem;font-family:sans-serif;">
        <h1>संपर्क सूत्र (Contact Us)</h1>
        <p>किसी भी समाचार, शासनादेश सत्यापन, सुधार या प्रश्न के लिए हमारी संपादकीय टीम से संपर्क करें: contact@uposn.in</p>
        ${NAV_LINKS}
      </article>
    `
  },
  {
    path: 'privacy-policy',
    title: 'गोपनीयता नीति (Privacy Policy) – UPCOS',
    description: 'डेटा गोपनीयता, कुकीज, Google AdSense अनुपालन एवं उपयोगकर्ता अधिकारों का संपूर्ण विवरण।',
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: '2026-11-08',
    schema: {
      '@context': 'https://schema.org',
      ...makeBreadcrumbList([
        { name: 'Home', url: `${DOMAIN}/` },
        { name: 'Privacy Policy', url: `${DOMAIN}/privacy-policy` }
      ])
    },
    bodySnippet: `
      <article style="max-width:800px;margin:2rem auto;padding:1rem;font-family:sans-serif;">
        <h1>गोपनीयता नीति (Privacy Policy)</h1>
        <p>UPCOS आपकी गोपनीयता का पूर्ण सम्मान करता है। हम उपयोगकर्ता डेटा की सुरक्षा और Google प्रकाशक नीतियों का कठोरता से पालन करते हैं।</p>
        <h2>कुकीज एवं Google AdSense</h2>
        <p>हम वेबसाइट विश्लेषण एवं प्रासंगिक विज्ञापनों के प्रदर्शन हेतु मानक कुकीज का उपयोग करते हैं। Google AdSense विज्ञापनों के लिए DART एवं तृतीय-पक्ष कुकीज का उपयोग कर सकता है।</p>
        ${NAV_LINKS}
      </article>
    `
  },
  {
    path: 'disclaimer',
    title: 'अस्वीकरण एवं विधिक नीति (Disclaimer) – UPCOS',
    description: 'गैर-सरकारी स्पष्टीकरण, अनधिकृत सूचना निषेध एवं विधिक सूचना अस्वीकरण।',
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: '2026-11-08',
    schema: {
      '@context': 'https://schema.org',
      ...makeBreadcrumbList([
        { name: 'Home', url: `${DOMAIN}/` },
        { name: 'Disclaimer', url: `${DOMAIN}/disclaimer` }
      ])
    },
    bodySnippet: `
      <article style="max-width:800px;margin:2rem auto;padding:1rem;font-family:sans-serif;">
        <h1>अस्वीकरण एवं विधिक सूचना (Disclaimer)</h1>
        <p><strong>महत्वपूर्ण अस्वीकरण:</strong> UP Outsource Seva Nigam News &amp; Information एक स्वतंत्र सूचना मंच है। यह उत्तर प्रदेश सरकार अथवा किसी सरकारी विभाग की आधिकारिक वेबसाइट नहीं है।</p>
        <p>पोर्टल पर प्रकाशित जानकारी केवल जन-जागरूकता के उद्देश्य से है। किसी भी प्रशासनिक निर्णय से पूर्व कृपया shasanadesh.up.gov.in पर मूल शासनादेश का अवलोकन करें।</p>
        ${NAV_LINKS}
      </article>
    `
  },
  {
    path: 'terms-and-conditions',
    title: 'नियम एवं शर्तें (Terms & Conditions) – UPCOS',
    description: 'UPCOS वेबसाइट उपयोग की सामान्य शर्तें, बौद्धिक संपदा अधिकार एवं आचरण नियम।',
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: '2026-11-08',
    schema: {
      '@context': 'https://schema.org',
      ...makeBreadcrumbList([
        { name: 'Home', url: `${DOMAIN}/` },
        { name: 'Terms & Conditions', url: `${DOMAIN}/terms-and-conditions` }
      ])
    },
    bodySnippet: `
      <article style="max-width:800px;margin:2rem auto;padding:1rem;font-family:sans-serif;">
        <h1>नियम एवं शर्तें (Terms of Use)</h1>
        <p>इस पोर्टल का उपयोग करने से पूर्व कृपया इन नियमों एवं शर्तों को ध्यानपूर्वक पढ़ें। पोर्टल का उपयोग इन शर्तों की स्वीकृति माना जाएगा।</p>
        ${NAV_LINKS}
      </article>
    `
  },
  {
    path: 'editorial-policy',
    title: 'संपादकीय नीति (Editorial Policy) – UPCOS',
    description: 'स्वतंत्रता, निष्पक्षता, स्रोत प्रमाणिकता एवं पत्रकारिता सत्यनिष्ठा के मानक।',
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: '2026-11-08',
    schema: {
      '@context': 'https://schema.org',
      ...makeBreadcrumbList([
        { name: 'Home', url: `${DOMAIN}/` },
        { name: 'Editorial Policy', url: `${DOMAIN}/editorial-policy` }
      ])
    },
    bodySnippet: `
      <article style="max-width:800px;margin:2rem auto;padding:1rem;font-family:sans-serif;">
        <h1>संपादकीय नीति (Editorial Policy)</h1>
        <p>UPCOS निष्पक्ष, तथ्य-आधारित और सत्यापित सूचना प्रकाशन के उच्चतम मानकों का पालन करता है।</p>
        ${NAV_LINKS}
      </article>
    `
  },
  {
    path: 'fact-checking-policy',
    title: 'तथ्य-जांच नीति (Fact-Checking Policy) – UPCOS',
    description: 'शासनादेशों एवं सरकारी परिपत्रों के सत्यापन की कठोर तथ्य-जांच प्रक्रिया।',
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: '2026-11-08',
    schema: {
      '@context': 'https://schema.org',
      ...makeBreadcrumbList([
        { name: 'Home', url: `${DOMAIN}/` },
        { name: 'Fact-Checking Policy', url: `${DOMAIN}/fact-checking-policy` }
      ])
    },
    bodySnippet: `
      <article style="max-width:800px;margin:2rem auto;padding:1rem;font-family:sans-serif;">
        <h1>तथ्य-जांच नीति (Fact-Checking Policy)</h1>
        <p>प्रत्येक सरकारी आदेश को प्रकाशित करने से पूर्व मूल विभागीय पोर्टल एवं पत्रांक संख्या से सत्यापित किया जाता है।</p>
        ${NAV_LINKS}
      </article>
    `
  },
  {
    path: 'correction-policy',
    title: 'संशोधन एवं अद्यतन नीति (Corrections Policy) – UPCOS',
    description: 'पारदर्शी त्रुटि सुधार, सुधार समय-सारिणी एवं पाठक फीडबैक तंत्र।',
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: '2026-11-08',
    schema: {
      '@context': 'https://schema.org',
      ...makeBreadcrumbList([
        { name: 'Home', url: `${DOMAIN}/` },
        { name: 'Corrections Policy', url: `${DOMAIN}/correction-policy` }
      ])
    },
    bodySnippet: `
      <article style="max-width:800px;margin:2rem auto;padding:1rem;font-family:sans-serif;">
        <h1>संशोधन एवं अद्यतन नीति (Corrections Policy)</h1>
        <p>यदि किसी लेख या आंकड़े में कोई त्रुटि पाई जाती है, तो सत्यापन के पश्चात 24 घंटे के भीतर पारदर्शी सुधार किया जाता है।</p>
        ${NAV_LINKS}
      </article>
    `
  },
  {
    path: 'copyright-policy',
    title: 'कॉपीराइट नीति (Copyright Policy) – UPCOS',
    description: 'सार्वजनिक शासकीय परिपत्र, उचित उपयोग (Fair Use) एवं कॉपीराइट सुरक्षा दिशानिर्देश।',
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: '2026-11-08',
    schema: {
      '@context': 'https://schema.org',
      ...makeBreadcrumbList([
        { name: 'Home', url: `${DOMAIN}/` },
        { name: 'Copyright Policy', url: `${DOMAIN}/copyright-policy` }
      ])
    },
    bodySnippet: `
      <article style="max-width:800px;margin:2rem auto;padding:1rem;font-family:sans-serif;">
        <h1>कॉपीराइट नीति (Copyright Policy)</h1>
        <p>पोर्टल के मूल संपादकीय विश्लेषण कॉपीराइट द्वारा सुरक्षित हैं, जबकि सार्वजनिक शासनादेश जन-सूचना एवं उचित उपयोग के अंतर्गत संदर्भित किए जाते हैं।</p>
        ${NAV_LINKS}
      </article>
    `
  },
  {
    path: 'advertise',
    title: 'विज्ञापन नीति (Advertise With Us) – UPCOS',
    description: 'कर्मचारी हितैषी विज्ञापन दिशानिर्देश एवं Google AdSense अनुपालन नीति।',
    changefreq: 'monthly',
    priority: '0.6',
    lastmod: '2026-11-08',
    schema: {
      '@context': 'https://schema.org',
      ...makeBreadcrumbList([
        { name: 'Home', url: `${DOMAIN}/` },
        { name: 'Advertise', url: `${DOMAIN}/advertise` }
      ])
    },
    bodySnippet: `
      <article style="max-width:800px;margin:2rem auto;padding:1rem;font-family:sans-serif;">
        <h1>विज्ञापन नीति (Advertise With Us)</h1>
        <p>UPCOS पर सभी विज्ञापन Google AdSense तथा पारदर्शी संपादकीय मानकों के अनुरूप प्रदर्शित किए जाते हैं।</p>
        ${NAV_LINKS}
      </article>
    `
  },
  {
    path: 'sitemap',
    title: 'साइटमैप (Sitemap) – UPCOS',
    description: 'UPCOS पोर्टल के सभी समाचार, शासनादेश, विभाग, भर्ती सूचनाएं एवं नीति पृष्ठों की संपूर्ण सूची।',
    changefreq: 'daily',
    priority: '0.7',
    lastmod: latestDate,
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'CollectionPage', name: 'UPCOS Website Sitemap', url: `${DOMAIN}/sitemap`, inLanguage: 'hi-IN' },
        makeBreadcrumbList([
          { name: 'Home', url: `${DOMAIN}/` },
          { name: 'Sitemap', url: `${DOMAIN}/sitemap` }
        ])
      ]
    },
    bodySnippet: `
      <main style="max-width:900px;margin:2rem auto;padding:1rem;font-family:sans-serif;line-height:1.7;">
        <h1>UPCOS वेबसाइट साइटमैप (Complete Sitemap)</h1>
        <p>ताज़ा समाचार, सेवायोजन भर्ती सूचनाएं, शासनादेश, विभाग और नीति पृष्ठों की संपूर्ण सूची (<a href="/sitemap.xml">XML Sitemap</a> | <a href="/news-sitemap.xml">Google News Sitemap</a>)।</p>
        <h2>नवीनतम समाचार एवं भर्ती अपडेट</h2>
        <ul>
          ${newsList
            .map((n) => `<li><a href="/news/${escapeHtmlAttr(n.slug)}">${escapeHtmlText(n.title)}</a> (${escapeHtmlText(n.publicationDate)})</li>`)
            .join('\n          ')}
        </ul>
        <h2>प्रमुख शासनादेश (Government Orders)</h2>
        <ul>
          ${ordersList
            .map((o) => `<li><a href="/shasanadesh/${escapeHtmlAttr(o.slug)}">${escapeHtmlText(o.orderNumber)}: ${escapeHtmlText(o.title)}</a></li>`)
            .join('\n          ')}
        </ul>
        <h2>सरकारी विभाग (Departments)</h2>
        <ul>
          ${departmentsList
            .map((d) => `<li><a href="/departments/${escapeHtmlAttr(d.id)}">${escapeHtmlText(d.name)} (${escapeHtmlText(d.englishName)})</a></li>`)
            .join('\n          ')}
        </ul>
        ${NAV_LINKS}
      </main>
    `
  }
];

// Dynamically build routes for all News Articles
const newsRoutes = newsList.map((article, idx) => {
  const canonicalUrl = `${DOMAIN}/news/${article.slug}`;
  const jobNodes = Array.isArray(article.jobPostings)
    ? article.jobPostings.map((job, jIdx) => {
        const hasRange =
          typeof job.salaryMinValue === 'number' &&
          typeof job.salaryMaxValue === 'number' &&
          job.salaryMaxValue > job.salaryMinValue;
        return {
          '@type': 'JobPosting',
          '@id': `${canonicalUrl}#job-${job.identifier || jIdx + 1}`,
          title: job.title,
          description: job.description,
          url: canonicalUrl,
          directApply: false,
          identifier: {
            '@type': 'PropertyValue',
            name: 'UP Sewayojan Outsource',
            value: job.identifier || `${article.id}-${jIdx + 1}`
          },
          datePosted: job.datePosted || article.publicationDate,
          validThrough: job.validThrough,
          employmentType: job.employmentType || 'CONTRACTOR',
          hiringOrganization: {
            '@type': 'Organization',
            name: job.hiringOrganization,
            sameAs: job.sameAs || article.sourceUrl || 'https://sewayojan.up.nic.in',
            logo: `${DOMAIN}/logo.png`
          },
          jobLocation: {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              addressLocality: job.locality,
              addressRegion: job.region || 'Uttar Pradesh',
              addressCountry: job.country || 'IN'
            }
          },
          applicantLocationRequirements: {
            '@type': 'State',
            name: job.region || 'Uttar Pradesh'
          },
          baseSalary: {
            '@type': 'MonetaryAmount',
            currency: job.salaryCurrency || 'INR',
            value: hasRange
              ? {
                  '@type': 'QuantitativeValue',
                  minValue: job.salaryMinValue,
                  maxValue: job.salaryMaxValue,
                  unitText: job.salaryUnit || 'MONTH'
                }
              : {
                  '@type': 'QuantitativeValue',
                  value: job.salaryValue,
                  unitText: job.salaryUnit || 'MONTH'
                }
          },
          ...(job.qualifications ? { qualifications: job.qualifications } : {}),
          ...(job.experienceRequirements ? { experienceRequirements: job.experienceRequirements } : {})
        };
      })
    : [];

  const fullText = [article.shortDescription || '', ...(Array.isArray(article.fullContent) ? article.fullContent : [])].join(' ');
  const wordCount = fullText.trim().split(/\s+/).filter(Boolean).length;

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsArticle',
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
        headline: article.title,
        alternativeHeadline: article.englishTitle || article.title,
        image: [resolveAbsoluteImageUrl(article.featuredImage)],
        datePublished: article.publicationDate,
        dateModified: article.publicationDate,
        inLanguage: 'hi-IN',
        isAccessibleForFree: true,
        articleSection: article.category,
        wordCount,
        keywords: Array.isArray(article.tags) ? article.tags.join(', ') : '',
        author: [{ '@type': 'Person', name: article.author, url: `${DOMAIN}/about-us` }],
        publisher: {
          '@type': 'NewsMediaOrganization',
          '@id': `${DOMAIN}/#organization`,
          name: 'UPCOS – UP Outsource Seva Nigam',
          url: DOMAIN,
          logo: { '@type': 'ImageObject', url: `${DOMAIN}/logo.png`, width: 1024, height: 1024 }
        },
        description: article.shortDescription
      },
      makeBreadcrumbList([
        { name: 'Home', url: `${DOMAIN}/` },
        { name: 'News', url: `${DOMAIN}/news` },
        { name: article.title, url: canonicalUrl }
      ]),
      ...jobNodes
    ]
  };

  const highlightsHtml = Array.isArray(article.keyHighlights)
    ? `<ul>${article.keyHighlights.map((h) => `<li>${escapeHtmlText(h)}</li>`).join('')}</ul>`
    : '';
  const bodyHtml = renderFullContentHtml(article.fullContent);

  return {
    path: `news/${article.slug}`,
    title: `${article.title} | UP Outsource Seva Nigam`,
    description: article.shortDescription,
    image: resolveAbsoluteImageUrl(article.featuredImage),
    ogType: 'article',
    publishedTime: article.publicationDate,
    section: article.category,
    changefreq: idx < 5 ? 'daily' : 'weekly',
    priority: idx < 3 ? '0.95' : '0.85',
    lastmod: article.publicationDate || latestDate,
    schema,
    bodySnippet: `
      <article style="max-width:850px;margin:2rem auto;padding:1rem;font-family:sans-serif;line-height:1.7;">
        <h1>${escapeHtmlText(article.title)}</h1>
        <p style="font-size:0.9rem;color:#475569;">
          लेखक: <strong>${escapeHtmlText(article.author || 'रोजगार डेस्क, UPCOS')}</strong> |
          प्रकाशन तिथि: <time datetime="${escapeHtmlAttr(article.publicationDate || latestDate)}">${escapeHtmlText(article.publicationDate || latestDate)}</time>
        </p>
        <figure style="margin:1rem 0;">
          <img src="${escapeHtmlAttr(article.featuredImage || '/og-banner.jpg')}" alt="${escapeHtmlAttr(article.title)}" width="1200" height="675" style="max-width:100%;height:auto;border-radius:10px;" />
        </figure>
        <p>${escapeHtmlText(article.shortDescription)}</p>
        ${highlightsHtml}
        ${bodyHtml}
        <p>स्रोत: ${escapeHtmlText(article.source)}</p>
        ${NAV_LINKS}
      </article>
    `
  };
});

// Dynamically build routes for all Government Orders
const orderRoutes = ordersList.map((order) => {
  const canonicalUrl = `${DOMAIN}/shasanadesh/${order.slug}`;
  return {
    path: `shasanadesh/${order.slug}`,
    title: `${order.orderNumber}: ${order.title} – UPCOS शासनादेश`,
    description: order.summary,
    ogType: 'article',
    changefreq: 'monthly',
    priority: order.isImportant ? '0.90' : '0.80',
    lastmod: order.date || latestDate,
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'DigitalDocument',
          '@id': `${canonicalUrl}#order`,
          name: order.title,
          identifier: order.orderNumber,
          datePublished: order.date,
          description: order.summary,
          inLanguage: 'hi-IN',
          url: canonicalUrl,
          publisher: {
            '@type': 'Organization',
            name: 'UP Outsource Seva Nigam',
            url: DOMAIN
          }
        },
        makeBreadcrumbList([
          { name: 'Home', url: `${DOMAIN}/` },
          { name: 'Shasanadesh', url: `${DOMAIN}/shasanadesh` },
          { name: order.orderNumber, url: canonicalUrl }
        ])
      ]
    },
    bodySnippet: `
      <article style="max-width:850px;margin:2rem auto;padding:1rem;font-family:sans-serif;line-height:1.7;">
        <h1>${escapeHtmlText(order.orderNumber)}: ${escapeHtmlText(order.title)}</h1>
        <p>${escapeHtmlText(order.summary)}</p>
        <ul>${(order.keyPoints || []).map((k) => `<li>${escapeHtmlText(k)}</li>`).join('')}</ul>
        ${NAV_LINKS}
      </article>
    `
  };
});

// Dynamically build routes for all Departments
const deptRoutes = departmentsList.map((dept) => {
  const canonicalUrl = `${DOMAIN}/departments/${dept.id}`;
  const relatedNews = newsList.filter(
    (n) => n.departmentId === dept.id || (n.department && n.department.includes(dept.name.substring(0, 4)))
  );
  return {
    path: `departments/${dept.id}`,
    title: `${dept.name} (${dept.englishName}) – आउटसोर्स समाचार व शासनादेश | UPCOS`,
    description: dept.description,
    changefreq: 'weekly',
    priority: '0.80',
    lastmod: latestDate,
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          '@id': `${canonicalUrl}#collection`,
          name: dept.name,
          description: dept.description,
          url: canonicalUrl,
          inLanguage: 'hi-IN'
        },
        makeBreadcrumbList([
          { name: 'Home', url: `${DOMAIN}/` },
          { name: 'Departments', url: `${DOMAIN}/departments` },
          { name: dept.name, url: canonicalUrl }
        ])
      ]
    },
    bodySnippet: `
      <main style="max-width:850px;margin:2rem auto;padding:1rem;font-family:sans-serif;line-height:1.7;">
        <h1>${escapeHtmlText(dept.name)} (${escapeHtmlText(dept.englishName)})</h1>
        <p>${escapeHtmlText(dept.description)}</p>
        ${
          relatedNews.length > 0
            ? `<h2>विभागीय समाचार एवं भर्तियां</h2><ul>${relatedNews
                .map((n) => `<li><a href="/news/${escapeHtmlAttr(n.slug)}">${escapeHtmlText(n.title)}</a></li>`)
                .join('')}</ul>`
            : ''
        }
        ${NAV_LINKS}
      </main>
    `
  };
});

const allRoutes = [...staticRoutes, ...newsRoutes, ...orderRoutes, ...deptRoutes];

// Write updated root dist/index.html with crawlable homepage markup and EmployeeHub FAQPage JSON-LD
const homeFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': `${DOMAIN}/#faq`,
  url: `${DOMAIN}/`,
  inLanguage: 'hi-IN',
  name: 'कर्मचारी सूचना हब – अक्सर पूछे जाने वाले प्रश्न (FAQ)',
  mainEntity: faqsList.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer }
  }))
};
const rootHtml = template
  .replace(/<meta name="publish_date" content=".*?" \/>/i, `<meta name="publish_date" content="${escapeHtmlAttr(latestDate)}" />`)
  .replace(/<meta name="date" content=".*?" \/>/i, `<meta name="date" content="${escapeHtmlAttr(latestDate)}" />`)
  .replace(/<meta property="article:published_time" content=".*?" \/>/i, `<meta property="article:published_time" content="${escapeHtmlAttr(latestDate)}T09:30:00+05:30" />`)
  .replace(/<meta property="article:modified_time" content=".*?" \/>/i, `<meta property="article:modified_time" content="${escapeHtmlAttr(latestDate)}T09:30:00+05:30" />`)
  .replace(/<meta property="og:updated_time" content=".*?" \/>/i, `<meta property="og:updated_time" content="${escapeHtmlAttr(latestDate)}T09:30:00+05:30" />`)
  .replace(
    '</head>',
    `  <script id="jsonld-home-faq-schema" type="application/ld+json">${JSON.stringify(homeFaqSchema)}</script>\n</head>`
  )
  .replace('<div id="root"></div>', `<div id="root">${homeBodySnippet}</div>`);
fs.writeFileSync(BASE_HTML, rootHtml, 'utf-8');
console.log('Prerendered: /index.html');

// Prerender every route HTML file
allRoutes.forEach((r) => {
  const targetDir = path.join(DIST_DIR, r.path);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const canonicalUrl = `${DOMAIN}/${r.path}`;
  const safeTitle = escapeHtmlAttr(r.title);
  const safeTitleText = escapeHtmlText(r.title);
  const safeDesc = escapeHtmlAttr(r.description);
  const routeDate = r.publishedTime || r.lastmod || latestDate;
  const routeDateIso = routeDate.includes('T') ? routeDate : `${routeDate}T09:30:00+05:30`;
  const routeDateShort = routeDate.slice(0, 10);
  let html = template;

  html = html.replace(/<title>.*?<\/title>/i, `<title>${safeTitleText}</title>`);
  html = html.replace(/<meta name="title" content=".*?" \/>/i, `<meta name="title" content="${safeTitle}" />`);
  html = html.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${safeDesc}" />`);
  html = html.replace(/<meta name="publish_date" content=".*?" \/>/i, `<meta name="publish_date" content="${escapeHtmlAttr(routeDateShort)}" />`);
  html = html.replace(/<meta name="date" content=".*?" \/>/i, `<meta name="date" content="${escapeHtmlAttr(routeDateShort)}" />`);
  html = html.replace(/<meta property="article:published_time" content=".*?" \/>/i, `<meta property="article:published_time" content="${escapeHtmlAttr(routeDateIso)}" />`);
  html = html.replace(/<meta property="article:modified_time" content=".*?" \/>/i, `<meta property="article:modified_time" content="${escapeHtmlAttr(routeDateIso)}" />`);
  html = html.replace(/<meta property="og:updated_time" content=".*?" \/>/i, `<meta property="og:updated_time" content="${escapeHtmlAttr(routeDateIso)}" />`);
  html = html.replace(/<link rel="canonical" href=".*?" \/>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
  html = html.replace(/<link rel="alternate" hreflang="hi-IN" href=".*?" \/>/i, `<link rel="alternate" hreflang="hi-IN" href="${canonicalUrl}" />`);
  html = html.replace(/<link rel="alternate" hreflang="x-default" href=".*?" \/>/i, `<link rel="alternate" hreflang="x-default" href="${canonicalUrl}" />`);
  html = html.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${safeTitle}" />`);
  html = html.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${safeDesc}" />`);
  html = html.replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
  html = html.replace(/<meta property="og:image:alt" content=".*?" \/>/i, `<meta property="og:image:alt" content="${safeTitle}" />`);
  html = html.replace(/<meta name="twitter:url" content=".*?" \/>/i, `<meta name="twitter:url" content="${canonicalUrl}" />`);
  html = html.replace(/<meta name="twitter:title" content=".*?" \/>/i, `<meta name="twitter:title" content="${safeTitle}" />`);
  html = html.replace(/<meta name="twitter:description" content=".*?" \/>/i, `<meta name="twitter:description" content="${safeDesc}" />`);
  html = html.replace(/<meta name="twitter:image:alt" content=".*?" \/>/i, `<meta name="twitter:image:alt" content="${safeTitle}" />`);

  if (r.ogType) {
    html = html.replace(/<meta property="og:type" content=".*?" \/>/i, `<meta property="og:type" content="${escapeHtmlAttr(r.ogType)}" />`);
  }

  const resolvedImg = resolveAbsoluteImageUrl(r.image);
  const safeImg = escapeHtmlAttr(resolvedImg);
  html = html.replace(/<meta property="og:image" content=".*?" \/>/i, `<meta property="og:image" content="${safeImg}" />`);
  html = html.replace(/<meta property="og:image:secure_url" content=".*?" \/>/i, `<meta property="og:image:secure_url" content="${safeImg}" />`);
  html = html.replace(/<meta name="twitter:image" content=".*?" \/>/i, `<meta name="twitter:image" content="${safeImg}" />`);

  if (r.image && resolvedImg !== `${DOMAIN}/og-banner.jpg`) {
    // Remove default 1376x768 banner dimensions when an article uses its own photo
    html = html.replace(/\s*<meta property="og:image:type" content=".*?" \/>/i, '');
    html = html.replace(/\s*<meta property="og:image:width" content=".*?" \/>/i, '');
    html = html.replace(/\s*<meta property="og:image:height" content=".*?" \/>/i, '');
  }

  const extraHeadTags = [];
  if (r.section) {
    extraHeadTags.push(`  <meta property="article:section" content="${escapeHtmlAttr(r.section)}" />`);
  }
  if (r.schema) {
    extraHeadTags.push(`  <script id="jsonld-article-schema" type="application/ld+json">${JSON.stringify(r.schema)}</script>`);
  }
  if (extraHeadTags.length > 0) {
    html = html.replace('</head>', `${extraHeadTags.join('\n')}\n</head>`);
  }

  const metaStrip = !r.bodySnippet.includes('<time ')
    ? `<div style="max-width:850px;margin:1rem auto 0;padding:0 1rem;font-family:sans-serif;font-size:0.85rem;color:#475569;">प्रकाशक: <strong>UPCOS Editorial Team</strong> | अद्यतन तिथि: <time datetime="${escapeHtmlAttr(routeDateIso)}">${escapeHtmlText(routeDateShort)}</time></div>`
    : '';
  const visualBanner = !r.bodySnippet.includes('<img ')
    ? `<div style="max-width:850px;margin:1rem auto 0;padding:0 1rem;"><img src="/og-banner.jpg" alt="${safeTitle}" width="1376" height="768" style="max-width:100%;height:auto;border-radius:10px;" /></div>`
    : '';

  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${SITE_HEADER}${metaStrip}${visualBanner}${r.bodySnippet}${SITE_FOOTER}</div>`
  );

  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf-8');
});

console.log(`Prerendered ${allRoutes.length + 1} routes successfully.`);

// Generate synced XML Sitemap with zero broken URLs
const sitemapEntries = [
  { loc: `${DOMAIN}/`, lastmod: latestDate, changefreq: 'daily', priority: '1.0' },
  ...allRoutes.map((r) => ({
    loc: `${DOMAIN}/${r.path}`,
    lastmod: r.lastmod || latestDate,
    changefreq: r.changefreq || 'weekly',
    priority: r.priority || '0.8'
  }))
];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries
  .map(
    (u) => `  <url>
    <loc>${escapeHtmlText(u.loc)}</loc>
    <lastmod>${escapeHtmlText(u.lastmod)}</lastmod>
    <changefreq>${escapeHtmlText(u.changefreq)}</changefreq>
    <priority>${escapeHtmlText(u.priority)}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemapXml, 'utf-8');
fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml, 'utf-8');
console.log(`Generated sitemap.xml with ${sitemapEntries.length} verified URLs.`);

// Generate Google News Sitemap (news-sitemap.xml)
const newsSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${newsList
  .map((article) => {
    const pubDate = article.publicationDate || latestDate;
    const keywords = Array.isArray(article.tags) ? article.tags.slice(0, 8).join(', ') : '';
    return `  <url>
    <loc>${escapeHtmlText(`${DOMAIN}/news/${article.slug}`)}</loc>
    <news:news>
      <news:publication>
        <news:name>UPCOS – UP Outsource Seva Nigam</news:name>
        <news:language>hi</news:language>
      </news:publication>
      <news:publication_date>${escapeHtmlText(pubDate)}</news:publication_date>
      <news:title>${escapeHtmlText(article.title)}</news:title>${
        keywords ? `\n      <news:keywords>${escapeHtmlText(keywords)}</news:keywords>` : ''
      }
    </news:news>
  </url>`;
  })
  .join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(PUBLIC_DIR, 'news-sitemap.xml'), newsSitemapXml, 'utf-8');
fs.writeFileSync(path.join(DIST_DIR, 'news-sitemap.xml'), newsSitemapXml, 'utf-8');
console.log(`Generated news-sitemap.xml with ${newsList.length} news articles.`);
