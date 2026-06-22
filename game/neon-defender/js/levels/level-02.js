export const level02 = {
  id: 2,
  name: 'Hành lang asteroid',
  subtitle: 'Interceptor xuất hiện',
  theme: {
    nebula: ['#1a1020', '#05050b'],
    starSpeed: 50,
  },
  spawnInterval: 1.1,
  difficultyMultiplier: 1.25,
  duration: 40,
  waves: [
    { delay: 0.5, count: 5, type: 'drone', pattern: 'random', interval: 0.8 },
    { delay: 6.0, count: 4, type: 'interceptor', pattern: 'random', interval: 0.9 },
    { delay: 12.0, count: 8, type: 'drone', pattern: 'line', interval: 0.5 },
    { delay: 18.0, count: 6, type: 'interceptor', pattern: 'vshape', interval: 0.6 },
    { delay: 26.0, count: 10, type: 'mixed', pattern: 'random', interval: 0.45 },
  ],
};
