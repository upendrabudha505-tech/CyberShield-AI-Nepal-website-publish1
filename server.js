// server.ts
import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
app.use(express.json({ limit: "1mb" }));
var rateLimitMap = /* @__PURE__ */ new Map();
function rateLimiter(maxRequests = 30, windowMs = 6e4) {
  return (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now > entry.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    if (entry.count >= maxRequests) {
      return res.status(429).json({
        error: "Too many requests. Please wait a minute before analyzing more messages or links.",
        retryAfterSeconds: Math.ceil((entry.resetTime - now) / 1e3)
      });
    }
    entry.count += 1;
    next();
  };
}
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 3e5);
var apiKey = process.env.GEMINI_API_KEY;
var ai = apiKey ? new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
}) : null;
async function callGeminiWithTimeout(promise, timeoutMs = 4500) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("AI request timeout")), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}
function sanitizeForAnalysis(text) {
  let hadRedactions = false;
  let sanitized = text.replace(/(password|pass|pin|mpin)\s*[:=]\s*(\S+)/gi, (_match, prefix) => {
    hadRedactions = true;
    return `${prefix}: [PROTECTED-CREDENTIAL]`;
  });
  sanitized = sanitized.replace(/(otp|code|verification code|token)\s*(is|:|-)?\s*(\d{4,8})/gi, (_match, prefix, sep) => {
    hadRedactions = true;
    return `${prefix} ${sep || "is"} [OTP-PROTECTED]`;
  });
  return { sanitized, hadRedactions };
}
function heuristicMessageAnalysis(message, lang = "en") {
  const lower = message.toLowerCase();
  const triggers = [];
  if (/otp|one time password|mpin|pin code|security code/i.test(lower)) {
    triggers.push("Requests OTP or confidential security PIN");
  }
  if (/urgent|immediately|expire|within \d+ (hours|minutes)|kyc block|account suspended|deactivated/i.test(lower)) {
    triggers.push("Artificial urgency and account suspension threats");
  }
  if (/lottery|won|cash prize|congratulations|bonus|gift voucher|recharge card|gift|50000|lakh|crore/i.test(lower)) {
    triggers.push("Unrealistic prize, bonus, or lottery claims");
  }
  if (/esewa|khalti|fonepay|connectips|nabil|nic asia|global ime|rastriya banijya|ncell|ntc/i.test(lower)) {
    triggers.push("Mentions major Nepali financial institutions or telecom brands");
  }
  if (/click here|http:\/\/|https:\/\/|bit\.ly|t\.co|wa\.me|viber/i.test(lower)) {
    triggers.push("Directs to external link or unofficial WhatsApp/Viber channels");
  }
  let riskCategory = "Low";
  let confidenceLevel = 75;
  if (triggers.length >= 2) {
    riskCategory = "High";
    confidenceLevel = 88;
  } else if (triggers.length === 1) {
    riskCategory = "Medium";
    confidenceLevel = 70;
  } else if (message.trim().length < 10) {
    riskCategory = "Inconclusive";
    confidenceLevel = 50;
  }
  const isNepali = lang === "np";
  return {
    riskCategory,
    confidenceLevel,
    confidenceExplanation: "Evaluated through structural security heuristics checking for credential harvesting, urgency pressure, and brand impersonation. Real attacks may vary in sophistication.",
    suspiciousPhrases: triggers,
    reasons: triggers.length > 0 ? triggers : ["No standard social engineering or credential harvesting keywords immediately identified."],
    safeActions: [
      "Never send OTP, password, or MPIN to any caller or message sender.",
      "Check your balance directly inside your official banking or wallet app, not via text links.",
      "If in doubt, call the official customer care number listed on the back of your card or in the verified app.",
      "Report suspected scam attempts to the Nepal Police Cyber Bureau (Hotline 1113)."
    ],
    explanation_en: riskCategory === "High" ? "High probability of phishing or scam tactic. Scammers frequently simulate banking alerts, prize notifications, or urgent KYC verification to extract money or account access." : riskCategory === "Medium" ? "Potentially suspicious elements detected. Proceed with caution and do not disclose sensitive verification codes." : "The message does not display obvious phishing triggers, but always verify sender identity independently.",
    explanation_np: riskCategory === "High" ? "\u092F\u094B \u0938\u0928\u094D\u0926\u0947\u0936 \u0920\u0917\u0940 \u0935\u093E \u092B\u093F\u0938\u093F\u0919 (Phishing) \u0939\u0941\u0928\u0947 \u0909\u091A\u094D\u091A \u0938\u092E\u094D\u092D\u093E\u0935\u0928\u093E \u091B\u0964 \u0928\u0947\u092A\u093E\u0932\u092E\u093E \u092C\u0948\u0902\u0915, \u0908\u0938\u0947\u0935\u093E \u0935\u093E \u0916\u0932\u094D\u0924\u0940\u0915\u094B \u0928\u093E\u092E\u092E\u093E \u0928\u0915\u094D\u0915\u0932\u0940 \u092A\u0941\u0930\u0938\u094D\u0915\u093E\u0930, \u0915\u0947\u0935\u093E\u0907\u0938\u0940 \u0928\u0935\u0940\u0915\u0930\u0923 \u0935\u093E \u0913\u091F\u093F\u092A\u0940 (OTP) \u092E\u093E\u0917\u094D\u0928\u0947 \u0918\u091F\u0928\u093E\u0939\u0930\u0942 \u0927\u0947\u0930\u0948 \u092D\u0907\u0930\u0939\u0947\u0915\u093E \u091B\u0928\u094D\u0964" : riskCategory === "Medium" ? "\u0915\u0947\u0939\u0940 \u0936\u0902\u0915\u093E\u0938\u094D\u092A\u0926 \u0924\u0924\u094D\u0935\u0939\u0930\u0942 \u092D\u0947\u091F\u093F\u090F\u0915\u093E \u091B\u0928\u094D\u0964 \u0915\u0941\u0928\u0948 \u092A\u0928\u093F \u0932\u093F\u0919\u094D\u0915\u092E\u093E \u0915\u094D\u0932\u093F\u0915 \u0928\u0917\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D \u0930 \u0913\u091F\u093F\u092A\u0940 \u0935\u093E \u092A\u093E\u0938\u0935\u0930\u094D\u0921 \u0928\u0926\u093F\u0928\u0941\u0939\u094B\u0938\u094D\u0964" : "\u0938\u094D\u092A\u0937\u094D\u091F \u0920\u0917\u0940 \u0938\u0902\u0915\u0947\u0924\u0939\u0930\u0942 \u0926\u0947\u0916\u093F\u090F\u0915\u093E \u091B\u0948\u0928\u0928\u094D, \u0924\u0930 \u0905\u092A\u0930\u093F\u091A\u093F\u0924 \u0935\u094D\u092F\u0915\u094D\u0924\u093F \u0935\u093E \u0938\u0928\u094D\u0926\u0947\u0936\u092E\u093E \u0938\u0927\u0948\u0902 \u0938\u0924\u0930\u094D\u0915 \u0930\u0939\u0928\u0941\u0939\u094B\u0938\u094D\u0964",
    nepalContextNotes: "In Nepal, authentic institutions like eSewa, Khalti, ConnectIPS, and commercial banks explicitly state they will NEVER contact customers via personal WhatsApp, Telegram, or Viber requesting OTPs or passwords.",
    disclaimer: "AI and heuristic analysis are assistive screening tools and can make mistakes. Never consider any message definitely safe based solely on this automated assessment."
  };
}
app.post("/api/analyze-message", rateLimiter(25, 6e4), async (req, res) => {
  try {
    const { message, language = "en" } = req.body;
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "Please provide a message to analyze." });
    }
    if (message.length > 6e3) {
      return res.status(400).json({ error: "Message text exceeds maximum length of 6,000 characters." });
    }
    const { sanitized, hadRedactions } = sanitizeForAnalysis(message.trim());
    if (!ai) {
      const result = heuristicMessageAnalysis(sanitized, language);
      return res.json({ ...result, hadRedactions, aiAssisted: false });
    }
    const systemInstruction = `You are CyberShield AI, an elite cybersecurity and threat intelligence analyst specializing in scam, phishing, and social engineering detection with deep expertise in the South Asian and Nepali digital ecosystem (eSewa, Khalti, ConnectIPS, Fonepay, local commercial banks, Ncell/NTC recharge scams, overseas employment visa scams, lottery frauds).

CRITICAL DIRECTIVES:
1. NEVER declare any message as "definitely safe", "100% verified", or "guaranteed benign". Always maintain defensive humility.
2. Evaluate:
   - Possible phishing, spear-phishing, smishing, or credential harvesting.
   - Urgency, fear, or excitement tactics (social engineering).
   - Requests for OTPs, PINs, passwords, bank transfers, or gift cards.
   - Impersonation of institutions (eSewa, Khalti, Nepal Police, Nabil, NIC Asia, Ncell, etc.).
   - Unrealistic prize or lottery claims (e.g. 25 lakh lottery, lottery winner from overseas).
3. Risk categories must be strictly one of: "Low", "Medium", "High", "Inconclusive".
4. Provide structured, balanced analysis with concrete defensive steps for citizens in Nepal.
5. Provide explanations in both English and clear Nepali (\u0928\u0947\u092A\u093E\u0932\u0940 \u092D\u093E\u0937\u093E).`;
    const prompt = `Analyze the following message submitted by a user in Nepal. Determine scam and phishing risks.

Input message to analyze:
"""
${sanitized}
"""

Language preference for primary response: ${language === "np" ? "Nepali" : "English"}`;
    const response = await callGeminiWithTimeout(
      ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskCategory: {
                type: Type.STRING,
                description: "Must be one of: Low, Medium, High, Inconclusive"
              },
              confidenceLevel: {
                type: Type.NUMBER,
                description: "Confidence score from 0 to 100 based on pattern certainty"
              },
              confidenceExplanation: {
                type: Type.STRING,
                description: "Clear statement of the confidence limitations and factors considered"
              },
              suspiciousPhrases: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Key suspicious phrases, triggers, or keywords extracted from the message"
              },
              reasons: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Detailed bullet points explaining why the assessment was reached"
              },
              safeActions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Immediate concrete defensive steps the user should take to stay safe"
              },
              explanation_en: {
                type: Type.STRING,
                description: "A beginner-friendly concise summary explanation in English"
              },
              explanation_np: {
                type: Type.STRING,
                description: "A beginner-friendly concise summary explanation in Nepali (\u0928\u0947\u092A\u093E\u0932\u0940\u092E\u093E \u0938\u0930\u0932 \u0935\u094D\u092F\u093E\u0916\u094D\u092F\u093E)"
              },
              nepalContextNotes: {
                type: Type.STRING,
                description: "Specific security context for Nepal (e.g., eSewa/Khalti policies, Nepal Cyber Bureau advice)"
              },
              disclaimer: {
                type: Type.STRING,
                description: "Explicit warning that AI analysis can make mistakes and cannot guarantee safety"
              }
            },
            required: [
              "riskCategory",
              "confidenceLevel",
              "confidenceExplanation",
              "suspiciousPhrases",
              "reasons",
              "safeActions",
              "explanation_en",
              "explanation_np",
              "nepalContextNotes",
              "disclaimer"
            ]
          }
        }
      }),
      4500
    );
    const text = response.text;
    if (!text) {
      throw new Error("Empty response from model");
    }
    const parsed = JSON.parse(text);
    const validCategories = ["Low", "Medium", "High", "Inconclusive"];
    if (!validCategories.includes(parsed.riskCategory)) {
      parsed.riskCategory = "Medium";
    }
    return res.json({
      ...parsed,
      hadRedactions,
      aiAssisted: true
    });
  } catch (error) {
    console.error("Error analyzing message:", error);
    const fallback = heuristicMessageAnalysis(req.body?.message || "", req.body?.language || "en");
    return res.json({
      ...fallback,
      hadRedactions: false,
      aiAssisted: false,
      notice: "AI service temporarily unavailable; evaluated using CyberShield baseline security heuristics."
    });
  }
});
function inspectUrlSafety(rawUrl) {
  let trimmed = rawUrl.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = "https://" + trimmed;
  }
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      isValid: false,
      error: "Invalid URL format. Please enter a valid web address (e.g., https://example.com)."
    };
  }
  const protocol = parsed.protocol.replace(":", "").toLowerCase();
  if (protocol !== "http" && protocol !== "https") {
    return {
      isValid: false,
      error: "Only standard HTTP and HTTPS web protocols are analyzed."
    };
  }
  const hostname = parsed.hostname.toLowerCase();
  const isIpv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  const isIpv6 = /^\[?[a-f0-9:]+\]?$/i.test(hostname) && hostname.includes(":");
  const isLocalhost = hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local");
  let isPrivateIp = false;
  if (isIpv4) {
    const parts = hostname.split(".").map((p) => parseInt(p, 10));
    if (parts[0] === 127 || // loopback
    parts[0] === 10 || // private class A
    parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31 || // private class B
    parts[0] === 192 && parts[1] === 168 || // private class C
    parts[0] === 169 && parts[1] === 254 || // link-local
    parts[0] === 0 || parts[0] >= 224) {
      isPrivateIp = true;
    }
  }
  const suspiciousTlds = [
    "xyz",
    "top",
    "tk",
    "buzz",
    "rest",
    "click",
    "live",
    "site",
    "work",
    "cfd",
    "fit",
    "icu",
    "gq",
    "ml",
    "ga",
    "cf",
    "men",
    "quest",
    "monster"
  ];
  const domainParts = hostname.split(".");
  const tld = domainParts.length > 1 ? domainParts[domainParts.length - 1] : "";
  const isSuspiciousTld = suspiciousTlds.includes(tld);
  const subdomainCount = domainParts.length;
  const isSubdomainStuffed = subdomainCount > 4;
  const hyphenCount = (hostname.match(/-/g) || []).length;
  const hasExcessiveHyphens = hyphenCount >= 3;
  const hasPunycode = hostname.includes("xn--");
  const hasEmbeddedCredentials = Boolean(parsed.username || parsed.password);
  const targets = ["esewa", "khalti", "fonepay", "connectips", "nabil", "nicasia", "globalime", "nepalpolice", "ncell", "ntc"];
  const impersonatedBrands = targets.filter((brand) => hostname.includes(brand));
  const legitimateKnownDomains = [
    "esewa.com.np",
    "khalti.com",
    "fonepay.com",
    "connectips.com",
    "nabilbank.com",
    "nicasiabank.com",
    "globalimebank.com",
    "nepalpolice.gov.np",
    "ncell.com.np",
    "ntc.net.np",
    "google.com",
    "microsoft.com",
    "apple.com",
    "github.com"
  ];
  const isKnownAuthentic = legitimateKnownDomains.some((d) => hostname === d || hostname.endsWith("." + d));
  return {
    isValid: true,
    normalizedUrl: parsed.href,
    protocol,
    hostname,
    port: parsed.port || (protocol === "https" ? "443" : "80"),
    pathname: parsed.pathname,
    hasQueryParams: Boolean(parsed.search),
    isIpAddress: isIpv4 || isIpv6,
    isPrivateIp,
    isLocalhost,
    isSuspiciousTld,
    tld,
    isSubdomainStuffed,
    hasExcessiveHyphens,
    hasPunycode,
    hasEmbeddedCredentials,
    impersonatedBrands,
    isKnownAuthentic
  };
}
app.post("/api/analyze-url", rateLimiter(25, 6e4), async (req, res) => {
  try {
    const { url, language = "en" } = req.body;
    if (!url || typeof url !== "string" || url.trim().length === 0) {
      return res.status(400).json({ error: "Please enter a URL to analyze." });
    }
    if (url.length > 2048) {
      return res.status(400).json({ error: "URL exceeds maximum length of 2,048 characters." });
    }
    const inspection = inspectUrlSafety(url);
    if (!inspection.isValid) {
      return res.status(400).json({ error: inspection.error });
    }
    const riskSignals = [];
    if (inspection.protocol === "http") {
      riskSignals.push("Unencrypted HTTP protocol \u2014 lacks SSL/TLS encryption for sensitive data.");
    }
    if (inspection.isIpAddress) {
      riskSignals.push("Direct IP address used instead of a registered domain name (common phishing evasion technique).");
    }
    if (inspection.isPrivateIp || inspection.isLocalhost) {
      riskSignals.push("References private internal network or loopback address (potential SSRF trigger).");
    }
    if (inspection.hasEmbeddedCredentials) {
      riskSignals.push("Embedded username/password credentials present in the URL string.");
    }
    if (inspection.isSuspiciousTld) {
      riskSignals.push(`Top-Level Domain (.${inspection.tld}) has high statistical incidence of disposable phishing sites.`);
    }
    if (inspection.isSubdomainStuffed) {
      riskSignals.push("Multi-level nested subdomains detected, often configured to mimic brand names on mobile screens.");
    }
    if (inspection.hasExcessiveHyphens) {
      riskSignals.push("Excessive hyphens in hostname, typical of deceptive keyword-stuffed phishing domains.");
    }
    if (inspection.hasPunycode) {
      riskSignals.push("Internationalized domain name (Punycode xn--) detected; potential homograph spoofing character attack.");
    }
    if (inspection.impersonatedBrands && inspection.impersonatedBrands.length > 0 && !inspection.isKnownAuthentic) {
      riskSignals.push(`Mentions Nepali brand names (${inspection.impersonatedBrands.join(", ")}) on an unverified domain.`);
    }
    if (ai) {
      try {
        const systemInstruction = `You are CyberShield AI's URL Risk Inspector.
CRITICAL MANDATES:
1. Do not claim to have "visited" or "scanned live servers" or "pinged the host". Explicitly state this is an architectural inspection of the URL syntax and naming patterns.
2. Never call any URL "100% safe" or "guaranteed legitimate".
3. Evaluate whether the URL mimics financial institutions, payment gateways (eSewa, Khalti, ConnectIPS, Nepali banks), telecom services, or login portals.
4. Categorize risk strictly into: "Low", "Medium", "High", or "Inconclusive".
5. Provide actionable guidance and bilingual summaries (English and Nepali).`;
        const prompt = `Perform a preliminary cybersecurity assessment of this URL:
URL: ${inspection.normalizedUrl}
Parsed Hostname: ${inspection.hostname}
Protocol: ${inspection.protocol}
Signals detected by static analyzer:
${riskSignals.length > 0 ? riskSignals.map((s) => "- " + s).join("\n") : "- No static flags detected"}
Known Authentic Domain match: ${inspection.isKnownAuthentic ? "YES" : "NO"}

User language: ${language === "np" ? "Nepali" : "English"}`;
        const response = await callGeminiWithTimeout(
          ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
            config: {
              systemInstruction,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  riskCategory: {
                    type: Type.STRING,
                    description: "Must be Low, Medium, High, or Inconclusive"
                  },
                  confidenceScore: {
                    type: Type.NUMBER,
                    description: "Estimated confidence score 0 to 100"
                  },
                  primaryConcerns: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Specific security concerns or suspicious patterns identified"
                  },
                  recommendations: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Specific safe actions for the user"
                  },
                  explanation_en: {
                    type: Type.STRING,
                    description: "Summary explanation in English"
                  },
                  explanation_np: {
                    type: Type.STRING,
                    description: "Summary explanation in Nepali (\u0928\u0947\u092A\u093E\u0932\u0940\u092E\u093E \u0938\u0930\u0932 \u0935\u094D\u092F\u093E\u0916\u094D\u092F\u093E)"
                  },
                  impersonationRisk: {
                    type: Type.STRING,
                    description: "Assessment of brand impersonation or typosquatting"
                  },
                  disclaimer: {
                    type: Type.STRING,
                    description: "Notice explaining that live reputation check / sandbox detonation was not performed"
                  }
                },
                required: [
                  "riskCategory",
                  "confidenceScore",
                  "primaryConcerns",
                  "recommendations",
                  "explanation_en",
                  "explanation_np",
                  "impersonationRisk",
                  "disclaimer"
                ]
              }
            }
          }),
          4500
        );
        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          return res.json({
            ...parsed,
            inspectionData: {
              protocol: inspection.protocol,
              hostname: inspection.hostname,
              port: inspection.port,
              isIpAddress: inspection.isIpAddress,
              hasQueryParams: inspection.hasQueryParams,
              staticSignals: riskSignals
            },
            reputationNotice: "Preliminary architectural assessment. No remote server requests or live sandbox detonations were performed to ensure user and server isolation. Live reputation databases were not queried directly.",
            aiAssisted: true
          });
        }
      } catch (aiErr) {
        console.warn("AI URL analysis unavailable, falling back to static inspection:", aiErr);
      }
    }
    let fallbackCategory = "Low";
    if (riskSignals.length >= 2 || inspection.impersonatedBrands && inspection.impersonatedBrands.length > 0 && !inspection.isKnownAuthentic) {
      fallbackCategory = "High";
    } else if (riskSignals.length === 1) {
      fallbackCategory = "Medium";
    }
    return res.json({
      riskCategory: fallbackCategory,
      confidenceScore: fallbackCategory === "High" ? 85 : 70,
      primaryConcerns: riskSignals.length > 0 ? riskSignals : ["No obvious suspicious structural traits detected."],
      recommendations: [
        "Always verify the domain name matches the official verified website before typing passwords or MPINs.",
        "Look for the secure padlock icon (HTTPS) in your browser address bar.",
        "Never enter credentials if the link was received via unverified SMS or third-party social media chat."
      ],
      explanation_en: fallbackCategory === "High" ? "This URL shows high-risk characteristics (e.g. unencrypted transmission, brand spoofing, or deceptive domain extensions). Visiting it is not recommended." : "Preliminary syntax check completed. Exercise caution and independently verify the organization.",
      explanation_np: fallbackCategory === "High" ? "\u092F\u094B \u0932\u093F\u0919\u094D\u0915 \u0927\u0947\u0930\u0948 \u0936\u0902\u0915\u093E\u0938\u094D\u092A\u0926 \u0926\u0947\u0916\u093F\u0928\u094D\u091B\u0964 \u0928\u0915\u094D\u0915\u0932\u0940 \u0921\u094B\u092E\u0947\u0928 \u0935\u093E \u0905\u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u092A\u094D\u0930\u094B\u091F\u094B\u0915\u0932 \u092A\u094D\u0930\u092F\u094B\u0917 \u092D\u090F\u0915\u094B \u0939\u0941\u0928\u093E\u0932\u0947 \u092F\u0938\u0932\u093E\u0908 \u0928\u0916\u094B\u0932\u094D\u0928\u0941\u0939\u094B\u0938\u094D\u0964" : "\u092A\u094D\u0930\u093E\u0930\u092E\u094D\u092D\u093F\u0915 \u092A\u094D\u0930\u093E\u0935\u093F\u0927\u093F\u0915 \u092A\u0930\u0940\u0915\u094D\u0937\u0923 \u0917\u0930\u093F\u090F\u0915\u094B \u091B\u0964 \u0906\u0927\u093F\u0915\u093E\u0930\u093F\u0915 \u0935\u0947\u092C\u0938\u093E\u0907\u091F \u0939\u094B \u0935\u093E \u0939\u094B\u0907\u0928 \u091C\u093E\u0901\u091A\u0947\u0930 \u092E\u093E\u0924\u094D\u0930 \u0905\u0917\u093E\u0921\u093F \u092C\u0922\u094D\u0928\u0941\u0939\u094B\u0938\u094D\u0964",
      impersonationRisk: inspection.impersonatedBrands && inspection.impersonatedBrands.length > 0 ? `Possible target: ${inspection.impersonatedBrands.join(", ")}` : "No specific brand spoofing identified.",
      disclaimer: "Preliminary structural inspection. This does not replace a live browser sandbox or real-time threat intelligence lookup. Never consider any link definitely safe.",
      inspectionData: {
        protocol: inspection.protocol,
        hostname: inspection.hostname,
        port: inspection.port,
        isIpAddress: inspection.isIpAddress,
        hasQueryParams: inspection.hasQueryParams,
        staticSignals: riskSignals
      },
      reputationNotice: "Preliminary architectural assessment. No remote server requests or live sandbox detonations were performed to ensure user and server isolation.",
      aiAssisted: false
    });
  } catch (error) {
    console.error("Error analyzing URL:", error);
    return res.status(500).json({
      error: "An unexpected error occurred while analyzing the URL. Please verify the URL syntax and try again."
    });
  }
});
app.post("/api/chat", rateLimiter(20, 6e4), async (req, res) => {
  try {
    const { messages, language = "en" } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Chat messages history is required." });
    }
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage || typeof latestMessage.content !== "string" || latestMessage.content.trim().length === 0) {
      return res.status(400).json({ error: "Message content cannot be empty." });
    }
    if (latestMessage.content.length > 2e3) {
      return res.status(400).json({ error: "Message exceeds maximum length of 2,000 characters." });
    }
    const offensivePatterns = [
      /how (can|do) i (hack|crack|infiltrate|steal)/i,
      /create (malware|ransomware|keylogger|trojan|exploit|phishing page)/i,
      /bypass someone('s)? password/i,
      /ddos attack/i,
      /brute force/i
    ];
    const hasOffensiveIntent = offensivePatterns.some((pattern) => pattern.test(latestMessage.content));
    if (hasOffensiveIntent) {
      const refusalMsg = language === "np" ? "CyberShield AI \u090F\u0915 \u0930\u0915\u094D\u0937\u093E\u0924\u094D\u092E\u0915 (Defensive) \u0938\u093E\u0907\u092C\u0930 \u0938\u0941\u0930\u0915\u094D\u0937\u093E \u0938\u0939\u093E\u092F\u0915 \u0939\u094B\u0964 \u092E \u0915\u0941\u0928\u0948 \u092A\u0928\u093F \u0916\u093E\u0924\u093E \u0939\u094D\u092F\u093E\u0915 \u0917\u0930\u094D\u0928, \u092E\u093E\u0932\u0935\u0947\u092F\u0930 \u092C\u0928\u093E\u0909\u0928 \u0935\u093E \u0917\u0948\u0930\u0915\u093E\u0928\u0942\u0928\u0940 \u0906\u0915\u094D\u0930\u092E\u0923 \u0917\u0930\u094D\u0928 \u0938\u0939\u092F\u094B\u0917 \u0917\u0930\u094D\u0928 \u0938\u0915\u094D\u0926\u093F\u0928\u0964 \u0924\u092A\u093E\u0908\u0902\u0915\u094B \u0906\u092B\u094D\u0928\u0948 \u0916\u093E\u0924\u093E \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u0930\u093E\u0916\u094D\u0928 \u0935\u093E \u0918\u091F\u0928\u093E \u0930\u094B\u0915\u0925\u093E\u092E \u0917\u0930\u094D\u0928 \u092E \u0916\u0941\u0938\u0940\u0938\u093E\u0925 \u0938\u0939\u092F\u094B\u0917 \u0917\u0930\u094D\u0928\u0947\u091B\u0941\u0964" : "CyberShield AI is an exclusively defensive cybersecurity assistant. I cannot assist with hacking, creating malware, unauthorized access, or attacking third-party systems. I am here to help you defend your systems, recover compromised accounts, and understand cybersecurity best practices.";
      return res.json({ reply: refusalMsg, isRefusal: true });
    }
    if (!ai) {
      return res.json({
        reply: language === "np" ? "\u0928\u0947\u092A\u093E\u0932\u092E\u093E \u0906\u092B\u094D\u0928\u094B \u0921\u093F\u091C\u093F\u091F\u0932 \u0916\u093E\u0924\u093E \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u0930\u093E\u0916\u094D\u0928: \u0915\u0939\u093F\u0932\u094D\u092F\u0948 \u092A\u0928\u093F \u0913\u091F\u093F\u092A\u0940 (OTP), \u092A\u093F\u0928 \u0935\u093E \u092A\u093E\u0938\u0935\u0930\u094D\u0921 \u0915\u0938\u0948\u0938\u0901\u0917 \u0938\u0947\u092F\u0930 \u0928\u0917\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D\u0964 \u092F\u0926\u093F \u0924\u092A\u093E\u0908\u0902\u0915\u094B \u0908\u0938\u0947\u0935\u093E, \u0916\u0932\u094D\u0924\u0940 \u0935\u093E \u092C\u0948\u0902\u0915 \u0916\u093E\u0924\u093E\u092E\u093E \u0936\u0902\u0915\u093E\u0938\u094D\u092A\u0926 \u0915\u093E\u0930\u094B\u092C\u093E\u0930 \u092D\u090F\u092E\u093E \u0924\u0941\u0930\u0941\u0928\u094D\u0924\u0948 \u0938\u092E\u094D\u092C\u0928\u094D\u0927\u093F\u0924 \u0938\u0902\u0938\u094D\u0925\u093E\u0915\u094B \u0906\u0927\u093F\u0915\u093E\u0930\u093F\u0915 \u0917\u094D\u0930\u093E\u0939\u0915 \u0938\u0947\u0935\u093E \u0935\u093E \u0928\u0947\u092A\u093E\u0932 \u092A\u094D\u0930\u0939\u0930\u0940 \u0938\u093E\u0907\u092C\u0930 \u092C\u094D\u092F\u0941\u0930\u094B (\u0939\u091F\u0932\u093E\u0907\u0928 \u0967\u0967\u0967\u0969) \u092E\u093E \u0938\u092E\u094D\u092A\u0930\u094D\u0915 \u0917\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D\u0964" : "To protect your digital accounts in Nepal: Never share your OTP, MPIN, or passwords with anyone. If you suspect an unauthorized transaction in eSewa, Khalti, or your bank, immediately freeze your account via official customer support and report to Nepal Police Cyber Bureau (Hotline 1113).",
        isRefusal: false
      });
    }
    const systemInstruction = `You are CyberShield Assistant, a polite, expert, and defensive cybersecurity advisor designed for users in Nepal (supporting both English and Nepali).

Key responsibilities:
1. Explain cybersecurity concepts to beginners in simple, practical, actionable terms.
2. Answer defensive questions: recognizing scams, phishing SMS/emails, WhatsApp lottery frauds, fake job offers, two-factor authentication, and safe digital payments (eSewa, Khalti, ConnectIPS, Fonepay, Mobile Banking).
3. Provide step-by-step incident response guidance if a user suspects their account has been compromised (e.g. 1. Immediately change passwords, 2. Enable 2FA, 3. Call bank/wallet customer care to freeze account, 4. Report to Nepal Police Cyber Bureau).
4. Strictly REFUSE any request to develop exploits, bypass security without authorization, steal credentials, generate phishing templates, or launch cyber attacks.
5. Provide official contact points in Nepal when relevant:
   - Nepal Police Cyber Bureau (\u0928\u0947\u092A\u093E\u0932 \u092A\u094D\u0930\u0939\u0930\u0940 \u0938\u093E\u0907\u092C\u0930 \u092C\u094D\u092F\u0941\u0930\u094B): Hotline 1113 or +977-1-4412780 (Bhotahiti, Kathmandu)
   - eSewa Support: 1660-01-02121 / 01-5970020
   - Khalti Support: 1660-01-58888 / 01-5970017
   - ConnectIPS Support: 01-4255306
6. Format your answer with clean Markdown (bullet points, clear headings, bold key actions). Keep explanations direct and easy to follow. Respond in the language used by the user or preferred (${language === "np" ? "Nepali" : "English"}).`;
    const recentMessages = messages.slice(-6);
    const contents = recentMessages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));
    try {
      const response = await callGeminiWithTimeout(
        ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents,
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            temperature: 0.7
          }
        }),
        4500
      );
      const reply = response.text || "I could not generate a response. Please try again.";
      return res.json({ reply, isRefusal: false });
    } catch (aiErr) {
      console.warn("AI Chat unavailable, falling back to defensive guide:", aiErr);
      const defensiveFallback = language === "np" ? "\u0928\u0947\u092A\u093E\u0932\u092E\u093E \u0906\u092B\u094D\u0928\u094B \u0921\u093F\u091C\u093F\u091F\u0932 \u0916\u093E\u0924\u093E \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u0930\u093E\u0916\u094D\u0928 \u092E\u0941\u0916\u094D\u092F \u0938\u0932\u094D\u0932\u093E\u0939\u0939\u0930\u0942:\n\u2022 \u0915\u0939\u093F\u0932\u094D\u092F\u0948 \u092A\u0928\u093F \u0913\u091F\u093F\u092A\u0940 (OTP), \u092A\u093F\u0928 \u0935\u093E \u092A\u093E\u0938\u0935\u0930\u094D\u0921 \u0915\u0938\u0948\u0938\u0901\u0917 \u0938\u0947\u092F\u0930 \u0928\u0917\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D\u0964\n\u2022 \u092C\u0948\u0902\u0915 \u0935\u093E \u0908\u0938\u0947\u0935\u093E\u0932\u0947 \u092B\u094B\u0928 \u0917\u0930\u0947\u0930 \u0913\u091F\u093F\u092A\u0940 \u0915\u0939\u093F\u0932\u094D\u092F\u0948 \u092E\u093E\u0917\u094D\u0926\u0948\u0928\u0928\u094D\u0964\n\u2022 \u0916\u093E\u0924\u093E\u092E\u093E \u0905\u0928\u0927\u093F\u0915\u0943\u0924 \u0915\u093E\u0930\u094B\u092C\u093E\u0930 \u092D\u090F\u092E\u093E \u0924\u0941\u0930\u0941\u0928\u094D\u0924\u0948 \u092C\u0948\u0902\u0915\u092E\u093E \u092B\u094B\u0928 \u0917\u0930\u0947\u0930 \u0916\u093E\u0924\u093E \u0930\u094B\u0915\u094D\u0915\u093E \u0917\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D \u0930 \u0928\u0947\u092A\u093E\u0932 \u092A\u094D\u0930\u0939\u0930\u0940 \u0938\u093E\u0907\u092C\u0930 \u092C\u094D\u092F\u0941\u0930\u094B (\u0939\u091F\u0932\u093E\u0907\u0928 \u0967\u0967\u0967\u0969) \u092E\u093E \u0938\u092E\u094D\u092A\u0930\u094D\u0915 \u0917\u0930\u094D\u0928\u0941\u0939\u094B\u0938\u094D\u0964" : "Key Defensive Guidance for Nepal:\n\u2022 NEVER share OTP, MPIN, or passwords with anyone under any circumstances.\n\u2022 Neither eSewa, Khalti, nor commercial banks will ever call asking for your SMS verification code.\n\u2022 In case of suspicious account activity or unauthorized debits, immediately freeze your account via official customer support and report to Nepal Police Cyber Bureau (Hotline 1113).";
      return res.json({ reply: defensiveFallback, isRefusal: false });
    }
  } catch (error) {
    console.error("Error in chat:", error);
    return res.status(500).json({
      error: "Failed to process chat message. Please try asking again."
    });
  }
});
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "CyberShield AI",
    version: "1.0.0",
    region: "Nepal",
    aiEnabled: Boolean(ai),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CyberShield AI] Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
