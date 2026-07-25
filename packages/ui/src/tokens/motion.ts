export const duration = {
  instant: '50ms',
  fast: '120ms',
  normal: '200ms',
  slow: '300ms',
  slower: '450ms',
  entrance: '350ms',
} as const;

export const easing = {
  default: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
} as const;

export const buttonMotion = {
  stretch: {
    duration: '200ms',
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    scaleActive: '0.97',
    scaleHover: '1.015',
  },
  sheen: {
    duration: '600ms',
    delay: '100ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  magnetic: {
    duration: '300ms',
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    radius: '80',
    strength: '8',
  },
  glow: {
    duration: '2000ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    pulseScale: '1.05',
  },
  lift: {
    duration: '200ms',
    easing: 'cubic-bezier(0, 0, 0.2, 1)',
    translateY: '-1px',
  },
  press: {
    duration: '120ms',
    easing: 'cubic-bezier(0.4, 0, 1, 1)',
    scaleActive: '0.96',
  },
} as const;

export type DurationToken = keyof typeof duration;
export type EasingToken = keyof typeof easing;
export type ButtonInteraction = keyof typeof buttonMotion;
