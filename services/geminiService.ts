import { AnalysisResult, VoiceStyle } from "../types";

export const SAMPLE_TEXTS: Record<VoiceStyle, string> = {
  // Styles
  [VoiceStyle.SLOGAN]: "জ্বালো রে জ্বালো, আগুন জ্বালো! আমাদের দাবি মানতে হবে, নইলে গদি ছাড়তে হবে!",
  [VoiceStyle.ADVERTISEMENT]: "ধামাকা অফার! মাত্র ১ টাকায় কিনুন স্বপ্নের বাড়ি! স্টক সীমিত, এখনই কল করুন!",
  [VoiceStyle.HORROR]: "গভীর রাতে... দরজায় টোকা পড়ল। কে ওখানে? কোনো সাড়া নেই...",
  [VoiceStyle.NEWS]: "সন্ধ্যার বিশেষ সংবাদে আপনাদের স্বাগত জানাচ্ছি। আজ ঢাকার রাজপথে নেমেছে মানুষের ঢল।",
  [VoiceStyle.SAD_STORY]: "সবকিছু হারিয়ে আমি আজ বড় একা হয়ে পড়েছি। কেউ নেই আমার পাশে।",
  [VoiceStyle.HAPPY_STORY]: "আজকের দিনটা কত সুন্দর! পাখিরা গান গাইছে, আকাশটা নীল!",
  [VoiceStyle.POEM_RECITAL]: "বল বীর, বল উন্নত মম শির! শির নেহারি আমারি নতশির ওই শিখর হিমাদ্রির!",
  [VoiceStyle.DOCUMENTARY]: "সুন্দরবনের গহিনে লুকিয়ে আছে প্রকৃতির অপার রহস্য। বাঘের গর্জনে কেঁপে ওঠে বন।",
  [VoiceStyle.CHILDREN_STORY]: "এক দেশে ছিল এক রাজা, আর তার ছিল এক রানি। তাদের ছিল ছোট্ট এক রাজকন্যা।",
  [VoiceStyle.ANGRY]: "আমি তোমাকে শেষবারের মতো সাবধান করছি! আমার সামনে থেকে দূর হয়ে যাও!",
  [VoiceStyle.ROMANTIC]: "তোমায় আমি আকাশ দেব, দেব ভোরের শিশির। তুমি কি হবে আমার?",
  [VoiceStyle.SEXY]: "উফ... জান... আমি আর পারছি না... আমাকে আদর করো... আরো কাছে এসো...",
  [VoiceStyle.MOTIVATIONAL]: "হাল ছেড়ো না বন্ধু, তুমিও পারবে আকাশ ছুঁতে। বিশ্বাস রাখো নিজের ওপর!",
  [VoiceStyle.WHISPER]: "চুপ... একদম চুপ। কেউ যেন আমাদের কথা শুনতে না পায়।",
  [VoiceStyle.SHOUTING]: "বাঁচাও! আগুন লেগেছে! কেউ কি আছো আমাকে সাহায্য করার জন্য?",
  [VoiceStyle.OFFICIAL]: "আপনার আবেদনটি গৃহীত হয়েছে। পরবর্তী নির্দেশনার জন্য অপেক্ষা করুন। ধন্যবাদ।",
  [VoiceStyle.CASUAL]: "আরে দোস্ত, কেমন আছিস? অনেক দিন পর দেখা। চল কোথাও কফি খাই।",
  [VoiceStyle.MYSTERIOUS]: "সেই পুরনো সিন্দুকটা খোলার পর থেকেই অদ্ভুত সব ঘটনা ঘটতে শুরু করল।",
  [VoiceStyle.FUNNY]: "আরে ভাই, আমি তো মনে করেছিলাম এটা বিড়াল, কাছে গিয়ে দেখি বাঘের মাসি!",
  [VoiceStyle.SARCASTIC]: "বাহ! খুব ভালো কাজ করেছ, একেবারে ডুবিয়ে দিয়েছ সবাইকে। সাবাস!",
  [VoiceStyle.PHILOSOPHICAL]: "জীবন মানেই তো এক অন্তহীন যাত্রা। কোথায় শুরু, কোথায় শেষ, কেউ জানে না।",

  // Regional
  [VoiceStyle.DHAKA]: "আরে ভাই, কই যান? ঢাকার জ্যামে বইসা থাকলে লাইফটা শেষ হইয়া যাইবো গা।",
  [VoiceStyle.CHITTAGONG]: "ও বা, কনে যউ? চিটাগাংর পোয়া আমরা, সাগর পাড়ত হারি না।",
  [VoiceStyle.SYLHET]: "কিতা খবর ভাই? সিলেটের চা বাগান দেখবার আইছো নি? ভালা করি ঘুরিয়া যাও।",
  [VoiceStyle.BARISAL]: "মনু, কেমন আছো? আমাগো বরিশালে আইলে লঞ্চে চড়বা, ইলিশ খাবা।",
  [VoiceStyle.NOAKHALI]: "আইন্নে ভালা আছেন নি? নোয়াখালীর মানুষ আমরা, সবাইরে আপন করি লই।",
  [VoiceStyle.KHULNA]: "ও দাদা, খুলনার মানুষ আমরা। সুন্দরবনের বাঘ আমাগো প্রতিবেশী।",
  [VoiceStyle.COMILLA]: "কুমিল্লার রসমালাই খাইসেন নি? না খাইলে তো জীবনটাই বৃথা।",
  [VoiceStyle.BAGERHAT]: "বাগেরহাটের ষাটগম্বুজ মসজিদ দেখছেন? না দেখলে আইসা পডেন।"
};

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

