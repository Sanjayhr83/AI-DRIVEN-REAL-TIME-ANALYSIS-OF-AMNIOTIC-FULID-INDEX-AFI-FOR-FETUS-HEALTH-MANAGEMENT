import { GoogleGenerativeAI } from "@google/generative-ai";

/* ---------------- CONFIG & LANGUAGE SUPPORT ---------------- */

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// Current user language state (default: English)
let currentLanguage = 'en';

// Language list for UI
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', label: 'English' },
  { code: 'hi', name: 'हिंदी (Hindi)', label: 'हिंदी' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)', label: 'ಕನ್ನಡ' }
];

// Out-of-scope messages in multiple languages
const OUT_OF_SCOPE_MESSAGES = {
  en: "I can help only with AFI (Amniotic Fluid Index) and fetal health management related questions. Please ask about pregnancy health, amniotic fluid levels, or related topics.",
  hi: "मैं केवल AFI (एम्नियोटिक फ्लूइड इंडेक्स) और भ्रूण स्वास्थ्य प्रबंधन से संबंधित प्रश्नों में मदद कर सकता हूँ। कृपया गर्भावस्था स्वास्थ्य, एम्नियोटिक फ्लूइड स्तर, या संबंधित विषयों के बारे में पूछें।",
  kn: "ನಾನು AFI (Amniotic Fluid Index) ಮತ್ತು ಭ್ರೂಣ ಸ್ವಾಸ್ಥ್ಯ ನಿರ್ವಹಣೆ ಸಂಬಂಧಿತ ಪ್ರಶ್ನೆಗಳೊಂದಿಗೆ ಸಹಾಯ ಮಾಡಬಹುದು. ದಯವಿಟ್ಟು ಗರ್ಭಾವಸ್ಥೆಯ ಆರೋಗ್ಯ, ಎಮ್ನಿಯೊಟಿಕ್ ದ್ರವದ ಮಟ್ಟ ಅಥವಾ ಸಂಬಂಧಿತ ವಿಷಯಗಳ ಬಗ್ಗೆ ಕೇಳಿ."
};

// Language selector prompt
const LANGUAGE_SELECTOR_MESSAGE = {
  en: "🌐 **Welcome to AFI Care Assistant**\n\nPlease select your preferred language / अपनी पसंदीदा भाषा चुनें / ನಿಮ್ಮ ಪ್ರೆಫರ್ಡ್ ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ\n\nOptions:\n- English\n- हिंदी (Hindi)\n- ಕನ್ನಡ (Kannada)",
  hi: "🌐 **AFI Care Assistant में आपका स्वागत है**\n\nअपनी पसंदीदा भाषा चुनें / Select your language / ನಿಮ್ಮ ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ\n\nविकल्प:\n- English\n- हिंदी (Hindi)\n- ಕನ್ನಡ (Kannada)",
  kn: "🌐 **AFI Care Assistant ಗೆ ಸ್ವಾಗತ**\n\nನಿಮ್ಮ ಪ್ರೆಫರ್ಡ್ ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ / अपनी पसंदीदा भाषा चुनें / Select your language\n\nOptions:\n- English\n- हिंदी (Hindi)\n- ಕನ್ನಡ (Kannada)"
};

// Language update confirmation
const LANGUAGE_UPDATED_MESSAGES = {
  en: "✓ Language updated to English. I will continue in English.",
  hi: "✓ भाषा हिंदी में अपडेट की गई। मैं हिंदी में जारी रखूंगा।",
  kn: "✓ ಭಾಷೆ ಕನ್ನಡಕ್ಕೆ ಅಪ್ಡೇಟ್ ಮಾಡಲಾಗಿದೆ. ನಾನು ಕನ್ನಡದಲ್ಲಿ ಮುಂದುವರಿಯುತ್ತೇನೆ."
};

// Medical Disclaimers in Multiple Languages
const DISCLAIMERS = {
  en: "\n\n---\n\n**Medical Disclaimer**: This information is for educational purposes only. Always consult with your healthcare provider for medical advice, diagnosis, or treatment.",
  hi: "\n\n---\n\n**चिकित्सा अस्वीकरण**: यह जानकारी केवल शैक्षिक उद्देश्यों के लिए है। चिकित्सा सलाह, निदान या उपचार के लिए हमेशा अपने स्वास्थ्य सेवा प्रदाता से परामर्श लें।",
  kn: "\n\n---\n\n**ವೈದ್ಯಕೀಯ ನಿರಾಕರಣೆ**: ಈ ಮಾಹಿತಿಯು ಕೇವಲ ಶೈಕ್ಷಣಿಕ ಉದ್ದೇಶಗಳಿಗಾಗಿ ಮಾತ್ರ. ವೈದ್ಯಕೀಯ ಸಲಹೆ, ರೋಗ ನಿರ್ಣಯ ಅಥವಾ ಚಿಕಿತ್ಸೆಗಾಗಿ ಯಾವಾಗಲೂ ನಿಮ್ಮ ಆರೋಗ್ಯ ಸೇವೆ ಒದಗಿಸುವವರೊಂದಿಗೆ ಸಮಾಲೋಚಿಸಿ."
};

export const setCurrentLanguage = (languageCode) => {
  currentLanguage = languageCode;
  return LANGUAGE_UPDATED_MESSAGES[languageCode] || LANGUAGE_UPDATED_MESSAGES['en'];
};

export const getCurrentLanguage = () => currentLanguage;

export const getLanguageSelectorMessage = () => LANGUAGE_SELECTOR_MESSAGE[currentLanguage] || LANGUAGE_SELECTOR_MESSAGE['en'];

export const getLanguageOptions = () => {
  return SUPPORTED_LANGUAGES.map(lang => ({
    code: lang.code,
    name: lang.name,
    label: lang.label,
    isSelected: lang.code === currentLanguage
  }));
};

export const getLanguageUpdateMessage = (languageCode) => {
  return LANGUAGE_UPDATED_MESSAGES[languageCode] || "✓ Language updated.";
};

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

