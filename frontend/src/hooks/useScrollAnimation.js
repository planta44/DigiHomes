import { useState, useEffect, useRef } from 'react';

export const useScrollAnimation = (delay = 0) => {
  const [isVisible, setIsVisible] = useState(true); // Start visible to prevent hidden content
  const ref = useRef(null);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => setIsVisible(true), delay);
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(currentRef);

      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timer);
  }, [delay]);

  return [ref, isVisible];
};

// Hook for detecting when element is visible - always starts visible
export const useInView = (threshold = 0.1) => {
  const [isInView, setIsInView] = useState(true);
  const ref = useRef(null);
  
  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;
    
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsInView(entry.isIntersecting);
        },
        { threshold: 0.1 }
      );
      
      observer.observe(currentRef);
      
      return () => observer.disconnect();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return [ref, isInView];
};

// Hook for staggered children animations - items always visible
export const useStaggeredAnimation = (itemCount) => {
  const [visibleItems] = useState(() => Array.from({ length: Math.max(itemCount, 20) }, (_, i) => i));
  const ref = useRef(null);
  return [ref, visibleItems];
};

export const useCountUp = (end, duration = 2000, isVisible = true) => {
  const [count, setCount] = useState(0);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!isVisible) {
      // Reset to 0 when not visible
      setCount(0);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }
    
    const numericEnd = parseInt(end.toString().replace(/\D/g, '')) || 0;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * numericEnd);
      
      setCount(currentCount);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [end, duration, isVisible]);

  // Return formatted count with suffix
  const suffix = end.toString().replace(/[0-9]/g, '');
  return count + suffix;
};
