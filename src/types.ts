export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Mixed';
export type Chapter = 
  | 'Chapter 1' | 'Chapter 2' | 'Chapter 3' | 'Chapter 4' 
  | 'Chapter 5' | 'Chapter 6' | 'Chapter 7' | 'Chapter 8' 
  | 'Chapter 9' | 'Chapter 10' | 'Chapter 11' | 'Chapter 12'
  | 'Appendix A' | 'Appendix B' | 'Appendix C' | 'Appendix D' 
  | 'Appendix E' | 'Appendix F';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  chapter: string;
}

export interface QuizResult {
  questionId: string;
  selectedOption: number | null;
  isCorrect: boolean;
}

export type QuizStatus = 'idle' | 'loading' | 'active' | 'review' | 'finished';
