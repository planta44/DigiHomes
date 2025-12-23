import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * NEW SIMPLE ANIMATION SYSTEM
 * - Content is ALWAYS visible (no CSS hiding)
 * - Animations triggered by adding CSS class via JS
 * - Respects admin settings from AnimationContext
 */

let globalAnimationSettings = {
  enabled: true,
  baseDelay: 150,
  heroTextDelay: 400,
  cardStaggerMultiplier: 1,
  heroStaggerMultiplier: 2,
  sectionStaggerMultiplier: 1.5,
  statsCountDuration: 2000,
  animationStyle: 'pop'
};

export const setAnimationSettings = (settings) => {
  globalAnimationSettings = { ...globalAnimationSettings, ...settings };
  console.log('[Animations] Settings updated:', globalAnimationSettings);
};

export const getAnimationSettings = () => globalAnimationSettings;

/**
 * Hero Animation - Animates on page load with staggered delays
 * Uses direct DOM manipulation to add animation class
 */
export const useHeroAnimation = (elementDelay = 0) => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !globalAnimationSettings.enabled) return;

    const style = globalAnimationSettings.animationStyle || 'pop';
    const delay = globalAnimationSettings.heroTextDelay + 
                  (elementDelay * globalAnimationSettings.baseDelay * globalAnimationSettings.heroStaggerMultiplier);

    const timer = setTimeout(() => {
      element.classList.add(`do-anim-${style}`);
    }, delay);

    return () => clearTimeout(timer);
  }, [elementDelay]);

  return ref;
};

/**
 * Scroll Animation - Triggers when element scrolls into view
 */
export const useScrollAnimation = (delay = 0) => {
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || !globalAnimationSettings.enabled) return;

    const style = globalAnimationSettings.animationStyle || 'pop';

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const effectiveDelay = delay * globalAnimationSettings.baseDelay * globalAnimationSettings.sectionStaggerMultiplier;
          
          setTimeout(() => {
            element.classList.add(`do-anim-${style}`);
          }, effectiveDelay);
        }
      },
      { threshold: 0.15, rootMargin: '50px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [delay]);

  return ref;
};

/**
 * Stagger Animation - Animates child items one by one
 * Children must have data-anim-item attribute
 */
export const useStaggerAnimation = () => {
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const container = ref.current;
    if (!container || !globalAnimationSettings.enabled) return;

    const style = globalAnimationSettings.animationStyle || 'pop';

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const items = container.querySelectorAll('[data-anim-item]');
          
          items.forEach((item, index) => {
            const delay = index * globalAnimationSettings.baseDelay * globalAnimationSettings.cardStaggerMultiplier;
            setTimeout(() => {
              item.classList.add(`do-anim-${style}`);
            }, delay);
          });
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return ref;
};

// Alias for backward compatibility
export const useSectionAnimation = useScrollAnimation;
export const useCardAnimation = useScrollAnimation;

/**
 * Stats Count-up Hook - Counts up when in view
 * Shows final value by default (if animations disabled or not in view)
 */
export const useCountUp = (endValue, isInView = true) => {
  const numericEnd = parseInt(String(endValue).replace(/\D/g, '')) || 0;
  const suffix = String(endValue).replace(/[0-9]/g, '');
  const [count, setCount] = useState(numericEnd);
  const animationRef = useRef(null);
  const hasCountedRef = useRef(false);
  const duration = globalAnimationSettings.statsCountDuration || 2000;

  useEffect(() => {
    // Cancel any running animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // If animations disabled, just show final value
    if (!globalAnimationSettings.enabled) {
      setCount(numericEnd);
      return;
    }

    if (!isInView) {
      // Show final value when not in view
      if (hasCountedRef.current) {
        setCount(numericEnd);
      }
      return;
    }

    // Start counting from 0 when in view
    hasCountedRef.current = true;
    setCount(0);
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
  }, [endValue, duration, isInView, numericEnd]);

  return count + suffix;
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
