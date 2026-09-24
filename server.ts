import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health Endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // SMS Gateway Status Endpoint
  app.get("/api/sms-status", (req, res) => {
    const hasFast2sms = Boolean(process.env.FAST2SMS_API_KEY && process.env.FAST2SMS_API_KEY.trim() !== "");
    const textbeltKey = process.env.TEXTBELT_KEY || "textbelt";
    res.json({
      configuredGateways: {
        fast2sms: hasFast2sms,
        textbeltFree: true,
      },
      activeKey: textbeltKey ? "Active" : "Default"
    });
  });

  // Real SMS & OTP Dispatch Endpoint
  app.post("/api/send-otp", async (req, res) => {
    try {
      const { mobile, otp, name } = req.body;
      const cleanMobile = String(mobile || '').replace(/\D/g, '').slice(-10);

      if (!cleanMobile || cleanMobile.length !== 10) {
        return res.status(400).json({
          success: false,
          error: "कृपया 10-अंकीय मान्य भारतीय मोबाइल नंबर प्रदान करें।"
        });
      }

      const otpCode = String(otp || Math.floor(1000 + Math.random() * 9000));
      const masked = `${cleanMobile.slice(0, 2)}******${cleanMobile.slice(-2)}`;
      const employeeName = name || "साथी";
      const smsMessage = `UP Outsource Seva Portal: Dear ${employeeName}, your password reset verification code is ${otpCode}. Valid for 10 minutes. Please do not share this code.`;

      // Option 1: Fast2SMS API (Indian Mobile Numbers with free trial credits)
      if (process.env.FAST2SMS_API_KEY && process.env.FAST2SMS_API_KEY.trim() !== "") {
        try {
          const fast2smsRes = await fetch("https://www.fast2sms.com/dev/bulkV2", {
            method: "POST",
            headers: {
              "authorization": process.env.FAST2SMS_API_KEY.trim(),
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              route: "otp",
              variables_values: otpCode,
              numbers: cleanMobile
            })
          });

          const fastData = (await fast2smsRes.json()) as any;
          if (fastData && (fastData.return === true || fastData.status_code === 200)) {
            return res.json({
              success: true,
              provider: "Fast2SMS",
              isRealSms: true,
              message: `वास्तविक SMS सफलतापूर्वक आपके मोबाइल +91 ${masked} पर भेज दिया गया है।`,
              details: fastData.message ? fastData.message[0] : "Delivered",
              phone: masked,
              otp: otpCode
            });
          }
        } catch (fastErr: any) {
          console.error("Fast2SMS API attempt error:", fastErr?.message);
        }
      }

      // Option 2: Textbelt Free SMS Gateway (1 free real SMS per day globally with key="textbelt")
      const textbeltKey = process.env.TEXTBELT_KEY || "textbelt";
      try {
        const textbeltRes = await fetch("https://textbelt.com/text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: "+91" + cleanMobile,
            message: smsMessage,
            key: textbeltKey
          })
        });

        const textbeltData = (await textbeltRes.json()) as any;
        if (textbeltData && textbeltData.success) {
          return res.json({
            success: true,
            provider: "Textbelt (Free SMS API)",
            isRealSms: true,
            message: `मुफ्त वास्तविक SMS आपके मोबाइल +91 ${masked} पर भेज दिया गया है!`,
            quotaRemaining: textbeltData.quotaRemaining,
            phone: masked,
            otp: otpCode
          });
        } else {
          const errorMsg = textbeltData?.error || "दैनिक मुफ्त SMS सीमा पूर्ण हो चुकी है";
          return res.json({
            success: false,
            provider: "Textbelt Free Gateway",
            isRealSms: false,
            freeQuotaLimitReached: true,
            message: errorMsg,
            phone: masked,
            otp: otpCode,
            fallbackNotice: "मुफ्त SMS प्रदाता का दैनिक कोटा सीमित होने के कारण आपका सत्यापन कोड स्क्रीन पर तत्काल उपलब्ध करा दिया गया है।"
          });
        }
      } catch (err: any) {
        console.error("Textbelt API dispatch error:", err?.message);
        return res.json({
          success: false,
          provider: "Free SMS Service",
          isRealSms: false,
          message: "SMS गेटवे से संपर्क नहीं हो सका।",
          phone: masked,
          otp: otpCode
        });
      }
    } catch (error: any) {
      console.error("send-otp server error:", error);
      res.status(500).json({ success: false, error: error?.message || "Internal server error" });
    }
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
