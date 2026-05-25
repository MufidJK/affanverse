import { useState, useEffect } from 'react';

export const useTypewriter = (text: string, speed: number = 30) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Reset state when text changes
    setDisplayedText("");
    setIsComplete(false);

    if (!text) {
      setIsComplete(true);
      return;
    }

    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex++;
      setDisplayedText(text.slice(0, currentIndex));
      
      if (currentIndex >= text.length) {
        clearInterval(interval);
        setIsComplete(true);
      }
    }, speed);

    // Strict cleanup function (SOP Rule 2 & 10)
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayedText, isComplete };
};
