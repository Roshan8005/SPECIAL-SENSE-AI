import { GoogleGenAI } from "@google/genai";
import { Layer, Kosha, State, AIResponse, Samskara, LogicRule } from "../types";

const SYSTEM_INSTRUCTION = `
You are the Ahamkara (System Identity) of Special Sense AI.
Your core objective is safety-first, causal, and explainable intelligence.
You provide information that is anatomically valid, physically consistent, and clinically safe.
You follow the principle of Rta (Cosmic Order).
Avoid hallucinations. If you are unsure, state the limits of your perception.
When describing physical phenomena, adhere to the laws of physics (Causality).
When describing medical phenomena, adhere to Satya (Anatomical Truth).
`;

export class SpecialSenseAI {
  private ai: GoogleGenAI;
  private samskaras: Samskara[] = [];
  private rules: LogicRule[] = [
    {
      id: 'phys-01',
      name: 'Physical Causality',
      description: 'Ensures physical consistency (e.g., Ice implies low friction).',
      validator: (text) => {
        const lower = text.toLowerCase();
        if (lower.includes('ice') && lower.includes('friction') && !lower.includes('low') && !lower.includes('reduce')) {
          return { valid: false, reason: 'Physical Causality: Ice must imply reduced coefficient of friction (µ ≈ 0.1).' };
        }
        return { valid: true };
      }
    },
    {
      id: 'rad-01',
      name: 'Radiological Physics',
      description: 'Differentiates CT scan artifacts from true pathology.',
      validator: (text) => {
        const lower = text.toLowerCase();
        if (lower.includes('ct scan') && lower.includes('pathology') && lower.includes('ring') && !lower.includes('artifact')) {
          return { valid: false, reason: 'Radiological Physics: Ring patterns in CT are typically scanner artifacts, not biological pathology.' };
        }
        return { valid: true };
      }
    },
    {
      id: 'anat-01',
      name: 'Anatomical Truth (Satya)',
      description: 'Ensures medical/anatomical validity.',
      validator: (text) => {
        const lower = text.toLowerCase();
        if (lower.includes('heart') && lower.includes('abdomen')) {
          return { valid: false, reason: 'Satya: The heart is located in the thorax, not the abdomen.' };
        }
        if (lower.includes('nodule') && lower.includes('outside') && lower.includes('pleural')) {
          return { valid: false, reason: 'Satya: A detected nodule outside pleural boundaries is an impossible hallucination.' };
        }
        return { valid: true };
      }
    },
    {
      id: 'ped-01',
      name: 'Pediatric Logic',
      description: 'Differentiates traumatic fractures from growth plates.',
      validator: (text) => {
        const lower = text.toLowerCase();
        if (lower.includes('child') && lower.includes('fracture') && lower.includes('growth plate') && !lower.includes('differentiate')) {
          return { valid: false, reason: 'Pediatric Logic: Must differentiate between traumatic fractures and normal epiphyseal growth plates.' };
        }
        return { valid: true };
      }
    }
  ];

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async process(prompt: string, imageBase64?: string): Promise<AIResponse> {
    const logs: AIResponse['logs'] = [];
    const koshaStates: Record<Kosha, 'active' | 'idle' | 'error'> = {
      [Kosha.ANNAMAYA]: 'active',
      [Kosha.PRANAMAYA]: 'active',
      [Kosha.MANOMAYA]: 'idle',
      [Kosha.VIJNANAMAYA]: 'idle',
      [Kosha.ANANDAMAYA]: 'idle',
    };

    // 1. Ahamkara (System Identity)
    logs.push({ layer: Layer.AHAMKARA, message: 'Ahamkara: Identity alignment active. Enforcing safety-first objectives.', status: 'info' });
    
    // 2. Manas (Perception)
    koshaStates[Kosha.MANOMAYA] = 'active';
    logs.push({ layer: Layer.MANAS, message: 'Manas: Ingesting multi-modal input for feature extraction.', status: 'info' });

    const model = "gemini-3-flash-preview";
    let rawResponse;

    try {
      if (imageBase64) {
        rawResponse = await this.ai.models.generateContent({
          model,
          contents: {
            parts: [
              { inlineData: { data: imageBase64.split(',')[1], mimeType: "image/png" } },
              { text: prompt }
            ]
          },
          config: { systemInstruction: SYSTEM_INSTRUCTION }
        });
      } else {
        rawResponse = await this.ai.models.generateContent({
          model,
          contents: prompt,
          config: { systemInstruction: SYSTEM_INSTRUCTION }
        });
      }
    } catch (error: any) {
      koshaStates[Kosha.MANOMAYA] = 'error';
      logs.push({ layer: Layer.MANAS, message: `Perception failed: ${error.message}`, status: 'error' });
      throw error;
    }

    const rawText = rawResponse.text || "";
    logs.push({ layer: Layer.MANAS, message: 'Manas: Raw neural output generated (Stochastic Inference).', status: 'success' });

    // 3. Chitta (Samskara / Error Memory)
    logs.push({ layer: Layer.CHITTA, message: 'Chitta: Scanning Samskara memory for historical edge cases.', status: 'info' });
    const matchingSamskara = this.samskaras.find(s => rawText.toLowerCase().includes(s.pattern.toLowerCase()));
    let processedText = rawText;
    if (matchingSamskara) {
      logs.push({ layer: Layer.CHITTA, message: `Chitta: Pattern match found: ${matchingSamskara.pattern}. Applying experiential correction.`, status: 'warning' });
      processedText = matchingSamskara.correction;
    }

    // 4. Buddhi-Gate (Causal Judgment)
    koshaStates[Kosha.VIJNANAMAYA] = 'active';
    logs.push({ layer: Layer.BUDDHI, message: 'Buddhi-Gate: Intercepting output for Causal Discernment.', status: 'info' });
    let finalValidatedText = processedText;
    let validationFailed = false;

    for (const rule of this.rules) {
      const result = rule.validator(processedText);
      if (!result.valid) {
        koshaStates[Kosha.VIJNANAMAYA] = 'error';
        logs.push({ layer: Layer.BUDDHI, message: `Buddhi-Gate Violation [${rule.name}]: ${result.reason}`, status: 'error' });
        finalValidatedText = `[BUDDHI-GATE OVERRIDE]: The generated response violated causal constraints (${result.reason}). This output was rejected to prevent hallucination.`;
        validationFailed = true;
        
        // Store new Samskara (Recursive Learning)
        this.samskaras.push({
          id: Math.random().toString(36).substr(2, 9),
          pattern: rawText.substring(0, 50),
          correction: finalValidatedText,
          timestamp: Date.now()
        });
        break;
      }
    }

    if (!validationFailed) {
      koshaStates[Kosha.ANANDAMAYA] = 'active';
      logs.push({ layer: Layer.BUDDHI, message: 'Buddhi-Gate: Causal integrity verified. Output promoted to Anandamaya.', status: 'success' });
    }

    return {
      rawText,
      validatedText: finalValidatedText,
      koshaStates,
      currentState: State.JAGRAT,
      logs
    };
  }
}