/* ---------------- ENHANCED COMPREHENSIVE PREGNANCY & AFI DATABASE ---------------- */

const pregnancyDatabase = {
  // AFI & Amniotic Fluid Details
  amnioticFluid: [
    { 
      question: "afi", 
      keywords: ["afi", "amniotic fluid index", "fluid index","AFI"],
      answer: "AFI (Amniotic Fluid Index) is a measure of the amount of amniotic fluid surrounding the fetus, assessed via ultrasound to evaluate fetal well-being. It's calculated by measuring the deepest vertical pocket of amniotic fluid in each of the four quadrants of the uterus and summing these measurements." 
    },
    { 
      question: "what is afi", 
      keywords: ["what is afi", "define afi", "afi meaning"],
      answer: "Amniotic Fluid Index (AFI) is a quantitative measure of amniotic fluid volume in the uterus, calculated by summing the deepest vertical pockets in four quadrants of the uterus via ultrasound. Normal range is 8-24 cm." 
    },
    { 
      question: "normal", 
      keywords: ["normal afi", "afi normal", "normal amniotic fluid", "normal level afi", "normal range afi"],
      answer: "Normal AFI ranges from 8 to 24 cm. Values between 5-8 cm are considered borderline and may require further monitoring. Below 5 cm indicates oligohydramnios (low fluid), above 24 cm indicates polyhydramnios (excess fluid)." 
    },
    {
      question: "afi range",
      keywords: ["afi range", "normal afi range", "acceptable afi levels"],
      answer: "The normal AFI range is 8-24 cm. Values between 5-8 cm are borderline, while less than 5 cm indicates low amniotic fluid (oligohydramnios) and greater than 24 cm indicates high amniotic fluid (polyhydramnios). Regular monitoring is essential for borderline or abnormal values."
    },
    { 
      question: "low", 
      keywords: ["low afi", "oligohydramnios", "decreased amniotic fluid", "low level afi", "low range afi"],
      answer: "Low AFI (oligohydramnios) is defined as AFI less than 5 cm. Common causes include ruptured membranes, placental insufficiency, fetal renal abnormalities, or maternal dehydration. Management includes increased hydration, monitoring, and possible early delivery." 
    },
    { 
      question: "high", 
      keywords: ["high afi", "polyhydramnios", "excess amniotic fluid", "high level afi", "high range afi"],
      answer: "High AFI (polyhydramnios) is defined as AFI greater than 24 cm. Can be associated with maternal diabetes, fetal swallowing disorders, gastrointestinal obstructions, or idiopathic causes. Management includes monitoring, treating underlying causes, and possible amnioreduction." 
    },
    {
      question: "increase amniotic fluid",
      keywords: ["increase amniotic fluid", "how to increase amniotic fluid", "boost amniotic fluid", "raise afi"],
      answer: "To increase amniotic fluid levels:\n• Stay well-hydrated: Drink at least 8-10 glasses of water daily\n• Rest on your left side to improve uterine blood flow\n• Avoid diuretics like caffeine\n• Follow a balanced diet rich in nutrients\n• Consult your healthcare provider for further evaluation and management"
    },
    {
      question: "decrease amniotic fluid",
      keywords: ["decrease amniotic fluid", "how to decrease amniotic fluid", "reduce amniotic fluid", "lower afi"],
      answer: "To manage high amniotic fluid levels:\n• Regular monitoring by your healthcare provider\n• Treat underlying conditions like diabetes\n• In some cases, amnioreduction (removal of excess fluid) may be necessary\n• Follow medical advice closely and attend all prenatal appointments"
    },
    {
      question: "afi by week",
      keywords: ["afi by week", "afi at 20 weeks", "afi at 32 weeks", "afi levels by gestation"],
      answer: "Typical AFI ranges by gestational age:\n• 16 weeks: 7.3-20.1 cm\n• 20 weeks: 8.6-24.2 cm\n• 24 weeks: 8.9-25.8 cm\n• 28 weeks: 8.6-24.2 cm\n• 32 weeks: 8.4-25.4 cm\n• 36 weeks: 7.4-24.9 cm\n• 40 weeks: 7.0-24.9 cm\nAlways consult your healthcare provider for personalized assessment."
    },
    {
      question: "afi measurement",
      keywords: ["afi measurement", "how is afi measured", "measuring amniotic fluid"],
      answer: "AFI is measured via ultrasound by dividing the uterus into four quadrants and measuring the deepest vertical pocket of amniotic fluid in each quadrant. The measurements are then summed to obtain the AFI value in centimeters."
    },
    {
      question: "afi test",
      keywords: ["afi test", "amniotic fluid test", "afi ultrasound"],
      answer: "The AFI test is performed using ultrasound to assess the amount of amniotic fluid surrounding the fetus. It helps evaluate fetal well-being and detect conditions like oligohydramnios or polyhydramnios. Regular AFI assessments are part of prenatal care."
    },
    {
      question: "amniotic fluid purpose",
      keywords: ["amniotic fluid purpose", "role of amniotic fluid", "why is amniotic fluid important"],
      answer: "Amniotic fluid serves several vital purposes:\n• Cushions and protects the fetus from external pressure\n• Allows fetal movement and development of muscles and bones\n• Maintains a stable temperature around the fetus\n• Provides space for fetal growth and organ development\n• Helps prevent infection by maintaining a sterile environment"
    },
    {
      question: "amniotic fluid levels",
      keywords: ["amniotic fluid levels", "normal amniotic fluid levels", "acceptable amniotic fluid levels","afi levels"],
      answer: "Normal amniotic fluid levels are indicated by an AFI of 8-24 cm.\nValues between 5-8 cm are considered borderline, whileLevels below 5 cm suggest oligohydramnios (low fluid), \n while levels above 24 cm indicate polyhydramnios (excess fluid).\n Regular monitoring is essential for maintaining fetal health."
    }
    // ... rest of your amnioticFluid array
  ],

  // Pregnancy Health
  pregnancyHealth: [
    { 
      question: "pregnancy nutrition", 
      keywords: ["pregnancy nutrition", "what to eat", "diet"],
      answer: "Essential pregnancy nutrition includes:\n• Folic acid: 600 mcg/day (neural tube development)\n• Iron: 27 mg/day (blood volume increase)\n• Calcium: 1000 mg/day (fetal bones)\n• Protein: 75-100g/day\n• Stay hydrated: 8-12 glasses of water daily" 
    },
    { 
      question: "signs of labor", 
      keywords: ["signs of labor", "contractions", "when to go hospital"],
      answer: "Signs of labor include:\n• Regular contractions getting stronger and closer\n• Water breaking (clear fluid leaking)\n• Bloody show (mucus plug discharge)\n• Lower back pain and pressure\n• Nesting instinct\nGo to hospital when contractions are 5 minutes apart, lasting 60 seconds, for 1 hour." 
    },
    {
      question: "pregnancy symptoms",
      keywords: ["pregnancy symptoms", "common symptoms", "what to expect"],
      answer: "Common pregnancy symptoms:\n• First trimester: Nausea, fatigue, breast tenderness\n• Second trimester: Increased energy, fetal movement\n• Third trimester: Back pain, frequent urination, Braxton Hicks contractions\nAlways report severe symptoms like heavy bleeding or severe pain to your healthcare provider."
    },
    {
      question: "prenatal vitamins",
      keywords: ["prenatal vitamins", "which vitamins", "supplements"],
      answer: "Recommended prenatal vitamins:\n• Folic acid: 600 mcg/day\n• Iron: 27 mg/day\n• Calcium: 1000 mg/day\n• Vitamin D: 600 IU/day\n• DHA (omega-3): 200-300 mg/day\nConsult your healthcare provider for personalized recommendations."
    },
    {
      question: "exercise during pregnancy",
      keywords: ["exercise during pregnancy", "is exercise safe", "pregnancy workouts"],
      answer: "Exercise during pregnancy is generally safe and beneficial. Recommended activities include:\n• Walking\n• Swimming\n• Prenatal yoga\n• Pelvic floor exercises\nAvoid high-impact sports, heavy lifting, and activities with a risk of falling. Always consult your healthcare provider before starting any exercise regimen."
    },
    {
      question: "managing pregnancy discomfort",
      keywords: ["managing pregnancy discomfort", "relieve pregnancy pain", "pregnancy remedies"],
      answer: "To manage pregnancy discomfort:\n• Back pain: Use proper posture, prenatal yoga, and warm baths\n• Nausea: Eat small, frequent meals, avoid strong odors\n• Swelling: Elevate feet, stay hydrated, avoid standing for long periods\n• Heartburn: Eat smaller meals, avoid spicy/fatty foods, sleep with head elevated\nAlways consult your healthcare provider for persistent or severe discomfort."
    },
    {
      question: "pregnancy health tips",
      keywords: ["pregnancy health tips", "healthy pregnancy", "pregnancy care"],
      answer: "Pregnancy health tips:\n• Attend all prenatal appointments\n• Take prenatal vitamins as prescribed\n• Eat a balanced diet rich in fruits, vegetables, and whole grains\n• Stay hydrated and get adequate rest\n• Avoid alcohol, tobacco, and illicit drugs\n• Manage stress through relaxation techniques"
    },
    {
      question: "health tips",
      keywords: ["health tips", "general pregnancy health", "wellness during pregnancy"],
      answer: "General pregnancy health tips:\n• Regular prenatal checkups\n• Balanced diet with essential nutrients\n• Stay physically active with safe exercises\n• Adequate hydration and rest\n• Avoid harmful substances (alcohol, tobacco)\n• Monitor fetal movements and report concerns to your healthcare provider"
    },
    {
      question: "common pregnancy complications",
      keywords: ["common pregnancy complications", "pregnancy risks", "pregnancy issues"],
      answer: "Common pregnancy complications include:\n• Gestational diabetes\n• Preeclampsia\n• Preterm labor\n• Miscarriage\n• Placenta previa\n• Hyperemesis gravidarum\nRegular prenatal care and monitoring can help manage and reduce risks associated with these complications."
    }
    // ... rest of your pregnancyHealth array
  ],

  // Trimesters
  trimesters: [
    { 
      question: "first trimester", 
      keywords: ["first trimester", "weeks 1-12", "early pregnancy"],
      answer: "First trimester (weeks 1-12):\n• All major organs form\n• Morning sickness common\n• Fatigue and breast tenderness\n• First ultrasound around week 8\n• Start prenatal vitamins" 
    },
    {
      question: "second trimester",
      keywords: ["second trimester", "weeks 13-24", "mid-term pregnancy"],
      answer: "Second trimester (weeks 13-24):\n• Fetal movement begins\n• Energy levels improve\n• Ultrasound anatomy scan around week 20\n• Belly starts to show\n• Continue prenatal care and nutrition"
    },
    {
      question: "third trimester",
      keywords: ["third trimester", "weeks 25-36", "late pregnancy"],
      answer: "Third trimester (weeks 25-36):\n• Rapid fetal growth\n• Braxton Hicks contractions may occur\n• Monitor fetal movements\n• Prepare for labor and delivery\n• Attend regular prenatal visits"
    },
    {
      question: "trimester overview",
      keywords: ["trimester overview", "pregnancy trimesters", "pregnancy stages"],
      answer: "Pregnancy is divided into three trimesters:\n• First Trimester (Weeks 1-12): Organ development, morning sickness\n• Second Trimester (Weeks 13-24): Fetal movement, anatomy scan\n• Third Trimester (Weeks 25-36): Rapid growth, labor preparation\nEach trimester has unique developments and care requirements."
    }
    // ... rest of your trimesters array
  ],
};

