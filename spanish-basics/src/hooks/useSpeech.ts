import { useState, useCallback, useEffect } from "react";
import * as Speech from "expo-speech";

const LANGUAGE = "es-ES";
const NORMAL_RATE = 1.0;
const SLOW_RATE = 0.5;

/**
 * Hook for text-to-speech with Spanish language settings.
 *
 * Returns:
 * - speak(text, slow?) — speaks the given text in Spanish
 * - isSpeaking — whether speech is currently active
 * - stop — stops any active speech
 */
export function useSpeech(): {
  speak: (text: string, slow?: boolean) => void;
  isSpeaking: boolean;
  stop: () => void;
} {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const speak = useCallback((text: string, slow: boolean = false) => {
    Speech.stop();
    setIsSpeaking(true);

    Speech.speak(text, {
      language: LANGUAGE,
      rate: slow ? SLOW_RATE : NORMAL_RATE,
      pitch: 1.0,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
    });
  }, []);

  const stop = useCallback(() => {
    Speech.stop();
    setIsSpeaking(false);
  }, []);

  return { speak, isSpeaking, stop };
}
