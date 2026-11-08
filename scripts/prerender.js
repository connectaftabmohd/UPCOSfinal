/**
 * Static HTML Prerenderer for UPCOS
 * Injects static SEO headers, H1 headings, content bodies, and canonical tags
 * into individual route index.html files inside dist/ during build.
 */

import fs from 'fs';
import path from 'path';

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const BASE_HTML = path.join(DIST_DIR, 'index.html');
const DOMAIN = 'https://upcos.netlify.app';

if (!fs.existsSync(BASE_HTML)) {
  console.log('Skipping prerender: dist/index.html does not exist yet.');
  process.exit(0);
}

const template = fs.readFileSync(BASE_HTML, 'utf-8');

const routes = [
  {
    path: 'about-us',
    title: 'हमारे बारे में (About Us) – UP Outsource Seva Nigam',
    description: 'UPCOS का परिचय, उद्देश्य, स्वतंत्र पहचान और उत्तर प्रदेश आउटसोर्सिंग कर्मचारियों के सशक्तिकरण का मिशन।',
    h1: 'हमारे बारे में (About UPCOS Portal)',
    bodySnippet: `
      <article style="max-width:800px;margin:2rem auto;padding:1rem;font-family:sans-serif;">
        <h1>हमारे बारे में (About UPCOS Portal)</h1>
        <p><strong>UP Outsource Seva Nigam</strong> उत्तर प्रदेश राज्य के विभिन्न सरकारी विभागों एवं निगमों में कार्यरत लाखों आउटसोर्स, संविदा एवं दैनिक वेतनभोगी कर्मचारियों को समर्पित एक स्वतंत्र एवं निष्पक्ष सूचना व जागरूकता पोर्टल है।</p>
        <p>इस पोर्टल का उद्देश्य कर्मचारियों को उनके विधिक अधिकारों, न्यूनतम मानदेय शासनादेशों, ईपीएफ, ईएसआई एवं सेवायोजन भर्ती प्रक्रियाओं से संबंधित सटीक व प्रामाणिक जानकारी उपलब्ध कराना है।</p>
        <nav><a href="/">मुख्य पृष्ठ</a> | <a href="/news">ताज़ा खबरें</a> | <a href="/contact-us">संपर्क करें</a></nav>
      </article>
    `
  },
  {
    path: 'privacy-policy',
    title: 'गोपनीयता नीति (Privacy Policy) – UP Outsource Seva Nigam',
    description: 'डेटा गोपनीयता, कुकीज, Google AdSense अनुपालन एवं उपयोगकर्ता अधिकारों का संपूर्ण विवरण।',
    h1: 'गोपनीयता नीति (Privacy Policy)',
    bodySnippet: `
      <article style="max-width:800px;margin:2rem auto;padding:1rem;font-family:sans-serif;">
        <h1>गोपनीयता नीति (Privacy Policy)</h1>
        <p>UPCOS आपकी गोपनीयता का पूर्ण सम्मान करता है। हम उपयोगकर्ता डेटा की सुरक्षा और Google प्रकाशक नीतियों का कठोरता से पालन करते हैं।</p>
        <h2>कुकीज एवं Google AdSense</h2>
        <p>हम वेबसाइट विश्लेषण एवं प्रासंगिक विज्ञापनों के प्रदर्शन हेतु मानक कुकीज का उपयोग करते हैं। Google AdSense विज्ञापनों के लिए कुकीज का उपयोग कर सकता है।</p>
        <nav><a href="/">होम</a> | <a href="/terms-and-conditions">नियम व शर्तें</a> | <a href="/disclaimer">अस्वीकरण</a></nav>
      </article>
    `
  },
  {
    path: 'disclaimer',
    title: 'अस्वीकरण एवं विधिक नीति (Disclaimer) – UP Outsource Seva Nigam',
    description: 'गैर-सरकारी स्पष्टीकरण, अनधिकृत सूचना निषेध एवं विधिक सूचना अस्वीकरण।',
    h1: 'अस्वीकरण एवं विधिक सूचना (Disclaimer)',
    bodySnippet: `
      <article style="max-width:800px;margin:2rem auto;padding:1rem;font-family:sans-serif;">
        <h1>अस्वीकरण एवं विधिक सूचना (Disclaimer)</h1>
        <p><strong>महत्वपूर्ण अस्वीकरण:</strong> UP Outsource Seva Nigam News & Information एक स्वतंत्र सूचना मंच है। यह उत्तर प्रदेश सरकार अथवा किसी सरकारी विभाग की आधिकारिक वेबसाइट नहीं है।</p>
        <p>पोर्टल पर प्रकाशित जानकारी केवल जन-जागरूकता के उद्देश्य से है। किसी भी प्रशासनिक निर्णय से पूर्व कृपया shasanadesh.up.gov.in पर मूल शासनादेश का अवलोकन करें।</p>
      </article>
    `
  },
  {
    path: 'terms-and-conditions',
    title: 'नियम एवं शर्तें (Terms & Conditions) – UP Outsource Seva Nigam',
    description: 'UPCOS वेबसाइट उपयोग की सामान्य शर्तें, बौद्धिक संपदा अधिकार एवं आचरण नियम।',
    h1: 'नियम एवं शर्तें (Terms & Conditions of Use)',
    bodySnippet: `
      <article style="max-width:800px;margin:2rem auto;padding:1rem;font-family:sans-serif;">
        <h1>नियम एवं शर्तें (Terms of Use)</h1>
        <p>इस पोर्टल का उपयोग करने से पूर्व कृपया इन नियमों एवं शर्तों को ध्यानपूर्वक पढ़ें। पोर्टल का उपयोग इन शर्तों की स्वीकृति माना जाएगा।</p>
      </article>
    `
  },
  {
    path: 'contact-us',
    title: 'संपर्क सूत्र एवं संपादकीय डेस्क – UP Outsource Seva Nigam',
    description: 'संपादकीय टीम से संपर्क, शिकायत निवारण, सूचना सत्यापन एवं सुझाव प्रेषण प्रपत्र।',
    h1: 'संपर्क सूत्र (Contact Editorial Desk)',
    bodySnippet: `
      <article style="max-width:800px;margin:2rem auto;padding:1rem;font-family:sans-serif;">
        <h1>संपर्क सूत्र (Contact Us)</h1>
        <p>किसी भी समाचार, शासनादेश सत्यापन, सुधार या प्रश्न के लिए हमारी संपादकीय टीम से संपर्क करें: contact@uposn.in</p>
      </article>
    `
  },
  {
    path: 'news/post-up-outsource-salary-hike-2026',
    title: 'उत्तर प्रदेश आउटसोर्सिंग कर्मियों के मानदेय में ऐतिहासिक वृद्धि (₹15,396 से ₹39,000) – UPCOS',
    description: 'उत्तर प्रदेश सरकार ने सरकारी विभागों में कार्यरत आउटसोर्सिंग कर्मचारियों के लिए नई मासिक पारिश्रमिक दरें निर्धारित की हैं। श्रेणी-1 से 4 तक संपूर्ण वेतन व ईपीएफ/ईएसआई विवरण।',
    h1: 'उत्तर प्रदेश आउटसोर्सिंग कर्मचारियों के लिए नई पारिश्रमिक दरें (₹15,396 से ₹39,000)',
    bodySnippet: `
      <article style="max-width:800px;margin:2rem auto;padding:1rem;font-family:sans-serif;">
        <h1>उत्तर प्रदेश आउटसोर्सिंग कर्मचारियों के लिए नई पारिश्रमिक दरें निर्धारित</h1>
        <p>उत्तर प्रदेश शासन द्वारा जारी शासनादेश के अनुसार आउटसोर्स कर्मियों को 4 श्रेणियों में वर्गीकृत कर ₹15,396 से लेकर ₹39,000 तक मानदेय निर्धारित किया गया है।</p>
        <h2>श्रेणीवार मानदेय विवरण:</h2>
        <ul>
          <li>श्रेणी-1: ₹39,000 (हाथ में ₹39,000)</li>
          <li>श्रेणी-2: ₹21,947 (हाथ में ₹19,148.76)</li>
          <li>श्रेणी-3: ₹19,446 (हाथ में ₹16,966.64)</li>
          <li>श्रेणी-4: ₹17,646 (हाथ में ₹15,396.14)</li>
        </ul>
        <p>आधिकारिक शासनादेश संख्या: 3/2026/1/1511176/2026</p>
      </article>
    `
  }
];

routes.forEach((r) => {
  const targetDir = path.join(DIST_DIR, r.path);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const canonicalUrl = `${DOMAIN}/${r.path}`;
  let html = template;

  // Replace Title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${r.title}</title>`);
  
  // Replace Description
  html = html.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${r.description}" />`);

  // Replace Canonical
  html = html.replace(/<link rel="canonical" href=".*?" \/>/i, `<link rel="canonical" href="${canonicalUrl}" />`);

  // Replace og:title & og:description
  html = html.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${r.title}" />`);
  html = html.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${r.description}" />`);
  html = html.replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${canonicalUrl}" />`);

  // Inject content inside root div for crawlers
  html = html.replace('<div id="root"></div>', `<div id="root">${r.bodySnippet}</div>`);

  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf-8');
  console.log(`Prerendered: /${r.path}/index.html`);
});

console.log('Static prerender completed successfully.');
