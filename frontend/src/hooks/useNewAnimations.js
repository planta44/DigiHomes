import { useRef, useLayoutEffect, useEffect, useState } from 'react';

/**
 * BRAND NEW ANIMATION SYSTEM - Built from scratch
 * - Content ALWAYS visible
 * - Hero animations use useLayoutEffect
 * - Stats visibly count from 0
 * - Full admin control
 */

let animSettings = {
  enabled: true,
  animationStyle: 'pop',
  baseDelay: 150,
  heroTextDelay: 400,
  cardStaggerMultiplier: 1,
  heroStaggerMultiplier: 2,
  sectionStaggerMultiplier: 1.5,
  statsCountDuration: 2000
};

export const setAnimationSettings = (settings) => {
  animSettings = { ...animSettings, ...settings };
  console.log('🎬 Animation settings loaded:', animSettings);
};

export const getAnimationSettings = () => animSettings;

/**
 * HERO TEXT ANIMATION - Runs on page mount using useLayoutEffect
 * Re-animates when scrolling back to top
 */
export const useHeroTextAnimation = (elementIndex = 0) => {
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || !animSettings.enabled) return;

    // Calculate delay for this element
    const delay = animSettings.heroTextDelay + (elementIndex * animSettings.baseDelay * animSettings.heroStaggerMultiplier);
    
    console.log(`🎬 Hero element ${elementIndex} will animate after ${delay}ms`);

    // Trigger animation after delay
    const timer = setTimeout(() => {
      const className = `animate-${animSettings.animationStyle}`;
      element.classList.add(className);
      console.log(`✨ Hero element ${elementIndex} animated with class: ${className}`);
      hasAnimated.current = true;
    }, delay);

    return () => clearTimeout(timer);
  }, [elementIndex]);

  // Re-animate on scroll back to top
  useEffect(() => {
    const element = ref.current;
    if (!element || !animSettings.enabled || !hasAnimated.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          // Remove animation class when out of view
          const className = `animate-${animSettings.animationStyle}`;
          element.classList.remove(className);
        } else {
          // Re-add when back in view
          const delay = animSettings.heroTextDelay + (elementIndex * animSettings.baseDelay * animSettings.heroStaggerMultiplier);
          setTimeout(() => {
            const className = `animate-${animSettings.animationStyle}`;
            element.classList.add(className);
          }, delay);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [elementIndex]);

  return ref;
};

/**
 * SCROLL ANIMATION - For sections that animate when scrolled into view
 */
export const useScrollTriggerAnimation = (delay = 0) => {
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || !animSettings.enabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const effectiveDelay = delay * animSettings.baseDelay * animSettings.sectionStaggerMultiplier;
          
          setTimeout(() => {
            const className = `animate-${animSettings.animationStyle}`;
            element.classList.add(className);
            console.log(`✨ Section animated with class: ${className}`);
          }, effectiveDelay);
          
          hasAnimated.current = true;
          observer.disconnect();
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
 * CARD STAGGER ANIMATION - Animates cards one by one
 * Only animates TEXT content, not images
 */
export const useCardStaggerAnimation = () => {
  const containerRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !animSettings.enabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          
          // Find all card items
          const cards = container.querySelectorAll('[data-card-item]');
          console.log(`🎬 Found ${cards.length} cards to animate`);
          
          cards.forEach((card, index) => {
            const delay = index * animSettings.baseDelay * animSettings.cardStaggerMultiplier;
            
            setTimeout(() => {
              const className = `animate-${animSettings.animationStyle}`;
              
              // Only animate text content, NOT images
              const textElements = card.querySelectorAll('[data-animate-text]');
              if (textElements.length > 0) {
                textElements.forEach(el => el.classList.add(className));
              } else {
                // If no specific text elements marked, animate the whole card
                card.classList.add(className);
              }
              
              console.log(`✨ Card ${index} animated`);
            }, delay);
          });
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return containerRef;
};

/**
 * STATS COUNTER - Counts from 0 to final value using requestAnimationFrame
 * CRITICAL: Must visibly count up when in view
 */
export const useStatsCounter = (targetValue, isInView) => {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    // Cancel any running animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (!animSettings.enabled) {
      setDisplayValue(targetValue);
      return;
    }

    if (!isInView) {
      setDisplayValue(targetValue);
      startTimeRef.current = null;
      return;
    }

    // Extract numeric value and suffix
    const numericValue = parseInt(String(targetValue).replace(/\D/g, '')) || 0;
    const suffix = String(targetValue).replace(/[0-9]/g, '');
    
    console.log(`🔢 Starting count to ${numericValue}${suffix} over ${animSettings.statsCountDuration}ms`);

    // Start from 0
    setDisplayValue('0' + suffix);
    startTimeRef.current = null;

    const animate = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / animSettings.statsCountDuration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(eased * numericValue);
      
      setDisplayValue(currentValue + suffix);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        console.log(`✅ Count complete: ${numericValue}${suffix}`);
      }
    };

    // Small delay before starting count for better UX
    const startTimer = setTimeout(() => {
      animationRef.current = requestAnimationFrame(animate);
    }, 200);

    return () => {
      clearTimeout(startTimer);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, isInView]);

  return displayValue;
};

/**
 * STATS SECTION OBSERVER - Detects when stats are in viewport
 */
export const useStatsInView = () => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log(`📊 Stats visibility changed: ${entry.isIntersecting}`);
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.2, rootMargin: '0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, isInView];
};
