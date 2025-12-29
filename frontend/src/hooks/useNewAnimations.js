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
 * - Animates hero text on page load after settings load
 * - Respects delay and stagger from admin settings
 * - Re-animates on scroll back to top
 */
export const useHeroTextAnimation = (elementIndex = 0) => {
  const ref = useRef(null);
  const { settings, loaded } = useContext(AnimationContext);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Animate on mount after settings load
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || !loaded) {
      console.log(`🎬 Hero text ${elementIndex} waiting... loaded:`, loaded);
      return;
    }
    
    if (!settings.enabled) {
      console.log('🎬 Animations disabled globally');
      return;
    }

    const delay = settings.heroTextDelay + (elementIndex * settings.heroTextStagger);
    console.log(`🎬 Hero text ${elementIndex} will animate in ${delay}ms with style: ${settings.heroAnimationStyle}`);
    
    const timer = setTimeout(() => {
      const className = `animate-${settings.heroAnimationStyle}`;
      element.classList.add(className);
      setHasAnimated(true);
      console.log(`✅ Hero text ${elementIndex} animated with class: ${className}`);
    }, delay);

    return () => clearTimeout(timer);
  }, [loaded, settings.enabled, settings.heroAnimationStyle, settings.heroTextDelay, settings.heroTextStagger, elementIndex]);

  // Re-animate on scroll back to top - NEVER disconnect observer
  useEffect(() => {
    const element = ref.current;
    if (!element || !loaded || !settings.enabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.9) {
          if (!hasAnimated) {
            const delay = settings.heroTextDelay + (elementIndex * settings.heroTextStagger);
            setTimeout(() => {
              const className = `animate-${settings.heroAnimationStyle}`;
              element.classList.add(className);
            }, delay);
          }
        } else {
          const className = `animate-${settings.heroAnimationStyle}`;
          element.classList.remove(className);
          setHasAnimated(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [loaded, settings.enabled, settings.heroAnimationStyle, settings.heroTextDelay, settings.heroTextStagger, elementIndex, hasAnimated]);

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
        const className = `animate-${settings.sectionAnimationStyle}`;
        
        if (entry.isIntersecting) {
          const delay = delayMultiplier * settings.sectionBaseDelay + (delayMultiplier * settings.sectionStaggerDelay);
          setTimeout(() => {
            element.classList.add(className);
          }, delay);
        } else {
          element.classList.remove(className);
        }
      },
      { threshold: 0.15, rootMargin: '50px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [loaded, settings.enabled, settings.sectionAnimationStyle, settings.sectionBaseDelay, settings.sectionStaggerDelay, delayMultiplier]);

  return ref;
};

/**
 * CARD STAGGER ANIMATION (Reels-style)
 * - Animates cards one by one when entering viewport
 * - Re-animates on scroll back
 * - Uses visibility tracking like Reels page
 */
export const useCardStaggerAnimation = () => {
  const containerRef = useRef(null);
  const { settings, loaded } = useContext(AnimationContext);
  const [visibleCards, setVisibleCards] = useState([]);
  const timeoutsRef = useRef([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !loaded || !settings.enabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const cards = container.querySelectorAll('[data-card-item]');
        
        if (entry.isIntersecting) {
          // Clear any existing timeouts
          timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
          timeoutsRef.current = [];
          
          // Reset visible cards
          setVisibleCards([]);
          
          // Reveal cards one by one
          cards.forEach((card, index) => {
            const timeout = setTimeout(() => {
              setVisibleCards(prev => [...prev, index]);
            }, settings.cardBaseDelay + (index * settings.cardStaggerDelay));
            timeoutsRef.current.push(timeout);
          });
        } else {
          // Clear timeouts and reset when leaving viewport
          timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
          timeoutsRef.current = [];
          setVisibleCards([]);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(container);
    return () => {
      observer.disconnect();
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, [loaded, settings.enabled, settings.cardBaseDelay, settings.cardStaggerDelay]);

  // Apply animation classes based on visibility
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const className = `animate-${settings.cardAnimationStyle}`;
    const cards = container.querySelectorAll('[data-card-item]');
    
    cards.forEach((card, index) => {
      if (visibleCards.includes(index)) {
        const textElements = card.querySelectorAll('[data-animate-text]');
        if (textElements.length > 0) {
          textElements.forEach(el => el.classList.add(className));
        } else {
          card.classList.add(className);
        }
      } else {
        card.classList.remove(className);
        const textElements = card.querySelectorAll('[data-animate-text]');
        textElements.forEach(el => el.classList.remove(className));
      }
    });
  }, [visibleCards, settings.cardAnimationStyle]);

  return containerRef;
};

/**
 * STATS COUNTER
 * - Counts from 0 to target when isInView is true
 * - Resets to final value when isInView becomes false
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

/**
 * STATS IN VIEW OBSERVER
 * - Detects when stats section enters/exits viewport
 * - Returns isInView boolean that triggers counter
 * - Observer NEVER disconnects
 */
export const useStatsInView = () => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );
    
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, isInView];
};
