import { useLayoutEffect, useRef, useState } from 'react';

// Space kept between the bottom of a scrollable list and the bottom of the
// viewport — matches the page's bottom padding so lists line up with the
// account / log out block in the sidebar and the page itself never overflows.
const BOTTOM_GAP = 42;
const MIN_HEIGHT = 300;

/**
 * Measures the distance from the top of the referenced element to the top of
 * the viewport and returns the height that lets it run down to the bottom of
 * the page. Returns [ref, height] — height is null until measured.
 */
export default function useListHeight(bottomGap = BOTTOM_GAP) {
  const ref = useRef(null);
  const [height, setHeight] = useState(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      if (!el.getClientRects().length) return; // not rendered at this breakpoint
      const scroller = el.closest('main');
      const top = scroller
        ? el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop
        : el.getBoundingClientRect().top;
      setHeight(Math.max(MIN_HEIGHT, window.innerHeight - top - bottomGap));
    };

    measure();
    // The page animates in, so re-measure once its entrance has settled.
    const settle = setTimeout(measure, 800);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(settle);
      window.removeEventListener('resize', measure);
    };
  }, [bottomGap]);

  return [ref, height];
}