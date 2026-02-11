export interface CulturalProfile {
  country: string;
  language: string;
  greeting: string;
  selfIntro: string;
  politenessLevel: "casual" | "polite" | "formal" | "very_formal";
  etiquetteNotes: string[];
  closingPhrase: string;
  commonPhrases: Record<string, string>;
  callingHours: { start: number; end: number };
  tips: string[];
}

export const culturalProfiles: Record<string, CulturalProfile> = {
  japan: {
    country: "Japan",
    language: "Japanese",
    greeting: "お忙しいところ恐れ入ります。",
    selfIntro: "お客様の代理でお電話させていただいております。",
    politenessLevel: "very_formal",
    etiquetteNotes: [
      "Always apologize for the interruption before stating your purpose",
      "Use keigo (honorific language) throughout the conversation",
      "Never rush the conversation — patience is expected",
      "Confirm details by repeating them back",
      "Thank them profusely at the end",
    ],
    closingPhrase: "お忙しいところありがとうございました。失礼いたします。",
    commonPhrases: {
      availability: "空き状況を確認させていただけますか？",
      reservation: "予約をお願いしたいのですが。",
      confirmation: "確認させていただきます。",
      thankyou: "ありがとうございます。",
    },
    callingHours: { start: 10, end: 20 },
    tips: [
      "Many Japanese businesses prefer phone over email",
      "Lunch hours (12-13) should be avoided for calls",
      "Speaking slowly and clearly is appreciated",
    ],
  },
  korea: {
    country: "South Korea",
    language: "Korean",
    greeting: "안녕하세요, 바쁘신 중에 전화드려 죄송합니다.",
    selfIntro: "고객님을 대신하여 전화드리고 있습니다.",
    politenessLevel: "formal",
    etiquetteNotes: [
      "Use formal speech (존댓말) throughout",
      "State your purpose clearly and early",
      "Be respectful but direct — Koreans appreciate efficiency",
      "Confirm all details before ending the call",
    ],
    closingPhrase: "감사합니다. 좋은 하루 되세요.",
    commonPhrases: {
      availability: "예약 가능한지 확인해 주실 수 있나요?",
      reservation: "예약을 하고 싶습니다.",
      confirmation: "확인해 주세요.",
      thankyou: "감사합니다.",
    },
    callingHours: { start: 9, end: 21 },
    tips: [
      "Korean businesses are generally responsive to phone calls",
      "Catchtable is widely used but many premium spots still prefer calls",
      "Age-based honorifics matter in Korean culture",
    ],
  },
  china: {
    country: "China",
    language: "Mandarin Chinese",
    greeting: "您好，打扰了。",
    selfIntro: "我代表客户给您打电话。",
    politenessLevel: "polite",
    etiquetteNotes: [
      "Be polite but direct — Chinese business culture values efficiency",
      "Use 您 (formal you) instead of 你",
      "State your request clearly",
      "Confirm details with numbers and dates explicitly",
    ],
    closingPhrase: "谢谢您，再见。",
    commonPhrases: {
      availability: "请问有空位吗？",
      reservation: "我想预订。",
      confirmation: "请确认一下。",
      thankyou: "谢谢。",
    },
    callingHours: { start: 9, end: 21 },
    tips: [
      "WeChat is dominant but phone calls still work for restaurants",
      "Many businesses may ask for a WeChat contact instead",
      "Be prepared for rapid-fire Mandarin responses",
    ],
  },
  france: {
    country: "France",
    language: "French",
    greeting: "Bonjour, excusez-moi de vous déranger.",
    selfIntro: "J'appelle au nom d'un client.",
    politenessLevel: "formal",
    etiquetteNotes: [
      "Always start with 'Bonjour' — never skip the greeting",
      "Use 'vous' (formal you) throughout",
      "French service culture values politeness above speed",
      "Don't rush — allow natural conversation flow",
    ],
    closingPhrase: "Merci beaucoup, bonne journée.",
    commonPhrases: {
      availability: "Est-ce que vous avez de la disponibilité ?",
      reservation: "Je voudrais faire une réservation.",
      confirmation: "Pouvez-vous confirmer ?",
      thankyou: "Merci beaucoup.",
    },
    callingHours: { start: 9, end: 20 },
    tips: [
      "Many French restaurants close between lunch and dinner service",
      "Call during service prep hours (10-11am or 5-6pm) for best results",
      "Michelin-starred restaurants often have dedicated reservation lines",
    ],
  },
  italy: {
    country: "Italy",
    language: "Italian",
    greeting: "Buongiorno, mi scusi per il disturbo.",
    selfIntro: "Chiamo per conto di un cliente.",
    politenessLevel: "polite",
    etiquetteNotes: [
      "Start with 'Buongiorno' (morning) or 'Buonasera' (evening)",
      "Italians appreciate warmth in conversation",
      "Be patient — conversations may be longer than expected",
      "Confirm details clearly as Italian service can be informal",
    ],
    closingPhrase: "Grazie mille, buona giornata.",
    commonPhrases: {
      availability: "Avete disponibilità?",
      reservation: "Vorrei fare una prenotazione.",
      confirmation: "Può confermare?",
      thankyou: "Grazie.",
    },
    callingHours: { start: 9, end: 21 },
    tips: [
      "Italian restaurants often don't answer during service hours",
      "Best time to call is 10-11:30am or 3-5pm",
      "Many family-run restaurants prefer phone over online booking",
    ],
  },
  spain: {
    country: "Spain",
    language: "Spanish",
    greeting: "Buenos días, disculpe la molestia.",
    selfIntro: "Llamo en nombre de un cliente.",
    politenessLevel: "polite",
    etiquetteNotes: [
      "Use 'usted' (formal you) for business calls",
      "Spanish culture is warm — a friendly tone goes far",
      "Be prepared for later business hours than expected",
      "Siesta hours (2-5pm) may mean no answer",
    ],
    closingPhrase: "Muchas gracias, que tenga un buen día.",
    commonPhrases: {
      availability: "¿Tienen disponibilidad?",
      reservation: "Me gustaría hacer una reserva.",
      confirmation: "¿Puede confirmar?",
      thankyou: "Gracias.",
    },
    callingHours: { start: 10, end: 22 },
    tips: [
      "Spanish dining hours are later — dinner reservations start at 9pm",
      "Avoid calling during siesta (2-5pm)",
      "Many restaurants use WhatsApp for bookings",
    ],
  },
  germany: {
    country: "Germany",
    language: "German",
    greeting: "Guten Tag, entschuldigen Sie die Störung.",
    selfIntro: "Ich rufe im Auftrag eines Kunden an.",
    politenessLevel: "formal",
    etiquetteNotes: [
      "Germans value punctuality and precision",
      "Use 'Sie' (formal you) throughout",
      "Be direct and structured in your request",
      "Confirm all details with exact times and numbers",
    ],
    closingPhrase: "Vielen Dank, auf Wiederhören.",
    commonPhrases: {
      availability: "Haben Sie noch Verfügbarkeit?",
      reservation: "Ich möchte gerne eine Reservierung machen.",
      confirmation: "Können Sie das bitte bestätigen?",
      thankyou: "Vielen Dank.",
    },
    callingHours: { start: 9, end: 20 },
    tips: [
      "German businesses are very punctual — call during stated hours",
      "Many restaurants use online booking but phone is still common",
      "Be precise with your request — vagueness is not appreciated",
    ],
  },
  thailand: {
    country: "Thailand",
    language: "Thai",
    greeting: "สวัสดีครับ/ค่ะ ขอรบกวนนะครับ/คะ",
    selfIntro: "โทรมาแทนลูกค้าครับ/ค่ะ",
    politenessLevel: "polite",
    etiquetteNotes: [
      "Use polite particles ครับ (male) or ค่ะ (female) at end of sentences",
      "Thai culture values gentleness and respect",
      "Avoid being confrontational or overly demanding",
      "A warm, friendly tone is essential",
    ],
    closingPhrase: "ขอบคุณมากครับ/ค่ะ",
    commonPhrases: {
      availability: "มีที่ว่างไหมครับ/คะ?",
      reservation: "อยากจองโต๊ะครับ/ค่ะ",
      confirmation: "ช่วยยืนยันด้วยครับ/คะ",
      thankyou: "ขอบคุณครับ/ค่ะ",
    },
    callingHours: { start: 9, end: 21 },
    tips: [
      "Thai businesses are generally friendly and accommodating",
      "LINE app is very popular for bookings in Thailand",
      "English is more widely spoken in tourist areas",
    ],
  },
  australia: {
    country: "Australia",
    language: "English",
    greeting: "Hi there, sorry to bother you.",
    selfIntro: "I'm calling on behalf of a client.",
    politenessLevel: "polite" as const,
    etiquetteNotes: [
      "Be friendly and casual but polite",
      "Get to the point quickly — Australians appreciate directness",
      "A warm tone goes a long way",
    ],
    closingPhrase: "Thanks so much, have a great day!",
    commonPhrases: {
      availability: "Do you have any availability?",
      reservation: "I'd like to book a table please.",
      confirmation: "Could I just confirm those details?",
      thankyou: "Thanks so much!",
    },
    callingHours: { start: 9, end: 21 },
    tips: [
      "Most restaurants are happy to take phone bookings",
      "Lunch is typically 12-2pm, dinner from 6pm",
      "Casual tone is fine for most places",
    ],
  },
  uk: {
    country: "United Kingdom",
    language: "English",
    greeting: "Hello, sorry to trouble you.",
    selfIntro: "I'm calling on behalf of a client.",
    politenessLevel: "polite" as const,
    etiquetteNotes: [
      "Be polite and slightly formal",
      "Use 'please' and 'thank you' generously",
      "Don't be overly pushy",
    ],
    closingPhrase: "Lovely, thank you very much. Goodbye.",
    commonPhrases: {
      availability: "Would you happen to have availability?",
      reservation: "I'd like to make a reservation, please.",
      confirmation: "Could I just confirm the details?",
      thankyou: "Thank you very much.",
    },
    callingHours: { start: 9, end: 21 },
    tips: [
      "British restaurants appreciate politeness",
      "Lunch is typically 12-2pm, dinner from 6:30pm",
      "A slightly formal tone works well",
    ],
  },
  usa: {
    country: "United States",
    language: "English",
    greeting: "Hi, how are you?",
    selfIntro: "I'm calling on behalf of a client.",
    politenessLevel: "casual" as const,
    etiquetteNotes: [
      "Be friendly and direct",
      "A casual, warm tone works well",
      "Get to the point after a brief greeting",
    ],
    closingPhrase: "Awesome, thanks so much! Have a great day.",
    commonPhrases: {
      availability: "Do you have any availability?",
      reservation: "I'd like to make a reservation.",
      confirmation: "Can I just confirm those details?",
      thankyou: "Thanks so much!",
    },
    callingHours: { start: 9, end: 22 },
    tips: [
      "Most US restaurants use OpenTable but many still take phone bookings",
      "Tipping culture is important — not relevant for booking calls",
      "Friendly and direct is the norm",
    ],
  },
};

