import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import {
  handleAdminLogin,
  handleAdminSetup,
  handleAdminStatus,
  handleAdminVerify,
  handleAuthLogin,
  handleAuthOtpLogin,
  handleAuthProfileUpdate,
  handleAuthRegister,
  handleAuthResetPassword,
  handleAuthVerify,
  handleEmailOtpRequest,
  handleEmailOtpVerify,
  handleLogout,
  handleRequestOtp,
  handleVerifyOtp,
  AuthRouteResponse
} from "./src/server/authHandlers";
import { dbService } from "./src/server/dbService";
import { supabaseService } from "./src/server/supabaseService";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.set("trust proxy", 1);
  app.use(express.json());

  const isReqHttps = (req: express.Request) => {
    const xfProto = (req.headers["x-forwarded-proto"] as string) || "";
    return req.secure || xfProto.split(",")[0].trim().toLowerCase() === "https";
  };

  const toAuthReq = (req: express.Request) => ({
    body: req.body || {},
    headers: req.headers as Record<string, string | string[] | undefined>,
    isHttps: isReqHttps(req)
  });

  const sendAuthRes = (res: express.Response, result: AuthRouteResponse) => {
    if (result.cookie) {
      res.setHeader("Set-Cookie", result.cookie);
    }
    return res.status(result.status).json(result.body);
  };

  // API Health Endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Google Search Console Site Verification Endpoint
  app.get("/google871fcd09be8827f9.html", (_req, res) => {
    res.type("text/html").send("google-site-verification: google871fcd09be8827f9.html\n");
  });

  // Google AdSense ads.txt Endpoint
  app.get(["/ads.txt", "/ads.txt/", "/app-ads.txt"], (_req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send("google.com, pub-1591506487952599, DIRECT, f08c47fec0942fa0\n");
  });

  // Ensure API responses are never indexed by search engines
  app.use("/api", (_req, res, next) => {
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    next();
  });

  // robots.txt Endpoint
  app.get("/robots.txt", (_req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.sendFile(path.resolve(process.cwd(), "public/robots.txt"));
  });

  // sitemap.xml Endpoint
  app.get("/sitemap.xml", (_req, res) => {
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.sendFile(path.resolve(process.cwd(), "public/sitemap.xml"));
  });

  // news-sitemap.xml Endpoint
  app.get("/news-sitemap.xml", (_req, res) => {
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.sendFile(path.resolve(process.cwd(), "public/news-sitemap.xml"));
  });

  // 1. Admin Authentication Endpoints
  app.get("/api/admin/status", async (_req, res) => sendAuthRes(res, await handleAdminStatus()));
  app.post("/api/admin/setup", async (req, res) => sendAuthRes(res, await handleAdminSetup(toAuthReq(req))));
  app.post("/api/admin/login", async (req, res) => sendAuthRes(res, await handleAdminLogin(toAuthReq(req))));
  app.get("/api/admin/verify", (req, res) => sendAuthRes(res, handleAdminVerify(toAuthReq(req))));
  app.post("/api/admin/logout", (req, res) => sendAuthRes(res, handleLogout(toAuthReq(req))));

  // 2. Employee User Authentication Endpoints
  app.get("/api/auth/verify", async (req, res) => sendAuthRes(res, await handleAuthVerify(toAuthReq(req))));
  app.post("/api/auth/register", async (req, res) => sendAuthRes(res, await handleAuthRegister(toAuthReq(req))));
  app.post("/api/auth/login", async (req, res) => sendAuthRes(res, await handleAuthLogin(toAuthReq(req))));
  app.post("/api/auth/otp-login", async (req, res) => sendAuthRes(res, await handleAuthOtpLogin(toAuthReq(req))));
  app.post("/api/auth/email-otp/request", async (req, res) => sendAuthRes(res, await handleEmailOtpRequest(toAuthReq(req))));
  app.post("/api/auth/email-otp/verify", async (req, res) => sendAuthRes(res, await handleEmailOtpVerify(toAuthReq(req))));
  app.post("/api/auth/reset-password", async (req, res) => sendAuthRes(res, await handleAuthResetPassword(toAuthReq(req))));
  app.post("/api/auth/profile", async (req, res) => sendAuthRes(res, await handleAuthProfileUpdate(toAuthReq(req))));
  app.post("/api/auth/logout", (req, res) => sendAuthRes(res, handleLogout(toAuthReq(req))));

  // 3. Cryptographically Secure OTP Endpoints
  app.post("/api/request-otp", async (req, res) => sendAuthRes(res, await handleRequestOtp(toAuthReq(req))));
  app.post("/api/verify-otp", (req, res) => sendAuthRes(res, handleVerifyOtp(toAuthReq(req))));

  // 4. Contact Form Submission (Honeypot anti-spam protected)
  app.post("/api/contact", async (req, res) => {
    const { name, email, phone, subject, message, honeypot } = req.body;
    if (honeypot) {
      return res.json({ success: true });
    }
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: "कृपया नाम, ईमेल और संदेश अवश्य भरें।" });
    }
    const record = dbService.saveContact({ name, email, phone, subject: subject || "सामान्य पूछताछ", message });
    if (supabaseService.isConfigured()) {
      await supabaseService.saveContact(record);
    }
    res.json({ success: true, id: record.id });
  });

  // 4. Content APIs
  app.get("/api/content/news", (_req, res) => {
    res.json(dbService.getNews());
  });

  app.get("/api/content/orders", (_req, res) => {
    res.json(dbService.getOrders());
  });

  app.get("/api/content/community", (_req, res) => {
    res.json(dbService.getCommunityPosts());
  });

  app.post("/api/content/community", (req, res) => {
    const { authorId, authorName, authorDistrict, authorDepartment, category, content } = req.body;
    if (!authorName || !content || !content.trim()) {
      return res.status(400).json({ success: false, error: "संदेश सामग्री रिक्त नहीं हो सकती।" });
    }
    const created = dbService.createCommunityPost({
      authorId: authorId || "anon",
      authorName,
      authorDistrict: authorDistrict || "उत्तर प्रदेश",
      authorDepartment: authorDepartment || "समस्त विभाग",
      category: category || "सामान्य",
      content
    });
    res.status(201).json({ success: true, post: created });
  });

  app.post("/api/content/community/report", (req, res) => {
    const { postId } = req.body;
    const ok = dbService.reportCommunityPost(postId || "");
    res.json({ success: ok });
  });

  // Dynamic Social Link Preview (OpenGraph / Twitter Card) Meta Injection for Vite & Express routes
  const fs = await import("fs");
  const escapeAttr = (str = "") =>
    String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const resolveRequestOrigin = (req: express.Request) => {
    const proto = (req.headers["x-forwarded-proto"] as string)?.split(",")[0] || req.protocol || "https";
    const host = (req.headers["x-forwarded-host"] as string) || req.get("host") || "upcos.netlify.app";
    return `${proto}://${host}`;
  };

  const buildRouteSocialMeta = (pathname: string, origin: string) => {
    const cleanPath = pathname.split("?")[0].replace(/\/+$/, "") || "/";
    const defaultImg = `${origin}/og-banner.jpg`;
    const latestNewsDate = dbService.getNews()[0]?.publicationDate || "2026-11-26";
    const meta = {
      title: "UPCOS – UP Outsource Seva Nigam News, Shasanadesh & Jobs",
      description:
        "यूपी आउटसोर्स एवं संविदा कर्मचारियों के लिए ताज़ा समाचार, सेवायोजन भर्ती, शासनादेश (Shasanadesh), मानदेय अपडेट और ईपीएफ-ईएसआई जानकारी का स्वतंत्र पोर्टल।",
      image: defaultImg,
      defaultImage: defaultImg,
      url: `${origin}${cleanPath === "/" ? "/" : cleanPath}`,
      ogType: "website" as "website" | "article",
      publishedDate: latestNewsDate,
      author: "UPCOS Editorial Team",
      statusCode: 200,
      noindex: false,
      robotsContent: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    };

    const resolveImg = (img?: string) => {
      if (!img) return defaultImg;
      if (/^https?:\/\//i.test(img)) return img;
      return `${origin}${img.startsWith("/") ? "" : "/"}${img}`;
    };

    const staticPolicyMeta: Record<string, { title: string; description: string }> = {
      "/": {
        title: "UPCOS – UP Outsource Seva Nigam News, Shasanadesh & Jobs",
        description:
          "यूपी आउटसोर्स एवं संविदा कर्मचारियों के लिए ताज़ा समाचार, सेवायोजन भर्ती, शासनादेश (Shasanadesh), मानदेय अपडेट और ईपीएफ-ईएसआई जानकारी का स्वतंत्र पोर्टल।"
      },
      "/news": {
        title: "ताज़ा खबरें एवं विभागीय समाचार – UPCOS",
        description:
          "उत्तर प्रदेश आउटसोर्सिंग एवं संविदा कर्मचारियों से जुड़े नवीनतम समाचार, मानदेय वृद्धि एवं सेवायोजन भर्ती सूचनाएं।"
      },
      "/shasanadesh": {
        title: "शासनादेश एवं विधिक परिपत्र (Shasanadesh) – UPCOS",
        description:
          "उत्तर प्रदेश शासन के कार्मिक, वित्त एवं अन्य विभागों द्वारा जारी आउटसोर्सिंग संबंधी आधिकारिक शासनादेश।"
      },
      "/departments": {
        title: "विभागीय मार्गदर्शिका एवं सूचना – UPCOS",
        description:
          "स्वास्थ्य, शिक्षा, पंचायती राज, ऊर्जा समेत उ.प्र. के सभी प्रमुख सरकारी विभागों के आउटसोर्स कर्मचारी आदेश।"
      },
      "/employee-hub": {
        title: "कर्मचारी सूचना हब एवं वेतन कैलकुलेटर – UPCOS",
        description:
          "वेतन श्रेणियां, ईपीएफ-ईएसआई कैलकुलेटर, अवकाश नियम और कर्मचारी अधिकार संबंधी विस्तृत जानकारी।"
      },
      "/employee-community": {
        title: "कर्मचारी संवाद एवं विचार मंच – UPCOS",
        description:
          "उत्तर प्रदेश के 75 जनपदों के आउटसोर्स कर्मचारियों का स्वतंत्र संवाद, समस्या साझा एवं सहायता मंच।"
      },
      "/about-us": {
        title: "हमारे बारे में (About Us) – UPCOS",
        description:
          "UPCOS का परिचय, उद्देश्य, स्वतंत्र पहचान और उत्तर प्रदेश आउटसोर्सिंग कर्मचारियों के सशक्तिकरण का मिशन।"
      },
      "/contact-us": {
        title: "संपर्क सूत्र एवं संपादकीय डेस्क (Contact Us) – UPCOS",
        description:
          "संपादकीय टीम से संपर्क, शिकायत निवारण, सूचना सत्यापन एवं सुझाव प्रेषण प्रपत्र।"
      },
      "/privacy-policy": {
        title: "गोपनीयता नीति (Privacy Policy) – UPCOS",
        description:
          "डेटा गोपनीयता, कुकीज, Google AdSense अनुपालन एवं उपयोगकर्ता अधिकारों का संपूर्ण विवरण।"
      },
      "/disclaimer": {
        title: "अस्वीकरण एवं विधिक नीति (Disclaimer) – UPCOS",
        description:
          "गैर-सरकारी स्पष्टीकरण, अनधिकृत सूचना निषेध एवं विधिक सूचना अस्वीकरण।"
      },
      "/terms-and-conditions": {
        title: "नियम एवं शर्तें (Terms & Conditions) – UPCOS",
        description:
          "UPCOS वेबसाइट उपयोग की सामान्य शर्तें, बौद्धिक संपदा अधिकार एवं आचरण नियम।"
      },
      "/editorial-policy": {
        title: "संपादकीय नीति (Editorial Policy) – UPCOS",
        description:
          "स्वतंत्रता, निष्पक्षता, स्रोत प्रमाणिकता एवं पत्रकारिता सत्यनिष्ठा के मानक।"
      },
      "/fact-checking-policy": {
        title: "तथ्य-जांच नीति (Fact-Checking Policy) – UPCOS",
        description:
          "शासनादेशों एवं सरकारी परिपत्रों के सत्यापन की कठोर तथ्य-जांच प्रक्रिया।"
      },
      "/correction-policy": {
        title: "संशोधन एवं अद्यतन नीति (Corrections Policy) – UPCOS",
        description:
          "पारदर्शी त्रुटि सुधार, सुधार समय-सारिणी एवं पाठक फीडबैक तंत्र।"
      },
      "/copyright-policy": {
        title: "कॉपीराइट नीति (Copyright Policy) – UPCOS",
        description:
          "सार्वजनिक शासकीय परिपत्र, उचित उपयोग (Fair Use) एवं कॉपीराइट सुरक्षा दिशानिर्देश।"
      },
      "/advertise": {
        title: "विज्ञापन नीति (Advertise With Us) – UPCOS",
        description:
          "कर्मचारी हितैषी विज्ञापन दिशानिर्देश एवं Google AdSense अनुपालन नीति।"
      },
      "/sitemap": {
        title: "साइटमैप (Sitemap) – UPCOS",
        description:
          "UPCOS पोर्टल के सभी समाचार, शासनादेश, विभाग, भर्ती सूचनाएं एवं नीति पृष्ठों की संपूर्ण सूची।"
      }
    };

    if (staticPolicyMeta[cleanPath]) {
      meta.title = staticPolicyMeta[cleanPath].title;
      meta.description = staticPolicyMeta[cleanPath].description;
      return meta;
    }

    if (cleanPath === "/search") {
      meta.title = "खोज पृष्ठ (Search) – UPCOS";
      meta.description = "UPCOS पोर्टल पर समाचार, शासनादेश और विभागीय सूचना खोजें।";
      meta.noindex = true;
      meta.robotsContent = "noindex, follow";
      return meta;
    }

    if (cleanPath === "/admin") {
      meta.title = "Admin CMS – UPCOS";
      meta.description = "संपादकीय प्रबंधन डैशबोर्ड";
      meta.noindex = true;
      meta.robotsContent = "noindex, nofollow";
      return meta;
    }

    if (cleanPath.startsWith("/news/")) {
      const slug = cleanPath.replace("/news/", "");
      const article = dbService.getNews().find((n) => n.slug === slug || n.id === slug);
      if (article) {
        meta.title = `${article.title} | UP Outsource Seva Nigam`;
        meta.description = article.shortDescription || meta.description;
        meta.image = resolveImg(article.featuredImage);
        meta.ogType = "article";
        meta.publishedDate = article.publicationDate || meta.publishedDate;
        meta.author = article.author || meta.author;
        return meta;
      }
    } else if (cleanPath.startsWith("/shasanadesh/")) {
      const slug = cleanPath.replace("/shasanadesh/", "");
      const order = dbService.getOrders().find((o) => o.slug === slug || o.id === slug || o.orderNumber === slug);
      if (order) {
        meta.title = `${order.orderNumber}: ${order.title} – UPCOS शासनादेश`;
        meta.description = order.summary || meta.description;
        meta.ogType = "article";
        meta.publishedDate = order.date || meta.publishedDate;
        return meta;
      }
    } else if (cleanPath.startsWith("/departments/")) {
      const id = cleanPath.replace("/departments/", "");
      const dept = dbService.getDepartments().find((d) => d.id === id);
      if (dept) {
        meta.title = `${dept.name} (${dept.englishName}) – आउटसोर्स समाचार व शासनादेश | UPCOS`;
        meta.description = dept.description || meta.description;
        return meta;
      }
    }

    // Any other unknown path -> HTTP 404 (prevents Google Soft 404 penalties)
    meta.statusCode = 404;
    meta.noindex = true;
    meta.robotsContent = "noindex, nofollow";
    meta.title = "पृष्ठ उपलब्ध नहीं है (404) – UPCOS";
    meta.description = "अनुरोधित पृष्ठ UPCOS पोर्टल पर उपलब्ध नहीं है।";
    return meta;
  };

  const applySocialMetaToHtml = (html: string, meta: ReturnType<typeof buildRouteSocialMeta>) => {
    const safeTitle = escapeAttr(meta.title);
    const safeDesc = escapeAttr(meta.description);
    const safeImg = escapeAttr(meta.image);
    const safeUrl = escapeAttr(meta.url);
    const safeRobots = escapeAttr(meta.robotsContent);
    const pubDateShort = escapeAttr((meta.publishedDate || "2026-11-26").slice(0, 10));
    const pubDateIso = escapeAttr(meta.publishedDate?.includes("T") ? meta.publishedDate : `${pubDateShort}T09:30:00+05:30`);
    const safeAuthor = escapeAttr(meta.author || "UPCOS Editorial Team");
    let output = html
      .replace(/<title>.*?<\/title>/i, `<title>${safeTitle}</title>`)
      .replace(/<meta name="title" content=".*?" \/>/i, `<meta name="title" content="${safeTitle}" />`)
      .replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${safeDesc}" />`)
      .replace(/<meta name="author" content=".*?" \/>/i, `<meta name="author" content="${safeAuthor}" />`)
      .replace(/<meta name="publish_date" content=".*?" \/>/i, `<meta name="publish_date" content="${pubDateShort}" />`)
      .replace(/<meta name="date" content=".*?" \/>/i, `<meta name="date" content="${pubDateShort}" />`)
      .replace(/<meta property="article:published_time" content=".*?" \/>/i, `<meta property="article:published_time" content="${pubDateIso}" />`)
      .replace(/<meta property="article:modified_time" content=".*?" \/>/i, `<meta property="article:modified_time" content="${pubDateIso}" />`)
      .replace(/<meta property="og:updated_time" content=".*?" \/>/i, `<meta property="og:updated_time" content="${pubDateIso}" />`)
      .replace(/<meta name="robots" content=".*?" \/>/i, `<meta name="robots" content="${safeRobots}" />`)
      .replace(/<meta name="googlebot" content=".*?" \/>/i, `<meta name="googlebot" content="${safeRobots}" />`)
      .replace(/<link rel="canonical" href=".*?" \/>/i, `<link rel="canonical" href="${safeUrl}" />`)
      .replace(/<link rel="alternate" hreflang="hi-IN" href=".*?" \/>/i, `<link rel="alternate" hreflang="hi-IN" href="${safeUrl}" />`)
      .replace(/<link rel="alternate" hreflang="x-default" href=".*?" \/>/i, `<link rel="alternate" hreflang="x-default" href="${safeUrl}" />`)
      .replace(/<meta property="og:type" content=".*?" \/>/i, `<meta property="og:type" content="${meta.ogType}" />`)
      .replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${safeTitle}" />`)
      .replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${safeDesc}" />`)
      .replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${safeUrl}" />`)
      .replace(/<meta property="og:image" content=".*?" \/>/i, `<meta property="og:image" content="${safeImg}" />`)
      .replace(/<meta property="og:image:secure_url" content=".*?" \/>/i, `<meta property="og:image:secure_url" content="${safeImg}" />`)
      .replace(/<meta property="og:image:alt" content=".*?" \/>/i, `<meta property="og:image:alt" content="${safeTitle}" />`)
      .replace(/<meta name="twitter:url" content=".*?" \/>/i, `<meta name="twitter:url" content="${safeUrl}" />`)
      .replace(/<meta name="twitter:title" content=".*?" \/>/i, `<meta name="twitter:title" content="${safeTitle}" />`)
      .replace(/<meta name="twitter:description" content=".*?" \/>/i, `<meta name="twitter:description" content="${safeDesc}" />`)
      .replace(/<meta name="twitter:image" content=".*?" \/>/i, `<meta name="twitter:image" content="${safeImg}" />`)
      .replace(/<meta name="twitter:image:alt" content=".*?" \/>/i, `<meta name="twitter:image:alt" content="${safeTitle}" />`);

    if (meta.image !== meta.defaultImage) {
      output = output
        .replace(/\s*<meta property="og:image:type" content=".*?" \/>/i, "")
        .replace(/\s*<meta property="og:image:width" content=".*?" \/>/i, "")
        .replace(/\s*<meta property="og:image:height" content=".*?" \/>/i, "");
    }
    if (meta.noindex) {
      output = output.replace(/\s*<link rel="canonical" href=".*?" \/>/i, "");
    }
    if (output.includes('<div id="root"></div>')) {
      const ssrShell = `<header role="banner"><a href="/"><img src="/logo.png" alt="UPCOS – UP Outsource Seva Nigam Logo" width="48" height="48" /><span>UP Outsource Seva Nigam (UPCOS)</span></a><nav aria-label="Primary Navigation"><a href="/">Home</a> | <a href="/news">News</a> | <a href="/shasanadesh">Gov Orders</a> | <a href="/departments">Departments</a> | <a href="/employee-hub">Employee Hub</a> | <a href="/about-us">About Us</a> | <a href="/contact-us">Contact Us</a></nav></header><main><h1>${safeTitle}</h1><p>Author: <strong>${safeAuthor}</strong> | Published: <time datetime="${pubDateIso}">${pubDateShort}</time></p><img src="${safeImg}" alt="${safeTitle}" width="1200" height="675" /><p>${safeDesc}</p></main><footer role="contentinfo"><p><a href="https://www.facebook.com/people/UP-outsource-Seva-Nigam-News-and-Information/61580301641301/" target="_blank" rel="noopener noreferrer me">Facebook</a> | <a href="https://x.com/UPOutsource" target="_blank" rel="noopener noreferrer me">X (Twitter)</a> | <a href="https://t.me/UPOutsource" target="_blank" rel="noopener noreferrer me">Telegram</a> | <a href="https://www.youtube.com/@UPOutsource" target="_blank" rel="noopener noreferrer me">YouTube</a> | <a href="https://www.instagram.com/upoutsource" target="_blank" rel="noopener noreferrer me">Instagram</a></p><p><a href="/privacy-policy">Privacy Policy</a> | <a href="/disclaimer">Disclaimer</a> | <a href="/terms-and-conditions">Terms</a> | <a href="/sitemap">Sitemap</a></p></footer>`;
      output = output.replace('<div id="root"></div>', `<div id="root">${ssrShell}</div>`);
    }
    return output;
  };

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    // Inject dynamic OpenGraph/Twitter tags for social link scrapers & browser navigation in dev/preview
    app.use(async (req, res, next) => {
      if (
        (req.method !== "GET" && req.method !== "HEAD") ||
        req.path.startsWith("/api/") ||
        req.path.startsWith("/@") ||
        req.path.startsWith("/src/") ||
        req.path.startsWith("/node_modules/") ||
        /\.[a-zA-Z0-9]+$/.test(req.path)
      ) {
        return next();
      }
      const accept = req.headers.accept || "";
      const ua = req.headers["user-agent"] || "";
      const isSocialBot = /WhatsApp|facebookexternalhit|Facebot|Twitterbot|TelegramBot|LinkedInBot|Slackbot|Discordbot|Pinterest|Googlebot|bingbot|Mediapartners-Google/i.test(ua);
      if (!accept.includes("text/html") && !isSocialBot) {
        return next();
      }
      try {
        let html = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        html = await vite.transformIndexHtml(req.originalUrl, html);
        const meta = buildRouteSocialMeta(req.path, resolveRequestOrigin(req));
        html = applySocialMetaToHtml(html, meta);
        if (meta.noindex) {
          res.setHeader("X-Robots-Tag", meta.robotsContent);
        }
        res.status(meta.statusCode).set({ "Content-Type": "text/html; charset=utf-8" }).end(html);
      } catch (e) {
        next(e);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      const cleanPath = req.path.split("?")[0].replace(/\/+$/, "").replace(/^\//, "");
      const prerenderedPath = cleanPath ? path.join(distPath, cleanPath, "index.html") : path.join(distPath, "index.html");
      if (fs.existsSync(prerenderedPath)) {
        return res.status(200).sendFile(prerenderedPath);
      }
      const indexHtml = fs.readFileSync(path.join(distPath, "index.html"), "utf-8");
      const meta = buildRouteSocialMeta(req.path, resolveRequestOrigin(req));
      if (meta.noindex) {
        res.setHeader("X-Robots-Tag", meta.robotsContent);
      }
      res.status(meta.statusCode).set({ "Content-Type": "text/html; charset=utf-8" }).end(applySocialMetaToHtml(indexHtml, meta));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
