import { useRef, useEffect, useContext, useState } from 'react';
import { AnimationContext } from '../context/AnimationContext';

export const useHeroAnimation = () => {
  const ref = useRef(null);
  const { settings, loaded } = useContext(AnimationContext);

  useEffect(() => {
    const element = ref.current;
    if (!element || !loaded || !settings.enabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add('animate-hero');
        } else {
          element.classList.remove('animate-hero');
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [loaded, settings.enabled]);

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
