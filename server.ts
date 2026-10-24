import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '1mb' }));

// Simple in-memory rate limiter for server protection
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
function rateLimiter(maxRequests = 30, windowMs = 60000) {
  return (req: Request, res: Response, next: () => void) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (entry.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests. Please wait a minute before analyzing more messages or links.',
        retryAfterSeconds: Math.ceil((entry.resetTime - now) / 1000),
      });
    }

    entry.count += 1;
    next();
  };
}

// Clean up stale rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 300000);

// Initialize Google GenAI client server-side
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Timeout wrapper for robust fallback if upstream AI model is slow or unreachable
async function callGeminiWithTimeout<T>(promise: Promise<T>, timeoutMs = 8000): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('AI request timeout')), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer!);
  }
}

// Privacy redaction helper: masks likely OTPs (4-8 digits) and credentials in server processing
function sanitizeForAnalysis(text: string): { sanitized: string; hadRedactions: boolean } {
  let hadRedactions = false;
  // Mask explicit passwords if labelled
  let sanitized = text.replace(/(password|pass|pin|mpin)\s*[:=]\s*(\S+)/gi, (_match, prefix) => {
    hadRedactions = true;
    return `${prefix}: [PROTECTED-CREDENTIAL]`;
  });
  // Mask 4-8 digit OTP tokens following keywords
  sanitized = sanitized.replace(/(otp|code|verification code|token)\s*(is|:|-)?\s*(\d{4,8})/gi, (_match, prefix, sep) => {
    hadRedactions = true;
    return `${prefix} ${sep || 'is'} [OTP-PROTECTED]`;
  });
  return { sanitized, hadRedactions };
}

// Safe heuristic fallback for message analysis if AI is temporarily unreachable
function heuristicMessageAnalysis(message: string, lang = 'en') {
  const lower = message.toLowerCase();
  const triggers: string[] = [];

  if (/otp|one time password|mpin|pin code|security code/i.test(lower)) {
    triggers.push('Requests OTP or confidential security PIN');
  }
  if (/urgent|immediately|expire|within \d+ (hours|minutes)|kyc block|account suspended|deactivated/i.test(lower)) {
    triggers.push('Artificial urgency and account suspension threats');
  }
  if (/lottery|won|cash prize|congratulations|bonus|gift voucher|recharge card|gift|50000|lakh|crore/i.test(lower)) {
    triggers.push('Unrealistic prize, bonus, or lottery claims');
  }
  if (/esewa|khalti|fonepay|connectips|nabil|nic asia|global ime|rastriya banijya|ncell|ntc/i.test(lower)) {
    triggers.push('Mentions major Nepali financial institutions or telecom brands');
  }
  if (/click here|http:\/\/|https:\/\/|bit\.ly|t\.co|wa\.me|viber/i.test(lower)) {
    triggers.push('Directs to external link or unofficial WhatsApp/Viber channels');
  }

  let riskCategory: 'Low' | 'Medium' | 'High' | 'Inconclusive' = 'Low';
  let confidenceLevel = 75;

  if (triggers.length >= 2) {
    riskCategory = 'High';
    confidenceLevel = 88;
  } else if (triggers.length === 1) {
    riskCategory = 'Medium';
    confidenceLevel = 70;
  } else if (message.trim().length < 10) {
    riskCategory = 'Inconclusive';
    confidenceLevel = 50;
  }

  const isNepali = lang === 'np';

  return {
    riskCategory,
    confidenceLevel,
    confidenceExplanation:
      'Evaluated through structural security heuristics checking for credential harvesting, urgency pressure, and brand impersonation. Real attacks may vary in sophistication.',
    suspiciousPhrases: triggers,
    reasons: triggers.length > 0
      ? triggers
      : ['No standard social engineering or credential harvesting keywords immediately identified.'],
    safeActions: [
      'Never send OTP, password, or MPIN to any caller or message sender.',
      'Check your balance directly inside your official banking or wallet app, not via text links.',
      'If in doubt, call the official customer care number listed on the back of your card or in the verified app.',
      'Report suspected scam attempts to the Nepal Police Cyber Bureau (Hotline 1113).',
    ],
    explanation_en:
      riskCategory === 'High'
        ? 'High probability of phishing or scam tactic. Scammers frequently simulate banking alerts, prize notifications, or urgent KYC verification to extract money or account access.'
        : riskCategory === 'Medium'
        ? 'Potentially suspicious elements detected. Proceed with caution and do not disclose sensitive verification codes.'
        : 'The message does not display obvious phishing triggers, but always verify sender identity independently.',
    explanation_np:
      riskCategory === 'High'
        ? 'यो सन्देश ठगी वा फिसिङ (Phishing) हुने उच्च सम्भावना छ। नेपालमा बैंक, ईसेवा वा खल्तीको नाममा नक्कली पुरस्कार, केवाइसी नवीकरण वा ओटिपी (OTP) माग्ने घटनाहरू धेरै भइरहेका छन्।'
        : riskCategory === 'Medium'
        ? 'केही शंकास्पद तत्वहरू भेटिएका छन्। कुनै पनि लिङ्कमा क्लिक नगर्नुहोस् र ओटिपी वा पासवर्ड नदिनुहोस्।'
        : 'स्पष्ट ठगी संकेतहरू देखिएका छैनन्, तर अपरिचित व्यक्ति वा सन्देशमा सधैं सतर्क रहनुहोस्।',
    nepalContextNotes:
      'In Nepal, authentic institutions like eSewa, Khalti, ConnectIPS, and commercial banks explicitly state they will NEVER contact customers via personal WhatsApp, Telegram, or Viber requesting OTPs or passwords.',
    disclaimer:
      'AI and heuristic analysis are assistive screening tools and can make mistakes. Never consider any message definitely safe based solely on this automated assessment.',
  };
}

