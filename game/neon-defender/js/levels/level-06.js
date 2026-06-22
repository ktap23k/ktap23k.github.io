export const level06 = {
  id: 6,
  name: 'Mỏ thiên thạch',
  subtitle: 'Tank tràn vào từ hai phía',
  theme: {
    nebula: ['#1f1510', '#05050b'],
    starSpeed: 65,
  },
  spawnInterval: 0.9,
  difficultyMultiplier: 1.9,
  duration: 45,
  waves: [
    { delay: 0, count: 5, type: 'tank', pattern: 'line', interval: 1.0 },
    { delay: 8, count: 8, type: 'interceptor', pattern: 'random', interval: 0.5 },
    { delay: 16, count: 10, type: 'drone', pattern: 'line', interval: 0.4 },
    { delay: 26, count: 8, type: 'mixed', pattern: 'vshape', interval: 0.5 },
  ],
};