/* ---------------- ENHANCED FIXED RESPONSE FUNCTION ---------------- */

const getFixedResponse = (message) => {
  if (!message) return null;

  const text = message.toLowerCase().trim();
  const words = text.split(/\s+/);

  // First: Direct keyword matching with enhanced logic
  for (const category in pregnancyDatabase) {
    for (const item of pregnancyDatabase[category]) {
      // Check if message contains the question or any keyword
      if (text.includes(item.question.toLowerCase()) || 
          item.keywords?.some(keyword => text.includes(keyword.toLowerCase()))) {
        return item.answer + (DISCLAIMERS[currentLanguage] || DISCLAIMERS['en']);
      }
    }
  }

  // Second: Partial matching for better coverage
  for (const category in pregnancyDatabase) {
    for (const item of pregnancyDatabase[category]) {
      const itemKeywords = item.keywords || [item.question];
      
      // Check each word in user message against keywords
      for (const word of words) {
        if (word.length > 3) { // Only check meaningful words
          for (const keyword of itemKeywords) {
            if (keyword.toLowerCase().includes(word) || 
                word.includes(keyword.toLowerCase())) {
              return item.answer + (DISCLAIMERS[currentLanguage] || DISCLAIMERS['en']);
            }
          }
        }
      }
    }
  }

  // Third: Check common questions with enhanced matching
  const enhancedFixedData = [
    {
      keys: ["hii", "hello", "hey", "greetings", "start"],
      reply: `👋 **Hello! I'm Your AFI & Pregnancy Health Assistant**\n\n**I specialize in**:\n• AFI measurements and interpretation\n• Amniotic fluid concerns\n• Pregnancy health and nutrition\n• Fetal development\n• Labor and delivery preparation\n\n**Try asking**:\n• "What is normal AFI at 32 weeks?"\n• "How to increase amniotic fluid?"\n• "Pregnancy nutrition tips"\n• "Signs of labor starting"`
    },
    {
      keys: ["thank", "thanks", "appreciate"],
      reply: "You're welcome! 😊 I'm here to help with any questions about AFI, amniotic fluid, or pregnancy health. Is there anything else you'd like to know?"
    },
    {
      keys: ["register", "sign up", "create account"],
      reply: "For registration, please:\n1. Visit our website\n2. Click 'Register' or 'Sign Up'\n3. Fill in your details\n4. Verify your email\n5. Complete your profile\nYou'll receive login credentials via email."
    },
    {
      keys: ["login", "sign in", "log in"],
      reply: "Login issues? Try:\n1. Check your email and password\n2. Use 'Forgot Password' if needed\n3. Clear browser cache\n4. Try incognito mode\n5. Contact support if issues persist"
    },
    {
      keys: ["emergency", "urgent", "help now"],
      reply: "🚨 **URGENT: If this is a medical emergency**:\n1. Call emergency services immediately\n2. Contact your healthcare provider\n3. Go to the nearest hospital\n\nFor urgent pregnancy concerns:\n• Severe abdominal pain\n• Heavy bleeding\n• No fetal movement\n• High fever\n• Severe headache with vision changes"
    },
    {
      keys: ["contact", "support", "help", "call", "email", "phone", "hours", "address"],
      reply: "For support:\n📧 Email: support@aficare.com\n📞 Phone:+91 9685472130(AFI-CARE)\n🕒 Hours: 24/7 Emergency Line\n📍 Address: [Your Hospital/Clinic Address]\n\nFor non-urgent queries, you can also use our online help center."
    },
    {
      keys: ["appointment", "schedule", "book"],
      reply: "To schedule an appointment:\n1. Call our clinic directly\n2. Use our online booking system\n3. Contact via patient portal\n4. For urgent needs, mention 'urgent'\n\nAvailable services:\n• Routine prenatal checkups\n• AFI ultrasound scans\n• High-risk pregnancy consultation\n• Labor and delivery planning"
    },
    {
      keys: ["symptoms", "worried", "concerned"],
      reply: "Common pregnancy symptoms that need attention:\n✅ **Normal**: Mild nausea, fatigue, backache\n⚠️ **Monitor**: Frequent contractions, spotting\n🚨 **Urgent**: Severe pain, heavy bleeding, no fetal movement\n\nAlways contact your healthcare provider with any concerns."
    },
    {
      keys: ["language", "change language", "switch language"],
      reply: "To change the language, please select from the following options:\n- English\n- हिंदी (Hindi)\n- ಕನ್ನಡ (Kannada)\n\nYou can type the language name to switch."
    },
    {
      keys: ["help", "options", "what can you do"],
      reply: "I can assist you with:\n• AFI (Amniotic Fluid Index) information\n• Pregnancy health tips\n• Fetal development guidance\n• Labor and delivery preparation\n• Scheduling appointments\n• Answering common pregnancy questions\n\nFeel free to ask me anything related to pregnancy and AFI!"
    },
    {
      keys: ["faq", "frequently asked questions"],
      reply: "Here are some frequently asked questions:\n1. What is a normal AFI range?\n2. How can I increase my amniotic fluid?\n3. What are the signs of labor?\n4. How often should I have prenatal checkups?\n5. What foods are best during pregnancy?\n\nAsk me any of these or other questions you have!"
    },
    {
      keys: ["goodbye", "bye", "see you", "exit", "quit"],
      reply: "Goodbye! 👋 Wishing you a healthy pregnancy. If you have more questions about AFI or pregnancy health, feel free to reach out anytime."
    }
  ];

  for (const item of enhancedFixedData) {
    if (item.keys.some(key => text.includes(key))) {
      return item.reply + (DISCLAIMERS[currentLanguage] || DISCLAIMERS['en']);
    }
  }

  return null;
};

