import { useEffect } from 'react';

type KeyCombo = {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
};

export const useKeyboardShortcut = (combo: KeyCombo, callback: () => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if the pressed key matches the desired combo
      const isKeyMatch = event.key.toLowerCase() === combo.key.toLowerCase() || event.code.toLowerCase() === combo.key.toLowerCase();
      
      const isCtrlMatch = !!combo.ctrlKey === event.ctrlKey;
      const isAltMatch = !!combo.altKey === event.altKey;
      const isShiftMatch = !!combo.shiftKey === event.shiftKey;

      if (isKeyMatch && isCtrlMatch && isAltMatch && isShiftMatch) {
        event.preventDefault(); // Prevent default browser behavior (e.g., devtools or focus)
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Strict cleanup function (SOP Rule 2 & 10)
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [combo.key, combo.ctrlKey, combo.altKey, combo.shiftKey, callback]);
};
