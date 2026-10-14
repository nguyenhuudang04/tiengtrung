"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import type { QuizQuestion as QuizQuestionType, QuizAnswer, QuizDifficulty } from "@/types/quiz";
import SpeechButton from "@/components/learn/SpeechButton";

type Props = {
  question: QuizQuestionType;
  currentIndex: number;
  total: number;
  difficulty: QuizDifficulty;
  onAnswer: (selected: QuizAnswer, isCorrect: boolean) => void;
  onNext: () => void;
};

export default function QuizQuestion({ question, currentIndex, total, difficulty, onAnswer, onNext }: Props) {
  const [selected, setSelected] = useState<QuizAnswer | null>(null);
  
  // Medium Mode
  const [showOptions, setShowOptions] = useState(difficulty === "easy");
  
  // Hard Mode
  const [textInput, setTextInput] = useState("");
  const [isHardChecked, setIsHardChecked] = useState(false);
  const [hardIsCorrect, setHardIsCorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset local state when question changes
  useEffect(() => {
    setSelected(null);
    setShowOptions(difficulty === "easy");
    setTextInput("");
    setIsHardChecked(false);
    setHardIsCorrect(false);
  }, [question, difficulty]);

  // Auto focus input on hard mode
  useEffect(() => {
    if (difficulty === "hard" && !isHardChecked) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [difficulty, isHardChecked, question]);

  const handleSelect = useCallback((answer: QuizAnswer) => {
    if (selected) return;
    setSelected(answer);
    onAnswer(answer, answer.isCorrect);
  }, [selected, onAnswer]);

  const handleGiveUp = useCallback(() => {
    if (selected) return;
    setShowOptions(true);
    const dummyWrong: QuizAnswer = { id: 'give_up', meaning_vi: 'Không nhớ', isCorrect: false };
    setSelected(dummyWrong);
    onAnswer(dummyWrong, false);
  }, [selected, onAnswer]);

  const checkTextAnswer = (input: string, correct: string) => {
    const clean = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
    const cleanInput = clean(input);
    const correctParts = correct.split(',').map(clean);
    return correctParts.some(part => part === cleanInput) || clean(correct) === cleanInput;
  };

  const handleHardSubmit = useCallback(() => {
    if (selected || !textInput.trim()) return;
    const isCorrect = checkTextAnswer(textInput, question.vocabulary.meaning_vi);
    setHardIsCorrect(isCorrect);
    setIsHardChecked(true);
    const simulatedAnswer: QuizAnswer = { id: 'text_input', meaning_vi: textInput.trim(), isCorrect };
    setSelected(simulatedAnswer);
    onAnswer(simulatedAnswer, isCorrect);
  }, [selected, textInput, question, onAnswer]);

  const handleNext = useCallback(() => {
    if (selected) onNext();
  }, [selected, onNext]);

  // Keyboard shortcuts (Desktop)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        if (e.code === "Enter" && difficulty === "hard" && !selected) {
          e.preventDefault();
          handleHardSubmit();
        } else if (e.code === "Enter" && selected) {
          e.preventDefault();
          handleNext();
        }
        return;
      }

      if (!selected) {
        if (difficulty === "medium" && !showOptions) {
          if (e.code === "Space" || e.code === "Enter") {
            e.preventDefault();
            setShowOptions(true);
          } else if (e.code === "Escape") {
            e.preventDefault();
            handleGiveUp();
          }
        } else if (difficulty !== "hard") {
          const keyMap: Record<string, number> = { "1": 0, "2": 1, "3": 2, "4": 3, "Numpad1": 0, "Numpad2": 1, "Numpad3": 2, "Numpad4": 3 };
          const index = keyMap[e.code];
          if (index !== undefined && index < question.answers.length) {
            e.preventDefault();
            handleSelect(question.answers[index]);
          }
        }
      } else {
        if (e.code === "Enter" || e.code === "ArrowRight") {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected, question.answers, difficulty, showOptions, handleSelect, handleNext, handleGiveUp, handleHardSubmit]);

  const getOptionLabel = (index: number) => ["A", "B", "C", "D"][index] || "";

  const vocab = question.vocabulary;
  const isCorrect = selected?.isCorrect;

  return (
    <div className="w-full max-w-[800px] mx-auto animate-in fade-in duration-300">
      <header className="flex flex-col gap-3 mb-6">
        <div className="flex justify-between items-end">
          <span className="text-gray-500 font-medium">Câu hỏi <strong className="text-gray-900">{currentIndex + 1}</strong> / {total}</span>
          <span className="text-indigo-600 font-bold text-sm bg-indigo-50 px-3 py-1 rounded-full">
            {Math.round(((currentIndex) / total) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out" 
            style={{ width: `${((currentIndex) / total) * 100}%` }}
          />
        </div>
      </header>
      
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col w-full relative">
        <div className="p-6 md:p-10 text-center relative flex flex-col items-center border-b border-gray-50">
          <div className="absolute top-4 right-4 z-10">
            <SpeechButton text={vocab.hanzi} />
          </div>
          
          <h2 className="text-[44px] md:text-[64px] font-tc font-normal text-gray-900 leading-none tracking-tight mb-6 mt-2">
            {vocab.hanzi}
          </h2>
          {difficulty !== "hard" ? (
            <p className="text-gray-700 font-medium bg-gray-50 px-4 py-2 rounded-xl inline-block">
              Từ trên có nghĩa là gì?
            </p>
          ) : (
             <p className="text-gray-700 font-medium bg-gray-50 px-4 py-2 rounded-xl inline-block">
              Hãy nhập nghĩa tiếng Việt
            </p>
          )}
        </div>

        {/* MEDIUM MODE - Pre-Options */}
        {difficulty === "medium" && !showOptions && (
          <div className="p-6 md:p-8 bg-gray-50/50 flex flex-col gap-4 animate-in slide-in-from-bottom-2">
            <p className="text-center text-gray-600 font-medium mb-2 text-lg">Bạn có nhớ nghĩa của từ này không?</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => setShowOptions(true)}
                className="w-full sm:w-auto px-8 min-h-[56px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-colors shadow-sm"
              >
                Tôi đã nghĩ xong
              </button>
              <button 
                onClick={handleGiveUp}
                className="w-full sm:w-auto px-8 min-h-[56px] bg-white border-2 border-red-200 hover:bg-red-50 text-red-600 font-bold rounded-2xl transition-colors"
              >
                Không nhớ
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2 hidden md:block">Phím tắt: Space (nghĩ xong) / Esc (không nhớ)</p>
          </div>
        )}

        {/* MULTIPLE CHOICE OPTIONS (Easy & Medium) */}
        {(difficulty === "easy" || difficulty === "medium") && showOptions && (
          <div className="p-4 md:p-6 bg-gray-50/50 animate-in fade-in">
            <div className="flex flex-col gap-3">
              {question.answers.map((ans, idx) => {
                const isSelected = selected?.id === ans.id;
                const isGiveUp = selected?.id === 'give_up';
                const showCorrect = (selected && ans.isCorrect) || (isGiveUp && ans.isCorrect);
                const showWrong = isSelected && !ans.isCorrect && !isGiveUp;

                let btnClass = "bg-white border-gray-200 hover:bg-gray-50 hover:border-indigo-200 text-gray-700";
                
                if (selected) {
                  if (showCorrect) {
                    btnClass = "bg-green-50 border-green-500 text-green-900 ring-1 ring-green-500";
                  } else if (showWrong) {
                    btnClass = "bg-red-50 border-red-500 text-red-900 ring-1 ring-red-500";
                  } else {
                    btnClass = "bg-white border-gray-100 text-gray-400 opacity-60";
                  }
                }

                return (
                  <button
                    key={ans.id}
                    disabled={!!selected}
                    onClick={() => handleSelect(ans)}
                    className={`w-full min-h-[56px] px-4 md:px-6 py-3 rounded-2xl border-2 font-medium text-left transition-all flex items-center gap-4 ${btnClass}`}
                  >
                    <span className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-sm font-bold ${showCorrect ? 'bg-green-500 text-white' : showWrong ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {getOptionLabel(idx)}
                    </span>
                    <span className="text-base md:text-lg">{ans.meaning_vi}</span>
                    
                    {showCorrect && <CheckCircle2 className="w-6 h-6 text-green-500 ml-auto shrink-0" />}
                    {showWrong && <XCircle className="w-6 h-6 text-red-500 ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* HARD MODE INPUT */}
        {difficulty === "hard" && !isHardChecked && (
          <div className="p-6 md:p-8 bg-gray-50/50 flex flex-col gap-4">
            <div className="flex flex-col gap-2 relative">
              <input 
                ref={inputRef}
                type="text" 
                value={textInput} 
                onChange={e => setTextInput(e.target.value)}
                className="w-full min-h-[56px] text-base md:text-lg font-medium text-gray-900 border-2 border-gray-200 rounded-2xl px-5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all"
                placeholder="Nhập nghĩa (ví dụ: ngày xưa)..."
                disabled={isHardChecked}
              />
            </div>
            <button 
              onClick={handleHardSubmit} 
              disabled={!textInput.trim()}
              className="w-full min-h-[56px] bg-indigo-600 disabled:bg-gray-300 text-white font-bold rounded-2xl hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
            >
              Kiểm tra
            </button>
          </div>
        )}

        {/* HARD MODE FEEDBACK */}
        {difficulty === "hard" && isHardChecked && (
          <div className="p-4 md:p-6 bg-gray-50/50 animate-in fade-in">
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row gap-4">
              <div className={`p-4 rounded-xl border flex-1 ${hardIsCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p className={`text-xs font-bold uppercase mb-1 tracking-wider ${hardIsCorrect ? 'text-green-600' : 'text-red-600'}`}>Bạn nhập</p>
                <p className={`text-lg font-medium ${hardIsCorrect ? 'text-green-900' : 'text-red-900 line-through decoration-red-400'}`}>{textInput}</p>
              </div>
              {!hardIsCorrect && (
                <div className="bg-green-50 p-4 rounded-xl border border-green-200 flex-1">
                  <p className="text-xs font-bold text-green-700 uppercase mb-1 tracking-wider">Đáp án đúng</p>
                  <p className="text-green-900 text-lg font-bold">{vocab.meaning_vi}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feedback Section */}
        {selected && (
          <div className={`p-4 md:p-6 border-t ${isCorrect ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'} animate-in slide-in-from-bottom-2`}>
            <div className="flex items-center gap-2 mb-4">
              {isCorrect ? (
                <h3 className="text-lg font-bold text-green-700 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6" /> Chính xác!
                </h3>
              ) : (
                <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
                  <XCircle className="w-6 h-6" /> Chưa chính xác
                </h3>
              )}
            </div>

            {!isCorrect && difficulty !== "hard" && selected.id !== 'give_up' && (
              <p className="text-gray-900 font-medium mb-4">
                Đáp án đúng: <span className="text-green-700 font-bold">{question.answers.find(a => a.isCorrect)?.meaning_vi}</span>
              </p>
            )}
            
            {!isCorrect && selected.id === 'give_up' && (
              <p className="text-gray-900 font-medium mb-4">
                Đáp án là: <span className="text-indigo-700 font-bold">{question.answers.find(a => a.isCorrect)?.meaning_vi}</span>
              </p>
            )}

            {(vocab.example_cn || vocab.example_vi) && (
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-6">
                {vocab.example_cn && (
                  <p className="font-tc text-gray-900 text-lg mb-2 leading-relaxed">
                    {vocab.example_cn}
                  </p>
                )}
                {vocab.example_vi && (
                  <p className="text-base text-gray-700 mt-2 pt-2 border-t border-gray-50">
                    <span className="text-gray-400 mr-2">→</span>
                    {vocab.example_vi}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleNext}
              className={`w-full min-h-[56px] rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95 ${
                isCorrect 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              Câu tiếp theo <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-center text-xs text-gray-500 mt-3 hidden md:block">
              Nhấn <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded">Enter</kbd> để tiếp tục
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