/* ---------------- ENHANCED OUT-OF-SCOPE DETECTION ---------------- */

const isOutOfScope = (userMessage) => {
  const message = userMessage.toLowerCase();
  
  // Extended AFI and pregnancy-related keywords
  const inScopeKeywords = [
    // English
    'afi', 'amniotic', 'fluid', 'pregnancy', 'pregnant', 'fetal', 'fetus', 'baby',
    'gestational', 'trimester', 'ultrasound', 'prenatal', 'labor', 'delivery',
    'contractions', 'birth', 'obstetric', 'gynecologist', 'health', 'nutrition',
    'doctor', 'hospital', 'clinic', 'checkup', 'scan', 'test', 'monitor',
    'symptoms', 'pain', 'bleeding', 'movement', 'kick', 'weight', 'blood',
    'pressure', 'diabetes', 'vitamin', 'supplement', 'exercise', 'yoga',
    'medication', 'prescription', 'appointment', 'schedule', 'emergency',
    'vaginal', 'discharge', 'urine', 'bowel', 'constipation', 'nausea',
    'vomit', 'headache', 'fever', 'infection', 'antibiotic', 'vaccine',
    'breast', 'milk', 'lactation', 'postpartum', 'recovery', 'cesarean',
    'c-section', 'natural', 'epidural', 'anesthesia', 'pediatric',
    
    // Hindi
    'गर्भावस्था', 'भ्रूण', 'प्रसव', 'अल्ट्रासाउंड', 'जन्म', 'शिशु', 'डॉक्टर',
    'अस्पताल', 'दवा', 'पोषण', 'व्यायाम', 'रक्तचाप', 'मधुमेह', 'विटामिन',
    
    // Kannada
    'ಗರ್ಭಾವಸ್ಥೆ', 'ಭ್ರೂಣ', 'ಪ್ರಸವ', 'ಅಲ್ಟ್ರಾಸೌಂಡ್', 'ಹುಟ್ಟು', 'ಶಿಶು', 'ವೈದ್ಯ',
    'ಆಸ್ಪತ್ರೆ', 'ಔಷಧಿ', 'ಪೋಷಣೆ', 'ವ್ಯಾಯಾಮ', 'ರಕ್ತದೊತ್ತಡ', 'ಮಧುಮೇಹ', 'ಜೀವಸತ್ವ'
  ];
  
  // Non-medical out-of-scope patterns
  const outOfScopePatterns = [
    /weather|forecast|temperature/i,
    /sports|football|cricket|basketball|game/i,
    /movie|film|actor|actress|entertainment/i,
    /politics|election|government|minister/i,
    /finance|stock|market|investment|bitcoin|crypto/i,
    /cooking|recipe|food.*recipe|restaurant/i,
    /travel|vacation|hotel|flight|tourism/i,
    /shopping|buy|purchase|amazon|flipkart/i,
    /education|school|college|exam|study/i,
    /job|career|salary|interview|employment/i,
    /relationship|dating|marriage|wedding|love/i,
    /fashion|clothing|dress|makeup|beauty/i,
    /car|vehicle|automobile|bike|transport/i,
    /technology|computer|phone|software|app/i,
    /music|song|artist|concert|band/i,
    /news|current.*affairs|headline|media/i,
    /history|geography|science|math|physics/i,
    /religion|god|prayer|temple|church|mosque/i,
    /astrology|horoscope|zodiac|fortune/i,
    /joke|funny|humor|comedy|entertain/i
  ];
  
  const hasInScopeKeyword = inScopeKeywords.some(keyword => message.includes(keyword));
  const isOutOfScopePattern = outOfScopePatterns.some(pattern => pattern.test(message));
  
  // If it matches out-of-scope pattern AND doesn't have in-scope keywords
  if (isOutOfScopePattern && !hasInScopeKeyword) {
    return true;
  }
  
  return false;
};

