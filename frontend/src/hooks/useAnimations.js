import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Animation settings context - will be populated from admin settings
 */
let globalAnimationSettings = {
  baseDelay: 100,
  cardStaggerMultiplier: 1,
  heroStaggerMultiplier: 1.5,
  sectionStaggerMultiplier: 1.2,
  heroTextDelay: 300,
  statsCountDuration: 2000
};

export const setAnimationSettings = (settings) => {
  globalAnimationSettings = { ...globalAnimationSettings, ...settings };
};

export const getAnimationSettings = () => globalAnimationSettings;

/**
 * Hero Pop Animation - Triggers on page load AND when scrolling back
 * Content always visible by default, animation is purely visual
 */
export const useHeroAnimation = (elementDelay = 0) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const ref = useRef(null);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Calculate delay based on element order
    const delay = globalAnimationSettings.heroTextDelay + 
                  (elementDelay * globalAnimationSettings.baseDelay * globalAnimationSettings.heroStaggerMultiplier);

    // Start with animation ready state
    setShouldAnimate(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Animate in with delay
          setTimeout(() => {
            setIsVisible(true);
            initialLoadDone.current = true;
          }, initialLoadDone.current ? delay / 2 : delay);
        } else if (initialLoadDone.current) {
          // Reset when scrolling away - allows re-animation
          setIsVisible(false);
        }
      },
      { threshold: 0.1, rootMargin: '0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [elementDelay]);

  // Apply animation classes
  const animClass = !shouldAnimate ? '' :
                    isVisible ? 'anim-pop-ready anim-pop-done' : 
                    'anim-pop-ready';
  
  return [ref, animClass];
};

/**
 * Card Animation Hook - Each card animates individually when 30-40% visible
 * Re-animates when scrolling back into view
 */
export const useCardAnimation = (cardIndex = 0) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Stagger delay based on card index
          const delay = cardIndex * globalAnimationSettings.baseDelay * globalAnimationSettings.cardStaggerMultiplier;
          setTimeout(() => setIsVisible(true), delay);
        } else {
          // Reset when leaving viewport - allows re-animation
          setIsVisible(false);
        }
      },
      { threshold: 0.35, rootMargin: '0px' } // 30-40% visibility threshold
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [cardIndex]);

  const animClass = isVisible ? 'anim-card-ready anim-card-done' : 'anim-card-ready';
  
  return [ref, animClass];
};

/**
 * Section Animation Hook - For homepage sections, re-animates on scroll
 */
export const useSectionAnimation = (sectionDelay = 0) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const delay = sectionDelay * globalAnimationSettings.baseDelay * globalAnimationSettings.sectionStaggerMultiplier;
          setTimeout(() => {
            setIsVisible(true);
            setHasAnimated(true);
          }, delay);
        } else if (hasAnimated) {
          setIsVisible(false);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [sectionDelay, hasAnimated]);

  const animClass = isVisible ? 'anim-pop-ready anim-pop-done' : 
                    hasAnimated ? 'anim-pop-ready' : '';
  
  return [ref, animClass];
};

/**
 * Stagger Animation Hook for groups - Each item animates when container visible
 * Re-animates when scrolling back into view
 */
export const useStaggerAnimation = (staggerDelay = null) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedItems, setAnimatedItems] = useState(new Set());
  const ref = useRef(null);
  const timeoutsRef = useRef([]);

  const effectiveDelay = staggerDelay ?? globalAnimationSettings.baseDelay;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          const items = element.querySelectorAll('[data-anim-item]');
          
          // Clear any existing timeouts
          timeoutsRef.current.forEach(t => clearTimeout(t));
          timeoutsRef.current = [];
          
          // Stagger animate each item
          items.forEach((_, index) => {
            const timeout = setTimeout(() => {
              setAnimatedItems(prev => new Set([...prev, index]));
            }, index * effectiveDelay * globalAnimationSettings.cardStaggerMultiplier);
            timeoutsRef.current.push(timeout);
          });
        } else {
          // Reset when leaving viewport
          setIsVisible(false);
          setAnimatedItems(new Set());
          timeoutsRef.current.forEach(t => clearTimeout(t));
          timeoutsRef.current = [];
        }
      },
      { threshold: 0.1, rootMargin: '20px' }
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      timeoutsRef.current.forEach(t => clearTimeout(t));
    };
  }, [effectiveDelay]);

  const getItemClass = useCallback((index) => {
    if (!isVisible) return ''; // Not in viewport - no animation classes (visible)
    if (animatedItems.has(index)) return 'anim-card-ready anim-card-done';
    return 'anim-card-ready';
  }, [isVisible, animatedItems]);

  return [ref, getItemClass];
};

/**
 * Stats Count-up Hook - Re-counts when scrolling back into view
 * Uses admin-configurable duration
 */
export const useCountUp = (endValue, isInView = true) => {
  const [count, setCount] = useState(null);
  const animationRef = useRef(null);
  const duration = globalAnimationSettings.statsCountDuration || 2000;

  useEffect(() => {
    // Cancel any running animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (!isInView) {
      // Reset to 0 when out of view to prepare for re-count
      setCount(0);
      return;
    }

    // Start counting from 0
    const numericEnd = parseInt(String(endValue).replace(/\D/g, '')) || 0;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOut * numericEnd);
      setCount(currentCount);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    // Small delay before starting count
    const timer = setTimeout(() => {
      animationRef.current = requestAnimationFrame(animate);
    }, 200);

    return () => {
      clearTimeout(timer);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [endValue, duration, isInView]);

  // Show 0 initially, count up when in view
  const suffix = String(endValue).replace(/[0-9]/g, '');
  return (count === null ? 0 : count) + suffix;
};

/**
 * Stats Section Observer - Detects when stats section is in view
 * Lower threshold for earlier triggering
 */
export const useStatsObserver = () => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.15, rootMargin: '50px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, isInView];
};

// Legacy exports for backward compatibility
export const usePopAnimation = useHeroAnimation;
