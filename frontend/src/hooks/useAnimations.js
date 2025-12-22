import { useEffect, useRef, useState } from 'react';

/**
 * Hook for triggering CSS animations when element enters viewport
 * Content is ALWAYS rendered - animation is purely visual enhancement
 * Returns [ref, hasAnimated] - attach ref to element, hasAnimated triggers CSS class
 */
export const usePopAnimation = () => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Trigger animation after a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setHasAnimated(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1, rootMargin: '50px' }
      );

      observer.observe(element);
      return () => observer.disconnect();
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return [ref, hasAnimated];
};

/**
 * Hook for staggered animations on multiple items
 * Returns [ref, animatedIndexes] - attach ref to container
 */
export const useStaggerAnimation = (itemCount, staggerDelay = 100) => {
  const [animatedIndexes, setAnimatedIndexes] = useState([]);
  const ref = useRef(null);
  const hasTriggered = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasTriggered.current) return;

    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasTriggered.current) {
            hasTriggered.current = true;
            // Stagger the animation of each item
            for (let i = 0; i < itemCount; i++) {
              setTimeout(() => {
                setAnimatedIndexes(prev => [...prev, i]);
              }, i * staggerDelay);
            }
            observer.disconnect();
          }
        },
        { threshold: 0.05, rootMargin: '50px' }
      );

      observer.observe(element);
      return () => observer.disconnect();
    }, 50);

    return () => clearTimeout(timer);
  }, [itemCount, staggerDelay]);

  return [ref, animatedIndexes];
};

/**
 * Hook for counting up animation
 */
export const useCountUp = (endValue, duration = 2000, shouldAnimate = true) => {
  const [count, setCount] = useState(0);
  const animationRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!shouldAnimate || hasAnimated.current) return;
    
    hasAnimated.current = true;
    const numericEnd = parseInt(String(endValue).replace(/\D/g, '')) || 0;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOut * numericEnd));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [endValue, duration, shouldAnimate]);

  const suffix = String(endValue).replace(/[0-9]/g, '');
  return count + suffix;
};
