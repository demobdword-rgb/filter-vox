
export enum VoiceStyle {
  // Emotions & Styles
  NEWS = "সংবাদ (News)",
  SAD_STORY = "দুঃখের গল্প (Sad)",
  HAPPY_STORY = "সুখী গল্প (Happy)",
  SLOGAN = "স্লোগান (Slogan)",
  ADVERTISEMENT = "বিজ্ঞাপন (Ad)",
  POEM_RECITAL = "কবিতা (Poem)",
  HORROR = "ভৌতিক (Horror)",
  DOCUMENTARY = "ডকুমেন্টারি (Docu)",
  CHILDREN_STORY = "শিশুদের গল্প (Kids)",
  ANGRY = "রাগান্বিত (Angry)",
  ROMANTIC = "রোমান্টিক (Romantic)",
  SEXY = "সেক্সি (Sexy)", // Added Sexy style
  MOTIVATIONAL = "অনুপ্রেরণা (Motiv)",
  WHISPER = "ফিসফিস (Whisper)",
  SHOUTING = "চিৎকার (Shout)",
  OFFICIAL = "অফিসিয়াল (Official)",
  CASUAL = "সাধারণ (Casual)",
  MYSTERIOUS = "রহস্যময় (Mystery)",
  FUNNY = "মজার (Funny)",
  SARCASTIC = "ব্যঙ্গাত্মক (Sarcastic)",
  PHILOSOPHICAL = "দার্শনিক (Deep)",

  // Regional Dialects (Geography Based)
  DHAKA = "ঢাকা (Dhaka)",
  CHITTAGONG = "চট্টগ্রাম (Chittagong)",
  SYLHET = "সিলেট (Sylhet)",
  BARISAL = "বরিশাল (Barisal)",
  NOAKHALI = "নোয়াখালী (Noakhali)",
  KHULNA = "খুলনা (Khulna)",
  COMILLA = "কুমিল্লা (Comilla)",
  BAGERHAT = "বাগেরহাট (Bagerhat)"
}

export const STYLE_SHORTCODES: Record<VoiceStyle, string> = {
  [VoiceStyle.NEWS]: "[news]",
  [VoiceStyle.SAD_STORY]: "[sad]",
  [VoiceStyle.HAPPY_STORY]: "[happy]",
  [VoiceStyle.SLOGAN]: "[slogan]",
  [VoiceStyle.ADVERTISEMENT]: "[ad]",
  [VoiceStyle.POEM_RECITAL]: "[poem]",
  [VoiceStyle.HORROR]: "[horror]",
  [VoiceStyle.DOCUMENTARY]: "[docu]",
  [VoiceStyle.CHILDREN_STORY]: "[kids]",
  [VoiceStyle.ANGRY]: "[angry]",
  [VoiceStyle.ROMANTIC]: "[romantic]",
  [VoiceStyle.SEXY]: "[sexy]", // Shortcode
  [VoiceStyle.MOTIVATIONAL]: "[motivational]",
  [VoiceStyle.WHISPER]: "[whisper]",
  [VoiceStyle.SHOUTING]: "[shout]",
  [VoiceStyle.OFFICIAL]: "[official]",
  [VoiceStyle.CASUAL]: "[casual]",
  [VoiceStyle.MYSTERIOUS]: "[mystery]",
  [VoiceStyle.FUNNY]: "[funny]",
  [VoiceStyle.SARCASTIC]: "[sarcastic]",
  [VoiceStyle.PHILOSOPHICAL]: "[deep]",
  
  // Regional
  [VoiceStyle.DHAKA]: "[dhaka]",
  [VoiceStyle.CHITTAGONG]: "[ctg]",
  [VoiceStyle.SYLHET]: "[sylhet]",
  [VoiceStyle.BARISAL]: "[barisal]",
  [VoiceStyle.NOAKHALI]: "[noakhali]",
  [VoiceStyle.KHULNA]: "[khulna]",
  [VoiceStyle.COMILLA]: "[comilla]",
  [VoiceStyle.BAGERHAT]: "[bagerhat]"
};

export const REGIONAL_STYLES = [
  VoiceStyle.DHAKA,
  VoiceStyle.CHITTAGONG,
  VoiceStyle.SYLHET,
  VoiceStyle.BARISAL,
  VoiceStyle.NOAKHALI,
  VoiceStyle.KHULNA,
  VoiceStyle.COMILLA,
  VoiceStyle.BAGERHAT
];

export const EMOTIONAL_STYLES = [
  VoiceStyle.NEWS,
  VoiceStyle.SAD_STORY,
  VoiceStyle.HAPPY_STORY,
  VoiceStyle.SLOGAN,
  VoiceStyle.ADVERTISEMENT,
  VoiceStyle.POEM_RECITAL,
  VoiceStyle.HORROR,
  VoiceStyle.DOCUMENTARY,
  VoiceStyle.CHILDREN_STORY,
  VoiceStyle.ANGRY,
  VoiceStyle.ROMANTIC,
  VoiceStyle.SEXY, // Added to list
  VoiceStyle.MOTIVATIONAL,
  VoiceStyle.WHISPER,
  VoiceStyle.SHOUTING,
  VoiceStyle.OFFICIAL,
  VoiceStyle.CASUAL,
  VoiceStyle.MYSTERIOUS,
  VoiceStyle.FUNNY,
  VoiceStyle.SARCASTIC,
  VoiceStyle.PHILOSOPHICAL
];

