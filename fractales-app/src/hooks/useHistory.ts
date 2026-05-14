import { useState, useCallback, useRef } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface UseHistoryReturn<T> {
  state: T;
  setState: (newState: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
}

export const useHistory = <T>(initialState: T): UseHistoryReturn<T> => {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const isUndoRedoRef = useRef(false);

  const setState = useCallback((newState: T) => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }

    setHistory(prev => ({
      past: [...prev.past, prev.present].slice(-50),
      present: newState,
      future: [],
    }));
  }, []);

  const undo = useCallback(() => {
    if (history.past.length === 0) return;

    isUndoRedoRef.current = true;
    setHistory(prev => {
      const newPast = prev.past.slice(0, -1);
      const newPresent = prev.past[prev.past.length - 1];
      const newFuture = [prev.present, ...prev.future];

      return {
        past: newPast,
        present: newPresent,
        future: newFuture.slice(0, 50),
      };
    });
  }, [history.past]);

  const redo = useCallback(() => {
    if (history.future.length === 0) return;

    isUndoRedoRef.current = true;
    setHistory(prev => {
      const newPast = [...prev.past, prev.present];
      const newPresent = prev.future[0];
      const newFuture = prev.future.slice(1);

      return {
        past: newPast.slice(-50),
        present: newPresent,
        future: newFuture,
      };
    });
  }, [history.future]);

  const clear = useCallback(() => {
    setHistory({
      past: [],
      present: history.present,
      future: [],
    });
  }, [history.present]);

  return {
    state: history.present,
    setState,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    clear,
  };
};