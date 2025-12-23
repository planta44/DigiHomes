import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * SAFE Animation System - Never blocks content, purely visual enhancements
 * All content is ALWAYS visible. Animations are additive CSS classes only.
 */

let globalAnimationSettings = {
  enabled: true,
  baseDelay: 150,
  heroTextDelay: 400,
  cardStaggerMultiplier: 1,
  heroStaggerMultiplier: 2,
  sectionStaggerMultiplier: 1.5,
  statsCountDuration: 2000,
  animationStyle: 'pop' // 'pop', 'fade', 'slide'
};

export const setAnimationSettings = (settings) => {
  globalAnimationSettings = { ...globalAnimationSettings, ...settings };
};

export const getAnimationSettings = () => globalAnimationSettings;

// Get animation class based on style setting
const getAnimClassByStyle = (ready, done) => {
  if (!globalAnimationSettings.enabled) return '';
  const style = globalAnimationSettings.animationStyle || 'pop';
  if (done) return `anim-${style}-ready anim-${style}-done`;
  if (ready) return `anim-${style}-ready`;
  return '';
};

/**
 * Hero Animation - Triggers on page load with staggered delay
 * Content always visible, animation is purely visual enhancement
 */
export const useHeroAnimation = (elementDelay = 0) => {
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!globalAnimationSettings.enabled) return;
    
    const element = ref.current;
    if (!element) return;

    // Calculate staggered delay for this element
    const delay = globalAnimationSettings.heroTextDelay + 
                  (elementDelay * globalAnimationSettings.baseDelay * globalAnimationSettings.heroStaggerMultiplier);

    // Set ready state immediately (starts animation preparation)
    setReady(true);

    // Trigger animation after delay
    const timer = setTimeout(() => {
      setDone(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [elementDelay]);

  return [ref, getAnimClassByStyle(ready, done)];
};

/**
 * Scroll Animation Hook - Triggers when element enters viewport
 * Perfect for sections, paragraphs, buttons - anything that should animate on scroll
 */
export const useScrollAnimation = (delay = 0) => {
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const ref = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!globalAnimationSettings.enabled) return;
    
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setReady(true);
          const effectiveDelay = delay * globalAnimationSettings.baseDelay * globalAnimationSettings.sectionStaggerMultiplier;
          timerRef.current = setTimeout(() => setDone(true), effectiveDelay);
        }
      },
      { threshold: 0.15, rootMargin: '0px' }
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [delay]);

  return [ref, getAnimClassByStyle(ready, done)];
};

/**
 * Stagger Animation Hook - For groups of items (cards, list items)
 * Each child with data-anim-item animates one by one when container is visible
 */
export const useStaggerAnimation = () => {
  const [animatedItems, setAnimatedItems] = useState(new Set());
  const ref = useRef(null);
  const timeoutsRef = useRef([]);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!globalAnimationSettings.enabled) return;
    
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const items = element.querySelectorAll('[data-anim-item]');
          
          // Stagger animate each item
          items.forEach((_, index) => {
            const delay = index * globalAnimationSettings.baseDelay * globalAnimationSettings.cardStaggerMultiplier;
            const timeout = setTimeout(() => {
              setAnimatedItems(prev => new Set([...prev, index]));
            }, delay);
            timeoutsRef.current.push(timeout);
          });
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      timeoutsRef.current.forEach(t => clearTimeout(t));
    };
  }, []);

  const getItemClass = useCallback((index) => {
    if (!globalAnimationSettings.enabled) return '';
    const style = globalAnimationSettings.animationStyle || 'pop';
    if (animatedItems.has(index)) return `anim-${style}-ready anim-${style}-done`;
    return `anim-${style}-ready`;
  }, [animatedItems]);

  return [ref, getItemClass];
};

// Alias for backward compatibility
export const useSectionAnimation = useScrollAnimation;
export const useCardAnimation = useScrollAnimation;

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
