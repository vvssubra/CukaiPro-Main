import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LandingScrollContext = createContext(null);

const SECTION_IDS = ['features', 'stats', 'highlight', 'cta'];
const SCROLL_OFFSET = 120;

export function LandingScrollProvider({ sectionRefs, children }) {
  const [activeSection, setActiveSection] = useState(null);

  const updateActiveSection = useCallback(() => {
    if (!sectionRefs) return;
    let current = null;
    for (const id of SECTION_IDS) {
      const ref = sectionRefs[id];
      if (!ref?.current) continue;
      const top = ref.current.getBoundingClientRect().top;
      if (top <= SCROLL_OFFSET) current = id;
    }
    setActiveSection((prev) => (current !== prev ? current : prev));
  }, [sectionRefs]);

  useEffect(() => {
    if (!sectionRefs) return;
    queueMicrotask(() => updateActiveSection());
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);
    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, [sectionRefs, updateActiveSection]);

  return (
    <LandingScrollContext.Provider value={activeSection}>
      {children}
    </LandingScrollContext.Provider>
  );
}

export function useLandingScroll() {
  return useContext(LandingScrollContext);
}
