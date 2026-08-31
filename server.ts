import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { VoiceStyle, AVAILABLE_VOICES, STYLE_SHORTCODES } from "./types";

// Load environment variables from .env and .env.example files.
// Values from .env files should override preset restricted/default keys (e.g. system 429 limited key) if they are real keys.
function loadEnv() {
  const loadedValues: Record<string, string> = {};

  // Process .env.example first, then .env, so that .env takes priority if both have values
  for (const file of [".env.example", ".env"]) {
    const envPath = path.join(process.cwd(), file);
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, "utf-8");
        for (const line of content.split("\n")) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
            const index = trimmed.indexOf("=");
            const key = trimmed.substring(0, index).trim();
            const val = trimmed.substring(index + 1).trim();
            if (key) {
              let cleanVal = val;
              if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                cleanVal = val.substring(1, val.length - 1);
              }
              const vLower = cleanVal.toLowerCase();
              const isPlaceholder = 
                cleanVal === "" || 
                vLower.includes("your_api_key") || 
                vLower.includes("<your") || 
                vLower.includes("your-api-key") ||
                vLower.includes("placeholder") ||
                vLower.includes("enter_");
              
              if (!isPlaceholder) {
                loadedValues[key] = cleanVal;
              }
            }
          }
        }
      } catch (err) {
        console.error(`Error loading env from ${file}:`, err);
      }
    }
  }

  // Apply loaded values to process.env (overwriting any pre-existing environment variables if we have a real value)
  for (const [key, val] of Object.entries(loadedValues)) {
    process.env[key] = val;
    console.log(`Loaded environment variable override: ${key} (Length: ${val.length})`);
  }
}
loadEnv();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: "10mb" }));

// Lazy initializer for Gemini Client to prevent crash on startup if key is missing during deployment checks
let aiInstance: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("Warning: GEMINI_API_KEY environment variable is missing!");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey || "dummy-key-for-build",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

const STYLE_INSTRUCTIONS: Record<VoiceStyle, string> = {
  // Styles
  [VoiceStyle.NEWS]: "Tone: Professional, neutral, fast-paced, authoritative. Clear pronunciation.",
  [VoiceStyle.SAD_STORY]: "Tone: Melancholic, slow pace, heavy pauses, breaking voice, emotional depth.",
  [VoiceStyle.HAPPY_STORY]: "Tone: Cheerful, high energy, smiling voice, upward inflection.",
  [VoiceStyle.SLOGAN]: "Tone: Aggressive, very loud, high pitch, strong emphasis on keywords, chanting style.",
  [VoiceStyle.ADVERTISEMENT]: "Tone: Exciting, persuasive, punchy, fast, dynamic modulation.",
  [VoiceStyle.POEM_RECITAL]: "Tone: Artistic, rhythmic, deep resonance, dramatic pauses, slow tempo.",
  [VoiceStyle.HORROR]: "Tone: Whispering, shaky, suspenseful, breathless, terrifying.",
  [VoiceStyle.DOCUMENTARY]: "Tone: Narrator style, calm, deep, educational, slow and steady.",
  [VoiceStyle.CHILDREN_STORY]: "Tone: Animated, exaggerated, soft, high pitch, motherly/teacher-like.",
  [VoiceStyle.ANGRY]: "Tone: Furious, sharp, loud, harsh consonant stress.",
  [VoiceStyle.ROMANTIC]: "Tone: Intimate, soft, breathy, lower pitch, warm.",
  [VoiceStyle.SEXY]: "Tone: Raw and explicit erotica, heavy heavy breathing, deep gasps, moans interjected between words, trembling and breathless delivery. Simulate the vocalizations of sexual intercourse - extremely intimate, high arousal, broken speech patterns due to physical exertion.",
  [VoiceStyle.MOTIVATIONAL]: "Tone: Inspiring, firm, confident, strong projection.",
  [VoiceStyle.WHISPER]: "Tone: Extremely quiet, close microphone proximity effect, secretive.",
  [VoiceStyle.SHOUTING]: "Tone: Screaming, high urgency, panic, maximum volume.",
  [VoiceStyle.OFFICIAL]: "Tone: Bureaucratic, flat, polite, slow, formal vocabulary.",
  [VoiceStyle.CASUAL]: "Tone: Conversational, relaxed, slang-friendly, variable pace.",
  [VoiceStyle.MYSTERIOUS]: "Tone: Low pitch, slow, secretive, intriguing.",
  [VoiceStyle.FUNNY]: "Tone: Playful, light, giggly, humorous inflection.",
  [VoiceStyle.SARCASTIC]: "Tone: Mocking, drawn-out vowels, ironic stress.",
  [VoiceStyle.PHILOSOPHICAL]: "Tone: Contemplative, deep, wise, slow pauses.",

  // Regional (Instructions to mimic accent/dialect)
  [VoiceStyle.DHAKA]: "Dialect: 'Dhakaiya' / Old Dhaka accent. Use slang like 'khaito', 'jaito', relaxed, slightly sassy tone.",
  [VoiceStyle.CHITTAGONG]: "Dialect: 'Chittagonian'. Fast pace, unique intonation, distinct 'Ch' and 'Sh' sounds, strong regional accent.",
  [VoiceStyle.SYLHET]: "Dialect: 'Sylheti'. Soft, musical intonation, specific pronunciation of 'K' as 'Kh', warm and inviting.",
  [VoiceStyle.BARISAL]: "Dialect: 'Barisali'. Strong emphasis on vowels, slightly drawn out, specific regional vocabulary, assertive tone.",
  [VoiceStyle.NOAKHALI]: "Dialect: 'Noakhali'. Distinct accent, replace 'P' with 'F' sound where applicable in Bengali pronunciation, energetic.",
  [VoiceStyle.KHULNA]: "Dialect: 'Khulna/Jessore'. Standard but earthy, slightly rougher edge, direct and flat intonation.",
  [VoiceStyle.COMILLA]: "Dialect: 'Comilla'. Mix of Noakhali and Standard, distinct rhythm, clear but regional tone.",
  [VoiceStyle.BAGERHAT]: "Dialect: 'Bagerhat/Southern'. Deep, rural tone, specific local twang."
};

