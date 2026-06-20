import { useState } from 'react';
 
export function useCarouselHistory<T>() {
  const [history, setHistory] = useState<T[][]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const [savedHistoryIndex, setSavedHistoryIndex] = useState<number>(0);
 
  const carousels = history[historyPointer] || [];
 
  function push(newHistory: T[]) {
    const nextHistory = history.slice(0, historyPointer + 1);
    setHistory([...nextHistory, newHistory]);
    setHistoryPointer(nextHistory.length);
  }
 
  function undo() {
    if (historyPointer > 0) {
      setHistoryPointer(prev => prev - 1);
    }
  }
 
  function redo() {
    if (historyPointer < history.length - 1) {
      setHistoryPointer(prev => prev + 1);
    }
  }
 
  return { 
    history, 
    historyPointer, 
    savedHistoryIndex, 
    carousels,        // alias genérico: representa o snapshot atual, seja Carousel[] ou Product[]
    setHistory, 
    setHistoryPointer, 
    setSavedHistoryIndex, 
    push,
    undo,
    redo
  };
}
 
