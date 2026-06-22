export const level17 = {
  id: 17,
  name: 'Sân bay vũ trụ',
  subtitle: 'Interceptor cất cánh hàng loạt',
  theme: {
    nebula: ['#102020', '#05050b'],
    starSpeed: 125,
  },
  spawnInterval: 0.45,
  difficultyMultiplier: 3.6,
  duration: 58,
  waves: [
    { delay: 0, count: 24, type: 'interceptor', pattern: 'vshape', interval: 0.15 },
    { delay: 6, count: 10, type: 'tank', pattern: 'random', interval: 0.45 },
    { delay: 15, count: 26, type: 'drone', pattern: 'random', interval: 0.12 },
    { delay: 26, count: 18, type: 'mixed', pattern: 'line', interval: 0.16 },
    { delay: 38, count: 14, type: 'tank', pattern: 'random', interval: 0.35 },
  ],
};
