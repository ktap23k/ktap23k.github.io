export const level13 = {
  id: 13,
  name: 'Mặt trời xanh khổng lồ',
  subtitle: 'Nhiệt độ và áp lực tăng cao',
  theme: {
    nebula: ['#0a1a30', '#05050b'],
    starSpeed: 105,
  },
  spawnInterval: 0.6,
  difficultyMultiplier: 2.9,
  duration: 52,
  waves: [
    { delay: 0, count: 10, type: 'tank', pattern: 'line', interval: 0.6 },
    { delay: 8, count: 14, type: 'drone', pattern: 'random', interval: 0.25 },
    { delay: 16, count: 10, type: 'interceptor', pattern: 'line', interval: 0.35 },
    { delay: 26, count: 20, type: 'mixed', pattern: 'vshape', interval: 0.2 },
  ],
};
