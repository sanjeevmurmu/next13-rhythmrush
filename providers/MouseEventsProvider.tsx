"use client"
import { createContext, useContext, useState, useRef, useCallback } from 'react';

interface MouseEventsContextType {
  isMouseOver: boolean;
  onMouseEvent: () => void;
}

const MouseEventsContext = createContext<MouseEventsContextType>({
  isMouseOver: false,
  onMouseEvent: () => {},
});

export function MouseEventsProvider({ children }: { children: React.ReactNode }) {
  const [isMouseOver, setIsMouseOver] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEvent = useCallback(() => {
    setIsMouseOver(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsMouseOver(false);
    }, 10000); // 10 seconds
  }, []);

  const value: MouseEventsContextType = { isMouseOver, onMouseEvent: handleMouseEvent };

  return (
    <MouseEventsContext.Provider value={value}>{children}</MouseEventsContext.Provider>
  );
}

export const useMouseEventsContext = () => useContext(MouseEventsContext);