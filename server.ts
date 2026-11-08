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

  // robots.txt Endpoint
  app.get("/robots.txt", (_req, res) => {
    res.sendFile(path.resolve(process.cwd(), "public/robots.txt"));
  });

  // sitemap.xml Endpoint
  app.get("/sitemap.xml", (_req, res) => {
    res.type("application/xml").sendFile(path.resolve(process.cwd(), "public/sitemap.xml"));
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