/* ---------------- ENHANCED GEMINI PROMPT WITH LANGUAGE ---------------- */

const createEnhancedPrompt = (userMessage) => {
  const languageInstructions = {
    en: "Respond in clear, simple English suitable for pregnant women and families. Use bullet points, headings, and organized structure.",
    hi: "हिंदी में सरल, सहज भाषा में जवाब दें। गर्भवती महिलाओं और परिवारों के लिए उपयुक्त भाषा का प्रयोग करें। बुलेट पॉइंट्स और स्पष्ट संरचना का उपयोग करें।",
    kn: "ಸರಳ, ಸುಲಭವಾದ ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರ ನೀಡಿ. ಗರ್ಭಿಣಿ ಮಹಿಳೆಯರು ಮತ್ತು ಕುಟುಂಬಗಳಿಗೆ ಸೂಕ್ತವಾದ ಭಾಷೆಯನ್ನು ಬಳಸಿ. ಬುಲೆಟ್ ಪಾಯಿಂಟ್ಗಳು ಮತ್ತು ಸ್ಪಷ್ಟ ರಚನೆಯನ್ನು ಬಳಸಿ."
  };

  const currentLang = currentLanguage || 'en';
  
  return `You are AFI Care Assistant, a senior obstetrician and maternal-fetal medicine specialist with 20+ years experience.

PATIENT CONTEXT:
- User is pregnant or planning pregnancy
- May have concerns about amniotic fluid or general pregnancy health
- Needs accurate, evidence-based, and reassuring information

LANGUAGE REQUIREMENT: ${languageInstructions[currentLang]}

RESPONSE STRUCTURE:
1. Brief clear answer first
2. Detailed explanation in bullet points
3. Normal ranges/values when applicable
4. When to seek medical attention
5. Home care tips (if safe)
6. Follow-up recommendations

SPECIAL INSTRUCTIONS:
- Keep responses under 500 words
- Use simple language (avoid medical jargon)
- Be reassuring and supportive
- Always include disclaimer about consulting healthcare provider
- If uncertain, advise professional consultation
- For emergencies, clearly state to seek immediate help

USER'S QUESTION: "${userMessage}"

FORMAT EXAMPLE:
"Normal AFI at 32 weeks is typically 15-16 cm.

**Key Points:**
• Normal range: 8-24 cm
• Below 5 cm: Low (oligohydramnios)
• Above 24 cm: High (polyhydramnios)

**When to Contact Doctor:**
• If experiencing decreased fetal movement
• Any vaginal fluid leakage
• Abdominal pain or contractions

**Home Care Tips:**
• Stay hydrated (8-10 glasses water daily)
• Monitor fetal movements
• Rest when needed

**Disclaimer:** Always consult your healthcare provider for personalized advice."`;
};

