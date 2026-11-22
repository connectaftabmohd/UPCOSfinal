/**
 * Static HTML Prerenderer for UPCOS
 * Injects static SEO headers, H1 headings, content bodies, and canonical tags
 * into root dist/index.html and individual route index.html files during build.
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

const NAV_LINKS = `
  <nav aria-label="Primary Portal Navigation" style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid #e2e8f0;font-size:0.9rem;">
    <a href="/">मुख्य पृष्ठ (Home)</a> |
    <a href="/news">ताज़ा खबरें (News)</a> |
    <a href="/shasanadesh">शासनादेश (Orders)</a> |
    <a href="/departments">विभाग (Departments)</a> |
    <a href="/employee-hub">कर्मचारी हब (Employee Hub)</a> |
    <a href="/about-us">हमारे बारे में (About Us)</a> |
    <a href="/contact-us">संपर्क करें (Contact)</a> |
    <a href="/privacy-policy">गोपनीयता नीति (Privacy Policy)</a> |
    <a href="/disclaimer">अस्वीकरण (Disclaimer)</a> |
    <a href="/terms-and-conditions">नियम एवं शर्तें (Terms)</a>
  </nav>
`;

// Inject meaningful crawlable content into root dist/index.html for AdSense & search bots
const homeBodySnippet = `
  <main style="max-width:900px;margin:2rem auto;padding:1.5rem;font-family:sans-serif;line-height:1.7;">
    <h1>UPCOS – उत्तर प्रदेश आउटसोर्स सेवा एवं कर्मचारी सूचना पोर्टल</h1>
    <p><strong>UP Outsource Seva Nigam News & Information</strong> उत्तर प्रदेश के सरकारी विभागों एवं निगमों में कार्यरत आउटसोर्सिंग एवं संविदा कर्मचारियों के लिए समर्पित एक स्वतंत्र समाचार एवं सूचना मंच है।</p>
    <section>
      <h2>प्रमुख समाचार एवं नवीनतम शासनादेश</h2>
      <ul>
        <li><a href="/news/sant-kabir-nagar-basic-shiksha-vibhag-educator-instructor-vacancy-2026">संत कबीर नगर बेसिक शिक्षा विभाग भर्ती 2026: Educator व ITI Instructor (अंतिम तिथि 22-11-2026)</a></li>
        <li><a href="/news/mahila-kalyan-vibhag-hamirpur-outsourcing-bharti-2026-case-worker-mts-operator">महिला कल्याण विभाग हमीरपुर भर्ती 2026: Case Worker, MTS, Computer Operator व District Coordinator (अंतिम तिथि 20-11-2026)</a></li>
        <li><a href="/news/up-outsourcing-employees-new-salary-rates-15396-to-39000-shasanadesh-2026">उत्तर प्रदेश आउटसोर्सिंग कर्मियों के मानदेय में वृद्धि: ₹15,396 से ₹39,000 मासिक पारिश्रमिक एवं EPF/ESI विवरण</a></li>
        <li><a href="/shasanadesh/order-upcos-wages-2026">शासनादेश संख्या 3/2026/1/1511176/2026: श्रेणीवार पारिश्रमिक एवं सेवा शर्तें</a></li>
      </ul>
    </section>
    <section>
      <h2>स्वतंत्र सूचना अस्वीकरण</h2>
      <p>यह एक स्वतंत्र सूचना और जन-जागरूकता पोर्टल है और उत्तर प्रदेश सरकार या किसी सरकारी विभाग की आधिकारिक वेबसाइट नहीं है। आधिकारिक सत्यापन हेतु सदैव shasanadesh.up.gov.in एवं sewayojan.up.nic.in का उपयोग करें।</p>
    </section>
    ${NAV_LINKS}
  </main>
`;

const routes = [
  {
    path: 'news',
    title: 'ताज़ा खबरें एवं विभागीय समाचार – UP Outsource Seva Nigam',
    description: 'उत्तर प्रदेश आउटसोर्सिंग एवं संविदा कर्मचारियों से जुड़े नवीनतम समाचार, मानदेय वृद्धि एवं सेवायोजन भर्ती सूचनाएं।',
    bodySnippet: `
      <main style="max-width:800px;margin:2rem auto;padding:1rem;font-family:sans-serif;">
        <h1>ताज़ा खबरें एवं विभागीय समाचार (Latest UP Outsource News)</h1>
        <p>उत्तर प्रदेश के विभिन्न विभागों में कार्यरत आउटसोर्स कर्मियों के वेतन, ईपीएफ, ईएसआई और सेवा शर्तों से जुड़े नवीनतम अपडेट।</p>
        <ul>
          <li><a href="/news/sant-kabir-nagar-basic-shiksha-vibhag-educator-instructor-vacancy-2026">संत कबीर नगर बेसिक शिक्षा विभाग आउटसोर्सिंग भर्ती 2026 (Educator व Instructor)</a></li>
          <li><a href="/news/mahila-kalyan-vibhag-hamirpur-outsourcing-bharti-2026-case-worker-mts-operator">महिला कल्याण विभाग हमीरपुर आउटसोर्सिंग भर्ती 2026 (अंतिम तिथि 20-11-2026)</a></li>
          <li><a href="/news/up-outsourcing-employees-new-salary-rates-15396-to-39000-shasanadesh-2026">आउटसोर्सिंग कर्मियों के लिए नई मासिक पारिश्रमिक दरें (₹15,396 से ₹39,000)</a></li>
        </ul>
        ${NAV_LINKS}
      </main>
    `
  },
  {
    path: 'shasanadesh',
    title: 'शासनादेश एवं विधिक परिपत्र (Shasanadesh) – UP Outsource Seva Nigam',
    description: 'उत्तर प्रदेश शासन के कार्मिक, वित्त एवं अन्य विभागों द्वारा जारी आउटसोर्सिंग संबंधी आधिकारिक शासनादेश।',
    bodySnippet: `
      <main style="max-width:800px;margin:2rem auto;padding:1rem;font-family:sans-serif;">
        <h1>उत्तर प्रदेश आउटसोर्सिंग शासनादेश संग्रह (Government Orders)</h1>
        <p>शासकीय विभागों एवं सचिवालय प्रशासन द्वारा जारी आउटसोर्स कर्मचारियों से संबंधित महत्वपूर्ण आदेश व परिपत्र।</p>
        <ul>
          <li><a href="/shasanadesh/order-upcos-wages-2026">शासनादेश संख्या 3/2026/1/1511176/2026 – श्रेणीवार मानदेय निर्धारण</a></li>
        </ul>
        ${NAV_LINKS}
      </main>
    `
  },
  {
    path: 'departments',
    title: 'विभागीय मार्गदर्शिका एवं सूचना – UP Outsource Seva Nigam',
    description: 'स्वास्थ्य, शिक्षा, पंचायती राज, ऊर्जा समेत उ.प्र. के सभी प्रमुख सरकारी विभागों के आउटसोर्स कर्मचारी आदेश।',
    bodySnippet: `
      <main style="max-width:800px;margin:2rem auto;padding:1rem;font-family:sans-serif;">
        <h1>उत्तर प्रदेश विभागीय आउटसोर्स सूचना केंद्र</h1>
        <p>चिकित्सा स्वास्थ्य, बेसिक शिक्षा, पंचायती राज, नगर विकास, ऊर्जा (UPPCL) एवं राजस्व विभाग से संबंधित विवरण।</p>
        ${NAV_LINKS}
      </main>
    `
  },
  {
    path: 'employee-hub',
    title: 'कर्मचारी सूचना हब एवं वेतन कैलकुलेटर – UP Outsource Seva Nigam',
    description: 'वेतन श्रेणियां, ईपीएफ-ईएसआई कैलकुलेटर, अवकाश नियम और कर्मचारी अधिकार संबंधी विस्तृत जानकारी।',
    bodySnippet: `
      <main style="max-width:800px;margin:2rem auto;padding:1rem;font-family:sans-serif;">
        <h1>कर्मचारी सूचना हब एवं वेतन कैलकुलेटर (Employee Hub)</h1>
        <p>आउटसोर्सिंग कर्मियों के लिए श्रेणीवार इन-हैंड वेतन गणना, EPF (12%) तथा ESI (0.75% / 3.25%) अंशदान मार्गदर्शिका।</p>
        ${NAV_LINKS}
      </main>
    `
  },
  {
    path: 'about-us',
    title: 'हमारे बारे में (About Us) – UP Outsource Seva Nigam',
    description: 'UPCOS का परिचय, उद्देश्य, स्वतंत्र पहचान और उत्तर प्रदेश आउटसोर्सिंग कर्मचारियों के सशक्तिकरण का मिशन।',
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
    path: 'privacy-policy',
    title: 'गोपनीयता नीति (Privacy Policy) – UP Outsource Seva Nigam',
    description: 'डेटा गोपनीयता, कुकीज, Google AdSense अनुपालन एवं उपयोगकर्ता अधिकारों का संपूर्ण विवरण।',
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
    title: 'अस्वीकरण एवं विधिक नीति (Disclaimer) – UP Outsource Seva Nigam',
    description: 'गैर-सरकारी स्पष्टीकरण, अनधिकृत सूचना निषेध एवं विधिक सूचना अस्वीकरण।',
    bodySnippet: `
      <article style="max-width:800px;margin:2rem auto;padding:1rem;font-family:sans-serif;">
        <h1>अस्वीकरण एवं विधिक सूचना (Disclaimer)</h1>
        <p><strong>महत्वपूर्ण अस्वीकरण:</strong> UP Outsource Seva Nigam News & Information एक स्वतंत्र सूचना मंच है। यह उत्तर प्रदेश सरकार अथवा किसी सरकारी विभाग की आधिकारिक वेबसाइट नहीं है।</p>
        <p>पोर्टल पर प्रकाशित जानकारी केवल जन-जागरूकता के उद्देश्य से है। किसी भी प्रशासनिक निर्णय से पूर्व कृपया shasanadesh.up.gov.in पर मूल शासनादेश का अवलोकन करें।</p>
        ${NAV_LINKS}
      </article>
    `
  },
  {
    path: 'terms-and-conditions',
    title: 'नियम एवं शर्तें (Terms & Conditions) – UP Outsource Seva Nigam',
    description: 'UPCOS वेबसाइट उपयोग की सामान्य शर्तें, बौद्धिक संपदा अधिकार एवं आचरण नियम।',
    bodySnippet: `
      <article style="max-width:800px;margin:2rem auto;padding:1rem;font-family:sans-serif;">
        <h1>नियम एवं शर्तें (Terms of Use)</h1>
        <p>इस पोर्टल का उपयोग करने से पूर्व कृपया इन नियमों एवं शर्तों को ध्यानपूर्वक पढ़ें। पोर्टल का उपयोग इन शर्तों की स्वीकृति माना जाएगा।</p>
        ${NAV_LINKS}
      </article>
    `
  },
  {
    path: 'contact-us',
    title: 'संपर्क सूत्र एवं संपादकीय डेस्क – UP Outsource Seva Nigam',
    description: 'संपादकीय टीम से संपर्क, शिकायत निवारण, सूचना सत्यापन एवं सुझाव प्रेषण प्रपत्र।',
    bodySnippet: `
      <article style="max-width:800px;margin:2rem auto;padding:1rem;font-family:sans-serif;">
        <h1>संपर्क सूत्र (Contact Us)</h1>
        <p>किसी भी समाचार, शासनादेश सत्यापन, सुधार या प्रश्न के लिए हमारी संपादकीय टीम से संपर्क करें: contact@uposn.in</p>
        ${NAV_LINKS}
      </article>
    `
  },
  {
    path: 'editorial-policy',
    title: 'संपादकीय नीति (Editorial Policy) – UP Outsource Seva Nigam',
    description: 'स्वतंत्रता, निष्पक्षता, स्रोत प्रमाणिकता एवं पत्रकारिता सत्यनिष्ठा के मानक।',
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
    title: 'तथ्य-जांच नीति (Fact-Checking Policy) – UP Outsource Seva Nigam',
    description: 'शासनादेशों एवं सरकारी परिपत्रों के सत्यापन की कठोर तथ्य-जांच प्रक्रिया।',
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
    title: 'संशोधन एवं अद्यतन नीति (Corrections Policy) – UP Outsource Seva Nigam',
    description: 'पारदर्शी त्रुटि सुधार, सुधार समय-सारिणी एवं पाठक फीडबैक तंत्र।',
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
    title: 'कॉपीराइट नीति (Copyright Policy) – UP Outsource Seva Nigam',
    description: 'सार्वजनिक शासकीय परिपत्र, उचित उपयोग (Fair Use) एवं कॉपीराइट सुरक्षा दिशानिर्देश।',
    bodySnippet: `
      <article style="max-width:800px;margin:2rem auto;padding:1rem;font-family:sans-serif;">
        <h1>कॉपीराइट नीति (Copyright Policy)</h1>
        <p>पोर्टल के मूल संपादकीय विश्लेषण कॉपीराइट द्वारा सुरक्षित हैं, जबकि सार्वजनिक शासनादेश जन-सूचना एवं उचित उपयोग के अंतर्गत संदर्भित किए जाते हैं।</p>
        ${NAV_LINKS}
      </article>
    `
  },
  {
    path: 'news/sant-kabir-nagar-basic-shiksha-vibhag-educator-instructor-vacancy-2026',
    title: 'UP Sewayojan Sant Kabir Nagar Educator Instructor Vacancy 2026 – UPCOS',
    description: 'संत कबीर नगर बेसिक शिक्षा विभाग में Educator व Instructor आउटसोर्सिंग भर्ती 2026। वेतन ₹10,313/माह, अंतिम तिथि 22-11-2026। योग्यता व आवेदन विवरण पढ़ें।',
    bodySnippet: `
      <article style="max-width:850px;margin:2rem auto;padding:1rem;font-family:sans-serif;line-height:1.7;">
        <h1>संत कबीर नगर बेसिक शिक्षा विभाग भर्ती 2026: ECE Educator व ITI Instructor पदों पर आवेदन (अंतिम तिथि 22-11-2026)</h1>
        <p>जनपद संत कबीर नगर के बेसिक शिक्षा विभाग में NIT COMPUTER CENTRE के माध्यम से Educator व Instructor पदों पर आउटसोर्सिंग भर्ती जारी की गई है।</p>
        <h2>पदों का विवरण:</h2>
        <ul>
          <li><strong>Educator (ECE):</strong> Bachelor of Home Science | 01 जुलाई 2025 को अधिकतम आयु 40 वर्ष | वेतन ₹10,313/माह | प्राप्त आवेदन: 1,950</li>
          <li><strong>Instructor (मल्टी-ट्रेड):</strong> Plumber/Sheet Metal/Carpenter/Painter/Fitter/Construction/Fabrication + हिन्दी व अंग्रेजी ज्ञान | वेतन ₹10,313/माह | प्राप्त आवेदन: 616</li>
          <li><strong>Instructor (इलेक्ट्रिकल/इलेक्ट्रॉनिक्स):</strong> राजकीय मान्यता प्राप्त ITI से संबंधित 01 ट्रेड सर्टिफिकेट | वेतन ₹10,313/माह | प्राप्त आवेदन: 1,122</li>
        </ul>
        <p>आधिकारिक पोर्टल: <a href="https://sewayojan.up.nic.in/jobs.aspx" rel="noopener noreferrer">sewayojan.up.nic.in</a></p>
        ${NAV_LINKS}
      </article>
    `
  },
  {
    path: 'news/mahila-kalyan-vibhag-hamirpur-outsourcing-bharti-2026-case-worker-mts-operator',
    title: 'महिला कल्याण विभाग हमीरपुर आउटसोर्सिंग भर्ती 2026: Case Worker, MTS, Computer Operator व District Coordinator – UPCOS',
    description: 'महिला कल्याण विभाग, जनपद हमीरपुर में Case Worker (₹25,000/₹15,830), MTS (₹10,500), Computer Operator (₹16,771) व District Coordinator (₹23,170) भर्ती 2026। अंतिम तिथि 20-11-2026।',
    bodySnippet: `
      <article style="max-width:850px;margin:2rem auto;padding:1rem;font-family:sans-serif;line-height:1.7;">
        <h1>महिला कल्याण विभाग हमीरपुर आउटसोर्सिंग भर्ती 2026 (अंतिम तिथि: 20-11-2026)</h1>
        <p>उत्तर प्रदेश शासन के महिला कल्याण विभाग, जनपद हमीरपुर में सेवा प्रदाता एजेंसियों (Sambhav Foundation, LIFE LINE NETWORK KANPUR व SANGAM SEWA SAMITI..) द्वारा आउटसोर्सिंग आधार पर 5 विभिन्न पदों हेतु आवेदन आमंत्रित किए गए हैं।</p>
        <h2>रिक्तियों का संक्षिप्त विवरण:</h2>
        <ul>
          <li><strong>Case Worker (Sambhav Foundation):</strong> योग्यता B.A./B.S.W., 3 वर्ष अनुभव | वेतन ₹25,000/माह | प्राप्त आवेदन: 537</li>
          <li><strong>Multi Tasking Staff (MTS) (Sambhav Foundation):</strong> योग्यता SSC/HighSchool, 1 वर्ष अनुभव | वेतन ₹10,500/माह | प्राप्त आवेदन: 3,014</li>
          <li><strong>Computer Operator (LIFE LINE NETWORK KANPUR):</strong> योग्यता Graduate + CCC व टाइपिंग | वेतन ₹16,771/माह | प्राप्त आवेदन: 4,406</li>
          <li><strong>Case Worker (SANGAM SEWA SAMITI..):</strong> योग्यता HSC/Intermediate + संवाद कौशल / हेल्पलाइन वरीयता | वेतन ₹15,830/माह | प्राप्त आवेदन: 9,247</li>
          <li><strong>District Coordinator (LIFE LINE NETWORK KANPUR):</strong> योग्यता M.A./स्नातकोत्तर + 3 वर्ष WCD अनुभव वरीयता | वेतन ₹23,170/माह | प्राप्त आवेदन: 82</li>
        </ul>
        <p>ऑनलाइन आवेदन एवं सत्यापन हेतु आधिकारिक सेवायोजन पोर्टल: <a href="https://sewayojan.up.nic.in/jobs.aspx" rel="noopener noreferrer">sewayojan.up.nic.in</a></p>
        ${NAV_LINKS}
      </article>
    `
  },
  {
    path: 'news/up-outsourcing-employees-new-salary-rates-15396-to-39000-shasanadesh-2026',
    title: 'उत्तर प्रदेश आउटसोर्सिंग कर्मियों के मानदेय में ऐतिहासिक वृद्धि (₹15,396 से ₹39,000) – UPCOS',
    description: 'उत्तर प्रदेश सरकार ने सरकारी विभागों में कार्यरत आउटसोर्सिंग कर्मचारियों के लिए नई मासिक पारिश्रमिक दरें निर्धारित की हैं। श्रेणी-1 से 4 तक संपूर्ण वेतन व ईपीएफ/ईएसआई विवरण।',
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
        ${NAV_LINKS}
      </article>
    `
  }
];

// Write updated root dist/index.html with crawlable homepage markup
const rootHtml = template.replace('<div id="root"></div>', `<div id="root">${homeBodySnippet}</div>`);
fs.writeFileSync(BASE_HTML, rootHtml, 'utf-8');
console.log('Prerendered: /index.html');

routes.forEach((r) => {
  const targetDir = path.join(DIST_DIR, r.path);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const canonicalUrl = `${DOMAIN}/${r.path}`;
  let html = template;

  html = html.replace(/<title>.*?<\/title>/i, `<title>${r.title}</title>`);
  html = html.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${r.description}" />`);
  html = html.replace(/<link rel="canonical" href=".*?" \/>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
  html = html.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${r.title}" />`);
  html = html.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${r.description}" />`);
  html = html.replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
  html = html.replace('<div id="root"></div>', `<div id="root">${r.bodySnippet}</div>`);

  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf-8');
  console.log(`Prerendered: /${r.path}/index.html`);
});

console.log('Static prerender completed successfully.');