// --- Global Rate Limiter ---
// We let requests run in parallel and handle rate limits (429) dynamically using per-request backoff retry.
// This prevents the Promise-chain queue from blocking HTTP connections and causing 504 Gateway Timeouts.

// --- Helper: Robust Error Detection ---
function isPermanentQuotaError(error: any): boolean {
  if (!error) return false;
  let msg = "";
  try {
    msg = (error.message || error.error?.message || (typeof error === "object" ? "" : String(error))).toLowerCase();
  } catch (e) {
    msg = "";
  }
  const code = error.status || error.code || error.error?.code || error.error?.status;
  return (
    code === 429 ||
    code === "RESOURCE_EXHAUSTED" ||
    msg.includes("daily") ||
    msg.includes("per day") ||
    msg.includes("quota") ||
    msg.includes("limit") ||
    msg.includes("exhausted") ||
    msg.includes("too many requests") ||
    msg.includes("generaterequestsperday") ||
    msg.includes("free_tier_requests") ||
    msg.includes("exceeded your current quota")
  );
}

function isQuotaError(error: any): boolean {
  if (!error) return false;
  let msg = "";
  try {
    msg = (error.message || error.error?.message || (typeof error === "object" ? "" : String(error))).toLowerCase();
  } catch (e) {
    msg = "";
  }
  const code = error.status || error.code || error.error?.code || error.error?.status;
  
  return (
    code === 429 || 
    code === 503 || 
    code === "RESOURCE_EXHAUSTED" ||
    msg.includes("quota") || 
    msg.includes("429") || 
    msg.includes("resource_exhausted") || 
    msg.includes("too many requests") ||
    msg.includes("exceeded") || 
    msg.includes("failed to call the gemini api")
  );
}

/**
 * Smart Retry Logic combined with Throttling & Backoff
 */
