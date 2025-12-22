import { useEffect, useRef, useState } from 'react';

/**
 * SAFE Animation Hook - Content is ALWAYS visible by default
 * Only animates elements that are NOT already in viewport when page loads
 * Returns [ref, animClass] - attach ref to element, animClass is the CSS class string
 */
export const usePopAnimation = (delay = 0) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);
  const checkedInitial = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || checkedInitial.current) return;
    checkedInitial.current = true;

    // Check if element is already visible - if so, don't animate at all
    const rect = element.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (isVisible) {
      // Already visible - no animation needed, content stays as-is
      setHasAnimated(true);
      return;
    }

    // Element is below viewport - set up animation
    setShouldAnimate(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Small delay before animating in
          setTimeout(() => setHasAnimated(true), delay * 100);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '20px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [delay]);

  // No classes if: not animating OR already animated
  // Only add animation classes if shouldAnimate is true
  const animClass = !shouldAnimate ? '' : 
                    hasAnimated ? 'anim-pop-ready anim-pop-done' : 
                    'anim-pop-ready';
  
  return [ref, animClass];
};

/**
 * SAFE Stagger Animation Hook - All content visible by default
 * Returns [ref, getItemClass(index)] - attach ref to container
 */
export const useStaggerAnimation = (staggerDelay = 100) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [animatedCount, setAnimatedCount] = useState(0);
  const ref = useRef(null);
  const hasTriggered = useRef(false);
  const checkedInitial = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || checkedInitial.current) return;
    checkedInitial.current = true;

    // Check if element is already visible
    const rect = element.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (isVisible) {
      // Already visible - animate all items immediately
      const items = element.querySelectorAll('[data-anim-item]');
      setAnimatedCount(items.length);
      return;
    }

    // Element is below viewport - set up staggered animation
    setShouldAnimate(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered.current) {
          hasTriggered.current = true;
          const items = element.querySelectorAll('[data-anim-item]');
          
          for (let i = 0; i < items.length; i++) {
            setTimeout(() => {
              setAnimatedCount(prev => prev + 1);
            }, i * staggerDelay);
          }
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: '20px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [staggerDelay]);

  // Function to get class for each item by index
  const getItemClass = (index) => {
    if (!shouldAnimate) return ''; // No animation - fully visible
    if (index < animatedCount) return 'anim-item-ready anim-item-done';
    return 'anim-item-ready';
  };

  return [ref, getItemClass];
};

/**
 * SAFE Count-up Hook - Shows final value immediately if JS fails
 */
export const useCountUp = (endValue, duration = 2000, shouldAnimate = true) => {
  const [count, setCount] = useState(null); // null = show endValue
  const animationRef = useRef(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!shouldAnimate || hasStarted.current) return;
    
    hasStarted.current = true;
    setCount(0); // Start counting from 0
    
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

  // If count is null (JS not run yet), show the actual endValue
  if (count === null) return endValue;
  
  const suffix = String(endValue).replace(/[0-9]/g, '');
  return count + suffix;
};
