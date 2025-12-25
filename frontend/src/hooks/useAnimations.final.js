import { useRef, useLayoutEffect, useEffect, useState, useContext } from 'react';
import AnimationContext from '../context/AnimationContext';

/**
 * ARCHITECTURALLY CORRECT ANIMATION SYSTEM
 * - NO module-level state
 * - AnimationContext is single source of truth
 * - Hooks consume context and wait for settings to load
 * - Animations replay on re-entry (observers never disconnect)
 * - Stats count from 0 every time
 * - Content ALWAYS visible by default
 */

/**
 * HERO TEXT ANIMATION
 * - Animates on mount AFTER settings load
 * - Re-animates when scrolling back to top
 * - Uses useLayoutEffect for immediate trigger
 */
export const useHeroTextAnimation = (elementIndex = 0) => {
  const ref = useRef(null);
  const { settings, loaded } = useContext(AnimationContext);
  const [hasFirstRun, setHasFirstRun] = useState(false);

  // Initial animation on mount - runs AFTER settings load
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || !loaded || !settings.enabled) return;

    const delay = settings.heroTextDelay + (elementIndex * settings.baseDelay * settings.heroStaggerMultiplier);
    
    const timer = setTimeout(() => {
      const className = `animate-${settings.animationStyle}`;
      element.classList.add(className);
      setHasFirstRun(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [loaded, settings.enabled, settings.animationStyle, settings.heroTextDelay, settings.baseDelay, settings.heroStaggerMultiplier, elementIndex]);

  // Re-animate on scroll (DO NOT disconnect observer)
  useEffect(() => {
    const element = ref.current;
    if (!element || !loaded || !settings.enabled || !hasFirstRun) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const className = `animate-${settings.animationStyle}`;
        
        if (entry.isIntersecting) {
          // Re-add animation class with delay
          const delay = settings.heroTextDelay + (elementIndex * settings.baseDelay * settings.heroStaggerMultiplier);
          setTimeout(() => {
            element.classList.add(className);
          }, delay);
        } else {
          // Remove class when out of view so it can replay
          element.classList.remove(className);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [loaded, settings.enabled, settings.animationStyle, settings.heroTextDelay, settings.baseDelay, settings.heroStaggerMultiplier, elementIndex, hasFirstRun]);

  return ref;
};

/**
 * SCROLL TRIGGER ANIMATION
 * - Animates when entering viewport
 * - Re-animates when leaving and re-entering
 * - NEVER disconnects observer
 */
export const useScrollTriggerAnimation = (delayMultiplier = 0) => {
  const ref = useRef(null);
  const { settings, loaded } = useContext(AnimationContext);

  useEffect(() => {
    const element = ref.current;
    if (!element || !loaded || !settings.enabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const className = `animate-${settings.animationStyle}`;
        
        if (entry.isIntersecting) {
          const delay = delayMultiplier * settings.baseDelay * settings.sectionStaggerMultiplier;
          setTimeout(() => {
            element.classList.add(className);
          }, delay);
        } else {
          // Remove class so it can replay
          element.classList.remove(className);
        }
      },
      { threshold: 0.15, rootMargin: '50px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [loaded, settings.enabled, settings.animationStyle, settings.baseDelay, settings.sectionStaggerMultiplier, delayMultiplier]);

  return ref;
};

/**
 * CARD STAGGER ANIMATION
 * - Animates cards one by one when entering viewport
 * - Re-animates on scroll back
 * - NEVER disconnects observer
 */
export const useCardStaggerAnimation = () => {
  const containerRef = useRef(null);
  const { settings, loaded } = useContext(AnimationContext);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !loaded || !settings.enabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const className = `animate-${settings.animationStyle}`;
        const cards = container.querySelectorAll('[data-card-item]');
        
        if (entry.isIntersecting) {
          setHasAnimated(true);
          
          cards.forEach((card, index) => {
            const delay = index * settings.baseDelay * settings.cardStaggerMultiplier;
            
            setTimeout(() => {
              // Animate text elements if marked, otherwise whole card
              const textElements = card.querySelectorAll('[data-animate-text]');
              if (textElements.length > 0) {
                textElements.forEach(el => el.classList.add(className));
              } else {
                card.classList.add(className);
              }
            }, delay);
          });
        } else if (hasAnimated) {
          // Remove animations so they can replay
          cards.forEach(card => {
            card.classList.remove(className);
            const textElements = card.querySelectorAll('[data-animate-text]');
            textElements.forEach(el => el.classList.remove(className));
          });
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [loaded, settings.enabled, settings.animationStyle, settings.baseDelay, settings.cardStaggerMultiplier, hasAnimated]);

  return containerRef;
};

/**
 * STATS IN VIEW OBSERVER
 * - Detects when stats section enters/exits viewport
 * - Returns isInView boolean that triggers counter
 */
export const useStatsInView = () => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Set to true when entering, false when leaving
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, isInView];
};

/**
 * STATS COUNTER
 * - Counts from 0 to target when isInView is true
 * - Resets to 0 when isInView becomes false
 * - Uses requestAnimationFrame for smooth counting
 * - Respects admin-controlled duration
 */
export const useStatsCounter = (targetValue, isInView) => {
  const { settings, loaded } = useContext(AnimationContext);
  const [displayValue, setDisplayValue] = useState(targetValue);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    // Cancel any running animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // If not loaded or disabled, show final value
    if (!loaded || !settings.enabled) {
      setDisplayValue(targetValue);
      return;
    }

    // If not in view, reset to final value (ready for next count)
    if (!isInView) {
      setDisplayValue(targetValue);
      startTimeRef.current = null;
      return;
    }

    // Extract numeric value and suffix
    const numericValue = parseInt(String(targetValue).replace(/\D/g, '')) || 0;
    const suffix = String(targetValue).replace(/[0-9]/g, '');

    // Start from 0
    setDisplayValue('0' + suffix);
    startTimeRef.current = null;

    const animate = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / settings.statsCountDuration, 1);
      
      // Ease out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(eased * numericValue);
      
      setDisplayValue(currentValue + suffix);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    // Small delay before starting for better UX
    const startTimer = setTimeout(() => {
      animationRef.current = requestAnimationFrame(animate);
    }, 200);

    return () => {
      clearTimeout(startTimer);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, isInView, loaded, settings.enabled, settings.statsCountDuration]);

  return displayValue;
};