/* ---------------- ENHANCED GEMINI API RESPONSE ---------------- */

export const getGeminiResponse = async (userMessage) => {
  const disclaimer = DISCLAIMERS[currentLanguage] || DISCLAIMERS['en'];
  
  // Check for out-of-scope questions
  if (isOutOfScope(userMessage)) {
    return OUT_OF_SCOPE_MESSAGES[currentLanguage] + disclaimer;
  }
  
  // 1. Enhanced fixed responses with better matching
  const fixed = getFixedResponse(userMessage);
  if (fixed) return fixed;

  // 2. API Key missing
  if (!genAI) {
    const fallbackMessages = {
      en: `⚙️ **Setup Required**: The AI chatbot needs configuration.\n\n**To enable the chatbot**:\n1. Get your free API key from https://ai.google.dev/\n2. Add it to the .env.local file: REACT_APP_GEMINI_API_KEY=your_key\n3. Restart the application\n\n**Meanwhile, here's useful AFI information**:\n• Normal AFI: 8-24 cm\n• Low AFI (<5 cm): May indicate oligohydramnios - requires monitoring\n• High AFI (>24 cm): May indicate polyhydramnios - needs evaluation\n• Stay hydrated: 3-4 liters daily\n• Monitor regularly with healthcare provider\n\n${disclaimer}`,
      hi: `⚙️ **सेटअप आवश्यक**: AI चैटबॉट को कॉन्फ़िगरेशन की आवश्यकता है।\n\n**चैटबॉट को सक्षम करने के लिए**:\n1. https://ai.google.dev/ से अपनी मुफ़्त API कुंजी प्राप्त करें\n2. इसे .env.local फ़ाइल में जोड़ें: REACT_APP_GEMINI_API_KEY=your_key\n3. अनुप्रयोग पुनः आरंभ करें\n\n**उपयोगी AFI जानकारी**:\n• सामान्य AFI: 8-24 सेमी\n• कम AFI (<5 सेमी): ऑलिगोहाइड्रामनिओस का संकेत हो सकता है\n• उच्च AFI (>24 सेमी): पॉलीहाइड्रामनिओस का संकेत हो सकता है\n\n${disclaimer}`,
      kn: `⚙️ **ಸೆಟಪ್ ಅಗತ್ಯ**: AI ಚ್ಯಾಟ್‌ಬಾಟ್‌ಗೆ ಸಂರಚನೆ ಅಗತ್ಯವಿದೆ.\n\n**ಚ್ಯಾಟ್‌ಬಾಟ್ ಸಕ್ರಿಯಗೊಳಿಸಲು**:\n1. https://ai.google.dev/ ನಿಂದ ನಿಮ್ಮ ಉಚಿತ API ಕೀಲಿ ಪಡೆಯಿರಿ\n2. ಅದನ್ನು .env.local ಫೈಲಿಗೆ ಸೇರಿಸಿ: REACT_APP_GEMINI_API_KEY=your_key\n3. ಅನ್ವಯವನ್ನು ಮರುಪ್ರಾರಂಭಿಸಿ\n\n**ಉಪಯುಕ್ತ AFI ಮಾಹಿತಿ**:\n• ಸಾಮಾನ್ಯ AFI: 8-24 ಸೆಮೀ\n• ಕಡಿಮೆ AFI (<5 ಸೆಮೀ): ಮೇಲ್ವಿಚಾರಣೆ ಅಗತ್ಯ\n• ಹೆಚ್ಚು AFI (>24 ಸೆಮೀ): ಮೌಲ್ಯಮಾಪನ ಅಗತ್ಯ\n\n${disclaimer}`
    };
    return fallbackMessages[currentLanguage];
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1500,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    });

    const prompt = createEnhancedPrompt(userMessage);
    
    const result = await model.generateContent(prompt);
    const response = result.response?.text();

    if (!response || response.length < 20) {
      throw new Error("Empty or insufficient response");
    }

    // Format response with proper structure
    let formattedResponse = response;
    
    // Ensure disclaimer is included
    if (!formattedResponse.includes("Disclaimer") && !formattedResponse.includes("disclaimer")) {
      formattedResponse += `\n\n${disclaimer}`;
    }
    
    return formattedResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    
    // Enhanced fallback search
    const fallbackResponse = searchDatabaseFallback(userMessage);
    if (fallbackResponse) {
      return fallbackResponse + disclaimer;
    }
    
    const errorMessages = {
      en: `⚠️ **Service Interruption**: The medical advisor is temporarily unavailable.\n\n**Immediate Actions**:\n1. For urgent concerns: Contact your healthcare provider\n2. Emergency symptoms: Go to nearest hospital\n3. General questions: Try our FAQ section\n\n${disclaimer}`,
      hi: `⚠️ **सेवा व्यवधान**: चिकित्सा सलाहकार अस्थायी रूप से उपलब्ध नहीं है।\n\n**तुरंत कार्रवाई**:\n1. जरूरी समस्याओं के लिए: अपने स्वास्थ्य सेवा प्रदाता को संपर्क करें\n2. आपातकालीन लक्षण: निकटतम अस्पताल जाएं\n${disclaimer}`,
      kn: `⚠️ **ಸೇವೆ ವಿಘ್ನ**: ವೈದ್ಯಕೀಯ ಸಲಾಹಕಾರ ತಾತ್ಕಾಲಿಕವಾಗಿ ಲಭ್ಯವಿಲ್ಲ.\n\n**ತಕ್ಷಣ ಕ್ರಿಯೆ**:\n1. ತುರ್ತುಕ್ಕೆ: ನಿಮ್ಮ ಆರೋಗ್ಯಸೇವೆ ಪ್ರದಾನಕಾರರನ್ನು ಸಂಪರ್ಕಿಸಿ\n2. ತುರ್ತು ಲಕ್ಷಣಗಳು: ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗೆ ಹೋಗಿ\n${disclaimer}`
    };
    
    return errorMessages[currentLanguage];
  }
};

/* ---------------- ENHANCED DATABASE FALLBACK SEARCH ---------------- */

