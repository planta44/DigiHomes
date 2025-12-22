import { useState, useEffect, useRef } from 'react';

export const useScrollAnimation = (threshold = 0.1, resetOnExit = false) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else if (resetOnExit) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, resetOnExit]);

  return [ref, isVisible];
};

// Hook for detecting when element is visible - can repeat animation on re-entry
export const useInView = (threshold = 0.3, triggerOnce = false) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (triggerOnce) observer.disconnect();
        } else {
          if (!triggerOnce) setIsInView(false);
        }
      },
      { threshold }
    );
    
    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => observer.disconnect();
  }, [threshold, triggerOnce]);
  
  return [ref, isInView];
};

// Hook for staggered children animations
export const useStaggeredAnimation = (itemCount, baseDelay = 0, staggerDelay = 100) => {
  const [visibleItems, setVisibleItems] = useState([]);
  const ref = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          for (let i = 0; i < itemCount; i++) {
            setTimeout(() => {
              setVisibleItems(prev => [...prev, i]);
            }, baseDelay + (i * staggerDelay));
          }
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => observer.disconnect();
  }, [itemCount, baseDelay, staggerDelay]);
  
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
