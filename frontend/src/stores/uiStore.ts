import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UISettings } from '../types';

interface UIStore extends UISettings {
  toggleDarkMode: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      darkMode: false,
      soundSettings: {
        enabled: true,
        volume: 0.7,
      },
      animationsEnabled: true,

      toggleDarkMode: () => {
        const newDarkMode = !get().darkMode;
        set({ darkMode: newDarkMode });
        
        if (newDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      setSoundEnabled: (enabled) => {
        set({
          soundSettings: {
            ...get().soundSettings,
            enabled,
          },
        });
      },

      setSoundVolume: (volume) => {
        set({
          soundSettings: {
            ...get().soundSettings,
            volume,
          },
        });
      },

      setAnimationsEnabled: (enabled) => {
        set({ animationsEnabled: enabled });
      },
    }),
    {
      name: 'kniffel-ui-settings',
    }
  )
);
