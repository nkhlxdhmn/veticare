export const DURATION = {
  fast: 180,
  normal: 220,
  slow: 300,
  stagger: 50,
  pageEnter: 250,
  modal: 200,
  skeleton: 1500,
} as const;

export const EASING = {
  default: [0.25, 0.1, 0.25, 1] as const,
  enter: [0.16, 1, 0.3, 1] as const,
  exit: [0.3, 0, 0.7, 0.3] as const,
};
