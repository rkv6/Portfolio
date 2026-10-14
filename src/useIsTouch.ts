import { useEffect, useState } from 'react';

// True on phones and tablets (no hover, coarse pointer). Used to hide mouse-only hints
// like the cursor label and to show tap / swipe instructions instead.
const QUERY = '(hover: none), (pointer: coarse)';

export const useIsTouch = (): boolean => {
  const [isTouch, setIsTouch] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = () => setIsTouch(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isTouch;
};
