export interface SampleMessage {
  id: string;
  title_en: string;
  title_np: string;
  text: string;
  expectedType: 'Scam' | 'Legitimate';
}

export const sampleMessages: SampleMessage[] = [
  {
    id: 'sample-esewa-lottery',
    title_en: 'eSewa 25 Lakh Lottery (Scam)',
    title_np: 'ईसेवा २५ लाख चिठ्ठा (ठगी)',
    text: 'CONGRATULATIONS!! Badhai chha! Tapai ko mobile number le eSewa Lucky Draw ma Rs. 25,00,000/- (Pachchis Lakh) cash prize jiteko chha. Prize claim garna 10 min bhitra tapai ko phone ma aayeko 6-digit verification code (OTP) WhatsApp number 9801234567 ma send garnu hola. Dhila gare prize cancel hunechha.',
    expectedType: 'Scam',
  },
  {
    id: 'sample-kyc-deadline',
    title_en: 'Urgent Bank KYC Block (Scam)',
    title_np: 'बैंक केवाइसी बन्द हुने डर (ठगी)',
    text: 'URGENT NOTICE: Dear customer, your Bank Account KYC has expired today. Your ATM card and mobile banking service will be suspended within 24 hours. Immediately visit http://nabilbank-update-kyc.net.in/verify to submit your details and prevent blocking.',
    expectedType: 'Scam',
  },
  {
    id: 'sample-telecom-data',
    title_en: '50GB Free 4G Data (Scam)',
    title_np: '५० जिबी निःशुल्क डाटा (ठगी)',
    text: 'Ncell Dashain Special Gift! All active prepaid users get FREE 50GB 4G Data + 500 Min Talk Time valid for 30 days. Click here to claim your bonus pack now: http://ncell-free50gb-gift.site/claim before offer ends tonight.',
    expectedType: 'Scam',
  },
  {
    id: 'sample-visa-job',
    title_en: 'Overseas Visa Deposit (Scam)',
    title_np: 'वैदेशिक रोजगार अग्रिम रकम (ठगी)',
    text: 'Urgent hiring for Dubai Hotel & Airport Staff! Monthly salary NPR 95,000 with free food and accommodation. Guaranteed Visa within 7 days. Only 5 slots left. Send your passport copy and medical advance charge Rs 25,000 to eSewa ID 9811223344 immediately.',
    expectedType: 'Scam',
  },
  {
    id: 'sample-legit-bank',
    title_en: 'Genuine Bank Debit Alert (Legitimate)',
    title_np: 'बैंकबाट पैसा काटिएको सन्देश (सुरक्षित)',
    text: 'Dear Customer, your A/C *1234 has been debited by NPR 1,250.00 on 24-Oct-2026 14:32:10 for QR payment at Bhatbhateni Supermarket Kathmandu via Fonepay. Ref: FP99812456. Avail Bal: NPR 42,310.50. Call 01-4412345 if not done by you.',
    expectedType: 'Legitimate',
  },
];

export interface SampleUrl {
  id: string;
  title_en: string;
  title_np: string;
  url: string;
  expectedType: 'Authentic' | 'Phishing' | 'Suspicious';
}

export const sampleUrls: SampleUrl[] = [
  {
    id: 'url-esewa-official',
    title_en: 'Official eSewa Gateway',
    title_np: 'आधिकारिक ईसेवा पोर्टल',
    url: 'https://esewa.com.np',
    expectedType: 'Authentic',
  },
  {
    id: 'url-esewa-typosquatting',
    title_en: 'Spoofed eSewa Phishing Subdomain',
    title_np: 'नक्कली ईसेवा फिसिङ डोमेन',
    url: 'http://esewa.verify-account.login-portal.xyz/nepal',
    expectedType: 'Phishing',
  },
  {
    id: 'url-ip-host',
    title_en: 'Direct Insecure IP Address',
    title_np: 'सिधै आईपी ठेगाना (HTTP)',
    url: 'http://192.168.1.100:8080/banking/login.php',
    expectedType: 'Suspicious',
  },
  {
    id: 'url-fake-bonus',
    title_en: 'Deceptive Free Bonus TLD',
    title_np: 'शंकास्पद उपहार साइट (.buzz)',
    url: 'https://ncell-bonus-reward-2026.buzz/claim?user=9800000000',
    expectedType: 'Suspicious',
  },
];
