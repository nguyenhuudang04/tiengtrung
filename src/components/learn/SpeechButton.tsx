"use client";

import { Volume2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

type Props = {
  text: string;
  className?: string;
};

export default function SpeechButton({ text, className = "" }: Props) {
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && !("speechSynthesis" in window)) {
      setSupported(false);
    }
  }, []);

  const handleSpeak = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip
    
    if (!supported) {
      toast.error("Trình duyệt không hỗ trợ phát âm.");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a Taiwanese Mandarin voice first
    const voices = window.speechSynthesis.getVoices();
    const twVoice = voices.find(v => v.lang === "zh-TW" || v.lang === "zh-HK");
    const cnVoice = voices.find(v => v.lang === "zh-CN" || v.lang.startsWith("zh"));

    if (twVoice) {
      utterance.voice = twVoice;
      utterance.lang = "zh-TW";
    } else if (cnVoice) {
      utterance.voice = cnVoice;
      utterance.lang = "zh-CN";
    } else {
      utterance.lang = "zh";
    }

    utterance.rate = 0.9; // Slightly slower for learning
    window.speechSynthesis.speak(utterance);
  }, [text, supported]);

  if (!supported) return null;

  return (
    <button 
      onClick={handleSpeak}
      title="Phát âm"
      className={`p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors active:scale-95 ${className}`}
    >
      <Volume2 className="w-6 h-6 md:w-7 md:h-7" />
    </button>
  );
}