const searchDatabaseFallback = (userMessage) => {
  if (!userMessage) return null;
  
  const text = userMessage.toLowerCase();
  const words = text.split(/\s+/).filter(word => word.length > 3);
  
  let bestMatch = null;
  let highestScore = 0;
  
  // Search through all database categories
  for (const category in pregnancyDatabase) {
    for (let i = 0; i < pregnancyDatabase[category].length; i++) {
      const item = pregnancyDatabase[category][i];
      let score = 0;
      
      const searchText = item.question.toLowerCase() + ' ' + 
                        (item.keywords ? item.keywords.join(' ') : '');
      
      // Exact match scoring
      if (text.includes(item.question.toLowerCase())) {
        score += 10;
      }
      
      // Keyword matching
      words.forEach(word => {
        if (searchText.includes(word)) {
          score += 5;
        }
        if (item.keywords?.some(keyword => keyword.toLowerCase().includes(word))) {
          score += 3;
        }
      });
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    }
  }
  
  if (bestMatch && highestScore >= 3) {
    return "📚 **From Our Medical Database**:\n\n" + bestMatch.answer;
  }

  return null;
};

/* ---------------- ENHANCED AFI ULTRASOUND ANALYZER ---------------- */

const AFI_INVALID_IMAGE_ERROR = {
  en: "❌ **Invalid Image**\n\nPlease upload a valid pregnancy ultrasound image for AFI analysis.\n\n**Supported**: Ultrasound images only\n**Not Supported**: Photos, X-rays, CT scans, documents",
  hi: "❌ **अमान्य छवि**\n\nकृपया AFI विश्लेषण के लिए एक वैध गर्भावस्था अल्ट्रासाउंड छवि अपलोड करें।",
  kn: "❌ **ಅಮಾನ್ಯ ಚಿತ್ರ**\n\nದಯವಿಟ್ಟು AFI ವಿಶ್ಲೇಷಣೆಗಾಗಿ ಮಾನ್ಯ ಗರ್ಭಾವಸ್ಥೆಯ ಅಲ್ಟ್ರಾಸೌಂಡ್ ಚಿತ್ರವನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ."
};

// Enhanced validateUltrasoundImage function remains similar but add timeout
const validateUltrasoundImage = async (imageFile) => {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(false), 3000);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        clearTimeout(timeout);
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          let grayscalePixels = 0;
          let darkPixels = 0;
          let totalPixels = 0;
          
          for (let i = 0; i < data.length; i += 16) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            if (Math.abs(r - g) < 30 && Math.abs(g - b) < 30) {
              grayscalePixels++;
            }
            
            if ((r + g + b) / 3 < 150) {
              darkPixels++;
            }
            totalPixels++;
          }
          
          const grayscalePercentage = (grayscalePixels / totalPixels) * 100;
          const darkPixelPercentage = (darkPixels / totalPixels) * 100;
          
          resolve(grayscalePercentage > 60 && darkPixelPercentage > 15);
        } catch (err) {
          resolve(false);
        }
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };
    
    reader.readAsDataURL(imageFile);
  });
};

export const analyzeAFIUltrasoundImage = async (imageFile, userMessage = null) => {
  try {
    // Validate file
    if (!imageFile || !imageFile.type.startsWith('image/')) {
      return {
        success: false,
        result: AFI_INVALID_IMAGE_ERROR[currentLanguage] || AFI_INVALID_IMAGE_ERROR.en,
        error: "Invalid file type"
      };
    }

    // Validate ultrasound image
    const isUltrasound = await validateUltrasoundImage(imageFile);
    
    if (!isUltrasound) {
      return {
        success: false,
        result: AFI_INVALID_IMAGE_ERROR[currentLanguage] || AFI_INVALID_IMAGE_ERROR.en,
        error: "Not a valid ultrasound image"
      };
    }
    
    // Check API
    if (!genAI) {
      return {
        success: false,
        result: "❌ AFI Analysis Service Unavailable\n\nPlease try again later or contact support.",
        error: "API not configured"
      };
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1000,
      }
    });

    // Convert image
    const imageBase64 = await new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        const base64String = event.target.result.split(',')[1];
        resolve(base64String);
      };
      fileReader.onerror = reject;
      fileReader.readAsDataURL(imageFile);
    });

    const prompt = `Analyze this pregnancy ultrasound image specifically for Amniotic Fluid Index (AFI) assessment.
    
    Provide:
    1. Confirmation if this is an obstetric ultrasound
    2. AFI estimation if possible
    3. Observations about amniotic fluid pockets
    4. Recommendations (monitoring, doctor consultation)
    5. Important disclaimers
    
    User query: "${userMessage || 'Analyze AFI'}"`;
    
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: imageFile.type,
          data: imageBase64,
        },
      },
      prompt
    ]);

    const response = result.response?.text();

    return {
      success: true,
      result: response || "Analysis completed. Please consult your doctor for detailed interpretation.",
      error: null
    };

  } catch (error) {
    console.error("AFI Analysis Error:", error);
    return {
      success: false,
      result: "❌ Analysis Failed\n\nPlease try again or consult your healthcare provider directly.",
      error: error.message
    };
  }
};

/* ---------------- HELPER FUNCTIONS ---------------- */

export const getAFIByWeek = (week) => {
  const ranges = {
    16: "73-201 mm (7.3-20.1 cm)",
    20: "86-242 mm (8.6-24.2 cm)",
    24: "89-258 mm (8.9-25.8 cm)",
    28: "86-242 mm (8.6-24.2 cm)",
    32: "84-254 mm (8.4-25.4 cm)",
    36: "74-249 mm (7.4-24.9 cm)",
    40: "70-249 mm (7.0-24.9 cm)",
  };
  
  const nearestWeek = Object.keys(ranges).reduce((prev, curr) => 
    Math.abs(curr - week) < Math.abs(prev - week) ? curr : prev
  );
  
  return `At ${week} weeks, typical AFI range is ${ranges[nearestWeek]}`;
};

