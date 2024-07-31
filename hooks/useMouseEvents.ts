import { useState, useEffect, useRef } from 'react';

interface UseComponentMouseEventsProps {
  onMouseEvent: () => void;
}

function useComponentMouseEvents({ onMouseEvent }: UseComponentMouseEventsProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseOver = () => {
      onMouseEvent();
    };

    if (ref.current) {
      ref.current.addEventListener('mouseover', handleMouseOver);
    }

    return () => {
      if (ref.current) {
        ref.current.removeEventListener('mouseover', handleMouseOver);
      }
    };
  }, [onMouseEvent, ref]);

  return ref;
}

export default useComponentMouseEvents;
