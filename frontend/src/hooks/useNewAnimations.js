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
 * - Observers NEVER disconnect for replay capability
 */
export const useHeroTextAnimation = (elementIndex = 0) => {
  const ref = useRef(null);
  const { settings, loaded } = useContext(AnimationContext);
  const [hasFirstRun, setHasFirstRun] = useState(false);

  console.log(`🔥 useHeroTextAnimation(${elementIndex}) mounted`);
  console.log(`   - loaded: ${loaded}`);
  console.log(`   - enabled: ${settings?.enabled}`);
  console.log(`   - ref.current:`, ref.current);

  // Initial animation on mount - runs AFTER settings load
  useLayoutEffect(() => {
    const element = ref.current;
    console.log(`🎯 Hero ${elementIndex} useLayoutEffect - element:`, element, 'loaded:', loaded, 'enabled:', settings?.enabled);
    if (!element || !loaded || !settings.enabled) {
      console.log(`❌ Hero ${elementIndex} BLOCKED - element:${!!element}, loaded:${loaded}, enabled:${settings?.enabled}`);
      return;
    }

    const delay = settings.heroTextDelay + (elementIndex * settings.baseDelay * settings.heroStaggerMultiplier);
    console.log(`✅ Hero ${elementIndex} WILL ANIMATE after ${delay}ms with animate-${settings.animationStyle}`);
    
    const timer = setTimeout(() => {
      const className = `animate-${settings.animationStyle}`;
      element.classList.add(className);
      console.log(`✨ Hero ${elementIndex} CLASS ADDED: ${className} to`, element);
      setHasFirstRun(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [loaded, settings.enabled, settings.animationStyle, settings.heroTextDelay, settings.baseDelay, settings.heroStaggerMultiplier, elementIndex]);

  // Re-animate on scroll - NEVER disconnect observer
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

  console.log(`🔥 useScrollTriggerAnimation(${delayMultiplier}) mounted`);

  useEffect(() => {
    const element = ref.current;
    console.log(`🎯 ScrollTrigger ${delayMultiplier} - element:`, element, 'loaded:', loaded, 'enabled:', settings?.enabled);
    if (!element || !loaded || !settings.enabled) {
      console.log(`❌ ScrollTrigger ${delayMultiplier} BLOCKED`);
      return;
    }
    console.log(`✅ ScrollTrigger ${delayMultiplier} OBSERVER CREATED`);

    const observer = new IntersectionObserver(
      ([entry]) => {
        const className = `animate-${settings.animationStyle}`;
        
        if (entry.isIntersecting) {
          const delay = delayMultiplier * settings.baseDelay * settings.sectionStaggerMultiplier;
          console.log(`👀 ScrollTrigger ${delayMultiplier} VISIBLE - will animate after ${delay}ms`);
          setTimeout(() => {
            element.classList.add(className);
            console.log(`✨ ScrollTrigger CLASS ADDED: ${className}`);
          }, delay);
        } else {
          console.log(`👋 ScrollTrigger ${delayMultiplier} LEFT VIEW - removing class`);
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

  console.log(`🔥 useCardStaggerAnimation mounted`);

  useEffect(() => {
    const container = containerRef.current;
    console.log(`🎯 CardStagger - container:`, container, 'loaded:', loaded, 'enabled:', settings?.enabled);
    if (!container || !loaded || !settings.enabled) {
      console.log(`❌ CardStagger BLOCKED`);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const className = `animate-${settings.animationStyle}`;
        const cards = container.querySelectorAll('[data-card-item]');
        console.log(`🎯 CardStagger found ${cards.length} cards with [data-card-item]`);
        
        if (entry.isIntersecting) {
          console.log(`👀 CardStagger VISIBLE - animating ${cards.length} cards`);
          setHasAnimated(true);
          
          cards.forEach((card, index) => {
            const delay = index * settings.baseDelay * settings.cardStaggerMultiplier;
            
            setTimeout(() => {
              // Animate text elements if marked, otherwise whole card
              const textElements = card.querySelectorAll('[data-animate-text]');
              if (textElements.length > 0) {
                console.log(`✨ Card ${index} animating ${textElements.length} text elements`);
                textElements.forEach(el => el.classList.add(className));
              } else {
                console.log(`✨ Card ${index} animating whole card with ${className}`);
                card.classList.add(className);
              }
            }, delay);
          });
        } else if (hasAnimated) {
          console.log(`👋 CardStagger LEFT VIEW - removing animations`);
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
    console.log(`📊 useStatsCounter: ${targetValue}, isInView: ${isInView}, loaded: ${loaded}, enabled: ${settings?.enabled}`);
    
    // Cancel any running animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // If not loaded or disabled, show final value
    if (!loaded || !settings.enabled) {
      console.log(`⏸️ Stats counter DISABLED or not loaded`);
      setDisplayValue(targetValue);
      return;
    }

    // If not in view, reset to final value (ready for next count)
    if (!isInView) {
      console.log(`👁️ Stats NOT in view - showing final value`);
      setDisplayValue(targetValue);
      startTimeRef.current = null;
      return;
    }

    // Extract numeric value and suffix
    const numericValue = parseInt(String(targetValue).replace(/\D/g, '')) || 0;
    const suffix = String(targetValue).replace(/[0-9]/g, '');

    console.log(`🎬 Stats COUNTING from 0 to ${targetValue}`);

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
      console.log(`🚀 Stats animation STARTED`);
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

  console.log(`🔥 useStatsInView mounted`);

  useEffect(() => {
    const element = ref.current;
    console.log(`🎯 StatsInView - element:`, element);
    if (!element) {
      console.log(`❌ StatsInView BLOCKED - no element`);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log(`👁️ Stats section visibility: ${entry.isIntersecting}`);
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );
    
    console.log(`✅ StatsInView OBSERVER CREATED`);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, isInView];
};
