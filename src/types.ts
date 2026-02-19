export enum Layer {
  MANAS = 'MANAS',
  BUDDHI = 'BUDDHI',
  CHITTA = 'CHITTA',
  AHAMKARA = 'AHAMKARA'
}

export enum Kosha {
  ANNAMAYA = 'ANNAMAYA',   // Material/Hardware
  PRANAMAYA = 'PRANAMAYA', // Vital/Energy/API
  MANOMAYA = 'MANOMAYA',   // Mental/Neural Output
  VIJNANAMAYA = 'VIJNANAMAYA', // Intellectual/Logic
  ANANDAMAYA = 'ANANDAMAYA'  // Bliss/Verified State
}

export enum State {
  JAGRAT = 'JAGRAT',   // Waking/Active
  SVAPNA = 'SVAPNA',   // Dream/Processing
  SUSHUPTI = 'SUSHUPTI', // Deep Sleep/Idle
  TURIYA = 'TURIYA'    // Pure Awareness/Witness
}

export interface Samskara {
  id: string;
  pattern: string;
  correction: string;
  timestamp: number;
}

export interface LogicRule {
  id: string;
  name: string;
  description: string;
  validator: (input: string) => { valid: boolean; reason?: string };
}

export interface AIResponse {
  rawText: string;
  validatedText: string;
  koshaStates: Record<Kosha, 'active' | 'idle' | 'error'>;
  currentState: State;
  logs: {
    layer: Layer;
    message: string;
    status: 'info' | 'success' | 'warning' | 'error';
  }[];
}