export interface AnalysisResult {
  detectedStyle: VoiceStyle;
  expressionInstruction: string;
  reasoning: string;
  suggestedVoice: string; // This will map to the ID
  formattedScript?: string; // For dialogue mode
}

export interface VoicePersona {
  id: string; // The specific variation ID
  modelName: string; // The underlying Gemini voice name
  label: string;
  gender: 'Male' | 'Female';
  ageRange: string; // e.g. "50-60y"
  toneDescription: string; // e.g. "Deep/Thick"
  baseInstruction?: string; // Specific instruction to simulate age/weight
}

// Extensive list covering age ranges and voice thickness
export const AVAILABLE_VOICES: VoicePersona[] = [
  // --- MALE VOICES ---
  { 
    id: 'm_old_deep', 
    modelName: 'Charon', 
    label: 'বৃদ্ধ ও ভারী (Deepest)', 
    gender: 'Male', 
    ageRange: '৫৫-৬৫ বছর',
    toneDescription: 'অত্যন্ত মোটা ও ভরাট গলা',
    baseInstruction: 'Speak in a very deep, slow, and gravelly voice like a 60 year old wise man'
  },
  { 
    id: 'm_mature_leader', 
    modelName: 'Fenrir', 
    label: 'গম্ভীর পুরুষ (Authoritative)', 
    gender: 'Male', 
    ageRange: '৪০-৫০ বছর',
    toneDescription: 'ভারী ও দরাজ গলা (স্লোগানের জন্য সেরা)',
    baseInstruction: 'Speak with a deep, resonant, and commanding voice of a leader'
  },
  { 
    id: 'm_mid_pro', 
    modelName: 'Fenrir', 
    label: 'পেশাদার পুরুষ (Professional)', 
    gender: 'Male', 
    ageRange: '৩০-৪০ বছর',
    toneDescription: 'স্বাভাবিক ও স্পষ্ট (নিউজ/অফিসিয়াল)',
    baseInstruction: 'Speak in a clear, professional, mid-tone voice'
  },
  { 
    id: 'm_young_energetic', 
    modelName: 'Puck', 
    label: 'তরুণ যুবক (Energetic)', 
    gender: 'Male', 
    ageRange: '২০-৩০ বছর',
    toneDescription: 'চিকন ও দ্রুত (বিজ্ঞাপনের জন্য)',
    baseInstruction: 'Speak in a slightly higher pitched, energetic, and youthful voice'
  },
  { 
    id: 'm_young_calm', 
    modelName: 'Puck', 
    label: 'শান্ত যুবক (Soft Male)', 
    gender: 'Male', 
    ageRange: '২০-২৫ বছর',
    toneDescription: 'নরম ও শান্ত ছেলের গলা',
    baseInstruction: 'Speak in a soft, calm, and friendly young male voice'
  },
  
  // --- FEMALE VOICES ---
  { 
    id: 'f_mature_deep', 
    modelName: 'Zephyr', 
    label: 'গম্ভীর নারী (Mature)', 
    gender: 'Female', 
    ageRange: '৪০-৫০ বছর',
    toneDescription: 'ভারী ও সিরিয়াস',
    baseInstruction: 'Speak in a lower-pitched, serious, and mature female voice'
  },
  { 
    id: 'f_mid_anchor', 
    modelName: 'Zephyr', 
    label: 'উপস্থাপিকা (Anchor)', 
    gender: 'Female', 
    ageRange: '২৫-৩৫ বছর',
    toneDescription: 'উজ্জ্বল ও স্পষ্ট',
    baseInstruction: 'Speak in a professional, clear, and bright news anchor voice'
  },
  { 
    id: 'f_young_sweet', 
    modelName: 'Kore', 
    label: 'তরুণী (Sweet)', 
    gender: 'Female', 
    ageRange: '১৮-২৫ বছর',
    toneDescription: 'চিকন ও মিষ্টি গলা',
    baseInstruction: 'Speak in a soft, sweet, and youthful female voice'
  },
  { 
    id: 'f_storyteller', 
    modelName: 'Kore', 
    label: 'গল্পের খালামনি (Story)', 
    gender: 'Female', 
    ageRange: '৩০-৪০ বছর',
    toneDescription: 'আবেগী ও মায়াবী',
    baseInstruction: 'Speak in an emotional, storytelling tone with warmth'
  },
  { 
    id: 'f_robot', 
    modelName: 'Zephyr', 
    label: 'রোবোটিক (AI Asst)', 
    gender: 'Female', 
    ageRange: 'N/A',
    toneDescription: 'নিউট্রাল ও যান্ত্রিক',
    baseInstruction: 'Speak in a perfectly flat, neutral, digital assistant voice'
  }
];