// --- Global Rate Limiter (Throttler) ---
const REQUEST_MIN_INTERVAL_MS = 6000;
let lastRequestTimestamp = 0;
let requestQueue: Promise<any> = Promise.resolve();

const scheduleThrottledRequest = <T>(task: () => Promise<T>): Promise<T> => {
  const nextOperation = requestQueue.then(async () => {
    const now = Date.now();
    const timeSinceLast = now - lastRequestTimestamp;
    
    if (timeSinceLast < REQUEST_MIN_INTERVAL_MS) {
      const waitTime = REQUEST_MIN_INTERVAL_MS - timeSinceLast;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    try {
      const result = await task();
      return result;
    } finally {
      lastRequestTimestamp = Date.now();
    }
  });
  
  requestQueue = nextOperation.catch(() => {});
  return nextOperation;
};

// --- Helper: Robust Error Detection ---
function isPermanentQuotaError(error: any): boolean {
  if (!error) return false;
  let msg = "";
  try {
    msg = (error.message || error.error?.message || (typeof error === "object" ? "" : String(error))).toLowerCase();
  } catch (e) {
    msg = "";
  }
  return (
    msg.includes("daily") ||
    msg.includes("per day") ||
    msg.includes("generaterequestsperday")
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
    code === 'RESOURCE_EXHAUSTED' ||
    msg.includes('quota') || 
    msg.includes('429') || 
    msg.includes('resource_exhausted') || 
    msg.includes('too many requests') ||
    msg.includes('exceeded') || 
    msg.includes('failed to call the gemini api')
  );
}

/**
 * Smart Retry Logic combined with Throttling & Backoff
 */
const withRetry = async <T>(fn: () => Promise<T>, retries = 3, baseDelay = 1000): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await scheduleThrottledRequest(fn);
    } catch (error: any) {
      if (isPermanentQuotaError(error)) {
        throw error;
      }
      if (isQuotaError(error)) {
        if (i === retries - 1) {
            console.error("Max retries reached for Quota error.");
            throw new Error("সার্ভার অত্যন্ত ব্যস্ত রয়েছে। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।");
        }
        
        // Backoff: 1s, 2s, 3s...
        const delay = Math.min(baseDelay * (i + 1), 10000) + (Math.random() * 1000);
        console.warn(`Server Busy (Quota). Waiting ${Math.round(delay/1000)}s before retry ${i + 1}/${retries}...`);
        
        // Wait OUTSIDE the queue loop to let other requests potentially pass or just hold off
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error; 
      }
    }
  }
  throw new Error("Unexpected retry failure");
};

// --- Audio Utility Functions ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: BaseAudioContext, 
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function createImpulseResponse(ctx: BaseAudioContext, duration: number, decay: number, reverse: boolean) {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * duration;
  const impulse = ctx.createBuffer(2, length, sampleRate);
  const impulseL = impulse.getChannelData(0);
  const impulseR = impulse.getChannelData(1);

  for (let i = 0; i < length; i++) {
    let n = reverse ? length - i : i;
    const val = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    impulseL[i] = val;
    impulseR[i] = val;
  }
  return impulse;
}

