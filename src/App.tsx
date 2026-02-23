/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  ChevronRight, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Trophy,
  Info,
  ArrowRight,
  ArrowLeft,
  Flag,
  ListChecks,
  Search
} from 'lucide-react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Question, QuizStatus, QuizResult, Difficulty, Chapter } from './types';
import { generateAccountingQuestions } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [status, setStatus] = useState<QuizStatus>('idle');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [questionCount, setQuestionCount] = useState<number>(25);
  const [selectedChapters, setSelectedChapters] = useState<Chapter[]>(['Chapter 1', 'Chapter 2', 'Chapter 3', 'Appendix D']);
  const [searchTerm, setSearchTerm] = useState('');
  const [progress, setProgress] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const startQuiz = async () => {
    if (selectedChapters.length === 0) {
      setError('Please select at least one chapter.');
      return;
    }
    setError(null);
    setStatus('loading');
    setProgress(0);
    try {
      const data = await generateAccountingQuestions(difficulty, questionCount, selectedChapters, (p) => setProgress(p));
      setQuestions(data);
      setCurrentIndex(0);
      setAnswers({});
      setFlaggedIds(new Set());
      setStatus('active');
    } catch (err: any) {
      console.error('Quiz generation error:', err);
      setError(`Failed to generate questions: ${err.message || 'Unknown error'}. Please ensure you are using the "Share" link from AI Studio and your API key is active.`);
      setStatus('idle');
    }
  };

  const toggleChapter = (chapter: Chapter) => {
    setSelectedChapters(prev => {
      if (prev.includes(chapter)) {
        return prev.filter(c => c !== chapter);
      } else {
        return [...prev, chapter];
      }
    });
  };

  const toggleFlag = (id: string) => {
    setFlaggedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelect = (optionIndex: number) => {
    const currentQuestion = questions[currentIndex];
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionIndex }));
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setStatus('review');
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const score = useMemo(() => {
    return questions.reduce((acc, q) => {
      return acc + (answers[q.id] === q.correctIndex ? 1 : 0);
    }, 0);
  }, [questions, answers]);

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-bottom border-black/5 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
              <BookOpen size={18} />
            </div>
            <h1 className="font-semibold tracking-tight text-lg">Accounting Master</h1>
          </div>
          {status === 'active' && (
            <div className="text-xs font-mono text-muted-foreground bg-black/5 px-2 py-1 rounded">
              {currentIndex + 1} / {questions.length}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 text-center"
            >
              <div className="space-y-4">
                <h2 className="text-4xl font-light tracking-tight sm:text-5xl">
                  Master Financial Accounting
                </h2>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                  Practice with randomized questions covering your selected chapters.
                </p>
              </div>

              <div className="space-y-8 max-w-2xl mx-auto">
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Select Content</div>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                        <input
                          type="text"
                          placeholder="Search chapters..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-white border border-black/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setSelectedChapters(['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Chapter 5', 'Chapter 6', 'Chapter 7', 'Chapter 8', 'Chapter 9', 'Chapter 10', 'Chapter 11', 'Chapter 12', 'Appendix A', 'Appendix B', 'Appendix C', 'Appendix D', 'Appendix E', 'Appendix F'])}
                          className="px-3 py-1.5 text-xs bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors font-medium border border-emerald-100"
                        >
                          All
                        </button>
                        <button 
                          onClick={() => setSelectedChapters([])}
                          className="px-3 py-1.5 text-xs bg-black/5 text-muted-foreground rounded-lg hover:bg-black/10 transition-colors font-medium border border-transparent"
                        >
                          None
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {[
                      {
                        label: 'Core Chapters',
                        items: [
                          { id: 'Chapter 1', title: 'Chapter 1', desc: 'Economic Environment' },
                          { id: 'Chapter 2', title: 'Chapter 2', desc: 'Business Events' },
                          { id: 'Chapter 3', title: 'Chapter 3', desc: 'Cash Flow & Net Income' },
                          { id: 'Chapter 4', title: 'Chapter 4', desc: 'Investing & Credit Decisions' },
                          { id: 'Chapter 5', title: 'Chapter 5', desc: 'Revenue & Receivables' },
                          { id: 'Chapter 6', title: 'Chapter 6', desc: 'Inventory & Payables' },
                          { id: 'Chapter 7', title: 'Chapter 7', desc: 'Long-Lived Assets' },
                          { id: 'Chapter 8', title: 'Chapter 8', desc: 'Investing in Entities' },
                          { id: 'Chapter 9', title: 'Chapter 9', desc: 'Debt Financing' },
                          { id: 'Chapter 10', title: 'Chapter 10', desc: 'Liabilities & Taxes' },
                          { id: 'Chapter 11', title: 'Chapter 11', desc: 'Equity Financing' },
                          { id: 'Chapter 12', title: 'Chapter 12', desc: 'Equity Valuation' },
                        ]
                      },
                      {
                        label: 'Appendices',
                        items: [
                          { id: 'Appendix A', title: 'Appendix A', desc: 'Time Value of Money' },
                          { id: 'Appendix B', title: 'Appendix B', desc: 'Ratios & Metrics' },
                          { id: 'Appendix C', title: 'Appendix C', desc: 'IFRS Illustrated' },
                          { id: 'Appendix D', title: 'Appendix D', desc: 'Accounting Mechanics' },
                          { id: 'Appendix E', title: 'Appendix E', desc: 'Working Capital' },
                          { id: 'Appendix F', title: 'Appendix F', desc: 'Data Analytics' }
                        ]
                      }
                    ].map((group) => {
                      const filteredItems = group.items.filter(item => 
                        item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        item.desc.toLowerCase().includes(searchTerm.toLowerCase())
                      );

                      if (filteredItems.length === 0) return null;

                      return (
                        <div key={group.label} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{group.label}</h3>
                            <div className="h-px flex-1 bg-black/5" />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {filteredItems.map((item) => {
                              const isSelected = selectedChapters.includes(item.id as Chapter);
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => toggleChapter(item.id as Chapter)}
                                  className={cn(
                                    "p-3 rounded-xl border text-left transition-all flex items-center justify-between group relative overflow-hidden",
                                    isSelected 
                                      ? "bg-emerald-50 border-emerald-200 text-emerald-900 shadow-sm" 
                                      : "bg-white border-black/5 text-muted-foreground hover:border-emerald-200 hover:bg-emerald-50/30"
                                  )}
                                >
                                  <div className="relative z-10">
                                    <div className={cn("text-[10px] font-mono mb-0.5", isSelected ? "text-emerald-600" : "text-muted-foreground")}>
                                      {item.title}
                                    </div>
                                    <div className="text-sm font-medium leading-tight">{item.desc}</div>
                                  </div>
                                  <div className={cn(
                                    "w-4 h-4 rounded border flex items-center justify-center transition-colors relative z-10 shrink-0 ml-2",
                                    isSelected ? "bg-emerald-600 border-emerald-600 text-white" : "border-black/10 group-hover:border-emerald-300"
                                  )}>
                                    {isSelected && <CheckCircle2 size={10} />}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Difficulty</div>
                    <div className="grid grid-cols-2 gap-2">
                      {(['Easy', 'Medium', 'Hard', 'Mixed'] as Difficulty[]).map((level) => (
                        <button
                          key={level}
                          onClick={() => setDifficulty(level)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                            difficulty === level 
                              ? "bg-emerald-600 border-emerald-600 text-white shadow-md" 
                              : "bg-white border-black/5 text-muted-foreground hover:border-emerald-200 hover:bg-emerald-50/50"
                          )}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Number of Questions</div>
                    <div className="grid grid-cols-2 gap-2">
                      {[5, 10, 25, 50].map((count) => (
                        <button
                          key={count}
                          onClick={() => setQuestionCount(count)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                            questionCount === count 
                              ? "bg-emerald-600 border-emerald-600 text-white shadow-md" 
                              : "bg-white border-black/5 text-muted-foreground hover:border-emerald-200 hover:bg-emerald-50/50"
                          )}
                        >
                          {count} Questions
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={startQuiz}
                className="group relative inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-8 py-4 rounded-full font-medium transition-all hover:bg-emerald-600 hover:scale-105 active:scale-95 shadow-lg"
              >
                Start Practice Session
                <ChevronRight size={20} className="transition-transform group-hover:translate-x-1" />
              </button>

              {error && (
                <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-100">
                  {error}
                </p>
              )}
            </motion.div>
          )}

          {status === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 space-y-8"
            >
              <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-black/5 stroke-current"
                    strokeWidth="8"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                  ></circle>
                  <motion.circle
                    className="text-emerald-600 stroke-current"
                    strokeWidth="8"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    initial={{ strokeDasharray: "251.2", strokeDashoffset: "251.2" }}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * progress) / 100 }}
                    transition={{ duration: 0.5 }}
                  ></motion.circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-bold text-emerald-700">{Math.round(progress)}%</span>
                  <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-light tracking-tight">Generating Your Quiz</h3>
                <p className="text-muted-foreground max-w-xs mx-auto">
                  Our AI professor is crafting {questionCount} unique questions across {selectedChapters.length} chapters...
                </p>
              </div>
              <div className="w-full max-w-xs h-1.5 bg-black/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-emerald-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}

          {status === 'active' && questions.length > 0 && (
            <motion.div
              key="active"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Progress Bar */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-1 bg-black/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-emerald-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
                <button
                  onClick={() => toggleFlag(questions[currentIndex].id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                    flaggedIds.has(questions[currentIndex].id)
                      ? "bg-amber-100 text-amber-600 border border-amber-200"
                      : "bg-black/5 text-muted-foreground border border-transparent hover:bg-black/10"
                  )}
                >
                  <Flag size={14} fill={flaggedIds.has(questions[currentIndex].id) ? "currentColor" : "none"} />
                  {flaggedIds.has(questions[currentIndex].id) ? 'Flagged' : 'Flag'}
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-600">
                    {questions[currentIndex].chapter}
                  </span>
                  <h3 className="text-2xl font-medium leading-tight">
                    {questions[currentIndex].text}
                  </h3>
                </div>

                <div className="grid gap-3">
                  {questions[currentIndex].options.map((option, idx) => {
                    const isSelected = answers[questions[currentIndex].id] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelect(idx)}
                        className={cn(
                          "w-full text-left p-5 rounded-2xl border transition-all flex items-center justify-between group",
                          isSelected 
                            ? "bg-emerald-50 border-emerald-200 text-emerald-900 shadow-sm" 
                            : "bg-white border-black/5 hover:border-emerald-200 hover:bg-emerald-50/30"
                        )}
                      >
                        <span className="flex-1">{option}</span>
                        <div className={cn(
                          "w-6 h-6 rounded-full border flex items-center justify-center transition-colors",
                          isSelected ? "bg-emerald-600 border-emerald-600 text-white" : "border-black/10 group-hover:border-emerald-300"
                        )}>
                          {isSelected && <CheckCircle2 size={14} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-black/5">
                <button
                  onClick={prevQuestion}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-black disabled:opacity-0 transition-all"
                >
                  <ArrowLeft size={16} /> Previous
                </button>
                
                <button
                  onClick={nextQuestion}
                  className="flex items-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 rounded-full font-medium transition-all hover:bg-emerald-600"
                >
                  {currentIndex === questions.length - 1 ? 'Review Summary' : 'Next Question'}
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {status === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-light tracking-tight">Quiz Summary</h2>
                <p className="text-muted-foreground">Review your progress before submitting for grading.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-black/5 text-center">
                  <div className="text-2xl font-semibold">{questions.length}</div>
                  <div className="text-xs text-muted-foreground uppercase font-bold">Total</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-black/5 text-center">
                  <div className="text-2xl font-semibold text-emerald-600">{Object.keys(answers).length}</div>
                  <div className="text-xs text-muted-foreground uppercase font-bold">Answered</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-black/5 text-center">
                  <div className="text-2xl font-semibold text-amber-600">{flaggedIds.size}</div>
                  <div className="text-xs text-muted-foreground uppercase font-bold">Flagged</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-black/5 text-center">
                  <div className="text-2xl font-semibold text-red-600">{questions.length - Object.keys(answers).length}</div>
                  <div className="text-xs text-muted-foreground uppercase font-bold">Remaining</div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-sm">
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {questions.map((q, i) => {
                    const isAnswered = answers[q.id] !== undefined;
                    const isFlagged = flaggedIds.has(q.id);
                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          setCurrentIndex(i);
                          setStatus('active');
                        }}
                        className={cn(
                          "aspect-square rounded-xl border text-sm font-bold flex flex-col items-center justify-center relative transition-all hover:scale-110",
                          isAnswered 
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                            : "bg-black/5 border-transparent text-muted-foreground"
                        )}
                      >
                        {i + 1}
                        {isFlagged && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    setCurrentIndex(0);
                    setStatus('active');
                  }}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-medium border border-black/10 hover:bg-black/5 transition-all"
                >
                  <ListChecks size={20} /> Back to Quiz
                </button>
                <button
                  onClick={() => setStatus('finished')}
                  className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-10 py-4 rounded-full font-medium shadow-lg hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all"
                >
                  Submit for Grading <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {status === 'finished' && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-12"
            >
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mb-4">
                  <Trophy size={40} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-4xl font-light tracking-tight">Quiz Complete!</h2>
                  <p className="text-muted-foreground text-lg">
                    You scored <span className="text-emerald-600 font-semibold">{score}</span> out of {questions.length}
                  </p>
                </div>
                
                <div className="flex justify-center gap-4">
                  <button
                    onClick={startQuiz}
                    className="flex items-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 rounded-full font-medium transition-all hover:bg-emerald-600"
                  >
                    <RotateCcw size={18} /> Try Again
                  </button>
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="text-xl font-medium border-b border-black/5 pb-4">Detailed Review</h3>
                <div className="space-y-6">
                  {questions.map((q, i) => {
                    const selected = answers[q.id];
                    const isCorrect = selected === q.correctIndex;
                    return (
                      <div key={q.id} className="bg-white rounded-3xl border border-black/5 overflow-hidden shadow-sm">
                        <div className="p-6 space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                                Question {i + 1} • {q.chapter}
                              </span>
                              <h4 className="font-medium text-lg leading-snug">{q.text}</h4>
                            </div>
                            <div className={cn(
                              "shrink-0 p-2 rounded-xl",
                              isCorrect ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                            )}>
                              {isCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                            </div>
                          </div>

                          <div className="grid gap-2">
                            {q.options.map((opt, idx) => {
                              const isCorrectOption = idx === q.correctIndex;
                              const isSelectedOption = idx === selected;
                              return (
                                <div 
                                  key={idx}
                                  className={cn(
                                    "p-3 rounded-xl text-sm border",
                                    isCorrectOption ? "bg-emerald-50 border-emerald-200 text-emerald-900" : 
                                    isSelectedOption ? "bg-red-50 border-red-200 text-red-900" :
                                    "bg-black/5 border-transparent text-muted-foreground"
                                  )}
                                >
                                  {opt}
                                  {isCorrectOption && <span className="ml-2 text-[10px] font-bold uppercase text-emerald-600">(Correct)</span>}
                                  {isSelectedOption && !isCorrectOption && <span className="ml-2 text-[10px] font-bold uppercase text-red-600">(Your Answer)</span>}
                                </div>
                              );
                            })}
                          </div>

                          <div className="bg-[#f9f9f9] p-5 rounded-2xl space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              <Info size={14} /> Tutor Explanation
                            </div>
                            <div className="text-sm leading-relaxed text-[#4a4a4a] prose prose-sm max-w-none">
                              <Markdown>{q.explanation}</Markdown>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-6 py-12 text-center text-xs text-muted-foreground border-t border-black/5">
        <p>© {new Date().getFullYear()} Accounting Master Study Tool</p>
        <p className="mt-1">Based on Financial Accounting for Executives and MBA, 6e</p>
      </footer>
    </div>
  );
}
