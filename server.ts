import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { 
  verifyAdminCredentials, 
  createSessionToken, 
  validateSessionToken, 
  invalidateSessionToken, 
  requestSecureOtp, 
  verifySecureOtp 
} from "./src/server/securityService";
import { dbService } from "./src/server/dbService";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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
  app.post("/api/admin/login", (req, res) => {
    const { loginId, passkey } = req.body;
    const verifyRes = verifyAdminCredentials(loginId, passkey);
    if (!verifyRes.success) {
      return res.status(401).json({ success: false, error: verifyRes.error });
    }
    const token = createSessionToken("admin-aftab", "admin");
    res.cookie("uposn_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400 * 1000
    });
    return res.json({
      success: true,
      token,
      user: {
        id: "admin-aftab",
        name: "आफताब मोहम्मद (Admin)",
        email: "aftab.mohd9@gmail.com",
        role: "admin",
        isAdmin: true
      }
    });
  });

  app.get("/api/admin/verify", (req, res) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace(/^Bearer\s+/i, "") || req.cookies?.uposn_session;
    const session = validateSessionToken(token);
    if (!session.valid || session.role !== "admin") {
      return res.status(401).json({ valid: false, error: "Unauthorized session" });
    }
    return res.json({
      valid: true,
      user: {
        id: "admin-aftab",
        name: "आफताब मोहम्मद (Admin)",
        email: "aftab.mohd9@gmail.com",
        role: "admin",
        isAdmin: true
      }
    });
  });

  app.post("/api/admin/logout", (req, res) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace(/^Bearer\s+/i, "") || req.cookies?.uposn_session;
    invalidateSessionToken(token);
    res.clearCookie("uposn_session");
    res.json({ success: true });
  });

  // 2. Cryptographically Secure OTP Endpoints
  app.post("/api/request-otp", (req, res) => {
    const { mobile } = req.body;
    const result = requestSecureOtp(mobile || "");
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  app.post("/api/verify-otp", (req, res) => {
    const { mobile, otp } = req.body;
    const result = verifySecureOtp(mobile || "", otp || "");
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  // 3. Contact Form Submission (Honeypot anti-spam protected)
  app.post("/api/contact", (req, res) => {
    const { name, email, phone, subject, message, honeypot } = req.body;
    if (honeypot) {
      return res.json({ success: true });
    }
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: "कृपया नाम, ईमेल और संदेश अवश्य भरें।" });
    }
    const record = dbService.saveContact({ name, email, phone, subject: subject || "सामान्य पूछताछ", message });
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
    const meta = {
      title: "UP Outsource Seva Nigam Portal – News, Shasanadesh & Bharti for UP Outsource Employees",
      description:
        "उत्तर प्रदेश राज्य सरकार के आउटसोर्स व संविदा कर्मचारियों के लिए प्रामाणिक समाचार, शासनादेश, वेतन अपडेट व सेवायोजन पोर्टल भर्ती की हर जरूरी जानकारी।",
      image: defaultImg,
      url: `${origin}${cleanPath === "/" ? "/" : cleanPath}`,
      ogType: "website" as "website" | "article"
    };

    const resolveImg = (img?: string) => {
      if (!img) return defaultImg;
      if (/^https?:\/\//i.test(img)) return img;
      return `${origin}${img.startsWith("/") ? "" : "/"}${img}`;
    };

    if (cleanPath.startsWith("/news/")) {
      const slug = cleanPath.replace("/news/", "");
      const article = dbService.getNews().find((n) => n.slug === slug || n.id === slug);
      if (article) {
        meta.title = `${article.title} | UP Outsource Seva Nigam`;
        meta.description = article.shortDescription || meta.description;
        meta.image = resolveImg(article.featuredImage);
        meta.ogType = "article";
      }
    } else if (cleanPath.startsWith("/shasanadesh/")) {
      const slug = cleanPath.replace("/shasanadesh/", "");
      const order = dbService.getOrders().find((o) => o.slug === slug || o.id === slug || o.orderNumber === slug);
      if (order) {
        meta.title = `${order.orderNumber}: ${order.title} – UPCOS शासनादेश`;
        meta.description = order.summary || meta.description;
        meta.ogType = "article";
      }
    } else if (cleanPath.startsWith("/departments/")) {
      const id = cleanPath.replace("/departments/", "");
      const dept = dbService.getDepartments().find((d) => d.id === id);
      if (dept) {
        meta.title = `${dept.name} (${dept.englishName}) – आउटसोर्स समाचार व शासनादेश | UPCOS`;
        meta.description = dept.description || meta.description;
      }
    } else if (cleanPath === "/news") {
      meta.title = "ताज़ा खबरें एवं विभागीय समाचार – UPCOS";
      meta.description = "उत्तर प्रदेश आउटसोर्सिंग एवं संविदा कर्मचारियों से जुड़े नवीनतम समाचार, मानदेय वृद्धि एवं सेवायोजन भर्ती सूचनाएं।";
    } else if (cleanPath === "/shasanadesh") {
      meta.title = "शासनादेश एवं विधिक परिपत्र (Shasanadesh) – UPCOS";
      meta.description = "उत्तर प्रदेश शासन के कार्मिक, वित्त एवं अन्य विभागों द्वारा जारी आउटसोर्सिंग संबंधी आधिकारिक शासनादेश।";
    } else if (cleanPath === "/departments") {
      meta.title = "विभागीय मार्गदर्शिका एवं सूचना – UPCOS";
      meta.description = "स्वास्थ्य, शिक्षा, पंचायती राज, ऊर्जा समेत उ.प्र. के सभी प्रमुख सरकारी विभागों के आउटसोर्स कर्मचारी आदेश।";
    } else if (cleanPath === "/employee-hub") {
      meta.title = "कर्मचारी सूचना हब एवं वेतन कैलकुलेटर – UPCOS";
      meta.description = "वेतन श्रेणियां, ईपीएफ-ईएसआई कैलकुलेटर, अवकाश नियम और कर्मचारी अधिकार संबंधी विस्तृत जानकारी।";
    } else if (cleanPath === "/employee-community") {
      meta.title = "कर्मचारी संवाद एवं विचार मंच – UPCOS";
      meta.description = "उत्तर प्रदेश के 75 जनपदों के आउटसोर्स कर्मचारियों का स्वतंत्र संवाद, समस्या साझा एवं सहायता मंच।";
    } else if (cleanPath === "/sitemap") {
      meta.title = "साइटमैप (Sitemap) – UPCOS";
      meta.description = "UPCOS पोर्टल के सभी समाचार, शासनादेश, विभाग, भर्ती सूचनाएं एवं नीति पृष्ठों की संपूर्ण सूची।";
    }

    return meta;
  };

  const applySocialMetaToHtml = (html: string, meta: ReturnType<typeof buildRouteSocialMeta>) => {
    const safeTitle = escapeAttr(meta.title);
    const safeDesc = escapeAttr(meta.description);
    const safeImg = escapeAttr(meta.image);
    const safeUrl = escapeAttr(meta.url);
    return html
      .replace(/<title>.*?<\/title>/i, `<title>${safeTitle}</title>`)
      .replace(/<meta name="title" content=".*?" \/>/i, `<meta name="title" content="${safeTitle}" />`)
      .replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${safeDesc}" />`)
      .replace(/<link rel="canonical" href=".*?" \/>/i, `<link rel="canonical" href="${safeUrl}" />`)
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
        req.method !== "GET" ||
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
      const isSocialBot = /WhatsApp|facebookexternalhit|Facebot|Twitterbot|TelegramBot|LinkedInBot|Slackbot|Discordbot|Pinterest|Googlebot|bingbot/i.test(ua);
      if (!accept.includes("text/html") && !isSocialBot) {
        return next();
      }
      try {
        let html = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        html = await vite.transformIndexHtml(req.originalUrl, html);
        const meta = buildRouteSocialMeta(req.path, resolveRequestOrigin(req));
        html = applySocialMetaToHtml(html, meta);
        res.status(200).set({ "Content-Type": "text/html; charset=utf-8" }).end(html);
      } catch (e) {
        next(e);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      const indexHtml = fs.readFileSync(path.join(distPath, "index.html"), "utf-8");
      const meta = buildRouteSocialMeta(req.path, resolveRequestOrigin(req));
      res.status(200).set({ "Content-Type": "text/html; charset=utf-8" }).end(applySocialMetaToHtml(indexHtml, meta));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
