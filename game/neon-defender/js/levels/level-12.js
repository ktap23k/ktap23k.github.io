export const level12 = {
  id: 12,
  name: 'Dải ngân hà chết',
  subtitle: 'Interceptor săn đuổi không ngừng',
  theme: {
    nebula: ['#10152a', '#05050b'],
    starSpeed: 100,
  },
  spawnInterval: 0.6,
  difficultyMultiplier: 2.75,
  duration: 52,
  waves: [
    { delay: 0, count: 14, type: 'interceptor', pattern: 'vshape', interval: 0.3 },
    { delay: 6, count: 6, type: 'tank', pattern: 'line', interval: 0.7 },
    { delay: 15, count: 18, type: 'interceptor', pattern: 'random', interval: 0.22 },
    { delay: 25, count: 12, type: 'mixed', pattern: 'random', interval: 0.28 },
    { delay: 35, count: 10, type: 'tank', pattern: 'random', interval: 0.6 },
  ],
};