const withRetry = async <T>(fn: () => Promise<T>, retries = 3, baseDelay = 1000): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (isPermanentQuotaError(error)) {
        throw new Error("আজকের জন্য ফ্রি লিমিট শেষ হয়েছে। দয়া করে আগামীকাল আবার চেষ্টা করুন অথবা আপনার নিজের এপিআই কী ব্যবহার করুন।");
      }
      if (isQuotaError(error)) {
        if (i === retries - 1) {
            console.error("Max retries reached for Quota error.");
            throw new Error("সার্ভার অত্যন্ত ব্যস্ত রয়েছে। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।");
        }
        
        const delay = Math.min(baseDelay * Math.pow(1.5, i), 10000) + (Math.random() * 1000);
        console.warn(`Server Busy (Quota). Waiting ${Math.round(delay/1000)}s before retry ${i + 1}/${retries}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error; 
      }
    }
  }
  throw new Error("Unexpected retry failure");
};

// API Endpoint for Text Analysis
app.post("/api/gemini/analyzeTextContext", async (req, res) => {
  const { text, isDialogueMode } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    let systemPrompt = `You are an expert Voice Director for Bengali Audio. 
    Analyze the provided Bengali text.`;
    
    if (isDialogueMode) {
      systemPrompt += `
      The user wants a Professional Male-Female Dialogue. 
      Rewrite the text into a clear script format.
      Assign parts to 'Male' and 'Female' strictly.
      Format:
      Male: [text]
      Female: [text]
      `;
    } else {
      systemPrompt += `
      Determine the exact emotional Style or Regional Dialect and write a detailed, professional performance instruction.
      Instruction must include: Tone (Emotional Quality), Speed (Pace), Modulation (Pitch variation).
      `;
    }

    const response = await withRetry(() => getAI().models.generateContent({
      model: "gemini-3.5-flash", 
      contents: `${systemPrompt}
      
      Style List: ${Object.values(VoiceStyle).join(", ")}
      Input Text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedStyle: { type: Type.STRING },
            expressionInstruction: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            suggestedVoice: { type: Type.STRING },
            formattedScript: { type: Type.STRING }
          },
          required: ["detectedStyle", "expressionInstruction", "reasoning", "suggestedVoice"],
        },
      },
    }));

    const result = JSON.parse(response.text || "{}");
    
    let style = result.detectedStyle as VoiceStyle;
    if (!Object.values(VoiceStyle).includes(style)) {
        style = VoiceStyle.CASUAL;
    }

    res.json({
      detectedStyle: style,
      expressionInstruction: result.expressionInstruction || "Deliver this with natural flow and professional modulation.",
      reasoning: result.reasoning,
      suggestedVoice: result.suggestedVoice,
      formattedScript: result.formattedScript
    });
  } catch (error: any) {
    console.error("Analysis Error (Non-Fatal):", error);
    const errMsg = error.message || "";
    if (errMsg.includes("ফ্রি লিমিট") || errMsg.includes("সার্ভার খুব ব্যস্ত")) {
      return res.status(503).json({ error: errMsg });
    }
    res.status(500).json({ error: "টেক্সট বিশ্লেষণ করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।" });
  }
});