// 1. ANALYZE SUSPICIOUS MESSAGE ENDPOINT
app.post('/api/analyze-message', rateLimiter(25, 60000), async (req: Request, res: Response) => {
  try {
    const { message, language = 'en' } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide a message to analyze.' });
    }

    if (message.length > 6000) {
      return res.status(400).json({ error: 'Message text exceeds maximum length of 6,000 characters.' });
    }

    const { sanitized, hadRedactions } = sanitizeForAnalysis(message.trim());

    if (!ai) {
      // Fallback if GEMINI_API_KEY is not set
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
5. Provide explanations in both English and clear Nepali (नेपाली भाषा).`;

    const prompt = `Analyze the following message submitted by a user in Nepal. Determine scam and phishing risks.

Input message to analyze:
"""
${sanitized}
"""

Language preference for primary response: ${language === 'np' ? 'Nepali' : 'English'}

You MUST return a valid JSON object matching this exact structure:
{
  "riskCategory": "Low" | "Medium" | "High" | "Inconclusive",
  "confidenceLevel": number between 0 and 100,
  "confidenceExplanation": "explanation of confidence factors",
  "suspiciousPhrases": ["string"],
  "reasons": ["string"],
  "safeActions": ["string"],
  "explanation_en": "clear summary in English",
  "explanation_np": "clear summary in Nepali (नेपालीमा)",
  "nepalContextNotes": "specific context for Nepal",
  "disclaimer": "AI screening notice"
}`;

    let parsed: any = null;
    try {
      const response = await callGeminiWithTimeout(
        ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        }),
        8000
      );

      const text = response.text;
      if (text) {
        parsed = JSON.parse(text);
      }
    } catch (aiErr) {
      console.warn('Live AI message analysis attempt failed or timed out, using heuristic analysis:', aiErr);
    }

    if (!parsed) {
      const fallback = heuristicMessageAnalysis(sanitized, language);
      return res.json({
        ...fallback,
        hadRedactions,
        aiAssisted: false,
        notice: 'Evaluated using CyberShield baseline security heuristics.',
      });
    }

    // Ensure valid confidenceLevel is a number
    if (typeof parsed.confidenceLevel === 'string') {
      parsed.confidenceLevel = parsed.confidenceLevel.toLowerCase() === 'high' ? 88 : parsed.confidenceLevel.toLowerCase() === 'medium' ? 70 : 50;
    }

    // Normalize riskCategory
    const validCategories = ['Low', 'Medium', 'High', 'Inconclusive'];
    if (!validCategories.includes(parsed.riskCategory)) {
      parsed.riskCategory = 'Medium';
    }

    return res.json({
      ...parsed,
      hadRedactions,
      aiAssisted: true,
    });
  } catch (error: unknown) {
    console.error('Error analyzing message:', error);
    // Graceful fallback to heuristic engine so user still gets a helpful result
    const fallback = heuristicMessageAnalysis(req.body?.message || '', req.body?.language || 'en');
    return res.json({
      ...fallback,
      hadRedactions: false,
      aiAssisted: false,
      notice: 'AI service temporarily unavailable; evaluated using CyberShield baseline security heuristics.',
    });
  }
});

// SSRF-SAFE URL INSPECTION HELPER
function inspectUrlSafety(rawUrl: string) {
  let trimmed = rawUrl.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = 'https://' + trimmed;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      isValid: false,
      error: 'Invalid URL format. Please enter a valid web address (e.g., https://example.com).',
    };
  }

  const protocol = parsed.protocol.replace(':', '').toLowerCase();
  if (protocol !== 'http' && protocol !== 'https') {
    return {
      isValid: false,
      error: 'Only standard HTTP and HTTPS web protocols are analyzed.',
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // SSRF & Loopback / Private IP checks
  const isIpv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  const isIpv6 = /^\[?[a-f0-9:]+\]?$/i.test(hostname) && hostname.includes(':');
  const isLocalhost = hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local');

  let isPrivateIp = false;
  if (isIpv4) {
    const parts = hostname.split('.').map((p) => parseInt(p, 10));
    if (
      parts[0] === 127 || // loopback
      parts[0] === 10 || // private class A
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || // private class B
      (parts[0] === 192 && parts[1] === 168) || // private class C
      (parts[0] === 169 && parts[1] === 254) || // link-local
      parts[0] === 0 ||
      parts[0] >= 224 // multicast/reserved
    ) {
      isPrivateIp = true;
    }
  }

  // Suspicious TLD list often abused for quick phishing domains
  const suspiciousTlds = [
    'xyz', 'top', 'tk', 'buzz', 'rest', 'click', 'live', 'site', 'work', 'cfd',
    'fit', 'icu', 'gq', 'ml', 'ga', 'cf', 'men', 'quest', 'monster',
  ];
  const domainParts = hostname.split('.');
  const tld = domainParts.length > 1 ? domainParts[domainParts.length - 1] : '';
  const isSuspiciousTld = suspiciousTlds.includes(tld);

  // Subdomain stuffing (e.g., esewa.com.np.verify-login.xyz)
  const subdomainCount = domainParts.length;
  const isSubdomainStuffed = subdomainCount > 4;

  // Hyphen stuffing (e.g., login-esewa-verify-account-nepal.com)
  const hyphenCount = (hostname.match(/-/g) || []).length;
  const hasExcessiveHyphens = hyphenCount >= 3;

  // Punycode / Homoglyph check
  const hasPunycode = hostname.includes('xn--');

  // Credential in URL
  const hasEmbeddedCredentials = Boolean(parsed.username || parsed.password);

  // Brand impersonation check for Nepal
  const targets = ['esewa', 'khalti', 'fonepay', 'connectips', 'nabil', 'nicasia', 'globalime', 'nepalpolice', 'ncell', 'ntc'];
  const impersonatedBrands = targets.filter((brand) => hostname.includes(brand));

  // Determine legitimate known domains
  const legitimateKnownDomains = [
    'esewa.com.np',
    'khalti.com',
    'fonepay.com',
    'connectips.com',
    'nabilbank.com',
    'nicasiabank.com',
    'globalimebank.com',
    'nepalpolice.gov.np',
    'ncell.com.np',
    'ntc.net.np',
    'google.com',
    'microsoft.com',
    'apple.com',
    'github.com',
  ];
  const isKnownAuthentic = legitimateKnownDomains.some((d) => hostname === d || hostname.endsWith('.' + d));

  return {
    isValid: true,
    normalizedUrl: parsed.href,
    protocol,
    hostname,
    port: parsed.port || (protocol === 'https' ? '443' : '80'),
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
    isKnownAuthentic,
  };
}

// 2. ANALYZE URL RISK ENDPOINT
app.post('/api/analyze-url', rateLimiter(25, 60000), async (req: Request, res: Response) => {
  try {
    const { url, language = 'en' } = req.body;

    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return res.status(400).json({ error: 'Please enter a URL to analyze.' });
    }

    if (url.length > 2048) {
      return res.status(400).json({ error: 'URL exceeds maximum length of 2,048 characters.' });
    }

    const inspection = inspectUrlSafety(url);
    if (!inspection.isValid) {
      return res.status(400).json({ error: inspection.error });
    }

    // SSRF safe: Never fetch remote host! Analyze purely based on URL structure, domain characteristics, and AI reasoning.
    const riskSignals: string[] = [];
    if (inspection.protocol === 'http') {
      riskSignals.push('Unencrypted HTTP protocol — lacks SSL/TLS encryption for sensitive data.');
    }
    if (inspection.isIpAddress) {
      riskSignals.push('Direct IP address used instead of a registered domain name (common phishing evasion technique).');
    }
    if (inspection.isPrivateIp || inspection.isLocalhost) {
      riskSignals.push('References private internal network or loopback address (potential SSRF trigger).');
    }
    if (inspection.hasEmbeddedCredentials) {
      riskSignals.push('Embedded username/password credentials present in the URL string.');
    }
    if (inspection.isSuspiciousTld) {
      riskSignals.push(`Top-Level Domain (.${inspection.tld}) has high statistical incidence of disposable phishing sites.`);
    }
    if (inspection.isSubdomainStuffed) {
      riskSignals.push('Multi-level nested subdomains detected, often configured to mimic brand names on mobile screens.');
    }
    if (inspection.hasExcessiveHyphens) {
      riskSignals.push('Excessive hyphens in hostname, typical of deceptive keyword-stuffed phishing domains.');
    }
    if (inspection.hasPunycode) {
      riskSignals.push('Internationalized domain name (Punycode xn--) detected; potential homograph spoofing character attack.');
    }
    if (inspection.impersonatedBrands && inspection.impersonatedBrands.length > 0 && !inspection.isKnownAuthentic) {
      riskSignals.push(`Mentions Nepali brand names (${inspection.impersonatedBrands.join(', ')}) on an unverified domain.`);
    }

    // Prompt Gemini for intelligent synthesis
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
${riskSignals.length > 0 ? riskSignals.map((s) => '- ' + s).join('\n') : '- No static flags detected'}
Known Authentic Domain match: ${inspection.isKnownAuthentic ? 'YES' : 'NO'}

User language: ${language === 'np' ? 'Nepali' : 'English'}

You MUST return a valid JSON object matching this exact structure:
{
  "riskCategory": "Low" | "Medium" | "High" | "Inconclusive",
  "confidenceScore": number between 0 and 100,
  "primaryConcerns": ["string"],
  "recommendations": ["string"],
  "explanation_en": "clear summary in English",
  "explanation_np": "clear summary in Nepali (नेपालीमा)",
  "impersonationRisk": "assessment of brand spoofing",
  "disclaimer": "preliminary notice"
}`;

      const response = await callGeminiWithTimeout(
        ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        }),
        8000
      );

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        if (typeof parsed.impersonationRisk !== 'string') {
          parsed.impersonationRisk = parsed.impersonationRisk ? 'Brand spoofing risk detected.' : 'No brand spoofing detected.';
        }
        return res.json({
          ...parsed,
          inspectionData: {
            protocol: inspection.protocol,
            hostname: inspection.hostname,
            port: inspection.port,
            isIpAddress: inspection.isIpAddress,
            hasQueryParams: inspection.hasQueryParams,
            staticSignals: riskSignals,
          },
          reputationNotice:
            'Preliminary architectural assessment. No remote server requests or live sandbox detonations were performed to ensure user and server isolation. Live reputation databases were not queried directly.',
          aiAssisted: true,
        });
      }
    } catch (aiErr) {
      console.warn('AI URL analysis unavailable, falling back to static inspection:', aiErr);
    }
  }

    // Heuristic fallback if AI unavailable
    let fallbackCategory: 'Low' | 'Medium' | 'High' | 'Inconclusive' = 'Low';
    if (riskSignals.length >= 2 || (inspection.impersonatedBrands && inspection.impersonatedBrands.length > 0 && !inspection.isKnownAuthentic)) {
      fallbackCategory = 'High';
    } else if (riskSignals.length === 1) {
      fallbackCategory = 'Medium';
    }

    return res.json({
      riskCategory: fallbackCategory,
      confidenceScore: fallbackCategory === 'High' ? 85 : 70,
      primaryConcerns: riskSignals.length > 0 ? riskSignals : ['No obvious suspicious structural traits detected.'],
      recommendations: [
        'Always verify the domain name matches the official verified website before typing passwords or MPINs.',
        'Look for the secure padlock icon (HTTPS) in your browser address bar.',
        'Never enter credentials if the link was received via unverified SMS or third-party social media chat.',
      ],
      explanation_en:
        fallbackCategory === 'High'
          ? 'This URL shows high-risk characteristics (e.g. unencrypted transmission, brand spoofing, or deceptive domain extensions). Visiting it is not recommended.'
          : 'Preliminary syntax check completed. Exercise caution and independently verify the organization.',
      explanation_np:
        fallbackCategory === 'High'
          ? 'यो लिङ्क धेरै शंकास्पद देखिन्छ। नक्कली डोमेन वा असुरक्षित प्रोटोकल प्रयोग भएको हुनाले यसलाई नखोल्नुहोस्।'
          : 'प्रारम्भिक प्राविधिक परीक्षण गरिएको छ। आधिकारिक वेबसाइट हो वा होइन जाँचेर मात्र अगाडि बढ्नुहोस्।',
      impersonationRisk:
        inspection.impersonatedBrands && inspection.impersonatedBrands.length > 0
          ? `Possible target: ${inspection.impersonatedBrands.join(', ')}`
          : 'No specific brand spoofing identified.',
      disclaimer:
        'Preliminary structural inspection. This does not replace a live browser sandbox or real-time threat intelligence lookup. Never consider any link definitely safe.',
      inspectionData: {
        protocol: inspection.protocol,
        hostname: inspection.hostname,
        port: inspection.port,
        isIpAddress: inspection.isIpAddress,
        hasQueryParams: inspection.hasQueryParams,
        staticSignals: riskSignals,
      },
      reputationNotice:
        'Preliminary architectural assessment. No remote server requests or live sandbox detonations were performed to ensure user and server isolation.',
      aiAssisted: false,
    });
  } catch (error: unknown) {
    console.error('Error analyzing URL:', error);
    return res.status(500).json({
      error: 'An unexpected error occurred while analyzing the URL. Please verify the URL syntax and try again.',
    });
  }
});

