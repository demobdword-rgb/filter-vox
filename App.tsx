import React, { useState, useEffect, useRef } from 'react';
import { analyzeTextContext, generateSpeech, bufferToWav, createImpulseResponse, SAMPLE_TEXTS, renderAudioWithEffects } from './services/geminiService';
import { VoiceStyle, AVAILABLE_VOICES, AnalysisResult, REGIONAL_STYLES, EMOTIONAL_STYLES, STYLE_SHORTCODES } from './types';
import StyleBadge from './components/StyleBadge';
import Waveform from './components/Waveform';
import { Sparkles, Mic, Volume2, Loader2, Play, Pause, Settings2, Download, Drama, Users, Zap, Sliders, User, Music, Check, Volume1, Square, MapPin, ChevronRight, Gauge } from 'lucide-react';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  
  // Settings
  const [isDialogueMode, setIsDialogueMode] = useState(false);
  
  // Split Styles
  const [selectedRegion, setSelectedRegion] = useState<VoiceStyle | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<VoiceStyle | null>(null);

  // Web Speech Fallback States and Logic
  const [fallbackActive, setFallbackActive] = useState(false);
  const [fallbackBannerMsg, setFallbackBannerMsg] = useState<string | null>(null);
  const [isWebSpeaking, setIsWebSpeaking] = useState(false);

  const playWebSpeechFallback = (text: string, gender: 'Male' | 'Female' = 'Male', onEnd?: () => void): boolean => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsWebSpeaking(true);
      
      // Clean tags from text
      const cleanText = text.replace(/\[\w+\]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      // Fetch latest voices
      const voices = window.speechSynthesis.getVoices();
      let bengaliVoices = voices.filter(v => 
        v.lang.startsWith('bn-BD') || 
        v.lang.startsWith('bn-IN') || 
        v.lang.startsWith('bn_BD') || 
        v.lang.startsWith('bn_IN')
      );
      
      let chosenVoice = null;
      if (bengaliVoices.length > 0) {
        if (gender === 'Male') {
          chosenVoice = bengaliVoices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('google'));
        } else {
          chosenVoice = bengaliVoices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('microsoft'));
        }
        if (!chosenVoice) {
          chosenVoice = bengaliVoices[0];
        }
      }
      
      if (chosenVoice) {
        utterance.voice = chosenVoice;
      } else {
        utterance.lang = 'bn-BD';
      }
      
      utterance.rate = 1.0;
      utterance.pitch = gender === 'Female' ? 1.25 : 0.95;
      
      utterance.onend = () => {
        setIsWebSpeaking(false);
        if (onEnd) onEnd();
      };
      
      utterance.onerror = () => {
        setIsWebSpeaking(false);
        if (onEnd) onEnd();
      };
      
      window.speechSynthesis.speak(utterance);
      return true;
    }
    return false;
  };

  const [expressionInstruction, setExpressionInstruction] = useState<string>('');
  
  // Single Mode Voice
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('m_mature_leader');
  
  // Dialogue Mode Voices
  const [dialogueMaleId, setDialogueMaleId] = useState<string>('m_mature_leader');
  const [dialogueFemaleId, setDialogueFemaleId] = useState<string>('f_young_sweet');

  const [reasoning, setReasoning] = useState<string>('');
  
  // Loading States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<{ current: number; total: number } | null>(null);
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);
  
  // Audio State & Logic
  const [isPlayingMain, setIsPlayingMain] = useState(false);
  const [mainAudioBuffer, setMainAudioBuffer] = useState<AudioBuffer | null>(null);
  const [playbackTime, setPlaybackTime] = useState(0); // Used for UI updates
  
  // New State for Output Summary
  const [generatedConfig, setGeneratedConfig] = useState<{
    voiceName: string;
    regionName: string;
    emotionName: string;
  } | null>(null);

  // Refs for Audio Engine
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  // Track where we started playing in AudioContext time
  const startTimeRef = useRef<number>(0); 
  // Track where we paused (in seconds relative to buffer start)
  const pausedAtRef = useRef<number>(0); 
  // Animation frame loop
  const rafRef = useRef<number | null>(null);

  // Effects Graph Refs
  const dryGainRef = useRef<GainNode | null>(null);
  const wetGainRef = useRef<GainNode | null>(null);
  const reverbNodeRef = useRef<ConvolverNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const delayGainRef = useRef<GainNode | null>(null);
  
  // Effects State
  const [reverbAmount, setReverbAmount] = useState(0); 
  const [delayAmount, setDelayAmount] = useState(0); 
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const playbackRateRef = useRef(1.0); // Ref for audio loop access

  const [isProcessingDownload, setIsProcessingDownload] = useState(false);

  // Sample Player State
  const [playingSampleStyle, setPlayingSampleStyle] = useState<VoiceStyle | null>(null);
  const [loadingSampleStyle, setLoadingSampleStyle] = useState<VoiceStyle | null>(null);
  const [playingPreviewId, setPlayingPreviewId] = useState<string | null>(null);

  const sampleCache = useRef<Map<VoiceStyle, AudioBuffer>>(new Map());
  const voicePreviewCache = useRef<Map<string, AudioBuffer>>(new Map());

  // Initialize Audio Context & Effects
  useEffect(() => {
    const initAudio = async () => {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new Ctx({sampleRate: 24000});
      audioContextRef.current = ctx;

      // Create Nodes
      reverbNodeRef.current = ctx.createConvolver();
      reverbNodeRef.current.buffer = createImpulseResponse(ctx, 2, 2, false); 
      
      delayNodeRef.current = ctx.createDelay();
      delayNodeRef.current.delayTime.value = 0.3; 

      dryGainRef.current = ctx.createGain();
      wetGainRef.current = ctx.createGain();
      delayGainRef.current = ctx.createGain();

      // Default Values
      wetGainRef.current.gain.value = 0;
      delayGainRef.current.gain.value = 0;
    };
    initAudio();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      audioContextRef.current?.close();
    };
  }, []);

  // Update Effects in Realtime
  useEffect(() => {
    if (wetGainRef.current) wetGainRef.current.gain.value = reverbAmount;
    if (delayGainRef.current) delayGainRef.current.gain.value = delayAmount;
    
    playbackRateRef.current = playbackRate;
    if (sourceNodeRef.current) {
        sourceNodeRef.current.playbackRate.value = playbackRate;
    }
  }, [reverbAmount, delayAmount, playbackRate]);

  // --- Core Audio Engine Logic ---

  const stopPlayback = (resetTime: boolean = false) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsWebSpeaking(false);

    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) { /* ignore if already stopped */ }
      sourceNodeRef.current = null;
    }
    if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
    }
    setIsPlayingMain(false);
    
    // For previews/samples, we just reset completely
    setPlayingSampleStyle(null);
    setPlayingPreviewId(null);

    if (resetTime) {
        pausedAtRef.current = 0;
        setPlaybackTime(0);
    }
  };

  /**
   * Plays the audio buffer from a specific offset.
   * isMain: true if it's the main output (supports seeking/effects), false for previews.
   */
  const playAudio = (buffer: AudioBuffer, offset: number, isMain: boolean, onEndedCallback?: () => void) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    // 1. Stop previous
    stopPlayback(false); 

    if (ctx.state === 'suspended') ctx.resume();

    // 2. Create Source
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    sourceNodeRef.current = source;

    // 3. Connect Graph
    if (!isMain) {
        // Simple path for previews
        source.connect(ctx.destination);
    } else {
        // Effects path for Main
        const masterGain = ctx.destination;
        const dry = dryGainRef.current!;
        const wet = wetGainRef.current!;
        const reverb = reverbNodeRef.current!;
        const delay = delayNodeRef.current!;
        const delayGain = delayGainRef.current!;
        
        // Apply playback rate for main audio
        source.playbackRate.value = playbackRateRef.current;

        source.connect(dry);
        dry.connect(masterGain);

        source.connect(reverb);
        reverb.connect(wet);
        wet.connect(masterGain);

        source.connect(delay);
        delay.connect(delayGain);
        delayGain.connect(masterGain);
    }

    // 4. Start
    source.start(0, offset);
    startTimeRef.current = ctx.currentTime - offset;
    pausedAtRef.current = offset; // In case we pause immediately
    
    if (isMain) {
        setIsPlayingMain(true);
        // Start animation loop to update UI with speed support
        let lastFrameTime = ctx.currentTime;
        let accumulatedTime = offset;

        const loop = () => {
            const now = ctx.currentTime;
            const dt = now - lastFrameTime;
            lastFrameTime = now;
            
            // Calculate progress based on current rate
            accumulatedTime += dt * playbackRateRef.current;

            if (accumulatedTime >= buffer.duration) {
                // End reached
                stopPlayback(true);
                setIsPlayingMain(false);
            } else {
                setPlaybackTime(accumulatedTime);
                pausedAtRef.current = accumulatedTime; // Keep sync
                rafRef.current = requestAnimationFrame(loop);
            }
        };
        loop();
    } else {
        // For samples, use onended cleanup
        source.onended = () => {
             // Verify this source is still the active one before clearing state
             // (Prevents clearing if user quickly clicked another sample)
             if (sourceNodeRef.current === source) {
                 stopPlayback(true);
                 if (onEndedCallback) onEndedCallback();
             }
        };
    }
  };

  const handleMainPlayPause = () => {
    if (!mainAudioBuffer) return;

    if (isPlayingMain) {
      // Pause: Stop source
      // pausedAtRef is already updated in the loop, but to be safe/precise:
      stopPlayback(false);
      setIsPlayingMain(false);
    } else {
      // Play: Resume from pausedAt
      // If finished (pausedAt >= duration), restart from 0
      if (pausedAtRef.current >= mainAudioBuffer.duration) {
          pausedAtRef.current = 0;
      }
      playAudio(mainAudioBuffer, pausedAtRef.current, true);
    }
  };

  const handleSeek = (time: number) => {
      if (!mainAudioBuffer) return;
      
      // Update state immediately
      setPlaybackTime(time);
      pausedAtRef.current = time;

      // If playing, restart from new time immediately
      if (isPlayingMain) {
          playAudio(mainAudioBuffer, time, true);
      }
  };

  // --- Interaction Handlers ---

  const handlePreviewVoice = async (voiceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewLoadingId === voiceId) return;

    if (playingPreviewId === voiceId) {
        stopPlayback(true);
        return;
    }

    stopPlayback(true); // Stop main audio or other samples

    if (voicePreviewCache.current.has(voiceId)) {
        setPlayingPreviewId(voiceId);
        playAudio(voicePreviewCache.current.get(voiceId)!, 0, false, () => setPlayingPreviewId(null));
        return;
    }

    setPreviewLoadingId(voiceId);
    try {
        const buffer = await generateSpeech(
          "নমস্কার, আমি কথা বলছি।", 
          voiceId, 
          false, 
          null,
          null, 
          undefined, 
          undefined, 
          undefined, 
          true 
        );
        voicePreviewCache.current.set(voiceId, buffer);
        setPlayingPreviewId(voiceId);
        playAudio(buffer, 0, false, () => setPlayingPreviewId(null));
    } catch (err: any) {
        const isLimit = err.message?.includes("লিমিট") || err.message?.includes("ব্যস্ত") || err.message?.includes("limit") || err.message?.includes("quota") || err.message?.includes("busy") || err.message?.includes("Ristart") || err.message?.includes("রিস্টার্ট");
        if (isLimit) {
             setFallbackActive(true);
             setFallbackBannerMsg("জেমিনির দৈনিক ফ্রি লিমিট শেষ হওয়ায় ব্রাউজার ভয়েস দিয়ে ডেমো শোনানো হচ্ছে।");
             setPlayingPreviewId(voiceId);
             
             const persona = AVAILABLE_VOICES.find(v => v.id === voiceId);
             const gender = persona?.gender || 'Female';
             
             playWebSpeechFallback("নমস্কার, আমি কথা বলছি।", gender, () => {
               setPlayingPreviewId(null);
             });
        } else {
             alert(err.message || "ভয়েস ডেমো প্লে করতে সমস্যা হয়েছে।");
        }
    } finally {
        setPreviewLoadingId(null);
    }
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    stopPlayback(true);
    setIsAnalyzing(true);
    setReasoning('');
    setExpressionInstruction('');

    try {
      const result: AnalysisResult = await analyzeTextContext(inputText, isDialogueMode);
      
      // Heuristic: Check if result is regional or emotional
      if (REGIONAL_STYLES.includes(result.detectedStyle)) {
          setSelectedRegion(result.detectedStyle);
      } else {
          setSelectedEmotion(result.detectedStyle);
      }

      setReasoning(result.reasoning);
      setExpressionInstruction(result.expressionInstruction);
      
      if (isDialogueMode && result.formattedScript) {
        setInputText(result.formattedScript);
      }

    } catch (error: any) {
      alert(error.message || "Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = async (skipAnalysis: boolean = false) => {
    if (!inputText.trim()) return;
    stopPlayback(true);
    setIsGenerating(true);
    
    try {
      const buffer = await generateSpeech(
        inputText, 
        selectedVoiceId, 
        isDialogueMode,
        selectedRegion,
        selectedEmotion,
        expressionInstruction,
        dialogueMaleId,   
        dialogueFemaleId,
        false,
        (current, total) => {
          setGenerationProgress({ current, total });
        }
      );
      
      // Capture Config for Display
      const currentVoice = isDialogueMode 
        ? `Dialogue (${AVAILABLE_VOICES.find(v => v.id === dialogueMaleId)?.label.split('(')[0].trim()} + ${AVAILABLE_VOICES.find(v => v.id === dialogueFemaleId)?.label.split('(')[0].trim()})`
        : AVAILABLE_VOICES.find(v => v.id === selectedVoiceId)?.label.split('(')[0].trim() || 'Unknown';

      setGeneratedConfig({
          voiceName: currentVoice,
          regionName: selectedRegion ? selectedRegion.split('(')[0].trim() : "স্ট্যান্ডার্ড (Standard)",
          emotionName: selectedEmotion ? selectedEmotion.split('(')[0].trim() : "স্বাভাবিক (Natural)"
      });

      setMainAudioBuffer(buffer);
      setPlaybackTime(0);
      pausedAtRef.current = 0;
      
      // Auto Play
      setTimeout(() => {
          playAudio(buffer, 0, true);
      }, 100);
      
    } catch (error: any) {
      console.error("Voice generation error, trying fallback:", error);
      const isLimit = error.message?.includes("লিমিট") || error.message?.includes("ব্যস্ত") || error.message?.includes("limit") || error.message?.includes("quota") || error.message?.includes("busy") || error.message?.includes("Ristart") || error.message?.includes("রিস্টার্ট");
      
      if (isLimit) {
        setFallbackActive(true);
        setFallbackBannerMsg("জেমিনির দৈনিক ফ্রি লিমিট শেষ হওয়ায় আমরা ব্রাউজারের অটোমেটিক ভয়েস ইঞ্জিন দিয়ে ফ্রিতে ভয়েসটি প্লে করেছি!");
        
        if (isDialogueMode) {
          // Sequential Dialogue playback
          const lines = inputText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
          let index = 0;
          
          const playNextDialogueLine = () => {
            if (index >= lines.length) return;
            const line = lines[index];
            index++;
            
            let currentGender: 'Male' | 'Female' = 'Male';
            let lineText = line;
            if (line.toLowerCase().startsWith('male:')) {
              currentGender = 'Male';
              lineText = line.substring(5).trim();
            } else if (line.toLowerCase().startsWith('female:')) {
              currentGender = 'Female';
              lineText = line.substring(7).trim();
            } else if (line.toLowerCase().startsWith('ছেলে:')) {
              currentGender = 'Male';
              lineText = line.substring(4).trim();
            } else if (line.toLowerCase().startsWith('মেয়ে:')) {
              currentGender = 'Female';
              lineText = line.substring(4).trim();
            }
            
            playWebSpeechFallback(lineText, currentGender, () => {
              playNextDialogueLine();
            });
          };
          
          playNextDialogueLine();
        } else {
          // Standard single speaker playback
          const persona = AVAILABLE_VOICES.find(v => v.id === selectedVoiceId);
          const gender = persona?.gender || 'Male';
          playWebSpeechFallback(inputText, gender);
        }
      } else {
        alert(error.message || "ভয়েস তৈরি করতে ব্যর্থ হয়েছে।");
      }
    } finally {
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  };

  const handleDownload = async () => {
    if (!mainAudioBuffer) return;
    setIsProcessingDownload(true);

    let finalBuffer = mainAudioBuffer;
    
    if (reverbAmount > 0 || delayAmount > 0 || playbackRate !== 1.0) {
        try {
            finalBuffer = await renderAudioWithEffects(mainAudioBuffer, reverbAmount, delayAmount, playbackRate);
        } catch (e) {
            console.error("Effect rendering failed, downloading raw audio", e);
        }
    }

    const blob = bufferToWav(finalBuffer);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voxdev-ai-${Date.now()}.wav`;
    a.click();
    window.URL.revokeObjectURL(url);
    setIsProcessingDownload(false);
  };

  const handleRegionSelect = (style: VoiceStyle) => {
      // Toggle logic
      if (selectedRegion === style) setSelectedRegion(null);
      else setSelectedRegion(style);
  };

  const handleEmotionSelect = (style: VoiceStyle) => {
      // Toggle logic
      if (selectedEmotion === style) setSelectedEmotion(null);
      else setSelectedEmotion(style);
  };

  const handleStylePreview = async (style: VoiceStyle, isRegion: boolean, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selection when clicking preview
    
    if (playingSampleStyle === style) {
      stopPlayback(true);
      return;
    }
    stopPlayback(true);
    
    if (sampleCache.current.has(style)) {
      setPlayingSampleStyle(style);
      playAudio(sampleCache.current.get(style)!, 0, false, () => setPlayingSampleStyle(null));
      return;
    }

    setLoadingSampleStyle(style);
    try {
      const text = SAMPLE_TEXTS[style];
      // Generate preview using the specific style (as region or emotion)
      // If previewing a region, pass as region. If emotion, pass as emotion.
      const regionArg = isRegion ? style : null;
      const emotionArg = isRegion ? null : style;

      const buffer = await generateSpeech(text, 'm_mature_leader', false, regionArg, emotionArg, undefined, undefined, undefined, true);
      sampleCache.current.set(style, buffer);
      setPlayingSampleStyle(style);
      playAudio(buffer, 0, false, () => setPlayingSampleStyle(null));
    } catch (err: any) {
        const isLimit = err.message?.includes("লিমিট") || err.message?.includes("ব্যস্ত") || err.message?.includes("limit") || err.message?.includes("quota") || err.message?.includes("busy") || err.message?.includes("Ristart") || err.message?.includes("রিস্টার্ট");
        if (isLimit) {
             setFallbackActive(true);
             setFallbackBannerMsg("জেমিনির দৈনিক ফ্রি লিমিট শেষ হওয়ায় ব্রাউজার ভয়েস দিয়ে ডেমো শোনানো হচ্ছে।");
             setPlayingSampleStyle(style);
             const text = SAMPLE_TEXTS[style];
             playWebSpeechFallback(text, 'Male', () => {
               setPlayingSampleStyle(null);
             });
        } else {
             alert(err.message || "ভয়েস ডেমো প্লে করতে সমস্যা হয়েছে।");
        }
    } finally {
      setLoadingSampleStyle(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm backdrop-blur-md bg-opacity-80">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-200">
              <Mic size={20} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700">
              VoXdev ai
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-500">
            <span className="flex items-center gap-1"><Zap size={14} className="text-amber-500"/> Fast Generation</span>
            <span className="flex items-center gap-1"><Users size={14} className="text-blue-500"/> Dialogue Mode</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        
        {/* Fallback Banner */}
        {fallbackActive && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4 text-sm text-amber-950 shadow-md animate-in fade-in duration-300">
            <div className="bg-amber-100 p-2.5 rounded-xl text-amber-600 shrink-0">
              <Zap className="fill-amber-500 text-amber-500 animate-pulse" size={24} />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="font-bold text-base text-amber-900">সীমাহীন ফ্রি ভয়েস প্লে হচ্ছে (ব্রাউজার মোড)</h4>
              <p className="text-amber-800 leading-relaxed text-sm">
                জেমিনি এপিআই-এর ভয়েস জেনারেটরের ফ্রি দৈনিক লিমিট (১০টি) শেষ হয়েছে। আপনার সুবিধা ও কাজের নিরবচ্ছিন্নতার স্বার্থে আমরা কোনো চার্জ ছাড়াই সরাসরি আপনার ব্রাউজারের ফ্রি টেক্সট-টু-স্পিচ ইঞ্জিন দিয়ে ভয়েসটি প্লে করেছি।
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-amber-600">
                <span>✓ ১০০% সম্পূর্ণ ফ্রি</span>
                <span>✓ লাইফটাইম আনলিমিটেড</span>
                <span>✓ কোনো এপিআই কী লাগবে না</span>
              </div>
            </div>
            <button 
              onClick={() => { setFallbackActive(false); }}
              className="text-amber-500 hover:text-amber-700 font-bold text-xs px-2.5 py-1.5 rounded-lg hover:bg-amber-100/80 transition-colors border border-amber-200/50"
            >
              বন্ধ করুন
            </button>
          </div>
        )}
        
        {/* Mode Toggles */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <h2 className="text-2xl font-bold text-slate-800">টেক্সট টু স্পিচ স্টুডিও</h2>
            
            <div className="bg-slate-200 p-1 rounded-xl flex gap-1 shadow-inner">
                <button
                    onClick={() => setIsDialogueMode(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${!isDialogueMode ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                    <User size={16} /> সিঙ্গেল মোড
                </button>
                <button
                    onClick={() => setIsDialogueMode(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${isDialogueMode ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                    <Users size={16} /> মিক্স/ডায়লগ মোড
                </button>
            </div>
        </div>

        {/* Input Section */}
        <section className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="p-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 h-1"></div>
          <div className="p-6 space-y-4">
            <label className="flex items-center justify-between text-sm font-semibold text-slate-700">
                <span>স্ক্রিপ্ট বা টেক্সট</span>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">টিপস: স্টাইল পরিবর্তন করতে লাইনের শুরুতে <span className="font-mono text-indigo-600">[sylhet]</span> বা <span className="font-mono text-indigo-600">[sad]</span> ট্যাগ ব্যবহার করুন।</span>
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isDialogueMode 
                ? "উদাহরণ:\nMale: [sad] আমার আজ মন ভালো নেই।\nFemale: [happy] চলো কোথাও ঘুরে আসি!" 
                : "আপনার লেখা এখানে দিন... \nউদাহরণ: [sylhet] আমি সিলেটি ভাষায় কথা বলছি। [dhaka] আর আমি ঢাকাইয়া।"}
              className="w-full h-40 p-4 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none resize-none text-lg leading-relaxed transition-all font-medium text-slate-900 bg-white placeholder:text-slate-400"
            />
            
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !inputText.trim()}
                className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors disabled:opacity-50 border border-slate-200"
              >
                {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} className="text-purple-600" />}
                {isAnalyzing ? "বিশ্লেষণ হচ্ছে..." : "AI দিয়ে সাজান (Optional)"}
              </button>
              
              <button
                onClick={() => handleGenerate(true)} // Fast mode
                disabled={isGenerating || !inputText.trim()}
                className="flex-[2] min-w-[200px] flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} className="fill-yellow-400 text-yellow-400" />}
                {isGenerating ? (
                  generationProgress ? (
                    `তৈরি হচ্ছে: ${generationProgress.current}/${generationProgress.total} অংশ...`
                  ) : (
                    "তৈরি হচ্ছে..."
                  )
                ) : (
                  "দ্রুত ভয়েস তৈরি করুন"
                )}
              </button>
            </div>
          </div>
        </section>

        {/* AI Panel */}
        {(expressionInstruction || reasoning) && (
             <div className="bg-slate-800 text-slate-100 p-4 rounded-xl text-sm border-l-4 border-purple-500 shadow-md animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start gap-3">
                    <Drama className="mt-1 text-purple-400" size={20} />
                    <div>
                        <p className="font-semibold text-purple-200 mb-1">AI নির্দেশনা (Professional Mode):</p>
                        <p className="italic opacity-90">"{expressionInstruction}"</p>
                    </div>
                </div>
            </div>
        )}

        {/* Voice & Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Voice Selection */}
            <section className="lg:col-span-2 space-y-4">
                 <h4 className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                    {isDialogueMode ? <Users size={20} className="text-indigo-600" /> : <User size={20} className="text-indigo-600" />}
                    {isDialogueMode ? "ডায়লগ ক্যারেক্টার সেটআপ" : "ভয়েস মডেল নির্বাচন"}
                 </h4>
                 
                 {isDialogueMode ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Male Selector Column */}
                        <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
                           <h5 className="font-bold text-indigo-900 mb-3 flex items-center gap-2"><User size={16} /> ছেলের ভয়েস (Male)</h5>
                           <div className="space-y-2 h-64 overflow-y-auto custom-scrollbar pr-2">
                             {AVAILABLE_VOICES.filter(v => v.gender === 'Male').map(voice => (
                               <div key={voice.id} 
                                    onClick={() => setDialogueMaleId(voice.id)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center ${dialogueMaleId === voice.id ? 'bg-white border-indigo-500 shadow-md' : 'bg-white/50 border-slate-200 hover:bg-white'}`}>
                                  <div>
                                    <div className="font-bold text-sm text-slate-800">{voice.label}</div>
                                    <div className="text-[10px] text-slate-500">{voice.ageRange} • {voice.toneDescription}</div>
                                  </div>
                                  <button onClick={(e) => handlePreviewVoice(voice.id, e)} className="p-1.5 rounded-full hover:bg-indigo-100 text-indigo-600">
                                      {previewLoadingId === voice.id ? <Loader2 size={14} className="animate-spin"/> : 
                                       playingPreviewId === voice.id ? <Square size={16} fill="currentColor" /> : <Volume1 size={16}/>}
                                  </button>
                               </div>
                             ))}
                           </div>
                        </div>

                        {/* Female Selector Column */}
                        <div className="bg-pink-50/50 rounded-xl p-4 border border-pink-100">
                           <h5 className="font-bold text-pink-900 mb-3 flex items-center gap-2"><User size={16} /> মেয়ের ভয়েস (Female)</h5>
                           <div className="space-y-2 h-64 overflow-y-auto custom-scrollbar pr-2">
                             {AVAILABLE_VOICES.filter(v => v.gender === 'Female').map(voice => (
                               <div key={voice.id} 
                                    onClick={() => setDialogueFemaleId(voice.id)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center ${dialogueFemaleId === voice.id ? 'bg-white border-pink-500 shadow-md' : 'bg-white/50 border-slate-200 hover:bg-white'}`}>
                                  <div>
                                    <div className="font-bold text-sm text-slate-800">{voice.label}</div>
                                    <div className="text-[10px] text-slate-500">{voice.ageRange} • {voice.toneDescription}</div>
                                  </div>
                                  <button onClick={(e) => handlePreviewVoice(voice.id, e)} className="p-1.5 rounded-full hover:bg-pink-100 text-pink-600">
                                      {previewLoadingId === voice.id ? <Loader2 size={14} className="animate-spin"/> : 
                                       playingPreviewId === voice.id ? <Square size={16} fill="currentColor" /> : <Volume1 size={16}/>}
                                  </button>
                               </div>
                             ))}
                           </div>
                        </div>
                     </div>
                 ) : (
                    // Single Mode Grid
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {AVAILABLE_VOICES.map((voice) => (
                            <div
                                key={voice.id}
                                onClick={() => setSelectedVoiceId(voice.id)}
                                className={`relative text-left p-3 rounded-xl border-2 transition-all group cursor-pointer ${
                                    selectedVoiceId === voice.id 
                                    ? 'border-indigo-600 bg-white shadow-md ring-1 ring-indigo-600' 
                                    : 'border-slate-100 bg-slate-50 hover:border-slate-300 hover:bg-white'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                     <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${voice.gender === 'Male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                        {voice.gender === 'Male' ? 'পুরুষ' : 'নারী'}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                                            {voice.ageRange}
                                        </span>
                                        {/* Preview Button */}
                                        <button 
                                            onClick={(e) => handlePreviewVoice(voice.id, e)}
                                            className="p-1.5 rounded-full bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-600 transition-colors z-10"
                                            title="Click to preview or stop"
                                        >
                                            {previewLoadingId === voice.id ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : playingPreviewId === voice.id ? (
                                                <Square size={16} fill="currentColor" />
                                            ) : (
                                                <Volume1 size={16} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                
                                <p className={`font-bold text-base ${selectedVoiceId === voice.id ? 'text-indigo-700' : 'text-slate-800 group-hover:text-indigo-600'}`}>
                                    {voice.label}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">{voice.toneDescription}</p>
                                
                                {selectedVoiceId === voice.id && (
                                    <div className="absolute top-1/2 right-3 -translate-y-1/2 opacity-20 text-indigo-600">
                                        <Check size={40} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                 )}
            </section>

            {/* Right: Styles & Regions */}
            <section className="space-y-6">
                
                {/* Regional Dialects */}
                <div className="space-y-3">
                    <h4 className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                        <MapPin size={20} className="text-teal-600" />
                        আঞ্চলিক ভয়েস (Regional)
                    </h4>
                    <div className="bg-teal-50/50 rounded-xl border border-teal-100 p-4 h-[240px] overflow-y-auto custom-scrollbar">
                        <div className="flex flex-wrap gap-2">
                            {REGIONAL_STYLES.map((style) => (
                            <StyleBadge
                                key={style}
                                label={style.split('(')[0]} 
                                styleKey={style}
                                isActive={selectedRegion === style} // Independent state
                                isPlaying={playingSampleStyle === style}
                                isLoading={loadingSampleStyle === style}
                                onSelect={() => handleRegionSelect(style)} // Independent handler
                                onPreview={(e) => handleStylePreview(style, true, e)} // Pass isRegion=true
                            />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Emotional Styles */}
                <div className="space-y-3">
                    <h4 className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                        <Settings2 size={20} className="text-indigo-600" />
                        স্টাইল ও ইমোশন (Emotion)
                    </h4>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 h-[240px] overflow-y-auto custom-scrollbar">
                        <div className="flex flex-wrap gap-2">
                            {EMOTIONAL_STYLES.map((style) => (
                            <StyleBadge
                                key={style}
                                label={style.split('(')[0]} 
                                styleKey={style}
                                isActive={selectedEmotion === style} // Independent state
                                isPlaying={playingSampleStyle === style}
                                isLoading={loadingSampleStyle === style}
                                onSelect={() => handleEmotionSelect(style)} // Independent handler
                                onPreview={(e) => handleStylePreview(style, false, e)} // Pass isRegion=false
                            />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>

        {/* Output Player with Effects */}
        {mainAudioBuffer && (
          <section className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden animate-in fade-in slide-in-from-bottom-6">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Volume2 className="text-indigo-600" /> 
                        ফাইনাল আউটপুট
                    </h3>
                    {generatedConfig && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-500 flex-wrap">
                            <span className="text-slate-700 bg-slate-200/50 px-1.5 py-0.5 rounded border border-slate-200">
                                {generatedConfig.voiceName}
                            </span>
                            <ChevronRight size={12} className="text-slate-400" />
                            <span className="text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100">
                                {generatedConfig.regionName}
                            </span>
                            <ChevronRight size={12} className="text-slate-400" />
                            <span className="text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                                {generatedConfig.emotionName}
                            </span>
                        </div>
                    )}
                </div>
                <button
                    onClick={handleDownload}
                    disabled={isProcessingDownload}
                    className="flex items-center gap-2 px-4 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                >
                    {isProcessingDownload ? <Loader2 size={16} className="animate-spin"/> : <Download size={16} />} 
                    {isProcessingDownload ? "রেন্ডার হচ্ছে..." : "সেভ করুন (WAV)"}
                </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 flex flex-col items-center justify-center space-y-6">
                    {/* Interactive Waveform Container */}
                    <div className="w-full bg-slate-900 rounded-xl p-6 h-32 relative shadow-inner overflow-hidden ring-1 ring-slate-700">
                        <Waveform 
                            audioBuffer={mainAudioBuffer} 
                            isPlaying={isPlayingMain}
                            currentTime={playbackTime}
                            onSeek={handleSeek}
                        />
                    </div>
                    
                    {/* Main Play Button */}
                    <button
                        onClick={handleMainPlayPause}
                        className={`h-16 w-16 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 transition-all ${isPlayingMain ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        {isPlayingMain ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                    </button>
                    <p className="text-xs text-slate-400 font-medium">
                        {isPlayingMain ? "থামাতে ক্লিক করুন" : "চালানোর জন্য ক্লিক করুন / ওয়েভফর্মে ড্র্যাগ করুন"}
                    </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-6">
                    <h4 className="flex items-center gap-2 font-bold text-slate-700 text-sm border-b pb-2">
                        <Sliders size={16} /> লাইভ অডিও ইফেক্ট
                    </h4>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold text-slate-600">
                            <span>Reverb (প্রতিধ্বনি)</span>
                            <span>{Math.round(reverbAmount * 100)}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" max="1" step="0.01" 
                            value={reverbAmount}
                            onChange={(e) => setReverbAmount(parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold text-slate-600">
                            <span>Delay (ইকো)</span>
                            <span>{Math.round(delayAmount * 100)}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" max="0.8" step="0.01" 
                            value={delayAmount}
                            onChange={(e) => setDelayAmount(parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                    </div>

                    {/* Speed / Playback Rate Slider */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="flex justify-between text-xs font-semibold text-slate-600">
                            <span className="flex items-center gap-1"><Gauge size={12}/> Speed (গতি)</span>
                            <span>{playbackRate.toFixed(1)}x</span>
                        </div>
                        <input 
                            type="range" 
                            min="0.5" max="2.0" step="0.1" 
                            value={playbackRate}
                            onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400">
                           <span>Slow (0.5x)</span>
                           <span>Fast (2.0x)</span>
                        </div>
                    </div>
                    
                    <div className="text-[10px] text-slate-400 leading-tight">
                        * ডাউনলোড করলে এই ইফেক্টগুলো অডিও ফাইলে যুক্ত থাকবে।
                    </div>
                </div>
            </div>
          </section>
        )}

      </main>
    </div>
  );
};

export default App;