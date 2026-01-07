import { useRef, useEffect, useContext, useState, useCallback } from 'react';
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

// Hook for staggered card animations with section-specific settings
export const useCardStagger = (sectionName = 'properties') => {
  const [container, setContainer] = useState(null);
  const { settings, loaded } = useContext(AnimationContext);
  const animatedCardsRef = useRef(new Set());
  const observerRef = useRef(null);

  // Callback ref to detect when container is attached
  const containerRef = useCallback((node) => {
    if (node) {
      setContainer(node);
    }
  }, []);

  useEffect(() => {
    if (!container || !loaded) return;

    // Get section-specific settings or fall back to global
    const sectionSettings = settings.sections?.[sectionName] || {};
    const isEnabled = sectionSettings.enabled !== undefined ? sectionSettings.enabled : settings.enabled;

    // Detect if mobile
    const isMobile = window.innerWidth < 768;
    const animClass = `animate-${isMobile ? (sectionSettings.styleMobile || sectionSettings.style || 'slideUp') : (sectionSettings.style || 'slideUp')}`;
    const duration = isMobile ? (sectionSettings.durationMobile || sectionSettings.duration || 600) : (sectionSettings.duration || 600);
    const stagger = isMobile ? (sectionSettings.staggerMobile || sectionSettings.stagger || 100) : (sectionSettings.stagger || 150);

    const setupCards = () => {
      const cards = container.querySelectorAll('[data-animate-card]');
      if (cards.length === 0) return;

      // If animations disabled, ensure cards are visible
      if (!isEnabled) {
        cards.forEach(card => {
          card.style.opacity = '1';
          card.style.transform = 'none';
        });
        return;
      }

      // Initially hide cards that haven't been animated
      cards.forEach(card => {
        if (!card.classList.contains(animClass)) {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
        }
      });

      // Clean up old observer if exists
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (isMobile) {
        // Mobile: Observe each card individually (no stagger)
        observerRef.current = new IntersectionObserver(
          (entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const card = entry.target;
                card.style.setProperty('--card-duration', `${duration}ms`);
                
                setTimeout(() => {
                  card.classList.add(animClass);
                  card.style.opacity = '1';
                  card.style.transform = 'translateY(0)';
                }, 50);
              } else {
                const card = entry.target;
                card.classList.remove('animate-slideUp', 'animate-fadeIn', 'animate-slideInLeft');
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
              }
            });
          },
          { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        cards.forEach(card => observerRef.current.observe(card));
      } else {
        // Desktop: Observe each card but animate with stagger when it appears
        observerRef.current = new IntersectionObserver(
          (entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting && !animatedCardsRef.current.has(entry.target)) {
                const card = entry.target;
                const allCards = container.querySelectorAll('[data-animate-card]');
                const index = Array.from(allCards).indexOf(card);
                
                card.style.setProperty('--card-duration', `${duration}ms`);
                animatedCardsRef.current.add(card);
                
                // Stagger delay for desktop
                setTimeout(() => {
                  card.classList.add(animClass);
                  card.style.opacity = '1';
                  card.style.transform = 'translateY(0)';
                }, index * stagger);
              } else if (!entry.isIntersecting) {
                const card = entry.target;
                card.classList.remove('animate-slideUp', 'animate-fadeIn', 'animate-slideInLeft');
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                animatedCardsRef.current.delete(card);
              }
            });
          },
          { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
        );

        cards.forEach(card => observerRef.current.observe(card));
      }
    };

    // Initial setup
    setupCards();

    // Watch for dynamically added cards
    const mutationObserver = new MutationObserver(() => {
      setupCards();
    });

    mutationObserver.observe(container, {
      childList: true,
      subtree: true
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      mutationObserver.disconnect();
      animatedCardsRef.current.clear();
    };
  }, [container, loaded, settings.enabled, settings.sections, sectionName]);

  return containerRef;
};

// Hook for line-by-line animations with section-specific settings
export const useLineByLine = (sectionName = 'about') => {
  const [container, setContainer] = useState(null);
  const { settings, loaded } = useContext(AnimationContext);
  const observerRef = useRef(null);

  // Callback ref to detect when container is attached
  const containerRef = useCallback((node) => {
    if (node) {
      setContainer(node);
    }
  }, []);

  useEffect(() => {
    if (!container || !loaded) return;

    // Get section-specific settings or fall back to global
    const sectionSettings = settings.sections?.[sectionName] || {};
    const isEnabled = sectionSettings.enabled !== undefined ? sectionSettings.enabled : settings.enabled;

    // Detect if mobile
    const isMobile = window.innerWidth < 768;
    const animClass = `animate-${isMobile ? (sectionSettings.styleMobile || sectionSettings.style || 'slideUp') : (sectionSettings.style || 'slideUp')}`;
    const duration = isMobile ? (sectionSettings.durationMobile || sectionSettings.duration || 600) : (sectionSettings.duration || 600);
    const stagger = isMobile ? (sectionSettings.staggerMobile || sectionSettings.stagger || 150) : (sectionSettings.stagger || 150);

    const setupLines = () => {
      const lines = container.querySelectorAll('[data-animate-line]');
      if (lines.length === 0) return;

      // If animations disabled, ensure lines are visible
      if (!isEnabled) {
        lines.forEach(line => {
          line.style.opacity = '1';
          line.style.transform = 'none';
        });
        return;
      }

      // Initially hide lines
      lines.forEach(line => {
        if (!line.classList.contains(animClass)) {
          line.style.opacity = '0';
          line.style.transform = 'translateY(20px)';
        }
      });

      // Clean up old observer if exists
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      // Observe each line individually for scroll-based animation
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const line = entry.target;
              line.style.setProperty('--card-duration', `${duration}ms`);
              
              // Animate immediately when in view
              line.classList.add(animClass);
              line.style.opacity = '1';
              line.style.transform = 'translateY(0)';
            } else {
              const line = entry.target;
              line.classList.remove('animate-slideUp', 'animate-fadeIn', 'animate-slideInLeft');
              line.style.opacity = '0';
              line.style.transform = 'translateY(20px)';
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      );

      // Observe each line individually
      lines.forEach(line => observerRef.current.observe(line));
    };

    // Initial setup
    setupLines();

    // Watch for dynamically added lines
    const mutationObserver = new MutationObserver(() => {
      setupLines();
    });

    mutationObserver.observe(container, {
      childList: true,
      subtree: true
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      mutationObserver.disconnect();
    };
  }, [container, loaded, settings.enabled, settings.sections, sectionName]);

  return containerRef;
};

// Hook for button animations from left and right
export const useButtonSlide = (direction = 'left') => {
  const ref = useRef(null);
  const { settings, loaded } = useContext(AnimationContext);

  useEffect(() => {
    const element = ref.current;
    if (!element || !loaded || !settings.enabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.style.animation = `slideIn${direction === 'left' ? 'Left' : 'Right'} ${settings.heroDuration || 800}ms ease-out forwards`;
        } else {
          element.style.animation = 'none';
          element.style.opacity = '0';
          element.style.transform = direction === 'left' ? 'translateX(-100px)' : 'translateX(100px)';
        }
      },
      { threshold: 0.1 }
    );

    // Initially hide
    element.style.opacity = '0';
    element.style.transform = direction === 'left' ? 'translateX(-100px)' : 'translateX(100px)';

    observer.observe(element);

    return () => observer.disconnect();
  }, [loaded, settings.enabled, settings.heroDuration, direction]);

  return ref;
};