// 3. AI CYBERSECURITY DEFENSE CHATBOT ENDPOINT
app.post('/api/chat', rateLimiter(20, 60000), async (req: Request, res: Response) => {
  try {
    const { messages, language = 'en' } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Chat messages history is required.' });
    }

    const latestMessage = messages[messages.length - 1];
    if (!latestMessage || typeof latestMessage.content !== 'string' || latestMessage.content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content cannot be empty.' });
    }

    if (latestMessage.content.length > 2000) {
      return res.status(400).json({ error: 'Message exceeds maximum length of 2,000 characters.' });
    }

    // Safety refusal filter for offensive actions
    const offensivePatterns = [
      /how (can|do) i (hack|crack|infiltrate|steal)/i,
      /create (malware|ransomware|keylogger|trojan|exploit|phishing page)/i,
      /bypass someone('s)? password/i,
      /ddos attack/i,
      /brute force/i,
    ];

    const hasOffensiveIntent = offensivePatterns.some((pattern) => pattern.test(latestMessage.content));
    if (hasOffensiveIntent) {
      const refusalMsg = language === 'np'
        ? 'CyberShield AI एक रक्षात्मक (Defensive) साइबर सुरक्षा सहायक हो। म कुनै पनि खाता ह्याक गर्न, मालवेयर बनाउन वा गैरकानूनी आक्रमण गर्न सहयोग गर्न सक्दिन। तपाईंको आफ्नै खाता सुरक्षित राख्न वा घटना रोकथाम गर्न म खुसीसाथ सहयोग गर्नेछु।'
        : 'CyberShield AI is an exclusively defensive cybersecurity assistant. I cannot assist with hacking, creating malware, unauthorized access, or attacking third-party systems. I am here to help you defend your systems, recover compromised accounts, and understand cybersecurity best practices.';
      return res.json({ reply: refusalMsg, isRefusal: true });
    }

    if (!ai) {
      return res.json({
        reply: language === 'np'
          ? 'नेपालमा आफ्नो डिजिटल खाता सुरक्षित राख्न: कहिल्यै पनि ओटिपी (OTP), पिन वा पासवर्ड कसैसँग सेयर नगर्नुहोस्। यदि तपाईंको ईसेवा, खल्ती वा बैंक खातामा शंकास्पद कारोबार भएमा तुरुन्तै सम्बन्धित संस्थाको आधिकारिक ग्राहक सेवा वा नेपाल प्रहरी साइबर ब्युरो (हटलाइन १११३) मा सम्पर्क गर्नुहोस्।'
          : 'To protect your digital accounts in Nepal: Never share your OTP, MPIN, or passwords with anyone. If you suspect an unauthorized transaction in eSewa, Khalti, or your bank, immediately freeze your account via official customer support and report to Nepal Police Cyber Bureau (Hotline 1113).',
        isRefusal: false,
      });
    }

    const systemInstruction = `You are CyberShield Assistant, a polite, expert, and defensive cybersecurity advisor designed for users in Nepal (supporting both English and Nepali).

Key responsibilities:
1. Explain cybersecurity concepts to beginners in simple, practical, actionable terms.
2. Answer defensive questions: recognizing scams, phishing SMS/emails, WhatsApp lottery frauds, fake job offers, two-factor authentication, and safe digital payments (eSewa, Khalti, ConnectIPS, Fonepay, Mobile Banking).
3. Provide step-by-step incident response guidance if a user suspects their account has been compromised (e.g. 1. Immediately change passwords, 2. Enable 2FA, 3. Call bank/wallet customer care to freeze account, 4. Report to Nepal Police Cyber Bureau).
4. Strictly REFUSE any request to develop exploits, bypass security without authorization, steal credentials, generate phishing templates, or launch cyber attacks.
5. Provide official contact points in Nepal when relevant:
   - Nepal Police Cyber Bureau (नेपाल प्रहरी साइबर ब्युरो): Hotline 1113 or +977-1-4412780 (Bhotahiti, Kathmandu)
   - eSewa Support: 1660-01-02121 / 01-5970020
   - Khalti Support: 1660-01-58888 / 01-5970017
   - ConnectIPS Support: 01-4255306
6. Format your answer with clean Markdown (bullet points, clear headings, bold key actions). Keep explanations direct and easy to follow. Respond in the language used by the user or preferred (${language === 'np' ? 'Nepali' : 'English'}).`;

    // Format conversation history for Gemini (last 6 turns max to conserve context)
    const recentMessages = messages.slice(-6);
    const contents = recentMessages.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    try {
      const response = await callGeminiWithTimeout(
        ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        }),
        8000
      );

      const reply = response.text || 'I could not generate a response. Please try again.';
      return res.json({ reply, isRefusal: false, aiAssisted: true });
    } catch (aiErr) {
      console.warn('AI Chat unavailable, falling back to defensive guide:', aiErr);
      const defensiveFallback =
        language === 'np'
          ? 'नेपालमा आफ्नो डिजिटल खाता सुरक्षित राख्न मुख्य सल्लाहहरू:\n• कहिल्यै पनि ओटिपी (OTP), पिन वा पासवर्ड कसैसँग सेयर नगर्नुहोस्।\n• बैंक वा ईसेवाले फोन गरेर ओटिपी कहिल्यै माग्दैनन्।\n• खातामा अनधिकृत कारोबार भएमा तुरुन्तै बैंकमा फोन गरेर खाता रोक्का गर्नुहोस् र नेपाल प्रहरी साइबर ब्युरो (हटलाइन १११३) मा सम्पर्क गर्नुहोस्।'
          : 'Key Defensive Guidance for Nepal:\n• NEVER share OTP, MPIN, or passwords with anyone under any circumstances.\n• Neither eSewa, Khalti, nor commercial banks will ever call asking for your SMS verification code.\n• In case of suspicious account activity or unauthorized debits, immediately freeze your account via official customer support and report to Nepal Police Cyber Bureau (Hotline 1113).';
      return res.json({ reply: defensiveFallback, isRefusal: false });
    }
  } catch (error: unknown) {
    console.error('Error in chat:', error);
    return res.status(500).json({
      error: 'Failed to process chat message. Please try asking again.',
    });
  }
});

// 4. HEALTH CHECK ENDPOINT
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'CyberShield AI',
    version: '1.0.0',
    region: 'Nepal',
    aiEnabled: Boolean(ai),
    timestamp: new Date().toISOString(),
  });
});

// Dev server or static files setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CyberShield AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
