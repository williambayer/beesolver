import { useState, useMemo, useCallback } from 'react';
import { WORD_LIST } from '@/data/wordList';

export interface SolverResult {
  word: string;
  length: number;
  isPangram: boolean;
  points: number;
}

export interface GroupedResults {
  [key: number]: SolverResult[];
}

export interface HintState {
  showTotalCount: boolean;
  showLengthCounts: boolean;
  showFirstLetters: boolean;
  showAllWords: boolean;
}

export function useSpellingBeeSolver() {
  const [letters, setLetters] = useState<string[]>(['', '', '', '', '', '', '']);
  const [centerLetter, setCenterLetter] = useState<string>('');
  const [hintState, setHintState] = useState<HintState>({
    showTotalCount: false,
    showLengthCounts: false,
    showFirstLetters: false,
    showAllWords: false,
  });

  const setLetter = useCallback((index: number, letter: string) => {
    const upperLetter = letter.toUpperCase().replace(/[^A-Z]/g, '');
    setLetters(prev => {
      const newLetters = [...prev];
      newLetters[index] = upperLetter;
      return newLetters;
    });
    // Center letter is index 0
    if (index === 0) {
      setCenterLetter(upperLetter);
    }
  }, []);

  const setAllLetters = useCallback((newLetters: string[]) => {
    const cleaned = newLetters.map(l => l.toUpperCase().replace(/[^A-Z]/g, ''));
    setLetters(cleaned);
    setCenterLetter(cleaned[0] || '');
  }, []);

  const resetLetters = useCallback(() => {
    setLetters(['', '', '', '', '', '', '']);
    setCenterLetter('');
    setHintState({
      showTotalCount: false,
      showLengthCounts: false,
      showFirstLetters: false,
      showAllWords: false,
    });
  }, []);

  const results = useMemo((): SolverResult[] => {
    const validLetters = letters.filter(l => l !== '');
    if (validLetters.length !== 7 || !centerLetter) {
      return [];
    }

    const letterSet = new Set(validLetters.map(l => l.toLowerCase()));
    const center = centerLetter.toLowerCase();

    return WORD_LIST.filter(word => {
      // Must be at least 4 letters
      if (word.length < 4) return false;
      
      // Must contain center letter
      if (!word.includes(center)) return false;
      
      // Must only use available letters
      for (const char of word) {
        if (!letterSet.has(char)) return false;
      }
      
      return true;
    }).map(word => {
      const uniqueLetters = new Set(word);
      const isPangram = uniqueLetters.size === 7 && 
        [...letterSet].every(l => uniqueLetters.has(l));
      
      // Scoring: 1 point for 4-letter words, length points for longer, +7 for pangram
      let points = word.length === 4 ? 1 : word.length;
      if (isPangram) points += 7;
      
      return {
        word,
        length: word.length,
        isPangram,
        points,
      };
    }).sort((a, b) => {
      // Sort by length, then alphabetically
      if (a.length !== b.length) return a.length - b.length;
      return a.word.localeCompare(b.word);
    });
  }, [letters, centerLetter]);

  const groupedResults = useMemo((): GroupedResults => {
    const grouped: GroupedResults = {};
    for (const result of results) {
      if (!grouped[result.length]) {
        grouped[result.length] = [];
      }
      grouped[result.length].push(result);
    }
    return grouped;
  }, [results]);

  const totalPoints = useMemo(() => {
    return results.reduce((sum, r) => sum + r.points, 0);
  }, [results]);

  const pangramCount = useMemo(() => {
    return results.filter(r => r.isPangram).length;
  }, [results]);

  const revealNextHint = useCallback(() => {
    setHintState(prev => {
      if (!prev.showTotalCount) return { ...prev, showTotalCount: true };
      if (!prev.showLengthCounts) return { ...prev, showLengthCounts: true };
      if (!prev.showFirstLetters) return { ...prev, showFirstLetters: true };
      return { ...prev, showAllWords: true };
    });
  }, []);

  const revealAll = useCallback(() => {
    setHintState({
      showTotalCount: true,
      showLengthCounts: true,
      showFirstLetters: true,
      showAllWords: true,
    });
  }, []);

  const resetHints = useCallback(() => {
    setHintState({
      showTotalCount: false,
      showLengthCounts: false,
      showFirstLetters: false,
      showAllWords: false,
    });
  }, []);

  const isComplete = letters.every(l => l !== '');

  return {
    letters,
    centerLetter,
    setLetter,
    setAllLetters,
    resetLetters,
    results,
    groupedResults,
    totalPoints,
    pangramCount,
    hintState,
    revealNextHint,
    revealAll,
    resetHints,
    isComplete,
  };
}
