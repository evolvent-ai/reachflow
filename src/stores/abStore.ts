import { create } from 'zustand';
import type { ABVariants } from '@/types';

interface ABState {
  variants: ABVariants;
  setVariants: (variants: ABVariants) => void;
}

export const useABStore = create<ABState>((set) => ({
  variants: {
    h1: 'default',
    secondary: 'default',
    formFields: 'default',
    trust: 'default',
    pricing: 'default',
  },
  setVariants: (variants) => set({ variants }),
}));
