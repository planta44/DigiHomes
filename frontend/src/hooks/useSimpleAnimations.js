import { useRef, useEffect, useState } from 'react';

/**
 * SIMPLE ANIMATION SYSTEM
 * - Clean, minimal implementation
 * - No complex context dependencies
 * - Animations controlled by simple settings
 */

// Simple settings store (will be replaced by API call)
let animationSettings = {
  enabled: true,
  style: 'pop', // pop, fade, slide
  delay: 100
};

export const setAnimationSettings = (settings) => {
  console.log('🔧 Setting animation settings:', settings);
  animationSettings = { ...animationSettings, ...settings };
  console.log('🔧 Animation settings now:', animationSettings);
};

export const getAnimationSettings = () => animationSettings;

// Initialize with defaults immediately
console.log('🎬 Animation hooks initialized with defaults:', animationSettings);

/**
 * HERO TEXT ANIMATION - Pop from below on page load
 * Waits for image load if needed
 */
export const useHeroAnimation = (index = 0, waitForImage = false) => {
  const ref = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(!waitForImage);

  useEffect(() => {
    const element = ref.current;
    if (!element || !imageLoaded || !animationSettings || animationSettings.enabled === false) {
      console.log('🎬 Hero animation blocked:', { element: !!element, imageLoaded, settings: animationSettings });
      return;
    }

    const delay = animationSettings.delay + (index * animationSettings.delay);
    console.log(`🎬 Hero ${index} will animate in ${delay}ms with style: ${animationSettings.style}`);
    
    const timer = setTimeout(() => {
      const className = `animate-${animationSettings.style}`;
      element.classList.add(className);
      console.log(`✅ Hero ${index} animated with class: ${className}`);
    }, delay);

    return () => clearTimeout(timer);
  }, [index, imageLoaded]);

  return waitForImage ? [ref, setImageLoaded] : ref;
};

/**
 * SCROLL ANIMATION - Animate when element enters viewport
 * Re-animates on scroll back
 */
export const useScrollAnimation = (index = 0) => {
  const ref = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || !animationSettings || animationSettings.enabled === false) {
      console.log('🎬 Scroll animation blocked:', { element: !!element, settings: animationSettings });
      return;
    }

    console.log(`🎬 Scroll animation ${index} observer created`);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const delay = index * animationSettings.delay;
          console.log(`🎬 Scroll ${index} entering viewport, animating in ${delay}ms`);
          setTimeout(() => {
            const className = `animate-${animationSettings.style}`;
            element.classList.add(className);
            console.log(`✅ Scroll ${index} animated with class: ${className}`);
            setHasAnimated(true);
          }, delay);
        } else if (hasAnimated) {
          console.log(`🔄 Scroll ${index} leaving viewport, resetting`);
          element.classList.remove(`animate-${animationSettings.style}`);
          setHasAnimated(false);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [index, hasAnimated]);

  return ref;
};

/**
 * CARD STAGGER ANIMATION - Cards appear one by one
 * Re-animates on scroll back
 */
export const useCardStagger = () => {
  const containerRef = useRef(null);
  const [visibleCards, setVisibleCards] = useState([]);
  const timeoutsRef = useRef([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !animationSettings || animationSettings.enabled === false) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const cards = container.querySelectorAll('[data-card-item]');
        
        if (entry.isIntersecting) {
          // Clear existing timeouts
          timeoutsRef.current.forEach(t => clearTimeout(t));
          timeoutsRef.current = [];
          setVisibleCards([]);
          
          // Reveal cards one by one
          cards.forEach((card, index) => {
            const timeout = setTimeout(() => {
              setVisibleCards(prev => [...prev, index]);
            }, index * animationSettings.delay);
            timeoutsRef.current.push(timeout);
          });
        } else {
          // Reset when leaving viewport
          timeoutsRef.current.forEach(t => clearTimeout(t));
          timeoutsRef.current = [];
          setVisibleCards([]);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(container);
    return () => {
      observer.disconnect();
      timeoutsRef.current.forEach(t => clearTimeout(t));
    };
  }, []);

  // Apply animation classes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cards = container.querySelectorAll('[data-card-item]');
    cards.forEach((card, index) => {
      if (visibleCards.includes(index)) {
        card.classList.add(`animate-${animationSettings.style}`);
      } else {
        card.classList.remove(`animate-${animationSettings.style}`);
      }
    });
  }, [visibleCards]);

  return containerRef;
};

/**
 * STATS COUNTER - Count from 0 to target
 * Re-counts every time on scroll into view
 */
export const useStatsCounter = (targetValue, isInView) => {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (!animationSettings || animationSettings.enabled === false || !isInView) {
      setDisplayValue(targetValue);
      startTimeRef.current = null;
      return;
    }

    // Extract number and suffix
    const numericValue = parseInt(String(targetValue).replace(/\D/g, '')) || 0;
    const suffix = String(targetValue).replace(/[0-9]/g, '');

    setDisplayValue('0' + suffix);
    startTimeRef.current = null;

    const animate = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const duration = 2000; // 2 seconds
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(eased * numericValue);
      
      setDisplayValue(currentValue + suffix);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

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
 * STATS IN VIEW DETECTOR
 */
export const useStatsInView = () => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

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