export async function renderAudioWithEffects(
  sourceBuffer: AudioBuffer,
  reverbAmount: number,
  delayAmount: number,
  playbackRate: number = 1.0
): Promise<AudioBuffer> {
  const sampleRate = 24000;
  // Calculate duration based on speed
  // Slower speed (0.5) = Longer duration. Faster speed (2.0) = Shorter duration.
  const scaledDuration = sourceBuffer.duration / playbackRate;
  const duration = scaledDuration + 2.0; // Add tail for reverb/delay
  
  const length = Math.ceil(duration * sampleRate);
  const offlineCtx = new OfflineAudioContext(2, length, sampleRate);

  const source = offlineCtx.createBufferSource();
  source.buffer = sourceBuffer;
  source.playbackRate.value = playbackRate;

  const dryGain = offlineCtx.createGain();
  dryGain.gain.value = 1.0; 
  const wetGain = offlineCtx.createGain();
  wetGain.gain.value = reverbAmount;
  const delayGain = offlineCtx.createGain();
  delayGain.gain.value = delayAmount;

  const reverbNode = offlineCtx.createConvolver();
  reverbNode.buffer = createImpulseResponse(offlineCtx, 2, 2, false);

  const delayNode = offlineCtx.createDelay();
  delayNode.delayTime.value = 0.3;

  source.connect(dryGain);
  dryGain.connect(offlineCtx.destination);
  source.connect(reverbNode);
  reverbNode.connect(wetGain);
  wetGain.connect(offlineCtx.destination);
  source.connect(delayNode);
  delayNode.connect(delayGain);
  delayGain.connect(offlineCtx.destination);

  source.start(0);
  const renderedBuffer = await offlineCtx.startRendering();
  return renderedBuffer;
}

export function bufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArray = new ArrayBuffer(length);
  const view = new DataView(bufferArray);
  const channels = [];
  let i;
  let sample;
  let offset = 0;
  let pos = 0;

  setUint32(0x46464952); 
  setUint32(length - 8); 
  setUint32(0x45564157); 

  setUint32(0x20746d66); 
  setUint32(16); 
  setUint16(1); 
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); 
  setUint16(numOfChan * 2); 
  setUint16(16); 

  setUint32(0x61746164); 
  setUint32(length - pos - 4); 

  for (i = 0; i < buffer.numberOfChannels; i++)
    channels.push(buffer.getChannelData(i));

  while (pos < buffer.length) {
    for (i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][pos])); 
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; 
      view.setInt16(44 + offset, sample, true); 
      offset += 2;
    }
    pos++;
  }

  return new Blob([bufferArray], { type: "audio/wav" });

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}

// --- Main Service Functions ---

async function handleFetchResponse(response: Response, defaultError: string): Promise<any> {
  const text = await response.text();
  
  if (response.ok) {
    try {
      return JSON.parse(text);
    } catch {
      if (text.trim().startsWith("<")) {
        throw new Error("সার্ভার রিস্টার্ট হচ্ছে বা ব্যস্ত রয়েছে। দয়া করে ৫-১০ সেকেন্ড পর আবার চেষ্টা করুন।");
      }
      throw new Error("সার্ভার থেকে সঠিক ফরম্যাটে তথ্য পাওয়া যায়নি।");
    }
  }

  try {
    const errorData = JSON.parse(text);
    throw new Error(errorData.error || defaultError);
  } catch {
    if (text.trim().startsWith("<")) {
      throw new Error("সার্ভার রিস্টার্ট হচ্ছে বা ব্যস্ত রয়েছে। দয়া করে ৫-১০ সেকেন্ড পর আবার চেষ্টা করুন।");
    }
    throw new Error(text || defaultError);
  }
}

export const analyzeTextContext = async (text: string, isDialogueMode: boolean = false): Promise<AnalysisResult> => {
  try {
    const response = await fetch("/api/gemini/analyzeTextContext", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, isDialogueMode }),
    });

    return await handleFetchResponse(response, "টেক্সট विश्लेषण করতে সমস্যা হয়েছে।");
  } catch (error: any) {
    console.warn("Analysis Error (Non-Fatal):", error);
    if (error.message && (error.message.includes("ফ্রি লিমিট") || error.message.includes("সার্ভার খুব ব্যস্ত") || error.message.includes("রিস্টার্ট"))) {
        throw error;
    }
    throw new Error("টেক্সট বিশ্লেষণ করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
  }
};

export function splitTextIntoChunks(text: string, isDialogue: boolean): string[] {
  if (!text) return [];

  // Optimal limit: long enough to minimize QPM requests and fit multiple dialogue turns, 
  // short enough to avoid voice drift and whooshing/hissing artifacts
  const MAX_CHUNK_CHARS = 1000;

  if (isDialogue) {
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    const chunks: string[] = [];
    let currentChunkLines: string[] = [];
    let currentLength = 0;

    for (const line of lines) {
      if (currentLength + line.length > MAX_CHUNK_CHARS && currentChunkLines.length > 0) {
        chunks.push(currentChunkLines.join("\n"));
        currentChunkLines = [];
        currentLength = 0;
      }
      currentChunkLines.push(line);
      currentLength += line.length + 1; // plus newline
    }

    if (currentChunkLines.length > 0) {
      chunks.push(currentChunkLines.join("\n"));
    }
    return chunks;
  } else {
    return splitPlainParagraph(text, MAX_CHUNK_CHARS);
  }
}