export const getPregnancyTips = (trimester) => {
  const tips = {
    1: [
      "Start prenatal vitamins with folic acid immediately",
      "Schedule your first prenatal appointment",
      "Avoid alcohol, smoking, and recreational drugs",
      "Eat small, frequent meals to manage nausea",
      "Get plenty of rest - fatigue is normal"
    ],
    2: [
      "Continue regular prenatal checkups",
      "Begin tracking fetal movements daily",
      "Consider prenatal education classes",
      "Maintain moderate exercise routine",
      "Plan for maternity leave and baby preparations"
    ],
    3: [
      "Practice perineal massage from 34 weeks",
      "Pack hospital bag by 36 weeks",
      "Learn signs of true labor vs false labor",
      "Set up baby essentials at home",
      "Rest and conserve energy for delivery"
    ]
  };
  
  return tips[trimester] || ["Consult your healthcare provider for personalized advice"];
};

/* ---------------- VOICE SUPPORT FUNCTIONS ---------------- */

// Voice fallback messages
const VOICE_FALLBACK_MESSAGES = {
  en: "Sorry, I could not understand your voice. Please try again or type your question.",
  hi: "क्षमा करें, मैं आपकी आवाज को समझ नहीं सकी। कृपया फिर से कोशिश करें या अपना प्रश्न टाइप करें।",
  kn: "ಕ್ಷಮಿಸಿ, ನಾನು ನಿಮ್ಮ ಧ್ವನಿ ಅರ್ಥ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಟೈಪ್ ಮಾಡಿ."
};

export const startVoiceInput = () => {
  return new Promise((resolve, reject) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      reject("Speech recognition not supported in this browser.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    const languageMap = {
      en: 'en-US',
      hi: 'hi-IN',
      kn: 'kn-IN'
    };
    
    recognition.lang = languageMap[currentLanguage] || 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      resolve(transcript);
    };
    
    recognition.onerror = (event) => {
      reject(VOICE_FALLBACK_MESSAGES[currentLanguage]);
    };
    
    recognition.start();
  });
};

export const speakResponse = (text, rate = 1.0) => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject("Speech synthesis not supported.");
      return;
    }
    
    // Clean text for speech (remove markdown, disclaimers)
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/#/g, '')
      .split('---')[0]
      .split('Disclaimer')[0];
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = currentLanguage === 'hi' ? 'hi-IN' : 
                    currentLanguage === 'kn' ? 'kn-IN' : 'en-US';
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(`Speech error: ${event.error}`);
    
    window.speechSynthesis.speak(utterance);
  });
};

export const getVoiceInteractionResponse = async () => {
  try {
    const userInput = await startVoiceInput();
    console.log("Voice input:", userInput);
    
    const response = await getGeminiResponse(userInput);
    
    // Speak only first 200 characters to avoid long speeches
    const speechText = response.substring(0, 200) + "...";
    await speakResponse(speechText, 0.9);
    
    return response;
  } catch (error) {
    console.error("Voice interaction error:", error);
    return typeof error === 'string' ? error : VOICE_FALLBACK_MESSAGES[currentLanguage];
  }
};

export const stopSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

export const isVoiceInputSupported = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  return !!SpeechRecognition;
};

export const isVoiceOutputSupported = () => {
  return 'speechSynthesis' in window;
};

/* ---------------- QUICK RESPONSE FUNCTIONS ---------------- */

export const getQuickResponses = () => {
  const quickResponses = {
    en: [
      { question: "What is normal AFI range?", answer: "8-24 cm" },
      { question: "Low AFI symptoms?", answer: "Decreased fetal movement, cramping" },
      { question: "How to increase amniotic fluid?", answer: "Drink 3-4 liters of water daily" },
      { question: "When to go to hospital?", answer: "Contractions 5-1-1, water breaks, decreased movement" }
    ],
    hi: [
      { question: "सामान्य AFI रेंज क्या है?", answer: "8-24 सेमी" },
      { question: "कम AFI के लक्षण?", answer: "भ्रूण की गतिविधि कम, ऐंठन" },
      { question: "एम्नियोटिक द्रव कैसे बढ़ाएं?", answer: "प्रतिदिन 3-4 लीटर पानी पिएं" }
    ],
    kn: [
      { question: "ಸಾಮಾನ್ಯ AFI ಶ್ರೇಣಿ ಏನು?", answer: "8-24 ಸೆಂ" },
      { question: "ಕಡಿಮೆ AFI ರೋಗಲಕ್ಷಣಗಳು?", answer: "ಭ್ರೂಣ ಚಲನೆ ಕಡಿಮೆ, ಸೆಳೆತ" },
      { question: "ಎಮ್ನಿಯೊಟಿಕ್ ದ್ರವ ಹೆಚ್ಚಿಸುವುದು ಹೇಗೆ?", answer: "ದಿನಕ್ಕೆ 3-4 ಲೀಟರ್ ನೀರು ಕುಡಿಯಿರಿ" }
    ]
  };
  
  return quickResponses[currentLanguage] || quickResponses.en;
};

/* ---------------- ENHANCED SEARCH FUNCTION ---------------- */

export const searchMedicalDatabase = (query) => {
  if (!query) return null;
  
  const results = [];
  const searchTerms = query.toLowerCase().split(/\s+/);
  
  // Search across all categories
  for (const category in pregnancyDatabase) {
    for (const item of pregnancyDatabase[category]) {
      const searchText = (item.question + ' ' + (item.keywords?.join(' ') || '')).toLowerCase();
      
      // Count matches
      let matchCount = 0;
      for (const term of searchTerms) {
        if (term.length > 2 && searchText.includes(term)) {
          matchCount++;
        }
      }
      
      if (matchCount > 0) {
        results.push({
          question: item.question,
          answer: item.answer.substring(0, 200) + '...',
          category: category,
          matchScore: matchCount
        });
      }
    }
  }
  
  // Sort by match score
  results.sort((a, b) => b.matchScore - a.matchScore);
  
  return results.slice(0, 5); // Return top 5 results
};