// --- Helpers for Google Translate TTS Fallback ---
function cleanTextForGoogleTTS(text: string): string {
  // Strip shortcodes like [sylhet], [sad], [news], etc.
  let cleaned = text.replace(/\[[a-zA-Z0-9_#-]+\]/g, "");
  
  // Strip role prefixes
  cleaned = cleaned.replace(/^(male|female|boys|girls|man|woman|ছেলে|মেয়ে|পুরুষ|নারী)\s*:\s*/gi, "");
  
  return cleaned.trim();
}

function splitIntoGoogleTTSChunks(text: string): string[] {
  const cleaned = cleanTextForGoogleTTS(text);
  if (!cleaned) return [];

  // Split by common sentence delimiters: ।, ?, !, \n, and semicolon
  const sentences = cleaned.split(/([।\?!\n;])/g);
  const chunks: string[] = [];
  let currentChunk = "";
  
  for (const part of sentences) {
    if (!part) continue;
    // Limit to 150 characters per chunk to be safe with Google Translate TTS's 200 char limit
    if (currentChunk.length + part.length > 150) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = part;
    } else {
      currentChunk += part;
    }
  }
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.filter(c => c.length > 0);
}

async function generateGoogleTranslateTTS(text: string): Promise<string> {
  const chunks = splitIntoGoogleTTSChunks(text);
  if (chunks.length === 0) {
    throw new Error("No text found for speech fallback generation.");
  }

  const buffers: Buffer[] = [];
  for (const chunk of chunks) {
    const encodedText = encodeURIComponent(chunk);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=bn&client=tw-ob&q=${encodedText}`;
    
    let success = false;
    let lastError: any = null;
    
    // Try twice
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
          }
        });
        if (!response.ok) {
          throw new Error(`Google Translate TTS responded with status ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        buffers.push(Buffer.from(arrayBuffer));
        success = true;
        break;
      } catch (err: any) {
        lastError = err;
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    if (!success) {
      throw lastError || new Error("Failed to fetch from Google Translate TTS.");
    }
  }

  const concatenatedBuffer = Buffer.concat(buffers);
  return concatenatedBuffer.toString("base64");
}

// API Endpoint for Speech Generation
app.post("/api/gemini/generateSpeech", async (req, res) => {
  const {
    text,
    voiceId,
    isDialogue,
    region,
    emotion,
    customInstruction,
    mixMaleId,
    mixFemaleId,
    isPreview
  } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    let config: any = {
      responseModalities: [Modality.AUDIO],
    };

    // 1. Resolve Voice Config
    if (isDialogue) {
      const malePersona = AVAILABLE_VOICES.find(v => v.id === mixMaleId) || AVAILABLE_VOICES.find(v => v.gender === "Male");
      const femalePersona = AVAILABLE_VOICES.find(v => v.id === mixFemaleId) || AVAILABLE_VOICES.find(v => v.gender === "Female");
      
      const maleModel = malePersona?.modelName || "Fenrir";
      const femaleModel = femalePersona?.modelName || "Zephyr";

      config.speechConfig = {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: [
            { speaker: "Male", voiceConfig: { prebuiltVoiceConfig: { voiceName: maleModel } } },
            { speaker: "Female", voiceConfig: { prebuiltVoiceConfig: { voiceName: femaleModel } } }
          ]
        }
      };
    } else {
      const persona = AVAILABLE_VOICES.find(v => v.id === voiceId);
      const realModelName = persona ? persona.modelName : "Fenrir";

      config.speechConfig = {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: realModelName },
        },
      };
    }

    // 2. Prepare Directions and Text Prompt
    const persona = !isDialogue ? AVAILABLE_VOICES.find(v => v.id === voiceId) : null;
    const genderTerm = persona ? (persona.gender === "Female" ? "Female" : "Male") : "Voice Actor";
    const banglaGenderTerm = persona ? (persona.gender === "Female" ? "নারী বাচিক শিল্পী" : "পুরুষ বাচিক শিল্পী") : "বাচিক শিল্পী";
    const baseInstruction = persona?.baseInstruction || "";

    const instructionPrompt = `[ROLE & DIRECTIONS:
    You are a professional Bengali ${genderTerm} (${banglaGenderTerm}).
    Your Goal: Deliver a highly expressive, human-like performance.
    
    ${persona ? `You MUST speak strictly in a ${persona.gender.toLowerCase()} voice that matches your identity. Do NOT mimic or drift into a ${persona.gender === "Female" ? "male" : "female"} voice.
    Voice Profile: ${persona.toneDescription || ""}.
    Specific Identity Guideline: ${baseInstruction}.` : ""}
    
    CRITICAL INSTRUCTION FOR MIXED STYLES:
    The input text may contain Shortcodes/Tags like [sylhet], [sad], [news], [noakhali], etc.
    **When you encounter a tag:**
    1. IMMEDIATELY switch your accent, tone, and dialect to match that tag for the following text${persona ? `, but ALWAYS maintain your ${persona.gender.toLowerCase()} voice` : ""}.
    2. If it is a Regional Tag (e.g., [sylhet], [ctg]), use the specific dialect intonation, pronunciation, and vocabulary style of that region.
    3. If it is an Emotion Tag (e.g., [sad], [happy], [sexy]), change your emotional delivery accordingly.
    
    General Rules:
    1. **Intonation**: Use natural Bengali upward/downward inflections. Do not sound flat.
    2. **Pauses**: Insert micro-pauses at commas and longer pauses at periods.
    3. **Stress**: Emphasize key emotional words.]`;

    let textPrompt = text;
    if (isPreview) {
        textPrompt = `[Role: Speak strictly in a ${persona?.gender?.toLowerCase() || "female"} voice. Deliver naturally with clear pronunciation.] ${text}`;
    } else {
        if (isDialogue) {
          textPrompt = `${instructionPrompt}\n\nTask: Perform this dialogue script. Clearly distinguish between Male and Female roles.\n\nScript:\n${text}`;
        } else {
          if (customInstruction) {
             textPrompt = `${instructionPrompt}\n\nSpecific Direction: ${customInstruction}. \n\nText to read:\n${text}`;
          } else {
            const instructions = [];
            const activeShortcodes = [];

            if (region) {
                instructions.push(`Dialect/Region: ${STYLE_INSTRUCTIONS[region]}`);
                activeShortcodes.push(STYLE_SHORTCODES[region]);
            }
            if (emotion) {
                instructions.push(`Emotion/Style: ${STYLE_INSTRUCTIONS[emotion]}`);
                activeShortcodes.push(STYLE_SHORTCODES[emotion]);
            }

            const combinedInstruction = instructions.join(" AND ");
            const tags = activeShortcodes.join(" ");

            if (combinedInstruction) {
                textPrompt = `${instructionPrompt}\n\nGlobal Direction: ${combinedInstruction}. \n\nText to read:\n${tags} ${text}`;
            } else {
                textPrompt = `${instructionPrompt}\n\nDeliver naturally with clear pronunciation:\n${text}`;
            }
          }
        }
    }

    let base64Audio: string | undefined = undefined;
    let usedModel = "gemini-3.1-flash-tts-preview";

    try {
      console.log(`[TTS Cascade] Attempting speech generation with model: ${usedModel}`);
      const response = await withRetry(() => getAI().models.generateContent({
        model: usedModel,
        contents: [{ parts: [{ text: textPrompt }] }],
        config: config,
      }));

      const audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audio) {
        base64Audio = audio;
        console.log(`[TTS Cascade] Success with model: ${usedModel}`);
      } else {
        console.warn(`[TTS Cascade] Model ${usedModel} returned empty response candidates.`);
      }
    } catch (err: any) {
      console.error(`[TTS Cascade] Speech generation failed with model ${usedModel}. Error:`, err.message || err);
      console.log(`[TTS Cascade] Switching to dynamic Google Translate TTS free fallback...`);
      try {
        base64Audio = await generateGoogleTranslateTTS(text);
        usedModel = "google-translate-fallback";
        console.log(`[TTS Cascade] Google Translate TTS fallback generated successfully!`);
      } catch (fallbackErr: any) {
        console.error(`[TTS Cascade] Google Translate fallback also failed:`, fallbackErr.message || fallbackErr);
        throw err;
      }
    }

    if (!base64Audio) {
      throw new Error("ভয়েস মডেল থেকে কোনো ডাটা পাওয়া যায়নি।");
    }

    res.json({ base64Audio, usedModel });
  } catch (error: any) {
    console.error("Generation Error after cascade:", error);
    const errMsg = error.message || "";
    if (errMsg.includes("ফ্রি লিমিট") || errMsg.includes("সার্ভার খুব ব্যস্ত") || errMsg.includes("quota") || errMsg.includes("limit") || errMsg.includes("exhausted")) {
      return res.status(503).json({ error: "আজকের জন্য ফ্রি লিমিট শেষ হয়েছে। দয়া করে আগামীকাল আবার চেষ্টা করুন অথবা আপনার নিজের এপিআই কী ব্যবহার করুন।" });
    }
    res.status(500).json({ error: "ভয়েস জেনারেট করতে সমস্যা হয়েছে। ইন্টারনেট চেক করুন বা কিছুক্ষণ পর আবার চেষ্টা করুন।" });
  }
});

// Vite Middleware & Routing
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
