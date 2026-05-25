import { create } from 'zustand';

export interface TerminalLine {
  text: string;
  type: 'input' | 'system' | 'error' | 'lore' | 'text' | 'ascii' | 'video' | 'image';
  media?: {
    type: 'image' | 'video' | '3d' | 'ascii';
    src?: string;
    content?: string;
  };
}

export interface HistoryEntry extends TerminalLine {
  id: string;
}

export interface ActiveMedia {
  type: 'video' | 'image' | '3d';
  url: string;
}

interface TerminalState {
  isVisible: boolean;
  isAuthorized: boolean;
  history: HistoryEntry[];
  activeMedia: ActiveMedia | null;
  toggleTerminal: () => void;
  setTerminalVisible: (visible: boolean) => void;
  setAuthorized: (auth: boolean) => void;
  addHistory: (entry: Omit<HistoryEntry, 'id'>) => void;
  clearHistory: () => void;
  setActiveMedia: (media: ActiveMedia | null) => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  isVisible: false,
  isAuthorized: false,
  history: [
    {
      id: 'init-1',
      type: 'system',
      text: 'ABYSS OS v0.9.1 [CLASSIFIED]',
    },
    {
      id: 'init-2',
      type: 'system',
      text: 'Awaiting Authorization. Enter Override Key...',
    }
  ],
  activeMedia: null,
  toggleTerminal: () => set((state) => ({ isVisible: !state.isVisible })),
  setTerminalVisible: (visible) => set({ isVisible: visible }),
  setAuthorized: (auth) => set({ isAuthorized: auth }),
  addHistory: (entry) =>
    set((state) => ({
      history: [...state.history, { ...entry, id: crypto.randomUUID() }],
    })),
  clearHistory: () => set({ history: [], activeMedia: null }),
  setActiveMedia: (media) => set({ activeMedia: media }),
}));