export function getCountryOptions() {
  return Object.entries(culturalProfiles).map(([key, profile]) => ({
    value: key,
    label: `${profile.country} (${profile.language})`,
    country: profile.country,
    language: profile.language,
  }));
}

export function generateCallPlan(
  country: string,
  objective: string,
  tone: string,
  constraints?: string,
  fallback?: string
): string {
  const profile = culturalProfiles[country];
  if (!profile) return "No cultural profile available for this country.";

  return JSON.stringify(
    {
      greeting: profile.greeting,
      selfIntroduction: profile.selfIntro,
      objective,
      toneGuidance: `${tone} — aligned with ${profile.politenessLevel} cultural norms`,
      etiquette: profile.etiquetteNotes,
      constraints: constraints || "None specified",
      fallbackOptions: fallback || "None specified",
      closing: profile.closingPhrase,
      callingHours: `${profile.callingHours.start}:00 - ${profile.callingHours.end}:00 local time`,
    },
    null,
    2
  );
}

export function generateCulturalBriefing(country: string): string {
  const profile = culturalProfiles[country];
  if (!profile) return "No cultural briefing available.";

  return [
    `**Country:** ${profile.country}`,
    `**Language:** ${profile.language}`,
    `**Politeness Level:** ${profile.politenessLevel}`,
    "",
    "**Etiquette Notes:**",
    ...profile.etiquetteNotes.map((n) => `• ${n}`),
    "",
    "**Tips:**",
    ...profile.tips.map((t) => `• ${t}`),
    "",
    `**Best Calling Hours:** ${profile.callingHours.start}:00 - ${profile.callingHours.end}:00 local time`,
  ].join("\n");
}