function splitPlainParagraph(text: string, maxLen: number): string[] {
  // Delimiters: Dari (।), Question mark (?), Exclamation (!), Semicolon (;), Newline (\n)
  const sentences = text.split(/([।?!;\n]+)/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (let i = 0; i < sentences.length; i++) {
    const part = sentences[i];
    if (!part) continue;

    // If the part is just delimiters
    if (/^[।?!;\n\s]+$/.test(part)) {
      if (currentChunk) {
        currentChunk += part;
      }
      continue;
    }

    // If adding this sentence exceeds maxLen
    if (currentChunk && (currentChunk.length + part.length) > maxLen) {
      chunks.push(currentChunk.trim());
      currentChunk = "";
    }

    if (part.length > maxLen) {
      // Single sentence is extremely long, split by comma or spaces
      const subParts = part.split(/([,\s]+)/);
      let subChunk = "";
      for (const sp of subParts) {
        if (!sp) continue;
        if ((subChunk.length + sp.length) > maxLen) {
          if (subChunk) chunks.push(subChunk.trim());
          subChunk = sp;
        } else {
          subChunk += sp;
        }
      }
      if (subChunk) {
        currentChunk = subChunk;
      }
    } else {
      currentChunk += part;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter(c => c.length > 0);
}

export function concatenateAudioBuffers(ctx: BaseAudioContext, buffers: AudioBuffer[]): AudioBuffer {
  if (buffers.length === 0) {
    throw new Error("No audio buffers to concatenate");
  }
  if (buffers.length === 1) {
    return buffers[0];
  }

  const sampleRate = buffers[0].sampleRate;
  const numChannels = buffers[0].numberOfChannels;
  
  // Calculate total length
  let totalLength = 0;
  for (const buf of buffers) {
    totalLength += buf.length;
  }

  // Create new buffer
  const resultBuffer = ctx.createBuffer(numChannels, totalLength, sampleRate);

  // Copy data from each buffer
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = resultBuffer.getChannelData(channel);
    let offset = 0;
    for (const buf of buffers) {
      channelData.set(buf.getChannelData(channel), offset);
      offset += buf.length;
    }
  }

  return resultBuffer;
}

export const generateSpeech = async (
  text: string, 
  voiceId: string, 
  isDialogue: boolean,
  // Split style into region and emotion
  region: VoiceStyle | null,
  emotion: VoiceStyle | null,
  customInstruction?: string,
  mixMaleId?: string, 
  mixFemaleId?: string, 
  isPreview: boolean = false,
  onProgress?: (current: number, total: number) => void
): Promise<AudioBuffer> => {
  try {
    // If it is a preview or text is very short, do a single call
    if (isPreview || text.length <= 1000) {
      const response = await fetch("/api/gemini/generateSpeech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voiceId,
          isDialogue,
          region,
          emotion,
          customInstruction,
          mixMaleId,
          mixFemaleId,
          isPreview
        }),
      });

      const { base64Audio } = await handleFetchResponse(response, "ভয়েস জেনারেট করতে সমস্যা হয়েছে।");

      const offlineCtx = new OfflineAudioContext(1, 1, 24000);
      return await decodeAudioData(
        decode(base64Audio),
        offlineCtx, 
        24000,
        1,
      );
    }

    // Otherwise, chunk the text
    const chunks = splitTextIntoChunks(text, isDialogue);
    const buffers: AudioBuffer[] = [];

    if (onProgress) {
      onProgress(0, chunks.length);
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i];
      
      if (i > 0) {
        // Natural stagger to avoid hitting QPM quota limit on multiple sequential requests
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      const response = await fetch("/api/gemini/generateSpeech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: chunkText,
          voiceId,
          isDialogue,
          region,
          emotion,
          customInstruction,
          mixMaleId,
          mixFemaleId,
          isPreview: false
        }),
      });

      const { base64Audio } = await handleFetchResponse(response, `অংশ ${i + 1} জেনারেট করতে সমস্যা হয়েছে।`);

      const offlineCtx = new OfflineAudioContext(1, 1, 24000);
      const buf = await decodeAudioData(
        decode(base64Audio),
        offlineCtx, 
        24000,
        1,
      );
      buffers.push(buf);

      if (onProgress) {
        onProgress(i + 1, chunks.length);
      }
    }

    const finalCtx = new OfflineAudioContext(1, 1, 24000);
    return concatenateAudioBuffers(finalCtx, buffers);
  } catch (error: any) {
    console.error("Generation Error:", error);
    if (error.message && (error.message.includes("ফ্রি লিমিট") || error.message.includes("সার্ভার খুব ব্যস্ত") || error.message.includes("রিস্টার্ট"))) {
        throw error;
    }
    throw new Error(error.message || "ভয়েস জেনারেট করতে সমস্যা হয়েছে। ইন্টারনেট চেক করুন।");
  }
};
