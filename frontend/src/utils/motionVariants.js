/**
 * Framer Motion Animation Variants & Physics Defaults
 * Based on the "Technical Precision" Design System
 */

export const springTransition = {
  type: 'spring',
  damping: 25,
  stiffness: 300,
};

export const snappyEase = [0.16, 1, 0.3, 1];

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3, ease: snappyEase }
  },
};

export const slideUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: snappyEase }
  },
};

export const staggerContainer = (staggerChildren = 0.08, delayChildren = 0) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.25, ease: snappyEase }
  },
};
