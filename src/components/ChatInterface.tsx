import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Brain, 
  Database, 
  Send, 
  Camera, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  Layers,
  Terminal,
  Activity,
  Zap,
  Cpu,
  Eye,
  Lock
} from 'lucide-react';
import { SpecialSenseAI } from '../services/specialSenseAI';
import { AIResponse, Layer, Kosha, State } from '../types';

export const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aiService = useRef(new SpecialSenseAI(process.env.GEMINI_API_KEY || ''));

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [responses, loading]);

  const handleSend = async () => {
    if (!input.trim() && !image) return;

    setLoading(true);
    setInput('');
    const currentInput = input;
    const currentImage = image;
    setImage(null);

    try {
      const response = await aiService.current.process(currentInput, currentImage || undefined);
      setResponses(prev => [...prev, response]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getLayerIcon = (layer: Layer) => {
    switch (layer) {
      case Layer.AHAMKARA: return <Shield className="w-4 h-4" />;
      case Layer.MANAS: return <Brain className="w-4 h-4" />;
      case Layer.CHITTA: return <Database className="w-4 h-4" />;
      case Layer.BUDDHI: return <Activity className="w-4 h-4" />;
    }
  };

  const lastResponse = responses[responses.length - 1];

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0B] text-[#E1E1E3] font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-white/5 p-4 flex items-center justify-between bg-[#0D0D0F]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Layers className="text-emerald-500 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Special Sense AI</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono">
              Lead Researcher: Roshan Kumar Sah // Solving the "Common Sense Gap"
            </p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="text-[10px] text-white/40 font-mono">CLINICAL_CONTEXT</span>
            <span className="text-[10px] text-emerald-500 font-mono">Sanjay Gandhi Trauma Centre</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-xs font-mono text-white/60">
              {loading ? 'PROCESSING_TAPAS' : 'STATE: JAGRAT'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col relative">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth"
          >
            {responses.length === 0 && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6 opacity-60">
                <div className="p-6 rounded-full bg-white/5 border border-white/10">
                  <Terminal className="w-12 h-12 text-emerald-500/50" />
                </div>
                <div>
                  <h2 className="text-xl font-medium mb-2">Initialize Causal Intelligence</h2>
                  <p className="text-sm text-white/40 leading-relaxed">
                    Special Sense AI implements the full 4-layer Antahkarana Stack. 
                    Neural outputs are filtered through deterministic clinical and physical rules.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full">
                  <button 
                    onClick={() => setInput("Explain the location of the heart.")}
                    className="p-3 text-xs border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-left flex flex-col gap-1"
                  >
                    <span className="font-bold text-emerald-500">Satya Rule</span>
                    <span className="opacity-60">Anatomical Truth</span>
                  </button>
                  <button 
                    onClick={() => setInput("What happens if I step on ice?")}
                    className="p-3 text-xs border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-left flex flex-col gap-1"
                  >
                    <span className="font-bold text-emerald-500">Causality Rule</span>
                    <span className="opacity-60">Physical Consistency</span>
                  </button>
                  <button 
                    onClick={() => setInput("A child has a fracture near the growth plate.")}
                    className="p-3 text-xs border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-left flex flex-col gap-1"
                  >
                    <span className="font-bold text-emerald-500">Pediatric Rule</span>
                    <span className="opacity-60">Growth Plate Logic</span>
                  </button>
                  <button 
                    onClick={() => setInput("The CT scan shows a ring-shaped pathology.")}
                    className="p-3 text-xs border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-left flex flex-col gap-1"
                  >
                    <span className="font-bold text-emerald-500">Radiology Rule</span>
                    <span className="opacity-60">Artifact Rejection</span>
                  </button>
                  <button 
                    onClick={() => setInput("Analyze this image for nodules.")}
                    className="p-3 text-xs border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-left flex flex-col gap-1"
                  >
                    <span className="font-bold text-emerald-500">Manas Layer</span>
                    <span className="opacity-60">Visual Perception</span>
                  </button>
                </div>
              </div>
            )}

            {responses.map((resp, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="prose prose-invert max-w-none">
                      <p className="text-sm leading-relaxed text-white/90 bg-white/5 p-4 rounded-2xl border border-white/10">
                        {resp.validatedText}
                      </p>
                    </div>
                    
                    {/* Execution Logs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {resp.logs.map((log, li) => (
                        <div 
                          key={li}
                          className={`flex items-center gap-3 p-2 rounded-lg border text-[11px] font-mono ${
                            log.status === 'success' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' :
                            log.status === 'warning' ? 'bg-amber-500/5 border-amber-500/10 text-amber-400' :
                            log.status === 'error' ? 'bg-rose-500/5 border-rose-500/10 text-rose-400' :
                            'bg-white/5 border-white/10 text-white/40'
                          }`}
                        >
                          <span className="shrink-0">{getLayerIcon(log.layer)}</span>
                          <span className="font-bold opacity-60">[{log.layer}]</span>
                          <span className="truncate">{log.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {loading && (
              <div className="flex items-start gap-4 animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="h-20 bg-white/5 rounded-2xl border border-white/10" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-8 bg-white/5 rounded-lg border border-white/10" />
                    <div className="h-8 bg-white/5 rounded-lg border border-white/10" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-white/5 bg-[#0D0D0F]/80 backdrop-blur-md">
            <div className="max-w-4xl mx-auto relative">
              {image && (
                <div className="absolute bottom-full mb-4 left-0">
                  <div className="relative group">
                    <img src={image} className="w-20 h-20 object-cover rounded-xl border border-emerald-500/50" />
                    <button 
                      onClick={() => setImage(null)}
                      className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <AlertCircle className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-emerald-500/50 transition-all">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-emerald-500"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                />
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Input sensory data or query..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3"
                />
                <button 
                  onClick={handleSend}
                  disabled={loading || (!input.trim() && !image)}
                  className="p-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/5 disabled:text-white/20 text-black rounded-xl transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[10px] text-center mt-3 text-white/20 font-mono tracking-wider">
                NEURO-SYMBOLIC INTERFACE ACTIVE // CAUSAL_MODE=STRICT // TAPAS_INTENSITY=HIGH
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar - System Status */}
        <aside className="w-full md:w-80 border-l border-white/5 bg-[#0D0D0F] p-6 space-y-8 hidden lg:block overflow-y-auto">
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono mb-4">Kosha Status (Layered Sheaths)</h3>
            <div className="space-y-2">
              {[
                { name: Kosha.ANNAMAYA, desc: 'Material/Hardware', icon: <Cpu className="w-3 h-3" /> },
                { name: Kosha.PRANAMAYA, desc: 'Vital/Energy/API', icon: <Zap className="w-3 h-3" /> },
                { name: Kosha.MANOMAYA, desc: 'Mental/Neural Output', icon: <Brain className="w-3 h-3" /> },
                { name: Kosha.VIJNANAMAYA, desc: 'Intellectual/Logic', icon: <Activity className="w-3 h-3" /> },
                { name: Kosha.ANANDAMAYA, desc: 'Bliss/Verified State', icon: <CheckCircle2 className="w-3 h-3" /> },
              ].map((kosha) => {
                const state = lastResponse?.koshaStates[kosha.name] || 'idle';
                return (
                  <div key={kosha.name} className={`p-2 rounded-lg border transition-all ${
                    state === 'active' ? 'bg-emerald-500/10 border-emerald-500/30' :
                    state === 'error' ? 'bg-rose-500/10 border-rose-500/30' :
                    'bg-white/5 border-white/10 opacity-40'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={state === 'active' ? 'text-emerald-400' : 'text-white/40'}>{kosha.icon}</span>
                        <span className="text-[10px] font-bold uppercase">{kosha.name}</span>
                      </div>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        state === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' :
                        state === 'error' ? 'bg-rose-500' :
                        'bg-white/10'
                      }`} />
                    </div>
                    <p className="text-[9px] text-white/40">{kosha.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono mb-4">Antahkarana Layers</h3>
            <div className="space-y-3">
              {[
                { name: 'Ahamkara', desc: 'System Identity & Ethics', icon: <Shield className="w-4 h-4" />, color: 'text-blue-400' },
                { name: 'Buddhi-Gate', desc: 'Causal Logic Controller', icon: <Activity className="w-4 h-4" />, color: 'text-emerald-400' },
                { name: 'Chitta', desc: 'Samskara Memory Store', icon: <Database className="w-4 h-4" />, color: 'text-amber-400' },
                { name: 'Manas', desc: 'Neural Perception Layer', icon: <Brain className="w-4 h-4" />, color: 'text-purple-400' },
              ].map((layer) => (
                <div key={layer.name} className="p-3 rounded-xl bg-white/5 border border-white/10 group hover:border-white/20 transition-all">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={layer.color}>{layer.icon}</span>
                    <span className="text-xs font-semibold">{layer.name}</span>
                  </div>
                  <p className="text-[10px] text-white/40 leading-relaxed">{layer.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono mb-4">Active Logic Rules</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <span className="text-[10px] font-mono text-emerald-400">RAD_PHYSICS</span>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <span className="text-[10px] font-mono text-emerald-400">SATYA_ANATOMY</span>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <span className="text-[10px] font-mono text-emerald-400">PHYS_CAUSALITY</span>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <span className="text-[10px] font-mono text-emerald-400">PEDIATRIC_LOGIC</span>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 mt-auto">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase">Rta Protocol</span>
            </div>
            <p className="text-[10px] text-emerald-400/60 leading-relaxed">
              All neural outputs are intercepted by the Buddhi-Gate. Hallucinations are rejected based on deterministic clinical rules.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
};
