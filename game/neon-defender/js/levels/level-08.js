export const level08 = {
  id: 8,
  name: 'Hố đen cận kề',
  subtitle: 'Không gian bị kéo giãn',
  theme: {
    nebula: ['#120a1f', '#05050b'],
    starSpeed: 85,
  },
  spawnInterval: 0.8,
  difficultyMultiplier: 2.15,
  duration: 48,
  waves: [
    { delay: 0, count: 8, type: 'tank', pattern: 'vshape', interval: 0.8 },
    { delay: 8, count: 10, type: 'interceptor', pattern: 'random', interval: 0.4 },
    { delay: 16, count: 14, type: 'mixed', pattern: 'line', interval: 0.35 },
    { delay: 26, count: 6, type: 'tank', pattern: 'random', interval: 0.9 },
    { delay: 34, count: 12, type: 'interceptor', pattern: 'random', interval: 0.35 },
  ],
};
