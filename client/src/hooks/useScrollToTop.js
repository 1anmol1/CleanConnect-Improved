import { useEffect } from 'react';

// This hook scrolls to the top of the page on mount
export default function useScrollToTop() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
}
