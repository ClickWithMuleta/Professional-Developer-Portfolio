import { useState, useEffect } from 'react';

export const useScrollSpy = (sectionIds = [], offset = 140) => {
  const [activeId, setActiveId] = useState(sectionIds[0] || 'home');

  useEffect(() => {
    if (!sectionIds.length) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Special case: At the very top
      if (scrollPosition < 100) {
        setActiveId(sectionIds[0]);
        return;
      }

      // Special case: At the very bottom of the document
      if (scrollPosition + windowHeight >= documentHeight - 50) {
        setActiveId(sectionIds[sectionIds.length - 1]);
        return;
      }

      // Iterate backwards through sections to find the current active section
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const element = document.getElementById(id);
        if (element) {
          const top = element.offsetTop - offset;
          if (scrollPosition >= top) {
            setActiveId(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionIds, offset]);

  return activeId;
};

export default useScrollSpy;
