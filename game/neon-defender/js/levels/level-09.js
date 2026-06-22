export const level09 = {
  id: 9,
  name: 'Đám mây bụi sao',
  subtitle: 'Mọi hướng đều có kẻ địch',
  theme: {
    nebula: ['#1f1a0d', '#05050b'],
    starSpeed: 80,
  },
  spawnInterval: 0.75,
  difficultyMultiplier: 2.3,
  duration: 48,
  waves: [
    { delay: 0, count: 16, type: 'drone', pattern: 'random', interval: 0.25 },
    { delay: 6, count: 8, type: 'interceptor', pattern: 'vshape', interval: 0.45 },
    { delay: 14, count: 6, type: 'tank', pattern: 'line', interval: 0.8 },
    { delay: 24, count: 18, type: 'mixed', pattern: 'random', interval: 0.22 },
  ],
};
