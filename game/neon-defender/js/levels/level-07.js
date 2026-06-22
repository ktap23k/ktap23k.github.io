export const level07 = {
  id: 7,
  name: 'Bão từ sao chổi',
  subtitle: 'Interceptor lao xuống như mưa',
  theme: {
    nebula: ['#1a0d2e', '#05050b'],
    starSpeed: 75,
  },
  spawnInterval: 0.85,
  difficultyMultiplier: 2.0,
  duration: 45,
  waves: [
    { delay: 0, count: 12, type: 'interceptor', pattern: 'random', interval: 0.35 },
    { delay: 7, count: 6, type: 'tank', pattern: 'line', interval: 0.9 },
    { delay: 16, count: 15, type: 'drone', pattern: 'vshape', interval: 0.3 },
    { delay: 26, count: 10, type: 'interceptor', pattern: 'line', interval: 0.4 },
  ],
};
