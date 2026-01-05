import { useRef, useEffect, useContext, useState } from 'react';
import { AnimationContext } from '../context/AnimationContext';

export const useHeroAnimation = () => {
  const ref = useRef(null);
  const { settings, loaded } = useContext(AnimationContext);

  useEffect(() => {
    const element = ref.current;
    if (!element || !loaded || !settings.enabled) return;

    // Apply animation duration dynamically
    const duration = settings.heroDuration || 800;
    element.style.setProperty('--hero-duration', `${duration}ms`);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Apply the correct animation class based on style setting
          const animClass = `animate-${settings.heroStyle || 'slideUp'}`;
          element.classList.add(animClass);
        } else {
          // Remove all possible animation classes when out of view
          element.classList.remove('animate-slideUp', 'animate-fadeIn', 'animate-slideInLeft');
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [loaded, settings.enabled, settings.heroStyle, settings.heroDuration]);

  return ref;
};

export const useStatsCounter = (targetValue, isInView) => {
  const { settings, loaded } = useContext(AnimationContext);
  const [displayValue, setDisplayValue] = useState('0');
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (!loaded || !settings.enabled || !isInView) {
      setDisplayValue(targetValue);
      startTimeRef.current = null;
      return;
    }

    const numericValue = parseInt(String(targetValue).replace(/\D/g, '')) || 0;
    const suffix = String(targetValue).replace(/[0-9]/g, '');

    setDisplayValue('0' + suffix);
    startTimeRef.current = null;

    const animate = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / settings.statsCountDuration, 1);
      
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(eased * numericValue);
      
      setDisplayValue(currentValue + suffix);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    const startTimer = setTimeout(() => {
      animationRef.current = requestAnimationFrame(animate);
    }, 100);

    return () => {
      clearTimeout(startTimer);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, isInView, loaded, settings.enabled, settings.statsCountDuration]);

  return displayValue;
};

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
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, isInView];
};

// Hook for staggered card animations - observes individual cards
export const useCardStagger = () => {
  const containerRef = useRef(null);
  const { settings, loaded } = useContext(AnimationContext);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !loaded) return;

    const cards = container.querySelectorAll('[data-animate-card]');
    if (cards.length === 0) return;

    // If animations disabled, ensure cards are visible
    if (!settings.enabled) {
      cards.forEach(card => {
        card.style.opacity = '1';
        card.style.transform = 'none';
      });
      return;
    }

    // Detect if mobile
    const isMobile = window.innerWidth < 768;
    const animClass = `animate-${isMobile ? (settings.cardStyleMobile || settings.cardStyle || 'slideUp') : (settings.cardStyle || 'slideUp')}`;
    const duration = isMobile ? (settings.cardDurationMobile || settings.cardDuration || 600) : (settings.cardDuration || 600);
    const stagger = isMobile ? (settings.cardStaggerMobile || settings.cardStagger || 150) : (settings.cardStagger || 150);

    // Initially hide cards
    cards.forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
    });

    // Observe each card individually
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const card = entry.target;
            card.style.setProperty('--card-duration', `${duration}ms`);
            
            // Small delay to ensure smooth animation
            setTimeout(() => {
              card.classList.add(animClass);
            }, 50);
          } else {
            // Reset when out of view
            const card = entry.target;
            card.classList.remove('animate-slideUp', 'animate-fadeIn', 'animate-slideInLeft');
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );

    // Observe each card
    cards.forEach(card => observer.observe(card));
    
    return () => observer.disconnect();
  }, [loaded, settings.enabled, settings.cardStyle, settings.cardStyleMobile, settings.cardDuration, settings.cardDurationMobile, settings.cardStagger, settings.cardStaggerMobile]);

  return containerRef;
};

// Hook for line-by-line animations (About Us section)
export const useLineByLine = () => {
  const containerRef = useRef(null);
  const { settings, loaded } = useContext(AnimationContext);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !loaded) return;

    const lines = container.querySelectorAll('[data-animate-line]');
    if (lines.length === 0) return;

    // If animations disabled, ensure lines are visible
    if (!settings.enabled) {
      lines.forEach(line => {
        line.style.opacity = '1';
        line.style.transform = 'none';
      });
      return;
    }

    // Detect if mobile
    const isMobile = window.innerWidth < 768;
    const animClass = `animate-${isMobile ? (settings.cardStyleMobile || settings.cardStyle || 'slideUp') : (settings.cardStyle || 'slideUp')}`;
    const duration = isMobile ? (settings.cardDurationMobile || settings.cardDuration || 600) : (settings.cardDuration || 600);
    const stagger = isMobile ? (settings.cardStaggerMobile || settings.cardStagger || 150) : (settings.cardStagger || 150);

    // Initially hide lines
    lines.forEach(line => {
      line.style.opacity = '0';
      line.style.transform = 'translateY(20px)';
    });

    // Observe container, but stagger lines individually
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          lines.forEach((line, index) => {
            line.style.setProperty('--card-duration', `${duration}ms`);
            
            setTimeout(() => {
              line.classList.add(animClass);
            }, index * stagger);
          });
        } else {
          lines.forEach(line => {
            line.classList.remove('animate-slideUp', 'animate-fadeIn', 'animate-slideInLeft');
            line.style.opacity = '0';
            line.style.transform = 'translateY(20px)';
          });
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [loaded, settings.enabled, settings.cardStyle, settings.cardStyleMobile, settings.cardDuration, settings.cardDurationMobile, settings.cardStagger, settings.cardStaggerMobile]);

  return containerRef;
};
