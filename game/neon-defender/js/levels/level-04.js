export const level04 = {
  id: 4,
  name: 'Rãnh khí methane',
  subtitle: 'Sương mù xanh đang dày lên',
  theme: {
    nebula: ['#0a1a15', '#05050b'],
    starSpeed: 55,
  },
  spawnInterval: 1.0,
  difficultyMultiplier: 1.6,
  duration: 40,
  waves: [
    { delay: 0, count: 6, type: 'interceptor', pattern: 'random', interval: 0.7 },
    { delay: 6, count: 8, type: 'drone', pattern: 'line', interval: 0.5 },
    { delay: 13, count: 4, type: 'tank', pattern: 'vshape', interval: 1.1 },
    { delay: 22, count: 10, type: 'mixed', pattern: 'random', interval: 0.45 },
  ],
};
