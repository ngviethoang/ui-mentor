import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BearState {
  openaiKey?: string;
  setOpenaiKey: (key: string) => void;
}

export const useBearStore = create<BearState>()(
  persist(
    (set) => ({
      setOpenaiKey: (key: string) => set({ openaiKey: key }),
    }),
    {
      name: 'bear-storage',
    }
  )
);
